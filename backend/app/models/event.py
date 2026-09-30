"""
Realtime Event Envelope and Audit Models with Data Provenance
"""
from enum import Enum
from typing import Any, Dict, Optional, Generic, TypeVar
from pydantic import BaseModel, Field
from datetime import datetime, timezone
import uuid

T = TypeVar("T")

class DataProvenance(str, Enum):
    INFERENCE = "INFERENCE"
    SIMULATOR = "SIMULATOR"
    REPLAY_FIXTURE = "REPLAY_FIXTURE"
    MOCK = "MOCK"
    DETERMINISTIC = "DETERMINISTIC"
    EXTERNAL_ROUTING = "EXTERNAL_ROUTING"
    ESTIMATE = "ESTIMATE"
    USER_INPUT = "USER_INPUT"

class ProvenancedValue(BaseModel, Generic[T]):
    value: T
    unit: Optional[str] = None
    provenance: DataProvenance = DataProvenance.REPLAY_FIXTURE

class EventEnvelope(BaseModel):
    id: str = Field(default_factory=lambda: f"evt-{uuid.uuid4().hex[:8]}")
    schemaVersion: int = 1
    sequence: int = 0
    type: str  # e.g., "incident.updated", "camera.health", "corridor.activated"
    occurredAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    source: str  # e.g., "incident-engine", "mobility-engine", "simulation-engine"
    scenarioId: Optional[str] = "golden-demo"
    correlationId: Optional[str] = None
    provenance: DataProvenance = DataProvenance.REPLAY_FIXTURE
    demo: bool = True
    payload: Dict[str, Any]

WebSocketEvent = EventEnvelope

class AuditEvent(BaseModel):
    id: str = Field(default_factory=lambda: f"audit-{uuid.uuid4().hex[:8]}")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    actor: str = "OPERATOR"
    action: str
    entityType: str = "INCIDENT"
    entityId: str = ""
    previousState: Optional[str] = None
    nextState: Optional[str] = None
    reason: Optional[str] = None
    source: str = "operator-console"
    scenarioId: Optional[str] = "golden-demo"
    provenance: DataProvenance = DataProvenance.USER_INPUT
    result: str = "SUCCESS"
    details: Dict[str, Any] = {}
