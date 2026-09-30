# Frontend → backend contract

Base branch: backend. Audit at a2a6a19e0dfb631c61c61a5df4ca0fefef39c7ab. Backend stays unchanged.

| Surface | Authoritative reads | Actions |
|---|---|---|
| Shell / landing | GET /api/capabilities, /api/videos; WS /ws/events | POST /api/demo/scenarios/{golden,crowd,baggage}/start; POST /api/demo/reset |
| Command | GET /api/incidents, /api/cameras, /api/junctions, /api/resources, /api/videos | Camera selection; incident drawer |
| Cameras | GET /api/videos/status/{id}, /api/videos/tracks/{id}; catalogue media URL | POST /api/videos/analyze, /api/videos/stop |
| Incident | Incident snapshot; GET /api/incidents/{id}/audit, /export | POST /acknowledge, /propose-response, /authorize-response, /dispatch |
| Traffic | GET /api/junctions | POST /api/junctions/{id}/signal-recommendation; there is no phase-application endpoint |
| Corridor | GET /api/corridors/{id}; IDs from dispatch audit details and dispatch response | Dispatch creates corridor; there are no extend/release endpoints |
| Twin | GET /api/demo/digital-twin?mode=MOCK | Refresh existing deterministic comparison; no live simulation-run endpoint |
| Audit | GET /api/audit | Local JSON export and search |

## Audit findings

Old UI posted to nonexistent /response-state, /corridors/plan and /phase routes; those calls must be replaced by real APIs. Old command map is a fixed SVG, not Leaflet. Use a data-positioned offline schematic with backend coordinates and explicitly label it schematic; do not claim street-map tiles.

Old camera UI asserted CUDA, latency, confidence and evidence without returned data. Render N/A when absent; separate staged video and inference output. Old corridor and twin hardcoded states/benchmarks. Fetch actual backend responses, displaying their provenance and MOCK status.

Backend limitations: digital-twin adapter supplies deterministic metrics, not an actual SUMO run. Corridor segments are simulation-generated, not calibrated live road measurements. Golden demo service resolves media under backend/data while tracked assets are under data/demo; no frontend change can fix this backend path. Model training is outside this frontend scope. Preserve these limitations visibly in documentation and report verification honestly.
