"""
Camera and Perception Domain Models with Provenance
"""
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from app.models.event import DataProvenance

class CameraStatus(str, Enum):
    ACTIVE = "ACTIVE"
    DEGRADED = "DEGRADED"
    OFFLINE = "OFFLINE"

class CameraLocation(BaseModel):
    lat: float
    lon: float
    address: str
    junction_id: Optional[str] = None

class BoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float

class Detection(BaseModel):
    id: str
    camera_id: str
    timestamp: str
    anonymous_id: str  # e.g., OBJ-104 (Privacy preserving)
    class_name: str  # vehicle, pedestrian, baggage
    confidence: float
    bbox: BoundingBox
    speed_estimate_kmh: Optional[float] = 0.0
    stationary_duration_s: Optional[float] = 0.0
    provenance: DataProvenance = DataProvenance.INFERENCE

class Track(BaseModel):
    track_id: str
    anonymous_id: str
    class_name: str
    history: List[BoundingBox] = []
    current_speed_kmh: float = 0.0
    stationary_duration_s: float = 0.0
    provenance: DataProvenance = DataProvenance.INFERENCE

class Camera(BaseModel):
    id: str
    name: str
    status: CameraStatus = CameraStatus.ACTIVE
    location: CameraLocation
    feed_url: str
    fps: int = 30
    privacy_mask_active: bool = True
    health_score: float = 1.0  # 0.0 to 1.0
    last_ping: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    current_detections_count: int = 0
    provenance: DataProvenance = DataProvenance.REPLAY_FIXTURE
