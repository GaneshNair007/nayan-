"""
AEGIS GRID Backend Engine - Main Entry Point
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.config import settings
from app.api import api_router
from app.services.websocket import manager as ws_manager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("aegis.main")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AEGIS GRID Real-time Urban Incident & Mobility Intelligence Platform API"
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routes
app.include_router(api_router, prefix=settings.API_PREFIX)

@app.on_event("startup")
def print_startup_model_banner():
    import os
    import hashlib
    import torch

    model_path = getattr(settings, "NAYAN_DETECTOR_MODEL", "yolov8n.pt")
    if not os.path.exists(model_path):
        model_path = "yolov8n.pt"

    hasher = hashlib.sha256()
    if os.path.exists(model_path):
        with open(model_path, 'rb') as f:
            while chunk := f.read(65536):
                hasher.update(chunk)
        sha256 = hasher.hexdigest()
    else:
        sha256 = "not_found"

    cuda_avail = torch.cuda.is_available()
    device = "cuda:0" if cuda_avail else "cpu"
    fine_tuned = "best.pt" in model_path or "nayan_india" in model_path
    classes = ["ambulance", "car", "motorcycle", "auto_rickshaw", "bus", "truck"] if fine_tuned else ["person", "car", "motorcycle", "bus", "truck"]

    print("=" * 60)
    print("NAYAN ACTIVE MODEL")
    print(f"  CHECKPOINT:    {os.path.basename(model_path)}")
    print(f"  PATH:          {model_path}")
    print(f"  SHA256:        {sha256}")
    print(f"  CLASSES:       {classes}")
    print(f"  DEVICE:        {device}")
    print(f"  CUDA:          {cuda_avail}")
    print(f"  FINE_TUNED:    {fine_tuned}")
    print(f"  MODEL VERSION: 2.0.0")
    print("=" * 60)

# Realtime WebSocket Event Stream Endpoint according to architecture.md
@app.websocket("/ws/events")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection open and listen for ping/heartbeat messages from client
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text('{"type": "pong"}')
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket exception: {e}")
        ws_manager.disconnect(websocket)

@app.get("/")
def root():
    return {
        "title": "AEGIS GRID Operations Engine API",
        "docs_url": "/docs",
        "api_health": "/api/health",
        "ws_events": "/ws/events"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
