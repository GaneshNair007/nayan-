"""
NAYAN Golden Demo Verification Script
Validates CAM-03 (Emergency Vehicle / Ambulance) and CAM-04 (Collision / Obstruction)
using the active fine-tuned best.pt model on CUDA, ByteTrack anonymous tracking,
and calibrated camera homography for emergency corridor clearance.
"""
import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))
import cv2
import json
import time
import hashlib
import torch
import numpy as np
from app.perception.detector import YOLOv8DetectorAdapter
from app.perception.tracker import HighPrecisionByteTracker
from app.perception.corridor_engine import DynamicCorridorEngine
from app.perception.calibration import DEMO_CALIBRATIONS

DEMO_VIDEOS = {
    "CAM-03": "data/demo/cam03_ambulance.mp4",
    "CAM-04": "data/demo/cam04_collision.mp4"
}

OUTPUT_FILE = os.path.abspath("artifacts/evaluation/golden_demo_verification.json")

def get_file_sha256(filepath: str) -> str:
    hasher = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()

def run_golden_demo():
    print("=" * 70)
    print("NAYAN GOLDEN DEMO VERIFICATION — CAM-03 (AMBULANCE) & CAM-04 (COLLISION)")
    print("=" * 70)

    # 1. Initialize detector with active trained weights
    model_path = os.path.abspath("artifacts/models/nayan_india/best.pt")
    assert os.path.exists(model_path), f"Trained checkpoint {model_path} does not exist!"

    model_sha = get_file_sha256(model_path)
    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    print(f"Active Model Path:   {model_path}")
    print(f"Active Model SHA256: {model_sha}")
    print(f"Device:              {device}")

    detector = YOLOv8DetectorAdapter(model_path=model_path, conf_threshold=0.25, device=device)
    corridor_engine = DynamicCorridorEngine(grid_width_px=640, grid_height_px=480)

    demo_results = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "model_path": model_path,
        "model_sha256": model_sha,
        "cuda_device": device,
        "gpu_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "N/A",
        "cameras": {}
    }

    for cam_id, rel_vpath in DEMO_VIDEOS.items():
        vpath = os.path.abspath(rel_vpath)
        print(f"\n--- Processing {cam_id}: {vpath} ---")
        assert os.path.exists(vpath), f"Video {vpath} not found!"

        cap = cv2.VideoCapture(vpath)
        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        tracker = HighPrecisionByteTracker(fps=fps, max_lost_frames=30)

        frame_records = []
        unique_track_ids = set()
        ambulance_detected = False
        ambulance_track_ids = []

        # Process first 60 frames (2 seconds of high-fidelity analysis)
        frames_to_process = min(60, total_frames)
        for frame_idx in range(frames_to_process):
            ret, frame = cap.read()
            if not ret or frame is None:
                break

            ts = frame_idx / fps
            # 1. Real CUDA Detection
            detections = detector.detect(frame)

            # 2. Real ByteTrack Tracking
            tracks = tracker.update(detections, frame_idx=frame_idx, timestamp=ts)

            # 3. Corridor Analysis
            corridor_snap = corridor_engine.extract_corridor_features(tracks, ts)
            cctv_verification = corridor_engine.verify_segment_cctv(cam_id, tracks)

            for t in tracks:
                unique_track_ids.add(t.anonymous_id)
                if t.domain_type == "ambulance":
                    ambulance_detected = True
                    if t.anonymous_id not in ambulance_track_ids:
                        ambulance_track_ids.append(t.anonymous_id)

            if frame_idx % 15 == 0 or frame_idx == frames_to_process - 1:
                frame_records.append({
                    "frame_idx": frame_idx,
                    "timestamp_s": round(ts, 2),
                    "detections_count": len(detections),
                    "detected_classes": [d.class_name for d in detections],
                    "active_tracks": [t.anonymous_id for t in tracks],
                    "corridor_feasibility": corridor_snap.feasibility_score,
                    "corridor_action": corridor_snap.recommended_action,
                    "cctv_clearance_state": cctv_verification["traffic_compression_state"],
                    "clearance_width_meters": cctv_verification.get("clearance_width_meters"),
                    "calibrated": cctv_verification["calibrated"]
                })

        cap.release()

        demo_results["cameras"][cam_id] = {
            "video_path": rel_vpath,
            "total_frames_audited": frames_to_process,
            "unique_track_ids": sorted(list(unique_track_ids)),
            "ambulance_detected": ambulance_detected,
            "ambulance_track_ids": ambulance_track_ids,
            "calibrated_homography": cam_id in DEMO_CALIBRATIONS,
            "frame_samples": frame_records
        }

        print(f"Results for {cam_id}:")
        print(f"  Tracks Generated:    {len(unique_track_ids)} tracks: {sorted(list(unique_track_ids))[:8]}")
        print(f"  Ambulance Detected:  {ambulance_detected} (IDs: {ambulance_track_ids})")
        print(f"  Calibrated Camera:   {cam_id in DEMO_CALIBRATIONS}")

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(demo_results, f, indent=2)

    print(f"\nGolden Demo Verification Artifact Written: {OUTPUT_FILE}")
    return demo_results

if __name__ == "__main__":
    run_golden_demo()
