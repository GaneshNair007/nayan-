"""
Incidents API endpoints with Auditing and Export Capabilities
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Optional, Dict, Any
from app.models.incident import Incident
from app.models.response import DispatchRequest, DispatchResponse
from app.models.event import AuditEvent
from app.services.incident import IncidentService
from app.services.response import ResponseService
from app.database import db

router = APIRouter()

@router.get("", response_model=List[Incident])
def get_incidents():
    return IncidentService.get_all_incidents()

@router.get("/{incident_id}", response_model=Incident)
def get_incident(incident_id: str):
    try:
        return IncidentService.get_incident(incident_id)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")

@router.post("/{incident_id}/acknowledge", response_model=Incident)
def acknowledge_incident(incident_id: str):
    try:
        return IncidentService.acknowledge_incident(incident_id)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")

@router.post("/{incident_id}/propose-response", response_model=Incident)
def propose_incident_response(incident_id: str):
    try:
        return IncidentService.propose_response(incident_id)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")

@router.post("/{incident_id}/authorize-response", response_model=Incident)
def authorize_incident_response(incident_id: str):
    try:
        return IncidentService.authorize_response(incident_id)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")

@router.post("/{incident_id}/dispatch", response_model=DispatchResponse)
async def dispatch_incident(incident_id: str, body: Optional[DispatchRequest] = None):
    try:
        resource_id = body.resource_id if body else None
        return await ResponseService.create_dispatch(incident_id, resource_id=resource_id)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{incident_id}/audit", response_model=List[AuditEvent])
def get_incident_audit(incident_id: str):
    # Filter audit log for specific incident
    return [ev for ev in db.audit_events if ev.entityId == incident_id or (ev.details and ev.details.get("incident_id") == incident_id)]

@router.get("/{incident_id}/export")
def export_incident_evidence_capsule(incident_id: str) -> Dict[str, Any]:
    try:
        inc = IncidentService.get_incident(incident_id)
        audits = [ev for ev in db.audit_events if ev.entityId == incident_id]
        return {
            "incident_id": inc.id,
            "type": inc.type.value,
            "verification_state": inc.verification_state.value,
            "response_state": inc.response_state.value,
            "model_confidence": inc.model_confidence,
            "evidence_score": inc.evidence_score,
            "severity": inc.severity.value,
            "priority_tier": inc.priority_tier,
            "priority_score": inc.priority_score,
            "priority_reasons": inc.priority_reasons,
            "evidence_capsule": inc.evidence_capsule,
            "evidence_items": inc.evidence,
            "timeline": audits,
            "state_history": inc.state_history,
            "exported_at": inc.updated_at
        }
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")
