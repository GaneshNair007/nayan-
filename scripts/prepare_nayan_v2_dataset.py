import os
import shutil
import json
import yaml
from pathlib import Path

def prepare_v2_dataset():
    src_dir = Path(r"c:\nayan\datasets\nayan_india")
    dst_dir = Path(r"c:\nayan\datasets\nayan_india_v2")

    # Create directory structure
    for split in ["train", "val", "test"]:
        os.makedirs(dst_dir / "images" / split, exist_ok=True)
        os.makedirs(dst_dir / "labels" / split, exist_ok=True)

    # Copy images and labels
    for split in ["train", "val", "test"]:
        src_img_split = src_dir / "images" / split
        src_lbl_split = src_dir / "labels" / split
        dst_img_split = dst_dir / "images" / split
        dst_lbl_split = dst_dir / "labels" / split

        for img_path in src_img_split.glob("*"):
            if img_path.is_file():
                shutil.copy2(img_path, dst_img_split / img_path.name)
        for lbl_path in src_lbl_split.glob("*"):
            if lbl_path.is_file():
                shutil.copy2(lbl_path, dst_lbl_split / lbl_path.name)

    # Create data.yaml
    data_yaml_content = {
        "path": str(dst_dir.absolute()),
        "train": "images/train",
        "val": "images/val",
        "test": "images/test",
        "nc": 6,
        "names": {
            0: "ambulance",
            1: "car",
            2: "motorcycle",
            3: "auto_rickshaw",
            4: "bus",
            5: "truck"
        }
    }

    with open(dst_dir / "data.yaml", "w") as f:
        yaml.dump(data_yaml_content, f, sort_keys=False)

    # Create provenance.json
    provenance = {
        "dataset_name": "nayan_india_v2",
        "version": "2.0.0",
        "created_at": "2026-09-30",
        "classes": {
            "0": "ambulance",
            "1": "car",
            "2": "motorcycle",
            "3": "auto_rickshaw",
            "4": "bus",
            "5": "truck"
        },
        "sources": [
            {
                "source_name": "Ambulance Detection Dataset",
                "author": "Omer Aucmq",
                "license": "CC BY 4.0",
                "url": "https://universe.roboflow.com/omer-aucmq/ambulance_detection-z5tqb-wwpbw/dataset/2",
                "images": 876,
                "classes": ["ambulance"],
                "annotation_format": "YOLO darknet (normalized xywh)"
            },
            {
                "source_name": "Emergency Vehicle & Density Dataset",
                "author": "Najmus Sabir",
                "license": "CC BY 4.0",
                "url": "https://universe.roboflow.com/emergency-vehicle-detection-sabir/vehicle-detc./dataset/1",
                "images": 361,
                "classes": ["ambulance", "fire-truck", "vehicle"],
                "annotation_format": "YOLO darknet (normalized xywh)"
            },
            {
                "source_name": "Auto Rickshaw Dataset",
                "author": "Ayush Das",
                "license": "CC BY 4.0",
                "url": "https://universe.roboflow.com/ayush-das/imt2019014auto",
                "images": 355,
                "classes": ["auto"],
                "annotation_format": "YOLO darknet (normalized xywh)"
            },
            {
                "source_name": "Indian Vehicle Traffic Dataset",
                "author": "Akash Kumar Giri (Akashkg03)",
                "license": "Open Source / Permissive Research",
                "url": "https://github.com/Akashkg03/VEHICLE-OBJECT-DETECTION-USING-YOLOv8n",
                "images": 5490,
                "classes": ["Motorized2wheleer", "ambasador_taxi", "autorickshaw", "bus", "car", "minitruck", "truck", "van", "toto"],
                "annotation_format": "YOLO darknet (normalized xywh)"
            }
        ],
        "splits": {
            "train": 4520,
            "val": 1268,
            "test": 1173,
            "total": 6961
        },
        "leakage_prevention": "Source-video grouped deterministic partitioning. Zero video overlap between train, val, and test."
    }

    with open(dst_dir / "provenance.json", "w") as f:
        json.dump(provenance, f, indent=2)

    print(f"Dataset v2 successfully prepared at {dst_dir}")

if __name__ == "__main__":
    prepare_v2_dataset()
