"""
Comprehensive Test Suite for NAYAN AI Operator Assistant.
Tests decision-support isolation, fake client injection, error handling, audit logging,
and strict human operator approval separation without invoking live OpenAI by default.
"""
import os
import json
import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from app.main import app
from app.config import settings
from app.database import db
from app.services.ai_assistant import AIAssistantService, AIAssistanceResponse
from app.services.ai_context import (
    build_incident_context,
    build_corridor_context,
    build_camera_context
)
from app.models.incident import Incident, IncidentType, VerificationState, ResponseState, IncidentSeverity, IncidentLocation
from app.models.event import DataProvenance

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_test_db():
    db.__init__()
    # Insert test incident
    inc = Incident(
        id="INC-TEST-001",
        type=IncidentType.COLLISION,
        camera_id="CAM-04",
        location=IncidentLocation(lat=12.9754, lon=77.5985, address="Central Expressway", junction_id="JNC-02"),
        verification_state=VerificationState.CONFIRMED,
        response_state=ResponseState.UNACKNOWLEDGED,
        model_confidence=0.91,
        evidence_score=0.88,
        severity=IncidentSeverity.CRITICAL,
        priority_tier="P1",
        priority_score=91.0,
        priority_reasons=["High severity", "High evidence"],
        title="Test Collision",
        description="Collision on Central Expressway",
        affected_lanes=["Lane 1", "Lane 2"],
        estimated_people_affected=4,
        provenance=DataProvenance.INFERENCE,
        evidence=[]
    )
    db.incidents[inc.id] = inc
    yield
    db.__init__()

def test_ai_status_endpoint_never_exposes_api_key():
    """Verify GET /api/ai/status returns configuration and mode without exposing secrets."""
    res = client.get("/api/ai/status")
    assert res.status_code == 200
    data = res.json()
    assert "provider" in data
    assert data["provider"] == "openai"
    assert data["mode"] == "operator_decision_support"
    assert data["autonomous_actions"] is False
    assert data["store_responses"] is False
    # Ensure api key is never in payload
    assert "api_key" not in data
    assert "OPENAI_API_KEY" not in str(data)

def test_ai_disabled_or_missing_key_fallback():
    """When OpenAI is disabled or key is missing, return clean fallback without crashing."""
    service = AIAssistantService(client=None)
    with patch.object(settings, "OPENAI_ENABLED", False):
        context = build_incident_context("INC-TEST-001")
        import asyncio
        result = asyncio.run(service.generate_assistance("INCIDENT_BRIEF", context))
        assert result["ai_available"] is False
        assert "error" in result
        assert "fallback_context" in result
        assert "Incident INC-TEST-001 active" in result["fallback_context"]["summary"]

def test_ai_context_builder_accuracy():
    """Context builder must extract authoritative backend fields with correct provenance."""
    context = build_incident_context("INC-TEST-001")
    assert context["context_entity"] == "INCIDENT"
    assert context["incident"]["id"] == "INC-TEST-001"
    assert context["incident"]["verification_state"] == "CONFIRMED"
    assert context["incident"]["priority_tier"] == "P1"
    assert context["camera"]["id"] == "CAM-04"
    assert len(context["available_resources"]) > 0
    # Resources must have calculated distance
    assert "approx_distance_km" in context["available_resources"][0]

def test_ai_context_builder_nonexistent_incident():
    """Context builder raises KeyError if entity not found."""
    with pytest.raises(KeyError):
        build_incident_context("INC-NONEXISTENT")

