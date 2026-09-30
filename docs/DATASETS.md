# AEGIS GRID — Curated Video Feeds & Dataset Provenance

## 1. Ethical Acquisition & Permitted Licensing

AEGIS GRID utilizes strictly public-domain, Creative Commons, and authoritative open research video assets. All footage represents fixed, surveillance-style CCTV cameras without personally identifiable individuals, license plates, or facial imagery.

All demo videos are normalized to H.264 MP4, 1280x720 resolution, and 30.0 FPS using FFmpeg (`imageio_ffmpeg`).

---

## 2. Video Feed Inventory (`data/demo/`)

| Camera ID | Filename | Scenario Description | Duration | Frames | Source & License | Provenance | Intended CV Engine |
|:---|:---|:---|:---:|:---:|:---|:---:|:---|
| **CAM-01** | `cam01_normal_intersection.mp4` | Normal Urban Roundabout Flow | 30.0s | 900 | Wikimedia Commons (CC0 1.0 Public Domain) | `INFERENCE` | Vehicle Flow & Trajectory Baseline |
| **CAM-02** | `cam02_congestion.mp4` | Traffic Congestion & Queue Buildup | 30.0s | 900 | Wikimedia Commons (CC BY-SA 4.0) | `INFERENCE` | Queue Length & Occupancy Engine |
| **CAM-03** | `cam03_ambulance.mp4` | Emergency Vehicle Transit in Traffic | 13.0s | 390 | Wikimedia Commons (CC BY 3.0) | `INFERENCE` | Emergency Vehicle Detection Context |
| **CAM-04** | `cam04_collision.mp4` | **Golden Demo: Multi-Vehicle Collision** | 13.0s | 390 | Open Traffic Surveillance (CC BY 3.0) | `INFERENCE` | Trajectory Convergence & Deceleration |
| **CAM-05** | `cam05_night_traffic.mp4` | Low-Light / Night Traffic Surveillance | 13.0s | 390 | Wikimedia Commons Night Feed (CC BY 3.0) | `INFERENCE` | Headlight Tracking & Dark Adaptation |
| **CAM-07** | `cam07_crowd_growth.mp4` | Rapid Pedestrian Crowd Surge | 30.0s | 900 | PLOS ONE Crowd Dataset (CC BY 2.5) | `INFERENCE` | Density Trend & Directional Coherence |
| **CAM-09** | `cam09_normal_source.mp4` | Sensor Optical Health Diagnostic Feed | 35.0s | 1050 | Wikimedia Commons Urban CCTV (CC BY-SA 4.0) | `INFERENCE` | Blur, Freeze, Blackout Diagnostics |
| **CAM-11** | `cam11_unattended_baggage.mp4` | Unattended Luggage & Owner Departure | 15.0s | 450 | Surveillance Luggage Benchmark (CC BY 3.0) | `INFERENCE` | Spatial Separation & Stoppage Duration |

---

## 3. Git Media & Storage Strategy

- **Raw Source Files**: Heavy raw datasets are kept in `datasets/raw/` and ignored from Git in `.gitignore`.
- **Curated Demo Clips**: Curated 13–35 second normalized MP4 feeds are stored in `data/demo/`.
- **Git LFS**: Tracked via `.gitattributes`:
  ```text
  *.mp4 filter=lfs diff=lfs merge=lfs -text
  *.pt filter=lfs diff=lfs merge=lfs -text
  ```
- **Manifest**: Complete metadata is stored in `data/demo/manifest.json`.
