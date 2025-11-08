# Fix User Storage: Doctors & Patients Not Saving

## The Problem

When users sign up, they're created in `auth.users` but not in your `doctors` or `patients` tables. This causes issues when trying to:
- View doctor profiles
- Create consultations
- Access patient records

## The Solution

Use **database triggers** to automatically create profile records when users sign up.

## Setup (5 minutes)

### Step 1: Run the SQL Fix

Open Supabase SQL Editor and run `FIX_USER_STORAGE.sql`:

```sql
-- Creates doctors table
-- Updates patients table with user_id
-- Creates automatic trigger to create profiles on signup
-- Sets up proper RLS policies
```

Or copy this quick version:

```sql
-- Create doctors table
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

-- Update patients table
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Create trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.raw_user_meta_data->>'role' = 'doctor' THEN
        INSERT INTO public.doctors (id, email, full_name)
        VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
    ELSIF NEW.raw_user_meta_data->>'role' = 'patient' THEN
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

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view doctors"
ON public.doctors FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Doctors can update own profile"
ON public.doctors FOR UPDATE
USING (auth.uid() = id);
```

### Step 2: Verify the Setup

Run this to check if everything is set up:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('doctors', 'patients');

-- Check trigger exists
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check existing users
SELECT id, email, raw_user_meta_data->>'role' as role FROM auth.users;

-- Check doctor profiles
SELECT * FROM public.doctors;

-- Check patient profiles
SELECT id, user_id, email, name FROM public.patients;
```

### Step 3: Test Signup

1. **Sign up as a doctor:**
   - Go to http://localhost:3000/auth
   - Select "Sign Up"
   - Choose "Doctor" role
   - Enter email and password
   - Submit

2. **Verify in Supabase:**
   ```sql
   -- Should see doctor in both tables
   SELECT * FROM auth.users WHERE email = 'your-email@example.com';
   SELECT * FROM public.doctors WHERE email = 'your-email@example.com';
   ```

3. **Sign up as a patient:**
   - Same process but choose "Patient" role
   - Should create record in `patients` table

## How It Works

### Database Trigger Flow

```
User signs up
    ↓
auth.users record created
    ↓
Trigger fires: on_auth_user_created
    ↓
Check role in metadata
    ↓
If doctor → Create doctors record
If patient → Create patients record
    ↓
Profile ready to use!
```

### Metadata Stored

When signing up, we store:
- `role`: 'doctor' or 'patient'
- `full_name`: User's name (defaults to email prefix)
- `preferred_language`: 'en' or 'hi'
- `date_of_birth`: For patients

### Tables Structure

**doctors table:**
```sql
id (UUID) → Links to auth.users.id
email (TEXT)
full_name (TEXT)
specialization (TEXT)
license_number (TEXT)
phone (TEXT)
created_at, updated_at
```

**patients table (updated):**
```sql
id (UUID) → Auto-generated
user_id (UUID) → Links to auth.users.id (nullable)
email (TEXT)
name (TEXT)
date_of_birth (DATE)
preferred_language (TEXT)
emotion_analysis_enabled (BOOLEAN)
created_at, updated_at
```

## For Existing Users

If you already have users in `auth.users` without profiles:

```sql
-- Manually create profiles for existing users
-- For doctors:
INSERT INTO public.doctors (id, email, full_name)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', email)
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'doctor'
ON CONFLICT (id) DO NOTHING;

-- For patients:
INSERT INTO public.patients (user_id, email, name, date_of_birth, preferred_language)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', 'Patient'),
    COALESCE((raw_user_meta_data->>'date_of_birth')::DATE, CURRENT_DATE - INTERVAL '30 years'),
    COALESCE(raw_user_meta_data->>'preferred_language', 'en')
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'patient'
ON CONFLICT DO NOTHING;
```

## Common Issues

### Issue: Trigger not firing

**Check if trigger exists:**
```sql
SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';
```

**Recreate trigger:**
```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
```

### Issue: RLS blocking inserts

**Check policies:**
```sql
SELECT * FROM pg_policies WHERE tablename IN ('doctors', 'patients');
```

**Fix policies:**
```sql
-- Run the RLS policies from FIX_USER_STORAGE.sql
```

### Issue: Metadata not saving

**Check signup code:**
- Make sure `options.data` includes `role`
- Verify metadata in Supabase dashboard

### Issue: Duplicate key errors

**Clear existing data:**
```sql
-- Be careful! This deletes data
DELETE FROM public.doctors;
DELETE FROM public.patients WHERE user_id IS NOT NULL;
```

## Testing Checklist

- [ ] SQL script runs without errors
- [ ] Trigger exists in database
- [ ] Sign up as doctor creates doctor record
- [ ] Sign up as patient creates patient record
- [ ] Can view own profile
- [ ] Can create consultations
- [ ] RLS policies work correctly
- [ ] Existing users have profiles

## Files Modified

1. `FIX_USER_STORAGE.sql` - Complete database setup
2. `frontend/app/(auth)/auth/page.tsx` - Updated signup with metadata
3. `FIX_USER_STORAGE_GUIDE.md` - This guide

## Summary

✅ **Doctors table** created to store doctor profiles
✅ **Patients table** updated with user_id link
✅ **Automatic trigger** creates profiles on signup
✅ **RLS policies** set up for security
✅ **Signup updated** to include user metadata

Now when users sign up, they'll automatically get profile records in the appropriate tables!
