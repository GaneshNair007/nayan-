# AEGIS GRID — Assistant Guide

AEGIS GRID is a hackathon-grade real-time urban incident and mobility intelligence platform.

## Documentation Index
Before major implementation work, review:
- `project-brief.md` — Product vision, scope, and safety boundaries.
- `architecture.md` — Modular monolith layout, states, provenance, API contracts.
- `ui.md` — Command Center design tokens, layouts, and UX rules.
- `implementation-plan.md` — Phased roadmap and Definition of Done.

## Core Architectural Rules
1. **Modular Monolith**: All bounded services reside in one FastAPI application. Do NOT build microservices.
2. **Separation of States**:
   - VerificationState: `OBSERVED`, `SUSPECTED`, `VERIFYING`, `CONFIRMED`, `FALSE_ALARM`.
   - ResponseState: `UNACKNOWLEDGED`, `ACKNOWLEDGED`, `RESPONSE_PROPOSED`, `AUTHORIZED`, `DISPATCHED`, `ARRIVED`, `CONTAINED`, `CLOSED`.
3. **Data Provenance**: Every metric must declare its origin: `INFERENCE`, `SIMULATOR`, `REPLAY_FIXTURE`, `MOCK`, `ESTIMATE`, or `USER_INPUT`. If unavailable, display `N/A`.
4. **Separation of AI Metrics**: Model Confidence ≠ Evidence Score ≠ Severity ≠ Priority. High confidence alone must never confirm an incident.
5. **Deterministic Golden Demo**: Must run completely offline with replay fixtures and local mocks without depending on external APIs.
6. **Safety Invariants**: Adaptive signal recommendations must enforce `min_green` (15s), `max_green` (90s), `yellow_clearance` (4s), `all_red_clearance` (2s), and never switch directly between conflicting green phases.
7. **Audit Trail**: Every operator and automated action must generate an append-only audit event.
8. **Privacy by Design**: Anonymous ephemeral tracking IDs (e.g. `OBJ-104`). No facial recognition or licence plates.

## Development Commands
- Backend venv: `c:\nayan\backend\.venv\Scripts\activate`
- Run Server: `python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload`
- Run Tests: `pytest tests/ -v`
