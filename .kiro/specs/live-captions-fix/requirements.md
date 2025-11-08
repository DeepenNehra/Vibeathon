# Requirements Document

## Introduction

This specification addresses the live captions feature in the telemedicine video call system. The feature enables real-time speech-to-text transcription with automatic translation between English and Hindi during video consultations. The current implementation exists but is not functioning properly, requiring systematic diagnosis and repair.

## Glossary

- **Caption System**: The complete real-time speech-to-text and translation system
- **STT Pipeline**: Speech-to-Text processing pipeline that converts audio to text
- **Caption WebSocket**: WebSocket connection at `/ws/captions/{consultation_id}` for streaming audio and receiving captions
- **Signaling WebSocket**: WebSocket connection at `/ws/signaling/{consultation_id}/{user_type}` for WebRTC peer connection setup
- **MediaRecorder**: Browser API for capturing audio from the microphone
- **Audio Chunk**: A segment of audio data (typically 1-3 seconds) sent for transcription
- **Google Cloud STT**: Google Cloud Speech-to-Text API service
- **Translation Service**: Google Cloud Translation API for converting text between languages
- **LiveCaptions Component**: React component that displays captions and manages audio streaming
- **Doctor User**: Healthcare provider who typically speaks English
- **Patient User**: Healthcare recipient who may speak Hindi or English

## Requirements

### Requirement 1: Audio Capture and Streaming

**User Story:** As a doctor or patient, I want my speech to be captured and sent for transcription, so that captions can be generated in real-time during the video call.

#### Acceptance Criteria

1. WHEN the user enables captions, THE Caption System SHALL establish a WebSocket connection to `/ws/captions/{consultation_id}`
2. WHEN the Caption WebSocket is connected, THE Caption System SHALL start capturing audio from the user's microphone using MediaRecorder
3. WHEN audio is being captured, THE Caption System SHALL send audio chunks every 1-3 seconds to the Caption WebSocket
4. WHEN the user disables captions, THE Caption System SHALL stop audio capture and close the Caption WebSocket connection
5. IF the Caption WebSocket connection fails, THEN THE Caption System SHALL display an error message and provide a retry option

### Requirement 2: Speech-to-Text Processing

**User Story:** As a system, I want to convert audio chunks into text accurately, so that users can read what is being said during the call.

#### Acceptance Criteria

1. WHEN the backend receives an audio chunk, THE STT Pipeline SHALL validate the audio data format and size
2. WHEN audio validation passes, THE STT Pipeline SHALL convert the audio to PCM format at 16kHz sample rate
3. WHEN audio is converted, THE STT Pipeline SHALL send the audio to Google Cloud STT API for transcription
4. IF Google Cloud STT fails, THEN THE STT Pipeline SHALL attempt transcription using OpenAI Whisper as a fallback
5. WHEN transcription is successful, THE STT Pipeline SHALL return the transcribed text with speaker identification

### Requirement 3: Language Translation

**User Story:** As a doctor speaking English, I want to see Hindi translations of the patient's speech, so that I can understand patients who speak Hindi.

**User Story:** As a patient speaking Hindi, I want to see English translations of the doctor's speech, so that I can understand doctors who speak English.

#### Acceptance Criteria

1. WHEN a Doctor User speaks, THE Caption System SHALL transcribe the audio in English and translate it to Hindi
2. WHEN a Patient User speaks, THE Caption System SHALL transcribe the audio in Hindi and translate it to English
3. WHEN translation is successful, THE Caption System SHALL include both original text and translated text in the caption
4. IF translation fails, THEN THE Caption System SHALL display only the original transcribed text
5. WHEN displaying captions, THE Caption System SHALL show the original language first, followed by the translation

### Requirement 4: Caption Display

**User Story:** As a user in a video call, I want to see captions displayed clearly on my screen, so that I can read them without blocking the video.

#### Acceptance Criteria

1. WHEN captions are enabled, THE LiveCaptions Component SHALL display a semi-transparent caption box at the bottom of the screen
2. WHEN a new caption is received, THE LiveCaptions Component SHALL add it to the caption display with speaker identification
3. WHEN the caption list exceeds 10 items, THE LiveCaptions Component SHALL remove the oldest caption
4. WHEN a new caption is added, THE LiveCaptions Component SHALL automatically scroll to show the latest caption
5. WHEN the user clicks the close button, THE LiveCaptions Component SHALL hide the caption box and stop audio capture

### Requirement 5: Speaker Identification

**User Story:** As a user viewing captions, I want to know who is speaking, so that I can follow the conversation easily.

#### Acceptance Criteria

1. WHEN a caption is generated for a Doctor User, THE Caption System SHALL label it with "Doctor" and display it in blue color
2. WHEN a caption is generated for a Patient User, THE Caption System SHALL label it with "Patient" and display it in green color
3. WHEN displaying captions, THE LiveCaptions Component SHALL show the speaker label before the caption text
4. WHEN the user is viewing their own caption, THE LiveCaptions Component SHALL display "You" instead of the role name
5. WHEN captions are color-coded, THE LiveCaptions Component SHALL maintain sufficient contrast for readability

### Requirement 6: Error Handling and Recovery

**User Story:** As a user, I want the system to handle errors gracefully and provide clear feedback, so that I know what went wrong and how to fix it.

#### Acceptance Criteria

1. IF microphone access is denied, THEN THE Caption System SHALL display an error message explaining how to grant permissions
2. IF the Caption WebSocket disconnects unexpectedly, THEN THE Caption System SHALL attempt to reconnect automatically
3. IF audio transcription fails repeatedly, THEN THE Caption System SHALL display a message suggesting the user speak more clearly
4. IF the backend is unreachable, THEN THE Caption System SHALL display a connection error with troubleshooting steps
5. WHEN any error occurs, THE Caption System SHALL log detailed error information to the browser console for debugging

### Requirement 7: Performance and Latency

**User Story:** As a user, I want captions to appear quickly after I speak, so that the conversation feels natural and real-time.

#### Acceptance Criteria

1. WHEN a user speaks, THE Caption System SHALL display the caption within 5 seconds of speech completion
2. WHEN processing audio, THE STT Pipeline SHALL use the enhanced Google Cloud STT model for better accuracy
3. WHEN sending audio chunks, THE Caption System SHALL use 3-second intervals to balance latency and accuracy
4. WHEN multiple users are speaking, THE Caption System SHALL process audio streams independently without blocking
5. WHEN the system is under load, THE Caption System SHALL maintain caption generation without dropping audio chunks

### Requirement 8: Configuration and Setup

**User Story:** As a system administrator, I want the caption system to be properly configured with API credentials, so that it can access speech-to-text and translation services.

#### Acceptance Criteria

1. WHEN the backend starts, THE Caption System SHALL verify that Google Cloud credentials are configured
2. WHEN Google Cloud credentials are missing, THE Caption System SHALL log a warning and fall back to OpenAI Whisper
3. WHEN API keys are configured, THE Caption System SHALL validate them by making a test API call
4. IF API quota is exceeded, THEN THE Caption System SHALL display a message indicating the service is temporarily unavailable
5. WHEN the system is deployed, THE Caption System SHALL use environment variables for all API credentials and configuration
