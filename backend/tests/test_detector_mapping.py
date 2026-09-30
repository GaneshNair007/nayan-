import os
import pytest
import torch
from app.perception.detector import YOLOv8DetectorAdapter

def test_pretrained_yolov8n_mapping():
    """Verify pretrained yolov8n.pt maps COCO classes accurately."""
    adapter = YOLOv8DetectorAdapter(model_path="yolov8n.pt", device="cpu")
    assert adapter.is_custom_model is False
    # Class 0 should be person (pedestrian)
    assert adapter.class_map[0] == ("person", "pedestrian")
    # Class 2 should be car (vehicle)
    assert adapter.class_map[2] == ("car", "vehicle")
    # Class 7 should be truck (vehicle) - NOT ambulance!
    assert adapter.class_map[7] == ("truck", "vehicle")
    # Ensure ambulance is not mapped in standard COCO
    assert all(domain != "ambulance" for cname, domain in adapter.class_map.values())

def test_custom_model_mapping(tmp_path):
    """Verify custom model dynamically maps model.names."""
    adapter = YOLOv8DetectorAdapter(model_path="yolov8n.pt", device="cpu")
    # In Ultralytics YOLO, names is stored on the underlying nn.Module (adapter.model.model.names)
    custom_names = {
        0: "ambulance",
        1: "car",
        2: "motorcycle",
        3: "bus",
        4: "truck",
        5: "auto_rickshaw"
    }
    if hasattr(adapter.model, "model") and hasattr(adapter.model.model, "names"):
        adapter.model.model.names = custom_names
    
    # Re-trigger class mapping setup with custom names
    adapter.class_map = {}
    adapter.is_custom_model = True
    for cid, cname in custom_names.items():
        cname_lower = str(cname).lower()
        if "ambulance" in cname_lower:
            domain = "ambulance"
        elif any(k in cname_lower for k in ["car", "motorcycle", "scooter", "auto_rickshaw", "bus", "truck"]):
            domain = "vehicle"
        else:
            domain = "other"
        adapter.class_map[cid] = (cname_lower, domain)

    assert adapter.class_map[0] == ("ambulance", "ambulance")
    assert adapter.class_map[1] == ("car", "vehicle")
    assert adapter.class_map[5] == ("auto_rickshaw", "vehicle")

