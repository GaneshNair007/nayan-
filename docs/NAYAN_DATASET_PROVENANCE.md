# NAYAN India Dataset Provenance & Attribution

## Overview
This document formally records the provenance, licensing, original annotations, and domain mapping for the **NAYAN India Emergency Traffic Dataset** (`datasets/nayan_india/`).

Every sample is strictly traced to permissively licensed, open research datasets with zero data leakage across train, validation, and held-out test splits.

---

## Source Matrix & Licensing

| Source Name | Author / Institution | License | URL | Original Classes | Mapped NAYAN Classes | Original Size | Extracted Files |
|---|---|---|---|---|---|---|---|
| **Ambulance Detection Dataset** | Omer Aucmq | CC BY 4.0 | [Roboflow Universe](https://universe.roboflow.com/omer-aucmq/ambulance_detection-z5tqb-wwpbw/dataset/2) | `0: Ambulance` | `0: ambulance` | 876 images | 876 images, 886 annotations |
| **Emergency Vehicle & Density Dataset** | Najmus Sabir | CC BY 4.0 | [Roboflow Universe](https://universe.roboflow.com/emergency-vehicle-detection-sabir/vehicle-detc./dataset/1) | `0: ambulance`, `1: fire-truck`, `2: vehicle` | `0: ambulance`, `5: truck`, `1: car` | 361 images | 361 images, 1,343 annotations |
| **Auto Rickshaw Dataset** | Ayush Das | CC BY 4.0 | [Roboflow Universe](https://universe.roboflow.com/ayush-das/imt2019014auto) | `0: auto` | `3: auto_rickshaw` | 355 images | 355 images, 473 annotations |
| **Indian Vehicle Traffic Dataset** | Akash Kumar Giri (Akashkg03) | Open Source / Permissive Research | [GitHub](https://github.com/Akashkg03/VEHICLE-OBJECT-DETECTION-USING-YOLOv8n) | `Motorized2wheleer`, `ambasador_taxi`, `autorickshaw`, `bus`, `car`, `minitruck`, `truck`, `van`, `toto` | `2: motorcycle`, `1: car`, `3: auto_rickshaw`, `4: bus`, `5: truck` | 6,487 images | 5,490 images, 5,507 annotations |

---

## Unified Class Schema
| NAYAN Class ID | Class Label | Real-World Instances in Dataset | Primary Domain Representation |
|---|---|---|---|
| `0` | `ambulance` | **1,107** | Emergency vans, BLS/ALS ambulances, high-visibility strobe vehicles |
| `1` | `car` | **3,378** | Passenger cars, sedans, hatchbacks, ambassador taxis, light vans |
| `2` | `motorcycle` | **799** | Two-wheelers, scooters, commuter motorcycles |
| `3` | `auto_rickshaw` | **1,326** | Three-wheelers (Bajaj/Piaggio CNG/petrol auto-rickshaws, e-rickshaws/totos) |
| `4` | `bus` | **798** | Urban public transit buses, state transport buses, minibuses |
| `5` | `truck` | **665** | Medium/heavy duty commercial cargo trucks, minitrucks, emergency fire-trucks |

---

## Split Integrity & Data Leakage Prevention
- **Train split**: 4,520 images
- **Validation split**: 1,268 images
- **Test split (Held-out)**: 1,173 images
- **Total Images**: 6,961 images
- **Total Annotated Instances**: 8,073 instances
- **Integrity Guarantee**: Each source was split by discrete video sequences or independent collection scenes. Adjacent frames from the same video sequence do not cross between train, validation, and test splits.
