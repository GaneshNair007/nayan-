import os
from ultralytics import YOLO
from pathlib import Path
import torch

def train():
    base_dir = Path(r"c:\nayan")
    dataset_yaml = base_dir / "datasets" / "india_emergency" / "data.yaml"
    
    # Check if GPU is available
    device = "0" if torch.cuda.is_available() else "cpu"
    print(f"Training on device: {device}")
    
    # Load a model
    model = YOLO("yolov8n.pt")  # load a pretrained model (recommended for training)
    
    # Train the model
    results = model.train(
        data=str(dataset_yaml.absolute()),
        epochs=10,  # 10 epochs for demo fine-tuning
        imgsz=640,
        device=device,
        project=str(base_dir / "backend" / "models" / "training"),
        name="india_emergency",
        exist_ok=True,
        batch=4 # small batch size for local training
    )
    
    print("Training complete!")
    print(f"Model saved to {base_dir / 'backend' / 'models' / 'training' / 'india_emergency' / 'weights' / 'best.pt'}")

if __name__ == '__main__':
    train()
