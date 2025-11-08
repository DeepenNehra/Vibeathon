# Implementation Plan: Live Captions Fix

This implementation plan breaks down the live captions fix into discrete, actionable coding tasks. Each task builds incrementally on previous steps to systematically diagnose and repair the caption system.

## Task List

- [x] 1. Verify and test backend caption WebSocket endpoint





  - Create a simple test script to verify the caption WebSocket endpoint is accessible and responding
  - Test WebSocket connection establishment at `/ws/captions/{consultation_id}/{user_type}`
  - Verify connection confirmation message is sent
  - Test sending a sample audio chunk and receiving a response
  - _Requirements: 1.1, 1.5_

- [x] 2. Diagnose and fix audio capture issues






- [x] 2.1 Add comprehensive logging to MediaRecorder setup

  - Add detailed console logs for MediaRecorder state transitions
  - Log audio track properties (readyState, enabled, muted)
  - Log first audio chunk reception to confirm data flow
  - Add periodic state monitoring (every 5 seconds)
  - _Requirements: 1.2, 1.3_


- [x] 2.2 Fix empty audio chunk handling

  - Implement proper validation for audio chunk size (skip < 100 bytes)
  - Add counter for consecutive empty chunks
  - Log warnings only after threshold exceeded (3+ empty chunks)
  - Ensure MediaRecorder uses appropriate timeslice (3000ms)
  - _Requirements: 1.3_

- [x] 2.3 Implement audio track readiness checks


  - Add delay before starting MediaRecorder to ensure track is producing data
  - Verify audio track is in 'live' state before recording
  - Add retry logic if track is not ready
  - _Requirements: 1.2_

- [x] 3. Fix WebSocket connection and reconnection logic






- [x] 3.1 Improve WebSocket connection management

  - Ensure WebSocket connects before MediaRecorder starts
  - Add connection state validation before sending chunks
  - Implement proper cleanup on component unmount
  - _Requirements: 1.1, 1.5_

- [x] 3.2 Implement robust reconnection mechanism

  - Add automatic reconnection with exponential backoff
  - Implement chunk queueing during disconnection (max 10 chunks)
  - Send queued chunks after successful reconnection
  - Add connection status indicator in UI
  - _Requirements: 1.5, 6.2_


- [x] 3.3 Fix MediaRecorder restart after WebSocket reconnection

  - Ensure MediaRecorder continues recording during WebSocket reconnection
  - Restart MediaRecorder only if it stopped unexpectedly
  - Add proper state checks before restart attempts
  - _Requirements: 1.4, 6.2_

- [x] 4. Verify and fix audio format conversion




- [x] 4.1 Test audio format detection


  - Verify format detection works for WebM/Opus chunks from MediaRecorder
  - Add logging for detected format and sample rate
  - Test with actual audio chunks from browser
  - _Requirements: 2.1, 2.2_

- [x] 4.2 Verify audio conversion to PCM


  - Test WebM/Opus to LINEAR16 PCM conversion with FFmpeg
  - Verify converted audio has correct sample rate (16kHz)
  - Add error handling for conversion failures
  - Log conversion success/failure with byte counts
  - _Requirements: 2.2_

- [x] 4.3 Add fallback for audio conversion failures


  - If conversion fails, attempt to send original format to Google Cloud STT
  - Log detailed error information for debugging
  - Implement graceful degradation
  - _Requirements: 2.4, 6.4_

- [x] 5. Fix Google Cloud STT integration






- [x] 5.1 Verify Google Cloud credentials

  - Check that GOOGLE_APPLICATION_CREDENTIALS environment variable is set
  - Verify credentials file exists and is valid
  - Test Google Cloud STT client initialization
  - Add startup validation and logging
  - _Requirements: 8.1, 8.2_

- [x] 5.2 Fix STT configuration for WebM/Opus


  - Ensure correct encoding is used (LINEAR16 after conversion)
  - Set appropriate sample rate (16kHz)
  - Configure language codes correctly (hi-IN for patient, en-IN for doctor)
  - Enable enhanced model and automatic punctuation
  - _Requirements: 2.2, 2.3, 7.2_

- [x] 5.3 Implement proper error handling for STT failures


  - Add detailed error logging for STT API failures
  - Implement fallback to Whisper API if Google fails
  - Return meaningful error messages to frontend
  - Continue processing other chunks even if one fails
  - _Requirements: 2.4, 6.3_

