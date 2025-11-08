@echo off
echo ========================================
echo Starting Backend and Frontend for Network Access
echo ========================================
echo.
echo Your IP Address: 10.20.18.252
echo.
echo On other devices, open: http://10.20.18.252:3000
echo.
echo ========================================
echo.

REM Check if running as administrator for firewall rules
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running as Administrator - Adding firewall rules...
    netsh advfirewall firewall add rule name="Node Dev Server" dir=in action=allow protocol=TCP localport=3000 >nul 2>&1
    netsh advfirewall firewall add rule name="Backend API" dir=in action=allow protocol=TCP localport=8000 >nul 2>&1
    echo Firewall rules added!
    echo.
) else (
    echo WARNING: Not running as Administrator
    echo If connection fails, run ALLOW_FIREWALL.bat as Administrator
    echo.
)

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Servers starting in separate windows...
echo.
echo This computer: http://localhost:3000
echo Other devices: http://10.20.18.252:3000
echo.
echo Backend API: http://10.20.18.252:8000
echo ========================================
echo.
pause
