# Run the integrated NAYAN UI locally

Requirements: Node.js 22.12+ or 24; Python 3.10+; Git LFS. From this branch's repository root:

```sh
git lfs pull
python scripts/run_local.py --setup
```

Open http://localhost:5173. The launcher starts FastAPI on 8000 and the existing Vite application on 5173; `/api` and `/ws` are proxied to FastAPI. Subsequent runs:

```sh
python scripts/run_local.py
```

To preserve an existing GPU-enabled environment on Windows:

```powershell
python scripts/run_local.py --python C:\nayan\backend\.venv\Scripts\python.exe
```

Use `--setup` with `--python` only if dependencies are missing. CUDA depends on the actual installed torch build and NVIDIA drivers. CPU is supported and displayed honestly. First-run dependency installation can take several minutes. LFS weights and video files must be actual binary assets, not pointer text.

## Complete workflow

1. Landing → Enter command center.
2. Collision demo → Cameras. The golden replay supplies deterministic incident evidence and also starts video analysis when the source exists.
3. Command → click the incident.
4. Acknowledge → Request response plan → Authorize response → Dispatch & form corridor.
5. Corridor → inspect backend segment widths, compression and reroute flags.
6. Traffic → Request adaptive recommendation; this computes a proposal, without pretending to apply physical signal changes.
7. Twin → read MOCK comparison results; this backend has no live SUMO-run endpoint.
8. Audit → search decisions and export JSON.

All source videos are recorded. Camera overlays are current backend tracking output and are not frame-synchronized with browser playback. The command map is an offline coordinate schematic, not Leaflet street tiles. Dynamic corridor cell occupancy is not provided by the backend; its diagram shows returned segment states. Golden-demo evidence comes from the existing scenario service and should not be described as newly trained or independently measured evidence.

## Integration fixes

The redesign calls the actual acknowledge/propose/authorize/dispatch and signal-recommendation endpoints. Demo source paths now resolve the repository's existing data/demo directory. No model, state machine, recommendation algorithm or signal-safety rule was replaced. Existing API capability tests now verify the detected device, supporting both CPU and CUDA instead of requiring an RTX 4050.
