# Live Caption Feature Implementation

## Overview
The live caption feature has been successfully implemented and integrated into the video call system. It provides real-time speech-to-text transcription with automatic translation support during video consultations.

## What Was Implemented

### Frontend Changes

1. **VideoCallRoomWithSignaling.tsx**
   - Added `localStream` state to properly track the media stream
   - Fixed integration with `LiveCaptions` component
   - Ensured the stream is passed correctly when captions are enabled
   - Added proper cleanup when stream is stopped

2. **LiveCaptions.tsx**
   - Updated to use `MediaRecorder` API instead of deprecated `ScriptProcessorNode`
   - Improved audio format detection (prefers OGG Opus, falls back to WebM Opus)
   - Better error handling and cleanup
   - Sends audio chunks every 2 seconds for optimal STT accuracy

### Backend Changes

1. **stt_pipeline.py**
   - Added `_detect_audio_format()` method to automatically detect audio format
   - Updated `transcribe_audio_google()` to support both LINEAR16 (PCM) and WebM/Opus formats
   - Made `db_client` parameter optional in `process_audio_stream()`
   - Improved format detection for better compatibility

2. **captions.py**
   - Already properly configured to handle audio streaming
   - Broadcasts captions to all participants in the consultation room
   - Handles WebSocket connections and disconnections gracefully

## How It Works

1. **User enables captions**: Click the captions button (subtitles icon) in the video call interface
2. **Audio capture**: The browser captures audio from the user's microphone using MediaRecorder
3. **Audio streaming**: Audio chunks are sent to the backend via WebSocket every 2 seconds
4. **Speech-to-text**: Backend processes audio through Google Cloud Speech-to-Text
5. **Translation**: Text is automatically translated based on user type:
   - Patient (Hindi) → Translated to English for doctor
   - Doctor (English/Hinglish) → Translated to Hindi for patient
6. **Display**: Captions appear in real-time in the overlay at the bottom of the screen

## Features

- ✅ Real-time transcription
- ✅ Automatic translation (Hindi ↔ English)
- ✅ Speaker identification (Doctor vs Patient)
- ✅ Visual overlay with modern UI
- ✅ Toggle on/off during call
- ✅ Works with existing WebRTC video call system
- ✅ Supports both WebM/Opus and LINEAR16 audio formats

## Usage

1. Start a video call as usual
2. Click the **Subtitles** button (📝 icon) in the control panel
3. Captions will appear at the bottom of the screen
4. Click the button again to disable captions

## Technical Details

### Audio Format Support
- **Primary**: WebM/Opus (from browser MediaRecorder)
- **Fallback**: LINEAR16 PCM (for compatibility)
- **Sample Rate**: 16kHz for LINEAR16, 48kHz for Opus

### WebSocket Endpoint
- **Path**: `/ws/captions/{consultation_id}/{user_type}`
- **Protocol**: Binary audio chunks sent every 2 seconds
- **Response**: JSON caption messages with original and translated text

### STT Pipeline
- **Primary**: Google Cloud Speech-to-Text
- **Fallback**: OpenAI Whisper API
- **Language Detection**: Automatic based on user type
- **Code-switching**: Supports Hinglish (Hindi-English mix)

## Testing

To test the live caption feature:

1. Start the backend server:
   ```bash
   cd backend
   python run.py
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Start a video call between a doctor and patient
4. Enable captions using the subtitles button
5. Speak and verify captions appear in real-time

## Troubleshooting

### Captions not appearing
- Check browser console for errors
- Verify WebSocket connection is established
- Ensure microphone permissions are granted
- Check backend logs for STT processing errors

### Audio format issues
- The system automatically detects format, but if issues occur:
  - Check browser MediaRecorder support
  - Verify Google Cloud Speech-to-Text credentials
  - Check network connectivity

### Translation not working
- Verify Google Cloud Translation API is enabled
- Check API credentials in environment variables
- Review backend logs for translation errors

## Future Enhancements

Potential improvements:
- Caption history/transcript export
- Customizable caption position and size
- Multiple language support
- Offline caption support
- Caption styling options

