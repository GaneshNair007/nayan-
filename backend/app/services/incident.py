"""
Incident Engine: Temporal Verification, Priority Scoring, State Transitions, Evidence Fusion
"""
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.models.incident import (
    Incident, IncidentState, IncidentSeverity, IncidentType,
    EvidenceItem, EvidenceCapsule, StateTransition, IncidentLocation
)
from app.database import db

class IncidentService:
    @staticmethod
    def calculate_priority_score(
        severity: IncidentSeverity,
        confidence: float,
        estimated_people_affected: int,
        affected_lanes_count: int,
        evidence_count: int
    ) -> float:
        """
        Deterministic formula for operational priority score (0.0 to 100.0).
        Prioritizes severity, confidence, lane obstruction, affected count, and evidence strength.
        """
        severity_weights = {
            IncidentSeverity.LOW: 0.25,
            IncidentSeverity.MEDIUM: 0.50,
            IncidentSeverity.HIGH: 0.75,
            IncidentSeverity.CRITICAL: 1.00
        }
        sev_part = severity_weights.get(severity, 0.5) * 35.0
        conf_part = confidence * 25.0
        people_part = min(20.0, (estimated_people_affected / 50.0) * 20.0)
        lane_part = min(10.0, affected_lanes_count * 5.0)
        evidence_part = min(10.0, evidence_count * 2.5)

        total = sev_part + conf_part + people_part + lane_part + evidence_part
        return round(min(100.0, max(0.0, total)), 1)

    @staticmethod
    def get_all_incidents() -> List[Incident]:
        """
        Returns all incidents sorted by priority score descending (highest priority first).
        """
        incidents = list(db.incidents.values())
        return sorted(incidents, key=lambda x: x.priority_score, reverse=True)

    @staticmethod
    def get_incident(incident_id: str) -> Incident:
        if incident_id not in db.incidents:
            raise KeyError(f"Incident {incident_id} not found")
        return db.incidents[incident_id]

    @staticmethod
    def transition_state(incident_id: str, new_state: IncidentState, reason: str, actor: str = "SYSTEM") -> Incident:
        inc = IncidentService.get_incident(incident_id)
        old_state = inc.state
        if old_state == new_state:
            return inc

        now_iso = datetime.utcnow().isoformat() + "Z"
        transition = StateTransition(
            from_state=old_state,
            to_state=new_state,
            timestamp=now_iso,
            reason=reason
        )
        inc.state = new_state
        inc.state_history.append(transition)
        inc.updated_at = now_iso

        db.incidents[incident_id] = inc
        db.log_audit(
            event_type="INCIDENT_STATE_TRANSITION",
            action=f"Incident {incident_id} state changed from {old_state.value} to {new_state.value}",
            details={"reason": reason, "from_state": old_state.value, "to_state": new_state.value},
            actor=actor,
            incident_id=incident_id
        )
        return inc

    @staticmethod
    def add_evidence(incident_id: str, item: EvidenceItem) -> Incident:
        inc = IncidentService.get_incident(incident_id)
        inc.evidence.append(item)
        
        # Recalculate confidence based on evidence scores
        if inc.evidence:
            conf_scores = [ev.confidence_score for ev in inc.evidence]
            # Simple soft max / probabilistic combination formula: 1 - prod(1 - c)
            prod = 1.0
            for c in conf_scores:
                prod *= (1.0 - c)
            inc.confidence = round(1.0 - prod, 2)

        # Recalculate priority
        inc.priority_score = IncidentService.calculate_priority_score(
            severity=inc.severity,
            confidence=inc.confidence,
            estimated_people_affected=inc.estimated_people_affected,
            affected_lanes_count=len(inc.affected_lanes),
            evidence_count=len(inc.evidence)
        )
        inc.updated_at = datetime.utcnow().isoformat() + "Z"

        # Auto transition from VERIFYING to CONFIRMED if confidence >= 0.80
        if inc.state in [IncidentState.OBSERVED, IncidentState.SUSPECTED, IncidentState.VERIFYING] and inc.confidence >= 0.80:
            IncidentService.transition_state(
                incident_id=incident_id,
                new_state=IncidentState.CONFIRMED,
                reason=f"Evidence threshold reached (confidence: {inc.confidence*100:.0f}%)"
            )

        db.incidents[incident_id] = inc
        return inc

    @staticmethod
    def acknowledge_incident(incident_id: str, actor: str = "OPERATOR") -> Incident:
        inc = IncidentService.get_incident(incident_id)
        inc.acknowledged = True
        inc.updated_at = datetime.utcnow().isoformat() + "Z"
        db.incidents[incident_id] = inc
        db.log_audit(
            event_type="INCIDENT_ACKNOWLEDGED",
            action=f"Incident {incident_id} acknowledged by operator",
            details={"title": inc.title, "state": inc.state.value},
            actor=actor,
            incident_id=incident_id
        )
        return inc
