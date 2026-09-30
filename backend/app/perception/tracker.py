"""
AEGIS GRID - Perception Layer: Multi-Object Tracker
Implements persistent temporal tracking, motion history, velocity vectors,
and anonymous privacy-preserving identifiers.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import math
import numpy as np
from app.models.event import DataProvenance
from app.perception.detector import DetectionResult

class TrackedEntity:
    """
    State of a tracked entity across a temporal observation window.
    Maintains kinematics, velocity vectors, trajectory history, and stationary duration.
    """
    def __init__(
        self,
        track_id: int,
        detection: DetectionResult,
        frame_idx: int,
        timestamp: float
    ):
        self.track_id = track_id
        self.class_id = detection.class_id
        self.class_name = detection.class_name
        self.domain_type = detection.domain_type
        self.confidence = detection.confidence
        self.provenance = detection.provenance

        # Privacy-Preserving Ephemeral Anonymous Identifier
        prefix = "V" if self.domain_type == "vehicle" else ("P" if self.domain_type == "pedestrian" else "BAG")
        self.anonymous_id = f"{prefix}-{track_id:03d}"

        # Temporal History
        self.bbox_history: List[tuple[float, float, float, float]] = [detection.bbox]
        self.centroid_history: List[tuple[float, float]] = [detection.centroid]
        self.frame_history: List[int] = [frame_idx]
        self.timestamp_history: List[float] = [timestamp]

        # Kinematics
        self.vx: float = 0.0  # pixels / frame
        self.vy: float = 0.0
        self.speed: float = 0.0  # pixels / frame
        self.acceleration: float = 0.0  # change in speed per frame
        self.stationary_frames: int = 0
        self.stationary_duration_s: float = 0.0
        self.age: int = 1
        self.time_since_update: int = 0

    @property
    def current_bbox(self) -> tuple[float, float, float, float]:
        return self.bbox_history[-1]

    @property
    def current_centroid(self) -> tuple[float, float]:
        return self.centroid_history[-1]

    @property
    def width(self) -> float:
        box = self.current_bbox
        return box[2] - box[0]

    @property
    def height(self) -> float:
        box = self.current_bbox
        return box[3] - box[1]

    def update(self, detection: DetectionResult, frame_idx: int, timestamp: float, fps: float = 30.0):
        self.confidence = 0.8 * self.confidence + 0.2 * detection.confidence
        self.bbox_history.append(detection.bbox)
        self.centroid_history.append(detection.centroid)
        self.frame_history.append(frame_idx)
        self.timestamp_history.append(timestamp)

        # Retain last 90 frames of history (3 seconds) to manage memory
        if len(self.bbox_history) > 90:
            self.bbox_history = self.bbox_history[-90:]
            self.centroid_history = self.centroid_history[-90:]
            self.frame_history = self.frame_history[-90:]
            self.timestamp_history = self.timestamp_history[-90:]

        self.age += 1
        self.time_since_update = 0

        # Compute instantaneous velocity over last 3 frames for stability
        if len(self.centroid_history) >= 2:
            prev_cx, prev_cy = self.centroid_history[-2]
            curr_cx, curr_cy = self.centroid_history[-1]
            dx = curr_cx - prev_cx
            dy = curr_cy - prev_cy
            new_speed = math.hypot(dx, dy)

            # Acceleration = change in speed
            self.acceleration = new_speed - self.speed
            self.vx = dx
            self.vy = dy
            self.speed = new_speed

            # Stationary evaluation (threshold: less than 1.8 pixels/frame movement)
            if self.speed < 1.8:
                self.stationary_frames += 1
            else:
                # Slowly decay stationary frames if minor jitter occurs
                self.stationary_frames = max(0, self.stationary_frames - 2)

            self.stationary_duration_s = self.stationary_frames / max(1.0, fps)

    def mark_missed(self):
        self.time_since_update += 1

    def to_dict(self) -> Dict[str, Any]:
        return {
            "track_id": self.track_id,
            "anonymous_id": self.anonymous_id,
            "class_name": self.class_name,
            "domain_type": self.domain_type,
            "confidence": round(self.confidence, 3),
            "current_bbox": [round(v, 1) for v in self.current_bbox],
            "current_centroid": [round(v, 1) for v in self.current_centroid],
            "speed_px_per_frame": round(self.speed, 2),
            "acceleration_px_per_frame2": round(self.acceleration, 2),
            "stationary_duration_s": round(self.stationary_duration_s, 2),
            "age_frames": self.age,
            "provenance": self.provenance.value
        }


class BaseTracker(ABC):
    """Abstract Base Class for multi-object trackers."""

    @abstractmethod
    def update(
        self,
        detections: List[DetectionResult],
        frame_idx: int,
        timestamp: float
    ) -> List[TrackedEntity]:
        """Associate detections with tracks and return active entities."""
        pass


def compute_iou(boxA: tuple, boxB: tuple) -> float:
    """Compute Intersection over Union between two (x1, y1, x2, y2) boxes."""
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])

    inter_w = max(0.0, xB - xA)
    inter_h = max(0.0, yB - yA)
    inter_area = inter_w * inter_h

    boxA_area = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
    boxB_area = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1])
    union_area = boxA_area + boxB_area - inter_area

    if union_area <= 0:
        return 0.0
    return inter_area / union_area


class HighPrecisionByteTracker(BaseTracker):
    """
    High-Precision Two-Stage Multi-Object Association Tracker (ByteTrack philosophy).
    Stage 1: Associates high-confidence detections with existing tracks via spatial IoU.
    Stage 2: Associates remaining unconfirmed detections with lost tracks.
    Maintains persistent IDs across occlusion and temporal gaps.
    """

    def __init__(
        self,
        fps: float = 30.0,
        iou_threshold: float = 0.30,
        max_lost_frames: int = 30
    ):
        self.fps = fps
        self.iou_threshold = iou_threshold
        self.max_lost_frames = max_lost_frames
        self.next_id = 1
        self.tracks: Dict[int, TrackedEntity] = {}

    def update(
        self,
        detections: List[DetectionResult],
        frame_idx: int,
        timestamp: float
    ) -> List[TrackedEntity]:
        # Filter detections into high and low confidence groups
        high_dets = [d for d in detections if d.confidence >= 0.40]
        low_dets = [d for d in detections if 0.15 <= d.confidence < 0.40]

        matched_track_ids = set()
        matched_det_indices = set()

        active_track_ids = list(self.tracks.keys())

        # Stage 1: Match existing tracks with high-confidence detections
        if active_track_ids and high_dets:
            # Build IoU cost matrix
            iou_matrix = np.zeros((len(active_track_ids), len(high_dets)))
            for i, tid in enumerate(active_track_ids):
                track_box = self.tracks[tid].current_bbox
                for j, det in enumerate(high_dets):
                    iou_matrix[i, j] = compute_iou(track_box, det.bbox)

            # Greedy Hungarian-style matching
            while True:
                max_val = np.max(iou_matrix)
                if max_val < self.iou_threshold:
                    break
                i, j = np.unravel_index(np.argmax(iou_matrix), iou_matrix.shape)
                tid = active_track_ids[i]
                self.tracks[tid].update(high_dets[j], frame_idx, timestamp, self.fps)
                matched_track_ids.add(tid)
                matched_det_indices.add(j)
                iou_matrix[i, :] = -1.0
                iou_matrix[:, j] = -1.0

        # Stage 2: Match remaining unassigned tracks with low-confidence detections
        unmatched_track_ids = [tid for tid in active_track_ids if tid not in matched_track_ids]
        if unmatched_track_ids and low_dets:
            iou_matrix_low = np.zeros((len(unmatched_track_ids), len(low_dets)))
            for i, tid in enumerate(unmatched_track_ids):
                track_box = self.tracks[tid].current_bbox
                for j, det in enumerate(low_dets):
                    iou_matrix_low[i, j] = compute_iou(track_box, det.bbox)

            while True:
                max_val = np.max(iou_matrix_low)
                if max_val < 0.20:
                    break
                i, j = np.unravel_index(np.argmax(iou_matrix_low), iou_matrix_low.shape)
                tid = unmatched_track_ids[i]
                self.tracks[tid].update(low_dets[j], frame_idx, timestamp, self.fps)
                matched_track_ids.add(tid)
                iou_matrix_low[i, :] = -1.0
                iou_matrix_low[:, j] = -1.0

        # Create new tracks for unmatched high-confidence detections
        for j, det in enumerate(high_dets):
            if j not in matched_det_indices:
                new_track = TrackedEntity(self.next_id, det, frame_idx, timestamp)
                self.tracks[self.next_id] = new_track
                matched_track_ids.add(self.next_id)
                self.next_id += 1

        # Mark missed tracks and prune expired ones
        expired_ids = []
        for tid, track in self.tracks.items():
            if tid not in matched_track_ids:
                track.mark_missed()
                if track.time_since_update > self.max_lost_frames:
                    expired_ids.append(tid)

        for tid in expired_ids:
            del self.tracks[tid]

        # Return tracks that were updated or seen recently
        return [t for t in self.tracks.values() if t.time_since_update <= 3]
