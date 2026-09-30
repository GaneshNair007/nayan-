"""
AEGIS GRID - Perception Layer: Evidence Accumulation & Verification Engine
Fuses multi-signal temporal features into verifiable EvidenceItems.
Evaluates hypothesis evidence scores separate from raw model confidence.
Orchestrates VerificationState transitions: OBSERVED -> SUSPECTED -> VERIFYING -> CONFIRMED.
"""

from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timezone
from app.models.incident import (
    Incident,
    IncidentType,
    IncidentSeverity,
    VerificationState,
    ResponseState,
    EvidenceItem,
    StateTransition,
    EvidenceCapsule,
    IncidentLocation
)
from app.models.event import DataProvenance
from app.perception.temporal_engine import (
    CollisionFeatureSnapshot,
    CrowdFeatureSnapshot,
    BaggageFeatureSnapshot
)

class EvidenceEngine:
    """
    Fuses perceptual temporal features into verifiable audit evidence.
    Manages the verification state machine independently from response state.
    """

    def __init__(self, camera_id: str, location: IncidentLocation):
        self.camera_id = camera_id
        self.location = location
        
        # Candidate incident tracking
        self.active_candidate_type: Optional[IncidentType] = None
        self.candidate_start_time: Optional[float] = None
        self.verification_state: VerificationState = VerificationState.OBSERVED
        self.accumulated_evidence: List[EvidenceItem] = []
        self.state_history: List[StateTransition] = []
        self.evidence_id_counter: int = 1

    def _create_evidence(
        self,
        ev_type: str,
        confidence_score: float,
        details: Dict[str, Any],
        timestamp_iso: str
    ) -> EvidenceItem:
        ev = EvidenceItem(
            id=f"EV-{self.camera_id}-{self.evidence_id_counter:04d}",
            type=ev_type,
            source=f"{self.camera_id}-perception",
            timestamp=timestamp_iso,
            confidence_score=round(confidence_score, 3),
            provenance=DataProvenance.INFERENCE,
            details=details
        )
        self.evidence_id_counter += 1
        return ev

    def process_collision_features(
        self,
        features: CollisionFeatureSnapshot,
        timestamp: float,
        model_confidence: float
    ) -> Optional[Tuple[VerificationState, float, float, List[EvidenceItem], List[str]]]:
        """
        Evaluate collision hypothesis against quantitative criteria.
        Returns: (state, model_confidence, evidence_score, evidence_items, priority_reasons)
        """
        now_iso = datetime.now(timezone.utc).isoformat()
        new_evidence_added = []
        reasons = []

        # Criteria definitions:
        # Signal 1: Trajectory Convergence
        # Signal 2: Abrupt Deceleration (> 4.0 px/frame2)
        # Signal 3: Spatial overlap / close proximity
        # Signal 4: Post-event stationary duration (> 2.0s)

        matched_signals = 0
        score = 0.0

        if features.trajectory_convergence:
            matched_signals += 1
            score += 0.25
            reasons.append("Trajectory convergence detected between conflicting tracks")
            if not any(e.type == "trajectory_conflict" for e in self.accumulated_evidence):
                ev = self._create_evidence("trajectory_conflict", 0.88, {
                    "convergence_rate_px_per_frame": features.convergence_rate_px,
                    "involved_tracks": features.involved_track_ids
                }, now_iso)
                self.accumulated_evidence.append(ev)
                new_evidence_added.append(ev)

        if features.abrupt_speed_reduction:
            matched_signals += 1
            score += 0.30
            reasons.append(f"Abrupt deceleration measured: {features.max_deceleration_px_frame2:.1f} px/frame²")
            if not any(e.type == "deceleration_anomaly" for e in self.accumulated_evidence):
                ev = self._create_evidence("deceleration_anomaly", 0.92, {
                    "max_deceleration": features.max_deceleration_px_frame2
                }, now_iso)
                self.accumulated_evidence.append(ev)
                new_evidence_added.append(ev)

        if features.spatial_overlap_iou > 0.05 or features.persistent_proximity_duration_s > 1.0:
            matched_signals += 1
            score += 0.25
            reasons.append(f"Persistent proximity at impact point ({features.persistent_proximity_duration_s:.1f}s)")
            if not any(e.type == "persistent_proximity" for e in self.accumulated_evidence):
                ev = self._create_evidence("persistent_proximity", 0.85, {
                    "iou": features.spatial_overlap_iou,
                    "duration_s": features.persistent_proximity_duration_s
                }, now_iso)
                self.accumulated_evidence.append(ev)
                new_evidence_added.append(ev)

        if features.post_event_stationary_duration_s > 2.0:
            matched_signals += 1
            score += 0.20
            reasons.append(f"Post-event stationary stoppage confirmed: {features.post_event_stationary_duration_s:.1f}s")
            if not any(e.type == "stationary_duration" for e in self.accumulated_evidence):
                ev = self._create_evidence("stationary_duration", 0.95, {
                    "stationary_duration_s": features.post_event_stationary_duration_s
                }, now_iso)
                self.accumulated_evidence.append(ev)
                new_evidence_added.append(ev)

        evidence_score = min(1.0, score)

        # Transition State Machine based strictly on evidence measurements
        prev_state = self.verification_state
        if matched_signals == 0:
            return None

        if self.candidate_start_time is None:
            self.candidate_start_time = timestamp

        dur = timestamp - self.candidate_start_time

        if matched_signals == 1:
            self.verification_state = VerificationState.OBSERVED
        elif matched_signals == 2:
            self.verification_state = VerificationState.SUSPECTED
        elif matched_signals >= 3 and features.post_event_stationary_duration_s < 2.5:
            self.verification_state = VerificationState.VERIFYING
        elif matched_signals >= 3 and features.post_event_stationary_duration_s >= 2.5 and evidence_score >= 0.75:
            self.verification_state = VerificationState.CONFIRMED

        if self.verification_state != prev_state:
            trans = StateTransition(
                dimension="VERIFICATION",
                from_state=prev_state.value,
                to_state=self.verification_state.value,
                timestamp=now_iso,
                reason=f"Evidence score reached {evidence_score:.2f} with {matched_signals} signals"
            )
            self.state_history.append(trans)

        return (
            self.verification_state,
            model_confidence,
            evidence_score,
            self.accumulated_evidence,
            reasons
        )

    def process_crowd_features(
        self,
        features: CrowdFeatureSnapshot,
        timestamp: float,
        model_confidence: float
    ) -> Optional[Tuple[VerificationState, float, float, List[EvidenceItem], List[str]]]:
        """
        Evaluate crowd anomaly hypothesis based on count, density surge, and directional flow.
        """
        now_iso = datetime.now(timezone.utc).isoformat()
        reasons = []

        if features.person_count < 5 and features.density_trend == "STABLE":
            return None

        score = 0.0
        matched = 0

        if features.density_trend == "RAPID_INCREASE":
            matched += 1
            score += 0.40
            reasons.append(f"Rapid density increase: +{features.growth_rate_pct_per_sec:.1f}%/s")
            if not any(e.type == "density_spike" for e in self.accumulated_evidence):
                self.accumulated_evidence.append(self._create_evidence("density_spike", 0.89, {
                    "growth_rate": features.growth_rate_pct_per_sec,
                    "count": features.person_count
                }, now_iso))

        if features.directional_convergence:
            matched += 1
            score += 0.35
            reasons.append("Unusual directional convergence into choke point")
            if not any(e.type == "directional_convergence" for e in self.accumulated_evidence):
                self.accumulated_evidence.append(self._create_evidence("directional_convergence", 0.84, {
                    "variance": features.direction_variance_rad
                }, now_iso))

        if features.rapid_dispersal:
            matched += 1
            score += 0.40
            reasons.append("Rapid crowd dispersal detected")
            if not any(e.type == "rapid_dispersal" for e in self.accumulated_evidence):
                self.accumulated_evidence.append(self._create_evidence("rapid_dispersal", 0.86, {}, now_iso))

        evidence_score = min(1.0, score + (features.person_count / 50.0))

        prev_state = self.verification_state
        if matched == 1:
            self.verification_state = VerificationState.SUSPECTED
        elif matched >= 2 and evidence_score >= 0.70:
            self.verification_state = VerificationState.CONFIRMED
        else:
            self.verification_state = VerificationState.VERIFYING

        if self.verification_state != prev_state:
            self.state_history.append(StateTransition(
                dimension="VERIFICATION",
                from_state=prev_state.value,
                to_state=self.verification_state.value,
                timestamp=now_iso,
                reason=f"Crowd evidence score {evidence_score:.2f}"
            ))

        return (
            self.verification_state,
            model_confidence,
            evidence_score,
            self.accumulated_evidence,
            reasons
        )

    def process_baggage_features(
        self,
        features: BaggageFeatureSnapshot,
        timestamp: float,
        model_confidence: float
    ) -> Optional[Tuple[VerificationState, float, float, List[EvidenceItem], List[str]]]:
        """
        Evaluate unattended baggage hypothesis based on owner separation and stationary duration.
        """
        now_iso = datetime.now(timezone.utc).isoformat()
        reasons = []

        if not features.unattended_detected:
            return None

        reasons.append(f"Baggage stationary for {features.stationary_duration_s:.1f}s")
        reasons.append(f"Associated owner departed (separation {features.current_separation_distance_px:.0f}px)")

        if not any(e.type == "stationary_baggage" for e in self.accumulated_evidence):
            self.accumulated_evidence.append(self._create_evidence("stationary_baggage", 0.93, {
                "stationary_duration_s": features.stationary_duration_s,
                "bag_id": features.baggage_track_id
            }, now_iso))

        if not any(e.type == "owner_separation" for e in self.accumulated_evidence):
            self.accumulated_evidence.append(self._create_evidence("owner_separation", 0.87, {
                "separation_distance": features.current_separation_distance_px,
                "owner_id": features.owner_track_id
            }, now_iso))

        evidence_score = min(1.0, 0.50 + (features.stationary_duration_s / 20.0))

        prev_state = self.verification_state
        if features.stationary_duration_s < 8.0:
            self.verification_state = VerificationState.VERIFYING
        else:
            self.verification_state = VerificationState.CONFIRMED

        if self.verification_state != prev_state:
            self.state_history.append(StateTransition(
                dimension="VERIFICATION",
                from_state=prev_state.value,
                to_state=self.verification_state.value,
                timestamp=now_iso,
                reason=f"Stationary duration reached {features.stationary_duration_s:.1f}s"
            ))

        return (
            self.verification_state,
            model_confidence,
            evidence_score,
            self.accumulated_evidence,
            reasons
        )

    def reset(self):
        """Reset state for clean scenario rerun."""
        self.active_candidate_type = None
        self.candidate_start_time = None
        self.verification_state = VerificationState.OBSERVED
        self.accumulated_evidence = []
        self.state_history = []
