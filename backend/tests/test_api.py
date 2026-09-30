"""
Backend API & Integration Tests
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

def test_get_cameras():
    response = client.get("/api/cameras")
    assert response.status_code == 200
    cameras = response.json()
    assert len(cameras) >= 6
    assert any(c["id"] == "CAM-04" for c in cameras)

def test_golden_demo_scenario():
    # Trigger Golden Demo
    res = client.post("/api/demo/scenarios/golden/start")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "started"
    inc = data["incident"]
    assert inc["id"] == "INC-2026-001"
    assert inc["type"] == "COLLISION"
    assert inc["state"] == "CONFIRMED"
    assert len(inc["evidence"]) >= 4

def test_incident_acknowledgement():
    res = client.post("/api/incidents/INC-2026-001/acknowledge")
    assert res.status_code == 200
    inc = res.json()
    assert inc["acknowledged"] is True

def test_emergency_dispatch_and_corridor():
    res = client.post("/api/incidents/INC-2026-001/dispatch", json={"resource_id": "AMB-03"})
    assert res.status_code == 200
    dsp = res.json()
    assert dsp["resource"]["id"] == "AMB-03"
    assert dsp["corridor_plan"]["status"] == "ACTIVE"
    assert len(dsp["corridor_plan"]["junction_sequence"]) == 3

def test_signal_recommendation():
    res = client.post("/api/junctions/JNC-02/signal-recommendation", json={"override_reason": "Emergency preemption test"})
    assert res.status_code == 200
    rec = res.json()
    assert rec["junction_id"] == "JNC-02"
    assert rec["safety_validated"] is True
    assert rec["pressure_reduction_pct"] > 0

def test_digital_twin_metrics():
    res = client.get("/api/demo/digital-twin")
    assert res.status_code == 200
    dt = res.json()
    assert dt["fixed_avg_delay_s"] > dt["adaptive_avg_delay_s"]
    assert dt["delay_reduction_pct"] > 0.0

def test_crowd_scenario():
    res = client.post("/api/demo/scenarios/crowd/start")
    assert res.status_code == 200
    data = res.json()
    assert data["incident"]["type"] == "CROWD_ANOMALY"

def test_baggage_scenario():
    res = client.post("/api/demo/scenarios/baggage/start")
    assert res.status_code == 200
    data = res.json()
    assert data["incident"]["type"] == "UNATTENDED_BAGGAGE"
