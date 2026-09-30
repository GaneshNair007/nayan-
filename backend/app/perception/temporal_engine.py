"""
AEGIS GRID - Perception Layer: Temporal Feature Engine
Extracts multi-frame kinematic and spatial signals:
- Vehicle Collision: trajectory convergence, deceleration, persistent proximity, post-event stoppage
- Crowd Analytics: person count, density trend, direction coherence, rapid dispersal
- Unattended Baggage: person-baggage association, spatial separation, stationary duration
- Camera Health: frame freeze (MSE), blur (Laplacian variance), blackout, decode FPS
"""

from typing import List, Dict, Any, Optional, Tuple
import math
import numpy as np
import cv2
from app.perception.tracker import TrackedEntity, compute_iou

class CollisionFeatureSnapshot:
    """Quantitative features extracted for candidate vehicle collision."""
    def __init__(self):
        self.trajectory_convergence: bool = False
        self.convergence_rate_px: float = 0.0
        self.max_deceleration_px_frame2: float = 0.0
        self.abrupt_speed_reduction: bool = False
        self.spatial_overlap_iou: float = 0.0
        self.persistent_proximity_duration_s: float = 0.0
        self.post_event_stationary_duration_s: float = 0.0
        self.involved_track_ids: List[str] = []
        self.confidence_score: float = 0.0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "trajectory_convergence": self.trajectory_convergence,
            "convergence_rate_px_per_frame": round(self.convergence_rate_px, 2),
            "max_deceleration_px_per_frame2": round(self.max_deceleration_px_frame2, 2),
            "abrupt_speed_reduction": self.abrupt_speed_reduction,
            "spatial_overlap_iou": round(self.spatial_overlap_iou, 3),
            "persistent_proximity_duration_s": round(self.persistent_proximity_duration_s, 2),
            "post_event_stationary_duration_s": round(self.post_event_stationary_duration_s, 2),
            "involved_track_ids": self.involved_track_ids,
            "feature_confidence": round(self.confidence_score, 3)
        }


class CrowdFeatureSnapshot:
    """Quantitative crowd density and movement flow features."""
    def __init__(self):
        self.person_count: int = 0
        self.density_trend: str = "STABLE"  # "STABLE", "RAPID_INCREASE", "RAPID_DISPERSAL"
        self.growth_rate_pct_per_sec: float = 0.0
        self.mean_speed_px: float = 0.0
        self.direction_variance_rad: float = 0.0
        self.directional_convergence: bool = False
        self.rapid_dispersal: bool = False

    def to_dict(self) -> Dict[str, Any]:
        return {
            "person_count": self.person_count,
            "density_trend": self.density_trend,
            "growth_rate_pct_per_sec": round(self.growth_rate_pct_per_sec, 1),
            "mean_speed_px": round(self.mean_speed_px, 2),
            "direction_variance_rad": round(self.direction_variance_rad, 2),
            "directional_convergence": self.directional_convergence,
            "rapid_dispersal": self.rapid_dispersal
        }


class BaggageFeatureSnapshot:
    """Quantitative features for person-baggage association and abandonment."""
    def __init__(self):
        self.unattended_detected: bool = False
        self.baggage_track_id: Optional[str] = None
        self.owner_track_id: Optional[str] = None
        self.current_separation_distance_px: float = 0.0
        self.stationary_duration_s: float = 0.0
        self.owner_departed: bool = False

    def to_dict(self) -> Dict[str, Any]:
        return {
            "unattended_detected": self.unattended_detected,
            "baggage_track_id": self.baggage_track_id,
            "owner_track_id": self.owner_track_id,
            "separation_distance_px": round(self.current_separation_distance_px, 1),
            "stationary_duration_s": round(self.stationary_duration_s, 1),
            "owner_departed": self.owner_departed
        }


class CameraHealthSnapshot:
    """Real-time camera diagnostic metrics."""
    def __init__(self):
        self.status: str = "ONLINE"  # "ONLINE", "DEGRADED", "FROZEN", "OFFLINE"
        self.blur_score: float = 0.0  # Variance of Laplacian
        self.black_frame_pct: float = 0.0
        self.frame_similarity_mse: float = 0.0
        self.frozen: bool = False
        self.decode_fps: float = 0.0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "status": self.status,
            "blur_score": round(self.blur_score, 1),
            "black_frame_pct": round(self.black_frame_pct, 1),
            "frame_similarity_mse": round(self.frame_similarity_mse, 2),
            "frozen": self.frozen,
            "decode_fps": round(self.decode_fps, 1)
        }


