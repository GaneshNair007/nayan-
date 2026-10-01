@echo off
echo ===================================================
echo   NAYAN - AI-Driven Emergency Corridor & CV Safety
echo   1-Click Hackathon Launch Sequence
echo ===================================================

echo [1/3] Starting NAYAN FastAPI Backend Engine on http://localhost:8000...
start "NAYAN Backend (Port 8000)" cmd /k "cd /d %~dp0 && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

timeout /t 3 /nobreak >nul

echo [2/3] Starting NAYAN Editorial Frontend on http://localhost:5173...
start "NAYAN Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 2 /nobreak >nul

echo [3/3] Opening NAYAN in your browser...
start http://localhost:5173

echo.
echo ===================================================
echo   NAYAN is now running!
echo   - Frontend: http://localhost:5173
echo   - Backend:  http://localhost:8000/api/health
echo   - API Docs: http://localhost:8000/docs
echo ===================================================
pause
