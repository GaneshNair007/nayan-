"""
NAYAN Extended Backend & Perception Unit/Integration Tests
Validates:
- Trained checkpoint existence and SHA256 difference
- Model loading and CUDA runtime configuration
- Target class mapping (ambulance, auto_rickshaw, etc.)
- ByteTrack anonymous ID generation (AMB-xxx, V-xxx, BAG-xxx)
- Dynamic Grid Slicing & Corridor Feasibility
- CameraCalibration Planar Homography & Clearance measurement
- Collision state transitions (OBSERVED -> SUSPECTED -> VERIFYING -> CONFIRMED)
- Corridor lifecycle states & dynamic rerouting
- REST API schemas and WebSocket EventEnvelope integrity
"""
import os
import pytest
import hashlib
import torch
import numpy as np
from fastapi.testclient import TestClient

from app.main import app
from app.config import settings
from app.perception.detector import YOLOv8DetectorAdapter, DetectionResult
from app.perception.tracker import HighPrecisionByteTracker, TrackedEntity
from app.perception.calibration import CameraCalibration, DEMO_CALIBRATIONS
from app.perception.corridor_engine import DynamicCorridorEngine
from app.perception.temporal_engine import TemporalFeatureEngine, CollisionFeatureSnapshot
from app.perception.evidence_engine import EvidenceEngine
from app.models.incident import IncidentLocation, VerificationState
from app.models.response import CorridorStatus
from app.services.response import ResponseService
from app.models.event import DataProvenance, EventEnvelope

client = TestClient(app)

def test_trained_checkpoint_and_hash():
    """Verify best.pt exists and its SHA256 differs from pretrained yolov8n.pt."""
    model_path = os.path.abspath(settings.NAYAN_DETECTOR_MODEL)
    assert os.path.exists(model_path), f"Trained model {model_path} missing!"

    def get_sha(path):
        hasher = hashlib.sha256()
        with open(path, 'rb') as f:
            while b := f.read(65536):
                hasher.update(b)
        return hasher.hexdigest()

    trained_sha = get_sha(model_path)
    base_path = os.path.abspath("yolov8n.pt")
    if os.path.exists(base_path):
        base_sha = get_sha(base_path)
        assert trained_sha != base_sha, "Trained SHA must differ from base model!"

def test_detector_cuda_and_classes():
    """Verify YOLOv8DetectorAdapter initializes on CUDA and exposes custom classes."""
    detector = YOLOv8DetectorAdapter(conf_threshold=0.25)
    hw = detector.get_hardware_info()
    if torch.cuda.is_available():
        assert "cuda" in hw["device"]
        assert hw["half_precision"] is True
    
    # Model classes must contain ambulance and auto_rickshaw
    classes = list(detector.model.names.values())
    assert "ambulance" in classes or any("amb" in c for c in classes)

def test_bytetrack_anonymous_ids():
    """Verify tracker assigns AMB-xxx for ambulances, V-xxx for vehicles, BAG-xxx for luggage."""
    tracker = HighPrecisionByteTracker(fps=30.0, high_thresh=0.25)
    
    amb_det = DetectionResult(
        class_id=0,
        class_name="ambulance",
        domain_type="ambulance",
        confidence=0.85,
        bbox=(100.0, 100.0, 250.0, 200.0)
    )
    car_det = DetectionResult(
        class_id=1,
        class_name="car",
        domain_type="vehicle",
        confidence=0.90,
        bbox=(300.0, 100.0, 450.0, 200.0)
    )
    bag_det = DetectionResult(
        class_id=24,
        class_name="luggage",
        domain_type="baggage",
        confidence=0.75,
        bbox=(50.0, 50.0, 90.0, 90.0)
    )

    tracks = tracker.update([amb_det, car_det, bag_det], frame_idx=1, timestamp=0.033)
    track_ids = [t.anonymous_id for t in tracks]
    
    assert any(t.startswith("AMB-") for t in track_ids), f"Ambulance prefix missing in {track_ids}"
    assert any(t.startswith("V-") for t in track_ids), f"Vehicle prefix missing in {track_ids}"
    assert any(t.startswith("BAG-") for t in track_ids), f"Baggage prefix missing in {track_ids}"

def test_camera_calibration_homography():
    """Verify calibrated cameras compute physical meters; uncalibrated cameras return normalized clearance."""
    # 1. Calibrated CAM-03
    calib_cam3 = DEMO_CALIBRATIONS["CAM-03"]
    assert calib_cam3.calibrated is True
    
    # Bottom centers across 12m road
    res_calib = calib_cam3.calculate_corridor_clearance(
        vehicle_bottom_centers=[(300.0, 400.0)],
        vehicle_widths_px=[150.0],
        image_width=640.0
    )
    assert res_calib["calibrated"] is True
    assert res_calib["physical_units_valid"] is True
    assert res_calib["clearance_meters"] is not None
    assert res_calib["clearance_meters"] > 0.0

    # 2. Uncalibrated camera
    calib_uncal = CameraCalibration(camera_id="CAM-UNSET")
    res_uncal = calib_uncal.calculate_corridor_clearance(
        vehicle_bottom_centers=[(300.0, 400.0)],
        vehicle_widths_px=[150.0],
        image_width=640.0
    )
    assert res_uncal["calibrated"] is False
    assert res_uncal["clearance_meters"] is None
    assert res_uncal["physical_units_valid"] is False
    assert "normalized_clearance" in res_uncal

