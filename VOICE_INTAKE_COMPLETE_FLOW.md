# 🎤 Voice Intake Feature - Complete Flow Documentation

## 📊 High-Level Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────────┐      ┌──────────────┐
│   Patient   │ ───> │   Frontend   │ ───> │    Backend      │ ───> │   Supabase   │
│   Browser   │      │  (Next.js)   │      │   (FastAPI)     │      │  (Database)  │
└─────────────┘      └──────────────┘      └─────────────────┘      └──────────────┘
      │                      │                       │                       │
      │                      │                       │                       │
      ▼                      ▼                       ▼                       ▼
  Microphone          MediaRecorder           Google Cloud            voice_intake_
   Audio              WebM/Opus               Speech-to-Text           records table
                                              + Gemini AI
```

## 🔄 Complete User Journey

### Step 1: Patient Navigates to Voice Intake
```
Patient Dashboard → Click "Voice Intake" Card
↓
/patient/voice-intake page loads
↓
VoiceIntakeForm component renders
```

**Files Involved:**
- `frontend/app/patient/dashboard/page.tsx` - Dashboard with Voice Intake card
- `frontend/app/patient/voice-intake/page.tsx` - Voice intake page
- `frontend/components/voice-intake/voice-intake-form.tsx` - Main form component

### Step 2: Patient Selects Language
```
User sees language dropdown
↓
Selects language (Hindi, English, Bengali, etc.)
↓
Language code stored in state (e.g., "hi-IN", "en-IN")
```

**Supported Languages:**
- Hindi (हिंदी) - `hi-IN`
- English (India) - `en-IN`
- English (US) - `en-US`
- Bengali (বাংলা) - `bn-IN`
- Telugu (తెలుగు) - `te-IN`
- Marathi (मराठी) - `mr-IN`
- Tamil (தமிழ்) - `ta-IN`
- Gujarati (ગુજરાતી) - `gu-IN`
- Kannada (ಕನ್ನಡ) - `kn-IN`
- Malayalam (മലയാളം) - `ml-IN`

### Step 3: Patient Records Audio
```
Click "Start Recording"
↓
Browser requests microphone permission
↓
MediaRecorder starts capturing audio
↓
Audio format: WebM with Opus codec
↓
Timer starts counting (0:00, 0:01, 0:02...)
↓
Patient speaks medical history
↓
Click "Stop Recording"
↓
MediaRecorder stops, audio chunks combined into Blob
```

**Code Flow:**
```typescript
// frontend/components/voice-intake/voice-intake-form.tsx

startRecording() {
  navigator.mediaDevices.getUserMedia({ audio: true })
  → new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
  → mediaRecorder.start()
  → setIsRecording(true)
}

stopRecording() {
  mediaRecorder.stop()
  → audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
  → processAudio(audioBlob)
}
```

### Step 4: Frontend Sends Audio to Backend
```
processAudio(audioBlob)
↓
Create FormData with:
  - audio: Blob (WebM file)
  - patient_id: UUID
  - language_code: "hi-IN" (or selected language)
↓
POST /api/voice-intake/process
↓
Show "Processing your recording..." spinner
```

**HTTP Request:**
```http
POST http://localhost:8000/api/voice-intake/process
Content-Type: multipart/form-data

audio: [Binary WebM data]
patient_id: "123e4567-e89b-12d3-a456-426614174000"
language_code: "hi-IN"
```

### Step 5: Backend Processes Audio (Speech-to-Text)
```
Backend receives audio
↓
Initialize Google Cloud Speech client
↓
Configure recognition:
  - encoding: WEBM_OPUS
  - sample_rate: 48000 Hz
  - language_code: "hi-IN"
  - model: "medical_conversation" (only for en-US) or "default"
  - enable_automatic_punctuation: true
↓
Call speech_client.recognize()
↓
Get transcript in original language
```

**Code Flow:**
```python
# backend/app/voice_intake.py

