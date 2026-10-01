import os
import sys
import json
import uuid
import cv2
import torch
import numpy as np

# Add backend to sys.path
sys.path.insert(0, os.path.abspath("backend"))

from app.perception.detector import YOLOv8DetectorAdapter
from app.perception.tracker import HighPrecisionByteTracker
from app.perception.temporal_engine import TemporalFeatureEngine
from app.perception.evidence_engine import EvidenceEngine
from app.services.incident import IncidentService
from app.models.incident import IncidentLocation, IncidentSeverity, VerificationState

def record_cv_trace():
    correlation_id = f"cv-trace-{uuid.uuid4().hex[:8]}"
    print(f"Generating authoritative CV pipeline trace: correlation_id={correlation_id}")

    detector = YOLOv8DetectorAdapter(model_path="artifacts/models/nayan_india_v2/best.pt")
    tracker = HighPrecisionByteTracker()
    temporal_engine = TemporalFeatureEngine()
    loc = IncidentLocation(lat=12.9754, lon=77.5985, address="Central Expressway & 4th Cross", junction_id="JNC-02")
    evidence_engine = EvidenceEngine("CAM-04", loc)

    cap = cv2.VideoCapture("data/demo/cam04_collision.mp4")
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0

    # Read frames across the collision event (frame 425 to 445)
    cap.set(cv2.CAP_PROP_POS_FRAMES, 425)
    frame_idx = 425

    trace_records = []
    state_transitions = []
    captured_evidence_items = []
    final_incident = None

    while frame_idx < 445:
        ret, frame = cap.read()
        if not ret:
            break
        frame_idx += 1
        t = frame_idx / fps

        # 1. Detection
        detections = detector.detect(frame)

        # 2. Tracking
        tracks = tracker.update(detections, frame_idx, t)

        # 3. Temporal feature extraction
        coll_features = temporal_engine.extract_collision_features(tracks, t)

        # 4. Evidence processing
        frame_record = {
            "frame_index": frame_idx,
            "timestamp_seconds": round(t, 3),
            "detections_count": len(detections),
            "detections_sample": [
                {
                    "class_name": d.class_name,
                    "confidence": round(d.confidence, 3),
                    "bbox": [round(c, 1) for c in d.bbox]
                } for d in detections[:3]
            ],
            "active_tracks_count": len(tracks),
            "tracks_sample": [
                {
                    "track_id": tr.track_id,
                    "anonymous_id": tr.anonymous_id,
                    "class_name": tr.class_name,
                    "speed_px_per_sec": round(tr.speed, 2),
                    "acceleration": round(tr.acceleration, 2)
                } for tr in tracks[:3]
            ],
            "temporal_features": {
                "trajectory_convergence": coll_features.trajectory_convergence,
                "convergence_rate_px": round(coll_features.convergence_rate_px, 2),
                "abrupt_speed_reduction": coll_features.abrupt_speed_reduction,
                "max_deceleration_px_frame2": round(coll_features.max_deceleration_px_frame2, 2),
                "involved_track_ids": coll_features.involved_track_ids,
                "confidence_score": round(coll_features.confidence_score, 3)
            }
        }

        if coll_features.confidence_score > 0.15 or len(coll_features.involved_track_ids) >= 2:
            ev_res = evidence_engine.process_collision_features(coll_features, t, 0.88)
            if ev_res:
                state, m_conf, ev_score, ev_items, reasons = ev_res
                if not state_transitions or state_transitions[-1] != state.value:
                    state_transitions.append(state.value)
                
                for item in ev_items:
                    if item.id not in [e["id"] for e in captured_evidence_items]:
                        captured_evidence_items.append({
                            "id": item.id,
                            "type": item.type,
                            "source": item.source,
                            "confidence_score": item.confidence_score,
                            "details": item.details
                        })

                p_tier, p_score, p_reasons = IncidentService.calculate_priority(
                    severity=IncidentSeverity.CRITICAL if state == VerificationState.CONFIRMED else IncidentSeverity.HIGH,
                    evidence_score=ev_score,
                    estimated_people_affected=len(tracks),
                    affected_lanes_count=1,
                    evidence_count=len(ev_items),
                    emergency_involved=False
                )

                final_incident = {
                    "incident_id": f"INC-CAM04-{correlation_id}",
                    "camera_id": "CAM-04",
                    "verification_state": state.value,
                    "evidence_score": round(ev_score, 3),
                    "priority_tier": p_tier,
                    "priority_score": p_score,
                    "priority_reasons": p_reasons
                }
                frame_record["verification_state"] = state.value
                frame_record["evidence_score"] = round(ev_score, 3)

        trace_records.append(frame_record)

    cap.release()

    output = {
        "correlation_id": correlation_id,
        "pipeline_stages": [
            "VIDEO_DECODING",
            "TRAINED_YOLO_INFERENCE",
            "BYTETRACK_ASSOCIATION",
            "TEMPORAL_KINEMATIC_FEATURES",
            "MULTI_SIGNAL_EVIDENCE_ENGINE",
            "DETERMINISTIC_PRIORITY_SCORING"
        ],
        "model_checkpoint": "artifacts/models/nayan_india_v2/best.pt",
        "device": str(detector.model.device),
        "total_frames_traced": len(trace_records),
        "state_transitions": state_transitions,
        "captured_evidence_items": captured_evidence_items,
        "final_incident_state": final_incident,
        "frame_traces": trace_records
    }

    os.makedirs("artifacts/backend_hardening", exist_ok=True)
    out_path = "artifacts/backend_hardening/cv_trace.json"
    with open(out_path, "w") as f:
        json.dump(output, f, indent=2)

    print(f"Authoritative CV trace written to {out_path} ({len(trace_records)} frames recorded).")

if __name__ == '__main__':
    record_cv_trace()
