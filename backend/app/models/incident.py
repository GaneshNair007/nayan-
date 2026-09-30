"""
Incident and Evidence Domain Models with Decoupled States and Provenance
"""
from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from app.models.event import DataProvenance

class VerificationState(str, Enum):
    OBSERVED = "OBSERVED"
    SUSPECTED = "SUSPECTED"
    VERIFYING = "VERIFYING"
    CONFIRMED = "CONFIRMED"
    FALSE_ALARM = "FALSE_ALARM"

class ResponseState(str, Enum):
    UNACKNOWLEDGED = "UNACKNOWLEDGED"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    RESPONSE_PROPOSED = "RESPONSE_PROPOSED"
    AUTHORIZED = "AUTHORIZED"
    DISPATCHED = "DISPATCHED"
    ARRIVED = "ARRIVED"
    CONTAINED = "CONTAINED"
    CLOSED = "CLOSED"

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
    type: str  # deceleration_anomaly, trajectory_conflict, stationary_duration, density_spike, owner_separation, cross_camera_check
    source: str  # CAM-04, perception-engine, temporal-verifier
    timestamp: str
    confidence_score: float  # 0.0 to 1.0
    provenance: DataProvenance = DataProvenance.INFERENCE
    details: Dict[str, Any] = {}

class StateTransition(BaseModel):
    dimension: str  # "VERIFICATION" or "RESPONSE"
    from_state: str
    to_state: str
    timestamp: str
    reason: str

class EvidenceCapsule(BaseModel):
    before_clip_url: Optional[str] = "/assets/clips/demo-before.mp4"
    event_clip_url: Optional[str] = "/assets/clips/demo-event.mp4"
    after_clip_url: Optional[str] = "/assets/clips/demo-after.mp4"
    key_frame_timestamp: str = ""
    summary_text: str = ""
    provenance: DataProvenance = DataProvenance.REPLAY_FIXTURE

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

    # Decoupled States
    verification_state: VerificationState = VerificationState.OBSERVED
    response_state: ResponseState = ResponseState.UNACKNOWLEDGED

    # Separated AI & Assessment Metrics
    model_confidence: float = 0.50     # Instantaneous perception confidence (0.0 to 1.0)
    evidence_score: float = 0.50       # Accumulated temporal hypothesis support (0.0 to 1.0)
    severity: IncidentSeverity = IncidentSeverity.MEDIUM
    priority_tier: str = "P2"          # P1, P2, P3, P4
    priority_score: float = 50.0       # 0.0 to 100.0
    priority_reasons: List[str] = []   # Plain text explanation of priority assignment

    title: str
    description: str
    affected_lanes: List[str] = []
    estimated_people_affected: int = 0
    provenance: DataProvenance = DataProvenance.REPLAY_FIXTURE

    evidence: List[EvidenceItem] = []
    evidence_capsule: Optional[EvidenceCapsule] = None
    state_history: List[StateTransition] = []
    dispatch_id: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
