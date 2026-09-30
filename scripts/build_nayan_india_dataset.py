"""
NAYAN India Emergency Traffic Dataset Builder & Auditor
Consolidates permissively licensed Indian traffic and emergency vehicle datasets
into a unified, verified YOLO dataset with zero leakage across train/val/test splits.

Target Classes:
0: ambulance
1: car
2: motorcycle
3: auto_rickshaw
4: bus
5: truck
"""
import os
import shutil
import zipfile
import json
import hashlib
from PIL import Image
from typing import Dict, List, Tuple, Set

TARGET_CLASSES = {
    0: "ambulance",
    1: "car",
    2: "motorcycle",
    3: "auto_rickshaw",
    4: "bus",
    5: "truck"
}

DATASET_ROOT = os.path.abspath("datasets/nayan_india")
DOWNLOADS_DIR = os.path.abspath("datasets/downloads")
ARTIFACTS_DIR = os.path.abspath("artifacts")

def init_directories():
    for split in ["train", "val", "test"]:
        os.makedirs(os.path.join(DATASET_ROOT, "images", split), exist_ok=True)
        os.makedirs(os.path.join(DATASET_ROOT, "labels", split), exist_ok=True)
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)

def get_file_hash(filepath: str) -> str:
    hasher = hashlib.md5()
    with open(filepath, 'rb') as f:
        buf = f.read(65536)
        while len(buf) > 0:
            hasher.update(buf)
            buf = f.read(65536)
    return hasher.hexdigest()

def normalize_yolo_bbox(line: str) -> Tuple[int, float, float, float, float]:
    parts = line.strip().split()
    if len(parts) < 5:
        raise ValueError(f"Malformed line: {line}")
    cls_id = int(parts[0])
    x, y, w, h = float(parts[1]), float(parts[2]), float(parts[3]), float(parts[4])
    # Clamp bounding box coordinates strictly to [0, 1]
    x = max(0.0, min(1.0, x))
    y = max(0.0, min(1.0, y))
    w = max(0.001, min(1.0, w))
    h = max(0.001, min(1.0, h))
    return (cls_id, x, y, w, h)

def process_ambdataset(seen_hashes: Set[str], stats: Dict) -> None:
    """Process AMBdataset.zip (Omer Aucmq Ambulance Detection, CC BY 4.0)"""
    zip_path = os.path.join(DOWNLOADS_DIR, "AMBdataset.zip")
    if not os.path.exists(zip_path):
        print(f"Skipping {zip_path}: not found")
        return

    print("Processing AMBdataset.zip...")
    with zipfile.ZipFile(zip_path, 'r') as z:
        for fname in z.namelist():
            if not fname.endswith(('.jpg', '.png', '.jpeg')):
                continue
            
            # Determine split
            if 'train' in fname:
                split = 'train'
            elif 'valid' in fname or 'val' in fname:
                split = 'val'
            elif 'test' in fname:
                split = 'test'
            else:
                continue

            # Check corresponding label
            lbl_name = fname.replace('/images/', '/labels/').rsplit('.', 1)[0] + '.txt'
            if lbl_name not in z.namelist():
                stats["missing_labels"] += 1
                continue

            # Read image and compute hash
            img_bytes = z.read(fname)
            im_hash = hashlib.md5(img_bytes).hexdigest()
            if im_hash in seen_hashes:
                stats["duplicate_count"] += 1
                continue
            seen_hashes.add(im_hash)

            # Check valid image
            try:
                from io import BytesIO
                with Image.open(BytesIO(img_bytes)) as im:
                    im.verify()
            except Exception:
                stats["corrupt_count"] += 1
                continue

            # Read label lines
            lbl_content = z.read(lbl_name).decode('utf-8', errors='ignore')
            new_lines = []
            for line in lbl_content.strip().splitlines():
                if not line.strip():
                    continue
                try:
                    _, x, y, w, h = normalize_yolo_bbox(line)
                    # In AMBdataset, 0 is Ambulance -> target class 0
                    new_lines.append(f"0 {x:.6f} {y:.6f} {w:.6f} {h:.6f}")
                    stats["class_counts"]["ambulance"] += 1
                except Exception:
                    stats["malformed_labels"] += 1

            if not new_lines:
                stats["empty_images"] += 1
                continue

            # Write image and label
            base_name = f"amb_omer_{os.path.basename(fname)}"
            out_img = os.path.join(DATASET_ROOT, "images", split, base_name)
            out_lbl = os.path.join(DATASET_ROOT, "labels", split, os.path.splitext(base_name)[0] + ".txt")

            with open(out_img, 'wb') as f:
                f.write(img_bytes)
            with open(out_lbl, 'w') as f:
                f.write("\n".join(new_lines) + "\n")

            stats[f"{split}_images"] += 1
            stats["total_images"] += 1

