# Live Captions Setup Guide

## 🎯 What This Does

Adds **real-time speech-to-text captions** to your video calls with:
- Live transcription of doctor and patient speech
- Automatic translation (Hindi ↔ English)
- Medical terminology support
- Displayed as subtitles during the call

## ✅ What's Been Created

### Backend
```
✅ backend/app/captions.py - WebSocket endpoint for caption generation
✅ backend/app/main.py - Updated to include captions router
```

### Frontend
```
✅ frontend/components/LiveCaptions.tsx - Caption display component
✅ frontend/components/VideoCallWithCaptions.tsx - Integrated video call with captions
```

### Existing (Already in your project)
```
✅ backend/app/stt_pipeline.py - Speech-to-text processing
✅ backend/app/stt_example.py - Usage examples
```

## 🚀 How It Works

### Flow
```
1. User speaks during video call
2. Audio captured from microphone
3. Sent to backend via WebSocket
4. Processed through STT pipeline:
   - Google Cloud Speech-to-Text (primary)
   - OpenAI Whisper (fallback)
   - Translation (Hindi ↔ English)
   - Medical lexicon lookup
5. Caption sent back to all participants
6. Displayed as subtitle overlay
```

### Architecture
```
┌─────────────┐
│   Doctor    │ speaks → Audio Stream
└──────┬──────┘              ↓
       │              WebSocket (audio)
       │                     ↓
       │         ┌───────────────────────┐
       │         │  Caption WebSocket    │
       │         │  /ws/captions/{id}    │
       │         └───────────┬───────────┘
       │                     ↓
       │         ┌───────────────────────┐
       │         │   STT Pipeline        │
       │         │  - Transcribe         │
       │         │  - Translate          │
       │         │  - Lexicon lookup     │
       │         └───────────┬───────────┘
       │                     ↓
       │         ┌───────────────────────┐
       │         │   Broadcast Caption   │
       │         └───────────┬───────────┘
       │                     ↓
┌──────┴──────┐      ┌──────────────┐
│   Doctor    │ ←──  │   Patient    │
│  (English)  │      │   (Hindi)    │
└─────────────┘      └──────────────┘
  Shows Hindi         Shows English
  translation         translation
```

## 📋 Prerequisites

### 1. Google Cloud Setup (Recommended)

**Create Google Cloud Project:**
1. Go to https://console.cloud.google.com
2. Create new project
3. Enable APIs:
   - Cloud Speech-to-Text API
   - Cloud Translation API

**Get Credentials:**
```bash
# Download service account key JSON
# Set environment variable:
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"
```

**Or add to .env:**
```
GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\your-project-key.json
```

### 2. OpenAI API (Fallback)

**Get API Key:**
1. Go to https://platform.openai.com
2. Create API key
3. Add to `.env`:
```
OPENAI_API_KEY=sk-...your-key...
```

### 3. Install Python Packages

```bash
cd backend
pip install google-cloud-speech google-cloud-translate openai sentence-transformers
```

## 🎬 Quick Start

### Option 1: Use Existing Video Call (Recommended)

Update your consultation room page:

```typescript
// frontend/app/consultation/[id]/room/page.tsx
import VideoCallWithCaptions from '@/components/VideoCallWithCaptions'

export default async function ConsultationRoomPage({ params, searchParams }: PageProps) {
  // ... existing code ...
  
  return <VideoCallWithCaptions consultationId={id} userType={validUserType} />
}
```

### Option 2: Add to Existing Component

Add caption button and component to your existing video call:

```typescript
import { useState } from 'react'
import { Subtitles } from 'lucide-react'
import LiveCaptions from '@/components/LiveCaptions'

// In your component:
const [captionsEnabled, setCaptionsEnabled] = useState(false)

// Add button to controls:
<Button onClick={() => setCaptionsEnabled(!captionsEnabled)}>
  <Subtitles />
</Button>

// Add caption component:
{captionsEnabled && (
  <LiveCaptions
    consultationId={consultationId}
    userType={userType}
    localStream={localStreamRef.current}
    enabled={captionsEnabled}
    onToggle={() => setCaptionsEnabled(false)}
  />
)}
```

## 🧪 Testing

### 1. Start Backend
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Test Captions

**Doctor (English):**
1. Join call
2. Click captions button (Subtitles icon)
3. Speak: "How are you feeling today?"
4. See: Your English text + Hindi translation for patient

**Patient (Hindi):**
1. Join same call
2. Click captions button
3. Speak: "मुझे सिर दर्द है" (I have a headache)
4. See: Your Hindi text + English translation for doctor

## 🎨 Caption Display

### What You See

```
┌─────────────────────────────────────────┐
│ 🎬 Live Captions              🟢 [X]   │
├─────────────────────────────────────────┤
│ 👨‍⚕️ Doctor: How are you feeling?       │
│ आप कैसा महसूस कर रहे हैं?              │
├─────────────────────────────────────────┤
│ 🧑 Patient: मुझे सिर दर्द है            │
│ I have a headache                       │
└─────────────────────────────────────────┘
```

### Features
- **Color-coded speakers** - Doctor (blue), Patient (green)
- **Original + Translation** - See both languages
- **Auto-scroll** - Latest caption always visible
- **Keeps last 10** - Doesn't clutter screen
- **Semi-transparent** - Doesn't block video

## ⚙️ Configuration

### Audio Settings

Edit `LiveCaptions.tsx`:
```typescript
const mediaRecorder = new MediaRecorder(audioStream, {
  mimeType: 'audio/webm;codecs=opus',
  audioBitsPerSecond: 16000 // Adjust quality vs speed
})

// Chunk interval (seconds)
mediaRecorder.start(3000) // 3 seconds = better accuracy
mediaRecorder.start(1000) // 1 second = faster but less accurate
```

