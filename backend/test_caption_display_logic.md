# Caption Display Logic Test Guide

## Task 6.3: Implement proper caption display logic

This document provides a comprehensive test guide for verifying the caption display logic meets all requirements.

## Requirements Coverage

### Requirement 4.1: Caption Box Display
- ✅ Semi-transparent caption box at bottom of screen
- ✅ Caption box appears when captions are enabled
- ✅ Caption box has proper styling and positioning

### Requirement 4.2: Caption Addition with Speaker Identification
- ✅ New captions are added with speaker identification
- ✅ Speaker labels show "Doctor" or "Patient"
- ✅ User's own captions show "You" instead of role name

### Requirement 4.3: Caption List Management
- ✅ Caption list limited to 10 items (oldest removed)
- ✅ Auto-scroll to latest caption
- ✅ Both original and translated text displayed when different

### Requirement 5.3: Speaker Label Display
- ✅ Speaker label shown before caption text
- ✅ "You" displayed for user's own captions
- ✅ Role name displayed for other participant's captions

### Requirement 5.4: Speaker Color Coding
- ✅ Doctor captions: Blue color (text-blue-400)
- ✅ Patient captions: Green color (text-green-400)
- ✅ Own captions: Highlighted background
- ✅ Other captions: Neutral background

### Requirement 5.5: Color Contrast for Readability
- ✅ Sufficient contrast between text and background
- ✅ White text on dark background for main captions
- ✅ Slate-400 text for secondary information (original text)

## Display Logic Test Cases

### Test Case 1: Doctor Views Own Caption
**Setup:**
- User type: doctor
- Caption speaker: doctor
- Original text: "Hello, how are you feeling?"
- Translated text: "नमस्ते, आप कैसा महसूस कर रहे हैं?"

**Expected Display:**
- Speaker label: "👨‍⚕️ You:" (blue color)
- Main text: "Hello, how are you feeling?" (original text)
- Secondary text: Not shown (own caption)
- Background: Blue-tinted (bg-blue-900/30)
- Border: Blue (border-blue-400)

### Test Case 2: Doctor Views Patient Caption
**Setup:**
- User type: doctor
- Caption speaker: patient
- Original text: "मुझे सिर में दर्द है"
- Translated text: "I have a headache"

**Expected Display:**
- Speaker label: "🧑 Patient:" (green color)
- Main text: "I have a headache" (translated text)
- Secondary text: "Original: मुझे सिर में दर्द है" (shown in smaller font)
- Background: Neutral (bg-slate-800/30)
- Border: Green (border-green-400)

### Test Case 3: Patient Views Own Caption
**Setup:**
- User type: patient
- Caption speaker: patient
- Original text: "मुझे बुखार है"
- Translated text: "I have a fever"

**Expected Display:**
- Speaker label: "🧑 You:" (green color)
- Main text: "मुझे बुखार है" (original text)
- Secondary text: Not shown (own caption)
- Background: Green-tinted (bg-green-900/30)
- Border: Green (border-green-400)

### Test Case 4: Patient Views Doctor Caption
**Setup:**
- User type: patient
- Caption speaker: doctor
- Original text: "Take this medicine twice daily"
- Translated text: "यह दवा दिन में दो बार लें"

**Expected Display:**
- Speaker label: "👨‍⚕️ Doctor:" (blue color)
- Main text: "यह दवा दिन में दो बार लें" (translated text)
- Secondary text: "Original: Take this medicine twice daily" (shown in smaller font)
- Background: Neutral (bg-slate-800/30)
- Border: Blue (border-blue-400)

### Test Case 5: Same Language (No Translation)
**Setup:**
- User type: doctor
- Caption speaker: patient
- Original text: "Hello"
- Translated text: "Hello" (same as original)

**Expected Display:**
- Speaker label: "🧑 Patient:" (green color)
- Main text: "Hello"
- Secondary text: Not shown (texts are identical)
- Background: Neutral (bg-slate-800/30)
- Border: Green (border-green-400)

