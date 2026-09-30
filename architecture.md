# AEGIS GRID — Architecture Specification

## 1. System Flow
Simulated CCTV / Video Ingestion → Perception Adapter → Tracking Adapter → Temporal Evidence Verification → Incident Understanding & Fusion → Severity & Priority Engine → Response Orchestrator → Map / Adaptive Signals / Dynamic Routing / Emergency Dispatch → Audit & Event Timeline.

## 2. Architectural Deployment Rule (Modular Monolith)
The bounded services below are **logical modules inside one unified backend application** for the hackathon implementation. **DO NOT** create independently deployed microservices.

```
Frontend (React + Vite + TypeScript)
  │
  │ REST Snapshots + WebSocket Delta Stream
  ▼
FastAPI Application (Modular Monolith)
  ├── perception (Camera feeds, health, frame ingestion)
  ├── tracking (TrackerAdapter: ByteTrack, FutureTracker)
  ├── incident (VerificationState machine, evidence scoring)
  ├── mobility (Junction state, traffic pressure, signal recommendations)
  ├── response (Resource management, ResponseState machine, green corridor)
  ├── routing (RoutingAdapter: OSRM with deterministic local fallback)
  ├── simulation (Scenario runner, SUMO TraCI adapter & deterministic mock)
  ├── audit (Append-only audit trail with provenance)
  └── realtime (WebSocket connection manager with sequence ordering)
  │
  ▼
SQLite Persistence Layer (Repository Pattern allowing PostgreSQL later)
```

## 3. Data Provenance Model
Every operational measurement displayed by the frontend or processed by the backend must carry an explicit provenance tag.

### Allowed Provenance Values:
- `INFERENCE`: Output produced by a computer vision or ML model.
- `SIMULATOR`: Output calculated by a dynamic simulator (e.g. SUMO).
- `REPLAY_FIXTURE`: Staged, pre-recorded, or ground-truth event data.
- `MOCK`: Synthetic test data or deterministic fallback.
- `ESTIMATE`: Derived heuristic or statistical extrapolation.
- `USER_INPUT`: Action or parameter supplied by the human operator.

*Rule: If a value is unavailable, display `N/A`. Never silently substitute 0. Mocks and estimates must be visually distinguishable from measured or simulation-derived values.*

## 4. Separation of States
To avoid mixing independent lifecycles, incident verification is strictly decoupled from response coordination:

### VerificationState (Truth Assessment)
- `OBSERVED`: Initial candidate observation detected.
- `SUSPECTED`: Multiple supporting indicators observed across frames.
- `VERIFYING`: Temporal verification window active; testing hypotheses.
- `CONFIRMED`: Evidence threshold passed; confirmed incident.
- `FALSE_ALARM`: Verification failed or rejected by operator.

### ResponseState (Action Lifecycle)
- `UNACKNOWLEDGED`: Incident confirmed, awaiting operator review.
- `ACKNOWLEDGED`: Operator noted the incident.
- `RESPONSE_PROPOSED`: Recommended dispatch/signal plan generated.
- `AUTHORIZED`: Operator approved response plan.
- `DISPATCHED`: Emergency resource en route.
- `ARRIVED`: Emergency resource on scene.
- `CONTAINED`: Incident hazard cleared / traffic recovering.
- `CLOSED`: Event logged and archived.

### ResourceStatus
- `AVAILABLE`, `RESERVED`, `DISPATCHED`, `EN_ROUTE`, `ARRIVED`, `UNAVAILABLE`

### CorridorStatus
- `NOT_PLANNED`, `PLANNED`, `READY`, `ACTIVE`, `COMPLETED`, `FAILED`

## 5. Separation of AI & Assessment Metrics
1. **Model Confidence (0.0 – 1.0)**: How confident the perception model is in an instantaneous visual observation.
2. **Evidence Score (0.0 – 1.0)**: How strongly multiple temporal signals support the incident hypothesis over time.
3. **Severity (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)**: How harmful or disruptive the confirmed event is.
4. **Priority (`P1`, `P2`, `P3`, `P4`)**: How urgently the operator should examine and respond to the event, with an explicit explanation list.

