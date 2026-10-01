"""
AEGIS GRID - Video Catalogue & Live Analysis Pipeline API
Provides endpoints for demo video manifest, starting/stopping live CV analysis,
querying real-time detection & tracking overlays, and serving video assets.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import json

from app.perception.pipeline import perception_manager
from app.services.websocket import manager as ws_manager
from app.models.event import DataProvenance

router = APIRouter()

DEMO_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "demo"))
MANIFEST_PATH = os.path.join(DEMO_DIR, "manifest.json")

class StartAnalysisRequest(BaseModel):
    camera_id: str
    video_file: Optional[str] = None
    loop_video: bool = True

class StopAnalysisRequest(BaseModel):
    camera_id: str

@router.get("")
def get_video_catalogue():
    """
    Returns the curated demo video library manifest.
    Includes resolution, fps, duration, scenario, provenance, and license info.
    """
    if not os.path.exists(MANIFEST_PATH):
        raise HTTPException(status_code=404, detail="Demo manifest.json not found")
    
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Attach live inference status to each catalog entry
    videos = data.get("videos", [])
    for v in videos:
        cid = v["cameraId"]
        status = perception_manager.get_job_status(cid)
        v["is_analyzing"] = status["is_running"] if status else False
        v["active_fps"] = status["fps"] if status else 0.0
        v["active_latency_ms"] = status["latency_ms"] if status else 0.0
        v["video_url"] = f"/api/videos/file/{v['file']}"

    return {"videos": videos, "total": len(videos)}

@router.api_route("/file/{filename}", methods=["GET", "HEAD"])
def stream_demo_video(filename: str):
    """
    Serves the actual curated H.264 MP4 video file for HTML5 video playback.
    Supports both GET and HEAD requests for browser media probing.
    """
    safe_name = os.path.basename(filename)
    path = os.path.join(DEMO_DIR, safe_name)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail=f"Video file '{safe_name}' not found")
    return FileResponse(path, media_type="video/mp4")

@router.post("/analyze")
async def start_video_analysis(req: StartAnalysisRequest):
    """
    Starts live computer vision analysis on the specified camera and video.
    Frames are decoded, passed to YOLOv8 on CUDA, tracked, and temporal features evaluated.
    """
    cid = req.camera_id
    video_file = req.video_file

    if not video_file:
        # Default mapping from manifest
        default_map = {
            "CAM-01": "cam01_normal_intersection.mp4",
            "CAM-02": "cam02_congestion.mp4",
            "CAM-03": "cam03_ambulance.mp4",
            "CAM-04": "cam04_collision.mp4",
            "CAM-05": "cam05_night_traffic.mp4",
            "CAM-07": "cam07_crowd_growth.mp4",
            "CAM-09": "cam09_normal_source.mp4",
            "CAM-11": "cam11_unattended_baggage.mp4"
        }
        video_file = default_map.get(cid, "cam01_normal_intersection.mp4")

    video_path = os.path.join(DEMO_DIR, video_file)
    if not os.path.exists(video_path):
        raise HTTPException(status_code=404, detail=f"Video file '{video_file}' not found in demo library")

    try:
        job = perception_manager.start_job(cid, video_path, loop_video=req.loop_video)
        
        # Broadcast start event over WebSocket
        await ws_manager.broadcast_event(
            event_type="perception.started",
            source="perception-pipeline",
            scenario_id=cid,
            correlation_id=cid,
            provenance=DataProvenance.INFERENCE,
            payload={
                "camera_id": cid,
                "video_file": video_file,
                "hardware": perception_manager.detector.get_hardware_info()
            }
        )

        return {
            "status": "started",
            "camera_id": cid,
            "video_file": video_file,
            "pipeline": "live_video_inference",
            "device": perception_manager.detector.device_str,
            "hardware": perception_manager.detector.get_hardware_info()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/stop")
async def stop_video_analysis(req: StopAnalysisRequest):
    """Stops active live CV inference on the specified camera."""
    perception_manager.stop_job(req.camera_id)
    return {"status": "stopping", "camera_id": req.camera_id}

@router.get("/status/{camera_id}")
def get_analysis_status(camera_id: str):
    """Returns real-time processing statistics for the camera."""
    status = perception_manager.get_job_status(camera_id)
    if not status:
        return {
            "camera_id": camera_id,
            "is_running": False,
            "message": "No active CV analysis job for this camera"
        }
    return status

@router.get("/tracks/{camera_id}")
def get_active_tracks(camera_id: str):
    """Returns current active bounding boxes and trajectories for visual overlay rendering."""
    tracks = perception_manager.get_active_tracks(camera_id)
    hw = perception_manager.detector.get_hardware_info()
    return {
        "camera_id": camera_id,
        "tracks": tracks,
        "count": len(tracks),
        "hardware": hw,
        "provenance": DataProvenance.INFERENCE.value
    }
