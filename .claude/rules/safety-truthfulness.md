# Safety, Privacy, and Truthfulness Rules

1. **Traffic Signal Invariants**:
   - Signal phases must respect: `min_green` (15s), `max_green` (90s), `yellow_clearance` (4s), `all_red_clearance` (2s).
   - Incompatible green transitions are strictly forbidden; controller must step through yellow/all-red clearances.
   - All signal outputs must be explicitly marked as `SIMULATION ONLY`. Never imply control of physical municipal signals.
2. **Responsible Computer Vision**:
   - High instantaneous confidence alone never confirms an incident. Confirmation requires multi-frame temporal evidence.
   - Crowd anomaly detection observes movement patterns (density, growth rate, directional turbulence, dispersal) and never infers human intent, panic, or criminality.
   - Unattended baggage requires persistent spatial separation (> threshold distance for > threshold duration) with an associated track.
   - Ephemeral anonymous IDs (e.g. `OBJ-104`). No facial recognition or licence plate detection.
3. **Truthful Telemetry**:
   - Clearly differentiate between live model inference, SUMO simulation, and deterministic mock fallback.
   - Digital Twin results must display source: `SUMO / TraCI` vs `MOCKED DEMONSTRATION`.