def process_emergency_vehicles(seen_hashes: Set[str], stats: Dict) -> None:
    """Process emergency_vehicles.zip (Najmus Sabir Emergency Vehicle, CC BY 4.0)"""
    zip_path = os.path.join(DOWNLOADS_DIR, "emergency_vehicles.zip")
    if not os.path.exists(zip_path):
        print(f"Skipping {zip_path}: not found")
        return

    print("Processing emergency_vehicles.zip...")
    # Original classes: 0: ambulance, 1: fire-truck, 2: vehicle
    with zipfile.ZipFile(zip_path, 'r') as z:
        for fname in z.namelist():
            if not fname.endswith(('.jpg', '.png', '.jpeg')):
                continue
            
            if 'train' in fname:
                split = 'train'
            elif 'valid' in fname or 'val' in fname:
                split = 'val'
            elif 'test' in fname:
                split = 'test'
            else:
                continue

            lbl_name = fname.replace('/images/', '/labels/').rsplit('.', 1)[0] + '.txt'
            if lbl_name not in z.namelist():
                stats["missing_labels"] += 1
                continue

            img_bytes = z.read(fname)
            im_hash = hashlib.md5(img_bytes).hexdigest()
            if im_hash in seen_hashes:
                stats["duplicate_count"] += 1
                continue
            seen_hashes.add(im_hash)

            try:
                from io import BytesIO
                with Image.open(BytesIO(img_bytes)) as im:
                    im.verify()
            except Exception:
                stats["corrupt_count"] += 1
                continue

            lbl_content = z.read(lbl_name).decode('utf-8', errors='ignore')
            new_lines = []
            for line in lbl_content.strip().splitlines():
                if not line.strip():
                    continue
                try:
                    src_cls, x, y, w, h = normalize_yolo_bbox(line)
                    if src_cls == 0:
                        target_cls = 0 # ambulance
                        stats["class_counts"]["ambulance"] += 1
                    elif src_cls == 1:
                        target_cls = 5 # truck (fire-truck)
                        stats["class_counts"]["truck"] += 1
                    elif src_cls == 2:
                        target_cls = 1 # car / vehicle
                        stats["class_counts"]["car"] += 1
                    else:
                        continue
                    new_lines.append(f"{target_cls} {x:.6f} {y:.6f} {w:.6f} {h:.6f}")
                except Exception:
                    stats["malformed_labels"] += 1

            if not new_lines:
                stats["empty_images"] += 1
                continue

            base_name = f"amb_sabir_{os.path.basename(fname)}"
            out_img = os.path.join(DATASET_ROOT, "images", split, base_name)
            out_lbl = os.path.join(DATASET_ROOT, "labels", split, os.path.splitext(base_name)[0] + ".txt")

            with open(out_img, 'wb') as f:
                f.write(img_bytes)
            with open(out_lbl, 'w') as f:
                f.write("\n".join(new_lines) + "\n")

            stats[f"{split}_images"] += 1
            stats["total_images"] += 1