@router.post("/process")
async def process_voice_intake(audio, patient_id, language_code):
    # Read audio
    audio_content = await audio.read()
    
    # Configure Google Cloud Speech
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
        sample_rate_hertz=48000,
        language_code=language_code,
        enable_automatic_punctuation=True,
        model="medical_conversation" if language_code == 'en-US' else "default",
        use_enhanced=True
    )
    
    # Transcribe
    response = speech_client.recognize(config=config, audio=audio_config)
    transcript = " ".join([result.alternatives[0].transcript for result in response.results])
```

**Example Transcript:**
```
Original (Hindi): "मेरा नाम राज है, मुझे बुखार है तीन दिन से"
```

### Step 6: Backend Extracts Structured Data (Gemini AI)
```
Send transcript to Gemini AI
↓
Prompt: "Extract patient information and translate to English"
↓
Gemini analyzes transcript
↓
Returns structured JSON with:
  - Name, Age, Gender
  - Chief Complaint
  - Symptoms & Duration
  - Medical History
  - Medications
  - Allergies
  - Lifestyle
  - Original & Translated Text
```

**AI Prompt:**
```
You are a medical intake assistant. Extract patient information from this transcript and translate everything to English.

TRANSCRIPT (may be in Hindi, English, or other languages):
"मेरा नाम राज है, मुझे बुखार है तीन दिन से"

Extract and translate the following information to English:
1. Full Name
2. Age
3. Gender
4. Chief Complaint (main problem/symptoms)
5. Duration of symptoms
...

Return as JSON: { ... }
```

**AI Response:**
```json
{
  "full_name": "Raj",
  "age": null,
  "gender": "male",
  "chief_complaint": "Fever",
  "symptom_duration": "3 days",
  "medical_history": [],
  "current_medications": [],
  "allergies": [],
  "previous_surgeries": [],
  "family_history": null,
  "lifestyle": {
    "smoking": "unknown",
    "alcohol": "unknown",
    "exercise": "unknown"
  },
  "additional_notes": null,
  "original_language": "Hindi",
  "original_transcript": "मेरा नाम राज है, मुझे बुखार है तीन दिन से",
  "english_transcript": "My name is Raj, I have fever for three days"
}
```

### Step 7: Backend Returns Extracted Data
```
Add metadata:
  - processed_at: timestamp
  - patient_id: UUID
  - audio_language_code: "hi-IN"
↓
Return JSON response to frontend
```

**HTTP Response:**
```json
{
  "success": true,
  "data": {
    "full_name": "Raj",
    "age": null,
    "gender": "male",
    "chief_complaint": "Fever",
    "symptom_duration": "3 days",
    ...
    "processed_at": "2024-01-15T10:30:00",
    "patient_id": "123e4567-e89b-12d3-a456-426614174000",
    "audio_language_code": "hi-IN"
  },
  "message": "Voice intake processed successfully"
}
```

### Step 8: Frontend Displays Extracted Data
```
Receive response
↓
setExtractedData(result.data)
↓
Show green card with extracted information:
  - Basic Info (Name, Age, Gender)
  - Chief Complaint
  - Medical History (badges)
  - Medications (badges)
  - Allergies (red badges)
  - Lifestyle (grid)
  - Transcripts (collapsible)
↓
Show "Save to Profile" button
```

**UI Components:**
- Green success card
- Badges for medications, allergies, history
- Collapsible transcript viewer
- Save and "Record Again" buttons

### Step 9: Patient Saves to Profile
```
Click "Save to Profile"
↓
Create FormData with:
  - patient_id: UUID
  - intake_data: JSON string of extracted data
↓
POST /api/voice-intake/save-intake
```

**HTTP Request:**
```http
POST http://localhost:8000/api/voice-intake/save-intake
Content-Type: multipart/form-data

