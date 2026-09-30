"""
Junctions and Signal Control API endpoints
"""
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.models.mobility import Junction, SignalRecommendationRequest, SignalRecommendationResponse
from app.services.mobility import MobilityService

router = APIRouter()

@router.get("", response_model=List[Junction])
def get_junctions():
    return MobilityService.get_all_junctions()

@router.get("/{junction_id}", response_model=Junction)
def get_junction(junction_id: str):
    try:
        return MobilityService.get_junction(junction_id)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Junction {junction_id} not found")

@router.post("/{junction_id}/signal-recommendation", response_model=SignalRecommendationResponse)
def get_signal_recommendation(junction_id: str, body: Optional[SignalRecommendationRequest] = None):
    try:
        reason = body.override_reason if body and body.override_reason else "Adaptive signal recommendation"
        return MobilityService.generate_signal_recommendation(junction_id, reason=reason)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Junction {junction_id} not found")
