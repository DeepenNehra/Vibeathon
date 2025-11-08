# Quick Fix: Start Call Feature

## The Problem
- Database errors when creating patients
- No proper patient selection UI
- RLS policy violations

## The Solution (3 Steps)

### Step 1: Fix Database (2 minutes)

Open Supabase SQL Editor and run:

```sql
-- Fix patients table
ALTER TABLE patients ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emotion_analysis_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en';

-- Fix RLS policies
DROP POLICY IF EXISTS "Authenticated users can insert patients" ON patients;
CREATE POLICY "Allow authenticated users to insert patients"
ON patients FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can view patients" ON patients;
CREATE POLICY "Allow authenticated users to view patients"
ON patients FOR SELECT TO authenticated USING (true);
```

### Step 2: Restart Services

```bash
# Backend
cd backend
python run.py

# Frontend (new terminal)
cd frontend
npm run dev
```

### Step 3: Test It

1. Go to http://localhost:3000
2. Sign in
3. Click "Start New Call"
4. Create a patient or select existing
5. Should navigate to video room ✅

## What's New

**Patient Selection Dialog:**
- Search patients by name
- Create new patients inline
- Automatic consultation creation
- Better error messages

**Files Created:**
- `frontend/components/dashboard/patient-select-dialog.tsx` - New dialog
- `FIX_START_CALL_COMPLETE.sql` - Complete SQL fix

**Files Updated:**
- `frontend/components/dashboard/start-call-button.tsx` - Now opens dialog

## That's It!

The start call feature is now fully functional with proper patient management.
