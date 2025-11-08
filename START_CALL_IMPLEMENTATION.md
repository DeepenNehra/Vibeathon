# Complete Start Call Implementation

## Overview

The start call feature has been fully implemented with:
- Patient selection dialog
- New patient creation
- Consultation creation
- Automatic navigation to video call room

## What Was Implemented

### 1. Patient Selection Dialog (`frontend/components/dashboard/patient-select-dialog.tsx`)

**Features:**
- Search existing patients
- Create new patients inline
- Select patient to start consultation
- Automatic consultation creation
- Error handling with helpful messages

**User Flow:**
1. Click "Start New Call" button
2. Dialog opens with patient list
3. Search or create new patient
4. Select patient → Consultation created → Navigate to video room

### 2. Updated Start Call Button (`frontend/components/dashboard/start-call-button.tsx`)

**Changes:**
- Simplified to just open the patient selection dialog
- No longer creates demo patients automatically
- Cleaner, more professional UX

### 3. Database Schema Fixes (`FIX_START_CALL_COMPLETE.sql`)

**Fixes:**
- Made `user_id` nullable in patients table
- Added missing columns (`emotion_analysis_enabled`, `preferred_language`)
- Fixed RLS policies for patients and consultations
- Allows authenticated users to create/view patients

## Setup Instructions

### Step 1: Fix Database Schema

Run this SQL in your Supabase SQL Editor:

```sql
-- Make user_id nullable
ALTER TABLE patients 
ALTER COLUMN user_id DROP NOT NULL;

-- Add missing columns
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS emotion_analysis_enabled BOOLEAN DEFAULT TRUE;

ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en';

-- Fix RLS policies
DROP POLICY IF EXISTS "Authenticated users can view patients" ON patients;
DROP POLICY IF EXISTS "Authenticated users can insert patients" ON patients;
DROP POLICY IF EXISTS "Authenticated users can update patients" ON patients;

CREATE POLICY "Allow authenticated users to view patients"
ON patients FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert patients"
ON patients FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update patients"
ON patients FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
```

Or run the complete script: `FIX_START_CALL_COMPLETE.sql`

### Step 2: Verify Frontend Components

Make sure these files exist:
- ✅ `frontend/components/dashboard/start-call-button.tsx`
- ✅ `frontend/components/dashboard/patient-select-dialog.tsx`
- ✅ `frontend/components/VideoCallRoom.tsx`
- ✅ `frontend/app/consultation/[id]/room/page.tsx`

### Step 3: Test the Flow

1. **Start the backend:**
   ```bash
   cd backend
   python run.py
   ```

2. **Start the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test the flow:**
   - Go to http://localhost:3000
   - Sign in as a doctor
   - Click "Start New Call"
   - Create a new patient or select existing
   - Should navigate to video call room

## Features Breakdown

### Patient Selection Dialog

**Search Functionality:**
- Real-time search by patient name
- Filters patient list as you type

**Patient List:**
- Shows patient name, DOB, and preferred language
- Click any patient to start consultation
- Hover effects for better UX

**New Patient Form:**
- Name (required)
- Date of Birth (required)
- Preferred Language (Hindi/English)
- Automatically starts consultation after creation

### Error Handling

**Database Errors:**
- RLS policy violations → Helpful message with fix instructions
- Missing columns → Clear error about schema issues
- Connection errors → Retry suggestions

**Session Errors:**
- Expired session → Redirect to auth page
- No session → Prompt to sign in

**Validation:**
- Required fields marked with *
- Date validation for DOB
- Name length validation

## Database Schema

### Patients Table

```sql
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    preferred_language TEXT DEFAULT 'en',
    emotion_analysis_enabled BOOLEAN DEFAULT TRUE,
    user_id UUID,  -- Nullable, not all patients are auth users
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Consultations Table

```sql
CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    doctor_id UUID NOT NULL REFERENCES auth.users(id),
    consultation_date TIMESTAMPTZ DEFAULT NOW(),
    full_transcript TEXT DEFAULT '',
    raw_soap_note JSONB,
    de_stigma_suggestions JSONB,
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## API Flow

### 1. Load Patients
```typescript
GET /patients
→ Returns list of all patients
→ Filtered by search query on frontend
```

### 2. Create Patient
```typescript
POST /patients
Body: {
  name: string,
  date_of_birth: string,
  preferred_language: 'hi' | 'en',
  emotion_analysis_enabled: boolean
}
→ Returns new patient with ID
```

### 3. Create Consultation
```typescript
POST /consultations
Body: {
  patient_id: UUID,
  doctor_id: UUID,
  consultation_date: ISO string,
  full_transcript: '',
  approved: false
}
→ Returns consultation with ID
```

### 4. Navigate to Room
```typescript
/consultation/{consultation_id}/room?userType=doctor
→ Opens video call room
→ Starts WebRTC connection
→ Enables live translation
```

## Common Issues & Solutions

### Issue: "Row-level security policy violation"

**Solution:**
Run the RLS fix SQL script to update policies.

### Issue: "null value in column user_id"

**Solution:**
Make user_id nullable:
```sql
ALTER TABLE patients ALTER COLUMN user_id DROP NOT NULL;
```

### Issue: "Could not find preferred_language column"

**Solution:**
Add missing columns:
```sql
ALTER TABLE patients ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en';
```

### Issue: Dialog doesn't open

**Solution:**
Check browser console for errors. Ensure:
- Supabase client is initialized
- User is authenticated
- Network requests are successful

### Issue: No patients showing

**Solution:**
- Check RLS policies allow SELECT
- Verify patients table has data
- Check browser console for errors

## Next Steps

### Enhancements You Could Add:

1. **Patient Search Improvements:**
   - Search by DOB
   - Filter by language
   - Sort options

2. **Patient Details:**
   - Medical history
   - Previous consultations count
   - Last consultation date

3. **Quick Actions:**
   - "Start with last patient" button
   - Recent patients list
   - Favorite patients

4. **Validation:**
   - Age validation (must be reasonable)
   - Name format validation
   - Duplicate patient detection

5. **Bulk Operations:**
   - Import patients from CSV
   - Export patient list
   - Batch patient creation

## Testing Checklist

- [ ] Can open patient selection dialog
- [ ] Can search for patients
- [ ] Can create new patient
- [ ] Can select existing patient
- [ ] Consultation is created successfully
- [ ] Navigates to video room
- [ ] Video room loads correctly
- [ ] WebSocket connects
- [ ] Live translation works
- [ ] Error messages are helpful
- [ ] Loading states work
- [ ] Dialog closes properly

## Files Modified/Created

### Created:
1. `frontend/components/dashboard/patient-select-dialog.tsx` - Patient selection UI
2. `FIX_START_CALL_COMPLETE.sql` - Database schema fixes
3. `START_CALL_IMPLEMENTATION.md` - This documentation

### Modified:
1. `frontend/components/dashboard/start-call-button.tsx` - Simplified to use dialog

### Existing (No changes needed):
1. `frontend/components/VideoCallRoom.tsx` - Video call functionality
2. `frontend/app/consultation/[id]/room/page.tsx` - Room page
3. `backend/app/main.py` - WebSocket and API endpoints

## Summary

The start call feature is now fully implemented with:
✅ Professional patient selection UI
✅ Inline patient creation
✅ Proper error handling
✅ Database schema fixes
✅ Complete user flow from button click to video room

Just run the SQL fix script and you're ready to go!
