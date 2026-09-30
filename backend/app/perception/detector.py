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


class YOLOv8DetectorAdapter(BaseDetector):
    """
    Ultralytics YOLOv8 Detector Adapter.
    Executes real deep-learning inference using PyTorch and CUDA.
    """

    # COCO Class mapping to Urban Mobility Domain (Updated for India Emergency)
    COCO_DOMAIN_MAP = {
        0: ("car", "vehicle"),
        1: ("motorcycle", "vehicle"),
        2: ("scooter", "vehicle"),
        3: ("auto-rickshaw", "vehicle"),
        4: ("bus", "vehicle"),
        5: ("truck", "vehicle"),
        6: ("van", "vehicle"),
        7: ("ambulance", "ambulance"),
        # legacy COCO
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

        # Resolve weights path
        if not model_path:
            # Check fine-tuned model first
            finetuned_model = os.path.abspath(os.path.join(
                os.path.dirname(__file__), "..", "..", "models", "training", "india_emergency", "weights", "best.pt"
            ))
            artifact_model = os.path.abspath(os.path.join(
                os.path.dirname(__file__), "..", "..", "artifacts", "models", "yolov8n.pt"
            ))
            if os.path.exists(finetuned_model):
                model_path = finetuned_model
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
            # Enable half precision (FP16) on CUDA for maximum performance
            self.use_half = True
        else:
            self.use_half = False

        self.model_path = model_path
        self._last_latency_ms = 0.0

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
            # Check if this class is relevant to urban monitoring
            if cls_id in self.COCO_DOMAIN_MAP:
                class_name, domain_type = self.COCO_DOMAIN_MAP[cls_id]
                bbox = (float(xyxy[0]), float(xyxy[1]), float(xyxy[2]), float(xyxy[3]))
                det = DetectionResult(
                    class_id=int(cls_id),
                    class_name=class_name,
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
            "model_path": self.model_path
        }
