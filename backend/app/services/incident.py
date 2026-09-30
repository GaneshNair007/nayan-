"""
Incident Engine: Decoupled Verification & Response State Machines, Evidence Scoring, Priority Scoring
"""
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timezone
from app.models.incident import (
    Incident, VerificationState, ResponseState, IncidentSeverity, IncidentType,
    EvidenceItem, EvidenceCapsule, StateTransition, IncidentLocation
)
from app.models.event import DataProvenance
from app.database import db

class IncidentService:
    @staticmethod
    def calculate_priority(
        severity: IncidentSeverity,
        evidence_score: float,
        estimated_people_affected: int,
        affected_lanes_count: int,
        evidence_count: int,
        emergency_involved: bool = False
    ) -> Tuple[str, float, List[str]]:
        """
        Deterministic formula for operational priority.
        Returns: (priority_tier, priority_score, priority_reasons)
        """
        reasons = []
        severity_weights = {
            IncidentSeverity.LOW: 0.25,
            IncidentSeverity.MEDIUM: 0.50,
            IncidentSeverity.HIGH: 0.75,
            IncidentSeverity.CRITICAL: 1.00
        }
        sev_val = severity_weights.get(severity, 0.5)
        sev_part = sev_val * 35.0
        reasons.append(f"Severity level {severity.value} contributes {sev_part:.1f}pts")

        ev_part = evidence_score * 25.0
        if evidence_score >= 0.80:
            reasons.append(f"+ High evidence completeness ({evidence_score*100:.0f}%)")

        people_part = min(20.0, (estimated_people_affected / 50.0) * 20.0)
        if estimated_people_affected > 0:
            reasons.append(f"+ {estimated_people_affected} estimated individuals affected")

        lane_part = min(10.0, affected_lanes_count * 5.0)
        if affected_lanes_count > 0:
            reasons.append(f"+ Severe lane obstruction ({affected_lanes_count} lanes blocked)")

        ev_count_part = min(10.0, evidence_count * 2.5)

        total = sev_part + ev_part + people_part + lane_part + ev_count_part
        if emergency_involved:
            total += 10.0
            reasons.append("+ Emergency vehicle preemption active")

        score = round(min(100.0, max(0.0, total)), 1)

        # Tier assignment
        if score >= 80.0:
            tier = "P1"
        elif score >= 60.0:
            tier = "P2"
        elif score >= 40.0:
            tier = "P3"
        else:
            tier = "P4"

        return tier, score, reasons

    @staticmethod
    def get_all_incidents() -> List[Incident]:
        incidents = list(db.incidents.values())
        return sorted(incidents, key=lambda x: x.priority_score, reverse=True)

    @staticmethod
    def get_incident(incident_id: str) -> Incident:
        if incident_id not in db.incidents:
            raise KeyError(f"Incident {incident_id} not found")
        return db.incidents[incident_id]

    @staticmethod
    def transition_verification_state(
        incident_id: str,
        new_state: VerificationState,
        reason: str,
        actor: str = "SYSTEM"
    ) -> Incident:
        inc = IncidentService.get_incident(incident_id)
        old_state = inc.verification_state
        if old_state == new_state:
            return inc

        now_iso = datetime.now(timezone.utc).isoformat()
        inc.state_history.append(
            StateTransition(
                dimension="VERIFICATION",
                from_state=old_state.value,
                to_state=new_state.value,
                timestamp=now_iso,
                reason=reason
            )
        )
        inc.verification_state = new_state
        inc.updated_at = now_iso
        db.incidents[incident_id] = inc

        db.log_audit(
            action=f"Incident {incident_id} verification state changed: {old_state.value} -> {new_state.value}",
            entity_type="INCIDENT",
            entity_id=incident_id,
            previous_state=old_state.value,
            next_state=new_state.value,
            reason=reason,
            actor=actor,
            source="incident-engine",
            provenance=DataProvenance.INFERENCE if actor == "SYSTEM" else DataProvenance.USER_INPUT
        )
        return inc

    @staticmethod
    def transition_response_state(
        incident_id: str,
        new_state: ResponseState,
        reason: str,
        actor: str = "OPERATOR"
    ) -> Incident:
        inc = IncidentService.get_incident(incident_id)
        old_state = inc.response_state
        if old_state == new_state:
            return inc

        now_iso = datetime.now(timezone.utc).isoformat()
        inc.state_history.append(
            StateTransition(
                dimension="RESPONSE",
                from_state=old_state.value,
                to_state=new_state.value,
                timestamp=now_iso,
                reason=reason
            )
        )
        inc.response_state = new_state
        inc.updated_at = now_iso
        db.incidents[incident_id] = inc

        db.log_audit(
            action=f"Incident {incident_id} response state changed: {old_state.value} -> {new_state.value}",
            entity_type="INCIDENT",
            entity_id=incident_id,
            previous_state=old_state.value,
            next_state=new_state.value,
            reason=reason,
            actor=actor,
            source="operator-console",
            provenance=DataProvenance.USER_INPUT
        )
        return inc

    @staticmethod
    def add_evidence(incident_id: str, item: EvidenceItem) -> Incident:
        inc = IncidentService.get_incident(incident_id)
        inc.evidence.append(item)

        # Multi-signal probabilistic evidence fusion formula: 1 - prod(1 - c)
        if inc.evidence:
            conf_scores = [ev.confidence_score for ev in inc.evidence]
            prod = 1.0
            for c in conf_scores:
                prod *= (1.0 - c)
            inc.evidence_score = round(1.0 - prod, 2)

        # Update priority tier, score, and explanation
        tier, score, reasons = IncidentService.calculate_priority(
            severity=inc.severity,
            evidence_score=inc.evidence_score,
            estimated_people_affected=inc.estimated_people_affected,
            affected_lanes_count=len(inc.affected_lanes),
            evidence_count=len(inc.evidence),
            emergency_involved=(inc.response_state == ResponseState.DISPATCHED)
        )
        inc.priority_tier = tier
        inc.priority_score = score
        inc.priority_reasons = reasons
        inc.updated_at = datetime.now(timezone.utc).isoformat()

        # Automatic verification threshold:
        # High model confidence alone NEVER confirms an incident.
        # Requires evidence_score >= 0.80 AND at least 3 distinct evidence items.
        if (
            inc.verification_state in [VerificationState.OBSERVED, VerificationState.SUSPECTED, VerificationState.VERIFYING]
            and inc.evidence_score >= 0.80
            and len(inc.evidence) >= 3
        ):
            IncidentService.transition_verification_state(
                incident_id=incident_id,
                new_state=VerificationState.CONFIRMED,
                reason=f"Multi-frame temporal evidence threshold met (evidence score: {inc.evidence_score*100:.0f}%, {len(inc.evidence)} signals)"
            )

        db.incidents[incident_id] = inc
        return inc

    @staticmethod
    def acknowledge_incident(incident_id: str, actor: str = "OPERATOR") -> Incident:
        inc = IncidentService.get_incident(incident_id)
        return IncidentService.transition_response_state(
            incident_id=incident_id,
            new_state=ResponseState.ACKNOWLEDGED,
            reason="Operator acknowledged incident notification",
            actor=actor
        )

    @staticmethod
    def propose_response(incident_id: str, actor: str = "SYSTEM") -> Incident:
        inc = IncidentService.get_incident(incident_id)
        return IncidentService.transition_response_state(
            incident_id=incident_id,
            new_state=ResponseState.RESPONSE_PROPOSED,
            reason="Response orchestrator generated emergency dispatch recommendation",
            actor=actor
        )

    @staticmethod
    def authorize_response(incident_id: str, actor: str = "OPERATOR") -> Incident:
        inc = IncidentService.get_incident(incident_id)
        return IncidentService.transition_response_state(
            incident_id=incident_id,
            new_state=ResponseState.AUTHORIZED,
            reason="Operator formally authorized emergency resource dispatch and green corridor",
            actor=actor
        )
