# 🎤 Voice Intake Feature - Setup Guide

## 🚨 CRITICAL: Security Fix Required FIRST

**Your Google Gemini API Key was exposed in git history. Fix this immediately:**

### 1. Revoke the Exposed API Key
1. Go to: https://aistudio.google.com/app/apikey
2. Find and DELETE the old key
3. Generate a NEW API key
4. Update `backend/.env` with the new key:
   ```bash
   GEMINI_API_KEY=YOUR_NEW_KEY_HERE
   ```

### 2. Commit the Cleanup
```bash
cd C:\Users\HP\Desktop\Vibethon-project\Vibeathon

git add .
git commit -m "security: Remove exposed API keys and cleanup docs"
git push
```

---

## 📋 Voice Intake Feature Overview

### What It Does
Patients can record their medical history in any language (Hindi, English, Bengali, etc.), and AI automatically:
- Transcribes the audio to text
- Extracts structured medical data (name, age, symptoms, medications, allergies)
- Translates everything to English
- Saves to database for doctors to review

### Complete Flow
```
Patient Records Audio (Hindi/English/etc.)
  ↓
Google Speech-to-Text (Audio → Text)
  ↓
Gemini AI (Text → Structured Data + Translation)
  ↓
Display Extracted Info
  ↓
Save to Database (voice_intake_records table)
  ↓
View History
```

---

## 🔧 Setup Steps

### 1. Create Database Table
Run this SQL in Supabase SQL Editor:

```sql
-- File: SETUP_VOICE_INTAKE_COMPLETE.sql
-- Go to: https://supabase.com/dashboard → SQL Editor → New Query
-- Copy and run the entire SETUP_VOICE_INTAKE_COMPLETE.sql file
```

### 2. Verify Environment Variables
Check `backend/.env` has:
```bash
GEMINI_API_KEY=your_new_key_here
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
```

### 3. Install Dependencies
```bash
cd backend
pip install google-cloud-speech google-generativeai
```

### 4. Start Servers
```bash
# Terminal 1 - Backend
cd backend
python run.py

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

---

## 🎯 How to Use

1. Open: `http://localhost:3000`
2. Login as **patient**
3. Click **"Voice Intake"** card
4. Select language (Hindi/English/etc.)
5. Click "Start Recording"
6. Speak medical history (15-30 seconds)
7. Click "Stop Recording"
8. Review extracted data
9. Click "Save to Profile"
10. View history at `/patient/voice-intake-history`

---

## 🌍 Supported Languages

- Hindi (हिंदी)
- English (India & US)
- Bengali (বাংলা)
- Telugu (తెలుగు)
- Marathi (मराठी)
- Tamil (தமிழ்)
- Gujarati (ગુજરાતી)
- Kannada (ಕನ್ನಡ)
- Malayalam (മലയാളം)

---

## 📁 Key Files

### Backend
- `backend/app/voice_intake.py` - API endpoints
- `backend/app/main.py` - Router registration
- `backend/.env` - Environment variables

### Frontend
- `frontend/app/patient/voice-intake/page.tsx` - Voice intake page
- `frontend/components/voice-intake/voice-intake-form.tsx` - Recording component
- `frontend/app/patient/voice-intake-history/page.tsx` - History page
- `frontend/app/patient/dashboard/page.tsx` - Dashboard with card

### Database
- `SETUP_VOICE_INTAKE_COMPLETE.sql` - Complete database setup
- Table: `voice_intake_records`

---

## 🐛 Troubleshooting

### "Failed to save to database"
**Cause:** Table doesn't exist
**Fix:** Run `SETUP_VOICE_INTAKE_COMPLETE.sql` in Supabase

### "GEMINI_API_KEY not configured"
**Cause:** Missing or invalid API key
**Fix:** Generate new key at https://aistudio.google.com/app/apikey

### "No speech detected"
**Cause:** Audio too short or silent
**Fix:** Speak louder, record longer (15+ seconds)

### "Google Cloud Speech credentials not configured"
**Cause:** Missing credentials file
**Fix:** Ensure `google-credentials.json` exists in backend folder

---

## ✅ Testing Checklist

- [ ] SQL script run in Supabase
- [ ] New API key generated and configured
- [ ] Backend dependencies installed
- [ ] Backend server running (port 8000)
- [ ] Frontend server running (port 3000)
- [ ] Can navigate to /patient/voice-intake
- [ ] Can record audio
- [ ] Extracted data displays correctly
- [ ] Can save to profile
- [ ] History page shows saved records

---

## 🔐 Security Best Practices

### Never Commit:
- ❌ `.env` files
- ❌ `google-credentials.json`
- ❌ API keys in any file
- ❌ Passwords or secrets

### Always Use:
- ✅ `.env` files (already in `.gitignore`)
- ✅ Environment variables
- ✅ Placeholders in docs (e.g., `YOUR_API_KEY_HERE`)

---

## 📊 API Endpoints

### Process Recording
```
POST /api/voice-intake/process
Content-Type: multipart/form-data

Body:
- audio: File (WebM)
- patient_id: UUID
- language_code: String (e.g., "hi-IN")

Response:
{
  "success": true,
  "data": {
    "full_name": "...",
    "age": 35,
    "chief_complaint": "...",
    "medical_history": [...],
    "allergies": [...]
  }
}
```

### Save to Profile
```
POST /api/voice-intake/save-intake
Content-Type: multipart/form-data

Body:
- patient_id: UUID
- intake_data: JSON string

Response:
{
  "success": true,
  "message": "Voice intake data saved successfully"
}
```

---

## 💡 Benefits

### For Patients
- ✅ Speak naturally in any language
- ✅ No typing required
- ✅ Faster than forms
- ✅ AI extracts everything

### For Doctors
- ✅ Complete patient history before consultation
- ✅ Critical info highlighted (allergies)
- ✅ Better prepared for video calls
- ✅ Multilingual support

---

## 🎉 You're Ready!

Once you've completed the security fix and setup steps, the voice intake feature is ready to use!
