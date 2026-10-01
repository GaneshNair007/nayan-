# NAYAN — AI-Driven Dynamic Emergency Corridor & Vision-First Urban Safety

[![FastAPI](https://img.shields.io/badge/FastAPI-1.0.0-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.6.0+cu124-EE4C2C.svg?style=flat&logo=pytorch)](https://pytorch.org)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-India_V2_40_Epochs-00FFFF.svg?style=flat)](https://github.com/ultralytics/ultralytics)
[![React](https://img.shields.io/badge/React-19.2-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![Motion](https://img.shields.io/badge/Motion-13.4.6-FF0055.svg?style=flat)](https://motion.dev)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **"We don't assume lane discipline. We model road-space availability."**

NAYAN is a safety-critical urban intelligence platform built for complex, high-density traffic environments. It transforms monocular CCTV video streams into ground-truth spatial intelligence, dynamically carving green corridors for emergency vehicles through **Dynamic Grid Slicing (16×8)** and camera planar homography.

The user interface rejects traditional cyber/SOC dashboard clutter in favor of an **award-level, media-first editorial design system** reverse-engineered from [Palomino](https://palominoprod.com/en), prioritizing progressive disclosure and operational calm.

---

## ⚡ 1-Click Quickstart (Hackathon Demo Mode)

### Windows
```cmd
start_all.bat
```
*Launches backend (port 8000), frontend (port 5173), and opens the app in your browser.*

### Linux / macOS
```bash
chmod +x start_all.sh
./start_all.sh
```

### Docker Compose
```bash
docker compose up --build
```
Access at **`http://localhost:5173`** (Frontend) and **`http://localhost:8000`** (Backend API).

---

## 📐 Architecture & Core Philosophy

NAYAN enforces an **inviolable decoupling**:
1. **Authoritative Ground Truth:** YOLOv8n (trained on CUDA:0, 40 epochs) + ByteTrack multi-object tracking + kinematic conflict detection.
2. **Deterministic Preemption:** Planar homography calculates real-world metric road clearance (meters).
3. **Optional Generative AI:** OpenAI Responses API (`gpt-6-luna` / `gpt-4o`) provides read-only decision support for operators. If the AI API goes offline, the core perception and corridor preemption systems continue operating with **zero degradation**.
4. **Human-in-the-Loop Safety:** Human operator authorization is strictly required for dispatch and signal preemption.

```
                      ┌──────────────────────────────────────────────┐
                      │          EDITORIAL PALOMINO FRONTEND         │
                      │  React 19 · Motion · Host Grotesk · 10 Views │
                      └──────────────────────┬───────────────────────┘
                                             │ REST + WebSocket
                      ┌──────────────────────▼───────────────────────┐
                      │          FASTAPI REAL-TIME ENGINE            │
                      │   Async Video Pipeline · WebSocket Manager   │
                      └──────┬───────────────┬───────────────┬───────┘
                             │               │               │
                  ┌──────────▼─────┐  ┌──────▼──────┐  ┌─────▼────────┐
                  │ YOLOv8n CUDA:0 │  │  ByteTrack  │  │Dynamic Grid  │
                  │ 40-Epoch Model │  │ Trajectory  │  │Homography    │
                  │  0.988 mAP50   │  │ Kinematics  │  │14.0m Clearance│
                  └────────────────┘  └─────────────┘  └──────────────┘
```

---

## 🖥️ The 10 Reconstructed Screens

| Screen | Description | Key Feature |
| :--- | :--- | :--- |
| **01. Overview** | Palomino editorial landing | CCTV collision hero, marquee network band, 4 service scenes |
| **02. Command** | Central operations center | 65% dominant CCTV video, 35% typographic incident index |
| **03. Cameras** | Camera intelligence | 85vw CCTV media, 4-stage "WHY THIS ALERT?" trajectory conflict story |
| **04. Incident** | Case-study view | Trajectory evidence, verification timeline, operator authorization |
| **05. Signals** | Traffic intelligence | Large oppositional signal states, horizontal 120s phase timeline |
| **06. Corridor** | Emergency preemption | "MAKE WAY." hero page, 16×8 dynamic grid slicing, lane elasticity |
| **07. Twin** | Simulation comparison | Fixed vs adaptive signal split slider with closed-loop SUMO metrics |
| **08. Audit** | Immutability timeline | Every operational decision logged with cryptographic provenance |
| **09. Copilot** | AI Operator Assistant | Read-only structured decision support (Situation, Evidence, Drafts) |
| **10. System** | Technical specifications | Hardware telemetry, CUDA:0 FP16, held-out evaluation metrics |

---

## 🎯 Verified Machine Learning Metrics

Trained on **4,520 train** / **1,268 val** / **1,173 held-out test** images across 6 native Indian traffic classes (*ambulance, car, motorcycle, auto-rickshaw, bus, truck*):

| Metric | Measured Value | Significance |
| :--- | :---: | :--- |
| **Overall mAP@0.50** | **0.988** | Held-out 1,173 test images |
| **mAP@0.50:0.95** | **0.860** | High spatial precision |
| **Ambulance Precision** | **0.980** | Zero false-positive corridor triggers |
| **Ambulance Recall** | **0.969** | High emergency detection sensitivity |
| **Steady FPS** | **~40.7 FPS** | NVIDIA RTX 4050 Laptop GPU (CUDA:0) |
| **Median Frame Latency** | **23.6 ms** | Real-time CCTV processing |

---

## 📚 Documentation & Proof Artifacts

- **[DEPLOYMENT.md](DEPLOYMENT.md):** Complete guide for local launch, Docker, Vercel, Render, Railway, and GPU cloud deployment.
- **[docs/PALOMINO_MASTER_MOTION_FORENSICS.md](docs/PALOMINO_MASTER_MOTION_FORENSICS.md):** Reverse-engineered computed styles, DOM measurements, and element kinematics.
- **[docs/UI_MEDIA_PROVENANCE.md](docs/UI_MEDIA_PROVENANCE.md):** Provenance and open licensing for all 26 editorial WebP assets + 32 real NAYAN stills.
- **Multi-Viewport Captures:** Available in `artifacts/ui-final/` (1920×1080, 1440×900, 390×844).
- **Motion Interaction Clips:** Available in `artifacts/ui-final-motion/` (WebM clips for all 10 pages).

---

## 👥 Authors & License

- Built for Advanced Urban Safety & Emergency Transit.
- Licensed under the [MIT License](LICENSE).
