"""
Incidents API endpoints
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Optional
from app.models.incident import Incident
from app.models.response import DispatchRequest, DispatchResponse
from app.services.incident import IncidentService
from app.services.response import ResponseService

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

@router.post("/{incident_id}/dispatch", response_model=DispatchResponse)
async def dispatch_incident(incident_id: str, body: Optional[DispatchRequest] = None):
    try:
        resource_id = body.resource_id if body else None
        return await ResponseService.create_dispatch(incident_id, resource_id=resource_id)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