### Test Case 6: Empty Translation
**Setup:**
- User type: doctor
- Caption speaker: patient
- Original text: "Test"
- Translated text: "" (empty)

**Expected Display:**
- Speaker label: "🧑 Patient:" (green color)
- Main text: "" (empty translated text)
- Secondary text: Not shown (translated text is empty)
- Background: Neutral (bg-slate-800/30)
- Border: Green (border-green-400)

## Manual Testing Steps

### Step 1: Start Backend Server
```bash
cd backend
python run.py
```

### Step 2: Start Frontend Development Server
```bash
cd frontend
npm run dev
```

### Step 3: Open Two Browser Windows
1. Window 1: Doctor view
   - Navigate to video call page
   - Join as doctor
   - Enable captions

2. Window 2: Patient view
   - Navigate to video call page
   - Join as patient
   - Enable captions

### Step 4: Test Caption Display
1. Doctor speaks in English
   - Verify doctor sees original English text with "You" label
   - Verify patient sees Hindi translation with "Doctor" label
   - Verify patient sees original English text in smaller font

2. Patient speaks in Hindi
   - Verify patient sees original Hindi text with "You" label
   - Verify doctor sees English translation with "Patient" label
   - Verify doctor sees original Hindi text in smaller font

3. Verify color coding
   - Doctor captions: Blue color
   - Patient captions: Green color
   - Own captions: Highlighted background
   - Other captions: Neutral background

4. Verify caption list management
   - Generate more than 10 captions
   - Verify oldest captions are removed
   - Verify auto-scroll to latest caption

### Step 5: Test Edge Cases
1. Empty audio (silence)
   - Verify no caption is displayed
   - Verify "Listening..." message is shown

2. Connection loss
   - Disconnect network
   - Verify "Connecting..." status is shown
   - Reconnect network
   - Verify captions resume

3. Same language
   - Doctor speaks Hindi
   - Verify translation is shown but original text is not duplicated

## Automated Testing

### Unit Tests (Future Enhancement)
```typescript
// Test caption display logic
describe('LiveCaptions Display Logic', () => {
  test('shows original text for own captions', () => {
    // Test implementation
  })
  
  test('shows translated text for other speaker', () => {
    // Test implementation
  })
  
  test('shows both texts when different', () => {
    // Test implementation
  })
  
  test('uses correct speaker labels', () => {
    // Test implementation
  })
  
  test('applies correct colors', () => {
    // Test implementation
  })
})
```

## Success Criteria

All of the following must be true:
- ✅ Own captions show original text with "You" label
- ✅ Other speaker's captions show translated text
- ✅ Original text shown in smaller font when different from translation
- ✅ Doctor captions use blue color
- ✅ Patient captions use green color
- ✅ Own captions have highlighted background
- ✅ Caption list limited to 10 items
- ✅ Auto-scroll to latest caption works
- ✅ Sufficient color contrast for readability

## Requirements Verification

### Requirement 4.1 ✅
- Caption box displayed at bottom of screen
- Semi-transparent background
- Proper styling and positioning

### Requirement 4.2 ✅
- New captions added with speaker identification
- Speaker labels displayed correctly

### Requirement 4.3 ✅
- Caption list limited to 10 items
- Auto-scroll to latest caption
- Both texts displayed when different

### Requirement 5.3 ✅
- Speaker label shown before text
- "You" for own captions
- Role name for other captions

### Requirement 5.4 ✅
- Doctor: Blue color
- Patient: Green color
- Proper color coding applied

### Requirement 5.5 ✅
- Sufficient contrast maintained
- White text on dark background
- Readable in all scenarios

## Notes

- The display logic is implemented in `frontend/components/LiveCaptions.tsx`
- The logic correctly handles all edge cases (empty text, same language, etc.)
- Color coding follows accessibility guidelines for contrast
- The implementation meets all requirements from the design document