def process_autorickshaw(seen_hashes: Set[str], stats: Dict) -> None:
    """Process autorickshaw.zip (Ayush Das imt2019014auto, CC BY 4.0)"""
    zip_path = os.path.join(DOWNLOADS_DIR, "autorickshaw.zip")
    if not os.path.exists(zip_path):
        print(f"Skipping {zip_path}: not found")
        return

    print("Processing autorickshaw.zip...")
    # Original class: 0: auto -> target class 3 (auto_rickshaw)
    with zipfile.ZipFile(zip_path, 'r') as z:
        for fname in z.namelist():
            if not fname.endswith(('.jpg', '.png', '.jpeg')):
                continue
            
            if 'train' in fname:
                split = 'train'
            elif 'valid' in fname or 'val' in fname:
                split = 'val'
            elif 'test' in fname:
                split = 'test'
            else:
                continue

            lbl_name = fname.replace('/images/', '/labels/').rsplit('.', 1)[0] + '.txt'
            if lbl_name not in z.namelist():
                stats["missing_labels"] += 1
                continue

            img_bytes = z.read(fname)
            im_hash = hashlib.md5(img_bytes).hexdigest()
            if im_hash in seen_hashes:
                stats["duplicate_count"] += 1
                continue
            seen_hashes.add(im_hash)

            try:
                from io import BytesIO
                with Image.open(BytesIO(img_bytes)) as im:
                    im.verify()
            except Exception:
                stats["corrupt_count"] += 1
                continue

            lbl_content = z.read(lbl_name).decode('utf-8', errors='ignore')
            new_lines = []
            for line in lbl_content.strip().splitlines():
                if not line.strip():
                    continue
                try:
                    _, x, y, w, h = normalize_yolo_bbox(line)
                    target_cls = 3 # auto_rickshaw
                    stats["class_counts"]["auto_rickshaw"] += 1
                    new_lines.append(f"{target_cls} {x:.6f} {y:.6f} {w:.6f} {h:.6f}")
                except Exception:
                    stats["malformed_labels"] += 1

            if not new_lines:
                stats["empty_images"] += 1
                continue

            base_name = f"auto_ayush_{os.path.basename(fname)}"
            out_img = os.path.join(DATASET_ROOT, "images", split, base_name)
            out_lbl = os.path.join(DATASET_ROOT, "labels", split, os.path.splitext(base_name)[0] + ".txt")

            with open(out_img, 'wb') as f:
                f.write(img_bytes)
            with open(out_lbl, 'w') as f:
                f.write("\n".join(new_lines) + "\n")

            stats[f"{split}_images"] += 1
            stats["total_images"] += 1

def process_indian_traffic_repo(seen_hashes: Set[str], stats: Dict) -> None:
    """
    Process Indian Traffic Vehicle Dataset (Akashkg03/VEHICLE-OBJECT-DETECTION-USING-YOLOv8n)
    Original classes:
    0: Motorized2wheleer -> 2 (motorcycle)
    1: ambasador_taxi    -> 1 (car)
    2: autorickshaw      -> 3 (auto_rickshaw)
    3: bicycle           -> ignored / filtered
    4: bus               -> 4 (bus)
    5: car               -> 1 (car)
    6: minitruck         -> 5 (truck)
    7: motarvan          -> 1 (car)
    8: rickshaw          -> ignored (cycle rickshaw) / or auto_rickshaw
    9: toto              -> 3 (auto_rickshaw - e-rickshaw)
    10: truck            -> 5 (truck)
    11: van              -> 1 (car)
    """
    repo_base = os.path.join(DOWNLOADS_DIR, "indian_traffic_repo", "data")
    if not os.path.exists(repo_base):
        print(f"Skipping {repo_base}: not found")
        return

    print("Processing indian_traffic_repo...")
    mapping = {
        0: (2, "motorcycle"),
        1: (1, "car"),
        2: (3, "auto_rickshaw"),
        4: (4, "bus"),
        5: (1, "car"),
        6: (5, "truck"),
        7: (1, "car"),
        9: (3, "auto_rickshaw"),
        10: (5, "truck"),
        11: (1, "car")
    }

    split_map = {
        "train": "train",
        "valid": "val",
        "test": "test"
    }

    for src_split, target_split in split_map.items():
        img_dir = os.path.join(repo_base, src_split, "images")
        lbl_dir = os.path.join(repo_base, src_split, "labels")
        if not os.path.exists(img_dir):
            continue

        for fname in os.listdir(img_dir):
            if not fname.endswith(('.jpg', '.png', '.jpeg')):
                continue

            img_path = os.path.join(img_dir, fname)
            lbl_path = os.path.join(lbl_dir, os.path.splitext(fname)[0] + ".txt")

            if not os.path.exists(lbl_path):
                stats["missing_labels"] += 1
                continue

            im_hash = get_file_hash(img_path)
            if im_hash in seen_hashes:
                stats["duplicate_count"] += 1
                continue
            seen_hashes.add(im_hash)

            try:
                with Image.open(img_path) as im:
                    im.verify()
            except Exception:
                stats["corrupt_count"] += 1
                continue

            with open(lbl_path, 'r', encoding='utf-8', errors='ignore') as fp:
                lines = fp.readlines()

            new_lines = []
            for line in lines:
                if not line.strip():
                    continue
                try:
                    src_cls, x, y, w, h = normalize_yolo_bbox(line)
                    if src_cls in mapping:
                        target_cls, cls_name = mapping[src_cls]
                        stats["class_counts"][cls_name] += 1
                        new_lines.append(f"{target_cls} {x:.6f} {y:.6f} {w:.6f} {h:.6f}")
                except Exception:
                    stats["malformed_labels"] += 1

            if not new_lines:
                stats["empty_images"] += 1
                continue

            base_name = f"ind_{src_split}_{fname}"
            out_img = os.path.join(DATASET_ROOT, "images", target_split, base_name)
            out_lbl = os.path.join(DATASET_ROOT, "labels", target_split, os.path.splitext(base_name)[0] + ".txt")

            shutil.copy2(img_path, out_img)
            with open(out_lbl, 'w') as f:
                f.write("\n".join(new_lines) + "\n")

            stats[f"{target_split}_images"] += 1
            stats["total_images"] += 1

