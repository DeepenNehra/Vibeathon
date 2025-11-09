-- Add voice_intake_id column to appointments table
-- This links appointments to voice intake records

-- Step 1: Add the column
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS voice_intake_id UUID REFERENCES voice_intake_records(id) ON DELETE SET NULL;

-- Step 2: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_voice_intake_id ON appointments(voice_intake_id);

-- Step 3: Add comment
COMMENT ON COLUMN appointments.voice_intake_id IS 'Links to the patient voice intake record shared with this appointment';

-- Step 4: Update RLS policies to allow doctors to access voice intakes for their appointments
CREATE POLICY IF NOT EXISTS "Doctors can view voice intakes for their appointments"
    ON voice_intake_records
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM appointments
            WHERE appointments.voice_intake_id = voice_intake_records.id
            AND appointments.doctor_id = auth.uid()
        )
    );

-- Done! Now appointments can be linked to voice intake records
