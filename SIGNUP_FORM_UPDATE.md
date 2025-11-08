# Signup Form Update - Doctor Profile Fields

## What Was Added

Added professional information fields to the doctor signup form:

1. **Full Name** - For both doctors and patients
2. **Years of Experience** - For doctors only
3. **Consultation Fee** - For doctors only (in ₹)

## Features

### Signup Form Fields

**For All Users:**
- Email (existing)
- Password (existing)
- Role selection (existing)
- **Full Name** ⭐ NEW

**For Doctors Only:**
- **Years of Experience** ⭐ NEW
- **Consultation Fee (₹)** ⭐ NEW

### Automatic Profile Creation

When a doctor signs up:
1. Fills in the signup form
2. Submits registration
3. Database trigger automatically creates doctor profile with:
   - Email
   - Full name
   - Years of experience
   - Consultation fee
4. Ready to use immediately!

## Setup Instructions

### Step 1: Update Database Trigger (1 minute)

Run this in Supabase SQL Editor:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.raw_user_meta_data->>'role' = 'doctor' THEN
        INSERT INTO public.doctors (
            id, 
            email, 
            full_name, 
            years_of_experience, 
            consultation_fee
        )
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
            COALESCE((NEW.raw_user_meta_data->>'years_of_experience')::INTEGER, 0),
            COALESCE((NEW.raw_user_meta_data->>'consultation_fee')::DECIMAL, 0.00)
        );
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
```

Or simply run: `UPDATE_SIGNUP_TRIGGER.sql`

### Step 2: Restart Frontend

```bash
cd frontend
npm run dev
```

### Step 3: Test It

1. Go to http://localhost:3000/auth
2. Click "Create your free account"
3. Select "Doctor" role
4. Fill in:
   - Email
   - Password
   - Full Name (e.g., "Dr. John Doe")
   - Years of Experience (e.g., "5")
   - Consultation Fee (e.g., "500")
5. Click "Create Account"
6. Sign in
7. Go to Profile page
8. Verify all fields are populated! ✅

## UI/UX Features

### Conditional Fields

- Full Name shows for both doctors and patients
- Years of Experience only shows for doctors
- Consultation Fee only shows for doctors
- Fields appear/disappear smoothly when role changes

### Input Validation

- Years of Experience: Must be >= 0
- Consultation Fee: Must be >= 0, allows decimals
- All fields optional (defaults to 0 if empty)

### Visual Design

- Consistent with existing auth page design
- Teal color scheme
- Smooth transitions
- Professional appearance

## Data Flow

```
User fills signup form
    ↓
Frontend collects:
  - email
  - password
  - role
  - full_name
  - years_of_experience (if doctor)
  - consultation_fee (if doctor)
    ↓
Supabase Auth creates user
    ↓
Stores metadata in user record
    ↓
Database trigger fires
    ↓
Reads metadata
    ↓
Creates doctor/patient profile
    ↓
Profile ready with all info!
```

## Files Modified

1. **`frontend/app/(auth)/auth/page.tsx`**
   - Added state for new fields
   - Added input fields to form
   - Updated signup API call with metadata

2. **`COMPLETE_DATABASE_SETUP.sql`**
   - Updated trigger function to read new metadata

3. **`UPDATE_SIGNUP_TRIGGER.sql`** (NEW)
   - Standalone script to update existing databases

4. **`SIGNUP_FORM_UPDATE.md`** (NEW)
   - This documentation

## Benefits

✅ **Better Onboarding** - Doctors provide info upfront
✅ **Complete Profiles** - No need to edit profile after signup
✅ **Professional** - Looks more polished and complete
✅ **Time Saving** - One-step registration
✅ **Data Quality** - Encourages doctors to provide accurate info

## Optional Enhancements

Future improvements you could add:

- Specialization field in signup
- License number in signup
- Phone number in signup
- Profile photo upload
- Email verification before access
- Terms & conditions checkbox
- Privacy policy link

## Testing Checklist

- [ ] Signup form shows new fields
- [ ] Fields only show for doctors
- [ ] Full name shows for both roles
- [ ] Can enter years of experience
- [ ] Can enter consultation fee
- [ ] Validation works (no negative numbers)
- [ ] Signup creates user
- [ ] Profile is created automatically
- [ ] All fields are populated in database
- [ ] Can view profile after signup
- [ ] Fields are editable in profile page

## Troubleshooting

### Fields not showing
- Clear browser cache
- Restart frontend dev server
- Check browser console for errors

### Profile not created
- Verify trigger exists in database
- Check Supabase logs for errors
- Ensure RLS policies allow inserts

### Values not saving
- Check trigger function is updated
- Verify metadata is being sent
- Check data types match (INTEGER, DECIMAL)

## Summary

✅ Added Full Name field to signup
✅ Added Years of Experience field for doctors
✅ Added Consultation Fee field for doctors
✅ Updated database trigger to use signup data
✅ Automatic profile creation with complete info
✅ Professional, polished signup experience

Doctors can now provide their professional information during signup, making the onboarding process smooth and complete!