- [x] 6. Fix translation and caption broadcasting





- [x] 6.1 Verify translation configuration

  - Ensure correct source and target languages based on user type
  - Test translation with sample text
  - Add error handling for translation failures
  - Return original text if translation fails
  - _Requirements: 3.1, 3.2, 3.4_

- [x] 6.2 Fix caption broadcasting to all participants


  - Verify captions are broadcast to all WebSocket connections in room
  - Test with multiple clients in same consultation
  - Ensure both original and translated text are included
  - Add speaker identification in caption data
  - _Requirements: 3.5, 5.1, 5.2_


- [x] 6.3 Implement proper caption display logic

  - Show translated text for other speaker
  - Show original text for own speech
  - Display both texts when different
  - Add proper speaker labels and colors
  - _Requirements: 4.1, 4.2, 4.3, 5.3, 5.4, 5.5_

- [x] 7. Add comprehensive error handling and user feedback






- [x] 7.1 Implement microphone permission error handling

  - Detect permission denied errors
  - Display clear error message with instructions
  - Provide retry button
  - Add link to browser settings
  - _Requirements: 6.1_


- [x] 7.2 Add connection error handling

  - Display error when backend is unreachable
  - Show troubleshooting steps
  - Add retry mechanism
  - Log detailed error information to console
  - _Requirements: 6.4, 6.5_


- [x] 7.3 Implement caption generation error feedback

  - Show message when STT fails repeatedly
  - Suggest speaking more clearly
  - Display API quota exceeded message
  - Log all errors for debugging
  - _Requirements: 6.3, 6.5, 8.4_

- [x] 8. Performance optimization and testing





- [x] 8.1 Optimize audio chunk timing

  - Verify 3-second chunk interval is working
  - Test latency from speech to caption display
  - Ensure captions appear within 5 seconds
  - _Requirements: 7.1, 7.3_


- [x] 8.2 Add performance monitoring

  - Log chunk processing time
  - Monitor WebSocket message latency
  - Track STT API response time
  - Add metrics for debugging
  - _Requirements: 7.4, 7.5_

- [ ]* 8.3 Create end-to-end integration test
  - Test complete flow from audio capture to caption display
  - Verify translation accuracy
  - Test with both doctor and patient user types
  - Test reconnection scenarios
  - _Requirements: All requirements_

- [x] 9. Documentation and cleanup





- [x] 9.1 Add inline code comments


  - Document complex logic in MediaRecorder setup
  - Explain WebSocket reconnection strategy
  - Document audio format detection and conversion
  - Add comments for error handling paths
  - _Requirements: All requirements_


- [x] 9.2 Update environment variable documentation

  - Document required Google Cloud credentials
  - Document optional OpenAI API key
  - Add setup instructions for new developers
  - Document API quota limits
  - _Requirements: 8.1, 8.2, 8.3, 8.5_

## Implementation Notes

### Testing Strategy

- Start with backend verification (Task 1) to ensure the endpoint is working
- Fix audio capture issues (Task 2) before moving to WebSocket logic
- Test each component independently before integration testing
- Use browser console logs extensively for debugging
- Test with real audio in a video call environment

### Key Focus Areas

1. **Audio Capture**: Ensure MediaRecorder is producing valid audio chunks
2. **WebSocket Reliability**: Implement robust connection and reconnection logic
3. **Audio Conversion**: Verify WebM/Opus to PCM conversion is working
4. **STT Integration**: Ensure Google Cloud STT is configured correctly
5. **Error Handling**: Provide clear feedback for all error scenarios

### Dependencies

- Tasks 2.x must be completed before Task 3 (audio must be captured before streaming)
- Task 4 must be completed before Task 5 (audio must be converted before STT)
- Task 5 must be completed before Task 6 (transcription before translation)
- Task 7 can be done in parallel with other tasks
- Task 8 should be done after core functionality is working
- Task 9 should be done last

### Success Criteria

- Audio chunks are captured and sent to backend
- WebSocket connection is stable with automatic reconnection
- Audio is converted to correct format for Google Cloud STT
- Transcriptions are generated within 5 seconds
- Translations are accurate and displayed correctly
- Errors are handled gracefully with clear user feedback
- System works reliably in real video call scenarios
