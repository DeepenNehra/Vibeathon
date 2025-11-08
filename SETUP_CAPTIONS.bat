@echo off
echo ========================================
echo Setting Up Live Captions
echo ========================================
echo.

echo Step 1: Installing Python packages...
cd backend
pip install google-cloud-speech google-cloud-translate openai sentence-transformers
if %errorlevel% neq 0 (
    echo WARNING: Some packages failed to install
    echo You can continue, but captions may not work without API keys
)

echo.
echo ========================================
echo ✅ Setup Complete!
echo ========================================
echo.
echo What's been added:
echo - Real-time speech-to-text captions
echo - Automatic translation (Hindi ↔ English)
echo - Medical terminology support
echo - Live caption display during video calls
echo.
echo Next steps:
echo 1. Set up API keys (see LIVE_CAPTIONS_GUIDE.md)
echo 2. Start servers: START_FOR_DIFFERENT_DEVICES.bat
echo 3. Join video call and click Subtitles button
echo.
echo API Setup Required:
echo - Google Cloud (recommended): Speech-to-Text + Translation
echo   OR
echo - OpenAI (fallback): Whisper API
echo.
echo See LIVE_CAPTIONS_GUIDE.md for detailed setup
echo ========================================
pause
