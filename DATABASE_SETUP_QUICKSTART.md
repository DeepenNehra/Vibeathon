# Database Setup - Quick Start

## The Problem
Your Supabase database is empty - no tables exist yet.

## The Solution (2 minutes)

### Step 1: Run the Complete Setup Script

1. **Open Supabase Dashboard:**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor:**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Copy and paste the entire content of `COMPLETE_DATABASE_SETUP.sql`**

4. **Click "Run" (or press Ctrl+Enter)**

5. **Wait for success message:**
   ```
   ✅ Database setup complete!
   Tables created: patients, doctors, consultations, community_lexicon, emotion_logs, alerts
   Triggers created: User profile auto-creation
   RLS policies: Enabled and configured
   ```

### Step 2: Verify Setup

Run this quick check:

```sql
-- Should show 6 tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('patients', 'doctors', 'consultations', 'community_lexicon', 'emotion_logs', 'alerts');
```

### Step 3: Test It

1. **Restart your backend:**
   ```bash
   cd backend
   python run.py
   ```

2. **Restart your frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Sign up as a doctor:**
   - Go to http://localhost:3000/auth
   - Click "Sign Up"
   - Select "Doctor" role
   - Enter email and password
   - Submit

4. **Check if profile was created:**
   ```sql
   -- Should see your doctor profile
   SELECT * FROM public.doctors;
   ```

## What This Script Does

✅ Creates all 6 tables (patients, doctors, consultations, lexicon, emotions, alerts)
✅ Sets up automatic user profile creation (trigger)
✅ Configures Row Level Security (RLS) policies
✅ Creates indexes for performance
✅ Adds helpful views for analytics

## Tables Created

1. **patients** - Patient records (can be created by doctors or self-registered)
2. **doctors** - Doctor profiles (auto-created on signup)
3. **consultations** - Video call sessions and SOAP notes
4. **community_lexicon** - Medical term translations
5. **emotion_logs** - Real-time emotion detection data
6. **alerts** - Critical symptom alerts

## Automatic Features

**User Profile Creation:**
- Sign up as doctor → `doctors` table record created automatically
- Sign up as patient → `patients` table record created automatically
- Uses database trigger (no code changes needed)

**Security:**
- RLS policies ensure users only see their own data
- Doctors can view their consultations
- Patients can view their own profile

## Common Issues

### "Relation already exists"
This is fine! It means the table was already created. The script uses `IF NOT EXISTS` to prevent errors.

### "Permission denied"
Make sure you're using the correct Supabase project and have admin access.

### "Trigger already exists"
The script drops and recreates triggers, so this shouldn't happen. If it does, manually drop the trigger first:
```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
```

## Next Steps

After setup:
1. ✅ Sign up as a doctor
2. ✅ Create patients via "Start New Call"
3. ✅ Start video consultations
4. ✅ Use live translation
5. ✅ Generate SOAP notes

## Files

- `COMPLETE_DATABASE_SETUP.sql` - Run this first (complete setup)
- `VERIFY_USER_STORAGE.sql` - Run this to verify everything works
- `DATABASE_SETUP_QUICKSTART.md` - This guide

## That's It!

Your database is now fully set up and ready to use. All features will work automatically!
