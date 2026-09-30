"""
Database and Repository Manager (In-Memory & SQLite Repository)
"""
from typing import Dict, List, Optional
from datetime import datetime, timezone

from app.models.camera import Camera, CameraStatus, CameraLocation
from app.models.incident import (
    Incident, IncidentType, VerificationState, ResponseState, IncidentSeverity,
    IncidentLocation, EvidenceItem, EvidenceCapsule, StateTransition
)
from app.models.mobility import Junction, JunctionLocation, SignalPhase, TrafficApproach, SafetyConstraints
from app.models.response import Resource, ResourceStatus, ResourceType, LocationPoint, CorridorPlan, CorridorStatus
from app.models.event import AuditEvent, DataProvenance

class Database:
    """
    Repository Storage for AEGIS GRID.
    Provides thread-safe access to domain entities and audit history.
    """
    def __init__(self):
        self.cameras: Dict[str, Camera] = {}
        self.incidents: Dict[str, Incident] = {}
        self.junctions: Dict[str, Junction] = {}
        self.resources: Dict[str, Resource] = {}
        self.corridor_plans: Dict[str, CorridorPlan] = {}
        self.audit_events: List[AuditEvent] = []
        self._seed_default_data()

    def _seed_default_data(self):
        # 1. Cameras
        cams = [
            Camera(
                id="CAM-01",
                name="Junction 1 North - Main Street",
                status=CameraStatus.ACTIVE,
                location=CameraLocation(lat=12.9716, lon=77.5946, address="Main St & 1st Ave", junction_id="JNC-01"),
                feed_url="/assets/feeds/cam-01.mp4",
                fps=30,
                health_score=0.98,
                current_detections_count=14,
                provenance=DataProvenance.REPLAY_FIXTURE
            ),
            Camera(
                id="CAM-02",
                name="Junction 1 South - Main Street",
                status=CameraStatus.ACTIVE,
                location=CameraLocation(lat=12.9712, lon=77.5948, address="Main St & 1st Ave", junction_id="JNC-01"),
                feed_url="/assets/feeds/cam-02.mp4",
                fps=30,
                health_score=0.95,
                current_detections_count=18,
                provenance=DataProvenance.REPLAY_FIXTURE
            ),
            Camera(
                id="CAM-03",
                name="Junction 2 East - Central Expressway",
                status=CameraStatus.ACTIVE,
                location=CameraLocation(lat=12.9750, lon=77.5990, address="Central Expwy & 4th Cross", junction_id="JNC-02"),
                feed_url="/assets/feeds/cam-03.mp4",
                fps=30,
                health_score=0.99,
                current_detections_count=22,
                provenance=DataProvenance.REPLAY_FIXTURE
            ),
            Camera(
                id="CAM-04",
                name="Junction 2 West - Central Expressway (Golden Demo)",
                status=CameraStatus.ACTIVE,
                location=CameraLocation(lat=12.9754, lon=77.5985, address="Central Expwy & 4th Cross", junction_id="JNC-02"),
                feed_url="/assets/feeds/cam-04-collision.mp4",
                fps=30,
                health_score=1.0,
                current_detections_count=9,
                provenance=DataProvenance.REPLAY_FIXTURE
            ),
            Camera(
                id="CAM-05",
                name="Junction 3 North - Metro Plaza",
                status=CameraStatus.ACTIVE,
                location=CameraLocation(lat=12.9780, lon=77.6020, address="Plaza Blvd & Metro Entrance", junction_id="JNC-03"),
                feed_url="/assets/feeds/cam-05-crowd.mp4",
                fps=30,
                health_score=0.92,
                current_detections_count=45,
                provenance=DataProvenance.REPLAY_FIXTURE
            ),
            Camera(
                id="CAM-06",
                name="Bus Terminal Concourse South",
                status=CameraStatus.DEGRADED,
                location=CameraLocation(lat=12.9730, lon=77.6050, address="Central Bus Terminal Bay 4", junction_id="JNC-01"),
                feed_url="/assets/feeds/cam-06-baggage.mp4",
                fps=15,
                health_score=0.75,
                current_detections_count=8,
                provenance=DataProvenance.REPLAY_FIXTURE
            )
        ]
        for c in cams:
            self.cameras[c.id] = c

        # 2. Junctions
        jnc1 = Junction(
            id="JNC-01",
            name="Main St & 1st Ave",
            location=JunctionLocation(lat=12.9714, lon=77.5947, address="Main St & 1st Ave"),
            approaches=[
                TrafficApproach(name="Northbound", queue_length_meters=25.0, vehicle_count=8, average_speed_kmh=35.0, occupancy_pct=35.0),
                TrafficApproach(name="Southbound", queue_length_meters=30.0, vehicle_count=10, average_speed_kmh=32.0, occupancy_pct=40.0),
                TrafficApproach(name="Eastbound", queue_length_meters=15.0, vehicle_count=4, average_speed_kmh=42.0, occupancy_pct=20.0),
                TrafficApproach(name="Westbound", queue_length_meters=18.0, vehicle_count=5, average_speed_kmh=40.0, occupancy_pct=25.0)
            ],
            pressure=0.35,
            current_phase=SignalPhase(phase_id=1, name="North-South Green", duration_seconds=45, active_approaches=["Northbound", "Southbound"]),
            proposed_phase=SignalPhase(phase_id=2, name="East-West Green", duration_seconds=30, active_approaches=["Eastbound", "Westbound"])
        )

        jnc2 = Junction(
            id="JNC-02",
            name="Central Expwy & 4th Cross",
            location=JunctionLocation(lat=12.9752, lon=77.5987, address="Central Expwy & 4th Cross"),
            approaches=[
                TrafficApproach(name="Northbound", queue_length_meters=120.0, vehicle_count=28, average_speed_kmh=12.0, occupancy_pct=85.0),
                TrafficApproach(name="Southbound", queue_length_meters=95.0, vehicle_count=22, average_speed_kmh=15.0, occupancy_pct=75.0),
                TrafficApproach(name="Eastbound", queue_length_meters=40.0, vehicle_count=9, average_speed_kmh=28.0, occupancy_pct=40.0),
                TrafficApproach(name="Westbound", queue_length_meters=35.0, vehicle_count=8, average_speed_kmh=30.0, occupancy_pct=35.0)
            ],
            pressure=0.78,
            current_phase=SignalPhase(phase_id=1, name="North-South Green", duration_seconds=60, active_approaches=["Northbound", "Southbound"]),
            proposed_phase=SignalPhase(phase_id=3, name="Northbound Extended Green", duration_seconds=75, active_approaches=["Northbound"])
        )

        jnc3 = Junction(
            id="JNC-03",
            name="Plaza Blvd & Metro Entrance",
            location=JunctionLocation(lat=12.9780, lon=77.6020, address="Plaza Blvd & Metro Entrance"),
            approaches=[
                TrafficApproach(name="Northbound", queue_length_meters=45.0, vehicle_count=12, average_speed_kmh=28.0, occupancy_pct=50.0),
                TrafficApproach(name="Southbound", queue_length_meters=50.0, vehicle_count=14, average_speed_kmh=25.0, occupancy_pct=55.0),
                TrafficApproach(name="Eastbound", queue_length_meters=60.0, vehicle_count=16, average_speed_kmh=22.0, occupancy_pct=60.0),
                TrafficApproach(name="Westbound", queue_length_meters=30.0, vehicle_count=8, average_speed_kmh=35.0, occupancy_pct=35.0)
            ],
            pressure=0.52,
            current_phase=SignalPhase(phase_id=1, name="All Direction Pedestrian Walk", duration_seconds=30, active_approaches=[]),
            proposed_phase=SignalPhase(phase_id=2, name="East-West Vehicle Green", duration_seconds=40, active_approaches=["Eastbound", "Westbound"])
        )

        self.junctions[jnc1.id] = jnc1
        self.junctions[jnc2.id] = jnc2
        self.junctions[jnc3.id] = jnc3

        # 3. Emergency Resources
        res = [
            Resource(
                id="AMB-01",
                callsign="Medic 01",
                type=ResourceType.AMBULANCE,
                status=ResourceStatus.AVAILABLE,
                location=LocationPoint(lat=12.9680, lon=77.5900, address="City General Hospital Station 1"),
                provenance=DataProvenance.SIMULATOR
            ),
            Resource(
                id="AMB-03",
                callsign="Medic 03 (Fast Response)",
                type=ResourceType.AMBULANCE,
                status=ResourceStatus.AVAILABLE,
                location=LocationPoint(lat=12.9700, lon=77.5920, address="Central Fire & Rescue Hub"),
                provenance=DataProvenance.SIMULATOR
            ),
            Resource(
                id="POL-02",
                callsign="Patrol Unit 02",
                type=ResourceType.POLICE,
                status=ResourceStatus.AVAILABLE,
                location=LocationPoint(lat=12.9760, lon=77.5950, address="Sector 4 Precinct"),
                provenance=DataProvenance.SIMULATOR
            )
        ]
        for r in res:
            self.resources[r.id] = r

        # Initial Audit Event
        self.audit_events.append(
            AuditEvent(
                event_type="SYSTEM_BOOT",
                actor="SYSTEM",
                action="AEGIS GRID Kernel Initialized",
                entityType="SYSTEM",
                entityId="KERNEL",
                reason="System startup and data store initialization",
                source="kernel",
                scenarioId="initial",
                provenance=DataProvenance.SIMULATOR,
                result="SUCCESS",
                details={"version": "1.0.0", "cameras": len(cams), "junctions": len(self.junctions)}
            )
        )

    def log_audit(
        self,
        action: str,
        entity_type: str,
        entity_id: str,
        actor: str = "OPERATOR",
        previous_state: Optional[str] = None,
        next_state: Optional[str] = None,
        reason: Optional[str] = None,
        source: str = "incident-engine",
        scenario_id: Optional[str] = "golden-demo",
        provenance: DataProvenance = DataProvenance.USER_INPUT,
        result: str = "SUCCESS",
        details: Optional[dict] = None
    ) -> AuditEvent:
        evt = AuditEvent(
            actor=actor,
            action=action,
            entityType=entity_type,
            entityId=entity_id,
            previousState=previous_state,
            nextState=next_state,
            reason=reason,
            source=source,
            scenarioId=scenario_id,
            provenance=provenance,
            result=result,
            details=details or {}
        )
        self.audit_events.insert(0, evt)
        return evt

db = Database()
