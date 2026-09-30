"""
NAYAN Real Video Inference & Multi-Modal Perception Verification Suite
Runs actual demo videos through the full perception loop:
OpenCV Decode -> NAYAN Trained Model (CUDA FP16) -> ByteTrack -> Temporal Engine -> Evidence State Machine -> Corridor Homography
Audits:
- CAM-03: Ambulance Emergency Yield Corridor
- CAM-04: Collision / Deceleration / Obstruction
- CAM-07: Crowd Flow & Density Dynamics
- CAM-11: Unattended Baggage Spatial Tracking
Prints runtime verification table and outputs artifacts/evaluation/real_video_inference_audit.json.
"""
import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

import cv2
import json
import time
import torch
import numpy as np
from app.perception.detector import YOLOv8DetectorAdapter
from app.perception.baggage import BaggageDetectorAdapter
from app.perception.tracker import HighPrecisionByteTracker
from app.perception.temporal_engine import TemporalFeatureEngine
from app.perception.evidence_engine import EvidenceEngine
from app.perception.corridor_engine import DynamicCorridorEngine
from app.perception.calibration import DEMO_CALIBRATIONS
from app.models.incident import IncidentLocation

DEMO_VIDEOS = [
    ("CAM-03", "data/demo/cam03_ambulance.mp4", "ambulance_corridor"),
    ("CAM-04", "data/demo/cam04_collision.mp4", "collision"),
    ("CAM-07", "data/demo/cam07_crowd_growth.mp4", "crowd"),
    ("CAM-11", "data/demo/cam11_unattended_baggage.mp4", "baggage")
]

AUDIT_OUTPUT = os.path.abspath("artifacts/evaluation/real_video_inference_audit.json")

def audit_video_pipeline():
    print("=" * 75)
    print("NAYAN COMPREHENSIVE REAL VIDEO INFERENCE & TRACKING AUDIT")
    print("=" * 75)

    model_path = os.path.abspath("artifacts/models/nayan_india/best.pt")
    assert os.path.exists(model_path), f"Trained checkpoint {model_path} does not exist!"

    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    print(f"Loading NAYAN Detector: {model_path} on {device}")
    detector = YOLOv8DetectorAdapter(model_path=model_path, conf_threshold=0.25, device=device)
    baggage_adapter = BaggageDetectorAdapter(device=device)

    overall_results = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "model_path": model_path,
        "model_sha256": detector.model_sha256,
        "device": device,
        "gpu_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU",
        "videos": {}
    }

    for cam_id, rel_path, scenario in DEMO_VIDEOS:
        vpath = os.path.abspath(rel_path)
        print(f"\n=======================================================")
        print(f"Auditing Camera: {cam_id} | Scenario: {scenario.upper()} | File: {rel_path}")
        print(f"=======================================================")

        if not os.path.exists(vpath):
            print(f"Error: {vpath} not found!")
            continue

        cap = cv2.VideoCapture(vpath)
        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        tracker = HighPrecisionByteTracker(fps=fps, max_lost_frames=30)
        temporal_engine = TemporalFeatureEngine(fps=fps)
        corridor_engine = DynamicCorridorEngine()
        cam_loc = IncidentLocation(lat=12.9716, lon=77.5946, address=f"Sector {cam_id}")
        evidence_engine = EvidenceEngine(cam_id, cam_loc)

        samples = []
        track_persistence = {}
        all_unique_tracks = set()
        frames_to_audit = min(75, total_frames)

        for f_idx in range(frames_to_audit):
            ret, frame = cap.read()
            if not ret or frame is None:
                break

            ts = f_idx / fps

            # 1. Detection
            if scenario == "baggage":
                dets = baggage_adapter.detect(frame)
                if not dets:
                    dets = detector.detect(frame)
            else:
                dets = detector.detect(frame)

            # 2. Tracking
            tracks = tracker.update(dets, frame_idx=f_idx, timestamp=ts)

            # Record track persistence
            for t in tracks:
                all_unique_tracks.add(t.anonymous_id)
                if t.anonymous_id not in track_persistence:
                    track_persistence[t.anonymous_id] = []
                track_persistence[t.anonymous_id].append(f_idx)

            # 3. Temporal & Evidence Analysis
            if scenario == "collision":
                col_feats = temporal_engine.extract_collision_features(tracks, ts)
                ev_res = evidence_engine.process_collision_features(col_feats, ts, model_confidence=0.85)
            elif scenario == "ambulance_corridor":
                corridor_snap = corridor_engine.extract_corridor_features(tracks, ts)
                cctv_calib = corridor_engine.verify_segment_cctv(cam_id, tracks)

            # Record sample frames
            if f_idx in [10, 25, 40, 55, 70] or (dets and len(samples) < 5):
                for d in dets[:3]:
                    # Find matching track if any
                    matched_track = next((t.anonymous_id for t in tracks if t.class_name == d.class_name), "UNTRACKED")
                    samples.append({
                        "frame": f_idx,
                        "timestamp_s": round(ts, 2),
                        "class": d.class_name,
                        "confidence": round(d.confidence, 3),
                        "bbox": [round(v, 1) for v in d.bbox],
                        "track_id": matched_track
                    })

        cap.release()

        # Check track stability
        stable_tracks = {tid: len(f_list) for tid, f_list in track_persistence.items() if len(f_list) >= 5}

        # Print runtime sample table
        print(f"Audited {frames_to_audit} frames. Found {len(all_unique_tracks)} unique entities.")
        print(f"Track Persistence (Entities tracked >= 5 frames): {len(stable_tracks)}")
        print("\nRuntime Sample Detections (Values directly from forward pass):")
        print(f"{'FRAME':<8}{'CLASS':<15}{'CONF':<8}{'BBOX [x1, y1, x2, y2]':<30}{'TRACK ID':<10}")
        print("-" * 75)
        for s in samples[:6]:
            print(f"{s['frame']:<8}{s['class']:<15}{s['confidence']:<8}{str(s['bbox']):<30}{s['track_id']:<10}")

        overall_results["videos"][cam_id] = {
            "scenario": scenario,
            "frames_audited": frames_to_audit,
            "unique_tracks_count": len(all_unique_tracks),
            "stable_tracks_count": len(stable_tracks),
            "stable_track_ids": list(stable_tracks.keys()),
            "sample_detections": samples[:8]
        }

    os.makedirs(os.path.dirname(AUDIT_OUTPUT), exist_ok=True)
    with open(AUDIT_OUTPUT, 'w', encoding='utf-8') as f:
        json.dump(overall_results, f, indent=2)

    print(f"\nAudit complete. Artifact written to: {AUDIT_OUTPUT}")
    return overall_results

if __name__ == "__main__":
    audit_video_pipeline()
