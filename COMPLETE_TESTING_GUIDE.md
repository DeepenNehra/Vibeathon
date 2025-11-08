# Complete Testing Guide - Arogya-AI Telehealth Platform

## Pre-Testing Setup Checklist

### 1. Database Setup ✅
- [ ] Run `COMPLETE_DATABASE_SETUP.sql` in Supabase SQL Editor
- [ ] Verify all 6 tables created
- [ ] Verify trigger exists (`on_auth_user_created`)
- [ ] Check RLS policies are enabled

### 2. Environment Variables ✅
- [ ] Backend `.env` has correct Supabase credentials
- [ ] Backend `.env` has Google Cloud credentials
- [ ] Backend `.env` has Gemini API key
- [ ] Frontend `.env.local` has Supabase credentials

### 3. Services Running ✅
- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:3000
- [ ] No errors in terminal logs

## Testing Flow

### Phase 1: Authentication & User Management

#### Test 1.1: Doctor Signup
1. Go to http://localhost:3000/auth
2. Click "Sign Up"
3. Select "Doctor" role
4. Enter email: `doctor@test.com`
5. Enter password: `test123456`
6. Click "Sign Up"

**Expected Result:**
- ✅ Account created message
- ✅ Email confirmation prompt (if email confirmation enabled)
- ✅ Or automatic redirect to dashboard

**Verify in Supabase:**
```sql
-- Check auth user
SELECT id, email, raw_user_meta_data FROM auth.users WHERE email = 'doctor@test.com';

-- Check doctor profile
SELECT * FROM public.doctors WHERE email = 'doctor@test.com';
```

#### Test 1.2: Doctor Login
1. Go to http://localhost:3000/auth
2. Enter email: `doctor@test.com`
3. Enter password: `test123456`
4. Click "Sign In"

**Expected Result:**
- ✅ Redirects to `/dashboard`
- ✅ Shows doctor dashboard with "Start New Call" button
- ✅ No errors in console

#### Test 1.3: Patient Signup (Optional)
1. Sign out
2. Go to http://localhost:3000/auth
3. Click "Sign Up"
4. Select "Patient" role
5. Enter email: `patient@test.com`
6. Enter password: `test123456`
7. Click "Sign Up"

**Expected Result:**
- ✅ Account created
- ✅ Patient profile created in database

**Verify in Supabase:**
```sql
SELECT * FROM public.patients WHERE email = 'patient@test.com';
```

### Phase 2: Patient Management

#### Test 2.1: Create Patient via Dialog
1. Login as doctor
2. Go to dashboard
3. Click "Start New Call"
4. Dialog opens
5. Click "New Patient"
6. Fill in:
   - Name: "Test Patient"
   - DOB: "1990-01-01"
   - Language: "Hindi"
7. Click "Create & Start Call"

**Expected Result:**
- ✅ Patient created successfully
- ✅ Consultation created
- ✅ Redirects to video call room
- ✅ URL: `/consultation/{id}/room?userType=doctor`

**Verify in Supabase:**
```sql
-- Check patient
SELECT * FROM public.patients WHERE name = 'Test Patient';

-- Check consultation
SELECT * FROM public.consultations ORDER BY created_at DESC LIMIT 1;
```

#### Test 2.2: Select Existing Patient
1. Go back to dashboard
2. Click "Start New Call"
3. Search for "Test Patient"
4. Click on patient card
5. Should start consultation

**Expected Result:**
- ✅ New consultation created
- ✅ Redirects to video room

### Phase 3: Video Call & WebRTC

#### Test 3.1: Camera & Microphone Access
1. In video room, browser should prompt for permissions
2. Allow camera and microphone

**Expected Result:**
- ✅ Local video appears in preview
- ✅ No permission errors
- ✅ Console shows: "✅ Local video stream set"

#### Test 3.2: WebSocket Connection
1. Check browser console
2. Look for WebSocket messages

**Expected Result:**
- ✅ "WebSocket connected"
- ✅ No connection errors
- ✅ Backend logs show: "Video call WebSocket connected"

#### Test 3.3: Audio Streaming
1. Speak into microphone
2. Check backend logs

**Expected Result:**
- ✅ "✅ Received X bytes of audio data from doctor"
- ✅ "✅ Audio validation passed"
- ✅ "🔄 Processing through STT pipeline..."

### Phase 4: Speech-to-Text & Translation

#### Test 4.1: Google Cloud STT
1. Speak clearly for 2-3 seconds in English
2. Check backend logs

**Expected Result:**
- ✅ "✅ Google STT transcribed: [your text]"
- ✅ No "silence or unclear audio" warnings
- ✅ Transcription appears in UI

#### Test 4.2: Translation
1. Speak in English as doctor
2. Should translate to Hindi for patient

**Expected Result:**
- ✅ Original text shown in English
- ✅ Translated text shown in Hindi
- ✅ Both appear in captions

#### Test 4.3: Hinglish Support
1. Speak mixing English and Hindi
2. Check if both languages detected

**Expected Result:**
- ✅ Code-switching handled
- ✅ Both languages transcribed

### Phase 5: SOAP Note Generation

#### Test 5.1: End Consultation
1. In video room, click "End Call" or "Generate SOAP Note"
2. Wait for processing

**Expected Result:**
- ✅ SOAP note generated
- ✅ Shows Subjective, Objective, Assessment, Plan sections
- ✅ Saved to database

**Verify in Supabase:**
```sql
SELECT id, raw_soap_note FROM public.consultations 
WHERE raw_soap_note IS NOT NULL 
ORDER BY created_at DESC LIMIT 1;
```

