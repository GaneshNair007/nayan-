# AEGIS GRID — Project Brief

## Vision
AEGIS GRID / NAYAN is a real-time urban incident and mobility intelligence platform for the PS06 hackathon. It converts simulated CCTV observations into verified incidents, prioritized response, and adaptive traffic recommendations.

### The NAYAN India-Specific Dynamic Corridor Model
In India, we cannot assume perfect lane discipline or a permanent emergency lane. So NAYAN creates a Dynamic Emergency Yield Corridor. We divide the road into small spatial grids, detect every vehicle and the actually available road space, then calculate how traffic can compress locally to create a temporary 3–3.5 m ambulance corridor. Upstream signals stop new traffic from entering, junctions are pre-cleared, and each road segment is verified by CCTV before the ambulance reaches it. If one segment cannot create enough clearance, NAYAN dynamically reroutes the ambulance instead of blindly forcing the same corridor.

## Core product promise
Detect the event, verify it, understand its impact, coordinate the response, and explain every decision.

## Scope
### P0: must work
- Simulated CCTV feeds and uploaded video.
- Object detection/tracking with privacy-preserving anonymous IDs.
- Temporal verification for collision, crowd anomaly, and unattended baggage.
- Confidence, severity, false-alarm reduction, incident queue, map, alerts, and command centre.

### P1: differentiators
- Adaptive signal recommendations.
- Emergency-resource dispatch.
- **NAYAN Dynamic Corridor**: Grid-based spatial slicing and lateral compression.
- **Dynamic Rerouting**: Real-time pathing when minimum clearance (3.0m) fails.
- SUMO/TraCI digital-twin scenario (India-specific heterogeneous traffic).
- Multi-camera event association and incident evidence capsule.

### P2: optional
- Near-miss detection, congestion forecasting, camera health, what-if mode, privacy masking, report export.

### P3: defer
- Face recognition, licence-plate recognition, real-world signal control, reinforcement learning, 3D city, chatbot, custom foundation model.

## Golden demo
1. Normal city dashboard.
2. Collision appears on CAM-04.
3. System moves from POSSIBLE to VERIFYING to CONFIRMED using multiple evidence signals.
4. Map focuses on the incident and shows blocked lanes and severity.
5. Traffic pressure changes; controller proposes a safe signal adjustment.
6. AMB-03 is selected and dispatched.
7. Three junctions prepare a timed green corridor.
8. SUMO compares fixed timing with adaptive timing using actual simulation output.
9. Incident evidence and response timeline are exportable.

## Safety boundary
Computer vision produces observations. A decision engine proposes actions. Safety constraints validate them. The hackathon controller changes only a simulation or explicitly labelled demo state; never connect to live infrastructure.

## Truthfulness
Do not invent metrics. Clearly label staged videos, simulated traffic, synthetic incidents, and estimated values. Every alert must show its evidence.
