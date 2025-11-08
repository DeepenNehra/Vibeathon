# Voice Intake Feature - Quick Start Guide

## ✅ What's Already Done
- ✅ Backend API endpoints created
- ✅ Frontend UI components built
- ✅ Navigation links added
- ✅ Gemini API key configured
- ✅ Code integrated without breaking existing features

## 🔧 What You Need to Do

### Step 1: Get Google Cloud Credentials (10 minutes)

**Follow the detailed guide**: `GOOGLE_CLOUD_SETUP.md`

**Quick version:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "Speech-to-Text API"
4. Create a service account
5. Download JSON key file
6. Save it as `backend/google-credentials.json`

**Already configured in `.env`:**
```bash
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
```

### Step 2: Install Python Dependencies

```bash
cd backend
pip install google-cloud-speech
```

### Step 3: Test the Setup

Create a test file `backend/test_voice_intake.py`:

```python
from google.cloud import speech_v1p1beta1 as speech
import google.generativeai as genai
import os

print("Testing Voice Intake Setup...")
print("-" * 50)

# Test 1: Gemini API
try:
    api_key = os.getenv('GEMINI_API_KEY')
    if api_key:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('models/gemini-2.0-flash-exp')
        print("✅ Gemini API: Working")
    else:
        print("❌ Gemini API: GEMINI_API_KEY not found")
except Exception as e:
    print(f"❌ Gemini API: {e}")

# Test 2: Google Cloud Speech-to-Text
try:
    client = speech.SpeechClient()
    print("✅ Google Cloud Speech-to-Text: Working")
    creds_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
    print(f"   Using credentials: {creds_path}")
except Exception as e:
    print(f"❌ Google Cloud Speech-to-Text: {e}")
    print("   Follow GOOGLE_CLOUD_SETUP.md to configure")

print("-" * 50)
print("Setup test complete!")
```

Run it:
```bash
python test_voice_intake.py
```

### Step 4: Start the Backend

```bash
cd backend
python run.py
```

You should see:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 5: Start the Frontend

```bash
cd frontend
npm run dev
```

### Step 6: Test the Feature

1. Open browser: `http://localhost:3000`
2. Login as a **patient**
3. Click the **"Voice Intake"** card on dashboard
4. Select language (e.g., Hindi or English)
5. Click **"Start Recording"**
6. Speak for 10-20 seconds:
   ```
   "My name is John Doe. I am 35 years old. 
   I have been experiencing headaches for the past two weeks. 
   I am currently taking blood pressure medication. 
   I am allergic to penicillin."
   ```
7. Click **"Stop Recording"**
8. Wait for processing (10-15 seconds)
9. Review extracted information
10. Click **"Save to Profile"**

## 🎯 Expected Results

After recording, you should see extracted data like:
```json
{
  "full_name": "John Doe",
  "age": 35,
  "chief_complaint": "Headaches",
  "symptom_duration": "Two weeks",
  "current_medications": ["Blood pressure medication"],
  "allergies": ["Penicillin"]
}
```

## 🐛 Troubleshooting

### Issue: "GEMINI_API_KEY not configured"
**Solution**: Already configured! Check `backend/.env` - it's there.

### Issue: "Google Cloud Speech credentials not configured"
**Solution**: 
1. Follow `GOOGLE_CLOUD_SETUP.md`
2. Download JSON key from Google Cloud
3. Save as `backend/google-credentials.json`
4. Restart backend server

### Issue: "Failed to access microphone"
**Solution**:
- Grant microphone permissions in browser
- Check browser settings → Privacy → Microphone
- Try a different browser (Chrome recommended)

### Issue: "No speech detected"
**Solution**:
- Speak louder and clearer
- Record for at least 3-5 seconds
- Check microphone is working (test in other apps)
- Ensure microphone is not muted

### Issue: Backend not starting
**Solution**:
```bash
# Install missing dependencies
pip install -r requirements.txt
pip install google-cloud-speech google-generativeai

# Check for errors
python run.py
```

### Issue: "Connection refused" or "Failed to fetch"
**Solution**:
- Ensure backend is running on port 8000
- Check `NEXT_PUBLIC_BACKEND_URL` in `frontend/.env.local`
- Verify no firewall blocking localhost:8000

## 📊 API Endpoints

### Process Voice Recording
```
POST http://localhost:8000/api/voice-intake/process
Content-Type: multipart/form-data

Fields:
- audio: File (WebM format)
- patient_id: String
- language_code: String (e.g., "hi-IN", "en-IN")
```

### Save to Profile
```
POST http://localhost:8000/api/voice-intake/save-intake
Content-Type: multipart/form-data

Fields:
- patient_id: String
- intake_data: JSON String
```

## 🌍 Supported Languages

- Hindi (hi-IN) - हिंदी
- English India (en-IN)
- English US (en-US)
- Bengali (bn-IN) - বাংলা
- Telugu (te-IN) - తెలుగు
- Marathi (mr-IN) - मराठी
- Tamil (ta-IN) - தமிழ்
- Gujarati (gu-IN) - ગુજરાતી
- Kannada (kn-IN) - ಕನ್ನಡ
- Malayalam (ml-IN) - മലയാളം

## 💰 Costs

### Free Tier:
- **Google Cloud Speech-to-Text**: 60 minutes/month FREE
- **Gemini API**: 15 requests/minute FREE
- **Total**: Enough for testing and small-scale use

### After Free Tier:
- Speech-to-Text: ~$1.44 per hour
- Gemini: Very affordable pay-as-you-go

## 📝 What to Say When Recording

Include these details for best results:
1. **Name**: "My name is..."
2. **Age**: "I am X years old"
3. **Symptoms**: "I have been experiencing..."
4. **Duration**: "For the past X days/weeks"
5. **Medical History**: "I have diabetes/hypertension..."
6. **Medications**: "I am taking..."
7. **Allergies**: "I am allergic to..."
8. **Lifestyle**: "I smoke/don't smoke, I exercise..."

## ✨ Tips for Best Results

1. **Speak clearly** and at normal pace
2. **Record in a quiet environment**
3. **Use good microphone** (built-in laptop mic works fine)
4. **Record for 15-30 seconds** minimum
5. **Include specific details** (medication names, dates, etc.)
6. **Speak in your preferred language** - AI will translate

## 🎉 Success Checklist

- [ ] Google Cloud credentials downloaded
- [ ] `google-credentials.json` in backend folder
- [ ] Backend dependencies installed
- [ ] Backend server running (port 8000)
- [ ] Frontend server running (port 3000)
- [ ] Can access voice intake page
- [ ] Microphone permissions granted
- [ ] Successfully recorded and processed audio
- [ ] Data extracted and displayed
- [ ] Data saved to profile

## 📚 Additional Resources

- **Full Setup Guide**: `GOOGLE_CLOUD_SETUP.md`
- **Feature Documentation**: `VOICE_INTAKE_FEATURE.md`
- **Google Cloud Console**: https://console.cloud.google.com/
- **Gemini API Keys**: https://makersuite.google.com/app/apikey

## 🆘 Need Help?

If you're stuck:
1. Check the error message in browser console (F12)
2. Check backend terminal for errors
3. Review `GOOGLE_CLOUD_SETUP.md` for credential setup
4. Ensure all environment variables are set
5. Try the test script to verify setup

## 🚀 You're Ready!

Once you complete Step 1 (Google Cloud credentials), everything else is already set up and ready to go!

**Estimated setup time**: 10-15 minutes
**Difficulty**: Easy (just follow the steps)
