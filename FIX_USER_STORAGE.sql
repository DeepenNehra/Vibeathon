-- Fix User Storage: Create profiles for doctors and patients
-- Run this in your Supabase SQL Editor

-- ============================================================================
-- STEP 1: Create doctors profile table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    specialization TEXT,
    license_number TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 2: Update patients table to link with auth.users
-- ============================================================================

-- Add user_id column if it doesn't exist (for patient login)
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add email column for easier lookup
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Make user_id nullable (not all patients need login)
ALTER TABLE public.patients 
ALTER COLUMN user_id DROP NOT NULL;

-- ============================================================================
-- STEP 3: Create function to handle new user signup
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Get the role from user metadata
    IF NEW.raw_user_meta_data->>'role' = 'doctor' THEN
        -- Create doctor profile
        INSERT INTO public.doctors (id, email, full_name)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
        );
    ELSIF NEW.raw_user_meta_data->>'role' = 'patient' THEN
        -- Create patient profile
        INSERT INTO public.patients (user_id, email, name, date_of_birth, preferred_language)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', 'Patient'),
            COALESCE((NEW.raw_user_meta_data->>'date_of_birth')::DATE, CURRENT_DATE - INTERVAL '30 years'),
            COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en')
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 4: Create trigger to automatically create profiles
-- ============================================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create new trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- STEP 5: Enable RLS for doctors table
-- ============================================================================

ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- Doctors can view their own profile
CREATE POLICY "Doctors can view own profile"
ON public.doctors FOR SELECT
USING (auth.uid() = id);

-- Doctors can update their own profile
CREATE POLICY "Doctors can update own profile"
ON public.doctors FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- All authenticated users can view doctor profiles (for patient to see doctor info)
CREATE POLICY "Authenticated users can view doctors"
ON public.doctors FOR SELECT
USING (auth.role() = 'authenticated');

-- ============================================================================
-- STEP 6: Update patients RLS policies
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "Authenticated users can view patients" ON public.patients;
DROP POLICY IF EXISTS "Authenticated users can insert patients" ON public.patients;
DROP POLICY IF EXISTS "Authenticated users can update patients" ON public.patients;

-- Patients can view their own profile
CREATE POLICY "Patients can view own profile"
ON public.patients FOR SELECT
USING (auth.uid() = user_id OR auth.role() = 'authenticated');

-- Doctors can insert patient records
CREATE POLICY "Doctors can insert patients"
ON public.patients FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Patients can update their own profile, doctors can update any
CREATE POLICY "Users can update patients"
ON public.patients FOR UPDATE
USING (auth.uid() = user_id OR auth.role() = 'authenticated')
WITH CHECK (auth.uid() = user_id OR auth.role() = 'authenticated');

-- ============================================================================
-- STEP 7: Create indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_doctors_email ON public.doctors(email);
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_email ON public.patients(email);

-- ============================================================================
-- STEP 8: Add updated_at trigger for doctors
-- ============================================================================

CREATE TRIGGER update_doctors_updated_at
    BEFORE UPDATE ON public.doctors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 9: Verify setup
-- ============================================================================

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('doctors', 'patients')
ORDER BY table_name;

-- Check if trigger exists
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('doctors', 'patients')
ORDER BY tablename, policyname;

