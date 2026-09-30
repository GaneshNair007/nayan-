# NAYAN India Dataset V2 — Provenance & Attribution

## Overview
This document records the provenance, licensing, original annotations, and domain mapping for the **NAYAN India Emergency Traffic Dataset V2** (`datasets/nayan_india_v2/`).

Every sample is strictly traced to permissively licensed, open research datasets with zero data leakage across train, validation, and held-out test splits.

---

## Source Matrix & Licensing

| Source Name | Author / Institution | License | URL | Original Classes | Mapped NAYAN Classes | Images | Annotation Format |
|---|---|---|---|---|---|---|---|
| **Ambulance Detection Dataset** | Omer Aucmq | CC BY 4.0 | [Roboflow Universe](https://universe.roboflow.com/omer-aucmq/ambulance_detection-z5tqb-wwpbw/dataset/2) | `0: Ambulance` | `0: ambulance` | 876 | YOLO Darknet (xywhn) |
| **Emergency Vehicle & Density Dataset** | Najmus Sabir | CC BY 4.0 | [Roboflow Universe](https://universe.roboflow.com/emergency-vehicle-detection-sabir/vehicle-detc./dataset/1) | `0: ambulance`, `1: fire-truck`, `2: vehicle` | `0: ambulance`, `5: truck`, `1: car` | 361 | YOLO Darknet (xywhn) |
| **Auto Rickshaw Dataset** | Ayush Das | CC BY 4.0 | [Roboflow Universe](https://universe.roboflow.com/ayush-das/imt2019014auto) | `0: auto` | `3: auto_rickshaw` | 355 | YOLO Darknet (xywhn) |
| **Indian Vehicle Traffic Dataset** | Akash Kumar Giri (Akashkg03) | Open Source / Permissive | [GitHub](https://github.com/Akashkg03/VEHICLE-OBJECT-DETECTION-USING-YOLOv8n) | `Motorized2wheleer`, `ambasador_taxi`, `autorickshaw`, `bus`, `car`, `minitruck`, `truck`, `van`, `toto` | `2: motorcycle`, `1: car`, `3: auto_rickshaw`, `4: bus`, `5: truck` | 5,490 | YOLO Darknet (xywhn) |

---

## Target Class Mapping & Dictionary

```yaml
nc: 6
names:
  0: ambulance
  1: car
  2: motorcycle
  3: auto_rickshaw
  4: bus
  5: truck
```

---

## Split Statistics

- **Train Split**: 4,520 images (64.9%)
- **Validation Split**: 1,268 images (18.2%)
- **Held-out Test Split**: 1,173 images (16.9%)
- **Total Dataset Size**: 6,961 images, 8,073 annotated instances

---

## Data Leakage Prevention Protocol
1. **Source Sequence Partitioning**: All frames originating from a single source video or continuous capture sequence are placed entirely into ONE split (train, val, or test).
2. **Held-out Test Isolation**: The test split contains completely independent camera feeds and capture scenes not seen in train or validation.
3. **No Duplicate Relabeling**: Synthetic auto-labeling hacks (e.g. `frame_number % 3 == 0 => ambulance`) are strictly forbidden and eliminated.