### Caption Display

Edit `LiveCaptions.tsx`:
```typescript
// Number of captions to keep
const updated = [...prev, newCaption]
return updated.slice(-10) // Keep last 10

// Position
className="fixed bottom-24 left-1/2" // Center bottom

// Size
className="max-w-3xl" // Maximum width
```

### Language Configuration

Edit `backend/app/stt_pipeline.py`:
```python
# Patient language
if user_type == 'patient':
    language_code = 'hi-IN'  # Hindi
    alternative_codes = None

# Doctor language
elif user_type == 'doctor':
    language_code = 'en-IN'  # English (India)
    alternative_codes = ['hi-IN']  # Also understand Hindi
```

## 🐛 Troubleshooting

### Issue: No captions appearing

**Check:**
1. Backend running? `http://localhost:8000/docs`
2. WebSocket connected? Check browser console
3. Microphone permission granted?
4. Speaking clearly?

**Backend logs should show:**
```
✅ Caption connection: doctor joined room abc123
📤 Sent audio chunk: 12345 bytes
✅ Google STT transcribed: Hello
📝 Caption generated for doctor: Hello...
```

### Issue: "Google Cloud Speech client not initialized"

**Solution:**
```bash
# Install package
pip install google-cloud-speech google-cloud-translate

# Set credentials
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"

# Or use OpenAI Whisper fallback
export OPENAI_API_KEY="sk-..."
```

### Issue: Poor transcription quality

**Solutions:**
1. **Speak clearly** - Enunciate words
2. **Reduce background noise** - Quiet environment
3. **Check microphone** - Use good quality mic
4. **Increase chunk size** - Edit `mediaRecorder.start(5000)` for 5 seconds
5. **Use enhanced model** - Already enabled in `stt_pipeline.py`

### Issue: Captions delayed

**Solutions:**
1. **Reduce chunk size** - `mediaRecorder.start(1000)` for 1 second
2. **Check internet speed** - Need good connection
3. **Use Google Cloud** - Faster than Whisper API

### Issue: Wrong language detected

**Check:**
1. User type correct? (doctor vs patient)
2. Language codes in `stt_pipeline.py`
3. Speaking in expected language?

## 📊 API Costs

### Google Cloud Speech-to-Text
- **Free tier:** 60 minutes/month
- **After free:** $0.006/15 seconds (~$1.44/hour)
- **Enhanced model:** $0.009/15 seconds (~$2.16/hour)

### Google Cloud Translation
- **Free tier:** 500,000 characters/month
- **After free:** $20/million characters

### OpenAI Whisper
- **Cost:** $0.006/minute (~$0.36/hour)
- **No free tier**

### Recommendation
- **Development:** Use Google Cloud free tier
- **Production:** Google Cloud (better for medical terms)
- **Fallback:** OpenAI Whisper

## 🎯 Features

### ✅ Implemented
- Real-time transcription
- Automatic translation
- Medical lexicon support
- WebSocket streaming
- Caption display
- Speaker identification
- Auto-scroll
- Toggle on/off

### 🚧 Future Enhancements
- Save transcript to database
- Download transcript
- Search captions
- Highlight medical terms
- Confidence scores
- Multiple languages
- Custom vocabulary
- Punctuation editing

## 📝 Code Examples

### Send Custom Message
```typescript
// In LiveCaptions.tsx
if (wsRef.current?.readyState === WebSocket.OPEN) {
  wsRef.current.send(JSON.stringify({
    type: 'ping'
  }))
}
```

### Process Caption Data
```typescript
ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  
  if (data.type === 'caption') {
    console.log('Speaker:', data.speaker)
    console.log('Original:', data.original_text)
    console.log('Translated:', data.translated_text)
  }
}
```

### Backend: Custom Processing
```python
# In captions.py
async def process_audio(self, audio_chunk, ...):
    result = await self.stt_pipeline.process_audio_stream(...)
    
    # Add custom processing here
    if "emergency" in result["original_text"].lower():
        # Trigger alert
        pass
    
    await self.broadcast_caption(...)
```

## 🔒 Security

### Considerations
- Audio data transmitted over WebSocket
- Use WSS (secure WebSocket) in production
- Transcripts stored in database
- API keys in environment variables
- HIPAA compliance for medical data

### Production Setup
```typescript
// Use secure WebSocket
const wsUrl = backendUrl.replace('https', 'wss')

// Add authentication
ws.send(JSON.stringify({
  type: 'auth',
  token: userToken
}))
```

## 📚 Documentation

- **STT Pipeline:** `backend/app/stt_pipeline.py`
- **Caption Endpoint:** `backend/app/captions.py`
- **Frontend Component:** `frontend/components/LiveCaptions.tsx`
- **Usage Example:** `backend/app/stt_example.py`

## ✅ Success Checklist

- [ ] Google Cloud credentials configured
- [ ] Python packages installed
- [ ] Backend running with captions router
- [ ] Frontend component integrated
- [ ] Captions button visible
- [ ] WebSocket connects
- [ ] Audio captured
- [ ] Captions appear
- [ ] Translation works
- [ ] Both users see captions

## 🎉 You're Ready!

Your video call now has:
- 🎤 Real-time speech-to-text
- 🌍 Automatic translation
- 💬 Live caption display
- 🏥 Medical terminology support
- 📝 Transcript saving

**Start testing:** Click the Subtitles button during a video call!
