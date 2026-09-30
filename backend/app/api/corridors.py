"""
Corridors API endpoints
"""
from fastapi import APIRouter, HTTPException
from app.models.response import CorridorPlan
from app.services.response import ResponseService

router = APIRouter()

@router.get("/{corridor_id}", response_model=CorridorPlan)
def get_corridor(corridor_id: str):
    try:
        return ResponseService.get_corridor_plan(corridor_id)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Corridor {corridor_id} not found")
