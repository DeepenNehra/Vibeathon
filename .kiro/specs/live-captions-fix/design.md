# Design Document: Live Captions Fix

## Overview

This document outlines the design for fixing the live captions feature in the telemedicine video call system. The feature enables real-time speech-to-text transcription with automatic translation between English and Hindi during video consultations. The current implementation exists but requires systematic diagnosis and repair to ensure proper functionality.

The system consists of three main components:
1. **Frontend Caption UI** (`LiveCaptions.tsx`) - Captures audio and displays captions
2. **Backend Caption WebSocket** (`captions.py`) - Manages connections and broadcasts captions
3. **STT Pipeline** (`stt_pipeline.py`) - Processes audio and generates transcriptions

## Architecture

### System Flow

```
┌─────────────────┐
│  User's Browser │
│  (MediaRecorder)│
└────────┬────────┘
         │ Audio Chunks (WebM/Opus)
         │ via WebSocket
         ▼
┌─────────────────────────────────┐
│  Backend Caption WebSocket      │
│  /ws/captions/{id}/{user_type}  │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  STT Pipeline                   │
│  - Audio Format Detection       │
│  - WebM/Opus → PCM Conversion   │
│  - Google Cloud STT (primary)   │
│  - OpenAI Whisper (fallback)    │
│  - Translation (Google)         │
│  - Lexicon Lookup               │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Caption Manager                │
│  - Broadcast to all participants│
└────────┬────────────────────────┘
         │ Caption JSON
         ▼
┌─────────────────┐
│  All Browsers   │
│  in Room        │
└─────────────────┘
```

### Component Interaction

1. **Audio Capture**: Frontend uses `MediaRecorder` API to capture audio from microphone
2. **Audio Streaming**: Audio chunks sent via WebSocket every 3 seconds
3. **Audio Processing**: Backend converts WebM/Opus to PCM, then sends to Google Cloud STT
4. **Translation**: Transcribed text is translated based on user type (doctor ↔ patient)
5. **Broadcasting**: Captions are broadcast to all participants in the consultation room
6. **Display**: Frontend displays captions with speaker identification and translation

## Components and Interfaces

### 1. Frontend: LiveCaptions Component

**File**: `frontend/components/LiveCaptions.tsx`

**Responsibilities**:
- Establish WebSocket connection to caption service
- Capture audio from user's microphone using MediaRecorder
- Stream audio chunks to backend
- Receive and display captions from all participants
- Handle connection errors and reconnection

**Key Interfaces**:

```typescript
interface LiveCaptionsProps {
  consultationId: string
  userType: 'doctor' | 'patient'
  localStream: MediaStream | null
  enabled: boolean
  onToggle: () => void
}

interface Caption {
  speaker: 'doctor' | 'patient'
  original_text: string
  translated_text: string
  timestamp: number
  id: string
}
```

**WebSocket Messages (Sent)**:
- Binary: Audio chunks (WebM/Opus format, 3-second intervals)
- JSON: Control messages (ping, etc.)

**WebSocket Messages (Received)**:
```json
{
  "type": "caption",
  "speaker": "doctor" | "patient",
  "original_text": "Original transcription",
  "translated_text": "Translated text"
}
```

### 2. Backend: Caption WebSocket Endpoint

**File**: `backend/app/captions.py`

**Responsibilities**:
- Accept WebSocket connections from clients
- Manage consultation rooms (multiple participants)
- Receive audio chunks from clients
- Forward audio to STT pipeline
- Broadcast captions to all room participants
- Handle disconnections and cleanup

**Key Classes**:

```python
class CaptionManager:
    rooms: Dict[str, Set[WebSocket]]  # consultation_id -> websockets
    user_types: Dict[WebSocket, str]  # websocket -> user_type
    stt_pipeline: STTPipeline
    db_client: DatabaseClient
    
    async def connect(websocket, consultation_id, user_type)
    def disconnect(websocket, consultation_id)
    async def broadcast_caption(consultation_id, caption_data, sender)
    async def process_audio(audio_chunk, consultation_id, user_type, sender)
```

**WebSocket Endpoint**:
- URL: `/ws/captions/{consultation_id}/{user_type}`
- Accepts: Binary audio chunks, JSON control messages
- Sends: Caption JSON messages, error messages

### 3. Backend: STT Pipeline

**File**: `backend/app/stt_pipeline.py`

**Responsibilities**:
- Detect audio format (WebM/Opus, WAV, PCM, etc.)
- Convert audio to compatible format (LINEAR16 PCM)
- Transcribe audio using Google Cloud STT (primary)
- Fallback to OpenAI Whisper if Google fails
- Translate text based on user type
- Perform lexicon lookup for medical terms
- Store transcripts in database

