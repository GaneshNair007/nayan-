"""
AEGIS GRID - Perception Pipeline Orchestrator
Executes the full end-to-end computer vision analysis:
Frame Decoding -> YOLOv8 (CUDA) -> ByteTrack -> Temporal Features -> Evidence Fusion -> Incident State -> WebSocket Broadcast
"""

import os
import time
import asyncio
import threading
from typing import Dict, Any, Optional, List
import cv2
import numpy as np

from app.models.incident import (
    Incident,
    IncidentType,
    IncidentSeverity,
    VerificationState,
    ResponseState,
    IncidentLocation
)
from app.models.camera import Camera, CameraStatus, BoundingBox, Detection, Track
from app.models.event import DataProvenance, EventEnvelope
from app.perception.detector import YOLOv8DetectorAdapter, DetectionResult
from app.perception.tracker import HighPrecisionByteTracker, TrackedEntity
from app.perception.temporal_engine import TemporalFeatureEngine
from app.perception.evidence_engine import EvidenceEngine
from app.perception.corridor_engine import DynamicCorridorEngine
from app.database import db
from app.services.incident import IncidentService

class VideoAnalysisJob:
    """Represents an active or completed background video analysis job."""
    def __init__(self, camera_id: str, video_path: str, loop_video: bool = True):
        self.camera_id = camera_id
        self.video_path = video_path
        self.loop_video = loop_video
        self.is_running = False
        self.stop_requested = False
        
        # Real-time metrics
        self.current_frame_idx = 0
        self.total_frames_processed = 0
        self.fps = 0.0
        self.inference_latency_ms = 0.0
        self.active_tracks_count = 0
        self.active_detections_count = 0
        self.last_hardware_info: Dict[str, Any] = {}
        self.last_processed_tracks: List[Dict[str, Any]] = []
        self.active_incident_id: Optional[str] = None
        self.latest_evidence_score: float = 0.0
        self.latest_verification_state: str = "OBSERVED"
        self.latest_corridor_action: str = "PROCEED_NORMAL"
        self.latest_segment_clearance: float = 12.0
        self.latest_segment_compression: str = "FLOWING"


