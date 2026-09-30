"""
Emergency Response, Dispatch, and Green Corridor Domain Models
"""
from enum import Enum
from typing import List, Dict, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class ResourceType(str, Enum):
    AMBULANCE = "AMBULANCE"
    POLICE = "POLICE"
    FIRE = "FIRE"

class ResourceStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    DISPATCHED = "DISPATCHED"
    EN_ROUTE = "EN_ROUTE"
    ON_SCENE = "ON_SCENE"

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

class JunctionCorridorStatus(BaseModel):
    junction_id: str
    junction_name: str
    readiness: str  # STANDBY, PREPARING, CLEAR, GREEN_ACTIVE, PASSED
    eta_seconds: int

class CorridorPlan(BaseModel):
    id: str
    dispatch_id: str
    resource_id: str
    incident_id: str
    junction_sequence: List[JunctionCorridorStatus] = []
    route: Route
    status: str = "PLANNED"  # PLANNED, ACTIVE, COMPLETED
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")

class DispatchRequest(BaseModel):
    resource_id: Optional[str] = None  # If null, auto-select nearest available

class DispatchResponse(BaseModel):
    dispatch_id: str
    incident_id: str
    resource: Resource
    corridor_plan: CorridorPlan
    dispatched_at: str
