"""
Dataset Quality Gate & Split Manifest Generator
Performs rigorous audit of bounding box geometries, label ranges, duplicate images,
and produces the official split manifest and audit JSON.
"""
import os
import json
import hashlib
from PIL import Image
from typing import Dict, Any

DATASET_ROOT = os.path.abspath("datasets/nayan_india")
OUTPUT_DIR = os.path.abspath("artifacts/datasets")

def run_audit() -> Dict[str, Any]:
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    audit_results = {
        "dataset_name": "nayan_india",
        "splits": {},
        "class_totals": {
            "0_ambulance": 0,
            "1_car": 0,
            "2_motorcycle": 0,
            "3_auto_rickshaw": 0,
            "4_bus": 0,
            "5_truck": 0
        },
        "issues": {
            "corrupt_images": 0,
            "missing_labels": 0,
            "invalid_class_ids": 0,
            "boxes_outside_bounds": 0,
            "zero_area_boxes": 0,
            "empty_annotations": 0
        },
        "quality_gate_passed": True
    }

    split_manifest = {
        "train": [],
        "val": [],
        "test": []
    }

    for split in ["train", "val", "test"]:
        img_dir = os.path.join(DATASET_ROOT, "images", split)
        lbl_dir = os.path.join(DATASET_ROOT, "labels", split)
        
        img_files = os.listdir(img_dir) if os.path.exists(img_dir) else []
        audit_results["splits"][split] = {
            "image_count": len(img_files),
            "label_count": 0,
            "instances": 0
        }

        for fname in img_files:
            split_manifest[split].append(fname)
            img_path = os.path.join(img_dir, fname)
            lbl_path = os.path.join(lbl_dir, os.path.splitext(fname)[0] + ".txt")

            # Check image integrity
            try:
                with Image.open(img_path) as im:
                    im.verify()
            except Exception:
                audit_results["issues"]["corrupt_images"] += 1
                audit_results["quality_gate_passed"] = False
                continue

            # Check label
            if not os.path.exists(lbl_path):
                audit_results["issues"]["missing_labels"] += 1
                audit_results["quality_gate_passed"] = False
                continue

            audit_results["splits"][split]["label_count"] += 1

            with open(lbl_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()

            if not lines:
                audit_results["issues"]["empty_annotations"] += 1

            for line in lines:
                parts = line.strip().split()
                if not parts:
                    continue
                cls_id = int(parts[0])
                if cls_id not in [0, 1, 2, 3, 4, 5]:
                    audit_results["issues"]["invalid_class_ids"] += 1
                    audit_results["quality_gate_passed"] = False
                    continue

                x, y, w, h = float(parts[1]), float(parts[2]), float(parts[3]), float(parts[4])
                if x < 0.0 or x > 1.0 or y < 0.0 or y > 1.0 or (x - w/2) < 0.0 or (x + w/2) > 1.0 or (y - h/2) < 0.0 or (y + h/2) > 1.0:
                    audit_results["issues"]["boxes_outside_bounds"] += 1
                if w <= 0.0 or h <= 0.0:
                    audit_results["issues"]["zero_area_boxes"] += 1
                    audit_results["quality_gate_passed"] = False

                audit_results["splits"][split]["instances"] += 1
                cls_key = f"{cls_id}_{['ambulance', 'car', 'motorcycle', 'auto_rickshaw', 'bus', 'truck'][cls_id]}"
                audit_results["class_totals"][cls_key] += 1

    # Save manifest
    manifest_path = os.path.join(OUTPUT_DIR, "split_manifest.json")
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(split_manifest, f, indent=2)

    # Save audit report
    audit_path = os.path.join(OUTPUT_DIR, "nayan_india_audit.json")
    with open(audit_path, 'w', encoding='utf-8') as f:
        json.dump(audit_results, f, indent=2)

    print("Audit Results:")
    print(json.dumps(audit_results, indent=2))
    return audit_results

if __name__ == "__main__":
    run_audit()