**Key Methods**:

```python
class STTPipeline:
    async def transcribe_audio(audio_chunk, user_type) -> Optional[str]
    async def transcribe_audio_google(audio_chunk, language_code, alternative_codes) -> Optional[str]
    async def transcribe_audio_whisper(audio_chunk) -> Optional[str]
    async def translate_text(text, source_lang, target_lang) -> Optional[str]
    async def lookup_lexicon_term(text, db_client) -> str
    async def process_audio_stream(audio_chunk, user_type, consultation_id, db_client) -> Dict
```

**Audio Processing Flow**:
1. Detect audio format from byte signature
2. Convert WebM/Opus to LINEAR16 PCM (16kHz, mono) if needed
3. Send to Google Cloud STT with language-specific config
4. If Google fails, fallback to OpenAI Whisper
5. Perform lexicon lookup to replace regional medical terms
6. Translate text based on user type
7. Return original and translated text

### 4. Audio Converter

**File**: `backend/app/audio_converter_ffmpeg.py`

**Responsibilities**:
- Convert WebM/Opus audio to LINEAR16 PCM
- Validate audio data
- Handle conversion errors gracefully

**Key Methods**:

```python
class AudioConverter:
    def webm_to_pcm(audio_data: bytes, target_sample_rate: int = 16000) -> Optional[bytes]
    def is_valid_audio(audio_data: bytes, min_size: int = 100) -> bool
```

## Data Models

### Caption Data Structure

```python
{
    "type": "caption",
    "speaker": "doctor" | "patient",
    "original_text": str,  # Transcribed text in original language
    "translated_text": str,  # Translated text for other participant
    "timestamp": int  # Unix timestamp (set by frontend)
}
```

### STT Pipeline Result

```python
{
    "original_text": str,  # Transcribed text
    "translated_text": str,  # Translated text
    "speaker_id": str  # "doctor" or "patient"
}
```

### Audio Format Detection

```python
{
    "format_name": str,  # "webm", "ogg", "wav", "pcm", "flac"
    "needs_conversion": bool,  # True if conversion to PCM needed
    "sample_rate": int  # Detected or default sample rate (Hz)
}
```

## Error Handling

### Frontend Error Scenarios

1. **Microphone Access Denied**
   - Display error message with instructions
   - Provide link to browser settings
   - Show retry button

2. **WebSocket Connection Failed**
   - Attempt automatic reconnection (2-second delay)
   - Queue audio chunks during reconnection
   - Display connection status indicator

3. **MediaRecorder Errors**
   - Log detailed error information
   - Attempt to restart MediaRecorder
   - Fall back to simpler audio constraints

4. **Empty Audio Chunks**
   - Skip processing chunks < 100 bytes
   - Log warnings after 3 consecutive empty chunks
   - Check microphone permissions and settings

### Backend Error Scenarios

1. **Audio Format Not Supported**
   - Attempt conversion to PCM
   - Log format detection details
   - Return error message to client

2. **Google Cloud STT Failure**
   - Fallback to OpenAI Whisper API
   - Log error details
   - Continue processing other chunks

3. **Translation Service Unavailable**
   - Return original text without translation
   - Log warning
   - Continue caption generation

4. **WebSocket Disconnection**
   - Clean up connection from room
   - Log disconnection event
   - Remove from user_types mapping

### Error Recovery Strategies

1. **Automatic Reconnection**: Frontend automatically reconnects WebSocket after 2 seconds
2. **Chunk Queueing**: Queue audio chunks during WebSocket reconnection (max 10 chunks)
3. **ASR Fallback**: Use Whisper API if Google Cloud STT fails
4. **Graceful Degradation**: Return original text if translation fails
5. **State Monitoring**: Periodically check MediaRecorder state and restart if needed

## Testing Strategy

### Unit Tests

1. **Audio Format Detection**
   - Test detection of WebM, OGG, WAV, PCM, FLAC formats
   - Test handling of unknown formats
   - Test sample rate extraction

2. **Audio Conversion**
   - Test WebM/Opus to PCM conversion
   - Test conversion with different sample rates
   - Test handling of invalid audio data

3. **Caption Manager**
   - Test room creation and cleanup
   - Test connection and disconnection
   - Test broadcasting to multiple participants

4. **STT Pipeline**
   - Test transcription with mock audio
   - Test translation between Hindi and English
   - Test lexicon lookup and term replacement

### Integration Tests

