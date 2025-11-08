@echo off
echo ========================================
echo   Setup HTTPS for Local Testing
echo ========================================
echo.
echo This will create self-signed SSL certificates
echo.
echo ========================================
echo.

cd frontend

echo Creating SSL certificates...
echo.

:: Create certificates directory
if not exist "certificates" mkdir certificates
cd certificates

:: Generate self-signed certificate using OpenSSL (if available)
:: Or use mkcert (recommended)

echo.
echo ========================================
echo   Installing mkcert...
echo ========================================
echo.

:: Check if mkcert is installed
where mkcert >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo mkcert not found. Installing via Chocolatey...
    echo.
    echo Please run: choco install mkcert
    echo.
    echo Or download from: https://github.com/FiloSottile/mkcert/releases
    echo.
    pause
    exit /b 1
)

:: Create local CA
mkcert -install

:: Generate certificate for your IP
mkcert localhost 127.0.0.1 10.20.18.252 ::1

echo.
echo ========================================
echo   Certificates created!
echo ========================================
echo.

cd ..

echo.
echo Next steps:
echo 1. Update package.json to use HTTPS
echo 2. Restart frontend with: npm run dev
echo.
pause
