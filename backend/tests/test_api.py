"""
AEGIS GRID Backend API & Integration Test Suite
Validates Decoupled States, Data Provenance, Safety Invariants, and Deterministic Scenarios
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "AEGIS GRID API Engine"

def test_capabilities_endpoint():
    response = client.get("/api/capabilities")
    assert response.status_code == 200
    data = response.json()
    assert data["tracking"] == "bytetrack"
    assert data["truthfulness_enforced"] is True
    assert data["provenance_tracked"] is True

def test_get_cameras():
    response = client.get("/api/cameras")
    assert response.status_code == 200
    cameras = response.json()
    assert len(cameras) >= 6
    assert any(c["id"] == "CAM-04" for c in cameras)
    assert all("provenance" in c for c in cameras)

def test_golden_demo_scenario_decoupled_states():
    # Trigger Golden Demo
    res = client.post("/api/demo/scenarios/golden/start")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "started"
    inc = data["incident"]

    assert inc["id"] == "INC-2026-001"
    assert inc["type"] == "COLLISION"
    
    # Check Decoupled States
    assert inc["verification_state"] == "CONFIRMED"
    assert inc["response_state"] == "UNACKNOWLEDGED"

    # Check Separated AI Metrics
    assert inc["model_confidence"] > 0.0
    assert inc["evidence_score"] >= 0.80
    assert inc["severity"] == "CRITICAL"
    assert inc["priority_tier"] == "P1"
    assert len(inc["priority_reasons"]) > 0
    assert len(inc["evidence"]) >= 4

    # Check Provenance
    assert inc["provenance"] == "REPLAY_FIXTURE"

def test_incident_response_state_lifecycle():
    # 1. Acknowledge
    res1 = client.post("/api/incidents/INC-2026-001/acknowledge")
    assert res1.status_code == 200
    inc1 = res1.json()
    assert inc1["response_state"] == "ACKNOWLEDGED"
    assert inc1["verification_state"] == "CONFIRMED"

    # 2. Propose Response
    res2 = client.post("/api/incidents/INC-2026-001/propose-response")
    assert res2.status_code == 200
    inc2 = res2.json()
    assert inc2["response_state"] == "RESPONSE_PROPOSED"

    # 3. Authorize Response
    res3 = client.post("/api/incidents/INC-2026-001/authorize-response")
    assert res3.status_code == 200
    inc3 = res3.json()
    assert inc3["response_state"] == "AUTHORIZED"

def test_emergency_dispatch_and_green_corridor():
    res = client.post("/api/incidents/INC-2026-001/dispatch", json={"resource_id": "AMB-03"})
    assert res.status_code == 200
    dsp = res.json()
    
    # Resource verification
    assert dsp["resource"]["id"] == "AMB-03"
    assert dsp["resource"]["status"] == "DISPATCHED"
    
    # Corridor verification
    corridor = dsp["corridor_plan"]
    assert corridor["status"] == "ACTIVE"
    assert len(corridor["junction_sequence"]) == 3
    assert corridor["junction_sequence"][0]["readiness"] == "PREPARING"
    assert corridor["junction_sequence"][1]["readiness"] == "GREEN_ACTIVE"
    assert corridor["provenance"] == "SIMULATOR"

def test_signal_recommendation_and_safety_invariants():
    res = client.post(
        "/api/junctions/JNC-02/signal-recommendation",
        json={"override_reason": "Emergency preemption test"}
    )
    assert res.status_code == 200
    rec = res.json()
    assert rec["junction_id"] == "JNC-02"
    assert rec["safety_validated"] is True

    # Check Invariants
    inv = rec["safety_invariants_met"]
    assert inv["min_green_respected"] is True
    assert inv["max_green_respected"] is True
    assert inv["yellow_clearance_preserved"] is True
    assert inv["all_red_clearance_preserved"] is True
    assert inv["conflicting_green_prevented"] is True

def test_digital_twin_scientific_fair_metrics():
    res = client.get("/api/demo/digital-twin")
    assert res.status_code == 200
    dt = res.json()
    
    # Same seed and demand
    assert dt["seed"] == 48172
    assert dt["emergency_travel_time_fixed_s"] > dt["emergency_travel_time_adaptive_s"]
    assert dt["mean_vehicle_delay_fixed_s"] > dt["mean_vehicle_delay_adaptive_s"]
    assert dt["mean_queue_length_fixed_m"] > dt["mean_queue_length_adaptive_m"]
    assert dt["completed_trips_adaptive"] >= dt["completed_trips_fixed"]
    assert dt["delay_reduction_pct"] > 0.0
    assert "MOCKED DEMONSTRATION" in dt["source_label"]

def test_crowd_scenario():
    res = client.post("/api/demo/scenarios/crowd/start")
    assert res.status_code == 200
    data = res.json()
    inc = data["incident"]
    assert inc["type"] == "CROWD_ANOMALY"
    assert inc["verification_state"] == "CONFIRMED"
    assert inc["response_state"] == "UNACKNOWLEDGED"

def test_baggage_scenario():
    res = client.post("/api/demo/scenarios/baggage/start")
    assert res.status_code == 200
    data = res.json()
    inc = data["incident"]
    assert inc["type"] == "UNATTENDED_BAGGAGE"
    assert inc["verification_state"] == "CONFIRMED"

def test_audit_trail_and_export():
    # Test global audit
    audit_res = client.get("/api/audit")
    assert audit_res.status_code == 200
    audits = audit_res.json()
    assert len(audits) > 0
    assert all("provenance" in a for a in audits)

    # Test incident export
    export_res = client.get("/api/incidents/INC-2026-001/export")
    assert export_res.status_code == 200
    exp = export_res.json()
    assert exp["incident_id"] == "INC-2026-001"
    assert "timeline" in exp
    assert "evidence_capsule" in exp
