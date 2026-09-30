"""
Response Bounded Service: Emergency Resource Selection, Routing Adapter, Multi-Junction Green Corridor
"""
from typing import List, Optional
from datetime import datetime, timezone
import uuid
import httpx

from app.models.response import (
    Resource, ResourceStatus, CorridorStatus, DispatchResponse, CorridorPlan,
    Route, RouteWaypoint, JunctionCorridorStatus, LocationPoint
)
from app.models.incident import ResponseState
from app.models.event import DataProvenance
from app.database import db
from app.services.incident import IncidentService

class ResponseService:
    @staticmethod
    def get_all_resources() -> List[Resource]:
        return list(db.resources.values())

    @staticmethod
    def get_resource(resource_id: str) -> Resource:
        if resource_id not in db.resources:
            raise KeyError(f"Resource {resource_id} not found")
        return db.resources[resource_id]

    @staticmethod
    async def compute_route(origin: LocationPoint, destination: LocationPoint) -> Route:
        """
        Computes emergency response route using OSRM with deterministic fallback.
        """
        try:
            url = f"http://router.project-osrm.org/route/v1/driving/{origin.lon},{origin.lat};{destination.lon},{destination.lat}?overview=full&geometries=geojson"
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    if "routes" in data and len(data["routes"]) > 0:
                        r = data["routes"][0]
                        coords = r["geometry"]["coordinates"]
                        return Route(
                            origin=origin,
                            destination=destination,
                            waypoints=[
                                RouteWaypoint(lat=12.9714, lon=77.5947, junction_id="JNC-01", name="Main St & 1st Ave"),
                                RouteWaypoint(lat=12.9752, lon=77.5987, junction_id="JNC-02", name="Central Expwy & 4th Cross"),
                                RouteWaypoint(lat=12.9780, lon=77.6020, junction_id="JNC-03", name="Plaza Blvd & Metro Entrance")
                            ],
                            geometry_geojson=coords,
                            distance_meters=r["distance"],
                            duration_seconds=r["duration"],
                            provenance=DataProvenance.INFERENCE
                        )
        except Exception:
            pass

        # Deterministic Mock Fallback for Golden Demo (Network-Independent)
        coords_fallback = [
            [origin.lon, origin.lat],
            [77.5930, 12.9705],
            [77.5947, 12.9714],  # JNC-01
            [77.5965, 12.9730],
            [77.5987, 12.9752],  # JNC-02 (Incident Site)
            [77.6005, 12.9768],
            [77.6020, 12.9780]   # JNC-03
        ]
        return Route(
            origin=origin,
            destination=destination,
            waypoints=[
                RouteWaypoint(lat=12.9714, lon=77.5947, junction_id="JNC-01", name="Main St & 1st Ave"),
                RouteWaypoint(lat=12.9752, lon=77.5987, junction_id="JNC-02", name="Central Expwy & 4th Cross"),
                RouteWaypoint(lat=12.9780, lon=77.6020, junction_id="JNC-03", name="Plaza Blvd & Metro Entrance")
            ],
            geometry_geojson=coords_fallback,
            distance_meters=2450.0,
            duration_seconds=195.0,
            provenance=DataProvenance.MOCK
        )

    @staticmethod
    async def create_dispatch(incident_id: str, resource_id: Optional[str] = None) -> DispatchResponse:
        inc = IncidentService.get_incident(incident_id)

        # Select available resource
        if resource_id:
            res = ResponseService.get_resource(resource_id)
        else:
            available = [r for r in db.resources.values() if r.status == ResourceStatus.AVAILABLE]
            if not available:
                res = list(db.resources.values())[0]
            else:
                res = available[0]

        # Transition resource status to DISPATCHED
        res.status = ResourceStatus.DISPATCHED
        res.eta_seconds = 180
        db.resources[res.id] = res

        dispatch_id = f"DSP-{uuid.uuid4().hex[:6].upper()}"

        # Compute route
        dest = LocationPoint(lat=inc.location.lat, lon=inc.location.lon, address=inc.location.address)
        route = await ResponseService.compute_route(res.location, dest)

        # Build Green Corridor Plan across 3 junctions
        corridor_plan = CorridorPlan(
            id=f"COR-{uuid.uuid4().hex[:6].upper()}",
            dispatch_id=dispatch_id,
            resource_id=res.id,
            incident_id=inc.id,
            junction_sequence=[
                JunctionCorridorStatus(junction_id="JNC-01", junction_name="Main St & 1st Ave", readiness="PREPARING", eta_seconds=45),
                JunctionCorridorStatus(junction_id="JNC-02", junction_name="Central Expwy & 4th Cross", readiness="GREEN_ACTIVE", eta_seconds=110),
                JunctionCorridorStatus(junction_id="JNC-03", junction_name="Plaza Blvd & Metro Entrance", readiness="STANDBY", eta_seconds=180)
            ],
            route=route,
            status=CorridorStatus.ACTIVE,
            provenance=DataProvenance.SIMULATOR
        )
        db.corridor_plans[corridor_plan.id] = corridor_plan

        # Update Incident
        inc.dispatch_id = dispatch_id
        db.incidents[inc.id] = inc

        # Transition Incident Response State to DISPATCHED
        IncidentService.transition_response_state(
            incident_id=inc.id,
            new_state=ResponseState.DISPATCHED,
            reason=f"Emergency resource {res.callsign} ({res.id}) dispatched with Green Corridor {corridor_plan.id}"
        )

        db.log_audit(
            action=f"Dispatched {res.callsign} ({res.id}) to Incident {incident_id}",
            entity_type="DISPATCH",
            entity_id=dispatch_id,
            previous_state=ResponseState.AUTHORIZED.value,
            next_state=ResponseState.DISPATCHED.value,
            reason=f"Emergency dispatch authorized with Green Corridor {corridor_plan.id}",
            actor="OPERATOR",
            source="response-engine",
            provenance=DataProvenance.USER_INPUT,
            details={"dispatch_id": dispatch_id, "corridor_id": corridor_plan.id, "resource_id": res.id}
        )

        return DispatchResponse(
            dispatch_id=dispatch_id,
            incident_id=incident_id,
            resource=res,
            corridor_plan=corridor_plan,
            dispatched_at=datetime.now(timezone.utc).isoformat(),
            provenance=DataProvenance.SIMULATOR
        )

    @staticmethod
    def get_corridor_plan(corridor_id: str) -> CorridorPlan:
        if corridor_id not in db.corridor_plans:
            raise KeyError(f"Corridor plan {corridor_id} not found")
        return db.corridor_plans[corridor_id]
