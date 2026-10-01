# NAYAN — DEPLOYMENT & HACKATHON EXECUTION GUIDE

This document provides complete instructions for running, testing, deploying, and presenting **NAYAN** (AI-Driven Emergency Corridor & Vision-First Urban Safety System).

---

## 1. Quick Architecture Overview

```
                   ┌─────────────────────────────────────────────────────────┐
                   │             PALOMINO-LEVEL FRONTEND (PORT 5173)         │
                   │   React 19 · Motion for React · Host Grotesk · Lenis   │
                   └──────────────────────────┬──────────────────────────────┘
                                              │ REST (Initial) + WebSocket (Deltas)
                   ┌──────────────────────────▼──────────────────────────────┐
                   │               FASTAPI ENGINE (PORT 8000)                │
                   │     OpenCV Video Pipeline · REST APIs · WS Manager      │
                   └──────┬───────────────────┬───────────────────┬──────────┘
                          │                   │                   │
               ┌──────────▼─────────┐  ┌──────▼──────┐  ┌─────────▼────────┐
               │ YOLOv8n CUDA:0     │  │ ByteTrack   │  │ Evidence Engine  │
               │ 40-Epoch Checkpoint│  │ Trajectory  │  │ Dynamic Grid 16x8│
               │ 0.988 mAP50        │  │ Association │  │ Homography Planar│
               └────────────────────┘  └─────────────┘  └──────────────────┘
                          │
               ┌──────────▼─────────┐
               │ AI Operator Copilot│
               │ OpenAI (Responses) │ (Read-only decision support;
               │ gpt-6-luna / gpt-4o│  CV safety core operates 100% offline)
               └────────────────────┘
```

---

## 2. 1-Click Hackathon Local Launch

### Option A: Windows (Batch Script)
Simply double-click `start_all.bat` or run in terminal:
```cmd
start_all.bat
```
*This launches the FastAPI backend in one terminal, Vite dev server in another, and opens `http://localhost:5173` in your default browser.*

### Option B: Linux / macOS / WSL (Shell Script)
```bash
chmod +x start_all.sh
./start_all.sh
```

### Option C: Manual Startup (Two Terminals)

**Terminal 1 — Backend:**
```bash
# In repository root
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
- Healthcheck: `http://127.0.0.1:8000/api/health`
- Readiness: `http://127.0.0.1:8000/api/ready`
- Interactive Swagger Docs: `http://127.0.0.1:8000/docs`

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```
- Application: `http://localhost:5173`

---

## 3. Containerized Deployment (Docker & Docker Compose)

The repository includes optimized multi-stage container configurations:
- `backend/Dockerfile`: Python 3.12-slim with OpenCV, PyTorch, and CUDA/CPU support.
- `frontend/Dockerfile`: Multi-stage build with Node.js 22 and high-performance Nginx alpine reverse proxy.
- `docker-compose.yml`: One-command complete deployment.

### Run with Docker Compose:
```bash
# Build and start both services
docker compose up --build

# Run in detached daemon mode
docker compose up -d

# Stop services
docker compose down
```

**Port Mappings:**
- Frontend: `http://localhost:5173` (or `http://localhost:80`)
- Backend: `http://localhost:8000`

---

## 4. Cloud Deployment (Free Tier & GPU Hosting)

### 4.1 Frontend Cloud Deployment (Vercel / Netlify / Cloudflare Pages)

The frontend is a single-page application (SPA) pre-configured with `frontend/vercel.json`.

#### Deploying on Vercel:
1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import `GaneshNair007/nayan-`.
4. Configure Project Settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click **Deploy**. Vercel will provide your live URL (e.g. `https://nayan-safety.vercel.app`).

---

### 4.2 Backend Cloud Deployment (Render / Railway)

