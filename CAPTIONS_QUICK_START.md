# Live Captions - Quick Start

## 🎯 What You Get

Real-time speech-to-text captions during video calls with automatic translation between Hindi and English.

## ⚡ Quick Setup (5 minutes)

### 1. Install Packages
```cmd
SETUP_CAPTIONS.bat
```

### 2. Choose API Provider

**Option A: Google Cloud (Recommended)**
```bash
# Get free tier: 60 minutes/month
# 1. Go to: https://console.cloud.google.com
# 2. Create project
# 3. Enable: Speech-to-Text API + Translation API
# 4. Download service account key JSON
# 5. Set environment variable:

# Windows:
set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\key.json

# Or add to backend/.env:
GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\key.json
```

**Option B: OpenAI (Fallback)**
```bash
# Get API key: https://platform.openai.com
# Add to backend/.env:
OPENAI_API_KEY=sk-...your-key...
```

### 3. Update Frontend

**Option 1: Use wrapper component (easiest)**
```typescript
// frontend/app/consultation/[id]/room/page.tsx
import VideoCallWithCaptions from '@/components/VideoCallWithCaptions'

return <VideoCallWithCaptions consultationId={id} userType={validUserType} />
```

**Option 2: Add to existing component**
See `LIVE_CAPTIONS_GUIDE.md` for integration code

### 4. Start & Test
```cmd
START_FOR_DIFFERENT_DEVICES.bat
```

1. Join video call
2. Click **Subtitles** button (bottom right)
3. Speak and see captions appear!

## 🎬 How It Looks

```
┌─────────────────────────────────────────┐
│                                         │
│         [Video Call Interface]          │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ 🎬 Live Captions          🟢 [X] │  │
│  ├───────────────────────────────────┤  │
│  │ 👨‍⚕️ Doctor: How are you?         │  │
│  │ आप कैसे हैं?                     │  │
│  ├───────────────────────────────────┤  │
│  │ 🧑 Patient: मुझे बुखार है         │  │
│  │ I have a fever                    │  │
│  └───────────────────────────────────┘  │
│                                         │
│  [🎥] [🎤] [📞 End] [📝 Captions]      │
└─────────────────────────────────────────┘
```

## ✅ Features

- ✅ Real-time transcription
- ✅ Auto translation (Hindi ↔ English)
- ✅ Medical terminology support
- ✅ Speaker identification
- ✅ Auto-scroll
- ✅ Toggle on/off
- ✅ Saves transcript

## 🐛 Troubleshooting

### No captions appearing?
1. Check API keys configured
2. Check browser console for errors
3. Verify microphone permission granted
4. Speak clearly and wait 3 seconds

### "Client not initialized" error?
```bash
# Install packages:
cd backend
pip install google-cloud-speech google-cloud-translate

# Set credentials:
set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\key.json
```

### Poor quality?
- Speak clearly
- Reduce background noise
- Use good microphone
- Check internet connection

## 💰 Costs

### Google Cloud (Recommended)
- **Free:** 60 minutes/month
- **Paid:** ~$1.44/hour

### OpenAI Whisper
- **Cost:** ~$0.36/hour
- No free tier

## 📖 Full Documentation

See `LIVE_CAPTIONS_GUIDE.md` for:
- Detailed setup
- Configuration options
- API setup guides
- Troubleshooting
- Code examples

## 🎉 That's It!

Your video calls now have professional live captions with automatic translation!

**Test it:** Join a call and click the Subtitles button 📝
