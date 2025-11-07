-- Enable Row Level Security on all tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_lexicon ENABLE ROW LEVEL SECURITY;

-- Patients table RLS policies
-- Doctors can only see patients they've consulted with
CREATE POLICY "Doctors can view their patients"
ON patients FOR SELECT
USING (
    id IN (
        SELECT patient_id FROM consultations 
        WHERE doctor_id = auth.uid()
    )
);

CREATE POLICY "Doctors can insert patients"
ON patients FOR INSERT
WITH CHECK (true);

CREATE POLICY "Doctors can update their patients"
ON patients FOR UPDATE
USING (
    id IN (
        SELECT patient_id FROM consultations 
        WHERE doctor_id = auth.uid()
    )
);

-- Consultations table RLS policies
-- Doctors can only access their own consultations
CREATE POLICY "Doctors can view their consultations"
ON consultations FOR SELECT
USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can insert their consultations"
ON consultations FOR INSERT
WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update their consultations"
ON consultations FOR UPDATE
USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can delete their consultations"
ON consultations FOR DELETE
USING (doctor_id = auth.uid());

-- Medical lexicon table RLS policies
-- All authenticated users can read the lexicon
CREATE POLICY "Authenticated users can view lexicon"
ON medical_lexicon FOR SELECT
USING (auth.role() = 'authenticated');

-- Only doctors can insert terms into the lexicon
CREATE POLICY "Doctors can add to lexicon"
ON medical_lexicon FOR INSERT
WITH CHECK (verified_by_doctor_id = auth.uid());
