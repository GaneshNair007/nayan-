import os
import sys
import hashlib
import json
import torch
from ultralytics import YOLO

def sha256_file(filepath):
    h = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(8192 * 1024):
            h.update(chunk)
    return h.hexdigest()

def verify_model():
    print("=" * 60)
    print("PHASE 3: VERIFYING TRAINED MODEL CHECKPOINT")
    print("=" * 60)
    checkpoint_path = "artifacts/models/nayan_india_v2/best.pt"
    if not os.path.exists(checkpoint_path):
        print(f"FAIL: {checkpoint_path} not found!")
        return False, {}

    sha256 = sha256_file(checkpoint_path)
    file_size_mb = os.path.getsize(checkpoint_path) / (1024 * 1024)
    print(f"Checkpoint Path: {checkpoint_path}")
    print(f"File Size:       {file_size_mb:.2f} MB")
    print(f"SHA-256:         {sha256}")

    # Load model
    model = YOLO(checkpoint_path)
    names = model.names
    print(f"Model Classes ({len(names)}): {names}")

    expected_classes = {0: 'ambulance', 1: 'car', 2: 'motorcycle', 3: 'auto_rickshaw', 4: 'bus', 5: 'truck'}
    classes_match = (names == expected_classes)
    print(f"Classes match expected 6 semantic classes: {classes_match}")

    cuda_available = torch.cuda.is_available()
    device_name = torch.cuda.get_device_name(0) if cuda_available else "CPU"
    print(f"CUDA Available:  {cuda_available} ({device_name})")

    meta = {
        "checkpoint_path": checkpoint_path,
        "sha256": sha256,
        "file_size_mb": file_size_mb,
        "names": names,
        "classes_match": classes_match,
        "cuda_available": cuda_available,
        "device_name": device_name
    }
    return classes_match, meta

def verify_dataset():
    print("\n" + "=" * 60)
    print("PHASE 4: VERIFYING DATASET PARTITIONS AND INTEGRITY")
    print("=" * 60)
    dataset_dir = "datasets/nayan_india_v2"
    if not os.path.exists(dataset_dir):
        print(f"FAIL: {dataset_dir} not found!")
        return False, {}

    splits = ['train', 'val', 'test']
    counts = {}
    missing_labels = {}
    corrupt_labels = {}
    files_per_split = {}

    for s in splits:
        img_dir = os.path.join(dataset_dir, "images", s)
        lbl_dir = os.path.join(dataset_dir, "labels", s)

        imgs = set(os.listdir(img_dir)) if os.path.exists(img_dir) else set()
        lbls = set(os.listdir(lbl_dir)) if os.path.exists(lbl_dir) else set()

        counts[s] = len(imgs)
        files_per_split[s] = imgs

        # Check pair matching
        img_stems = {os.path.splitext(f)[0] for f in imgs}
        lbl_stems = {os.path.splitext(f)[0] for f in lbls}

        missing = img_stems - lbl_stems
        missing_labels[s] = len(missing)

        # Check box validity in labels
        invalid_boxes = 0
        for lf in lbls:
            lp = os.path.join(lbl_dir, lf)
            with open(lp, 'r') as f:
                for line in f:
                    parts = line.strip().split()
                    if len(parts) >= 5:
                        cls_id = int(parts[0])
                        x, y, w, h = map(float, parts[1:5])
                        if cls_id < 0 or cls_id > 5 or w <= 0 or h <= 0 or x < 0 or y < 0:
                            invalid_boxes += 1
        corrupt_labels[s] = invalid_boxes

    print(f"Dataset Counts: TRAIN={counts.get('train')}, VAL={counts.get('val')}, TEST={counts.get('test')}")
    print(f"Missing Labels: {missing_labels}")
    print(f"Corrupt/Invalid Boxes: {corrupt_labels}")

    # Check leakage
    train_stems = {os.path.splitext(f)[0] for f in files_per_split['train']}
    val_stems = {os.path.splitext(f)[0] for f in files_per_split['val']}
    test_stems = {os.path.splitext(f)[0] for f in files_per_split['test']}

    train_val_overlap = len(train_stems & val_stems)
    train_test_overlap = len(train_stems & test_stems)
    val_test_overlap = len(val_stems & test_stems)

    print(f"Train/Val Overlap:  {train_val_overlap}")
    print(f"Train/Test Overlap: {train_test_overlap}")
    print(f"Val/Test Overlap:   {val_test_overlap}")

    valid = (
        counts.get('train', 0) > 0 and
        counts.get('val', 0) > 0 and
        counts.get('test', 0) > 0 and
        sum(missing_labels.values()) == 0 and
        sum(corrupt_labels.values()) == 0 and
        train_val_overlap == 0 and
        train_test_overlap == 0 and
        val_test_overlap == 0
    )
    print(f"Dataset Audit Result: {'PASS' if valid else 'FAIL'}")

    res = {
        "counts": counts,
        "missing_labels": missing_labels,
        "corrupt_labels": corrupt_labels,
        "train_val_overlap": train_val_overlap,
        "train_test_overlap": train_test_overlap,
        "val_test_overlap": val_test_overlap,
        "valid": valid
    }
    return valid, res

def verify_training_artifacts():
    print("\n" + "=" * 60)
    print("PHASE 5: VERIFYING TRAINING PROOFS & BENCHMARKS")
    print("=" * 60)
    proof_files = [
        "artifacts/training_v2/full_run/results.csv",
        "artifacts/training_v2/full_run/args.yaml",
        "artifacts/training_v2/full_run/confusion_matrix.png",
        "artifacts/training_v2/full_run/BoxPR_curve.png",
        "artifacts/training_v2/full_run/BoxF1_curve.png",
        "artifacts/training_v2/gpu_proof.txt",
        "artifacts/training_v2/nvidia_smi_live.txt"
    ]
    present = {pf: os.path.exists(pf) for pf in proof_files}
    for pf, exists in present.items():
        print(f"  {pf}: {'EXISTS' if exists else 'MISSING'}")

    # Inspect results.csv to verify 40 epochs
    epochs_completed = 0
    csv_path = "artifacts/training_v2/full_run/results.csv"
    if os.path.exists(csv_path):
        with open(csv_path, 'r') as f:
            lines = [l.strip() for l in f if l.strip()]
            epochs_completed = len(lines) - 1 # exclude header
    print(f"Epochs Completed in results.csv: {epochs_completed}")

    all_present = all(present.values()) and epochs_completed >= 40
    return all_present, {"proof_files": present, "epochs": epochs_completed}

if __name__ == '__main__':
    m_ok, m_meta = verify_model()
    d_ok, d_meta = verify_dataset()
    t_ok, t_meta = verify_training_artifacts()

    out = {
        "model_verification": m_meta,
        "dataset_verification": d_meta,
        "training_proofs": t_meta,
        "all_passed": (m_ok and d_ok and t_ok)
    }
    os.makedirs("artifacts/backend_hardening", exist_ok=True)
    with open("artifacts/backend_hardening/model_dataset_proof.json", "w") as f:
        json.dump(out, f, indent=2)
    print("\nSaved proof to artifacts/backend_hardening/model_dataset_proof.json")
    if not (m_ok and d_ok and t_ok):
        sys.exit(1)
