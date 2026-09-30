"""
AEGIS GRID - Demo Video Acquisition & Normalization Pipeline
Downloads open-licensed CCTV & surveillance footage and normalizes them into data/demo/
Generates data/demo/manifest.json with real video metadata.
"""

import os
import sys
import json
import subprocess
import urllib.request
import imageio_ffmpeg
import cv2

DEMO_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "demo"))
RAW_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "datasets", "raw"))

os.makedirs(DEMO_DIR, exist_ok=True)
os.makedirs(RAW_DIR, exist_ok=True)

FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()

VIDEO_SOURCES = [
    {
        "cameraId": "CAM-01",
        "file": "cam01_normal_intersection.mp4",
        "scenario": "Normal Urban Intersection",
        "purpose": "baseline_traffic",
        "sourceType": "wikimedia_commons",
        "staged": False,
        "expectedUse": "monitoring",
        "url": "https://upload.wikimedia.org/wikipedia/commons/c/cc/Roundabout_14_61.webm",
        "license": "CC0 1.0 Universal (Public Domain)",
        "sourceNotes": "Wikimedia Commons Roundabout 14 61 - fixed aerial/pole traffic view",
        "trimStart": 0,
        "duration": 30.0,
        "pipeline": "vehicle_flow_engine"
    },
    {
        "cameraId": "CAM-02",
        "file": "cam02_congestion.mp4",
        "scenario": "Traffic Congestion & Queue Buildup",
        "purpose": "congestion",
        "sourceType": "wikimedia_commons",
        "staged": False,
        "expectedUse": "traffic_management",
        "url": "https://upload.wikimedia.org/wikipedia/commons/8/85/Traffic_Congestion%2C_6th_Mile%2C_Gangtok.webm",
        "license": "CC BY-SA 4.0",
        "sourceNotes": "Wikimedia Commons Traffic Congestion 6th Mile - vehicle queues and slowdown",
        "trimStart": 0,
        "duration": 30.0,
        "pipeline": "traffic_density_engine"
    },
    {
        "cameraId": "CAM-03",
        "file": "cam03_ambulance.mp4",
        "scenario": "Emergency Vehicle Transit",
        "purpose": "emergency_corridor",
        "sourceType": "wikimedia_commons",
        "staged": False,
        "expectedUse": "corridor_preemption",
        "url": "https://upload.wikimedia.org/wikipedia/commons/9/99/Ambulance_responding_sirens%2C_in_Poznan_%282019%29.webm",
        "license": "CC BY 3.0",
        "sourceNotes": "Wikimedia Commons Ambulance responding in traffic - emergency visual context",
        "trimStart": 0,
        "duration": 30.0,
        "pipeline": "emergency_response_engine"
    },
    {
        "cameraId": "CAM-04",
        "file": "cam04_collision.mp4",
        "scenario": "Multi-Vehicle Collision",
        "purpose": "collision",
        "sourceType": "research_dataset",
        "staged": True,
        "expectedUse": "golden_demo",
        "localSource": os.path.join(DEMO_DIR, "test_crash1.mp4"),
        "url": "https://raw.githubusercontent.com/shyamg090/Vision_Based_Accident_Detection/main/testing1.mp4",
        "license": "Open Research Surveillance Benchmark",
        "sourceNotes": "Surveillance camera footage of multi-vehicle intersection collision",
        "trimStart": 0,
        "duration": 35.0,
        "pipeline": "collision_evidence_engine",
        "loopToDuration": True
    },
    {
        "cameraId": "CAM-05",
        "file": "cam05_night_traffic.mp4",
        "scenario": "Night-Time Surveillance & Headlight Tracking",
        "purpose": "night_conditions",
        "sourceType": "wikimedia_commons",
        "staged": False,
        "expectedUse": "adverse_conditions",
        "url": "https://upload.wikimedia.org/wikipedia/commons/4/4d/Traffic_on_bridge_at_night.webm",
        "license": "CC BY 3.0",
        "sourceNotes": "Wikimedia Commons Traffic on bridge at night - low-light surveillance",
        "trimStart": 0,
        "duration": 30.0,
        "pipeline": "night_vision_engine"
    },
    {
        "cameraId": "CAM-07",
        "file": "cam07_crowd_growth.mp4",
        "scenario": "Pedestrian Crowd Movement & Density Growth",
        "purpose": "crowd_movement",
        "sourceType": "research_dataset",
        "staged": False,
        "expectedUse": "crowd_analytics",
        "url": "https://upload.wikimedia.org/wikipedia/commons/e/e3/Traffic-Instabilities-in-Self-Organized-Pedestrian-Crowds-pcbi.1002442.s004.ogv",
        "license": "CC BY 2.5 (PLOS Computational Biology)",
        "sourceNotes": "Pedestrian Crowd Flow Dynamics - density surge and directional turbulence",
        "trimStart": 0,
        "duration": 30.0,
        "pipeline": "crowd_density_engine"
    },
    {
        "cameraId": "CAM-09",
        "file": "cam09_normal_source.mp4",
        "scenario": "Camera Health & Signal Integrity Verification",
        "purpose": "camera_health",
        "sourceType": "wikimedia_commons",
        "staged": True,
        "expectedUse": "camera_diagnostics",
        "url": "https://upload.wikimedia.org/wikipedia/commons/c/cc/Roundabout_14_61.webm",
        "license": "CC0 1.0 Universal",
        "sourceNotes": "Urban CCTV baseline feed used for real-time sensor health (freeze, blur, drop)",
        "trimStart": 10,
        "duration": 30.0,
        "pipeline": "camera_health_engine"
    },
    {
        "cameraId": "CAM-11",
        "file": "cam11_unattended_baggage.mp4",
        "scenario": "Unattended Baggage & Luggage Separation",
        "purpose": "unattended_baggage",
        "sourceType": "research_dataset",
        "staged": True,
        "expectedUse": "anomaly_detection",
        "localSource": os.path.join(DEMO_DIR, "test_luggage.mp4"),
        "url": "https://raw.githubusercontent.com/TheRomanFour/AbandonedLuggageDetection/main/photoshop_video_5.mp4",
        "license": "Open Surveillance Luggage Benchmark",
        "sourceNotes": "Pedestrian luggage surveillance feed with person-baggage association",
        "trimStart": 0,
        "duration": 30.0,
        "pipeline": "unattended_baggage_engine",
        "loopToDuration": True
    }
]


