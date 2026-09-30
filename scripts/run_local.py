"""Start NAYAN's existing Vite frontend and FastAPI backend together."""
import argparse
import os
from pathlib import Path
import shutil
import signal
import subprocess
import sys
import time
import urllib.request
import venv

ROOT = Path(__file__).resolve().parents[1]
ENV = ROOT / 'backend' / '.venv'
PYTHON = ENV / ('Scripts/python.exe' if os.name == 'nt' else 'bin/python')
NPM = shutil.which('npm.cmd' if os.name == 'nt' else 'npm')

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--setup', action='store_true', help='Install missing Python and frontend dependencies first.')
    parser.add_argument('--python', default=str(PYTHON), help='Use an existing configured Python interpreter (including CUDA-enabled environments).')
    args = parser.parse_args()
    if not NPM:
        raise SystemExit('Node.js with npm is required. Install Node.js 22.12+ or 24, then run again.')
    if args.setup:
        if args.python == str(PYTHON) and not PYTHON.exists():
            venv.create(ENV, with_pip=True)
        subprocess.run([args.python, '-m', 'pip', 'install', '-r', str(ROOT / 'backend/requirements.txt'), '-r', str(ROOT / 'backend/requirements-vision.txt')], check=True)
        subprocess.run([NPM, 'ci'], cwd=ROOT / 'frontend', check=True)
    if not Path(args.python).exists() and not shutil.which(args.python):
        raise SystemExit('Python environment missing. Run: python scripts/run_local.py --setup')
    if not (ROOT / 'frontend/node_modules').exists():
        raise SystemExit('Frontend dependencies missing. Run: python scripts/run_local.py --setup')
    processes = []
    try:
        backend = subprocess.Popen([args.python, '-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000'], cwd=ROOT / 'backend', start_new_session=os.name != 'nt')
        processes.append(backend)
        healthy = False
        for _ in range(120):
            if backend.poll() is not None:
                raise RuntimeError('Backend exited during startup. See its error above.')
            try:
                with urllib.request.urlopen('http://127.0.0.1:8000/api/health', timeout=1) as response:
                    healthy = response.status == 200
                if healthy:
                    break
            except (OSError, TimeoutError):
                time.sleep(.5)
        if not healthy:
            raise RuntimeError('Backend did not become healthy on port 8000. Check dependencies and model availability.')
        frontend = subprocess.Popen([NPM, 'run', 'dev', '--', '--host', '127.0.0.1', '--strictPort'], cwd=ROOT / 'frontend', start_new_session=os.name != 'nt')
        processes.append(frontend)
        print('\nNAYAN: http://localhost:5173\nBackend: http://localhost:8000/docs\nCtrl+C stops both services.\n', flush=True)
        while all(process.poll() is None for process in processes):
            time.sleep(.5)
        raise RuntimeError('A service exited. Check its output above.')
    except KeyboardInterrupt:
        print('\nStopping NAYAN…')
    finally:
        for process in reversed(processes):
            if process.poll() is None:
                if os.name == 'nt':
                    subprocess.run(['taskkill', '/PID', str(process.pid), '/T', '/F'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                else:
                    os.killpg(process.pid, signal.SIGTERM)
        for process in processes:
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                os.killpg(process.pid, signal.SIGKILL) if os.name != 'nt' else process.kill()

if __name__ == '__main__':
    main()
