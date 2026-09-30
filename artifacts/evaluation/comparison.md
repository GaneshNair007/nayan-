# NAYAN Computer Vision: Baseline vs Fine-Tuned Model Comparison

## Executive Summary
This document provides empirical, scientifically audited verification comparing the pretrained general COCO model (`yolov8n.pt`) against the **NAYAN India Emergency Traffic Model** (`best.pt`) on the identical held-out test split (1,173 images).

---

## Metric Comparison Table

| Metric | Pretrained YOLOv8n (COCO) | NAYAN Fine-Tuned (best.pt) | Absolute Difference | Relative Change |
|---|---|---|---|---|
| **Overall Precision** | 0.2619 | 0.8537 | +0.5918 | +226.0% |
| **Overall Recall** | 0.2638 | 0.9317 | +0.6679 | +253.2% |
| **Overall mAP50** | 0.0789 | 0.7948 | +0.7159 | +907.4% |
| **Ambulance Precision** | 0.0000 | 0.9206 | +0.9206 | **Domain Adapted** |
| **Ambulance Recall** | 0.0000 | 0.8923 | +0.8923 | **Domain Adapted** |
| **Ambulance AP50** | 0.0000 | 0.8215 | +0.8215 | **Domain Adapted** |
| **Auto-Rickshaw Precision** | 0.0000 | 0.6596 | +0.6596 | **Domain Adapted** |
| **Auto-Rickshaw Recall** | 0.0000 | 0.9399 | +0.9399 | **Domain Adapted** |
| **Auto-Rickshaw AP50** | 0.0000 | 0.6200 | +0.6200 | **Domain Adapted** |

---

## Detailed Per-Class Performance

### `AMBULANCE`
- Ground Truth instances in test set: **65**
- Pretrained Baseline: Precision=0.0, Recall=0.0, AP50=0.0
- NAYAN Fine-Tuned:    Precision=0.9206, Recall=0.8923, AP50=0.8215

### `CAR`
- Ground Truth instances in test set: **529**
- Pretrained Baseline: Precision=0.3721, Recall=0.121, AP50=0.045
- NAYAN Fine-Tuned:    Precision=0.8598, Recall=0.9735, AP50=0.837

### `MOTORCYCLE`
- Ground Truth instances in test set: **158**
- Pretrained Baseline: Precision=0.775, Recall=0.1962, AP50=0.1521
- NAYAN Fine-Tuned:    Precision=0.9448, Recall=0.9747, AP50=0.9209

### `AUTO_RICKSHAW`
- Ground Truth instances in test set: **233**
- Pretrained Baseline: Precision=0.0, Recall=0.0, AP50=0.0
- NAYAN Fine-Tuned:    Precision=0.6596, Recall=0.9399, AP50=0.62

### `BUS`
- Ground Truth instances in test set: **147**
- Pretrained Baseline: Precision=0.25, Recall=0.7347, AP50=0.1837
- NAYAN Fine-Tuned:    Precision=0.8529, Recall=0.9864, AP50=0.8413

### `TRUCK`
- Ground Truth instances in test set: **130**
- Pretrained Baseline: Precision=0.1742, Recall=0.5308, AP50=0.0925
- NAYAN Fine-Tuned:    Precision=0.8843, Recall=0.8231, AP50=0.7278

---

## Model Acceptance Verdict
**DECISION: APPROVED FOR DEPLOYMENT**
- The fine-tuned model establishes robust detection on both critical domain targets (`ambulance` and `auto_rickshaw`) which had 0.0 recall on the pretrained model.
- Pretrained COCO weights lack representations for emergency sirens/strobes and 3-wheeled auto-rickshaws.
- Transfer learning with 6,961 audited images on NVIDIA GeForce RTX 4050 Laptop GPU successfully achieved domain adaptation.
