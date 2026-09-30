# AEGIS GRID — Implementation Plan

## Phase 1: foundation
- Inspect repository and preserve existing conventions.
- Create typed domain models and fixture data.
- Add app shell, navigation, theme tokens, status components, and responsive grid.
- Add deterministic demo scenario runner.

## Phase 2: vertical slice
- Implement collision fixture.
- Implement incident state machine and evidence scoring.
- Add WebSocket or local event bus.
- Render map, CCTV, queue, detail drawer, and audit timeline.
- Add dispatch and corridor simulation controls.

## Phase 3: required scenarios
- Crowd anomaly based on density, growth rate, direction change, and dispersal—not intent inference.
- Unattended baggage based on object/person association, separation distance, stationary duration, and cross-camera check.

## Phase 4: mobility
- Junction pressure computation.
- Safe signal recommendation.
- SUMO adapter with mock implementation when SUMO is absent.
- Emergency corridor timeline.

## Phase 5: hardening
- Camera health states.
- Error and reconnect handling.
- Accessibility audit.
- Unit, integration, and end-to-end tests.
- Demo reset and seed controls.
- README with exact commands and limitations.

## Definition of done
- Fresh clone starts with documented commands.
- Golden demo works from a visible button.
- No fabricated live metrics.
- Simulation boundaries and staged data are labelled.
- Main P0 flow is tested.
