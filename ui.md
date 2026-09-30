# AEGIS GRID — UI/UX Specification

## Design direction
Build a premium, operational command centre rather than a generic SaaS dashboard. The interface should feel like a calm, high-trust emergency operations room: dark graphite surfaces, restrained signal colours, dense but readable information, strong hierarchy, and deliberate motion.

Use the supplied reference guide as inspiration for quality, polish, hierarchy, responsive composition, and implementation discipline: https://noocap.notion.site/Build-a-10K-Website-in-Claude-Code-Free-Setup-Guide-356508e99dda816c9d15ea892d4139f9?pvs=149. The URL could not be programmatically fetched, so do not claim to reproduce its exact contents. Treat it as a visual reference only and verify any specific instruction manually if needed.

## Product principles
- Every visual element must support an operator decision.
- Never use a chart or KPI without a clear operational meaning.
- Use progressive disclosure: overview first, evidence on demand.
- Show confidence and evidence separately; confidence is not truth.
- Make demo/simulation status visible at all times.
- Do not use facial recognition, names, or unnecessary personal data.
- Use accessible contrast, keyboard focus, reduced-motion support, and semantic labels.

## Visual system
- Background: near-black graphite, not pure black.
- Surfaces: layered charcoal panels with subtle borders.
- Text: warm white primary, muted slate secondary.
- Accent: one restrained cyan/teal for neutral system activity.
- Status colours: red critical, amber warning, green safe/active, blue informational.
- Use colour plus icon/text; never colour alone.
- Typography: modern sans for UI, tabular/monospace numerals for telemetry.
- Radius: modest 8–12px; avoid excessive pill-shaped cards.
- Borders and shadows should be quiet; let spacing and alignment create hierarchy.

## Main shell
- Left navigation: Command Center, Camera Intelligence, Traffic Control, Emergency Corridor, Incident Detail, Digital Twin.
- Top bar: AEGIS GRID mark, DEMO/SIMULATION badge, system time, WebSocket status, operator profile.
- Main area: responsive grid; desktop-first for command-centre use, usable down to tablet width.
- Global emergency banner only for confirmed critical events; do not create alert fatigue.

## Command Center layout
1. Header with city status and scenario controls.
2. KPI strip: active incidents, critical incidents, traffic disruption, emergency responses, cameras online, average verification time.
3. Main map occupying the visual anchor; incident markers, camera nodes, ambulance route, junction signal states.
4. CCTV mosaic with a maximum of 6 visible feeds and clear camera IDs.
5. Incident queue sorted by priority, not arrival time.
6. Right-side incident detail drawer for selected event.

## Camera Intelligence
- Video panel with camera ID, health, timestamp, demo label.
- Detection overlays use anonymous IDs and restrained bounding boxes.
- Event timeline: observed → verifying → confirmed.
- Evidence panel: trajectory conflict, deceleration, stationary duration, obstruction, crowd growth.
- Always include a clear `Why this alert was created` section.

## Traffic Control
- Junction card with four approaches, queue, occupancy, average speed, pressure.
- Current signal phase and proposed phase shown side by side.
- Explain proposed timing with plain language.
- Safety constraints visible: minimum green, maximum green, yellow clearance, all-red clearance.
- Use an explicit `Simulation only` label for actions.

## Emergency Corridor
- Show selected resource, route, ETA, corridor junction sequence, and signal readiness.
- Use a timeline rather than decorative animation.
- States: available, dispatched, approaching, corridor active, arrived.
- Operator action must be explicit: `Authorize response` and `Activate simulation corridor`.

## Incident Detail
- Incident ID, type, camera/location, state, severity, confidence, timestamp.
- Evidence list with source and time.
- Affected lanes, estimated people affected, traffic impact.
- Response decision and audit trail.
- Evidence capsule: before/event/after clip placeholders, not fabricated footage.

## Digital Twin
- Compare fixed timing and adaptive timing in a clear table.
- Display only measurements returned by the simulator.
- Include scenario name, seed, simulation time, and whether the result is mocked.
- Provide what-if presets: collision, ambulance, traffic surge, camera failure.

## Interaction and motion
- Animate only state changes: new incident, verification progress, route activation, signal transition.
- Use short, purposeful transitions; respect `prefers-reduced-motion`.
- Preserve operator context when drawers open; do not navigate away from the map.
- Toasts must be dismissible and duplicated in the audit feed.

## Responsive behavior
- Desktop: three-column command centre.
- Tablet: map and incident queue remain primary; CCTV collapses below.
- Mobile: not a full operations replacement; provide incident queue, detail, and acknowledgement flow.

## Required empty/loading/error states
- No active incidents.
- Camera offline/degraded/frozen.
- WebSocket disconnected with reconnect status.
- Simulation unavailable with deterministic mock fallback clearly labelled.
- No route found.
- Permission denied for camera input.

## Frontend acceptance criteria
- A judge can understand system status in 5 seconds.
- A judge can open one incident and understand why it was raised in 15 seconds.
- A judge can start the golden demo without hidden setup.
- All actions create visible audit events.
- `npm run build`, lint, and tests pass.
