#!/usr/bin/env bash
set -e

echo "==================================================="
echo "  NAYAN - AI-Driven Emergency Corridor & CV Safety"
echo "  1-Click Hackathon Launch Sequence"
echo "==================================================="

# Trap to kill background processes on exit
trap 'kill $(jobs -p) 2>/dev/null || true' EXIT

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "[1/3] Starting NAYAN FastAPI Backend Engine on http://localhost:8000..."
cd "$DIR"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 &

sleep 2

echo "[2/3] Starting NAYAN Editorial Frontend on http://localhost:5173..."
cd "$DIR/frontend"
npm run dev &

sleep 2

echo "[3/3] NAYAN running! Access at http://localhost:5173"
echo "Press Ctrl+C to stop both servers."

wait
