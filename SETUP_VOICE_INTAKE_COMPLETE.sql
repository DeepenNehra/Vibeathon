-- ============================================================================
-- COMPLETE VOICE INTAKE SETUP - RUN THIS ENTIRE SCRIPT IN SUPABASE
-- ============================================================================
-- This script creates all necessary tables and policies for voice intake feature
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard
-- ============================================================================

-- STEP 1: Create voice_intake_records table
-- ============================================================================

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
    
    -- Foreign key to auth.users
    CONSTRAINT fk_patient FOREIGN KEY (patient_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_voice_intake_patient_id ON voice_intake_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_voice_intake_created_at ON voice_intake_records(created_at DESC);

-- Add table comment
COMMENT ON TABLE voice_intake_records IS 'Stores voice-based patient intake data extracted from audio recordings';

-- ============================================================================
-- STEP 2: Enable Row Level Security on voice_intake_records
-- ============================================================================

ALTER TABLE voice_intake_records ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Patients can view own voice intake records" ON voice_intake_records;
DROP POLICY IF EXISTS "Patients can insert own voice intake records" ON voice_intake_records;
DROP POLICY IF EXISTS "Doctors can view all voice intake records" ON voice_intake_records;
DROP POLICY IF EXISTS "Service role has full access" ON voice_intake_records;
DROP POLICY IF EXISTS "Doctors can view voice intakes for their appointments" ON voice_intake_records;

-- Patients can view their own voice intake records
CREATE POLICY "Patients can view own voice intake records"
    ON voice_intake_records
    FOR SELECT
    USING (auth.uid() = patient_id);

-- Patients can insert their own voice intake records
CREATE POLICY "Patients can insert own voice intake records"
    ON voice_intake_records
    FOR INSERT
    WITH CHECK (auth.uid() = patient_id);

-- Doctors can view all voice intake records
CREATE POLICY "Doctors can view all voice intake records"
    ON voice_intake_records
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'doctor'
        )
    );

-- Service role has full access (for backend API)
CREATE POLICY "Service role has full access"
    ON voice_intake_records
    FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- Grant permissions
GRANT ALL ON voice_intake_records TO authenticated;
GRANT ALL ON voice_intake_records TO service_role;

-- ============================================================================
-- STEP 3: Add voice_intake_id column to appointments table
-- ============================================================================

-- Add the column (if it doesn't exist)
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS voice_intake_id UUID;

-- Add foreign key constraint (drop first if exists to avoid conflicts)
DO $$ 
BEGIN
    -- Drop constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_appointments_voice_intake'
    ) THEN
        ALTER TABLE appointments DROP CONSTRAINT fk_appointments_voice_intake;
    END IF;
    
    -- Add the constraint
    ALTER TABLE appointments 
    ADD CONSTRAINT fk_appointments_voice_intake 
    FOREIGN KEY (voice_intake_id) 
    REFERENCES voice_intake_records(id) 
    ON DELETE SET NULL;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_voice_intake_id ON appointments(voice_intake_id);

-- Add column comment
COMMENT ON COLUMN appointments.voice_intake_id IS 'Links to the patient voice intake record shared with this appointment';

-- ============================================================================
-- STEP 4: Add RLS policy for doctors to view voice intakes through appointments
-- ============================================================================

-- Doctors can view voice intakes for their appointments
CREATE POLICY "Doctors can view voice intakes for their appointments"
    ON voice_intake_records
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM appointments
            WHERE appointments.voice_intake_id = voice_intake_records.id
            AND appointments.doctor_id = auth.uid()
        )
    );

-- ============================================================================
-- DONE! Voice Intake Feature is now fully set up
-- ============================================================================

-- Verify the setup
SELECT 
    'voice_intake_records table created' as status,
    COUNT(*) as record_count 
FROM voice_intake_records;

SELECT 
    'appointments.voice_intake_id column added' as status,
    COUNT(*) as appointment_count 
FROM appointments;

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE '✅ Voice Intake Setup Complete!';
    RAISE NOTICE '✅ voice_intake_records table created';
    RAISE NOTICE '✅ RLS policies configured';
    RAISE NOTICE '✅ appointments table updated';
    RAISE NOTICE '✅ Ready to use!';
END $$;
