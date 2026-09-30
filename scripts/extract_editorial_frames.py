"""
Extracts cinematic editorial still frames from NAYAN CCTV demo videos
using OpenCV and saves them to frontend/public/media/nayan/stills/.
"""
import os
import cv2
import json

VIDEOS_DIR = os.path.abspath("data/demo")
OUTPUT_DIR = os.path.abspath("frontend/public/media/nayan/stills")
os.makedirs(OUTPUT_DIR, exist_ok=True)

manifest = []

video_files = [f for f in os.listdir(VIDEOS_DIR) if f.endswith(".mp4")]

for vf in sorted(video_files):
    cam_id = vf.split("_")[0].upper()
    vpath = os.path.join(VIDEOS_DIR, vf)
    cap = cv2.VideoCapture(vpath)
    if not cap.isOpened():
        print(f"Warning: Could not open {vf}")
        continue

    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / fps
    print(f"Processing {vf}: {total_frames} frames ({duration:.1f}s at {fps:.1f} FPS)...")

    # Sample candidate timestamps at 15%, 35%, 55%, 75%
    sample_fractions = [0.15, 0.35, 0.55, 0.75]
    for frac in sample_fractions:
        frame_idx = int(total_frames * frac)
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ret, frame = cap.read()
        if ret:
            sec = frame_idx / fps
            out_filename = f"{cam_id.lower()}_still_{int(sec)}s.webp"
            out_path = os.path.join(OUTPUT_DIR, out_filename)
            # Encode as high-quality WebP
            cv2.imwrite(out_path, frame, [cv2.IMWRITE_WEBP_QUALITY, 92])
            manifest.append({
                "camera_id": cam_id,
                "video_file": vf,
                "frame_index": frame_idx,
                "timestamp_sec": round(sec, 2),
                "still_path": f"/media/nayan/stills/{out_filename}",
                "resolution": f"{frame.shape[1]}x{frame.shape[0]}"
            })

    cap.release()

manifest_path = os.path.join(OUTPUT_DIR, "manifest.json")
with open(manifest_path, "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2)

print(f"Extracted {len(manifest)} editorial frames to {OUTPUT_DIR}")