def test_mock_responses_api_success_and_audit_logging():
    """Inject fake OpenAI client returning structured output, verify AIAssistanceResponse and audit."""
    fake_client = MagicMock()
    fake_response = MagicMock()
    fake_response.output_text = json.dumps({
        "summary": "Vehicle trajectory convergence confirmed on CAM-04.",
        "key_evidence": ["Deceleration anomaly", "Persistent stationary cluster"],
        "recommended_actions": ["Dispatch rescue unit", "Pre-clear JNC-02"],
        "uncertainties": ["Structural cabin deformation unconfirmed by monocular feed"],
        "draft_message": "ADVISORY: Incident under active coordination at Central Expressway."
    })
    fake_client.responses.create.return_value = fake_response

    service = AIAssistantService(client=fake_client)
    context = build_incident_context("INC-TEST-001")
    
    import asyncio
    initial_audit_count = len(db.audit_events)
    res = asyncio.run(service.generate_assistance("INCIDENT_BRIEF", context))

    # Verify store=False was passed to Responses API
    fake_client.responses.create.assert_called_once()
    kwargs = fake_client.responses.create.call_args[1]
    assert kwargs["store"] is False
    assert kwargs["instructions"] is not None

    # Verify response schema
    assert res["mode"] == "INCIDENT_BRIEF"
    assert res["entity_id"] == "INC-TEST-001"
    assert res["summary"] == "Vehicle trajectory convergence confirmed on CAM-04."
    assert "Deceleration anomaly" in res["key_evidence"]
    assert res["requires_operator_approval"] is True
    assert res["provenance"] == "AI_ASSISTED"

    # Verify audit event was logged at head of deque
    assert len(db.audit_events) == initial_audit_count + 1
    last_audit = db.audit_events[0]
    assert "AI Assistance Generated: INCIDENT_BRIEF" in last_audit.action
    assert "context_hash" in last_audit.details
    assert "output_hash" in last_audit.details
    assert last_audit.details["requires_approval"] is True

def test_api_timeout_and_error_handling():
    """Ensure service handles network timeouts gracefully without raising exceptions."""
    fake_client = MagicMock()
    fake_client.responses.create.side_effect = TimeoutError("Request timed out after 10s")

    service = AIAssistantService(client=fake_client)
    context = build_incident_context("INC-TEST-001")
    
    import asyncio
    res = asyncio.run(service.generate_assistance("INCIDENT_BRIEF", context))
    assert res["ai_available"] is False
    assert "timed out" in res["error"]

def test_freeform_text_fallback_parsing():
    """If the LLM returns plain text instead of JSON, the service gracefully maps it to summary."""
    fake_client = MagicMock()
    fake_response = MagicMock()
    fake_response.output_text = "Plain text response describing vehicle conflict on roadway."
    fake_client.responses.create.return_value = fake_response

    service = AIAssistantService(client=fake_client)
    context = build_incident_context("INC-TEST-001")
    
    import asyncio
    res = asyncio.run(service.generate_assistance("RESPONSE_RECOMMENDATION", context))
    assert res["summary"] == "Plain text response describing vehicle conflict on roadway."
    assert res["requires_operator_approval"] is True
    assert len(res["recommended_actions"]) > 0

def test_operator_approval_separation_at_api():
    """POST /api/ai/assist must NOT alter incident state or trigger dispatch."""
    initial_state = db.incidents["INC-TEST-001"].response_state
    initial_verif = db.incidents["INC-TEST-001"].verification_state

    # Call /api/ai/assist
    response = client.post("/api/ai/assist", json={
        "mode": "DISPATCH_DRAFT",
        "incident_id": "INC-TEST-001"
    })
    assert response.status_code == 200

    # Ensure backend state is completely unchanged
    assert db.incidents["INC-TEST-001"].response_state == initial_state
    assert db.incidents["INC-TEST-001"].verification_state == initial_verif

def test_model_metrics_endpoint():
    """Verify GET /api/model/metrics reads real artifact metadata."""
    res = client.get("/api/model/metrics")
    assert res.status_code == 200
    data = res.json()
    assert data["available"] is True
    assert data["map50"] >= 0.90
    assert data["ambulance_precision"] >= 0.90
    assert data["epochs_completed"] == 40
    assert "source_artifact" in data

@pytest.mark.skipif(
    os.environ.get("RUN_OPENAI_INTEGRATION_TEST") != "true",
    reason="Live OpenAI integration test skipped by default. Set RUN_OPENAI_INTEGRATION_TEST=true with rotated key to run."
)
def test_live_openai_integration():
    """Optional live test run only with RUN_OPENAI_INTEGRATION_TEST=true and valid key."""
    service = AIAssistantService()
    assert service.is_configured() is True
    context = build_incident_context("INC-TEST-001")
    import asyncio
    res = asyncio.run(service.generate_assistance("INCIDENT_BRIEF", context))
    assert "summary" in res
    assert res["requires_operator_approval"] is True
