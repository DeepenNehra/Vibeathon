@echo off
echo ============================================================
echo VOICE INTAKE SETUP TEST
echo ============================================================
echo.

REM Activate virtual environment if it exists
if exist venv\Scripts\activate.bat (
    echo Activating virtual environment...
    call venv\Scripts\activate.bat
) else (
    echo No virtual environment found. Using system Python.
)

echo.
echo Running setup verification...
echo.

python test_voice_intake_setup.py

echo.
echo ============================================================
echo Test complete!
echo ============================================================
pause
