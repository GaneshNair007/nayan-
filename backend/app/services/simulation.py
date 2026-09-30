"""
Simulation & Scenario Engine: Golden Demo, Required Scenarios, Digital Twin (SUMO Adapter)
"""
from typing import Dict, Any, List
from datetime import datetime
import asyncio

from app.models.incident import (
    Incident, IncidentState, IncidentType, IncidentSeverity,
    IncidentLocation, EvidenceItem, EvidenceCapsule
)
from app.models.mobility import DigitalTwinScenario
from app.database import db
from app.services.incident import IncidentService
from app.services.websocket import manager as ws_manager

class SimulationService:
    @staticmethod
    def reset_simulation() -> Dict[str, Any]:
        """
        Resets database to clean initial state.
        """
        db.__init__()
        db.log_audit(
            event_type="DEMO_RESET",
            action="Reset system to clean initial state",
            details={"timestamp": datetime.utcnow().isoformat() + "Z"}
        )
        return {"status": "success", "message": "AEGIS GRID state successfully reset."}

    @staticmethod
    async def run_golden_demo() -> Incident:
        """
        Executes the Golden Demo Collision Scenario:
        CAM-04 Collision -> OBSERVED -> VERIFYING -> CONFIRMED -> Evidence Capsule -> Dispatch Ready.
        """
        SimulationService.reset_simulation()

        now_iso = datetime.utcnow().isoformat() + "Z"

        # 1. Create Base Collision Incident on CAM-04
        inc = Incident(
            id="INC-2026-001",
            type=IncidentType.COLLISION,
            camera_id="CAM-04",
            location=IncidentLocation(
                lat=12.9754,
                lon=77.5985,
                address="Central Expressway & 4th Cross (Westbound)",
                junction_id="JNC-02"
            ),
            state=IncidentState.OBSERVED,
            severity=IncidentSeverity.CRITICAL,
            confidence=0.45,
            priority_score=62.0,
            title="Multi-Vehicle Collision on Central Expressway",
            description="Perception pipeline detected abrupt deceleration and spatial overlap between OBJ-104 (Sedan) and OBJ-105 (Delivery Van).",
            affected_lanes=["Lane 1", "Lane 2"],
            estimated_people_affected=4,
            evidence_capsule=EvidenceCapsule(
                before_clip_url="/assets/clips/cam04-before.mp4",
                event_clip_url="/assets/clips/cam04-event.mp4",
                after_clip_url="/assets/clips/cam04-after.mp4",
                key_frame_timestamp=now_iso,
                summary_text="CAM-04 feed shows collision event between OBJ-104 and OBJ-105 at 42 km/h kinetic transfer."
            )
        )
        db.incidents[inc.id] = inc

        # Log & Broadcast initial state
        db.log_audit(
            event_type="INCIDENT_OBSERVED",
            action=f"Incident {inc.id} observed on CAM-04",
            details={"type": inc.type.value, "camera_id": inc.camera_id},
            incident_id=inc.id
        )
        await ws_manager.broadcast_event(
            event_type="incident.created",
            source="perception-engine",
            payload=inc.model_dump()
        )

        # 2. Add Evidence 1: Deceleration Anomaly
        ev1 = EvidenceItem(
            id="ev-001",
            type="deceleration_anomaly",
            source="CAM-04 Perception Tracking",
            timestamp=now_iso,
            confidence_score=0.85,
            details={"deceleration_rate_m_s2": -5.2, "pre_impact_speed_kmh": 48.0, "post_impact_speed_kmh": 0.0}
        )
        inc = IncidentService.add_evidence(inc.id, ev1)
        
        # Transition to VERIFYING
        IncidentService.transition_state(
            incident_id=inc.id,
            new_state=IncidentState.VERIFYING,
            reason="Temporal evidence engine collecting multi-frame verification"
        )
        await ws_manager.broadcast_event(
            event_type="incident.updated",
            source="temporal-verifier",
            payload=inc.model_dump()
        )

        # 3. Add Evidence 2 & 3: Bounding Box Overlap & Stationary Duration
        ev2 = EvidenceItem(
            id="ev-002",
            type="trajectory_conflict",
            source="CAM-04 ByteTrack Spatial Analysis",
            timestamp=now_iso,
            confidence_score=0.92,
            details={"intersecting_ids": ["OBJ-104", "OBJ-105"], "overlap_iou": 0.68}
        )
        ev3 = EvidenceItem(
            id="ev-003",
            type="stationary_duration",
            source="Temporal Evidence Engine",
            timestamp=now_iso,
            confidence_score=0.96,
            details={"stationary_seconds": 45.0, "lane_obstruction_pct": 85.0}
        )
        inc = IncidentService.add_evidence(inc.id, ev2)
        inc = IncidentService.add_evidence(inc.id, ev3)

        # 4. Cross Camera Verification from CAM-03
        ev4 = EvidenceItem(
            id="ev-004",
            type="cross_camera_check",
            source="CAM-03 Adjacent Perspective",
            timestamp=now_iso,
            confidence_score=0.88,
            details={"verifying_camera_id": "CAM-03", "confirmed_traffic_tailback_meters": 120.0}
        )
        inc = IncidentService.add_evidence(inc.id, ev4)

        # Final check ensures state is CONFIRMED and high priority
        inc = IncidentService.get_incident(inc.id)
        await ws_manager.broadcast_event(
            event_type="incident.confirmed",
            source="incident-engine",
            payload=inc.model_dump()
        )

        return inc

    @staticmethod
    async def run_crowd_scenario() -> Incident:
        """
        Executes Crowd Anomaly Scenario on CAM-05.
        Density, growth rate, direction change—not intent inference.
        """
        now_iso = datetime.utcnow().isoformat() + "Z"
        inc = Incident(
            id="INC-2026-002",
            type=IncidentType.CROWD_ANOMALY,
            camera_id="CAM-05",
            location=IncidentLocation(
                lat=12.9780,
                lon=77.6020,
                address="Plaza Blvd & Metro Entrance",
                junction_id="JNC-03"
            ),
            state=IncidentState.CONFIRMED,
            severity=IncidentSeverity.HIGH,
            confidence=0.89,
            priority_score=78.0,
            title="Crowd Surge Anomaly at Metro Plaza",
            description="Perception engine detected abnormal pedestrian accumulation and rapid vector convergence near Metro Concourse Entry B.",
            affected_lanes=["Pedestrian Plaza", "Metro Ramp"],
            estimated_people_affected=45,
            evidence=[
                EvidenceItem(
                    id="ev-c1",
                    type="density_spike",
                    source="CAM-05 Density Engine",
                    timestamp=now_iso,
                    confidence_score=0.91,
                    details={"density_persons_m2": 2.4, "growth_rate_pct_min": 320.0}
                ),
                EvidenceItem(
                    id="ev-c2",
                    type="directional_turbulence",
                    source="CAM-05 Optical Flow",
                    timestamp=now_iso,
                    confidence_score=0.87,
                    details={"vector_dispersion_index": 0.84, "avg_pedestrian_speed_ms": 0.4}
                )
            ],
            evidence_capsule=EvidenceCapsule(
                before_clip_url="/assets/clips/cam05-before.mp4",
                event_clip_url="/assets/clips/cam05-event.mp4",
                after_clip_url="/assets/clips/cam05-after.mp4",
                key_frame_timestamp=now_iso,
                summary_text="Pedestrian density increased from 0.4 to 2.4 pers/m² within 90 seconds."
            )
        )
        db.incidents[inc.id] = inc
        await ws_manager.broadcast_event(
            event_type="incident.created",
            source="incident-engine",
            payload=inc.model_dump()
        )
        return inc

    @staticmethod
    async def run_baggage_scenario() -> Incident:
        """
        Executes Unattended Baggage Scenario on CAM-06.
        Object/person association, separation distance, stationary duration, cross-camera check.
        """
        now_iso = datetime.utcnow().isoformat() + "Z"
        inc = Incident(
            id="INC-2026-003",
            type=IncidentType.UNATTENDED_BAGGAGE,
            camera_id="CAM-06",
            location=IncidentLocation(
                lat=12.9730,
                lon=77.6050,
                address="Central Bus Terminal Bay 4",
                junction_id="JNC-01"
            ),
            state=IncidentState.CONFIRMED,
            severity=IncidentSeverity.MEDIUM,
            confidence=0.84,
            priority_score=68.5,
            title="Unattended Object Detected at Bus Bay 4",
            description="Stationary bag OBJ-309 separated from associated person OBJ-301 by > 6.0 meters for over 180 seconds.",
            affected_lanes=["Platform 4 Walkway"],
            estimated_people_affected=15,
            evidence=[
                EvidenceItem(
                    id="ev-b1",
                    type="stationary_duration",
                    source="CAM-06 Object Tracker",
                    timestamp=now_iso,
                    confidence_score=0.95,
                    details={"object_id": "OBJ-309", "stationary_seconds": 180.0}
                ),
                EvidenceItem(
                    id="ev-b2",
                    type="owner_separation",
                    source="Temporal Association Graph",
                    timestamp=now_iso,
                    confidence_score=0.86,
                    details={"last_associated_owner": "OBJ-301", "current_separation_meters": 6.8}
                )
            ],
            evidence_capsule=EvidenceCapsule(
                before_clip_url="/assets/clips/cam06-before.mp4",
                event_clip_url="/assets/clips/cam06-event.mp4",
                after_clip_url="/assets/clips/cam06-after.mp4",
                key_frame_timestamp=now_iso,
                summary_text="Object OBJ-309 left stationary at Bay 4 seating area."
            )
        )
        db.incidents[inc.id] = inc
        await ws_manager.broadcast_event(
            event_type="incident.created",
            source="incident-engine",
            payload=inc.model_dump()
        )
        return inc

    @staticmethod
    def get_digital_twin_metrics(scenario_id: str = "scen-golden") -> DigitalTwinScenario:
        """
        SUMO / TraCI Simulator Digital Twin Adapter.
        Compares Fixed signal timing vs Adaptive AEGIS GRID timing.
        """
        now_iso = datetime.utcnow().isoformat() + "Z"
        return DigitalTwinScenario(
            scenario_id=scenario_id,
            name="Golden Demo: Central Expressway Collision & Emergency Preemption",
            seed=42,
            fixed_avg_delay_s=52.4,
            adaptive_avg_delay_s=31.2,
            delay_reduction_pct=40.5,
            throughput_improvement_pct=28.6,
            simulated_at=now_iso,
            is_mocked=True
        )
