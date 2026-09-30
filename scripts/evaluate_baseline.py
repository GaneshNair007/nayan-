import os
import json
import torch
from pathlib import Path
from ultralytics import YOLO

def evaluate_baseline():
    dataset_yaml = Path(r"c:\nayan\datasets\nayan_india_v2\data.yaml")
    artifacts_dir = Path(r"c:\nayan\artifacts\evaluation")
    os.makedirs(artifacts_dir, exist_ok=True)

    print("=" * 60)
    print("NAYAN BASELINE EVALUATION — PRETRAINED YOLOV8N")
    print("=" * 60)

    model_path = "yolov8n.pt"
    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    print(f"Loading pretrained model: {model_path} on {device}")

    model = YOLO(model_path)

    # Evaluate on held-out TEST set
    results = model.val(
        data=str(dataset_yaml.absolute()),
        split="test",
        device=device,
        verbose=True
    )

    metrics = {
        "model_name": "yolov8n.pt (Pretrained COCO)",
        "evaluation_split": "test",
        "dataset": "nayan_india_v2",
        "device": device,
        "overall_metrics": {
            "precision": round(float(results.results_dict.get("metrics/precision(B)", 0.0)), 4),
            "recall": round(float(results.results_dict.get("metrics/recall(B)", 0.0)), 4),
            "mAP50": round(float(results.results_dict.get("metrics/mAP50(B)", 0.0)), 4),
            "mAP50-95": round(float(results.results_dict.get("metrics/mAP50-95(B)", 0.0)), 4)
        },
        "ambulance_metrics": {
            "ambulance_in_pretrained_coco": False,
            "ambulance_precision": 0.0,
            "ambulance_recall": 0.0,
            "note": "Pretrained COCO YOLOv8n has 80 classes and does not contain a discrete ambulance class. Baseline ambulance detection metrics are 0.0."
        },
        "raw_results": {k: float(v) for k, v in results.results_dict.items() if isinstance(v, (int, float))}
    }

    output_file = artifacts_dir / "v2_baseline.json"
    with open(output_file, "w") as f:
        json.dump(metrics, f, indent=2)

    print("=" * 60)
    print("BASELINE EVALUATION COMPLETE")
    print(f"  mAP50:     {metrics['overall_metrics']['mAP50']}")
    print(f"  mAP50-95:  {metrics['overall_metrics']['mAP50-95']}")
    print(f"  Ambulance: {metrics['ambulance_metrics']['note']}")
    print(f"  Saved to:  {output_file}")
    print("=" * 60)

if __name__ == "__main__":
    evaluate_baseline()
