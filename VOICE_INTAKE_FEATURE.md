# Voice-Based Patient Intake Feature

## Overview
This feature allows patients to speak their medical history in any language, and the system automatically converts it to structured English medical forms. This saves time for both patients and doctors.

## Features
- **Multi-language Support**: Supports Hindi, English, Bengali, Telugu, Marathi, Tamil, Gujarati, Kannada, Malayalam, and more
- **AI-Powered Extraction**: Uses Google Cloud Speech-to-Text and Gemini AI to extract structured data
- **Automatic Translation**: Converts any language to English for doctor review
- **Structured Output**: Extracts:
  - Patient demographics (name, age, gender)
  - Chief complaint and symptoms
  - Medical history
  - Current medications
  - Allergies
  - Previous surgeries
  - Family history
  - Lifestyle factors

## How It Works

### Patient Flow:
1. Navigate to **Dashboard → Voice Intake** or click the "Voice Intake" card
2. Select your preferred language
3. Click "Start Recording"
4. Speak naturally about your medical history (include name, symptoms, medications, allergies, etc.)
5. Click "Stop Recording"
6. Review the extracted information
7. Click "Save to Profile" to store it

### Technical Flow:
```
Patient Speech (Any Language)
    ↓
Google Cloud Speech-to-Text (Transcription)
    ↓
Gemini AI (Extraction + Translation)
    ↓
Structured JSON Data (English)
    ↓
Saved to Patient Profile
```

## Files Added/Modified

### Backend:
- `backend/app/voice_intake.py` - Voice intake API endpoints (already existed, now registered)
- `backend/app/main.py` - Added voice_intake router registration

### Frontend:
- `frontend/app/patient/voice-intake/page.tsx` - Voice intake page
- `frontend/components/voice-intake/voice-intake-form.tsx` - Recording and processing component
- `frontend/app/patient/dashboard/page.tsx` - Added Voice Intake card and navigation link

## API Endpoints

### POST `/api/voice-intake/process`
Process voice recording and extract structured data.

**Parameters:**
- `audio` (file): Audio recording (WebM format)
- `patient_id` (string): Patient user ID
- `language_code` (string): Language code (e.g., 'hi-IN', 'en-IN')

**Response:**
```json
{
  "success": true,
  "data": {
    "full_name": "John Doe",
    "age": 35,
    "gender": "male",
    "chief_complaint": "Persistent headache",
    "symptom_duration": "2 weeks",
    "medical_history": ["Hypertension"],
    "current_medications": ["Amlodipine 5mg"],
    "allergies": ["Penicillin"],
    "lifestyle": {
      "smoking": "no",
      "alcohol": "occasional",
      "exercise": "3 times per week"
    },
    "original_transcript": "मुझे दो हफ्ते से सिरदर्द है...",
    "english_transcript": "I have had a headache for two weeks..."
  }
}
```

### POST `/api/voice-intake/save-intake`
Save extracted data to patient profile.

**Parameters:**
- `patient_id` (string): Patient user ID
- `intake_data` (JSON string): Extracted data from processing

## Environment Variables Required

### Backend (.env):
```bash
# Google Cloud (for Speech-to-Text)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json

# Gemini AI (for data extraction)
GEMINI_API_KEY=your_gemini_api_key

# Supabase (for data storage)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
```

### Frontend (.env.local):
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

## Setup Instructions

1. **Install Backend Dependencies:**
   ```bash
   cd backend
   pip install google-cloud-speech google-generativeai
   ```

2. **Configure Google Cloud:**
   - Create a Google Cloud project
   - Enable Speech-to-Text API
   - Download service account credentials
   - Set `GOOGLE_APPLICATION_CREDENTIALS` environment variable

3. **Configure Gemini AI:**
   - Get API key from Google AI Studio
   - Set `GEMINI_API_KEY` environment variable

4. **Start Backend:**
   ```bash
   cd backend
   python run.py
   ```

5. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

6. **Test the Feature:**
   - Login as a patient
   - Navigate to Voice Intake
   - Record a sample medical history
   - Verify extraction and save

## Supported Languages

| Language | Code | Native Name |
|----------|------|-------------|
| Hindi | hi-IN | हिंदी |
| English (India) | en-IN | English |
| English (US) | en-US | English |
| Bengali | bn-IN | বাংলা |
| Telugu | te-IN | తెలుగు |
| Marathi | mr-IN | मराठी |
| Tamil | ta-IN | தமிழ் |
| Gujarati | gu-IN | ગુજરાતી |
| Kannada | kn-IN | ಕನ್ನಡ |
| Malayalam | ml-IN | മലയാളം |

## Benefits

### For Patients:
- Speak naturally in their preferred language
- No need to fill long forms
- Faster intake process
- More comfortable than typing

### For Doctors:
- Pre-filled patient information
- Structured data in English
- Saves consultation time
- Better prepared for appointments

## Future Enhancements
- Real-time transcription preview
- Edit extracted data before saving
- Voice commands for form navigation
- Integration with appointment booking
- Automatic symptom severity assessment
- Medical terminology suggestions

## Troubleshooting

### "GEMINI_API_KEY not configured"
- Ensure you have set the `GEMINI_API_KEY` in backend/.env
- Get key from: https://makersuite.google.com/app/apikey

### "Google Cloud Speech credentials not configured"
- Set up Google Cloud service account
- Download JSON credentials
- Set `GOOGLE_APPLICATION_CREDENTIALS` environment variable

### "No speech detected"
- Ensure microphone permissions are granted
- Speak clearly and close to the microphone
- Check audio input device settings
- Minimum recording duration: 2-3 seconds

### "Failed to process recording"
- Check backend server is running
- Verify `NEXT_PUBLIC_BACKEND_URL` is correct
- Check browser console for errors
- Ensure audio format is WebM/Opus

## Notes
- This feature does NOT disturb existing functionality
- All existing routes and features remain unchanged
- Voice intake is optional - patients can still use traditional forms
- Data is stored securely in Supabase
- HIPAA compliance considerations apply