1. **End-to-End Caption Flow**
   - Send audio chunk from frontend
   - Verify caption received by all participants
   - Verify translation accuracy

2. **WebSocket Connection Management**
   - Test multiple clients in same room
   - Test disconnection and reconnection
   - Test cleanup of empty rooms

3. **Error Handling**
   - Test behavior with invalid audio
   - Test behavior when STT service unavailable
   - Test behavior when translation service unavailable

### Manual Testing

1. **Real-Time Caption Generation**
   - Start video call with doctor and patient
   - Enable captions on both sides
   - Speak in English (doctor) and Hindi (patient)
   - Verify captions appear within 5 seconds
   - Verify translations are accurate

2. **Connection Resilience**
   - Disconnect and reconnect network
   - Verify automatic reconnection
   - Verify queued chunks are sent

3. **Audio Quality**
   - Test with different microphones
   - Test with background noise
   - Test with unclear speech

4. **Browser Compatibility**
   - Test in Chrome, Edge, Firefox
   - Test MediaRecorder support
   - Test WebSocket support

## Configuration and Setup

### Environment Variables

**Backend** (`.env`):
```bash
# Google Cloud credentials
GOOGLE_APPLICATION_CREDENTIALS=path/to/google-credentials.json

# OpenAI API key (optional, for Whisper fallback)
OPENAI_API_KEY=sk-...

# Database connection
DATABASE_URL=postgresql://...
```

**Frontend** (`.env.local`):
```bash
# Backend URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Google Cloud Setup

1. **Enable APIs**:
   - Cloud Speech-to-Text API
   - Cloud Translation API

2. **Create Service Account**:
   - Download JSON credentials
   - Set `GOOGLE_APPLICATION_CREDENTIALS` environment variable

3. **API Quotas**:
   - Speech-to-Text: 60 minutes/month free tier
   - Translation: 500,000 characters/month free tier

### Dependencies

**Backend**:
```
fastapi
uvicorn
websockets
google-cloud-speech
google-cloud-translate
openai
sentence-transformers
ffmpeg-python
pydub
```

**Frontend**:
```
react
next
lucide-react
sonner (for toast notifications)
```

## Performance Considerations

### Latency Optimization

1. **Audio Chunk Size**: 3-second chunks balance latency and accuracy
2. **WebSocket Connection**: Direct binary streaming (no HTTP overhead)
3. **Parallel Processing**: Process audio chunks independently
4. **Enhanced STT Model**: Use `latest_long` model for better accuracy

### Resource Management

1. **Connection Pooling**: Reuse Google Cloud clients
2. **Memory Management**: Limit caption history to 10 items
3. **Chunk Queue**: Limit to 10 chunks to prevent memory issues
4. **Room Cleanup**: Remove empty rooms automatically

### Scalability

1. **Horizontal Scaling**: WebSocket connections can be load-balanced
2. **Database Optimization**: Use connection pooling for transcript storage
3. **API Rate Limiting**: Monitor Google Cloud API quotas
4. **Caching**: Cache lexicon lookups for common terms

## Security Considerations

1. **Authentication**: Verify consultation_id and user_type
2. **Authorization**: Ensure users can only join their own consultations
3. **Data Privacy**: Encrypt WebSocket connections (WSS)
4. **API Keys**: Store credentials securely in environment variables
5. **Input Validation**: Validate audio chunk size and format
6. **Rate Limiting**: Prevent abuse of caption service

## Known Issues and Limitations

### Current Issues

1. **Empty Audio Chunks**: MediaRecorder sometimes sends empty chunks at startup
2. **WebSocket Reconnection**: May lose a few chunks during reconnection
3. **Audio Format Detection**: Some formats may not be detected correctly
4. **Translation Accuracy**: Medical terms may not translate accurately

### Limitations

1. **Browser Support**: MediaRecorder only works in Chrome/Edge (not Firefox/Safari)
2. **Language Support**: Currently only English and Hindi
3. **API Costs**: Google Cloud APIs have usage limits
4. **Latency**: 3-5 second delay between speech and caption display
5. **Accuracy**: STT accuracy depends on audio quality and accent

## Future Enhancements

1. **Multi-Language Support**: Add support for more Indian languages
2. **Offline Mode**: Use Web Speech API as offline fallback
3. **Caption History**: Store and retrieve past captions
4. **Speaker Diarization**: Automatically identify speakers
5. **Medical Lexicon**: Expand community lexicon with more terms
6. **Real-Time Editing**: Allow users to correct captions
7. **Caption Export**: Export captions as transcript file
8. **Voice Activity Detection**: Skip processing during silence
