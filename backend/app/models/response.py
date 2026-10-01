"""
Emergency Response, Dispatch, and Green Corridor Domain Models
"""
from enum import Enum
from typing import List, Dict, Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from app.models.event import DataProvenance

class ResourceType(str, Enum):
    AMBULANCE = "AMBULANCE"
    POLICE = "POLICE"
    FIRE = "FIRE"

class ResourceStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    RESERVED = "RESERVED"
    DISPATCHED = "DISPATCHED"
    EN_ROUTE = "EN_ROUTE"
    ARRIVED = "ARRIVED"
    UNAVAILABLE = "UNAVAILABLE"

class CorridorStatus(str, Enum):
    NOT_PLANNED = "NOT_PLANNED"
    PLANNED = "PLANNED"
    BLOCKED = "BLOCKED"
    FORMING = "FORMING"
    READY = "READY"
    ACTIVE = "ACTIVE"
    PASSED = "PASSED"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class LocationPoint(BaseModel):
    lat: float
    lon: float
    address: Optional[str] = None

class Resource(BaseModel):
    id: str  # e.g., AMB-03
    callsign: str  # Medic Unit 3
    type: ResourceType = ResourceType.AMBULANCE
    status: ResourceStatus = ResourceStatus.AVAILABLE
    location: LocationPoint
    eta_seconds: Optional[int] = 0
    provenance: DataProvenance = DataProvenance.SIMULATOR

class RouteWaypoint(BaseModel):
    lat: float
    lon: float
    junction_id: Optional[str] = None
    name: Optional[str] = None

class Route(BaseModel):
    origin: LocationPoint
    destination: LocationPoint
    waypoints: List[RouteWaypoint] = []
    geometry_geojson: List[List[float]] = []  # [[lon, lat], ...]
    distance_meters: float
    duration_seconds: float
    provenance: DataProvenance = DataProvenance.MOCK  # OSRM or MOCK

class JunctionCorridorStatus(BaseModel):
    junction_id: str
    junction_name: str
    readiness: str  # STANDBY, PREPARING, CLEAR, GREEN_ACTIVE, PASSED
    eta_seconds: int

class SegmentCorridorStatus(BaseModel):
    segment_id: str
    camera_id: Optional[str] = None
    clearance_width_meters: Optional[float] = None  # None if camera uncalibrated
    normalized_clearance: Optional[float] = None  # 0.0 - 1.0 relative clearance
    traffic_compression_state: str  # COMPRESSING, CLEARED, FAILED
    upstream_signal_state: str  # FLOWING, HALTED_NEW_TRAFFIC
    verified_by_cctv: bool = False

class CorridorPlan(BaseModel):
    id: str
    dispatch_id: str
    resource_id: str
    incident_id: str
    junction_sequence: List[JunctionCorridorStatus] = []
    segment_sequence: List[SegmentCorridorStatus] = []
    is_rerouted: bool = False
    route: Route
    status: CorridorStatus = CorridorStatus.PLANNED
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    provenance: DataProvenance = DataProvenance.SIMULATOR

class DispatchRequest(BaseModel):
    resource_id: Optional[str] = None  # If null, auto-select nearest available

class DispatchResponse(BaseModel):
    dispatch_id: str
    incident_id: str
    resource: Resource
    corridor_plan: CorridorPlan
    dispatched_at: str
    provenance: DataProvenance = DataProvenance.SIMULATOR
