"""
DEPRECATED AND INVALIDATED SCRIPT - DO NOT USE
This script created the invalid v1 dataset with synthetic frame-modulo relabeling.
It has been superseded by scripts/prepare_nayan_v2_dataset.py and nayan_india_v2.
"""
import sys
raise RuntimeError("scripts/create_indian_dataset.py is INVALIDATED. Use scripts/prepare_nayan_v2_dataset.py instead.")

import os
import cv2
import yaml
from pathlib import Path
from ultralytics import YOLO

def create_dataset():
    base_dir = Path(r"c:\nayan")
    demo_dir = base_dir / "data" / "demo"
    dataset_dir = base_dir / "datasets" / "india_emergency"
    
    # Create directories
    for split in ["train", "val"]:
        os.makedirs(dataset_dir / "images" / split, exist_ok=True)
        os.makedirs(dataset_dir / "labels" / split, exist_ok=True)
        
    classes = [
        "car",
        "motorcycle",
        "scooter",
        "auto-rickshaw",
        "bus",
        "truck",
        "van",
        "ambulance"
    ]
    
    yaml_content = {
        "path": str(dataset_dir.absolute()),
        "train": "images/train",
        "val": "images/val",
        "names": {i: name for i, name in enumerate(classes)}
    }
    
    with open(dataset_dir / "data.yaml", "w") as f:
        yaml.dump(yaml_content, f, sort_keys=False)
        
    print(f"Created dataset structure at {dataset_dir}")
    
    # Auto-label using pretrained model
    model = YOLO("yolov8n.pt")
    
    # Find videos
    video_files = list(demo_dir.glob("*.mp4"))
    
    frame_count = 0
    for video_file in video_files:
        cap = cv2.VideoCapture(str(video_file))
        success, frame = cap.read()
        
        frames_extracted = 0
        while success and frames_extracted < 5:  # Extract 5 frames per video
            # Run inference
            results = model(frame, verbose=False)[0]
            
            # Save frame
            split = "train" if frame_count % 5 != 0 else "val"
            img_name = f"{video_file.stem}_{frames_extracted}.jpg"
            img_path = dataset_dir / "images" / split / img_name
            cv2.imwrite(str(img_path), frame)
            
            # Save labels
            label_name = f"{video_file.stem}_{frames_extracted}.txt"
            label_path = dataset_dir / "labels" / split / label_name
            
            with open(label_path, "w") as f:
                for box in results.boxes:
                    cls_id = int(box.cls[0])
                    # COCO classes: 2=car, 3=motorcycle, 5=bus, 7=truck
                    # Map to our classes
                    our_cls = 0 # default car
                    if cls_id == 2:
                        our_cls = 0 # car
                        # Randomly make some cars ambulances or vans
                        if frames_extracted % 3 == 0:
                            our_cls = 7 # ambulance
                        elif frames_extracted % 4 == 0:
                            our_cls = 6 # van
                    elif cls_id == 3:
                        our_cls = 1 # motorcycle
                        if frames_extracted % 2 == 0:
                            our_cls = 2 # scooter
                    elif cls_id == 5:
                        our_cls = 4 # bus
                    elif cls_id == 7:
                        our_cls = 5 # truck
                        if frames_extracted % 2 == 0:
                            our_cls = 3 # auto-rickshaw
                            
                    # Get normalized xywh
                    x, y, w, h = box.xywhn[0].tolist()
                    f.write(f"{our_cls} {x} {y} {w} {h}\n")
                    
            frames_extracted += 1
            frame_count += 1
            
            # Skip frames to get varied shots
            for _ in range(30):
                cap.read()
                
            success, frame = cap.read()
            
        cap.release()
        
    print(f"Generated {frame_count} labeled frames for training.")

if __name__ == '__main__':
    create_dataset()
