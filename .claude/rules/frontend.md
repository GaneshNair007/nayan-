# Frontend UI/UX Rules

1. **Operational Command Center Aesthetic**:
   - Dark graphite surfaces (`#0f172a`, `#1e293b`), subtle borders (`#334155`).
   - High information density, clear typography, monospace numerals for telemetry.
   - Primary navigation: `Command Center`, `Incidents`, `Camera Intelligence`, `Traffic Control`, `Emergency Corridor`, `Digital Twin`.
2. **Provenance Badges**:
   - Every metric displays its origin badge (e.g. `INFERENCE`, `SIMULATOR`, `REPLAY_FIXTURE`, `MOCK`).
   - If unavailable, render `N/A`. Never silently show 0.
3. **Telemetry & Connection Freshness**:
   - Display `STREAM ● Connected • Last event: 0.8s ago`.
   - If event age exceeds 5 seconds, switch to `● Connected • DATA STALE`.
4. **Offline Map Resiliency**:
   - Support Leaflet + OSM, with local schematic grid fallback if external map tiles are blocked or unreachable.
5. **Progressive Disclosure**:
   - Overview first, click incident card to open details drawer or route to `/incidents/{id}`.
