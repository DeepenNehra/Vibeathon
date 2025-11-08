# Doctor Profile Update - Years of Experience & Consultation Fee

## What Was Added

### New Database Fields

Added two new fields to the `doctors` table:
- **`years_of_experience`** (INTEGER) - Number of years practicing medicine
- **`consultation_fee`** (DECIMAL) - Consultation fee in local currency (₹)

### Features Implemented

1. **Database Schema Update**
   - Added fields with proper data types
   - Added validation constraints (must be >= 0)
   - Added helpful comments for documentation

2. **Doctor Profile Card Component**
   - View and edit all doctor information
   - Real-time updates
   - Professional UI with icons
   - Input validation

3. **Profile Page**
   - Dedicated page at `/profile`
   - Clean, focused interface
   - Easy navigation from dashboard

4. **Dashboard Integration**
   - Added "Profile" link to navigation
   - Accessible from anywhere in the app

## Setup Instructions

### For New Databases

If you're running `COMPLETE_DATABASE_SETUP.sql` for the first time, the fields are already included. Just run the script and you're done!

### For Existing Databases

If you already have the `doctors` table, run this migration:

```sql
-- Add new fields
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS years_of_experience INTEGER DEFAULT 0;

ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS consultation_fee DECIMAL(10, 2) DEFAULT 0.00;

-- Add validation
ALTER TABLE public.doctors 
ADD CONSTRAINT check_years_of_experience_positive 
CHECK (years_of_experience >= 0);

ALTER TABLE public.doctors 
ADD CONSTRAINT check_consultation_fee_positive 
CHECK (consultation_fee >= 0);
```

Or simply run: `ADD_DOCTOR_FIELDS.sql`

## Usage

### Accessing the Profile Page

1. **From Dashboard:**
   - Click "Profile" in the top navigation

2. **Direct URL:**
   - Go to `http://localhost:3000/profile`

### Editing Profile

1. Click "Edit" button
2. Update any fields:
   - Full Name
   - Specialization
   - License Number
   - Phone
   - Years of Experience
   - Consultation Fee
3. Click "Save" to update
4. Click "Cancel" to discard changes

### Profile Fields

**Read-Only:**
- Email (from auth)

**Editable:**
- Full Name
- Specialization (e.g., "General Physician", "Cardiologist")
- License Number
- Phone Number
- Years of Experience (integer, 0+)
- Consultation Fee (decimal, ₹0.00+)

## UI Features

### Doctor Profile Card

**View Mode:**
- Clean display of all information
- Professional summary at bottom
- Shows experience and fee prominently

**Edit Mode:**
- Inline editing
- Input validation
- Save/Cancel buttons
- Loading states

**Icons:**
- 💼 Briefcase for Years of Experience
- 💰 Dollar sign for Consultation Fee
- ✏️ Edit icon
- 💾 Save icon
- ❌ Cancel icon

## Database Schema

```sql
CREATE TABLE public.doctors (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL,
    full_name TEXT,
    specialization TEXT,
    license_number TEXT,
    phone TEXT,
    years_of_experience INTEGER DEFAULT 0,      -- NEW
    consultation_fee DECIMAL(10, 2) DEFAULT 0.00, -- NEW
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## API Operations

### Load Profile
```typescript
const { data } = await supabase
  .from('doctors')
  .select('*')
  .eq('id', userId)
  .single()
```

### Update Profile
```typescript
const { error } = await supabase
  .from('doctors')
  .update({
    full_name,
    specialization,
    license_number,
    phone,
    years_of_experience,
    consultation_fee
  })
  .eq('id', userId)
```

## Validation Rules

### Years of Experience
- Type: Integer
- Minimum: 0
- Maximum: No limit
- Default: 0

### Consultation Fee
- Type: Decimal (10, 2)
- Minimum: 0.00
- Maximum: 99,999,999.99
- Default: 0.00
- Currency: ₹ (Indian Rupees)

## Files Created/Modified

### Created:
1. `ADD_DOCTOR_FIELDS.sql` - Migration for existing databases
2. `frontend/components/dashboard/doctor-profile-card.tsx` - Profile component
3. `frontend/app/profile/page.tsx` - Profile page
4. `DOCTOR_PROFILE_UPDATE.md` - This documentation

### Modified:
1. `COMPLETE_DATABASE_SETUP.sql` - Updated doctors table schema
2. `frontend/app/dashboard/page.tsx` - Added profile link to navigation

## Future Enhancements

Potential additions:
- Profile photo upload
- Multiple specializations
- Availability schedule
- Languages spoken
- Education/certifications
- Patient reviews/ratings
- Insurance accepted
- Clinic address
- Bio/description

## Testing Checklist

- [ ] Run database migration
- [ ] Sign in as doctor
- [ ] Navigate to profile page
- [ ] View profile information
- [ ] Click edit button
- [ ] Update years of experience
- [ ] Update consultation fee
- [ ] Save changes
- [ ] Verify data persists
- [ ] Check validation (negative numbers blocked)
- [ ] Test cancel button
- [ ] Verify profile link in navigation

## Summary

✅ Added `years_of_experience` field to doctors table
✅ Added `consultation_fee` field to doctors table
✅ Created professional profile card component
✅ Created dedicated profile page
✅ Added profile link to dashboard navigation
✅ Implemented edit/save functionality
✅ Added input validation
✅ Included helpful icons and UI polish

Doctors can now manage their professional information including experience and consultation fees!