*Non-negotiable rule: High model confidence alone must NEVER confirm an incident. Confirmation requires temporal evidence rules to pass. An unverified incident may be prioritized for operator attention, but it must never trigger automatic dispatch.*

## 6. Deterministic Verification Rules
- **Collision Verification**: Candidate evidence includes rapidly converging trajectories, sudden velocity reduction (> -4.0 m/s²), bounding-box/trajectory intersection, post-event stationary state (> 15s in travel lane), and adjacent lane obstruction. Bounding-box overlap alone never confirms a collision.
- **Crowd Anomaly**: Observable movement patterns only (density spike, growth rate, directional turbulence, dispersal). No intent or criminality inference. Camera-specific calibrated thresholds.
- **Unattended Baggage**: Candidate objects (backpack, handbag, suitcase). Requires object stationary > threshold, previously associated person moves away > distance threshold, separation persists > time threshold. Ephemeral anonymous track IDs only; no biometric data.

## 7. Signal Safety Invariants
Adaptive recommendations may alter green allocation but must **NEVER** bypass configured safety clearance phases:
- `minimumGreen`: 15s
- `maximumGreen`: 90s
- `yellowClearance`: 4s
- `allRedClearance`: 2s
- **Incompatible Phase Invariant**: Never jump directly between conflicting green phases. All phase transitions must cycle through yellow and all-red clearance.

## 8. SUMO vs. Mock Digital Twin Behavior
Three explicit simulation modes:
1. `SUMO`: Live microscopic simulation via TraCI.
2. `MOCK`: Deterministic fixture benchmark (clearly labelled: *"DIGITAL TWIN MOCKED DEMONSTRATION — deterministic fixture results, not live SUMO"*).
3. `UNAVAILABLE`: Simulation service offline.

## 9. Realtime Event Envelope & Recovery
All WebSocket events conform to:
```json
{
  "id": "evt-uuid",
  "schemaVersion": 1,
  "sequence": 142,
  "type": "incident.updated",
  "occurredAt": "2026-09-30T11:45:00.000Z",
  "source": "incident-engine",
  "scenarioId": "collision-golden-demo",
  "correlationId": "INC-2026-001",
  "provenance": "REPLAY_FIXTURE",
  "demo": true,
  "payload": {}
}
```

### Recovery Protocol:
- **REST** provides authoritative state snapshots.
- **WebSocket** provides incremental delta events.
- On disconnect/reconnect: client fetches `/api/incidents` and `/api/junctions`, verifies snapshot `sequence`, and applies subsequent events.
- Telemetry freshness is reported (e.g. `STREAM ● Connected • Last event: 0.8s ago` vs `DATA STALE`).

## 10. Complete REST API Baseline
- `GET /api/health`
- `GET /api/capabilities`
- `GET /api/cameras`
- `GET /api/cameras/{camera_id}`
- `GET /api/cameras/{camera_id}/detections`
- `POST /api/videos/analyze`
- `GET /api/incidents`
- `GET /api/incidents/{incident_id}`
- `POST /api/incidents/{incident_id}/acknowledge`
- `POST /api/incidents/{incident_id}/propose-response`
- `POST /api/incidents/{incident_id}/authorize-response`
- `POST /api/incidents/{incident_id}/dispatch`
- `GET /api/incidents/{incident_id}/audit`
- `GET /api/incidents/{incident_id}/export`
- `GET /api/junctions`
- `GET /api/junctions/{junction_id}`
- `POST /api/junctions/{junction_id}/signal-recommendation`
- `GET /api/resources`
- `POST /api/corridors/plan`
- `POST /api/corridors/{corridor_id}/activate`
- `GET /api/simulations/scenarios`
- `POST /api/simulations/run`
- `GET /api/simulations/{simulation_id}`
- `GET /api/demo/scenarios`
- `POST /api/demo/scenarios/{scenario}/start`
- `POST /api/demo/pause`
- `POST /api/demo/step`
- `POST /api/demo/reset`
- `GET /api/audit`
- `WS /ws/events`
