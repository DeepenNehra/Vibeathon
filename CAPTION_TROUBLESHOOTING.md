# 🐛 Caption Troubleshooting Guide

## Current Issue

Captions are connecting but not transcribing audio. The logs show:
```
⚠️ Google STT returned no results (silence or unclear audio)
OpenAI client not initialized
All ASR services failed
```

## Quick Fixes

### Option 1: Add OpenAI API Key (Easiest)

OpenAI Whisper works better with short audio chunks.

**Add to `backend/.env`:**
```
OPENAI_API_KEY=sk-...your-key...
```

**Get key from:** https://platform.openai.com/api-keys

**Cost:** ~$0.006/minute (~$0.36/hour)

### Option 2: Improve Google Cloud Setup

The audio format might need adjustment.

**Try these changes:**

1. **Increase audio chunk size** (better for Google Cloud)

Edit `frontend/components/LiveCaptions.tsx` line ~135:
```typescript
// Change from 3000 to 5000 (5 seconds)
mediaRecorder.start(5000)
```

2. **Increase audio bitrate**

Edit `frontend/components/LiveCaptions.tsx` line ~120:
```typescript
const mediaRecorder = new MediaRecorder(audioStream, {
  mimeType: 'audio/webm;codecs=opus',
  audioBitsPerSecond: 48000 // Increase from 16000
})
```

3. **Check microphone quality**
- Use a good quality microphone
- Reduce background noise
- Speak clearly and loudly

### Option 3: Test Audio Format

The issue might be audio encoding. Let's verify:

**Add logging to see audio details:**

Edit `backend/app/stt_pipeline.py` around line 145:
```python
logger.info(f"📊 Audio chunk size: {len(audio_chunk)} bytes")
logger.info(f"📊 Language: {language_code}")
```

## Recommended Solution

**Use OpenAI Whisper (simplest):**

1. Get API key: https://platform.openai.com/api-keys
2. Add to `backend/.env`:
   ```
   OPENAI_API_KEY=sk-...
   ```
3. Restart backend
4. Test captions

**Why OpenAI?**
- Works better with short audio chunks
- More forgiving with audio quality
- Simpler setup
- Good accuracy

## Testing Steps

### 1. Add OpenAI Key
```bash
# Edit backend/.env
OPENAI_API_KEY=sk-...your-key...
```

### 2. Restart Backend
```cmd
# Stop current backend (Ctrl+C)
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Test Captions
1. Join video call
2. Click Subtitles button
3. Speak clearly: "Hello, how are you?"
4. Wait 3-5 seconds
5. Check if caption appears

### 4. Check Logs
Backend should show:
```
✅ Whisper API transcribed: Hello, how are you?
📝 Caption generated for doctor: Hello, how are you?...
```

## Common Issues

### "No audio track available"
- Check microphone permission
- Verify audio is working in video call
- Try refreshing the page

### "WebSocket not ready"
- Backend might not be running
- Check `http://localhost:8000/docs`
- Restart backend

### "Silence or unclear audio"
- Speak louder
- Reduce background noise
- Use better microphone
- Increase chunk size to 5 seconds

### "All ASR services failed"
- No API keys configured
- Add OpenAI key (easiest fix)
- Or fix Google Cloud credentials

## Audio Requirements

### For Google Cloud:
- Minimum chunk size: 3-5 seconds
- Good audio quality
- Clear speech
- Low background noise

### For OpenAI Whisper:
- Works with 1-3 second chunks
- More forgiving
- Better with varied audio quality

## Quick Test

**Test if audio is being captured:**

1. Open browser console (F12)
2. Enable captions
3. Speak
4. Look for: `📤 Sent audio chunk: XXXX bytes`
5. If you see this, audio is being sent

**Test if backend receives audio:**

1. Check backend logs
2. Look for: `Received audio chunk: XXXX bytes`
3. If you see this, backend is receiving audio

## Recommended Configuration

**For best results, use this setup:**

### Frontend (LiveCaptions.tsx):
```typescript
const mediaRecorder = new MediaRecorder(audioStream, {
  mimeType: 'audio/webm;codecs=opus',
  audioBitsPerSecond: 48000 // Higher quality
})

// 5 second chunks for better accuracy
mediaRecorder.start(5000)
```

### Backend (.env):
```bash
# Add OpenAI as fallback
OPENAI_API_KEY=sk-...your-key...

# Keep Google Cloud for primary
GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\key.json
```

## Next Steps

1. **Add OpenAI API key** (quickest fix)
2. **Restart backend**
3. **Test captions**
4. **If still not working:**
   - Check microphone permission
   - Increase chunk size to 5 seconds
   - Speak louder and clearer
   - Check backend logs for errors

## Success Indicators

You'll know it's working when:
- ✅ Backend logs show: "✅ Whisper API transcribed: ..."
- ✅ Caption appears in UI
- ✅ Translation shows correctly
- ✅ No error messages in logs

## Cost Estimate

**OpenAI Whisper:**
- $0.006 per minute
- ~$0.36 per hour
- ~$3.60 for 10 hours

**Google Cloud (if fixed):**
- 60 minutes FREE per month
- $0.006 per 15 seconds after free tier
- ~$1.44 per hour

## Support

If still not working:
1. Check browser console (F12)
2. Check backend logs
3. Verify API keys are correct
4. Test microphone in other apps
5. Try different browser (Chrome works best)

**The easiest fix: Add OpenAI API key! 🚀**
