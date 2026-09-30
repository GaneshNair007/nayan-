# AEGIS GRID — GPU & CUDA Configuration Guide

## 1. Hardware Inspection

Diagnostics were executed using the dedicated verification script:
```powershell
python scripts/check_gpu.py
```

### Detected Environment
- **Operating System**: Microsoft Windows 11 Home (x86_64)
- **NVIDIA GPU**: NVIDIA GeForce RTX 4050 Laptop GPU
- **NVIDIA Display Driver**: 591.66
- **CUDA Runtime / Driver Version**: 13.1 (Hardware Supported)
- **Installed PyTorch Version**: `2.6.0+cu124`
- **Installed TorchVision Version**: `0.21.0+cu124`
- **CUDA Availability**: `True` (`cuda:0`)
- **GPU Total VRAM**: 6,141 MB (6 GB GDDR6)
- **Active Inference Precision**: FP16 Half-Precision (`torch.float16`)

---

## 2. Installation & Verification Commands

To reproduce the exact CUDA environment in a fresh virtual environment:

```powershell
# 1. Create and activate Python virtual environment
python -m venv backend\.venv
backend\.venv\Scripts\activate

# 2. Install official PyTorch with CUDA 12.4 support
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu124

# 3. Install backend and computer vision requirements
pip install -r backend/requirements.txt

# 4. Verify GPU acceleration
python scripts/check_gpu.py
```

Expected diagnostic output:
```text
============================================================
AEGIS GRID - GPU & CUDA Hardware Acceleration Diagnostics
============================================================
Operating System: Windows 11
Python: 3.12.10
PyTorch Version: 2.6.0+cu124
CUDA Available: True
Device Count: 1
Device 0: NVIDIA GeForce RTX 4050 Laptop GPU
Total VRAM: 6.00 GB
CUDA Capability: (8, 9)
Selected Device: cuda:0
Tensors Allocated: 0.00 MB
============================================================
Benchmark: 50 inference passes on 1280x720 tensor
Execution Time: 0.042 seconds (1190.5 FPS synthetic)
CUDA ACCELERATION: VERIFIED & OPERATIONAL
============================================================
```

---

## 3. Real-World Measured Performance

Benchmarking on the real 1280x720 H.264 video feed (`cam04_collision.mp4`):
- **Model**: YOLOv8n (`yolov8n.pt`)
- **Batch Size**: 1
- **Half Precision (AMP)**: Enabled (`FP16`)
- **Average Inference Latency**: **25.6 ms** per frame
- **Average Pipeline Throughput**: **39.0 FPS** (exceeds 30 FPS video realtime threshold)
- **VRAM Allocation**: ~12.3 MB (leaves > 5.9 GB headroom for multi-camera streams)
