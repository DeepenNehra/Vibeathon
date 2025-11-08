# 🎤 Live Captions Feature

## What It Does

Adds **real-time speech-to-text captions** to your video calls with automatic translation between Hindi and English.

## Quick Demo

```
Doctor speaks: "How are you feeling today?"
  ↓
Caption appears for Patient: "आप आज कैसा महसूस कर रहे हैं?"

Patient speaks: "मुझे सिर दर्द है"
  ↓
Caption appears for Doctor: "I have a headache"
```

## Setup (2 Steps)

### 1. Install Packages
```cmd
SETUP_CAPTIONS.bat
```

### 2. Configure API (Choose One)

**Option A: Google Cloud (Free 60 min/month)**
```bash
# 1. Go to: https://console.cloud.google.com
# 2. Enable: Speech-to-Text + Translation APIs
# 3. Download key.json
# 4. Set:
set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\key.json
```

**Option B: OpenAI**
```bash
# Add to backend/.env:
OPENAI_API_KEY=sk-...
```

## Usage

1. Start servers: `START_FOR_DIFFERENT_DEVICES.bat`
2. Join video call
3. Click **Subtitles** button (📝)
4. Speak and see captions!

## Features

- ✅ Real-time transcription (3 second delay)
- ✅ Auto translation (Hindi ↔ English)
- ✅ Medical terminology support
- ✅ Speaker identification
- ✅ Saves transcript to database
- ✅ Toggle on/off anytime

## Documentation

- **Quick Start:** `CAPTIONS_QUICK_START.md`
- **Full Guide:** `LIVE_CAPTIONS_GUIDE.md`
- **All Features:** `COMPLETE_FEATURES_SUMMARY.md`

## That's It!

Your video calls now have professional live captions! 🎉