#### Test 5.2: View SOAP Note
1. Go to `/records` page
2. Find the consultation
3. Click to view details

**Expected Result:**
- ✅ SOAP note displayed
- ✅ All sections visible
- ✅ Can approve/edit

### Phase 6: Emotion Analysis (If Enabled)

#### Test 6.1: Emotion Detection
1. During video call, show different emotions
2. Check if emotions are detected

**Expected Result:**
- ✅ Emotions logged in database
- ✅ Real-time emotion display (if UI implemented)

**Verify in Supabase:**
```sql
SELECT * FROM public.emotion_logs ORDER BY created_at DESC LIMIT 10;
```

### Phase 7: Records & History

#### Test 7.1: View Patient Records
1. Go to `/records`
2. Should see list of patients

**Expected Result:**
- ✅ All patients listed
- ✅ Can search patients
- ✅ Shows consultation count

#### Test 7.2: View Consultation History
1. Click on a patient
2. View their consultations

**Expected Result:**
- ✅ All consultations listed
- ✅ Shows date, status
- ✅ Can view SOAP notes

## Common Issues & Solutions

### Issue: "relation does not exist"
**Solution:** Run `COMPLETE_DATABASE_SETUP.sql`

### Issue: "row-level security policy violation"
**Solution:** Check RLS policies are created correctly

### Issue: "No text transcribed (silence)"
**Solution:** 
- Speak louder and clearer
- Speak for 2+ seconds
- Check microphone permissions
- Verify Google Cloud credentials

### Issue: "WebSocket connection failed"
**Solution:**
- Check backend is running
- Verify port 8000 is accessible
- Check CORS settings

### Issue: "Camera not working"
**Solution:**
- Grant browser permissions
- Check if camera is in use by another app
- Try different browser (Chrome recommended)

### Issue: "Translation not working"
**Solution:**
- Verify Google Cloud Translation API enabled
- Check API credentials
- Check backend logs for errors

## Performance Benchmarks

### Expected Response Times:
- **STT Processing:** 1-3 seconds
- **Translation:** < 1 second
- **SOAP Note Generation:** 5-10 seconds
- **WebSocket Latency:** < 100ms

### Expected Accuracy:
- **STT Accuracy:** 85-95% (clear speech)
- **Translation Accuracy:** 90-95%
- **Emotion Detection:** 70-85%

## Database Verification Queries

### Check All Tables
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Check User Profiles
```sql
-- Doctors
SELECT d.id, d.email, d.full_name, u.created_at
FROM public.doctors d
JOIN auth.users u ON d.id = u.id
ORDER BY u.created_at DESC;

-- Patients
SELECT p.id, p.name, p.email, p.user_id, p.created_at
FROM public.patients p
ORDER BY p.created_at DESC;
```

### Check Consultations
```sql
SELECT 
    c.id,
    p.name as patient_name,
    d.full_name as doctor_name,
    c.consultation_date,
    c.approved,
    CASE WHEN c.raw_soap_note IS NOT NULL THEN '✅' ELSE '❌' END as has_soap_note
FROM public.consultations c
JOIN public.patients p ON c.patient_id = p.id
JOIN public.doctors d ON c.doctor_id = d.id
ORDER BY c.consultation_date DESC;
```

### Check Emotion Logs
```sql
SELECT 
    el.emotion_type,
    el.confidence_score,
    el.created_at,
    c.id as consultation_id
FROM public.emotion_logs el
LEFT JOIN public.consultations c ON el.consultation_id = c.id
ORDER BY el.created_at DESC
LIMIT 20;
```

## Success Criteria

### Minimum Viable Product (MVP):
- ✅ Doctor can sign up and login
- ✅ Doctor can create patients
- ✅ Doctor can start video call
- ✅ Audio is transcribed
- ✅ Text is translated
- ✅ SOAP note is generated
- ✅ Records are saved

### Full Feature Set:
- ✅ All MVP features
- ✅ Patient can sign up and login
- ✅ Emotion detection works
- ✅ Alerts are generated
- ✅ Community lexicon integration
- ✅ Real-time captions display
- ✅ De-stigmatization suggestions

## Next Steps After Testing

1. **If all tests pass:**
   - Deploy to production
   - Set up monitoring
   - Configure backups

2. **If tests fail:**
   - Check error logs
   - Verify environment variables
   - Review database setup
   - Check API credentials

3. **Performance optimization:**
   - Add caching
   - Optimize database queries
   - Implement CDN for static assets

4. **Security hardening:**
   - Review RLS policies
   - Add rate limiting
   - Implement audit logging
   - Set up SSL/TLS

## Support Resources

- **Database Issues:** Check `COMPLETE_DATABASE_SETUP.sql`
- **User Storage:** Check `FIX_USER_STORAGE_GUIDE.md`
- **Start Call:** Check `START_CALL_IMPLEMENTATION.md`
- **STT Issues:** Check `STT_TROUBLESHOOTING.md`

## Testing Completion Checklist

- [ ] All Phase 1 tests passed (Authentication)
- [ ] All Phase 2 tests passed (Patient Management)
- [ ] All Phase 3 tests passed (Video Call)
- [ ] All Phase 4 tests passed (STT & Translation)
- [ ] All Phase 5 tests passed (SOAP Notes)
- [ ] All Phase 6 tests passed (Emotions)
- [ ] All Phase 7 tests passed (Records)
- [ ] Database verified
- [ ] Performance acceptable
- [ ] No critical errors

**When all checkboxes are complete, your system is ready for production! 🎉**
