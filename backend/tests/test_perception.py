import pytest
import numpy as np
from fastapi.testclient import TestClient
from app.main import app
from app.perception.detector import DetectionResult
from app.perception.tracker import HighPrecisionByteTracker, TrackedEntity
from app.perception.temporal_engine import (
    TemporalFeatureEngine,
    CollisionFeatureSnapshot,
    CrowdFeatureSnapshot,
    BaggageFeatureSnapshot,
    CameraHealthSnapshot
)
from app.perception.evidence_engine import EvidenceEngine
from app.models.incident import VerificationState, IncidentLocation

client = TestClient(app)

# ------------------------------------------------------------------------------
# TRACKER UNIT TESTS
# ------------------------------------------------------------------------------

def test_tracker_anonymous_id_and_kinematics():
    """Verify tracker assigns privacy-compliant anonymous IDs and calculates velocity/acceleration."""
    tracker = HighPrecisionByteTracker(max_lost_frames=5)
    
    # Frame 0: Vehicle detected at (100, 100, 150, 150)
    det1 = [DetectionResult(
        class_id=2,
        class_name="car",
        confidence=0.88,
        bbox=(100.0, 100.0, 150.0, 150.0),
        domain_type="vehicle"
    )]
    tracks1 = tracker.update(det1, frame_idx=0, timestamp=0.0)
    assert len(tracks1) == 1
    t1 = tracks1[0]
    assert t1.anonymous_id.startswith("V-")
    assert t1.domain_type == "vehicle"
    assert t1.speed == 0.0
    
    # Frame 1: Vehicle moves to (110, 100, 160, 150) -> displacement (10, 0)
    det2 = [DetectionResult(
        class_id=2,
        class_name="car",
        confidence=0.91,
        bbox=(110.0, 100.0, 160.0, 150.0),
        domain_type="vehicle"
    )]
    tracks2 = tracker.update(det2, frame_idx=1, timestamp=0.033)
    assert len(tracks2) == 1
    t2 = tracks2[0]
    assert t2.track_id == t1.track_id
    assert t2.speed > 0.0
    assert t2.stationary_duration_s == 0.0

def test_tracker_pedestrian_and_baggage_ids():
    """Verify distinct anonymous prefixes P-xxx and BAG-xxx."""
    tracker = HighPrecisionByteTracker()
    
    dets = [
        DetectionResult(class_id=0, class_name="person", confidence=0.85, bbox=(50.0, 50.0, 80.0, 150.0), domain_type="pedestrian"),
        DetectionResult(class_id=24, class_name="backpack", confidence=0.80, bbox=(85.0, 120.0, 105.0, 145.0), domain_type="baggage")
    ]
    tracks = tracker.update(dets, frame_idx=0, timestamp=0.0)
    assert len(tracks) == 2
    types = {t.domain_type: t.anonymous_id for t in tracks}
    assert types["pedestrian"].startswith("P-")
    assert types["baggage"].startswith("BAG-")

def test_tracker_stationary_duration():
    """Verify stationary duration accumulates when entity displacement is below threshold."""
    tracker = HighPrecisionByteTracker()
    
    # Send 15 frames at exact same position
    for i in range(15):
        t = i * 0.1
        dets = [DetectionResult(class_id=2, class_name="car", confidence=0.9, bbox=(200.0, 200.0, 250.0, 250.0), domain_type="vehicle")]
        tracks = tracker.update(dets, frame_idx=i, timestamp=t)
        
    assert len(tracks) == 1
    assert tracks[0].stationary_duration_s > 0.0

# ------------------------------------------------------------------------------
# TEMPORAL ENGINE TESTS: COLLISION, CROWD, BAGGAGE, HEALTH
# ------------------------------------------------------------------------------

