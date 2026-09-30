# AEGIS GRID — Architecture

## System flow
CCTV/video → perception → tracking → temporal evidence → incident fusion → severity/priority → response orchestrator → map/signals/routing/dispatch → audit timeline.

## Recommended stack
- Frontend: React + Vite + TypeScript.
- Styling: Tailwind CSS or existing project styling system.
- Backend: FastAPI + Pydantic.
- Realtime: WebSocket event stream.
- Vision: Python, OpenCV, Ultralytics YOLO, ByteTrack.
- Simulation: SUMO + TraCI.
- Map: Leaflet + OpenStreetMap.
- Routing: OSRM adapter with a deterministic mock fallback.
- Persistence: SQLite for prototype; repository layer must allow PostgreSQL later.

## Bounded services
- `perception`: detections, tracks, camera health.
- `incident`: rules, temporal state machine, evidence, severity, priority.
- `mobility`: junction state, traffic pressure, signal recommendations.
- `response`: resources, dispatch, route, green corridor.
- `simulation`: SUMO adapter and deterministic demo mode.
- `api`: REST contracts and WebSocket publishing.
- `web`: command centre views and operator interactions.

## Canonical states
Incident: `NORMAL`, `OBSERVED`, `SUSPECTED`, `VERIFYING`, `CONFIRMED`, `DISPATCHED`, `CONTAINED`, `FALSE_ALARM`.

## Required domain entities
Camera, Detection, Track, Incident, EvidenceItem, Junction, SignalPhase, Resource, Dispatch, Route, CorridorPlan, AuditEvent.

## Realtime event envelope
```json
{
  "id": "evt-uuid",
  "type": "incident.updated",
  "occurredAt": "ISO-8601",
  "source": "incident-engine",
  "payload": {},
  "demo": true
}
```

## API baseline
- `GET /api/health`
- `GET /api/cameras`
- `GET /api/incidents`
- `GET /api/incidents/:id`
- `POST /api/incidents/:id/acknowledge`
- `POST /api/incidents/:id/dispatch`
- `GET /api/junctions`
- `POST /api/junctions/:id/signal-recommendation`
- `GET /api/resources`
- `POST /api/corridors/plan`
- `POST /api/demo/scenarios/:scenario/start`
- `WS /ws/events`

## Implementation rule
Build one vertical slice first: collision scenario → verified incident → dashboard → dispatch → corridor → simulation result. Then add crowd and baggage scenarios.
