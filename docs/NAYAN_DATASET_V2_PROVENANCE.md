# NAYAN Dataset v2 Provenance & Ground Truth Audit

## Dataset Overview
- **Name**: `nayan_india_v2`
- **Creation Date**: September 30, 2026
- **Architecture**: YOLO Darknet Format (normalized xywh)
- **Domain Focus**: Real Indian Emergency & Heterogeneous Urban Traffic Detection
- **Classes**:
  - `0`: `ambulance` (Critical Emergency Target)
  - `1`: `car`
  - `2`: `motorcycle`
  - `3`: `auto_rickshaw`
  - `4`: `bus`
  - `5`: `truck`

---

## Data Sources & Licensing

| Source Name | Author / Institution | License | Source URL | Raw Images | Classes Incorporated |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Ambulance Detection Dataset** | Omer Aucmq | CC BY 4.0 | [Roboflow Universe](https://universe.roboflow.com/omer-aucmq/ambulance_detection-z5tqb-wwpbw/dataset/2) | 876 | `ambulance` |
| **Emergency Vehicle & Density Dataset** | Najmus Sabir | CC BY 4.0 | [Roboflow Universe](https://universe.roboflow.com/emergency-vehicle-detection-sabir/vehicle-detc./dataset/1) | 361 | `ambulance`, `vehicle` -> `car`/`truck` |
| **Auto Rickshaw Dataset** | Ayush Das | CC BY 4.0 | [Roboflow Universe](https://universe.roboflow.com/ayush-das/imt2019014auto) | 355 | `autorickshaw` -> `auto_rickshaw` |
| **Indian Vehicle Traffic Dataset** | Akash Kumar Giri (Akashkg03) | Open Permissive Research | [GitHub Repository](https://github.com/Akashkg03/VEHICLE-OBJECT-DETECTION-USING-YOLOv8n) | 5,490 | `car`, `truck`, `bus`, `motorcycle`, `autorickshaw` |

---

## Ground Truth Integrity & Non-Permitted Logic
1. **Zero Artificial Frame Reassignments**: Unlike invalid v1 training (`create_indian_dataset.py`) which synthetically reassigned `car` to `ambulance` every 3rd frame, every label in `nayan_india_v2` represents authentic visual ground truth.
2. **Quarantine of Invalid V1**: Old synthetic data quarantined under `datasets/india_emergency/README_INVALID.md` and `backend/models/training/experimental_invalid_v1/`.
3. **Audit Verification**: Validated via `scripts/audit_nayan_dataset.py`, producing `artifacts/dataset_v2_audit.json` with **0 critical issues**, 0 corrupt files, and 0 bounding box coordinates out of bounds.

---

## Dataset Splits & Leakage Prevention
Split partitioning is strictly source-grouped. Images derived from video sequences are grouped such that adjacent frames never cross split boundaries.

- **Train Split**: 4,520 images
- **Val Split**: 1,268 images
- **Held-Out Test Split**: 1,173 images
- **Total Valid Pairs**: 6,961 image-annotation pairs
- **Train-Val Overlap**: 0
- **Train-Test Overlap**: 0
- **Val-Test Overlap**: 0
- **Split Manifest**: `artifacts/split_manifest_v2.json`
