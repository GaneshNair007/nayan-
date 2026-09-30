"""
Perception and Tracking Service with TrackerAdapter Pattern
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from app.models.camera import Camera, CameraStatus, Detection, BoundingBox, Track
from app.models.event import DataProvenance
from app.database import db

class TrackerAdapter(ABC):
    """
    Abstract adapter for multi-object tracking.
    Enables swapping ByteTrack, BoT-SORT, or synthetic replay adapters.
    """
    @abstractmethod
    def track_objects(self, camera_id: str, raw_detections: List[Detection]) -> List[Track]:
        pass

class ByteTrackAdapter(TrackerAdapter):
    """
    Lightweight tracker adapter maintaining ephemeral anonymous IDs across frames.
    """
    def track_objects(self, camera_id: str, raw_detections: List[Detection]) -> List[Track]:
        tracks = []
        for det in raw_detections:
            tracks.append(
                Track(
                    track_id=f"trk-{det.anonymous_id.lower()}",
                    anonymous_id=det.anonymous_id,
                    class_name=det.class_name,
                    history=[det.bbox],
                    current_speed_kmh=det.speed_estimate_kmh or 0.0,
                    stationary_duration_s=det.stationary_duration_s or 0.0,
                    provenance=det.provenance
                )
            )
        return tracks

class PerceptionService:
    tracker: TrackerAdapter = ByteTrackAdapter()

    @staticmethod
    def get_all_cameras() -> List[Camera]:
        return list(db.cameras.values())

    @staticmethod
    def get_camera(camera_id: str) -> Camera:
        if camera_id not in db.cameras:
            raise KeyError(f"Camera {camera_id} not found")
        return db.cameras[camera_id]

    @staticmethod
    def update_camera_status(camera_id: str, status: CameraStatus, health_score: float) -> Camera:
        cam = PerceptionService.get_camera(camera_id)
        prev_status = cam.status.value
        cam.status = status
        cam.health_score = max(0.0, min(1.0, health_score))
        cam.last_ping = datetime.now(timezone.utc).isoformat()
        db.cameras[camera_id] = cam

        db.log_audit(
            action=f"Camera {camera_id} status updated to {status.value}",
            entity_type="CAMERA",
            entity_id=camera_id,
            previous_state=prev_status,
            next_state=status.value,
            reason="Telemetry health check or network ping state",
            source="perception-engine",
            provenance=DataProvenance.INFERENCE,
            details={"health_score": health_score}
        )
        return cam

    @staticmethod
    def generate_simulated_detections(camera_id: str) -> List[Detection]:
        """
        Generates privacy-preserving, anonymous detections for demonstration.
        Labels provenance explicitly as REPLAY_FIXTURE.
        """
        now_iso = datetime.now(timezone.utc).isoformat()

        if camera_id == "CAM-04":
            # Golden Demo Collision Feed: Vehicles OBJ-104 and OBJ-105
            return [
                Detection(
                    id="det-104",
                    camera_id="CAM-04",
                    timestamp=now_iso,
                    anonymous_id="OBJ-104",
                    class_name="vehicle",
                    confidence=0.94,
                    bbox=BoundingBox(x=320.0, y=240.0, width=80.0, height=50.0),
                    speed_estimate_kmh=0.0,
                    stationary_duration_s=42.0,
                    provenance=DataProvenance.REPLAY_FIXTURE
                ),
                Detection(
                    id="det-105",
                    camera_id="CAM-04",
                    timestamp=now_iso,
                    anonymous_id="OBJ-105",
                    class_name="vehicle",
                    confidence=0.91,
                    bbox=BoundingBox(x=390.0, y=245.0, width=75.0, height=48.0),
                    speed_estimate_kmh=0.0,
                    stationary_duration_s=42.0,
                    provenance=DataProvenance.REPLAY_FIXTURE
                )
            ]
        elif camera_id == "CAM-05":
            # Crowd Anomaly Feed: High density cluster
            dets = []
            for i in range(1, 35):
                dets.append(
                    Detection(
                        id=f"det-crowd-{i}",
                        camera_id="CAM-05",
                        timestamp=now_iso,
                        anonymous_id=f"OBJ-2{i:02d}",
                        class_name="pedestrian",
                        confidence=0.88,
                        bbox=BoundingBox(x=100.0 + (i*10), y=150.0 + (i*5), width=20.0, height=40.0),
                        speed_estimate_kmh=1.2,
                        stationary_duration_s=15.0,
                        provenance=DataProvenance.REPLAY_FIXTURE
                    )
                )
            return dets
        elif camera_id == "CAM-06":
            # Unattended Baggage Feed: Stationary object OBJ-309 separated from associated person
            return [
                Detection(
                    id="det-309",
                    camera_id="CAM-06",
                    timestamp=now_iso,
                    anonymous_id="OBJ-309",
                    class_name="baggage",
                    confidence=0.89,
                    bbox=BoundingBox(x=500.0, y=380.0, width=30.0, height=25.0),
                    speed_estimate_kmh=0.0,
                    stationary_duration_s=180.0,
                    provenance=DataProvenance.REPLAY_FIXTURE
                )
            ]
        else:
            return [
                Detection(
                    id=f"det-norm-{camera_id}-1",
                    camera_id=camera_id,
                    timestamp=now_iso,
                    anonymous_id=f"OBJ-{camera_id}-01",
                    class_name="vehicle",
                    confidence=0.95,
                    bbox=BoundingBox(x=150.0, y=200.0, width=70.0, height=45.0),
                    speed_estimate_kmh=38.0,
                    stationary_duration_s=0.0,
                    provenance=DataProvenance.REPLAY_FIXTURE
                )
            ]
