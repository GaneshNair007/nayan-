# NAYAN FINAL BACKEND FORENSIC BASELINE AUDIT

**Audit Date:** 2026-10-01  
**Repository Branch:** `backend`  
**Local Root:** `C:\nayan`  
**Local HEAD Commit:** `5e27daa`  
**Remote `origin/backend` Commit:** `a2a6a19` (Local is ahead by 5 commits; push requires authentication configuration)  

---

## 1. Executive Summary

This forensic baseline audit documents the starting state of the repository before executing the 56-phase completion protocol. The system already has high-performance CUDA detection, ByteTrack tracking, temporal kinematic features, corridor geometry, FastAPI REST endpoints, and WebSocket channels. However, critical gaps and honest deficiencies must be resolved:

1. **Digital Twin Mode Truthfulness:** `SimulationService.get_digital_twin_metrics` returned fixed values (514.0s vs 369.0s, 40.5% delay reduction) even when `mode="SUMO"` was requested, despite SUMO/TraCI not being installed in the environment.
2. **Golden Demo Realism:** `SimulationService.run_golden_demo` launched video decoding on `cam04_collision.mp4`, but separately created an incident with preconstructed collision details and injected fixed confidence/evidence values, rather than deriving state from the live perception pipeline.
3. **Invalid Legacy Dataset & Model (V1):** The legacy `datasets/india_emergency/` utilized frame-modulo class mutation (`frame % 3 == 0 -> ambulance`), which has been quarantined to `backend/models/training/experimental_invalid_v1/` and `datasets/india_emergency/README_INVALID.md`.
4. **Physical Camera Homography vs Assumption:** Real physical clearance (meters) is only valid when derived from planar homography matrix $H$ (calibrated cameras like CAM-01, CAM-03). Uncalibrated cameras must strictly output normalized clearance ratios and `clearance_width_meters: None`.
5. **Git Synchronization:** 5 commits were committed locally ahead of `origin/backend`. Remote push is currently blocked by headless environment lacking credential input.

---

## 2. Checkpoint & Model Audit

| Checkpoint Path | Size (Bytes) | SHA256 (First 16 chars) | Role / Status |
| :--- | :---: | :---: | :--- |
| `artifacts/models/nayan_india_v2/best.pt` | 6,249,827 | `6eb11ed634f43ea6...` | **ACTIVE** Fine-tuned 40-epoch CUDA checkpoint |
| `artifacts/models/nayan_india_v2/last.pt` | 6,249,827 | `6eb11ed634f43ea6...` | Last training epoch weights |
| `yolov8n.pt` / `artifacts/models/yolov8n.pt` | 6,549,796 | `f59b3d833e79ef08...` | Base pretrained COCO weights |
| `artifacts/models/korzo_model.pt` | 22,517,529 | `a5f4dc806b72a4ff...` | Dedicated luggage detection adapter |
| `backend/models/training/experimental_invalid_v1/weights/best.pt` | 6,223,267 | `1f33be02cf1e95c4...` | **INVALIDATED** (Synthetic modulo labels) |

---

## 3. Dataset Audit

| Dataset | Splits | Total Images | Status | Leakage Audit |
| :--- | :--- | :---: | :--- | :--- |
| `datasets/nayan_india_v2/` | Train (4,520), Val (1,268), Test (1,173) | 6,961 | **ACTIVE / VALID** | 0 video leakage (video-level partition) |
| `datasets/india_emergency/` | Train, Val (No Test) | 1,200 | **QUARANTINED** | Corrupted via frame % 3 == 0 mutation |
| `datasets/raw/` | Unprocessed sources | N/A | Raw staging | Permissive & research surveillance sources |

---

## 4. Key Search Pattern Forensic Scan

| Pattern / Keyword | Target Subsystems | Baseline Finding | Required Remediation |
| :--- | :--- | :--- | :--- |
| `is_rerouted=True` | `response.py` | Dispatches initially started with `is_rerouted=False`, but segment failure logic must trigger dynamically. | Keep dynamic trigger; verify initial plan is `is_rerouted=False`. |
| `clearance_width_meters` / `12.0` | `calibration.py`, `corridor_engine.py` | Calibrated cameras use homography; uncalibrated cameras return `None` for meters. | Enforce that uncalibrated cameras never report fake meters. |
| `CAM-04`, `CAM-07`, `CAM-11` | `pipeline.py`, `simulation.py` | Evaluator selection previously had camera-ID conditions. | Replaced in `pipeline.py` with pure kinematic signals; separate LIVE vs REPLAY in demo. |
| `model_confidence=`, `evidence_score=` | `simulation.py` | Injected into preconstructed incidents in `run_golden_demo`. | Separate into `LIVE_INFERENCE_DEMO` (derived) vs `REPLAY_FIXTURE_DEMO` (clearly labeled). |
| `SUMO`, `TraCI`, `fixed travel time` | `simulation.py`, `api/demo.py` | SUMO mode returned hardcoded 514s / 369s while TraCI is not installed. | Implement real TraCI probe; truthfully return `MOCK` with provenance when SUMO absent. |
| `randomly make`, `frames_extracted %` | `create_indian_dataset.py` | Found only in quarantined legacy generator. | Verified completely disabled and quarantined. |

---

## 5. Subsystem Readiness Assessment

- **CUDA Runtime:** Detected `NVIDIA GeForce RTX 4050 Laptop GPU` (6.00 GB VRAM), CUDA 12.4, PyTorch `2.6.0+cu124`.
- **FastAPI Backend:** Fully operational across API routes (`/api/capabilities`, `/api/health`, `/api/incidents`, `/api/cameras`, `/api/corridors`, `/api/simulation`, `/api/demo`).
- **WebSocket:** In-memory broadcast manager operational for incident and corridor push updates.
- **Unit & Integration Tests:** 39 tests passing in `backend/tests/`.
