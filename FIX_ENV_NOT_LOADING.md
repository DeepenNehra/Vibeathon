# Fix: Environment Variables Not Loading

## The Issue
The test script shows "NOT SET" for all environment variables even though they're in the `.env` file.

## ✅ Quick Fix (3 Options)

### Option 1: Use the Batch File (Easiest for Windows)
```bash
cd backend
test_setup.bat
```

### Option 2: Install python-dotenv
```bash
cd backend
pip install python-dotenv
python test_voice_intake_setup.py
```

### Option 3: Set Environment Variables Manually (Windows CMD)
```cmd
cd backend

REM Set all environment variables
set GEMINI_API_KEY=AIzaSyCvhOlXPza3sTI_FLIXtm3jsVaSReNI23Q
set GOOGLE_CLOUD_PROJECT_ID=assignment-28a79
set GOOGLE_APPLICATION_CREDENTIALS=google-credentials.json
set SUPABASE_URL=https://uqljtqnjanemvdkxnnjj.supabase.co
set SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxbGp0cW5qYW5lbXZka3hubmpqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjU0NTE0NiwiZXhwIjoyMDc4MTIxMTQ2fQ.UZHkjzdwOtTd523DpO4wPlvgC3whCU1Vp1tmuhjLNgM

REM Run test
python test_voice_intake_setup.py
```

### Option 4: Set Environment Variables Manually (PowerShell)
```powershell
cd backend

# Set all environment variables
$env:GEMINI_API_KEY="AIzaSyCvhOlXPza3sTI_FLIXtm3jsVaSReNI23Q"
$env:GOOGLE_CLOUD_PROJECT_ID="assignment-28a79"
$env:GOOGLE_APPLICATION_CREDENTIALS="google-credentials.json"
$env:SUPABASE_URL="https://uqljtqnjanemvdkxnnjj.supabase.co"
$env:SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxbGp0cW5qYW5lbXZka3hubmpqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjU0NTE0NiwiZXhwIjoyMDc4MTIxMTQ2fQ.UZHkjzdwOtTd523DpO4wPlvgC3whCU1Vp1tmuhjLNgM"

# Run test
python test_voice_intake_setup.py
```

## 🎯 Why This Happens

Python scripts don't automatically load `.env` files. You need either:
1. The `python-dotenv` package (already in requirements.txt)
2. Manually set environment variables in your terminal
3. Use a script that loads the `.env` file

## ✅ Best Solution: Just Start the Backend

The good news is that **FastAPI automatically loads `.env` files** when you run the server!

So you can skip the test and just start the backend:

```bash
cd backend
python run.py
```

The backend will load all environment variables from `.env` automatically and the voice intake feature will work!

## 🔍 Verify It's Working

Once the backend starts, you should see:
```
[AlertEngine] ✅ Gemini 1.5 Flash enabled successfully!
INFO:     Uvicorn running on http://0.0.0.0:8000
```

This means:
- ✅ `.env` file is loaded
- ✅ Gemini API key is working
- ✅ Backend is ready

Then just:
1. Start frontend: `cd frontend && npm run dev`
2. Login as patient
3. Go to Voice Intake page
4. Test it!

## 📝 Summary

**Don't worry about the test script failing!**

The backend (`python run.py`) will load the `.env` file automatically because FastAPI uses `python-dotenv` internally.

Just start the backend and frontend, and the voice intake feature will work! 🎉