#### Deploying on Render (Free / Web Service):
1. Go to [render.com](https://render.com) and create a **New Web Service**.
2. Connect your GitHub repository `GaneshNair007/nayan-`.
3. Select **Docker** environment:
   - **Dockerfile Path:** `backend/Dockerfile`
   - **Context Directory:** `.`
   - **Instance Type:** Starter (or standard)
4. Add Environment Variables:
   - `OPENAI_API_KEY`: *(Optional) your API key for Copilot*
   - `OPENAI_MODEL`: `gpt-6-luna` (or `gpt-4o`)
5. Health Check Path: `/api/health`
6. Click **Deploy Web Service**.

#### Deploying on Railway:
```bash
# Using Railway CLI
railway login
railway init
railway up --dockerfile backend/Dockerfile
```

---

### 4.3 High-Performance GPU Deployment (RunPod / AWS EC2 / Vast.ai)

For live 40+ FPS multi-camera CUDA inference on real traffic video feeds:

#### Recommended Hardware:
- **NVIDIA RTX 4050 / RTX 4090 / Tesla T4 / A10G**
- CUDA Driver Version: `>= 12.4`
- RAM: `>= 16 GB`

#### AWS EC2 `g4dn.xlarge` (Ubuntu 22.04 with Deep Learning AMI):
```bash
git clone https://github.com/GaneshNair007/nayan-.git
cd nayan-

# Setup Python environment
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt

# Run backend with GPU acceleration
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
```

---

## 5. Environment Variables Reference

Create a `.env` file in the root directory (refer to `.env.example`):

```bash
# ========================================================
# NAYAN ENVIRONMENT CONFIGURATION
# ========================================================

# OpenAI API Key (For AI Operator Copilot)
# Leave empty to run with Copilot gracefully disabled (Safety core runs 100% offline)
OPENAI_API_KEY=your_openai_api_key_here

# OpenAI Model ID (Supported: gpt-6-luna, gpt-4o, gpt-4o-mini)
OPENAI_MODEL=gpt-6-luna

# Computer Vision Checkpoint Path
MODEL_CHECKPOINT=artifacts/models/nayan_india_v2/best.pt

# Device Selection (cuda:0 or cpu)
DEVICE=cuda:0

# Server Binding
HOST=127.0.0.1
PORT=8000
```

---

## 6. Hackathon Presentation & Judge Walkthrough Script

When demonstrating NAYAN to judges, follow this winning 5-minute narrative flow:

### 01. The Problem Statement (Landing Page)
- **Show:** The Palomino-grade editorial landing page at `http://localhost:5173`.
- **Explain:** Traditional smart city dashboards look like noisy cybersecurity SOC dashboards with 50 flashing cards. NAYAN replaces dashboard noise with **progressive disclosure**: high-end editorial calm that puts the real computer vision ground truth front and center.

### 02. The Live Ground Truth (Command Center)
- **Click:** `COMMAND` in the header.
- **Show:** 65% dominant monocular CCTV stream + 35% typographic incident rows.
- **Highlight:** Detections, multi-object ByteTrack trajectories, and kinematics run locally on GPU (`~40.7 FPS`). No fake metrics.

### 03. "Why This Alert?" Narrative (Camera Intelligence)
- **Click:** `CAMERAS` in the header.
- **Show:** The scroll narrative explaining **why** the incident was detected:
  1. Trajectory Conflict
  2. Abrupt Deceleration
  3. Persistent Obstruction
  4. Homography Ground Verification

### 04. Human-In-The-Loop Safety (Incident Detail)
- **Click:** `EXAMINE CASE DETAIL`.
- **Show:** The case-study page with full physical evidence.
- **Action:** Click `AUTHORIZE DISPATCH & PREEMPTION`.
- **Explain:** AI never triggers actuators autonomously. The human operator authorizes every state change.

### 05. Emergency Corridor & Dynamic Grid Slicing (Corridor)
- **Click:** `CORRIDORS` in the header.
- **Show:** The "MAKE WAY." hero page and the **16×8 Dynamic Grid**.
- **Explain:** *"We don't assume lane discipline. We model road-space availability."* Vehicles disperse into the shoulder; planar homography confirms `14.0m` available clearance.

### 06. Digital Twin & Provable Results (Twin)
- **Click:** `TWIN` in the header.
- **Show:** The `Fixed Signal vs NAYAN Adaptive` split comparison slider with SUMO/TraCI closed-loop simulation metrics.
- **Highlight:** 54% reduction in emergency travel time.

### 07. Immutable Accountability (Audit Trail)
- **Click:** `AUDIT` in the header.
- **Show:** Every single event, evidence item, and operator authorization logged with immutable SHA-verified provenance.

### 08. Hardware Execution Profile (System Drawer)
- **Click:** `SYSTEM` in the top right.
- **Show:** Checkpoint SHA256, CUDA:0 FP16 half-precision active, and held-out 1,173 test image metrics: **0.988 mAP50**, **0.980 ambulance precision**.
