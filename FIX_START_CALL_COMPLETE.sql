-- Complete Fix for Start Call Functionality
-- Run this in your Supabase SQL Editor

-- ============================================================================
-- STEP 1: Fix patients table schema
-- ============================================================================

-- Make user_id nullable (patients don't need to be auth users)
ALTER TABLE patients 
ALTER COLUMN user_id DROP NOT NULL;

-- Add missing columns if they don't exist
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS emotion_analysis_enabled BOOLEAN DEFAULT TRUE;

ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en';

-- ============================================================================
-- STEP 2: Fix RLS policies for patients table
-- ============================================================================

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Doctors can view their patients" ON patients;
DROP POLICY IF EXISTS "Doctors can insert patients" ON patients;
DROP POLICY IF EXISTS "Authenticated users can view patients" ON patients;
DROP POLICY IF EXISTS "Authenticated users can insert patients" ON patients;
DROP POLICY IF EXISTS "Authenticated users can update patients" ON patients;

-- Create new permissive policies
CREATE POLICY "Allow authenticated users to view patients"
ON patients FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert patients"
ON patients FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update patients"
ON patients FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================================================
-- STEP 3: Fix RLS policies for consultations table
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "Doctors can view their consultations" ON consultations;
DROP POLICY IF EXISTS "Doctors can insert consultations" ON consultations;
DROP POLICY IF EXISTS "Doctors can update their consultations" ON consultations;

-- Create new policies
CREATE POLICY "Allow doctors to view their consultations"
ON consultations FOR SELECT
TO authenticated
USING (doctor_id = auth.uid());

CREATE POLICY "Allow doctors to insert consultations"
ON consultations FOR INSERT
TO authenticated
WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Allow doctors to update their consultations"
ON consultations FOR UPDATE
TO authenticated
USING (doctor_id = auth.uid())
WITH CHECK (doctor_id = auth.uid());

-- ============================================================================
-- STEP 4: Verify the setup
-- ============================================================================

-- Check patients table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'patients'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('patients', 'consultations')
ORDER BY tablename, policyname;

-- ============================================================================
-- STEP 5: Create a test patient (optional)
-- ============================================================================

-- Uncomment to create a test patient
-- INSERT INTO patients (name, date_of_birth, preferred_language)
-- VALUES ('Test Patient', '1990-01-01', 'hi')
-- ON CONFLICT DO NOTHING;

