# Where to View Saved Voice Intake Records

## 📍 Location

After saving voice intake data, you can view it at:

**URL:** `http://localhost:3000/patient/voice-intake-history`

## 🎯 How to Access

### Method 1: From Voice Intake Page
1. Go to Voice Intake page
2. Click **"View History"** button (top right)
3. See all your saved records

### Method 2: After Saving
1. Record and save voice intake
2. Click **"View History"** in the success toast notification
3. See all your saved records

### Method 3: Direct Navigation
1. Add to navigation menu (optional)
2. Or bookmark the URL
3. Access anytime

## 📊 What You'll See

The history page shows:
- ✅ All your voice intake records
- ✅ Date and time of each recording
- ✅ Language used
- ✅ Extracted information:
  - Name and age
  - Chief complaint
  - Symptom duration
  - Medical history
  - Current medications
  - Allergies
- ✅ Full JSON data (expandable)

## 🎨 Features

### Record Cards
Each record is displayed as a card with:
- Patient name (if provided)
- Date and time
- Language badge
- All extracted fields
- Expandable full details

### Empty State
If no records exist:
- Shows friendly message
- Button to create first voice intake
- Links back to voice intake page

## 📝 Navigation Structure

```
Patient Dashboard
  └── Voice Intake
        ├── Record new intake
        └── View History ← NEW!
              └── List of all saved records
```

## 🔧 Setup Required

### Step 1: Create Database Table
Run this in Supabase SQL Editor:
```sql
-- See CREATE_VOICE_INTAKE_TABLE.sql
```

### Step 2: Restart Frontend
```bash
cd frontend
npm run dev
```

### Step 3: Test It
1. Go to Voice Intake
2. Record and save
3. Click "View History"
4. See your saved record!

## 🎯 What Gets Saved

When you click "Save to Profile":

### Saved to Database:
- Patient ID
- Full intake data (JSON)
- Extracted fields:
  - Full name
  - Age
  - Chief complaint
  - Symptom duration
  - Medical history (array)
  - Current medications (array)
  - Allergies (array)
  - Language code
- Timestamp

### Displayed in History:
- All of the above
- Formatted nicely
- Color-coded badges
- Expandable details

## 🎨 UI Features

### Badges:
- **Medical History**: Outlined badges
- **Medications**: Secondary badges
- **Allergies**: Red/destructive badges
- **Language**: Outlined badge

### Layout:
- Responsive grid
- Card-based design
- Hover effects
- Smooth transitions

## 📱 Mobile Friendly

The history page is fully responsive:
- Works on mobile
- Touch-friendly
- Scrollable cards
- Readable text

## 🔐 Security

### Row Level Security (RLS):
- Patients can only see their own records
- Doctors can see all records (for their patients)
- Service role has full access

### Privacy:
- Data is encrypted
- Secure transmission
- HIPAA considerations apply

## 🎉 Summary

**Where:** `/patient/voice-intake-history`

**How to Access:**
1. Voice Intake page → "View History" button
2. After saving → Click toast notification
3. Direct URL navigation

**What You See:**
- All your saved voice intake records
- Beautifully formatted
- Easy to read
- Full details available

## 🚀 Next Steps

1. Create the database table (if not done)
2. Record a voice intake
3. Save it
4. Click "View History"
5. See your saved record!

Enjoy! 🎊