class TemporalFeatureEngine:
    """
    Computes mathematical spatio-temporal features over rolling track histories.
    """

    def __init__(self, fps: float = 30.0):
        self.fps = fps
        self.prev_frame_gray: Optional[np.ndarray] = None
        self.frozen_frame_count: int = 0
        
        # Baggage ownership associations: baggage_track_id -> {owner_track_id, min_sep_distance}
        self.baggage_owners: Dict[int, int] = {}
        
        # History of crowd counts: list of (timestamp, count)
        self.crowd_history: List[Tuple[float, int]] = []
        
        # Persistent proximity tracker between pairs of tracks: (idA, idB) -> frames_together
        self.pair_proximity_frames: Dict[Tuple[int, int], int] = {}

    def extract_collision_features(self, tracks: List[TrackedEntity], timestamp: float) -> CollisionFeatureSnapshot:
        """
        Analyze multi-vehicle trajectories for convergence, abrupt deceleration,
        spatial conflict, and post-event stationary states.
        """
        snapshot = CollisionFeatureSnapshot()
        vehicles = [t for t in tracks if t.domain_type == "vehicle"]

        if len(vehicles) < 2:
            return snapshot

        # Check all vehicle pairs for convergence & impact
        best_score = 0.0
        for i in range(len(vehicles)):
            for j in range(i + 1, len(vehicles)):
                v1, v2 = vehicles[i], vehicles[j]
                pair_key = (min(v1.track_id, v2.track_id), max(v1.track_id, v2.track_id))

                # 1. Spatial IoU / Proximity
                iou = compute_iou(v1.current_bbox, v2.current_bbox)
                c1 = v1.current_centroid
                c2 = v2.current_centroid
                dist = math.hypot(c1[0] - c2[0], c1[1] - c2[1])
                avg_size = (v1.width + v2.width + v1.height + v2.height) / 4.0

                # Close proximity threshold (IoU > 0.1 or center distance < combined size)
                is_close = iou > 0.05 or dist < (avg_size * 1.2)
                if is_close:
                    self.pair_proximity_frames[pair_key] = self.pair_proximity_frames.get(pair_key, 0) + 1
                else:
                    self.pair_proximity_frames[pair_key] = max(0, self.pair_proximity_frames.get(pair_key, 0) - 1)

                prox_duration = self.pair_proximity_frames.get(pair_key, 0) / max(1.0, self.fps)

                # 2. Trajectory Convergence (distance decreasing over last 15 frames)
                converging = False
                rate = 0.0
                if len(v1.centroid_history) >= 10 and len(v2.centroid_history) >= 10:
                    past_c1 = v1.centroid_history[-10]
                    past_c2 = v2.centroid_history[-10]
                    past_dist = math.hypot(past_c1[0] - past_c2[0], past_c1[1] - past_c2[1])
                    rate = (past_dist - dist) / 10.0
                    if rate > 2.0 and dist < 250.0:
                        converging = True

                # 3. Abrupt Speed Reduction (deceleration)
                max_decel = max(abs(min(0.0, v1.acceleration)), abs(min(0.0, v2.acceleration)))
                abrupt_decel = max_decel > 4.0  # Deceleration spike > 4 pixels/frame^2

                # 4. Post-Event Stationary State
                stat_dur = min(v1.stationary_duration_s, v2.stationary_duration_s)
                if prox_duration > 1.0 and (v1.stationary_duration_s > 1.5 or v2.stationary_duration_s > 1.5):
                    stat_dur = max(v1.stationary_duration_s, v2.stationary_duration_s)

                # Compute compound collision hypothesis confidence
                score = 0.0
                if converging:
                    score += 0.25
                if abrupt_decel:
                    score += 0.30
                if iou > 0.10 or (is_close and prox_duration > 1.0):
                    score += 0.25
                if stat_dur > 2.0:
                    score += 0.20

                if score > best_score:
                    best_score = score
                    snapshot.trajectory_convergence = converging
                    snapshot.convergence_rate_px = rate
                    snapshot.max_deceleration_px_frame2 = max_decel
                    snapshot.abrupt_speed_reduction = abrupt_decel
                    snapshot.spatial_overlap_iou = iou
                    snapshot.persistent_proximity_duration_s = prox_duration
                    snapshot.post_event_stationary_duration_s = stat_dur
                    snapshot.involved_track_ids = [v1.anonymous_id, v2.anonymous_id]
                    snapshot.confidence_score = min(1.0, score)

        return snapshot

    def extract_crowd_features(self, tracks: List[TrackedEntity], timestamp: float) -> CrowdFeatureSnapshot:
        """
        Analyze pedestrian counts, density changes, and movement vectors.
        """
        snapshot = CrowdFeatureSnapshot()
        pedestrians = [t for t in tracks if t.domain_type == "pedestrian"]
        count = len(pedestrians)
        snapshot.person_count = count

        self.crowd_history.append((timestamp, count))
        # Keep last 15 seconds
        self.crowd_history = [(t, c) for t, c in self.crowd_history if timestamp - t <= 15.0]

        if len(self.crowd_history) >= 2:
            dt = timestamp - self.crowd_history[0][0]
            if dt > 1.0:
                dc = count - self.crowd_history[0][1]
                growth_rate = (dc / max(1, self.crowd_history[0][1])) / dt * 100.0
                snapshot.growth_rate_pct_per_sec = growth_rate
                if growth_rate > 15.0 and count > 8:
                    snapshot.density_trend = "RAPID_INCREASE"
                elif growth_rate < -20.0:
                    snapshot.density_trend = "RAPID_DISPERSAL"

        # Movement vectors & direction coherence
        if count >= 3:
            speeds = [p.speed for p in pedestrians]
            snapshot.mean_speed_px = float(np.mean(speeds))

            angles = []
            for p in pedestrians:
                if p.speed > 1.0:
                    ang = math.atan2(p.vy, p.vx)
                    angles.append(ang)

            if len(angles) >= 3:
                # Circular variance
                sin_sum = sum(math.sin(a) for a in angles)
                cos_sum = sum(math.cos(a) for a in angles)
                R = math.hypot(sin_sum, cos_sum) / len(angles)
                var = 1.0 - R
                snapshot.direction_variance_rad = var

                if var < 0.25 and snapshot.mean_speed_px > 3.0:
                    # Highly directional surge
                    snapshot.directional_convergence = True
                elif var > 0.85 and snapshot.mean_speed_px > 4.5:
                    # High variance + high speed = rapid dispersal
                    snapshot.rapid_dispersal = True

        return snapshot

    def extract_baggage_features(self, tracks: List[TrackedEntity], timestamp: float) -> BaggageFeatureSnapshot:
        """
        Analyze person-baggage associations, spatial separation, and stationary duration.
        """
        snapshot = BaggageFeatureSnapshot()
        persons = [t for t in tracks if t.domain_type == "pedestrian"]
        baggage_items = [t for t in tracks if t.domain_type == "baggage"]

        if not baggage_items:
            return snapshot

        for bag in baggage_items:
            bag_c = bag.current_centroid
            bid = bag.track_id

            # 1. Establish ownership if close to person (within 90 pixels)
            closest_person = None
            min_dist = float("inf")
            for p in persons:
                p_c = p.current_centroid
                d = math.hypot(bag_c[0] - p_c[0], bag_c[1] - p_c[1])
                if d < min_dist:
                    min_dist = d
                    closest_person = p

            # Association threshold: within 80 pixels
            if bid not in self.baggage_owners and closest_person and min_dist < 80.0:
                self.baggage_owners[bid] = closest_person.track_id

            # 2. Check separation from associated owner
            owner_id = self.baggage_owners.get(bid)
            owner_track = next((p for p in persons if p.track_id == owner_id), None)

            if owner_track:
                owner_dist = math.hypot(bag_c[0] - owner_track.current_centroid[0], bag_c[1] - owner_track.current_centroid[1])
            else:
                # Owner is no longer in frame (departed)
                owner_dist = 400.0

            # Unattended condition: baggage stationary > 5s and owner distance > 140px (or left scene)
            if bag.stationary_duration_s >= 4.0 and owner_dist > 140.0:
                snapshot.unattended_detected = True
                snapshot.baggage_track_id = bag.anonymous_id
                snapshot.owner_track_id = f"P-{owner_id:03d}" if owner_id else "UNKNOWN"
                snapshot.current_separation_distance_px = owner_dist
                snapshot.stationary_duration_s = bag.stationary_duration_s
                snapshot.owner_departed = (owner_track is None)
                break

        return snapshot

    def check_camera_health(self, frame: np.ndarray, fps: float) -> CameraHealthSnapshot:
        """
        Perform real-time sensor diagnostics on current decoded video frame.
        """
        snapshot = CameraHealthSnapshot()
        snapshot.decode_fps = fps

        # 1. Convert to grayscale for image metric processing
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # 2. Blur detection via Laplacian variance
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        snapshot.blur_score = float(laplacian_var)

        # 3. Black-frame detection
        black_pixels = np.sum(gray < 15)
        total_pixels = gray.size
        black_pct = (black_pixels / total_pixels) * 100.0
        snapshot.black_frame_pct = float(black_pct)

        # 4. Freeze detection via Mean Squared Error (MSE) against previous frame
        if self.prev_frame_gray is not None and self.prev_frame_gray.shape == gray.shape:
            mse = float(np.mean((gray.astype("float") - self.prev_frame_gray.astype("float")) ** 2))
            snapshot.frame_similarity_mse = mse
            if mse < 0.8:  # Virtually identical frame
                self.frozen_frame_count += 1
            else:
                self.frozen_frame_count = max(0, self.frozen_frame_count - 1)
        else:
            self.frozen_frame_count = 0

        self.prev_frame_gray = gray

        # Determine health status
        if self.frozen_frame_count > int(fps * 3):  # 3 seconds frozen
            snapshot.frozen = True
            snapshot.status = "FROZEN"
        elif black_pct > 80.0:
            snapshot.status = "OFFLINE"
        elif laplacian_var < 45.0:  # Severe blur
            snapshot.status = "DEGRADED"
        else:
            snapshot.status = "ONLINE"

        return snapshot
