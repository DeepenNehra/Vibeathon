-- Create voice_intake_records table to store voice intake data
-- Run this in Supabase SQL Editor

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
    
    -- Indexes for better performance
    CONSTRAINT fk_patient FOREIGN KEY (patient_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_voice_intake_patient_id ON voice_intake_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_voice_intake_created_at ON voice_intake_records(created_at DESC);

-- Enable Row Level Security
ALTER TABLE voice_intake_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies

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

-- Doctors can view all voice intake records (for their patients)
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

-- Service role can do everything (for backend API)
CREATE POLICY "Service role has full access"
    ON voice_intake_records
    FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- Grant permissions
GRANT ALL ON voice_intake_records TO authenticated;
GRANT ALL ON voice_intake_records TO service_role;

-- Add comment
COMMENT ON TABLE voice_intake_records IS 'Stores voice-based patient intake data extracted from audio recordings';
