# NAYAN / AEGIS GRID — Final Demo & Release Runbook

This operational runbook provides exact procedures for launching, operating, judging, and recovering the NAYAN system during live demonstration.

---

## 1. Quick Startup Procedures (Under 60 Seconds)

### Step 1: Environment Variables
Create or verify `.env` in the project root (`c:\nayan\.env`) if using live cloud decision support:

```bash
# Optional: Set OpenAI key for live cloud decision support
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-6-luna
OPENAI_FALLBACK_MODEL=gpt-4o
OPENAI_ENABLED=true
```

*(Note: NAYAN operates fully deterministically in offline mode if `OPENAI_API_KEY` is omitted or `OPENAI_ENABLED=false`)*.

### Step 2: Start Backend (FastAPI + CUDA Perception)
```powershell
cd c:\nayan\backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
- Verify health: `curl http://127.0.0.1:8000/api/health`
- Verify AI status: `curl http://127.0.0.1:8000/api/ai/status`
- Verify Model metrics: `curl http://127.0.0.1:8000/api/model/metrics`

### Step 3: Start Frontend (Palomino + Command Center)
```powershell
cd c:\nayan\frontend
npm run dev -- --host 127.0.0.1 --port 5173
```
- Open browser at: `http://localhost:5173`

---

## 2. Golden Demo Judging Steps

Execute this exact sequence for judges:

### Phase A: Palomino First-Page Presentation
1. Land on `http://localhost:5173/` (Palomino Cinema Mode).
2. Note the dynamic hero background with live CCTV video loops from Bangalore junction feeds.
3. Review verified empirical benchmark metrics displayed on the key figures strip (`0.988 mAP50`, `0.980 Ambulance Precision`, `40 Epochs CUDA`).
4. Click **ENTER COMMAND CENTER** or the top navigation button to transition to the operations console.

### Phase B: Real Detection & Incident Verification
1. Click **1-Click Golden Demo (CAM-04)** in the header.
2. The CV pipeline decodes live video from CAM-04, running YOLOv8 detection and ByteTrack tracking.
3. Notice deceleration anomaly and trajectory convergence trigger the temporal evidence accumulator.
4. When threshold is met, incident `INC-2026-001` transitions from `OBSERVED` to `CONFIRMED`.

### Phase C: AI Operator Copilot Decision Support
1. Click the active incident row `INC-2026-001` in the queue.
2. The **AI Operator Copilot** drawer opens:
   - Displays truthful loading stages: *READING EVIDENCE* → *CHECKING RESPONSE STATE* → *ASSEMBLING OPERATOR BRIEF*.
   - Shows deterministic **GROUNDING: 4 BACKEND EVIDENCE ITEMS** badge.
   - Evidence bullets display provenance, source (`CAM-04`), and timestamp.
3. Review proposed resource: `AMB-03` selected via Euclidean distance ranking.

### Phase D: Human Operator Authorization & Execution
1. Note the prominent button: `[AUTHORIZE PROPOSED EMERGENCY RESPONSE]`.
2. Notice the button does **not** simulate state: clicking it sends authoritative `POST /api/incidents/{id}/authorize-response`.
3. Backend transitions response state to `AUTHORIZED` and triggers `POST /api/incidents/{id}/dispatch`.
4. Resource `AMB-03` status changes to `DISPATCHED`.
5. Dynamic Green Corridor is calculated with Haversine metrics and JNC-02 preemption.
6. Audit log entry is appended with provenance `AI_ASSISTED` / `USER_INPUT`.

---

## 3. Multi-Scenario Demonstrations

| Scenario | Button / Endpoint | Target Camera | Expected Verification |
| :--- | :--- | :--- | :--- |
| **Collision Preemption** | `1-Click Golden Demo` | CAM-04 | Confirmed collision, AMB-03 dispatch, green corridor |
| **Ambulance Detection** | Camera Selector → CAM-03 | CAM-03 | Custom Indian ambulance class identification (`mAP50=0.983`) |
| **Crowd Anomaly** | `Crowd Surge` | CAM-07 | Pedestrian density surge and spatial dispersion tracking |
| **Unattended Baggage**| `Baggage` | CAM-11 | Stationary luggage separation > 180s temporal invariant |

---

## 4. Under-60-Seconds Troubleshooting & Recovery

### What to do if OpenAI API fails or is rate-limited:
- **Instant Recovery:** The backend automatically logs a degraded audit event and falls back to deterministic decision support. The frontend displays `AI COPILOT: OFFLINE` with structured incident facts (`Verification State`, `Priority Tier`, `Evidence Items`).
- Operator authorization and dispatch proceed completely uninterrupted.

### What to do if OSRM Router fails or times out:
- **Instant Recovery:** The backend routing engine catches network errors and falls back to deterministic straight-line Euclidean interpolation with speed-tier estimates (`45 km/h` urban baseline).

### What to do if SUMO is unavailable:
- **Instant Recovery:** Backend operates with `SUMO_ENABLED=false` by default, generating truthful `SIMULATOR` / `ESTIMATE` telemetry without pretending live SUMO is running.

### What to do if Camera Video decoding drops frames:
- **Instant Recovery:** Video catalogue serves static fallback frames (`/media/nayan/stills/cam01_still_16s.webp`) automatically via CSS background fallbacks.

---

## 5. Security & Safety Invariants

1. **Zero State Mutation:** AI assistance calls have **read-only** authority. They can never mutate database state or dispatch resources.
2. **Deterministic Grounding:** All AI claims are grounded in database evidence. Hallucination probes return "Not available in backend evidence."
3. **Prompt Injection Defense:** Untrusted operator notes or queries are isolated into data payloads under strict system boundaries.
4. **Zero Secrets in Code or Assets:** API keys are never stored in repositories, logs, API responses, or compiled frontend bundles.
