"""
Health check endpoint
"""
from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AEGIS GRID API Engine",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@router.get("/ready")
def readiness_check():
    """
    Comprehensive readiness check verifying database, model checkpoint, CUDA,
    video perception subsystem, and WebSocket manager.
    """
    import os
    import torch
    from app.database import db
    from app.config import settings
    from app.perception.pipeline import perception_manager
    from app.services.websocket import manager as ws_manager

    cuda_ok = torch.cuda.is_available()
    model_path = getattr(settings, "NAYAN_DETECTOR_MODEL", "")
    model_ok = os.path.exists(model_path) if model_path else False
    db_ok = len(db.cameras) > 0
    video_ok = perception_manager is not None
    ws_ok = ws_manager is not None

    ai_configured = bool((settings.OPENAI_API_KEY or os.environ.get("OPENAI_API_KEY")) and settings.OPENAI_ENABLED)

    all_ready = db_ok and video_ok and ws_ok

    subsystems_dict = {
        "database": "OK" if db_ok else "DEGRADED",
        "model_loaded": "OK" if model_ok else "FALLBACK",
        "cuda_available": "ACTIVE" if cuda_ok else "CPU_FALLBACK",
        "video_pipeline": "OK" if video_ok else "UNAVAILABLE",
        "websocket_manager": "OK" if ws_ok else "UNAVAILABLE",
        "ai_assistant": "ACTIVE" if ai_configured else "OPTIONAL_DISABLED"
    }

    return {
        "status": "ready" if all_ready else "degraded",
        "ready": all_ready,
        "subsystems": subsystems_dict,
        "checks": subsystems_dict,
        "ai_assistant": {
            "configured": ai_configured,
            "available": ai_configured
        },
        "device": "cuda:0" if cuda_ok else "cpu",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