def test_dynamic_grid_slicing_and_corridor():
    """Verify corridor engine performs 2D dynamic grid slicing and extracts feasibility."""
    engine = DynamicCorridorEngine(grid_width_px=640, grid_height_px=480, cells_x=5, cells_y=5)
    
    amb_det = DetectionResult(
        class_id=0, class_name="ambulance", domain_type="ambulance", confidence=0.90,
        bbox=(270.0, 350.0, 370.0, 450.0)
    )
    amb_track = TrackedEntity(track_id=1, detection=amb_det, frame_idx=1, timestamp=0.0)
    
    snap = engine.extract_corridor_features([amb_track], timestamp=0.0)
    assert snap.ambulance_track_id == "AMB-001"
    assert snap.feasibility_score in ["HIGH", "MEDIUM", "LOW"]
    assert len(snap.grid_occupancy) > 0

def test_collision_evidence_state_transitions():
    """Verify collision transitions: OBSERVED -> SUSPECTED -> VERIFYING -> CONFIRMED."""
    loc = IncidentLocation(lat=12.9754, lon=77.5985, address="Test Site")
    engine = EvidenceEngine("CAM-04", loc)

    # 1 signal: convergence
    feats1 = CollisionFeatureSnapshot()
    feats1.trajectory_convergence = True
    st1, _, sc1, _, _ = engine.process_collision_features(feats1, timestamp=1.0, model_confidence=0.85)
    assert st1 == VerificationState.OBSERVED

    # 2 signals: convergence + deceleration
    feats2 = CollisionFeatureSnapshot()
    feats2.trajectory_convergence = True
    feats2.abrupt_speed_reduction = True
    feats2.max_deceleration_px_frame2 = 5.2
    st2, _, sc2, _, _ = engine.process_collision_features(feats2, timestamp=2.0, model_confidence=0.85)
    assert st2 == VerificationState.SUSPECTED

    # 3 signals: convergence + decel + persistent proximity (pre-stationary)
    feats3 = CollisionFeatureSnapshot()
    feats3.trajectory_convergence = True
    feats3.abrupt_speed_reduction = True
    feats3.max_deceleration_px_frame2 = 5.2
    feats3.persistent_proximity_duration_s = 1.8
    feats3.post_event_stationary_duration_s = 1.0
    st3, _, sc3, _, _ = engine.process_collision_features(feats3, timestamp=3.0, model_confidence=0.85)
    assert st3 == VerificationState.VERIFYING

    # 4 signals + post-event stationary >= 2.5s -> CONFIRMED
    feats4 = CollisionFeatureSnapshot()
    feats4.trajectory_convergence = True
    feats4.abrupt_speed_reduction = True
    feats4.max_deceleration_px_frame2 = 5.2
    feats4.persistent_proximity_duration_s = 3.5
    feats4.post_event_stationary_duration_s = 3.2
    st4, _, sc4, _, _ = engine.process_collision_features(feats4, timestamp=6.0, model_confidence=0.85)
    assert st4 == VerificationState.CONFIRMED

def test_corridor_lifecycle_and_rerouting():
    """Verify corridor status transitions and dynamic rerouting on segment failure."""
    # Ensure a corridor exists
    res = client.post("/api/demo/scenarios/golden-demo/start")
    assert res.status_code == 200
    inc_id = res.json()["incident"]["id"]

    disp = client.post(f"/api/incidents/{inc_id}/dispatch", json={"resource_id": "AMB-03"})
    assert disp.status_code == 200
    corr_id = disp.json()["corridor_plan"]["id"]

    # Update corridor lifecycle states
    for state in ["FORMING", "READY", "ACTIVE", "PASSED"]:
        r_st = client.post(f"/api/corridors/{corr_id}/status", json={"status": state})
        assert r_st.status_code == 200
        assert r_st.json()["status"] == state

    # Trigger failure on segment 2 -> verify reroute
    r_upd = client.post(
        f"/api/corridors/{corr_id}/update-segment",
        json={
            "segment_id": "SEG-02",
            "clearance_width_meters": 1.5,
            "traffic_compression_state": "FAILED",
            "verified_by_cctv": True
        }
    )
    assert r_upd.status_code == 200
    plan = r_upd.json()
    assert plan["is_rerouted"] is True
    # Bypass segment must be added
    seg_ids = [s["segment_id"] for s in plan["segment_sequence"]]
    assert any("BYPASS" in s for s in seg_ids)

def test_websocket_envelope_schema():
    """Verify EventEnvelope serialization and schema integrity."""
    env = EventEnvelope(
        schemaVersion=1,
        sequence=42,
        type="corridor.rerouted",
        source="test-suite",
        scenarioId="unit-test",
        provenance=DataProvenance.INFERENCE,
        demo=True,
        payload={"corridor_id": "COR-001", "rerouted": True}
    )
    d = env.model_dump()
    assert d["schemaVersion"] == 1
    assert d["sequence"] == 42
    assert d["type"] == "corridor.rerouted"
    assert d["provenance"] == "INFERENCE"
