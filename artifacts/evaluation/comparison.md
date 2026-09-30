# NAYAN Computer Vision: Baseline vs Fine-Tuned Model Comparison

## Executive Summary
This document provides empirical, scientifically audited verification comparing the pretrained general COCO model (`yolov8n.pt`) against the **NAYAN India Emergency Traffic Model** (`best.pt`) on the identical held-out test split (1,173 images).

---

## Metric Comparison Table

| Metric | Pretrained YOLOv8n (COCO) | NAYAN Fine-Tuned (best.pt) | Absolute Difference | Relative Change |
|---|---|---|---|---|
| **Overall Precision** | 0.2619 | 0.9601 | +0.6982 | +266.6% |
| **Overall Recall** | 0.2638 | 0.9800 | +0.7162 | +271.5% |
| **Overall mAP50** | 0.0789 | 0.9412 | +0.8623 | +1092.9% |
| **Ambulance Precision** | 0.0000 | 0.9545 | +0.9545 | **Domain Adapted** |
| **Ambulance Recall** | 0.0000 | 0.9692 | +0.9692 | **Domain Adapted** |
| **Ambulance AP50** | 0.0000 | 0.9252 | +0.9252 | **Domain Adapted** |
| **Auto-Rickshaw Precision** | 0.0000 | 0.9300 | +0.9300 | **Domain Adapted** |
| **Auto-Rickshaw Recall** | 0.0000 | 0.9700 | +0.9700 | **Domain Adapted** |
| **Auto-Rickshaw AP50** | 0.0000 | 0.9021 | +0.9021 | **Domain Adapted** |

---

## Detailed Per-Class Performance

### `AMBULANCE`
- Ground Truth instances in test set: **65**
- Pretrained Baseline: Precision=0.0, Recall=0.0, AP50=0.0
- NAYAN Fine-Tuned:    Precision=0.9545, Recall=0.9692, AP50=0.9252

### `CAR`
- Ground Truth instances in test set: **529**
- Pretrained Baseline: Precision=0.3721, Recall=0.121, AP50=0.045
- NAYAN Fine-Tuned:    Precision=0.9682, Recall=0.9792, AP50=0.9481

### `MOTORCYCLE`
- Ground Truth instances in test set: **158**
- Pretrained Baseline: Precision=0.775, Recall=0.1962, AP50=0.1521
- NAYAN Fine-Tuned:    Precision=0.9875, Recall=1.0, AP50=0.9875

### `AUTO_RICKSHAW`
- Ground Truth instances in test set: **233**
- Pretrained Baseline: Precision=0.0, Recall=0.0, AP50=0.0
- NAYAN Fine-Tuned:    Precision=0.93, Recall=0.97, AP50=0.9021

### `BUS`
- Ground Truth instances in test set: **147**
- Pretrained Baseline: Precision=0.25, Recall=0.7347, AP50=0.1837
- NAYAN Fine-Tuned:    Precision=0.9735, Recall=1.0, AP50=0.9735

### `TRUCK`
- Ground Truth instances in test set: **130**
- Pretrained Baseline: Precision=0.1742, Recall=0.5308, AP50=0.0925
- NAYAN Fine-Tuned:    Precision=0.947, Recall=0.9615, AP50=0.9105

---

## Model Acceptance Verdict
**DECISION: APPROVED FOR DEPLOYMENT**
- The fine-tuned model establishes robust detection on both critical domain targets (`ambulance` and `auto_rickshaw`) which had 0.0 recall on the pretrained model.
- Pretrained COCO weights lack representations for emergency sirens/strobes and 3-wheeled auto-rickshaws.
- Transfer learning with 6,961 audited images on NVIDIA GeForce RTX 4050 Laptop GPU successfully achieved domain adaptation.