patient_id: "123e4567-e89b-12d3-a456-426614174000"
intake_data: "{\"full_name\":\"Raj\",\"age\":null,...}"
```

### Step 10: Backend Saves to Database ⚠️ (FAILS IF TABLE DOESN'T EXIST)
```
Parse intake_data JSON
↓
Create intake_record object:
  - patient_id
  - intake_data (full JSON)
  - created_at
  - full_name (extracted)
  - age (extracted)
  - chief_complaint (extracted)
  - symptom_duration (extracted)
  - medical_history (extracted)
  - current_medications (extracted)
  - allergies (extracted)
  - language_code (extracted)
↓
Insert into voice_intake_records table
↓
Return success response
```

**Database Insert:**
```python
# backend/app/voice_intake.py

intake_record = {
    'patient_id': patient_id,
    'intake_data': data,  # Full JSON
    'created_at': datetime.now().isoformat(),
    'full_name': data.get('full_name'),
    'age': data.get('age'),
    'chief_complaint': data.get('chief_complaint'),
    'symptom_duration': data.get('symptom_duration'),
    'medical_history': data.get('medical_history'),
    'current_medications': data.get('current_medications'),
    'allergies': data.get('allergies'),
    'language_code': data.get('audio_language_code', 'unknown')
}

result = supabase.table('voice_intake_records').insert(intake_record).execute()
```

**❌ ERROR IF TABLE DOESN'T EXIST:**
```
Failed to save to database: relation "voice_intake_records" does not exist
```

### Step 11: Frontend Shows Success Message
```
Receive success response
↓
Show toast notification:
  "Medical information saved successfully!"
  "View your saved records in History"
↓
Provide "View History" button
```

### Step 12: Patient Views History
```
Click "View History" or navigate to /patient/voice-intake-history
↓
Frontend fetches all records:
  GET from Supabase: voice_intake_records table
  WHERE patient_id = current_user_id
  ORDER BY created_at DESC
↓
Display cards for each record:
  - Name
  - Date
  - Chief Complaint
  - Medications, Allergies
  - Expandable full details
```

**Database Query:**
```typescript
// frontend/app/patient/voice-intake-history/page.tsx

const { data: records } = await supabase
  .from('voice_intake_records')
  .select('*')
  .eq('patient_id', session.user.id)
  .order('created_at', { ascending: false })
```

## 🗄️ Database Schema

### voice_intake_records Table
```sql
CREATE TABLE voice_intake_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    intake_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Extracted fields for easy querying
    full_name TEXT,
    age INTEGER,
    chief_complaint TEXT,
    symptom_duration TEXT,
    medical_history JSONB,
    current_medications JSONB,
    allergies JSONB,
    language_code TEXT,
    
    -- Foreign key
    CONSTRAINT fk_patient FOREIGN KEY (patient_id) 
        REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_voice_intake_patient_id ON voice_intake_records(patient_id);
CREATE INDEX idx_voice_intake_created_at ON voice_intake_records(created_at DESC);
```

### Row Level Security (RLS) Policies
```sql
-- Patients can view their own records
CREATE POLICY "Patients can view own voice intake records"
    ON voice_intake_records FOR SELECT
    USING (auth.uid() = patient_id);

-- Patients can insert their own records
CREATE POLICY "Patients can insert own voice intake records"
    ON voice_intake_records FOR INSERT
    WITH CHECK (auth.uid() = patient_id);

-- Doctors can view all records
CREATE POLICY "Doctors can view all voice intake records"
    ON voice_intake_records FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'doctor'
        )
    );

-- Service role has full access (for backend API)
CREATE POLICY "Service role has full access"
    ON voice_intake_records FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');
