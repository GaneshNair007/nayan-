"""
Cameras API endpoints
"""
from fastapi import APIRouter, HTTPException
from typing import List
from app.models.camera import Camera, Detection
from app.services.perception import PerceptionService

router = APIRouter()

@router.get("", response_model=List[Camera])
def get_cameras():
    return PerceptionService.get_all_cameras()

@router.get("/{camera_id}", response_model=Camera)
def get_camera(camera_id: str):
    try:
        return PerceptionService.get_camera(camera_id)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Camera {camera_id} not found")

@router.get("/{camera_id}/detections", response_model=List[Detection])
def get_camera_detections(camera_id: str):
    try:
        return PerceptionService.get_camera_detections(camera_id)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Camera {camera_id} not found")
