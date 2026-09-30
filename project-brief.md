# AEGIS GRID — Project Brief

## Vision
AEGIS GRID is a real-time urban incident and mobility intelligence platform for the PS06 hackathon. It converts simulated CCTV observations into verified incidents, prioritized response, adaptive traffic recommendations, emergency dispatch, and a SUMO-backed green-corridor demonstration.

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
- Ambulance green corridor across multiple junctions.
- SUMO/TraCI digital-twin scenario.
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