def test_collision_trajectory_convergence():
    """Test convergence and abrupt deceleration detection between two approaching vehicles."""
    engine = TemporalFeatureEngine(fps=30.0)
    
    # Create detections
    d1 = DetectionResult(class_id=2, class_name="car", confidence=0.9, bbox=(200.0, 280.0, 260.0, 320.0), domain_type="vehicle")
    d2 = DetectionResult(class_id=2, class_name="car", confidence=0.9, bbox=(250.0, 280.0, 310.0, 320.0), domain_type="vehicle")
    
    # Track 1
    t1 = TrackedEntity(track_id=1, detection=d1, frame_idx=0, timestamp=0.0)
    t1.anonymous_id = "V-001"
    t1.acceleration = -6.5  # abrupt deceleration
    t1.stationary_duration_s = 2.5
    for k in range(15):
        t1.centroid_history.append((100.0 + k * 8.0, 300.0))
    
    # Track 2
    t2 = TrackedEntity(track_id=2, detection=d2, frame_idx=0, timestamp=0.0)
    t2.anonymous_id = "V-002"
    t2.acceleration = -5.0  # abrupt deceleration
    t2.stationary_duration_s = 2.5
    for k in range(15):
        t2.centroid_history.append((350.0 - k * 8.0, 300.0))
    
    snapshot = engine.extract_collision_features(tracks=[t1, t2], timestamp=2.0)
    
    assert snapshot.abrupt_speed_reduction is True
    assert snapshot.trajectory_convergence is True
    assert snapshot.post_event_stationary_duration_s >= 2.0
    assert snapshot.confidence_score >= 0.50
    assert "V-001" in snapshot.involved_track_ids
    assert "V-002" in snapshot.involved_track_ids

def test_crowd_density_surge_and_coherence():
    """Test crowd surge rate calculation and directional coherence."""
    engine = TemporalFeatureEngine(fps=30.0)
    
    # Initial state: 3 pedestrians
    peds1 = []
    for i in range(3):
        d = DetectionResult(class_id=0, class_name="person", confidence=0.85, bbox=(100.0 + i*30, 200.0, 130.0 + i*30, 300.0), domain_type="pedestrian")
        p = TrackedEntity(track_id=i+1, detection=d, frame_idx=0, timestamp=0.0)
        peds1.append(p)
    engine.extract_crowd_features(peds1, timestamp=0.0)
    
    # 2 seconds later: 15 pedestrians moving east with high alignment
    peds2 = []
    for i in range(15):
        d = DetectionResult(class_id=0, class_name="person", confidence=0.85, bbox=(50.0 + i*20, 200.0, 80.0 + i*20, 300.0), domain_type="pedestrian")
        p = TrackedEntity(track_id=i+1, detection=d, frame_idx=60, timestamp=2.0)
        p.speed = 5.0
        p.vx = 5.0
        p.vy = 0.2
        peds2.append(p)
    
    f2 = engine.extract_crowd_features(peds2, timestamp=2.0)
    assert f2.person_count == 15
    assert f2.growth_rate_pct_per_sec > 15.0
    assert f2.density_trend == "RAPID_INCREASE"
    assert f2.directional_convergence is True

def test_unattended_baggage_separation():
    """Test person-baggage association and separation distance measurement."""
    engine = TemporalFeatureEngine(fps=30.0)
    
    # t=0: person next to bag (distance ~ 30px)
    dp0 = DetectionResult(class_id=0, class_name="person", confidence=0.9, bbox=(100.0, 100.0, 140.0, 220.0), domain_type="pedestrian")
    p0 = TrackedEntity(track_id=1, detection=dp0, frame_idx=0, timestamp=0.0)
    
    db0 = DetectionResult(class_id=24, class_name="suitcase", confidence=0.85, bbox=(130.0, 180.0, 170.0, 220.0), domain_type="baggage")
    b0 = TrackedEntity(track_id=2, detection=db0, frame_idx=0, timestamp=0.0)
    
    engine.extract_baggage_features(tracks=[p0, b0], timestamp=0.0)
    
    # t=5.0: person moved far away, bag has been stationary for 5.0s
    dp1 = DetectionResult(class_id=0, class_name="person", confidence=0.9, bbox=(400.0, 100.0, 440.0, 220.0), domain_type="pedestrian")
    p1 = TrackedEntity(track_id=1, detection=dp1, frame_idx=150, timestamp=5.0)
    
    db1 = DetectionResult(class_id=24, class_name="suitcase", confidence=0.85, bbox=(130.0, 180.0, 170.0, 220.0), domain_type="baggage")
    b1 = TrackedEntity(track_id=2, detection=db1, frame_idx=150, timestamp=5.0)
    b1.stationary_duration_s = 5.0
    
    f_sep = engine.extract_baggage_features(tracks=[p1, b1], timestamp=5.0)
    assert f_sep.unattended_detected is True
    assert f_sep.current_separation_distance_px > 140.0
    assert f_sep.stationary_duration_s >= 4.0

