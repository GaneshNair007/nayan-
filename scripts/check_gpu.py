"""
AEGIS GRID GPU and CUDA Diagnostic Script
Reports PyTorch CUDA readiness, GPU hardware name, and VRAM.
"""
import sys

def check_gpu():
    print("=" * 60)
    print("AEGIS GRID — HARDWARE & ACCELERATION DIAGNOSTIC")
    print("=" * 60)

    try:
        import torch
    except ImportError:
        print("ERROR: PyTorch is not installed in the active environment.")
        print("Install with: pip install torch torchvision --index-url https://download.pytorch.org/whl/cu124")
        return False

    print(f"PyTorch Version: {torch.__version__}")
    cuda_available = torch.cuda.is_available()
    print(f"CUDA AVAILABLE: {'YES' if cuda_available else 'NO'}")

    if cuda_available:
        device_count = torch.cuda.device_count()
        current_device = torch.cuda.current_device()
        device_name = torch.cuda.get_device_name(current_device)
        cuda_version = torch.version.cuda
        props = torch.cuda.get_device_properties(current_device)
        total_vram_gb = props.total_memory / (1024 ** 3)
        free_vram_gb = (props.total_memory - torch.cuda.memory_allocated(current_device)) / (1024 ** 3)

        print(f"CUDA Runtime Version: {cuda_version}")
        print(f"GPU Count: {device_count}")
        print(f"DEVICE: cuda:{current_device}")
        print(f"GPU: {device_name}")
        print(f"Total VRAM: {total_vram_gb:.2f} GB")
        print(f"Available VRAM: {free_vram_gb:.2f} GB")
        print("CUDA Acceleration: READY FOR LIVE INFERENCE & TRAINING")
        print("=" * 60)
        return True
    else:
        print("CUDA is NOT available in this PyTorch build.")
        print("DEVICE: cpu")
        print("=" * 60)
        return False

if __name__ == "__main__":
    success = check_gpu()
    sys.exit(0 if success else 1)
