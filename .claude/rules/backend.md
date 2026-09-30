# Backend Architectural Rules

1. **Modular Monolith**: Build bounded services as Python modules under `backend/app/services/`:
   - `perception`: Cameras, video ingestion, privacy masking.
   - `tracking`: TrackerAdapter (ByteTrack, mock/future).
   - `incident`: Verification state machine, evidence fusion, priority scoring.
   - `mobility`: Junction status, pressure scoring, adaptive signals.
   - `response`: Resource dispatch, Response state machine, green corridor.
   - `routing`: RoutingAdapter (OSRM with deterministic fallback).
   - `simulation`: Demo runner, SUMO TraCI adapter & deterministic mock.
   - `audit`: Append-only audit log.
   - `websocket`: Realtime manager with incremental sequence counters.
2. **Data Provenance**: Every operational payload must specify `provenance` (`INFERENCE`, `SIMULATOR`, `REPLAY_FIXTURE`, `MOCK`, `ESTIMATE`, `USER_INPUT`).
3. **Decoupled States**:
   - `VerificationState` tracks factual certainty (`OBSERVED` -> `SUSPECTED` -> `VERIFYING` -> `CONFIRMED` or `FALSE_ALARM`).
   - `ResponseState` tracks operational action (`UNACKNOWLEDGED` -> `ACKNOWLEDGED` -> `RESPONSE_PROPOSED` -> `AUTHORIZED` -> `DISPATCHED` -> `ARRIVED` -> `CONTAINED` -> `CLOSED`).
4. **WebSocket Recovery**: Every event must include `sequence`, `schemaVersion`, `scenarioId`, `correlationId`, and `provenance`. REST endpoints serve as authoritative snapshots.