def generate_yaml_and_report(stats: Dict):
    dataset_yaml_content = f"""# NAYAN India Emergency Traffic Dataset
# Built autonomously for transfer learning on Indian mixed traffic & emergency corridors

path: {DATASET_ROOT.replace('\\\\', '/')}
train: images/train
val: images/val
test: images/test

nc: 6
names:
  0: ambulance
  1: car
  2: motorcycle
  3: auto_rickshaw
  4: bus
  5: truck
"""
    yaml_path = os.path.join(DATASET_ROOT, "dataset.yaml")
    with open(yaml_path, 'w', encoding='utf-8') as f:
        f.write(dataset_yaml_content)
    print(f"Created {yaml_path}")

    # Generate dataset report
    report = {
        "total_images": stats["total_images"],
        "train_images": stats["train_images"],
        "val_images": stats["val_images"],
        "test_images": stats["test_images"],
        "class_counts": stats["class_counts"],
        "dataset_sources": [
            {
                "name": "Omer Aucmq Ambulance Detection",
                "license": "CC BY 4.0",
                "focus": "Ambulance in urban emergency scenarios",
                "url": "https://universe.roboflow.com/omer-aucmq/ambulance_detection-z5tqb-wwpbw/dataset/2"
            },
            {
                "name": "Najmus Sabir Emergency Vehicle & Density Dataset",
                "license": "CC BY 4.0",
                "focus": "Ambulance, fire trucks, mixed traffic density",
                "url": "https://universe.roboflow.com/emergency-vehicle-detection-sabir/vehicle-detc./dataset/1"
            },
            {
                "name": "Ayush Das Auto Rickshaw Dataset",
                "license": "CC BY 4.0",
                "focus": "Indian auto-rickshaws in street traffic",
                "url": "https://universe.roboflow.com/ayush-das/imt2019014auto"
            },
            {
                "name": "Akashkg03 Indian Vehicle Traffic Dataset",
                "license": "Open Source / Permissive Research",
                "focus": "Motorcycles, auto-rickshaws, ambassador taxis, buses, trucks, vans in Indian road conditions",
                "url": "https://github.com/Akashkg03/VEHICLE-OBJECT-DETECTION-USING-YOLOv8n"
            }
        ],
        "duplicate_count": stats["duplicate_count"],
        "corrupt_count": stats["corrupt_count"],
        "missing_labels": stats["missing_labels"],
        "malformed_labels": stats["malformed_labels"],
        "empty_images": stats["empty_images"]
    }

    report_path = os.path.join(ARTIFACTS_DIR, "dataset_report.json")
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)
    print(f"Created {report_path}")
    print("\nDataset Summary:")
    print(json.dumps(report, indent=2))

def main():
    print("Initializing NAYAN India Dataset Construction...")
    init_directories()
    seen_hashes = set()
    stats = {
        "total_images": 0,
        "train_images": 0,
        "val_images": 0,
        "test_images": 0,
        "class_counts": {
            "ambulance": 0,
            "car": 0,
            "motorcycle": 0,
            "auto_rickshaw": 0,
            "bus": 0,
            "truck": 0
        },
        "duplicate_count": 0,
        "corrupt_count": 0,
        "missing_labels": 0,
        "malformed_labels": 0,
        "empty_images": 0
    }

    process_ambdataset(seen_hashes, stats)
    process_emergency_vehicles(seen_hashes, stats)
    process_autorickshaw(seen_hashes, stats)
    process_indian_traffic_repo(seen_hashes, stats)

    generate_yaml_and_report(stats)

if __name__ == "__main__":
    main()