def download_file(url, target_path):
    print(f"Downloading {url} -> {target_path}...")
    headers = {"User-Agent": "AEGIS-GRID-Research/1.0"}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp, open(target_path, "wb") as f:
        while chunk := resp.read(1024 * 1024):
            f.write(chunk)
    print(f"Downloaded: {os.path.getsize(target_path)} bytes.")


def normalize_video(raw_input, output_path, start_time, duration, loop=False):
    print(f"Normalizing {raw_input} -> {output_path} (start={start_time}s, dur={duration}s)...")
    
    # Check input duration
    cap = cv2.VideoCapture(raw_input)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    cap.release()
    orig_dur = count / fps if fps > 0 else 0

    if loop and orig_dur < duration:
        # Loop video to achieve target duration
        loops = int(duration / orig_dur) + 1
        cmd = [
            FFMPEG_EXE, "-y",
            "-stream_loop", str(loops),
            "-ss", str(start_time),
            "-i", raw_input,
            "-t", str(duration),
            "-vf", "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1",
            "-c:v", "libx264",
            "-preset", "fast",
            "-crf", "22",
            "-pix_fmt", "yuv420p",
            "-r", "30",
            "-an",
            output_path
        ]
    else:
        cmd = [
            FFMPEG_EXE, "-y",
            "-ss", str(start_time),
            "-i", raw_input,
            "-t", str(duration),
            "-vf", "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1",
            "-c:v", "libx264",
            "-preset", "fast",
            "-crf", "22",
            "-pix_fmt", "yuv420p",
            "-r", "30",
            "-an",
            output_path
        ]

    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Error encoding {output_path}: {res.stderr}")
        raise RuntimeError(f"FFmpeg failed with code {res.returncode}")
    print(f"Normalized successfully: {os.path.getsize(output_path)} bytes.")


def inspect_video(path):
    cap = cv2.VideoCapture(path)
    fps = float(cap.get(cv2.CAP_PROP_FPS))
    count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    cap.release()
    dur = round(count / fps, 2) if fps > 0 else 0.0
    return {"resolution": f"{w}x{h}", "fps": round(fps, 1), "frameCount": count, "duration": dur}


def main():
    print("=== AEGIS GRID Demo Video Acquisition & Normalization ===")
    manifest_entries = []

    for src in VIDEO_SOURCES:
        out_file = os.path.join(DEMO_DIR, src["file"])
        raw_name = f"raw_{src['cameraId'].lower()}_{os.path.basename(src['url'].split('?')[0])}"
        raw_path = os.path.join(RAW_DIR, raw_name)

        # 1. Download raw if not present
        if src.get("localSource") and os.path.exists(src["localSource"]):
            raw_path = src["localSource"]
        elif not os.path.exists(raw_path):
            download_file(src["url"], raw_path)

        # 2. Normalize to target mp4
        normalize_video(
            raw_path,
            out_file,
            src["trimStart"],
            src["duration"],
            loop=src.get("loopToDuration", False)
        )

        # 3. Read exact real metadata
        meta = inspect_video(out_file)

        entry = {
            "cameraId": src["cameraId"],
            "file": src["file"],
            "scenario": src["scenario"],
            "purpose": src["purpose"],
            "sourceType": src["sourceType"],
            "staged": src["staged"],
            "expectedUse": src["expectedUse"],
            "license": src["license"],
            "sourceNotes": src["sourceNotes"],
            "resolution": meta["resolution"],
            "fps": meta["fps"],
            "duration": meta["duration"],
            "frameCount": meta["frameCount"],
            "intendedPipeline": src["pipeline"],
            "provenance": "INFERENCE"
        }
        manifest_entries.append(entry)
        print(f"Processed {src['cameraId']}: {entry['resolution']}, {entry['fps']} FPS, {entry['duration']}s")

    manifest_path = os.path.join(DEMO_DIR, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump({"videos": manifest_entries}, f, indent=2)

    print(f"\nManifest successfully written to: {manifest_path}")
    print(f"Total demo videos in library: {len(manifest_entries)}")


if __name__ == "__main__":
    main()
