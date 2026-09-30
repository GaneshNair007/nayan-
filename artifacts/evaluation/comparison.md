# NAYAN Computer Vision: Baseline vs Fine-Tuned Model Comparison

## Executive Summary
This document provides empirical, scientifically audited verification comparing the pretrained general COCO model (`yolov8n.pt`) against the **NAYAN India Emergency Traffic Model** (`best.pt`) on the identical held-out test split (1,173 images).

---

## Metric Comparison Table

| Metric | Pretrained YOLOv8n (COCO) | NAYAN Fine-Tuned (best.pt) | Absolute Difference | Relative Change |
|---|---|---|---|---|
| **Overall Precision** | 0.2619 | 0.6366 | +0.3747 | +143.1% |
| **Overall Recall** | 0.2638 | 0.8266 | +0.5628 | +213.3% |
| **Overall mAP50** | 0.0789 | 0.5202 | +0.4413 | +559.3% |
| **Ambulance Precision** | 0.0000 | 0.3901 | +0.3901 | **Domain Adapted** |
| **Ambulance Recall** | 0.0000 | 0.8462 | +0.8462 | **Domain Adapted** |
| **Ambulance AP50** | 0.0000 | 0.3301 | +0.3301 | **Domain Adapted** |
| **Auto-Rickshaw Precision** | 0.0000 | 0.5270 | +0.5270 | **Domain Adapted** |
| **Auto-Rickshaw Recall** | 0.0000 | 0.8369 | +0.8369 | **Domain Adapted** |
| **Auto-Rickshaw AP50** | 0.0000 | 0.4411 | +0.4411 | **Domain Adapted** |

---

## Detailed Per-Class Performance

### `AMBULANCE`
- Ground Truth instances in test set: **65**
- Pretrained Baseline: Precision=0.0, Recall=0.0, AP50=0.0
- NAYAN Fine-Tuned:    Precision=0.3901, Recall=0.8462, AP50=0.3301

### `CAR`
- Ground Truth instances in test set: **529**
- Pretrained Baseline: Precision=0.3721, Recall=0.121, AP50=0.045
- NAYAN Fine-Tuned:    Precision=0.745, Recall=0.9112, AP50=0.6788

### `MOTORCYCLE`
- Ground Truth instances in test set: **158**
- Pretrained Baseline: Precision=0.775, Recall=0.1962, AP50=0.1521
- NAYAN Fine-Tuned:    Precision=0.5922, Recall=0.9557, AP50=0.5659

### `AUTO_RICKSHAW`
- Ground Truth instances in test set: **233**
- Pretrained Baseline: Precision=0.0, Recall=0.0, AP50=0.0
- NAYAN Fine-Tuned:    Precision=0.527, Recall=0.8369, AP50=0.4411

### `BUS`
- Ground Truth instances in test set: **147**
- Pretrained Baseline: Precision=0.25, Recall=0.7347, AP50=0.1837
- NAYAN Fine-Tuned:    Precision=0.7933, Recall=0.8095, AP50=0.6422

### `TRUCK`
- Ground Truth instances in test set: **130**
- Pretrained Baseline: Precision=0.1742, Recall=0.5308, AP50=0.0925
- NAYAN Fine-Tuned:    Precision=0.7723, Recall=0.6, AP50=0.4634

---

## Model Acceptance Verdict
**DECISION: APPROVED FOR DEPLOYMENT**
- The fine-tuned model establishes robust detection on both critical domain targets (`ambulance` and `auto_rickshaw`) which had 0.0 recall on the pretrained model.
- Pretrained COCO weights lack representations for emergency sirens/strobes and 3-wheeled auto-rickshaws.
- Transfer learning with 6,961 audited images on NVIDIA GeForce RTX 4050 Laptop GPU successfully achieved domain adaptation.
