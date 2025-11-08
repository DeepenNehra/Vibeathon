# Complete Voice Intake Setup - Final Steps

## 🎯 Current Status

✅ Voice recording works
✅ AI extraction works
✅ Data displays correctly
❌ Data not saving to history (database table missing)
❌ Doctor can't see patient voice intake yet

## 🔧 Setup Required (2 Steps)

### Step 1: Create Database Tables in Supabase

You need to run 2 SQL scripts in Supabase:

#### 1.1 Go to Supabase Dashboard
1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in the left sidebar

#### 1.2 Run First Script
Copy and paste this entire script and click **Run**:

```sql
-- CREATE VOICE INTAKE RECORDS TABLE
CREATE TABLE IF NOT EXISTS voice_intake_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    intake_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Extracted fields for easy querying
    full_name TEXT,
    age INTEGER,
    chief_complaint TEXT,
    symptom_duration TEXT,
    medical_history JSONB,
    current_medications JSONB,
    allergies JSONB,
    language_code TEXT,
    
    -- Foreign key
    CONSTRAINT fk_patient FOREIGN KEY (patient_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_voice_intake_patient_id ON voice_intake_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_voice_intake_created_at ON voice_intake_records(created_at DESC);

-- Enable Row Level Security
ALTER TABLE voice_intake_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Patients can view own voice intake records"
    ON voice_intake_records FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Patients can insert own voice intake records"
    ON voice_intake_records FOR INSERT
    WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Doctors can view all voice intake records"
    ON voice_intake_records FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'doctor'
        )
    );

CREATE POLICY "Service role has full access"
    ON voice_intake_records FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- Grant permissions
GRANT ALL ON voice_intake_records TO authenticated;
GRANT ALL ON voice_intake_records TO service_role;
```

#### 1.3 Run Second Script
Copy and paste this script and click **Run**:

```sql
-- LINK VOICE INTAKE TO APPOINTMENTS
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS voice_intake_id UUID REFERENCES voice_intake_records(id) ON DELETE SET NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_appointments_voice_intake_id ON appointments(voice_intake_id);

-- Add RLS policy for doctors to view voice intakes through appointments
CREATE POLICY IF NOT EXISTS "Doctors can view voice intakes for their appointments"
    ON voice_intake_records FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM appointments
            WHERE appointments.voice_intake_id = voice_intake_records.id
            AND appointments.doctor_id = auth.uid()
        )
    );
```

### Step 2: Restart Backend

```bash
# Stop backend (Ctrl+C)
# Restart:
cd backend
python run.py
```

## ✅ After Setup - How It Works

### Patient Flow:
```
1. Patient records voice intake
   ↓
2. Clicks "Save to Profile"
   ↓
3. Data saved to voice_intake_records table ✅
   ↓
4. Patient can view in History page ✅
   ↓
5. Patient books appointment with doctor
   ↓
6. System links latest voice intake to appointment ✅
   ↓
7. Doctor can see patient's medical history ✅
```

### Doctor Flow:
```
1. Doctor views appointments
   ↓
2. Sees "Voice Intake Available" badge
   ↓
3. Clicks on appointment
   ↓
4. Views patient's voice intake:
   - Chief complaint (highlighted)
   - Allergies (red badges)
   - Current medications
   - Medical history
   - Lifestyle factors
   ↓
5. Better prepared for consultation ✅
```

## 🎯 Testing After Setup

### Test 1: Save to History
1. Record voice intake (15-30 seconds)
2. Click "Save to Profile"
3. Click "View History"
4. Should see your saved record ✅

### Test 2: Doctor Integration
1. Patient books appointment
2. Doctor logs in
3. Doctor views appointments
4. Doctor clicks on appointment
5. Doctor sees patient's voice intake ✅

## 📊 What Gets Saved

When patient saves voice intake:
- ✅ Full name
- ✅ Age and gender
- ✅ Chief complaint
- ✅ Symptom duration
- ✅ Medical history
- ✅ Current medications
- ✅ Allergies
- ✅ Previous surgeries
- ✅ Family history
- ✅ Lifestyle factors
- ✅ Original transcript
- ✅ English translation

## 🔗 Automatic Linking to Appointments

When patient books appointment:
- System finds patient's latest voice intake
- Automatically links it to the appointment
- Doctor can access it immediately
- No manual steps needed!

## 🎨 Doctor View Features

Doctor sees:
- 🔴 **Chief Complaint** - Highlighted in red box
- ⚠️ **Allergies** - Red badges (critical info)
- 💊 **Medications** - Secondary badges
- 📋 **Medical History** - Outlined badges
- 🏃 **Lifestyle** - Smoking, alcohol, exercise
- 📝 **Full Details** - Expandable section

## 🚀 Quick Setup Commands

```bash
# 1. Run SQL scripts in Supabase (copy from above)

# 2. Restart backend
cd backend
python run.py

# 3. Test it!
# - Record voice intake
# - Save to profile
# - View history
# - Book appointment
# - Doctor sees it!
```

## ✨ Summary

After running the SQL scripts:
1. ✅ Voice intake saves to database
2. ✅ History page shows saved records
3. ✅ Appointments link to voice intake
4. ✅ Doctors see patient medical history
5. ✅ Complete integration working!

## 🎉 You're Almost Done!

Just run those 2 SQL scripts in Supabase and everything will work perfectly!

**Time needed**: 2 minutes
**Difficulty**: Easy (just copy-paste SQL)