class PerceptionPipelineManager:
    """
    Singleton manager running real computer vision inference jobs in worker threads
    and dispatching state updates to database and WebSocket clients.
    """
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(PerceptionPipelineManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        self.active_jobs: Dict[str, VideoAnalysisJob] = {}
        self.worker_threads: Dict[str, threading.Thread] = {}
        
        # Shared detector instance on CUDA for efficient VRAM utilization
        print("Initializing AEGIS GRID YOLOv8 CUDA Detector...")
        self.detector = YOLOv8DetectorAdapter(conf_threshold=0.25)
        print("Perception Pipeline Manager initialized on:", self.detector.get_hardware_info()["gpu_name"])

    @property
    def jobs(self) -> Dict[str, VideoAnalysisJob]:
        return self.active_jobs

    def start_job(self, camera_id: str, video_path: str, loop_video: bool = True) -> VideoAnalysisJob:
        """Start a real video analysis background processing job."""
        if camera_id in self.active_jobs and self.active_jobs[camera_id].is_running:
            print(f"Job for {camera_id} is already running.")
            return self.active_jobs[camera_id]

        if not os.path.isabs(video_path):
            video_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", video_path))

        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video file not found: {video_path}")

        job = VideoAnalysisJob(camera_id, video_path, loop_video=loop_video)
        self.active_jobs[camera_id] = job

        # Launch worker thread
        t = threading.Thread(target=self._run_job_worker, args=(job,), daemon=True)
        self.worker_threads[camera_id] = t
        t.start()
        return job

    def stop_job(self, camera_id: str):
        """Request graceful stop of an analysis job."""
        if camera_id in self.active_jobs:
            self.active_jobs[camera_id].stop_requested = True

    def get_job_status(self, camera_id: str) -> Optional[Dict[str, Any]]:
        job = self.active_jobs.get(camera_id)
        if not job:
            return None
        return {
            "camera_id": job.camera_id,
            "video_path": os.path.basename(job.video_path),
            "is_running": job.is_running,
            "frame_idx": job.current_frame_idx,
            "total_frames": job.total_frames_processed,
            "fps": round(job.fps, 1),
            "latency_ms": round(job.inference_latency_ms, 1),
            "detections_count": job.active_detections_count,
            "tracks_count": job.active_tracks_count,
            "hardware": job.last_hardware_info,
            "verification_state": job.latest_verification_state,
            "evidence_score": round(job.latest_evidence_score, 2),
            "active_incident_id": job.active_incident_id,
            "corridor_action": job.latest_corridor_action,
            "segment_clearance": job.latest_segment_clearance,
            "segment_compression": job.latest_segment_compression
        }

    def get_active_tracks(self, camera_id: str) -> List[Dict[str, Any]]:
        job = self.active_jobs.get(camera_id)
        if not job:
            return []
        return job.last_processed_tracks

    def _run_job_worker(self, job: VideoAnalysisJob):
        """Worker thread executing continuous frame decoding, detection, and tracking."""
        job.is_running = True
        camera_id = job.camera_id
        print(f"[Perception] Starting live inference worker for {camera_id} on {job.video_path}...")

        # Initialize dedicated tracker and temporal engines
        tracker = HighPrecisionByteTracker(fps=30.0)
        temporal_engine = TemporalFeatureEngine(fps=30.0)
        
        # Get camera location from database
        cam_model = db.get_camera(camera_id)
        cam_location = IncidentLocation(
            lat=cam_model.location.lat if cam_model else 37.7749,
            lon=cam_model.location.lon if cam_model else -122.4194,
            address=cam_model.location.address if cam_model else "Urban Sector",
            junction_id=cam_model.location.junction_id if cam_model else None
        )
        evidence_engine = EvidenceEngine(camera_id, cam_location)
        corridor_engine = DynamicCorridorEngine()

        cap = cv2.VideoCapture(job.video_path)
        video_fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        frame_interval_s = 1.0 / max(10.0, video_fps)

        t_start = time.perf_counter()
        frames_in_second = 0
        last_fps_calc = time.perf_counter()

        try:
            while not job.stop_requested:
                loop_start = time.perf_counter()
                ret, frame = cap.read()
                
                if not ret:
                    if job.loop_video:
                        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                        job.current_frame_idx = 0
                        continue
                    else:
                        break

                job.current_frame_idx += 1
                job.total_frames_processed += 1
                curr_timestamp = job.current_frame_idx / video_fps

                # 1. Real Object Detection (CUDA FP16)
                t_det0 = time.perf_counter()
                detections = self.detector.detect(frame)
                t_det1 = time.perf_counter()
                job.inference_latency_ms = (t_det1 - t_det0) * 1000.0
                job.active_detections_count = len(detections)

                # 2. Multi-Object Tracking
                active_tracks = tracker.update(detections, job.current_frame_idx, curr_timestamp)
                job.active_tracks_count = len(active_tracks)
                job.last_processed_tracks = [t.to_dict() for t in active_tracks]

                # Update camera detection count in DB
                db.update_camera_status(
                    camera_id,
                    status=CameraStatus.ACTIVE,
                    health_score=1.0,
                    detections_count=len(detections)
                )

                # 3. Temporal Kinematic & Scene Features
                collision_features = temporal_engine.extract_collision_features(active_tracks, curr_timestamp)
                crowd_features = temporal_engine.extract_crowd_features(active_tracks, curr_timestamp)
                baggage_features = temporal_engine.extract_baggage_features(active_tracks, curr_timestamp)

                # Periodic Camera Health Check (every 15 frames)
                if job.current_frame_idx % 15 == 0:
                    health = temporal_engine.check_camera_health(frame, job.fps)
                    if health.status == "DEGRADED":
                        db.update_camera_status(camera_id, status=CameraStatus.DEGRADED, health_score=0.60)
                    elif health.status == "FROZEN":
                        db.update_camera_status(camera_id, status=CameraStatus.DEGRADED, health_score=0.30)

                # NAYAN - Dynamic Emergency Yield Corridor extraction
                corridor_features = corridor_engine.extract_corridor_features(active_tracks, curr_timestamp)
                if corridor_features.ambulance_track_id:
                    job.latest_corridor_action = corridor_features.recommended_action

                # NAYAN - Real-Time CCTV Segment Verification
                cctv_verification = corridor_engine.verify_segment_cctv(camera_id, active_tracks)
                job.latest_segment_clearance = cctv_verification["clearance_width_meters"]
                job.latest_segment_compression = cctv_verification["traffic_compression_state"]

                # 4. Multi-Signal Evidence Fusion & State Machine Transitions
                mean_model_conf = float(np.mean([d.confidence for d in detections])) if detections else 0.50

                # Evaluator selection based purely on active kinematic/feature signals
                if collision_features.confidence_score > 0.20 or (len(collision_features.involved_track_ids) >= 2 and collision_features.confidence_score > 0.10):
                    ev_result = evidence_engine.process_collision_features(collision_features, curr_timestamp, mean_model_conf)
                    inc_type = IncidentType.COLLISION
                    title = "Multi-Vehicle Traffic Collision"
                    desc = "Real-time collision verified via trajectory convergence, rapid deceleration, and persistent stoppage."
                elif crowd_features.person_count > 4 or crowd_features.density_growth_rate > 15.0:
                    ev_result = evidence_engine.process_crowd_features(crowd_features, curr_timestamp, mean_model_conf)
                    inc_type = IncidentType.CROWD_ANOMALY
                    title = "Rapid Crowd Density Surge"
                    desc = "Pedestrian flow anomaly detected: abnormal concentration and directional turbulence."
                elif baggage_features.unattended_detected or baggage_features.stationary_duration_s > 2.0:
                    ev_result = evidence_engine.process_baggage_features(baggage_features, curr_timestamp, mean_model_conf)
                    inc_type = IncidentType.UNATTENDED_BAGGAGE
                    title = "Unattended Luggage Anomaly"
                    desc = "Stationary luggage detected with associated owner departure beyond safe spatial threshold."
                else:
                    ev_result = None

                if ev_result:
                    state, m_conf, ev_score, ev_items, reasons = ev_result
                    job.latest_verification_state = state.value
                    job.latest_evidence_score = ev_score

                    # Create or update Incident in Database
                    inc_id = f"INC-{camera_id}-LIVE"
                    job.active_incident_id = inc_id

                    # Determine operational severity dynamically from verification state and incident type
                    if inc_type == IncidentType.COLLISION:
                        sev = IncidentSeverity.CRITICAL if state == VerificationState.CONFIRMED else (
                            IncidentSeverity.HIGH if state == VerificationState.VERIFYING else IncidentSeverity.MEDIUM
                        )
                    else:
                        sev = IncidentSeverity.HIGH if state == VerificationState.CONFIRMED else IncidentSeverity.MEDIUM

                    # Calculate deterministic priority tier and score using verified IncidentService formula
                    p_tier, p_score, calc_reasons = IncidentService.calculate_priority(
                        severity=sev,
                        evidence_score=ev_score,
                        estimated_people_affected=max(1, len(active_tracks)),
                        affected_lanes_count=2 if inc_type == IncidentType.COLLISION else 0,
                        evidence_count=len(ev_items),
                        emergency_involved=False
                    )
                    combined_reasons = reasons + [r for r in calc_reasons if r not in reasons]

                    existing_inc = db.get_incident(inc_id)
                    current_resp_state = existing_inc.response_state if existing_inc else ResponseState.UNACKNOWLEDGED

                    incident_obj = Incident(
                        id=inc_id,
                        type=inc_type,
                        camera_id=camera_id,
                        location=cam_location,
                        verification_state=state,
                        response_state=current_resp_state,
                        model_confidence=round(m_conf, 3),
                        evidence_score=round(ev_score, 3),
                        severity=sev,
                        priority_tier=p_tier,
                        priority_score=p_score,
                        priority_reasons=reasons,
                        title=title,
                        description=desc,
                        affected_lanes=["Lane 1", "Lane 2"] if inc_type == IncidentType.COLLISION else [],
                        estimated_people_affected=len(active_tracks),
                        provenance=DataProvenance.INFERENCE,
                        evidence=ev_items,
                        state_history=evidence_engine.state_history
                    )
                    db.create_or_update_incident(incident_obj)

                    # Trigger automated corridor suggestion when collision is confirmed
                    if state == VerificationState.CONFIRMED and inc_type == IncidentType.COLLISION and current_resp_state == ResponseState.UNACKNOWLEDGED:
                        db.update_incident_response_state(
                            inc_id,
                            ResponseState.RESPONSE_PROPOSED,
                            reason="Automated emergency mobility corridor generated for confirmed collision"
                        )

                # 5. Measure FPS
                frames_in_second += 1
                now = time.perf_counter()
                if now - last_fps_calc >= 1.0:
                    job.fps = frames_in_second / (now - last_fps_calc)
                    frames_in_second = 0
                    last_fps_calc = now

                job.last_hardware_info = self.detector.get_hardware_info()

                # Sleep slightly to match realistic video stream pacing if running faster than real-time
                elapsed = time.perf_counter() - loop_start
                if elapsed < frame_interval_s:
                    time.sleep(frame_interval_s - elapsed)

        except Exception as e:
            print(f"[Perception] Error in analysis worker for {camera_id}: {e}")
        finally:
            cap.release()
            job.is_running = False
            print(f"[Perception] Analysis worker for {camera_id} stopped. Total frames: {job.total_frames_processed}")


# Global Singleton Pipeline Manager
perception_manager = PerceptionPipelineManager()
