# 🐛 Captions Troubleshooting Guide

## Current Status

✅ **Fixed:** Processor reference error
✅ **Configured:** LINEAR16 audio format at 16kHz
✅ **Working:** WebSocket connection
⚠️ **Issue:** Google STT returning no results

## Common Issues & Solutions

### 1. "Google STT returned no results (silence or unclear audio)"

This means Google Cloud heard the audio but couldn't transcribe it.

**Possible Causes:**
- Audio is too quiet
- Background noise too loud
- Speaking too fast/unclear
- Audio chunk too short
- Wrong language detected

**Solutions:**

#### A. Speak Louder & Clearer
```
❌ Mumbling: "hmm... uh... maybe..."
✅ Clear: "How are you feeling today?"
```

#### B. Reduce Background Noise
- Close windows
- Turn off fans/AC
- Quiet environment
- Use headset microphone

#### C. Test Microphone Level
1. Open browser settings
2. Check microphone input level
3. Speak - should see bars moving
4. Adjust if too low

#### D. Speak in Correct Language
- **Doctor:** Speak English clearly
- **Patient:** Speak Hindi clearly
- Don't mix languages in same sentence

### 2. "All ASR services failed"

Both Google Cloud and OpenAI failed.

**Solutions:**

#### A. Check API Keys
```cmd
# Check .env file has:
GOOGLE_APPLICATION_CREDENTIALS=C:\full\path\to\key.json

# OR
OPENAI_API_KEY=sk-...
```

#### B. Verify Google Cloud Setup
1. Go to https://console.cloud.google.com
2. Check Speech-to-Text API is enabled
3. Check Translation API is enabled
4. Verify service account has permissions

#### C. Test API Connection
```python
# In backend directory:
python test_captions_import.py

# Should show:
# ✅ Google Speech Client: True
```

### 3. "Caption WebSocket error: Cannot call receive..."

WebSocket disconnected unexpectedly.

**Solutions:**
- Refresh the page
- Restart backend server
- Check internet connection
- Try different browser

### 4. No Captions Appearing

**Checklist:**
- [ ] Subtitles button is blue (enabled)
- [ ] Microphone permission granted
- [ ] Speaking clearly and loudly
- [ ] Waiting 3 seconds after speaking
- [ ] Backend server running
- [ ] No errors in browser console (F12)

### 5. Wrong Language Detected

**Solutions:**
- Speak in expected language (Doctor=English, Patient=Hindi)
- Speak clearly without mixing languages
- Check user type is correct (doctor vs patient)

## Testing Steps

### 1. Test Microphone
```
1. Open browser
2. Go to: chrome://settings/content/microphone
3. Test microphone
4. Speak - should see input level
5. Adjust if needed
```

### 2. Test with Simple Phrases

**Doctor (English):**
```
✅ "Hello"
✅ "How are you"
✅ "What is your name"
✅ "Do you have fever"
```

**Patient (Hindi):**
```
✅ "नमस्ते" (Namaste)
✅ "मुझे बुखार है" (I have fever)
✅ "सिर दर्द है" (Headache)
✅ "पेट दर्द है" (Stomach ache)
```

### 3. Check Backend Logs

Look for these messages:
```
✅ Good:
📤 Sending X bytes to Google Cloud STT
✅ Google STT transcribed: [text]
📝 Caption generated for doctor: [text]

❌ Bad:
⚠️ Google STT returned no results
All ASR services failed
```

### 4. Check Browser Console

Press F12 and look for:
```
✅ Good:
✅ Signaling connected
🎤 Audio recording started
📤 Sent audio chunk: X bytes

❌ Bad:
Error: No audio track
Caption WebSocket error
```

## Optimization Tips

### For Better Accuracy

1. **Speak Clearly**
   - Enunciate words
   - Normal pace (not too fast)
   - Pause between sentences

2. **Good Environment**
   - Quiet room
   - No background music
   - Close doors/windows
   - Turn off fans

3. **Good Equipment**
   - Use headset microphone
   - Not laptop built-in mic
   - Test mic quality first

4. **Proper Technique**
   - Speak directly into mic
   - 6-12 inches away
   - Don't cover mic
   - Don't shout

### Audio Settings

Current settings (optimized):
```typescript
// Frontend
AudioContext: 16kHz sample rate
Format: LINEAR16
Chunk size: 3 seconds
Mono audio

// Backend
Encoding: LINEAR16
Sample rate: 16kHz
Model: latest_long (best for medical)
Enhanced: true
```

## Advanced Debugging

### 1. Check Audio Data
```javascript
// In browser console:
// Check if audio is being captured
console.log('Audio chunks being sent:', audioChunks.length)
```

### 2. Test Google Cloud Directly
```python
# In backend:
from app.stt_pipeline import get_stt_pipeline

stt = get_stt_pipeline()
# Check if client initialized
print(f"Google Client: {stt.google_speech_client is not None}")
```

### 3. Monitor Network
```
1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter: WS (WebSocket)
4. Watch for audio data being sent
5. Should see binary frames every 3 seconds
```

## Quick Fixes

### Fix 1: Restart Everything
```cmd
# Stop servers (Ctrl+C)
# Start again:
START_FOR_DIFFERENT_DEVICES.bat
```

### Fix 2: Clear Browser Cache
```
1. Press Ctrl+Shift+Delete
2. Clear cache
3. Refresh page
```

### Fix 3: Try Different Browser
- Chrome (recommended)
- Edge (recommended)
- Firefox (may work)
- Safari (iOS only)

### Fix 4: Check Firewall
```cmd
# Run as Administrator:
ALLOW_FIREWALL.bat
```

## Expected Behavior

### Normal Flow:
```
1. Click Subtitles button → Turns blue
2. Caption box appears → "Listening..."
3. Speak clearly → Wait 3 seconds
4. Caption appears → With translation
5. Continues for each speech
```

### Timing:
```
Speak: 0s
Processing: 1-3s
Caption appears: 3s
Total delay: 3-4 seconds
```

## Still Not Working?

### Check These:

1. **API Quota**
   - Google Cloud: 60 min/month free
   - Check usage in console
   - May need to enable billing

2. **Internet Speed**
   - Need stable connection
   - Test: speedtest.net
   - Minimum: 1 Mbps upload

3. **Browser Compatibility**
   - Chrome/Edge: ✅ Best
   - Firefox: ✅ Good
   - Safari: ⚠️ May have issues
   - IE: ❌ Not supported

4. **System Resources**
   - Close other apps
   - Check CPU usage
   - Check memory usage

## Success Indicators

You know it's working when:
- ✅ Button turns blue
- ✅ Caption box appears
- ✅ "Listening..." shows
- ✅ Backend logs show "Sending X bytes"
- ✅ Captions appear after 3 seconds
- ✅ Translation shows correctly

## Contact Support

If still having issues:
1. Check all items above
2. Note exact error messages
3. Check browser console (F12)
4. Check backend logs
5. Try simple test phrases first

**Most common fix: Speak louder and clearer!** 🎤