def test_camera_health_metrics():
    """Test blur (Laplacian variance) and freeze detection."""
    engine = TemporalFeatureEngine(fps=30.0)
    
    np.random.seed(42)
    sharp_frame = np.random.randint(0, 255, (240, 320, 3), dtype=np.uint8)
    h1 = engine.check_camera_health(sharp_frame, fps=30.0)
    assert h1.blur_score > 50.0
    assert h1.status == "ONLINE"

# ------------------------------------------------------------------------------
# EVIDENCE ENGINE TESTS: CONFIDENCE VS EVIDENCE SCORE & STATE TRANSITIONS
# ------------------------------------------------------------------------------

def test_evidence_engine_collision_verification_lifecycle():
    """Verify evidence engine transitions through OBSERVED -> SUSPECTED -> VERIFYING -> CONFIRMED."""
    loc = IncidentLocation(lat=37.7749, lon=-122.4194, address="Market St & 4th St")
    ev_engine = EvidenceEngine(camera_id="CAM-04", location=loc)
    
    # 1. Partial signals: trajectory convergence only
    snap1 = CollisionFeatureSnapshot()
    snap1.trajectory_convergence = True
    snap1.convergence_rate_px = 12.0
    snap1.involved_track_ids = ["V-001", "V-002"]
    res1 = ev_engine.process_collision_features(snap1, timestamp=1.0, model_confidence=0.85)
    assert res1 is not None
    state1, conf1, score1, ev_items1, reasons1 = res1
    assert state1 == VerificationState.OBSERVED
    assert conf1 == 0.85
    assert score1 == 0.25
    
    # 2. Add abrupt speed reduction
    snap2 = CollisionFeatureSnapshot()
    snap2.trajectory_convergence = True
    snap2.abrupt_speed_reduction = True
    snap2.max_deceleration_px_frame2 = 6.2
    snap2.involved_track_ids = ["V-001", "V-002"]
    res2 = ev_engine.process_collision_features(snap2, timestamp=2.0, model_confidence=0.88)
    state2, conf2, score2, _, _ = res2
    assert state2 == VerificationState.SUSPECTED
    assert score2 == 0.55
    
    # 3. Add spatial overlap and stoppage >= 2.5s -> CONFIRMED
    snap3 = CollisionFeatureSnapshot()
    snap3.trajectory_convergence = True
    snap3.abrupt_speed_reduction = True
    snap3.max_deceleration_px_frame2 = 6.2
    snap3.spatial_overlap_iou = 0.20
    snap3.persistent_proximity_duration_s = 2.5
    snap3.post_event_stationary_duration_s = 3.0
    snap3.involved_track_ids = ["V-001", "V-002"]
    res3 = ev_engine.process_collision_features(snap3, timestamp=5.0, model_confidence=0.90)
    state3, conf3, score3, ev_items3, reasons3 = res3
    assert state3 == VerificationState.CONFIRMED
    assert score3 >= 0.75
    assert len(ev_items3) >= 3

# ------------------------------------------------------------------------------
# API VIDEO CATALOGUE & ENDPOINT TESTS
# ------------------------------------------------------------------------------

def test_api_videos_catalogue():
    """Verify GET /api/videos returns all 8 curated demo feeds with required metadata."""
    response = client.get("/api/videos")
    assert response.status_code == 200
    data = response.json()
    assert "videos" in data
    assert len(data["videos"]) == 8
    
    cam_ids = {v["cameraId"] for v in data["videos"]}
    assert "CAM-01" in cam_ids
    assert "CAM-04" in cam_ids
    assert "CAM-07" in cam_ids
    assert "CAM-11" in cam_ids
    
    for item in data["videos"]:
        assert "cameraId" in item
        assert "file" in item
        assert "purpose" in item
        assert "sourceType" in item
        assert "duration" in item
        assert "provenance" in item
        assert "intendedPipeline" in item

def test_api_video_streaming_endpoint():
    """Verify GET /api/videos/file/{filename} serves raw video for HTML5 playback."""
    response = client.get("/api/videos/file/cam04_collision.mp4")
    assert response.status_code == 200
    assert response.headers["content-type"] == "video/mp4"
    assert len(response.content) > 1000000

def test_api_capabilities_gpu_details():
    """Verify GET /api/capabilities exposes real hardware specs and mode."""
    response = client.get("/api/capabilities")
    assert response.status_code == 200
    caps = response.json()
    assert "gpu" in caps
    assert "vision" in caps
    assert caps["vision"]["mode"] == "video_inference"
    assert "RTX 4050" in caps["gpu"]["name"] or "cuda" in caps["gpu"]["device"]
