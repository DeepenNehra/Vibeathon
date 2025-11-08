@echo off
echo ========================================
echo   Starting Backend for Network Access
echo ========================================
echo.
echo Backend will be accessible at:
echo   - http://localhost:8000 (this computer)
echo   - http://10.20.18.252:8000 (other devices)
echo.
echo WebSocket signaling at:
echo   - ws://10.20.18.252:8000/ws/signaling/...
echo.
echo Press Ctrl+C to stop
echo ========================================
echo.

cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause
