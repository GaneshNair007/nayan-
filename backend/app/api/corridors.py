"""
Corridors API endpoints
Provides REST endpoints for querying Green Corridors, updating dynamic segment clearance,
triggering adaptive rerouting, and advancing corridor lifecycle states.
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.models.response import CorridorPlan, CorridorStatus
from app.services.response import ResponseService

router = APIRouter()

class SegmentUpdateRequest(BaseModel):
    segment_id: str
    clearance_width_meters: float
    traffic_compression_state: str  # COMPRESSING, CLEARED, FAILED
    verified_by_cctv: bool = True

class StatusUpdateRequest(BaseModel):
    status: CorridorStatus

@router.get("", response_model=List[CorridorPlan])
def list_corridors():
    return ResponseService.get_all_corridor_plans()

@router.get("/{corridor_id}", response_model=CorridorPlan)
def get_corridor(corridor_id: str):
    try:
        return ResponseService.get_corridor_plan(corridor_id)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Corridor {corridor_id} not found")

@router.post("/{corridor_id}/reroute", response_model=CorridorPlan)
def reroute_corridor(corridor_id: str, failed_segment_id: Optional[str] = None):
    try:
        return ResponseService.reroute_corridor(corridor_id, failed_segment_id=failed_segment_id)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Corridor {corridor_id} not found")

@router.post("/{corridor_id}/update-segment", response_model=CorridorPlan)
def update_segment(corridor_id: str, payload: SegmentUpdateRequest):
    try:
        return ResponseService.update_segment_status(
            corridor_id=corridor_id,
            segment_id=payload.segment_id,
            clearance_width_meters=payload.clearance_width_meters,
            compression_state=payload.traffic_compression_state,
            verified_by_cctv=payload.verified_by_cctv
        )
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/{corridor_id}/status", response_model=CorridorPlan)
def update_corridor_status(corridor_id: str, payload: StatusUpdateRequest):
    try:
        return ResponseService.update_corridor_status(corridor_id, payload.status)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Corridor {corridor_id} not found")
