# Setup Doctor Profile - Step by Step

## Quick Setup (5 minutes)

### Step 1: Update Database (2 minutes)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and paste this SQL:**

```sql
-- Add years of experience field
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS years_of_experience INTEGER DEFAULT 0;

-- Add consultation fee field
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS consultation_fee DECIMAL(10, 2) DEFAULT 0.00;

-- Add validation (must be positive numbers)
ALTER TABLE public.doctors 
ADD CONSTRAINT check_years_of_experience_positive 
CHECK (years_of_experience >= 0);

ALTER TABLE public.doctors 
ADD CONSTRAINT check_consultation_fee_positive 
CHECK (consultation_fee >= 0);
```

4. **Click "Run"** (or press Ctrl+Enter)

5. **You should see:** "Success. No rows returned"

### Step 2: Verify Files Exist (1 minute)

Check that these files were created:

```
✅ frontend/components/dashboard/doctor-profile-card.tsx
✅ frontend/app/profile/page.tsx
✅ ADD_DOCTOR_FIELDS.sql
```

If any are missing, let me know!

### Step 3: Restart Your App (2 minutes)

1. **Stop both servers** (Ctrl+C in both terminals)

2. **Restart Backend:**
```bash
cd backend
python run.py
```

3. **Restart Frontend** (in new terminal):
```bash
cd frontend
npm run dev
```

### Step 4: Test It (1 minute)

1. **Open your app:** http://localhost:3000

2. **Sign in as a doctor**

3. **Click "Profile"** in the top navigation

4. **You should see:**
   - Your email
   - Full Name field
   - Specialization field
   - License Number field
   - Phone field
   - **Years of Experience field** ⭐ NEW
   - **Consultation Fee field** ⭐ NEW

5. **Click "Edit"** button

6. **Update the new fields:**
   - Years of Experience: Enter a number (e.g., 5)
   - Consultation Fee: Enter an amount (e.g., 500.00)

7. **Click "Save"**

8. **Success!** ✅ Your profile is updated

## Troubleshooting

### Error: "column already exists"
✅ This is fine! It means the field was already added. Continue to Step 3.

### Error: "relation doctors does not exist"
❌ You need to run the complete database setup first:
1. Run `COMPLETE_DATABASE_SETUP.sql` in Supabase SQL Editor
2. Then come back to Step 1 above

### Profile page shows 404
❌ Make sure the file exists:
- Check: `frontend/app/profile/page.tsx`
- If missing, the file needs to be created

### "Profile" link not showing in navigation
❌ Make sure `frontend/app/dashboard/page.tsx` was updated
- The navigation should include a "Profile" link
- Restart the frontend if needed

### Can't save profile changes
❌ Check browser console for errors
- Make sure you're signed in
- Check Supabase RLS policies allow updates

## What You Can Do Now

After setup, doctors can:

✅ View their profile at `/profile`
✅ Edit their information
✅ Set years of experience
✅ Set consultation fee
✅ Save changes instantly

## Quick Test Commands

**Check if fields exist in database:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'doctors' 
AND column_name IN ('years_of_experience', 'consultation_fee');
```

**View your doctor profile:**
```sql
SELECT * FROM public.doctors;
```

**Update your profile manually (if needed):**
```sql
UPDATE public.doctors 
SET 
  years_of_experience = 5,
  consultation_fee = 500.00
WHERE email = 'your-email@example.com';
```

## That's It!

You're done! The doctor profile feature is now set up and ready to use.

**Next Steps:**
- Sign in as a doctor
- Go to Profile page
- Update your information
- Start using the enhanced profile! 🎉
