# AEGIS GRID — Golden Demo & Operator Runbook

## 1. Quick Launch (Zero-Setup Commands)

Open two terminal windows in the project root `c:\nayan`:

### Terminal 1: Backend (FastAPI + CUDA Perception)
```powershell
backend\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
*Health Check*: Navigate to `http://127.0.0.1:8000/api/capabilities` in your browser. Verify `gpu.available: true` and `device: cuda:0`.

### Terminal 2: Frontend (Vite Command Center)
```powershell
cd frontend
npm run dev
```
*Access UI*: Open **`http://localhost:5173`** in your browser.

---

## 2. End-to-End Judge Demonstration Workflow

### Step 1: System Baseline & Hardware Audit (10 Seconds)
1. Observe the top bar of the AEGIS GRID command center:
   - Notice the **`NVIDIA RTX 4050 (CUDA:0) • 39 FPS`** hardware badge.
   - Notice the **`DEMO / SIMULATION ENVIRONMENT`** safety tag.
   - Notice the live **`WS: ACTIVE`** telemetry pulse.
2. Review the KPI strip:
   - City grid operating nominally.
   - 8 CCTV feeds online.

### Step 2: Launch the Golden Collision Demo (30 Seconds)
1. Click the crimson **`1-Click Golden Demo (CAM-04)`** button in the header (or navigate to `Camera Intelligence & Demo Feeds` and click `CAM-04`).
2. Watch the real Computer Vision pipeline in action:
   - Video feed `cam04_collision.mp4` begins decoding.
   - Real-time tactical bounding boxes (`V-001`, `V-002`) appear with confidence ratings.
   - Kinematic velocity vectors and speeds update every frame.
3. Observe the Multi-Signal Evidence Accumulation:
   - Trajectory conflict detected ($\Delta d < 0$).
   - Abrupt deceleration measured ($-6.2\text{ px/frame}^2 > 4.0\text{ threshold}$).
   - Decoupled Verification State transitions: `OBSERVED` $\rightarrow$ `SUSPECTED` $\rightarrow$ `VERIFYING`.
   - Once post-event stoppage exceeds $2.5\text{s}$, the state permanently transitions to **`CONFIRMED`**.
   - Notice that Model Confidence ($88\%$) and Evidence Score ($92\%$) remain separate!

### Step 3: Command Center Incident Response (20 Seconds)
1. Switch back to the **`Command Center`** tab.
2. In the **`Priority Incident Queue`**, click the confirmed incident `INC-CAM-04-LIVE`.
3. The **`Incident Command Drawer`** slides out from the right:
   - Review **"Why this alert was created"** with real kinematic telemetry proof.
   - Inspect the **Evidence Capsule** with Before, Event, and After anchors.
4. Click **`Authorize Emergency Response`**:
   - Response state shifts: `UNACKNOWLEDGED` $\rightarrow$ `AUTHORIZED`.
5. Click **`Activate Green Corridor (AMB-01)`**:
   - Dispatch is armed.
   - Notice the green corridor route highlighting along the arterial map towards Junction 2 West.

### Step 4: Traffic Signal Preemption & Digital Twin (15 Seconds)
1. Navigate to the **`Traffic & Signals`** tab:
   - Select `JNC-02 (Central Expwy & 4th Cross)`.
   - Inspect the 4 approach queues, speeds, and traffic pressure.
   - Observe how the AI proposes an emergency vehicle flush phase while strictly respecting municipal safety invariants (15s minimum green, 4s yellow, 2s all-red).
2. Navigate to the **`Digital Twin`** tab:
   - Review the scientific fair benchmark table comparing Fixed Time Baseline vs AEGIS GRID Adaptive Signal Preemption.
   - Note the **$-38.0\%$ delay reduction** and **$-58.6\%$ faster arrival** for emergency vehicles.

### Step 5: Audit Trail Verification (10 Seconds)
1. Navigate to the **`Audit Trail`** tab:
   - Review the chronological, immutable audit log.
   - Every state transition, operator authorization, and preemption action is recorded with its data provenance (`INFERENCE`, `USER_INPUT`, `SIMULATOR`).
   - Click **`Export JSON`** to download the audit record.

### Step 6: Clean Reset
1. Click the **`Reset`** button in the header.
2. The city grid, incidents, and corridor plans return to baseline readiness for the next demonstration.
