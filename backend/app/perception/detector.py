"""
AEGIS GRID - Perception Layer: Detector Adapters
Provides an abstract detector interface and Ultralytics YOLOv8 implementation running on CUDA.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import os
import time
import numpy as np
import torch
from app.models.event import DataProvenance

class DetectionResult:
    """Standardized representation of an object detection on a single frame."""
    def __init__(
        self,
        class_id: int,
        class_name: str,
        domain_type: str,
        confidence: float,
        bbox: tuple[float, float, float, float],  # (x1, y1, x2, y2)
        provenance: DataProvenance = DataProvenance.INFERENCE
    ):
        self.class_id = class_id
        self.class_name = class_name
        self.domain_type = domain_type  # "vehicle", "pedestrian", "baggage", etc.
        self.confidence = float(confidence)
        self.bbox = bbox
        self.provenance = provenance

    @property
    def centroid(self) -> tuple[float, float]:
        x1, y1, x2, y2 = self.bbox
        return ((x1 + x2) / 2.0, (y1 + y2) / 2.0)

    @property
    def width(self) -> float:
        return self.bbox[2] - self.bbox[0]

    @property
    def height(self) -> float:
        return self.bbox[3] - self.bbox[1]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "class_id": self.class_id,
            "class_name": self.class_name,
            "domain_type": self.domain_type,
            "confidence": round(self.confidence, 3),
            "bbox": [round(float(v), 1) for v in self.bbox],
            "centroid": [round(float(v), 1) for v in self.centroid],
            "provenance": self.provenance.value
        }


class ModelMetadata:
    """Standardized metadata representing the active vision model checkpoint."""
    def __init__(
        self,
        model_name: str,
        model_path: str,
        sha256: str,
        class_names: List[str],
        fine_tuned: bool,
        base_model: str,
        device: str,
        training_run_id: str = "nayan_india_v2_cuda",
        metrics_source: str = "held_out_test"
    ):
        self.model_name = model_name
        self.model_path = model_path
        self.sha256 = sha256
        self.class_names = class_names
        self.fine_tuned = fine_tuned
        self.base_model = base_model
        self.device = device
        self.training_run_id = training_run_id
        self.metrics_source = metrics_source

    def to_dict(self) -> Dict[str, Any]:
        return {
            "model_name": self.model_name,
            "model_path": self.model_path,
            "sha256": self.sha256,
            "class_names": self.class_names,
            "fine_tuned": self.fine_tuned,
            "base_model": self.base_model,
            "device": self.device,
            "training_run_id": self.training_run_id,
            "metrics_source": self.metrics_source
        }


class BaseDetector(ABC):
    """Abstract Base Class for perceptual object detectors."""

    @abstractmethod
    def detect(self, frame: np.ndarray) -> List[DetectionResult]:
        """Perform real object detection on a BGR image frame."""
        pass

    @abstractmethod
    def get_hardware_info(self) -> Dict[str, Any]:
        """Return real hardware runtime details (device, GPU model, VRAM)."""
        pass

    @abstractmethod
    def get_model_metadata(self) -> ModelMetadata:
        """Return standardized model metadata."""
        pass


class YOLOv8DetectorAdapter(BaseDetector):
    """
    Ultralytics YOLOv8 Detector Adapter.
    Executes real deep-learning inference using PyTorch and CUDA.
    """

    # Standard COCO 80-class mapping for pretrained COCO models
    COCO_STANDARD_MAP = {
        0: ("person", "pedestrian"),
        1: ("bicycle", "vehicle"),
        2: ("car", "vehicle"),
        3: ("motorcycle", "vehicle"),
        5: ("bus", "vehicle"),
        7: ("truck", "vehicle"),
        24: ("backpack", "baggage"),
        26: ("handbag", "baggage"),
        28: ("suitcase", "baggage"),
    }

    def __init__(
        self,
        model_path: Optional[str] = None,
        conf_threshold: float = 0.25,
        device: Optional[str] = None
    ):
        from ultralytics import YOLO
        from app.config import settings
        import hashlib

        # Resolve weights path
        if not model_path:
            config_model = getattr(settings, "NAYAN_DETECTOR_MODEL", None)
            if config_model and os.path.exists(config_model):
                model_path = config_model
            else:
                trained_model = os.path.abspath(os.path.join(
                    os.path.dirname(__file__), "..", "..", "..", "artifacts", "models", "nayan_india_v2", "best.pt"
                ))
                artifact_model = os.path.abspath(os.path.join(
                    os.path.dirname(__file__), "..", "..", "..", "yolov8n.pt"
                ))
                if os.path.exists(trained_model):
                    model_path = trained_model
                elif os.path.exists(artifact_model):
                    model_path = artifact_model
                else:
                    model_path = "yolov8n.pt"

        # Determine target device
        if device is None:
            device = "cuda:0" if torch.cuda.is_available() else "cpu"

        self.device_str = device
        self.conf_threshold = conf_threshold
        
        # Load model and place on target device
        self.model = YOLO(model_path)
        if "cuda" in device and torch.cuda.is_available():
            self.model.to(device)
            self.use_half = True
        else:
            self.use_half = False

        self.model_path = model_path
        self._last_latency_ms = 0.0

        # Build dynamic class ID to (class_name, domain_type) mapping based on model.names
        self.class_map: Dict[int, tuple[str, str]] = {}
        self.is_custom_model = False

        names = self.model.names if hasattr(self.model, "names") and self.model.names else {}
        
        # Check if this is a standard 80-class COCO model (e.g. yolov8n.pt with names[0]=='person')
        if len(names) == 80 and names.get(0) == "person" and names.get(2) == "car":
            self.is_custom_model = False
            for cid, cname in names.items():
                cname_lower = str(cname).lower()
                if cid in self.COCO_STANDARD_MAP:
                    self.class_map[cid] = self.COCO_STANDARD_MAP[cid]
                elif "person" in cname_lower:
                    self.class_map[cid] = (cname_lower, "pedestrian")
                elif any(k in cname_lower for k in ["car", "motorcycle", "bus", "truck", "bicycle"]):
                    self.class_map[cid] = (cname_lower, "vehicle")
                elif any(k in cname_lower for k in ["backpack", "handbag", "suitcase"]):
                    self.class_map[cid] = (cname_lower, "baggage")
        else:
            # Custom trained model (e.g. NAYAN custom fine-tuned model)
            self.is_custom_model = True
            for cid, cname in names.items():
                cname_lower = str(cname).lower().replace(" ", "_").replace("-", "_")
                if "ambulance" in cname_lower:
                    domain = "ambulance"
                elif any(k in cname_lower for k in ["car", "motorcycle", "scooter", "auto_rickshaw", "rickshaw", "bus", "truck", "van", "vehicle", "bike"]):
                    domain = "vehicle"
                elif any(k in cname_lower for k in ["person", "pedestrian"]):
                    domain = "pedestrian"
                elif any(k in cname_lower for k in ["baggage", "luggage", "backpack", "suitcase"]):
                    domain = "baggage"
                else:
                    domain = "other"
                self.class_map[cid] = (cname_lower, domain)

        # Calculate model SHA256
        hasher = hashlib.sha256()
        if os.path.exists(model_path):
            with open(model_path, 'rb') as f:
                while chunk := f.read(65536):
                    hasher.update(chunk)
            self.model_sha256 = hasher.hexdigest()
        else:
            self.model_sha256 = "unknown"

        # Model startup logging
        print("=" * 60)
        print("[NAYAN PERCEPTION] ACTIVE DETECTOR INITIALIZED")
        print(f"  MODEL PATH:        {self.model_path}")
        print(f"  MODEL SHA256:      {self.model_sha256}")
        print(f"  IS CUSTOM MODEL:   {self.is_custom_model}")
        print(f"  MODEL NAMES:       {names}")
        print(f"  RESOLVED MAPPINGS: {self.class_map}")
        print(f"  DEVICE:            {self.device_str} (FP16: {self.use_half})")
        print("=" * 60)

    def detect(self, frame: np.ndarray) -> List[DetectionResult]:
        """Run real forward-pass detection on the frame."""
        t0 = time.perf_counter()
        
        # Predict on GPU/CPU with half-precision if on CUDA
        results = self.model.predict(
            frame,
            conf=self.conf_threshold,
            device=self.device_str,
            half=self.use_half,
            verbose=False
        )

        t1 = time.perf_counter()
        self._last_latency_ms = (t1 - t0) * 1000.0

        detections = []
        if not results or len(results) == 0:
            return detections

        res = results[0]
        if res.boxes is None or len(res.boxes) == 0:
            return detections

        boxes_xyxy = res.boxes.xyxy.cpu().numpy()
        confs = res.boxes.conf.cpu().numpy()
        classes = res.boxes.cls.int().cpu().numpy()

        for xyxy, conf, cls_id in zip(boxes_xyxy, confs, classes):
            cls_int = int(cls_id)
            if cls_int in self.class_map:
                cname, domain_type = self.class_map[cls_int]
            else:
                # Fallback to inspect model.names directly
                raw_name = self.model.names.get(cls_int, f"class_{cls_int}").lower()
                if "ambulance" in raw_name:
                    domain_type = "ambulance"
                elif any(k in raw_name for k in ["car", "motorcycle", "scooter", "auto_rickshaw", "rickshaw", "bus", "truck", "van", "vehicle"]):
                    domain_type = "vehicle"
                elif any(k in raw_name for k in ["person", "pedestrian"]):
                    domain_type = "pedestrian"
                elif any(k in raw_name for k in ["baggage", "backpack", "suitcase", "handbag"]):
                    domain_type = "baggage"
                else:
                    continue
                cname = raw_name

            bbox = (float(xyxy[0]), float(xyxy[1]), float(xyxy[2]), float(xyxy[3]))
            det = DetectionResult(
                class_id=cls_int,
                class_name=cname,
                domain_type=domain_type,
                confidence=float(conf),
                bbox=bbox,
                provenance=DataProvenance.INFERENCE
            )
            detections.append(det)

        return detections

    def get_hardware_info(self) -> Dict[str, Any]:
        cuda_avail = torch.cuda.is_available()
        gpu_name = torch.cuda.get_device_name(0) if cuda_avail else "N/A"
        vram_mb = round(torch.cuda.memory_allocated(0) / (1024 * 1024), 1) if cuda_avail else 0.0

        return {
            "cuda_available": cuda_avail,
            "device": self.device_str,
            "gpu_name": gpu_name,
            "vram_allocated_mb": vram_mb,
            "half_precision": self.use_half,
            "last_inference_latency_ms": round(self._last_latency_ms, 2),
            "model_path": self.model_path,
            "is_custom_model": self.is_custom_model,
            "model_sha256": self.model_sha256,
            "class_map": {str(k): list(v) for k, v in self.class_map.items()}
        }

    def get_model_metadata(self) -> ModelMetadata:
        model_name = "NAYAN India Detector V2" if self.is_custom_model else "YOLOv8 Pretrained Baseline"
        base_model = "yolov8n.pt"
        class_names = [v[0] for v in self.class_map.values()]
        return ModelMetadata(
            model_name=model_name,
            model_path=self.model_path,
            sha256=self.model_sha256,
            class_names=class_names,
            fine_tuned=self.is_custom_model,
            base_model=base_model,
            device=self.device_str,
            training_run_id="nayan_india_v2_cuda_40ep",
            metrics_source="held_out_test"
        )

