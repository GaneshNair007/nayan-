# AEGIS GRID — Computer Vision & Temporal Perception Pipeline

## 1. Pipeline Architecture Overview

AEGIS GRID abandons mock dashboards and predetermined timers in favor of a genuine, end-to-end Computer Vision perception pipeline executing on local hardware acceleration (NVIDIA RTX 4050 Laptop GPU, CUDA:0).

```
CCTV MP4 VIDEO STREAM (data/demo/)
             │
             ▼
      OpenCV Frame Decoder (30 FPS, 1280x720)
             │
             ▼
   YOLOv8n Detector Adapter (CUDA:0, FP16 Half Precision)
   • Domain mappings: Vehicles (cars, buses, trucks, motorcycles),
     Pedestrians (person), Baggage (backpacks, suitcases, handbags)
             │
             ▼
   High-Precision ByteTrack Association
   • Two-stage spatial IoU tracking across occlusions
   • Anonymous privacy-preserving identifiers: V-001, P-042, BAG-017
   • Velocity vectors (vx, vy), acceleration (px/frame²), stationary duration (s)
             │
             ▼
   Temporal Feature Extraction Engine (Multi-Signal Kinematics)
   ├─ Collision Analysis: Trajectory convergence rate, abrupt deceleration, proximity
   ├─ Crowd Dynamics: Density surge rate (%/s), directional coherence / dispersal
   ├─ Baggage Association: Person-luggage distance, owner departure, stationary time
   └─ Sensor Health: Laplacian blur variance, frame MSE freeze detection
             │
             ▼
   Evidence Engine (Multi-Signal Accumulation & Gating)
   • Decouples Model Confidence (instantaneous perception) from Evidence Score (hypothesis)
   • Decouples Verification State from Response State
             │
             ▼
   Verification State Machine
   OBSERVED ──► SUSPECTED ──► VERIFYING ──► CONFIRMED (or FALSE_ALARM)
             │
             ▼
   FastAPI REST API & WebSocket Event Pipeline (/api/videos, /ws/events)
             │
             ▼
   AEGIS GRID Operator Command Center (HTML5 Canvas Overlays & Tactical Drawer)
```

---

## 2. Component Specifications

### 2.1 Object Detection (`app/perception/detector.py`)
- **Model**: Ultralytics YOLOv8n (`yolov8n.pt`).
- **Device**: `cuda:0` with automatic FP16 half-precision tensor execution.
- **Measured Latency**: ~25.6 ms per frame on 1280x720 video (~39.0 FPS throughput).
- **Domain Mapping**:
  - `vehicle`: COCO classes `[2, 3, 5, 7]` (`car`, `motorcycle`, `bus`, `truck`).
  - `pedestrian`: COCO class `[0]` (`person`).
  - `baggage`: COCO classes `[24, 26, 28]` (`backpack`, `handbag`, `suitcase`).

### 2.2 Tracking & Kinematics (`app/perception/tracker.py`)
- **Algorithm**: ByteTrack two-stage association.
  - Stage 1: Matches active tracks against high-confidence detections ($\ge 0.40$) using spatial IoU.
  - Stage 2: Matches unassociated tracks against low-confidence detections ($0.15 \le \text{conf} < 0.40$).
- **Privacy Preservation**: Assigns strictly anonymous, ephemeral identifiers (`V-xxx`, `P-xxx`, `BAG-xxx`). No facial recognition, license plate recognition, or biometric identification is ever performed.
- **Kinematic Estimation**: Calculates instantaneous velocity $(v_x, v_y)$, speed $v = \sqrt{v_x^2 + v_y^2}$, acceleration $a = \Delta v / \Delta t$, and accumulated stationary duration.

### 2.3 Temporal Feature Extraction (`app/perception/temporal_engine.py`)
1. **Collision Detection**:
   - **Trajectory Convergence**: Evaluates whether distance between opposing vehicle trajectories is diminishing over a rolling 10-frame window with convergence rate $> 2.0$ px/frame.
   - **Abrupt Deceleration**: Measures whether maximum deceleration $|\min(0, a)| > 4.0$ px/frame².
   - **Spatial Proximity**: Evaluates overlapping bounding boxes ($\text{IoU} > 0.05$) or centroid distance $< 1.2 \times \text{combined vehicle width}$.
   - **Post-Event Stoppage**: Tracks whether both conflicting vehicles remain stationary ($> 2.5$ seconds) at the impact centroid.
2. **Crowd Dynamics**:
   - Computes rolling person count over a 15-second window.
   - Measures density growth rate $\Delta c / \Delta t \times 100\%$. Flags `RAPID_INCREASE` when rate $> +15\%$/s and `RAPID_DISPERSAL` when rate $< -20\%$/s.
   - Calculates circular variance of movement angles: $\text{Var} = 1 - R$. Flags directional surge if $\text{Var} < 0.25$ and rapid dispersal if $\text{Var} > 0.85$.
3. **Unattended Baggage**:
   - Establishes temporary association when a pedestrian centroid is within 80 pixels of an unowned bag.
   - Tracks spatial separation when owner departs. Flags `unattended_detected` when luggage stationary duration $\ge 4.0$ seconds and owner separation $> 140$ pixels.
4. **Camera Health**:
   - **Blur**: Variance of Laplacian $\sigma^2(\nabla^2 I)$. Values $< 45.0$ indicate degraded optical focus.
   - **Freeze**: Mean Squared Error against previous grayscale frame. MSE $< 0.8$ over 90 consecutive frames triggers `FROZEN` status.
   - **Blackout**: Proportion of pixels with intensity $< 15$. Values $> 80\%$ trigger `OFFLINE`.

---

## 3. Evidence Engine & State Decoupling (`app/perception/evidence_engine.py`)

### 3.1 Four Separated Concepts
1. **Model Confidence**: Instantaneous neural network detection probability (0.0 to 1.0).
2. **Evidence Score**: Multi-signal accumulated temporal hypothesis support (0.0 to 1.0).
3. **Severity**: Physical urban disruption scale (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
4. **Priority Tier**: Resource dispatch queue ranking (`P1`, `P2`, `P3`, `P4`).

### 3.2 Dual State Machines
- **Verification Lifecycle**: `OBSERVED` $\rightarrow$ `SUSPECTED` $\rightarrow$ `VERIFYING` $\rightarrow$ `CONFIRMED` $\rightarrow$ `FALSE_ALARM`.
- **Response Lifecycle**: `UNACKNOWLEDGED` $\rightarrow$ `ACKNOWLEDGED` $\rightarrow$ `RESPONSE_PROPOSED` $\rightarrow$ `AUTHORIZED` $\rightarrow$ `DISPATCHED` $\rightarrow$ `ARRIVED` $\rightarrow$ `CONTAINED` $\rightarrow$ `CLOSED`.
