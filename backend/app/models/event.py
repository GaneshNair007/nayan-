"""
Realtime Event Envelope Model according to architecture.md
"""
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone
import uuid

class EventEnvelope(BaseModel):
    id: str = Field(default_factory=lambda: f"evt-{uuid.uuid4().hex[:8]}")
    type: str  # e.g., "incident.updated", "camera.health", "dispatch.created"
    occurredAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    source: str  # e.g., "incident-engine", "mobility-engine", "simulation-engine"
    payload: Dict[str, Any]
    demo: bool = True

class AuditEvent(BaseModel):
    id: str = Field(default_factory=lambda: f"audit-{uuid.uuid4().hex[:8]}")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    event_type: str
    actor: str = "OPERATOR"
    action: str
    details: Dict[str, Any]
    incident_id: Optional[str] = None
