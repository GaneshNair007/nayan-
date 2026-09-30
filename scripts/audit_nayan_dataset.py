import os
import json
import hashlib
from pathlib import Path

def audit_dataset():
    dataset_dir = Path(r"c:\nayan\datasets\nayan_india_v2")
    artifacts_dir = Path(r"c:\nayan\artifacts")
    os.makedirs(artifacts_dir, exist_ok=True)

    splits = ["train", "val", "test"]
    allowed_class_ids = set(range(6)) # 0: ambulance, 1: car, 2: motorcycle, 3: auto_rickshaw, 4: bus, 5: truck

    results = {
        "dataset": "nayan_india_v2",
        "timestamp": "2026-09-30",
        "critical_issues": 0,
        "warnings": 0,
        "splits_summary": {},
        "file_integrity": {
            "missing_images": 0,
            "missing_labels": 0,
            "empty_labels": 0,
            "corrupt_images": 0
        },
        "bbox_integrity": {
            "invalid_boxes": 0,
            "invalid_class_ids": 0
        },
        "overlap_audit": {
            "train_val_overlap": 0,
            "train_test_overlap": 0,
            "val_test_overlap": 0
        },
        "issues_detail": []
    }

    image_hashes = {}
    split_manifest = {"train": [], "val": [], "test": []}

    for split in splits:
        img_dir = dataset_dir / "images" / split
        lbl_dir = dataset_dir / "labels" / split

        img_files = {f.stem: f for f in img_dir.glob("*") if f.is_file()}
        lbl_files = {f.stem: f for f in lbl_dir.glob("*") if f.is_file()}

        split_class_counts = {cid: 0 for cid in range(6)}
        valid_pairs = 0

        # Check missing labels for images
        for stem, img_path in img_files.items():
            split_manifest[split].append(img_path.name)
            if stem not in lbl_files:
                results["file_integrity"]["missing_labels"] += 1
                results["critical_issues"] += 1
                results["issues_detail"].append(f"Missing label file for image: {img_path}")
            else:
                valid_pairs += 1

            # Compute image hash for overlap / duplicate detection
            try:
                with open(img_path, "rb") as f:
                    file_hash = hashlib.md5(f.read()).hexdigest()
                if file_hash in image_hashes:
                    prev_split, prev_name = image_hashes[file_hash]
                    if prev_split != split:
                        results["overlap_audit"][f"{prev_split}_{split}_overlap"] = \
                            results["overlap_audit"].get(f"{prev_split}_{split}_overlap", 0) + 1
                        results["critical_issues"] += 1
                        results["issues_detail"].append(
                            f"Data leakage/duplicate image between {prev_split} ({prev_name}) and {split} ({img_path.name})"
                        )
                else:
                    image_hashes[file_hash] = (split, img_path.name)
            except Exception as e:
                results["file_integrity"]["corrupt_images"] += 1
                results["critical_issues"] += 1
                results["issues_detail"].append(f"Corrupt image file: {img_path}: {e}")

        # Check missing images for labels
        for stem, lbl_path in lbl_files.items():
            if stem not in img_files:
                results["file_integrity"]["missing_images"] += 1
                results["critical_issues"] += 1
                results["issues_detail"].append(f"Missing image file for label: {lbl_path}")
            else:
                # Audit bounding boxes in label file
                try:
                    with open(lbl_path, "r") as f:
                        lines = [line.strip() for line in f if line.strip()]
                    if not lines:
                        results["file_integrity"]["empty_labels"] += 1
                        # Empty labels are allowed in YOLO (background frames), record as warning
                        results["warnings"] += 1

                    for line_idx, line in enumerate(lines):
                        parts = line.split()
                        if len(parts) != 5:
                            results["bbox_integrity"]["invalid_boxes"] += 1
                            results["critical_issues"] += 1
                            results["issues_detail"].append(f"Invalid label format in {lbl_path} line {line_idx+1}")
                            continue

                        cid = int(parts[0])
                        x, y, w, h = map(float, parts[1:])

                        if cid not in allowed_class_ids:
                            results["bbox_integrity"]["invalid_class_ids"] += 1
                            results["critical_issues"] += 1
                            results["issues_detail"].append(f"Invalid class ID {cid} in {lbl_path}")
                        else:
                            split_class_counts[cid] += 1

                        if not (0.0 <= x <= 1.0 and 0.0 <= y <= 1.0 and 0.0 < w <= 1.0 and 0.0 < h <= 1.0):
                            results["bbox_integrity"]["invalid_boxes"] += 1
                            results["critical_issues"] += 1
                            results["issues_detail"].append(f"Out of bounds bbox coordinates in {lbl_path}: {line}")
                except Exception as e:
                    results["critical_issues"] += 1
                    results["issues_detail"].append(f"Error reading label file {lbl_path}: {e}")

        results["splits_summary"][split] = {
            "image_count": len(img_files),
            "label_count": len(lbl_files),
            "valid_pairs": valid_pairs,
            "class_counts": split_class_counts
        }

    # Write dataset audit report
    audit_output = artifacts_dir / "dataset_v2_audit.json"
    with open(audit_output, "w") as f:
        json.dump(results, f, indent=2)

    # Write split manifest
    manifest_output = artifacts_dir / "split_manifest_v2.json"
    with open(manifest_output, "w") as f:
        json.dump(split_manifest, f, indent=2)

    print("=" * 60)
    print("NAYAN DATASET V2 AUDIT COMPLETED")
    print(f"  CRITICAL ISSUES: {results['critical_issues']}")
    print(f"  WARNINGS:        {results['warnings']}")
    print(f"  AUDIT REPORT:    {audit_output}")
    print(f"  SPLIT MANIFEST:  {manifest_output}")
    print("=" * 60)

    if results["critical_issues"] > 0:
        print("CRITICAL AUDIT ISSUES FOUND:")
        for issue in results["issues_detail"][:10]:
            print(f"  - {issue}")
    else:
        print("DATASET V2 VERIFIED READY FOR CUDA TRAINING (0 CRITICAL ISSUES)")

if __name__ == "__main__":
    audit_dataset()
