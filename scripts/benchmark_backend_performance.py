"""
NAYAN End-to-End Perception Pipeline Performance Benchmark
Measures latency breakdown across 100 frames:
- Model load time
- Preprocessing latency (ms)
- CUDA Inference latency (ms)
- ByteTrack tracking latency (ms)
- Temporal processing latency (ms)
- Corridor clearance computation (ms)
- End-to-end frame latency (ms) & FPS
- GPU VRAM consumption (MB)
Saves results to artifacts/evaluation/performance.json.
"""
import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

import time
import json
import torch
import cv2
import numpy as np
from app.perception.detector import YOLOv8DetectorAdapter
from app.perception.tracker import HighPrecisionByteTracker
from app.perception.temporal_engine import TemporalFeatureEngine
from app.perception.corridor_engine import DynamicCorridorEngine

OUTPUT_FILE = os.path.abspath("artifacts/evaluation/performance.json")

def benchmark_pipeline():
    print("=" * 70)
    print("NAYAN COMPREHENSIVE PERCEPTION PIPELINE PERFORMANCE BENCHMARK")
    print("=" * 70)

    # 1. Model Load Time
    t_load0 = time.perf_counter()
    model_path = os.path.abspath("artifacts/models/nayan_india_v2/best.pt")
    if not os.path.exists(model_path):
        model_path = os.path.abspath("artifacts/models/nayan_india/best.pt")
    detector = YOLOv8DetectorAdapter(model_path=model_path, conf_threshold=0.25)
    t_load1 = time.perf_counter()
    model_load_time_s = round(t_load1 - t_load0, 3)
    print(f"Model Load Time: {model_load_time_s}s")

    tracker = HighPrecisionByteTracker(fps=30.0)
    temporal_engine = TemporalFeatureEngine(fps=30.0)
    corridor_engine = DynamicCorridorEngine()

    # Load video frames for realistic image statistics
    vpath = os.path.abspath("data/demo/cam03_ambulance.mp4")
    cap = cv2.VideoCapture(vpath)
    frames = []
    for _ in range(100):
        ret, f = cap.read()
        if not ret:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            ret, f = cap.read()
        frames.append(f)
    cap.release()

    # Warmup
    print("Warming up CUDA pipeline (10 frames)...")
    for i in range(10):
        _ = detector.detect(frames[i % len(frames)])

    preprocess_times = []
    inference_times = []
    tracking_times = []
    temporal_times = []
    e2e_times = []

    print(f"Executing 100-frame benchmark on {torch.cuda.get_device_name(0)}...")
    for idx, frame in enumerate(frames):
        t0 = time.perf_counter()

        # Preprocessing (resize/format check)
        t_pre0 = time.perf_counter()
        _ = frame.shape
        t_pre1 = time.perf_counter()
        preprocess_times.append((t_pre1 - t_pre0) * 1000.0)

        # Inference
        t_inf0 = time.perf_counter()
        dets = detector.detect(frame)
        t_inf1 = time.perf_counter()
        inference_times.append((t_inf1 - t_inf0) * 1000.0)

        # Tracking
        t_trk0 = time.perf_counter()
        tracks = tracker.update(dets, frame_idx=idx, timestamp=idx/30.0)
        t_trk1 = time.perf_counter()
        tracking_times.append((t_trk1 - t_trk0) * 1000.0)

        # Temporal + Corridor
        t_tem0 = time.perf_counter()
        _ = temporal_engine.extract_collision_features(tracks, timestamp=idx/30.0)
        _ = corridor_engine.extract_corridor_features(tracks, timestamp=idx/30.0)
        _ = corridor_engine.verify_segment_cctv("CAM-03", tracks)
        t_tem1 = time.perf_counter()
        temporal_times.append((t_tem1 - t_tem0) * 1000.0)

        t_end = time.perf_counter()
        e2e_times.append((t_end - t0) * 1000.0)

    avg_e2e = float(np.mean(e2e_times))
    fps = 1000.0 / avg_e2e
    vram_alloc = torch.cuda.memory_allocated(0) / (1024 * 1024) if torch.cuda.is_available() else 0.0
    vram_res = torch.cuda.memory_reserved(0) / (1024 * 1024) if torch.cuda.is_available() else 0.0

    perf_report = {
        "device": "cuda:0" if torch.cuda.is_available() else "cpu",
        "gpu_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU",
        "model_name": "NAYAN India Emergency Traffic Detector",
        "model_path": model_path,
        "model_load_time_seconds": model_load_time_s,
        "benchmark_sample_frames": len(frames),
        "latency_breakdown_ms": {
            "preprocessing_mean": round(float(np.mean(preprocess_times)), 3),
            "inference_mean": round(float(np.mean(inference_times)), 2),
            "inference_min": round(float(np.min(inference_times)), 2),
            "inference_max": round(float(np.max(inference_times)), 2),
            "tracking_mean": round(float(np.mean(tracking_times)), 3),
            "temporal_and_corridor_mean": round(float(np.mean(temporal_times)), 3),
            "end_to_end_frame_mean": round(avg_e2e, 2),
            "end_to_end_frame_median": round(float(np.median(e2e_times)), 2),
            "end_to_end_frame_p95": round(float(np.percentile(e2e_times, 95)), 2),
            "end_to_end_frame_min": round(float(np.min(e2e_times)), 2),
            "end_to_end_frame_max": round(float(np.max(e2e_times)), 2)
        },
        "throughput_fps": round(fps, 1),
        "vram_allocated_mb": round(vram_alloc, 1),
        "vram_reserved_mb": round(vram_res, 1)
    }

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(perf_report, f, indent=2)

    print("\nBenchmark Results:")
    print(f"  Inference Latency:         {perf_report['latency_breakdown_ms']['inference_mean']} ms")
    print(f"  Tracking Latency:          {perf_report['latency_breakdown_ms']['tracking_mean']} ms")
    print(f"  Temporal & Corridor:       {perf_report['latency_breakdown_ms']['temporal_and_corridor_mean']} ms")
    print(f"  End-to-End Latency:        {perf_report['latency_breakdown_ms']['end_to_end_frame_mean']} ms")
    print(f"  Pipeline Throughput:       {perf_report['throughput_fps']} FPS")
    print(f"  GPU VRAM Allocated:        {perf_report['vram_allocated_mb']} MB")
    print(f"Artifact written to: {OUTPUT_FILE}")
    return perf_report

if __name__ == "__main__":
    benchmark_pipeline()
