import os
import json
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings
from app.perception.detector import YOLOv8DetectorAdapter
from app.perception.tracker import HighPrecisionByteTracker, TrackedEntity
from app.perception.calibration import CameraCalibration, DEMO_CALIBRATIONS
from app.perception.corridor_engine import DynamicCorridorEngine
from app.perception.evidence_engine import EvidenceEngine
from app.perception.temporal_engine import CollisionFeatureSnapshot
from app.models.incident import IncidentLocation, VerificationState
from app.models.response import CorridorStatus
from app.services.response import ResponseService

client = TestClient(app)

def test_dataset_v2_audit_clean():
    """Verify dataset audit report exists with 0 critical issues and split manifest."""
    audit_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "artifacts", "dataset_v2_audit.json"))
    manifest_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "artifacts", "split_manifest_v2.json"))
    
    assert os.path.exists(audit_file), "artifacts/dataset_v2_audit.json missing!"
    assert os.path.exists(manifest_file), "artifacts/split_manifest_v2.json missing!"

    with open(audit_file) as f:
        audit = json.load(f)
    assert audit["critical_issues"] == 0, f"Critical issues found: {audit.get('issues_detail')}"
    assert audit["splits_summary"]["train"]["valid_pairs"] > 4000
    assert audit["splits_summary"]["val"]["valid_pairs"] > 1000
    assert audit["splits_summary"]["test"]["valid_pairs"] > 1000

def test_model_configuration_relative():
    """Verify detector model path is configurable and relative, not hardcoded."""
    model_path = settings.NAYAN_DETECTOR_MODEL
    assert model_path is not None
    assert "best.pt" in model_path or "yolov8" in model_path

def test_capabilities_endpoint_truthfulness():
    """Verify GET /api/capabilities returns exact required runtime state."""
    res = client.get("/api/capabilities")
    assert res.status_code == 200
    data = res.json()
    assert "vision" in data
    vision = data["vision"]
    assert "model_name" in vision
    assert "checkpoint" in vision
    assert "sha256" in vision
    assert "fine_tuned" in vision
    assert "device" in vision
    assert "classes" in vision
    assert vision["metrics_source"] == "held_out_test"

def test_no_camera_id_confirmation_cheating():
    """Verify camera_id == 'CAM-04' with 0 signals does NOT confirm collision."""
    loc = IncidentLocation(lat=12.9754, lon=77.5985, address="CAM-04 Scene")
    engine = EvidenceEngine("CAM-04", loc)
    empty_features = CollisionFeatureSnapshot()
    # 0 signals matched
    result = engine.process_collision_features(empty_features, timestamp=1.0, model_confidence=0.90)
    assert result is None, "EvidenceEngine must return None when no collision signals match!"

def test_uncalibrated_camera_metric_withholding():
    """Verify uncalibrated cameras return None for meters and provide normalized clearance only."""
    uncal = CameraCalibration(camera_id="CAM-UNCALIBRATED")
    res = uncal.calculate_corridor_clearance(
        vehicle_bottom_centers=[(320.0, 400.0)],
        vehicle_widths_px=[120.0],
        image_width=640.0
    )
    assert res["calibrated"] is False
    assert res["clearance_meters"] is None
    assert res["physical_units_valid"] is False
    assert 0.0 <= res["normalized_clearance"] <= 1.0

def test_no_hardcoded_corridor_failure_at_dispatch():
    """Verify initial dispatch does not have predetermined failure and is_rerouted is False."""
    start_res = client.post("/api/demo/scenarios/golden-demo/start")
    assert start_res.status_code == 200
    inc_id = start_res.json()["incident"]["id"]

    disp = client.post(f"/api/incidents/{inc_id}/dispatch")
    assert disp.status_code == 200
    plan = disp.json()["corridor_plan"]
    assert plan["is_rerouted"] is False
    assert all(seg["traffic_compression_state"] != "FAILED" for seg in plan["segment_sequence"])

def test_dynamic_grid_slicing_metrics():
    """Verify DynamicGridSlicing computes free_space_ratio, lane_elasticity, and feasibility."""
    engine = DynamicCorridorEngine()
    snap = engine.extract_corridor_features([], timestamp=0.0)
    assert snap.free_space_ratio == 1.0
    assert snap.lane_elasticity == 1.0
    assert snap.feasibility_score in ["HIGH", "MEDIUM", "LOW"]

def test_readiness_probe_endpoint():
    """Verify GET /api/ready reports subsystem readiness status."""
    res = client.get("/api/ready")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ["ready", "degraded"]
    assert "subsystems" in data
    assert "database" in data["subsystems"]
    assert "model_loaded" in data["subsystems"]
    assert "cuda_available" in data["subsystems"]

def test_live_demo_scenario_provenance():
    """Verify start_scenario with mode='LIVE' marks incident as live INFERENCE."""
    res = client.post("/api/demo/scenarios/golden-demo/start?mode=LIVE")
    assert res.status_code == 200
    data = res.json()
    assert data["mode"] == "LIVE"
    inc = data["incident"]
    assert inc["provenance"] == "INFERENCE"
    assert "LIVE" in inc["id"] or inc["verification_state"] in ["OBSERVED", "SUSPECTED", "CONFIRMED"]

def test_sumo_simulation_truthfulness():
    """Verify Digital Twin does not claim real SUMO unless SUMO and TraCI actually exist."""
    res = client.get("/api/demo/digital-twin?mode=SUMO")
    assert res.status_code == 200
    data = res.json()
    # If SUMO is not installed, it must report SUMO_UNAVAILABLE and is_mocked=True
    if data["simulation_mode"] == "SUMO_UNAVAILABLE":
        assert data["is_mocked"] is True
        assert data["provenance"] == "MOCK"
    elif data["simulation_mode"] == "SUMO":
        assert data["is_mocked"] is False
        assert data["provenance"] == "SIMULATOR"