```

## 🔧 Why History Is Not Saving

### Root Cause
The `voice_intake_records` table **does not exist** in your Supabase database.

### Evidence
1. Backend logs show: `Failed to save to database: relation "voice_intake_records" does not exist`
2. The SQL script `SETUP_VOICE_INTAKE_COMPLETE.sql` exists but hasn't been run
3. Frontend can extract data but can't save it

### Solution
Run the SQL script in Supabase SQL Editor:

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in left sidebar
4. Click "New Query"
5. Copy entire contents of `SETUP_VOICE_INTAKE_COMPLETE.sql`
6. Paste and click "Run"
7. Verify success messages

## 📁 File Structure

```
Vibeathon/
├── backend/
│   └── app/
│       ├── main.py                    # FastAPI app (includes voice_intake router)
│       └── voice_intake.py            # Voice intake API endpoints
│
├── frontend/
│   ├── app/
│   │   └── patient/
│   │       ├── dashboard/
│   │       │   └── page.tsx           # Dashboard with Voice Intake card
│   │       ├── voice-intake/
│   │       │   └── page.tsx           # Voice intake page
│   │       └── voice-intake-history/
│   │           └── page.tsx           # History page
│   └── components/
│       ├── voice-intake/
│       │   └── voice-intake-form.tsx  # Main form component
│       └── doctor/
│           └── patient-voice-intake-view.tsx  # Doctor view
│
└── SETUP_VOICE_INTAKE_COMPLETE.sql    # Database setup script
```

## 🎯 Key Technologies

1. **Frontend Audio Capture**: MediaRecorder API (WebM/Opus)
2. **Speech-to-Text**: Google Cloud Speech-to-Text API
3. **AI Extraction**: Google Gemini 2.0 Flash
4. **Database**: Supabase (PostgreSQL)
5. **Backend**: FastAPI (Python)
6. **Frontend**: Next.js 14 (React, TypeScript)

## ✅ Testing Checklist

- [ ] Run SQL script in Supabase
- [ ] Restart backend server
- [ ] Navigate to /patient/voice-intake
- [ ] Select language
- [ ] Record 15-30 seconds of audio
- [ ] Verify extracted data displays
- [ ] Click "Save to Profile"
- [ ] Check for success toast
- [ ] Navigate to /patient/voice-intake-history
- [ ] Verify record appears in history
- [ ] Check Supabase table has data

## 🚨 Common Issues

### 1. "No speech detected"
- **Cause**: Audio too short or silent
- **Fix**: Speak louder, record longer (15+ seconds)

### 2. "Failed to save to database"
- **Cause**: Table doesn't exist
- **Fix**: Run SQL script in Supabase

### 3. "GEMINI_API_KEY not configured"
- **Cause**: Missing API key in backend/.env
- **Fix**: Add `GEMINI_API_KEY=your_key_here`

### 4. "Google Cloud Speech credentials not configured"
- **Cause**: Missing Google Cloud credentials
- **Fix**: Set up Application Default Credentials

### 5. History page shows "No records"
- **Cause**: Table doesn't exist or RLS blocking access
- **Fix**: Run SQL script, check RLS policies

## 📊 Data Flow Summary

```
Audio (WebM) 
  → Google Speech-to-Text 
  → Text Transcript 
  → Gemini AI 
  → Structured JSON 
  → Supabase Database 
  → History Page
```

## 🎉 Benefits

### For Patients
- ✅ Speak naturally in any language
- ✅ No typing required
- ✅ Faster than filling forms
- ✅ AI extracts everything automatically
- ✅ Review before saving

### For Doctors
- ✅ Complete patient history before consultation
- ✅ Critical info highlighted (allergies in red)
- ✅ Better prepared for video calls
- ✅ Time saved during appointments
- ✅ Multilingual support

## 🔐 Security & Privacy

- ✅ Row Level Security (RLS) enabled
- ✅ Patients can only see their own records
- ✅ Doctors can see all records (for consultations)
- ✅ Service role has full access (for backend API)
- ✅ Audio not stored (only transcripts)
- ✅ HIPAA-compliant data handling

## 📈 Future Enhancements

- [ ] Real-time transcription during recording
- [ ] Edit extracted data before saving
- [ ] Share specific records with doctors
- [ ] Export as PDF
- [ ] Voice commands for navigation
- [ ] Offline support
- [ ] Multi-speaker detection
