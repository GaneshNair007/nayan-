"""
Incident and Evidence Domain Models
"""
from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone

class IncidentState(str, Enum):
    NORMAL = "NORMAL"
    OBSERVED = "OBSERVED"
    SUSPECTED = "SUSPECTED"
    VERIFYING = "VERIFYING"
    CONFIRMED = "CONFIRMED"
    DISPATCHED = "DISPATCHED"
    CONTAINED = "CONTAINED"
    FALSE_ALARM = "FALSE_ALARM"

class IncidentType(str, Enum):
    COLLISION = "COLLISION"
    CROWD_ANOMALY = "CROWD_ANOMALY"
    UNATTENDED_BAGGAGE = "UNATTENDED_BAGGAGE"

class IncidentSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class EvidenceItem(BaseModel):
    id: str
    type: str  # deceleration_anomaly, stationary_duration, lane_obstruction, density_spike, cross_camera_check
    source: str  # CAM-04, perception-engine, temporal-verifier
    timestamp: str
    confidence_score: float  # 0.0 to 1.0
    details: Dict[str, Any] = {}

class StateTransition(BaseModel):
    from_state: IncidentState
    to_state: IncidentState
    timestamp: str
    reason: str

class EvidenceCapsule(BaseModel):
    before_clip_url: Optional[str] = "/assets/clips/demo-before.mp4"
    event_clip_url: Optional[str] = "/assets/clips/demo-event.mp4"
    after_clip_url: Optional[str] = "/assets/clips/demo-after.mp4"
    key_frame_timestamp: str = ""
    summary_text: str = ""

class IncidentLocation(BaseModel):
    lat: float
    lon: float
    address: str
    junction_id: Optional[str] = None

class Incident(BaseModel):
    id: str
    type: IncidentType
    camera_id: str
    location: IncidentLocation
    state: IncidentState = IncidentState.OBSERVED
    severity: IncidentSeverity = IncidentSeverity.MEDIUM
    priority_score: float = 50.0  # 0 to 100
    confidence: float = 0.5  # 0.0 to 1.0
    title: str
    description: str
    affected_lanes: List[str] = []
    estimated_people_affected: int = 0
    evidence: List[EvidenceItem] = []
    evidence_capsule: Optional[EvidenceCapsule] = None
    state_history: List[StateTransition] = []
    dispatch_id: Optional[str] = None
    acknowledged: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
