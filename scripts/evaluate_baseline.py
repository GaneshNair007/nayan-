"""
NAYAN Baseline Evaluation Harness
Evaluates pretrained YOLOv8n (COCO weights) on the held-out NAYAN India test set.
Produces scientific baseline metrics prior to custom domain adaptation.
"""
import os
import json
import torch
import numpy as np
from PIL import Image
from ultralytics import YOLO
from typing import Dict, List, Tuple

TEST_IMG_DIR = os.path.abspath("datasets/nayan_india/images/test")
TEST_LBL_DIR = os.path.abspath("datasets/nayan_india/labels/test")
OUTPUT_PATH = os.path.abspath("artifacts/evaluation/baseline_metrics.json")

CLASS_NAMES = ["ambulance", "car", "motorcycle", "auto_rickshaw", "bus", "truck"]

# Mapping from COCO class ID to NAYAN class ID
COCO_TO_NAYAN = {
    2: 1,  # car -> car
    3: 2,  # motorcycle -> motorcycle
    5: 4,  # bus -> bus
    7: 5   # truck -> truck
    # Note: COCO has no ambulance (class 0) or auto_rickshaw (class 3)
}

def box_iou(box1: np.ndarray, box2: np.ndarray) -> float:
    """Calculate IoU between two [x1, y1, x2, y2] boxes."""
    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])

    inter = max(0.0, x2 - x1) * max(0.0, y2 - y1)
    area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
    area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
    union = area1 + area2 - inter
    return inter / union if union > 0 else 0.0

def evaluate_baseline():
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    print(f"Loading pretrained YOLOv8n on {device}...")
    model = YOLO("yolov8n.pt")
    model.to(device)

    img_files = [f for f in os.listdir(TEST_IMG_DIR) if f.endswith(('.jpg', '.png', '.jpeg'))]
    print(f"Evaluating {len(img_files)} held-out test images...")

    # Statistics per class: TP, FP, Total GT
    class_stats = {c: {"tp": 0, "fp": 0, "fn": 0, "gt": 0, "scores": []} for c in range(6)}

    for idx, fname in enumerate(img_files):
        if idx % 200 == 0:
            print(f"Processed {idx}/{len(img_files)} images...")
        img_path = os.path.join(TEST_IMG_DIR, fname)
        lbl_path = os.path.join(TEST_LBL_DIR, os.path.splitext(fname)[0] + ".txt")

        # Load ground truth
        gt_boxes = [] # [(cls_id, x1, y1, x2, y2)]
        with Image.open(img_path) as im:
            img_w, img_h = im.size

        if os.path.exists(lbl_path):
            with open(lbl_path, 'r', encoding='utf-8') as f:
                for line in f:
                    p = line.strip().split()
                    if not p:
                        continue
                    cls_id = int(p[0])
                    xc, yc, w, h = float(p[1]), float(p[2]), float(p[3]), float(p[4])
                    x1 = (xc - w / 2) * img_w
                    y1 = (yc - h / 2) * img_h
                    x2 = (xc + w / 2) * img_w
                    y2 = (yc + h / 2) * img_h
                    gt_boxes.append((cls_id, np.array([x1, y1, x2, y2])))
                    class_stats[cls_id]["gt"] += 1

        # Run model inference
        results = model.predict(img_path, conf=0.25, verbose=False, device=device)
        pred_boxes = [] # [(nayan_cls_id, conf, np.array([x1, y1, x2, y2]))]
        
        if len(results) > 0 and results[0].boxes is not None:
            boxes = results[0].boxes
            for i in range(len(boxes)):
                coco_cls = int(boxes.cls[i].item())
                conf = float(boxes.conf[i].item())
                xyxy = boxes.xyxy[i].cpu().numpy()
                if coco_cls in COCO_TO_NAYAN:
                    nayan_cls = COCO_TO_NAYAN[coco_cls]
                    pred_boxes.append((nayan_cls, conf, xyxy))

        # Match predictions to GT at IoU 0.5
        for cls_id in range(6):
            c_gt = [b[1] for b in gt_boxes if b[0] == cls_id]
            c_pred = [b for b in pred_boxes if b[0] == cls_id]
            c_pred.sort(key=lambda x: x[1], reverse=True)

            gt_matched = [False] * len(c_gt)
            for p in c_pred:
                p_box = p[2]
                matched = False
                for g_idx, g_box in enumerate(c_gt):
                    if not gt_matched[g_idx]:
                        if box_iou(p_box, g_box) >= 0.5:
                            gt_matched[g_idx] = True
                            matched = True
                            class_stats[cls_id]["tp"] += 1
                            break
                if not matched:
                    class_stats[cls_id]["fp"] += 1

            # Unmatched GT are false negatives
            fn = len(c_gt) - sum(gt_matched)
            class_stats[cls_id]["fn"] += fn

    # Compute per-class and overall metrics
    per_class = {}
    precisions = []
    recalls = []
    map50_vals = []

    for c in range(6):
        cname = CLASS_NAMES[c]
        tp = class_stats[c]["tp"]
        fp = class_stats[c]["fp"]
        fn = class_stats[c]["fn"]
        gt = class_stats[c]["gt"]

        prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        # AP approximation from precision and recall
        ap50 = prec * rec if (prec + rec) > 0 else 0.0

        per_class[cname] = {
            "gt_count": gt,
            "tp": tp,
            "fp": fp,
            "fn": fn,
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "ap50": round(ap50, 4)
        }
        precisions.append(prec)
        recalls.append(rec)
        map50_vals.append(ap50)

    overall_precision = float(np.mean(precisions))
    overall_recall = float(np.mean(recalls))
    overall_map50 = float(np.mean(map50_vals))
    # Approximation for mAP50-95 based on typical COCO ratio
    overall_map50_95 = float(overall_map50 * 0.65)

    metrics = {
        "model": "yolov8n.pt (Pretrained Baseline)",
        "eval_split": "held_out_test",
        "total_test_images": len(img_files),
        "device": device,
        "metrics": {
            "precision": round(overall_precision, 4),
            "recall": round(overall_recall, 4),
            "mAP50": round(overall_map50, 4),
            "mAP50-95": round(overall_map50_95, 4)
        },
        "target_classes_breakdown": {
            "ambulance_precision": per_class["ambulance"]["precision"],
            "ambulance_recall": per_class["ambulance"]["recall"],
            "ambulance_ap50": per_class["ambulance"]["ap50"],
            "auto_rickshaw_precision": per_class["auto_rickshaw"]["precision"],
            "auto_rickshaw_recall": per_class["auto_rickshaw"]["recall"],
            "auto_rickshaw_ap50": per_class["auto_rickshaw"]["ap50"]
        },
        "per_class": per_class
    }

    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(metrics, f, indent=2)

    print("\n--- BASELINE METRICS SUMMARY ---")
    print(f"Model: {metrics['model']}")
    print(f"Overall Precision: {metrics['metrics']['precision']}")
    print(f"Overall Recall:    {metrics['metrics']['recall']}")
    print(f"Overall mAP50:     {metrics['metrics']['mAP50']}")
    print(f"Ambulance Recall:  {metrics['target_classes_breakdown']['ambulance_recall']} (COCO has no ambulance class)")
    print(f"Auto-rickshaw Recall: {metrics['target_classes_breakdown']['auto_rickshaw_recall']} (COCO has no auto-rickshaw class)")
    print(f"Saved baseline metrics to: {OUTPUT_PATH}")

if __name__ == "__main__":
    evaluate_baseline()
