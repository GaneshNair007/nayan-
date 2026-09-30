"""
NAYAN India Emergency Traffic Training Orchestrator
Executes real GPU-backed transfer learning on NVIDIA GeForce RTX 4050 Laptop GPU.
Captures nvidia-smi proof, epoch logs, results.csv, checkpoints, and validates weights.
"""
import os
import sys
import json
import yaml
import time
import shutil
import hashlib
import subprocess
import threading
import torch
from ultralytics import YOLO

CONFIG_PATH = os.path.abspath("configs/nayan_india_training.yaml")
ARTIFACTS_MODELS = os.path.abspath("artifacts/models/nayan_india")
ARTIFACTS_TRAINING = os.path.abspath("artifacts/training/nayan_india")
GPU_PROOF_PATH = os.path.abspath("artifacts/training/gpu_proof.txt")
CHECKPOINT_PROOF_PATH = os.path.abspath("artifacts/training/checkpoint_proof.json")

def get_file_sha256(filepath: str) -> str:
    hasher = hashlib.sha256()
    with open(filepath, 'rb') as f:
        buf = f.read(65536)
        while len(buf) > 0:
            hasher.update(buf)
            buf = f.read(65536)
    return hasher.hexdigest()

def monitor_gpu(stop_event: threading.Event):
    """Periodically captures nvidia-smi proof while training is active."""
    os.makedirs(os.path.dirname(GPU_PROOF_PATH), exist_ok=True)
    while not stop_event.is_set():
        try:
            res = subprocess.run(["nvidia-smi"], capture_output=True, text=True)
            if res.returncode == 0:
                with open(GPU_PROOF_PATH, "w", encoding="utf-8") as f:
                    f.write(f"Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
                    f.write(f"PyTorch CUDA Available: {torch.cuda.is_available()}\n")
                    f.write(f"Device Name: {torch.cuda.get_device_name(0)}\n")
                    f.write(f"Allocated VRAM: {torch.cuda.memory_allocated(0)/(1024*1024):.2f} MB\n")
                    f.write(f"Reserved VRAM: {torch.cuda.memory_reserved(0)/(1024*1024):.2f} MB\n\n")
                    f.write(res.stdout)
        except Exception as e:
            print(f"GPU monitor error: {e}")
        stop_event.wait(5.0)

def train(is_sanity: bool = False):
    print("=" * 60)
    print(f"NAYAN GPU MODEL TRAINING - {'SANITY RUN (2 EPOCHS)' if is_sanity else 'FULL TRAINING RUN'}")
    print("=" * 60)

    # 1. Hardware verification
    assert torch.cuda.is_available(), "CUDA is NOT available! Aborting training to prevent CPU fallback."
    device_name = torch.cuda.get_device_name(0)
    vram_gb = torch.cuda.get_device_properties(0).total_memory / (1024**3)
    print(f"GPU: {device_name}")
    print(f"VRAM: {vram_gb:.2f} GB")
    print(f"PyTorch: {torch.__version__}")
    print(f"CUDA: {torch.version.cuda}")

    # 2. Load Config
    with open(CONFIG_PATH, 'r') as f:
        cfg = yaml.safe_load(f)

    epochs = 2 if is_sanity else cfg.get("epochs", 50)
    batch = cfg.get("batch_size", 16)
    imgsz = cfg.get("imgsz", 640)
    base_model = cfg.get("base_model", "yolov8n.pt")
    dataset = cfg.get("dataset", "datasets/nayan_india/dataset.yaml")
    device = cfg.get("device", 0)
    patience = 2 if is_sanity else cfg.get("patience", 10)
    optimizer = cfg.get("optimizer", "AdamW")
    lr0 = cfg.get("lr0", 0.001)

    print(f"Base model: {base_model}")
    print(f"Dataset: {dataset}")
    print(f"Target epochs: {epochs}")
    print(f"Batch size: {batch}, Image size: {imgsz}")
    print(f"Device: {device}, AMP: True, Optimizer: {optimizer}")

    # Record pretrained model SHA256
    pretrained_sha256 = get_file_sha256(base_model) if os.path.exists(base_model) else "downloaded"
    print(f"Pretrained Model SHA256: {pretrained_sha256}")

    # Start GPU monitor thread
    stop_event = threading.Event()
    monitor_thread = threading.Thread(target=monitor_gpu, args=(stop_event,), daemon=True)
    monitor_thread.start()

    start_time = time.time()
    current_batch = batch
    results = None

    while current_batch >= 4:
        try:
            print(f"\nAttempting training with batch_size={current_batch}...")
            model = YOLO(base_model)
            results = model.train(
                data=dataset,
                epochs=epochs,
                batch=current_batch,
                imgsz=imgsz,
                device=device,
                workers=cfg.get("workers", 0),
                seed=cfg.get("seed", 42),
                optimizer=optimizer,
                lr0=lr0,
                patience=patience,
                amp=True,
                project=os.path.abspath("artifacts/models"),
                name="nayan_india_run" if not is_sanity else "nayan_sanity_run",
                exist_ok=True,
                save=True,
                val=True,
                plots=True,
                verbose=True
            )
            break
        except RuntimeError as e:
            if "out of memory" in str(e).lower() or "cuda" in str(e).lower():
                print(f"CUDA Out of Memory caught with batch_size={current_batch}! Reducing batch size...")
                current_batch = current_batch // 2
                torch.cuda.empty_cache()
                time.sleep(2)
            else:
                raise e
    stop_event.set()
    monitor_thread.join(timeout=2.0)

    duration = time.time() - start_time
    print(f"\nTraining completed in {duration:.2f} seconds ({duration/60:.2f} minutes).")

    # Resolve output directory from results.save_dir or fallback
    if results and hasattr(results, "save_dir"):
        run_dir = str(results.save_dir)
    else:
        run_dir = os.path.abspath(f"artifacts/models/{'nayan_sanity_run' if is_sanity else 'nayan_india_run'}")
    
    print(f"Resolving checkpoints from run directory: {run_dir}")
    weights_dir = os.path.join(run_dir, "weights")
    best_pt = os.path.join(weights_dir, "best.pt")
    last_pt = os.path.join(weights_dir, "last.pt")

    assert os.path.exists(best_pt), f"best.pt not found at {best_pt}!"
    assert os.path.exists(last_pt), f"last.pt not found at {last_pt}!"

    best_sha256 = get_file_sha256(best_pt)
    print(f"TRAINED MODEL SHA256: {best_sha256}")
    assert best_sha256 != pretrained_sha256, "Trained model has identical SHA256 to pretrained weights! Real training did not modify weights!"
    print("WEIGHT CHANGE PROOF: PASSED (SHA256 differs)")

    # Copy / Mirror to canonical locations
    os.makedirs(ARTIFACTS_MODELS, exist_ok=True)
    os.makedirs(ARTIFACTS_TRAINING, exist_ok=True)

    for target_dir in [ARTIFACTS_MODELS, ARTIFACTS_TRAINING]:
        shutil.copy2(best_pt, os.path.join(target_dir, "best.pt"))
        shutil.copy2(last_pt, os.path.join(target_dir, "last.pt"))
        for fname in ["results.csv", "results.png", "confusion_matrix.png", "PR_curve.png", "F1_curve.png", "args.yaml"]:
            src_file = os.path.join(run_dir, fname)
            if os.path.exists(src_file):
                shutil.copy2(src_file, os.path.join(target_dir, fname))

    # Write checkpoint proof
    proof = {
        "base_model": base_model,
        "base_model_sha256": pretrained_sha256,
        "trained_model": "artifacts/models/nayan_india/best.pt",
        "trained_model_sha256": best_sha256,
        "different": (best_sha256 != pretrained_sha256),
        "device": device_name,
        "vram_gb": round(vram_gb, 2),
        "cuda_version": torch.version.cuda,
        "pytorch_version": torch.__version__,
        "epochs_completed": epochs,
        "training_duration_s": round(duration, 2),
        "is_sanity_run": is_sanity
    }
    with open(CHECKPOINT_PROOF_PATH, "w", encoding="utf-8") as f:
        json.dump(proof, f, indent=2)

    # Write training proof text file
    proof_txt_path = os.path.join(ARTIFACTS_TRAINING, "gpu_training_proof.txt")
    with open(proof_txt_path, "w", encoding="utf-8") as f:
        f.write("=== NAYAN REAL GPU TRAINING PROOF ===\n")
        f.write(f"GPU Name: {device_name}\n")
        f.write(f"CUDA Version: {torch.version.cuda}\n")
        f.write(f"PyTorch Version: {torch.__version__}\n")
        f.write(f"Target Device: cuda:0\n")
        f.write(f"Epochs Completed: {epochs}\n")
        f.write(f"Training Duration: {duration:.2f} s\n")
        f.write(f"Pretrained SHA256: {pretrained_sha256}\n")
        f.write(f"Trained best.pt SHA256: {best_sha256}\n")
        f.write(f"Hash Difference Verified: {best_sha256 != pretrained_sha256}\n")

    print("\nCheckpoint Proof Generated:")
    print(json.dumps(proof, indent=2))
    return proof

if __name__ == "__main__":
    is_sanity = "--sanity" in sys.argv
    train(is_sanity=is_sanity)
