"""
NAYAN - Perception Layer: Baggage Detector Adapter
Wraps the external Korzo research checkpoint (artifacts/models/korzo_model.pt).
Classes: {0: 'luggage', 1: 'people'}
Provenance: EXTERNAL_RESEARCH_PRETRAINED (not locally trained on NAYAN).
"""
import os
import time
from typing import List, Dict, Any, Optional
import numpy as np
import torch
from app.models.event import DataProvenance
from app.perception.detector import BaseDetector, DetectionResult

class BaggageDetectorAdapter(BaseDetector):
    """
    Dedicated adapter for unattended baggage / luggage detection.
    Explicitly tracks provenance as external research model to maintain scientific integrity.
    """
    def __init__(
        self,
        model_path: Optional[str] = None,
        conf_threshold: float = 0.35,
        device: Optional[str] = None
    ):
        from ultralytics import YOLO

        if not model_path:
            model_path = os.path.abspath(os.path.join(
                os.path.dirname(__file__), "..", "..", "..", "artifacts", "models", "korzo_model.pt"
            ))

        if device is None:
            device = "cuda:0" if torch.cuda.is_available() else "cpu"

        self.device_str = device
        self.conf_threshold = conf_threshold
        self.model_path = model_path
        self._last_latency_ms = 0.0

        if os.path.exists(model_path):
            self.model = YOLO(model_path)
            if "cuda" in device and torch.cuda.is_available():
                self.model.to(device)
            self.loaded = True
        else:
            self.model = None
            self.loaded = False

    def detect(self, frame: np.ndarray) -> List[DetectionResult]:
        if not self.loaded or self.model is None:
            return []

        t0 = time.perf_counter()
        results = self.model.predict(
            frame,
            conf=self.conf_threshold,
            device=self.device_str,
            verbose=False
        )
        self._last_latency_ms = (time.perf_counter() - t0) * 1000.0

        detections = []
        if not results or len(results) == 0 or results[0].boxes is None:
            return detections

        boxes_xyxy = results[0].boxes.xyxy.cpu().numpy()
        confs = results[0].boxes.conf.cpu().numpy()
        classes = results[0].boxes.cls.int().cpu().numpy()

        for xyxy, conf, cls_id in zip(boxes_xyxy, confs, classes):
            # 0: luggage
            if cls_id == 0:
                det = DetectionResult(
                    class_id=cls_id,
                    class_name="luggage",
                    domain_type="baggage",
                    confidence=float(conf),
                    bbox=(float(xyxy[0]), float(xyxy[1]), float(xyxy[2]), float(xyxy[3])),
                    provenance=DataProvenance.INFERENCE
                )
                detections.append(det)

        return detections

    def get_hardware_info(self) -> Dict[str, Any]:
        return {
            "adapter": "BaggageDetectorAdapter",
            "model_path": self.model_path,
            "provenance": "EXTERNAL_RESEARCH_PRETRAINED (Korzo)",
            "is_nayan_trained": False,
            "loaded": self.loaded,
            "device": self.device_str,
            "last_latency_ms": round(self._last_latency_ms, 2)
        }
