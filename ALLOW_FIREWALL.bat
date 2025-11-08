@echo off
echo ========================================
echo   Allow Backend Through Firewall
echo ========================================
echo.
echo This will allow Python to accept connections from other devices
echo.
echo Run as Administrator if needed
echo.
echo ========================================
echo.

netsh advfirewall firewall add rule name="Arogya Backend" dir=in action=allow protocol=TCP localport=8000
netsh advfirewall firewall add rule name="Arogya Frontend" dir=in action=allow protocol=TCP localport=3000

echo.
echo ========================================
echo   Firewall rules added!
echo ========================================
echo.
echo Backend: Port 8000
echo Frontend: Port 3000
echo.
pause
