# Troubleshooting: Voice Intake Not Saving to History

## 🔍 Diagnosis Steps

### Step 1: Check if SQL Script Ran Successfully

1. Go to Supabase Dashboard
2. Click "Table Editor" in left sidebar
3. Look for `voice_intake_records` table
4. **If you DON'T see it** → SQL script didn't run properly

### Step 2: Check Backend Logs

When you click "Save to Profile", check the backend terminal for messages:

**If you see:**
```
Note: voice_intake_records table may not exist
Data was successfully extracted but not persisted to database
```
→ Table doesn't exist, SQL script needs to run

**If you see:**
```
Error saving intake: [some error]
```
→ There's a different error

### Step 3: Check Browser Console

Open browser console (F12) and look for the response when you click "Save to Profile"

**If you see:**
```json
{
  "success": true,
  "message": "Voice intake data extracted successfully (not persisted to database)",
  "note": "Create voice_intake_records table..."
}
```
→ Table doesn't exist

## ✅ Solution: Run SQL Script Properly

### Method 1: Run Complete Script (Recommended)

1. Open Supabase Dashboard → SQL Editor
2. Copy **entire** content of `SETUP_VOICE_INTAKE_COMPLETE.sql`
3. Paste in SQL Editor
4. Click "Run"
5. Wait for completion
6. Look for success message

### Method 2: Check if Table Exists

Run this query in Supabase SQL Editor:

```sql
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'voice_intake_records'
);
```

**If result is `false`** → Table doesn't exist, run the setup script

### Method 3: Manual Table Creation

If the complete script fails, try creating just the table:

```sql
CREATE TABLE voice_intake_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    intake_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    full_name TEXT,
    age INTEGER,
    chief_complaint TEXT,
    symptom_duration TEXT,
    medical_history JSONB,
    current_medications JSONB,
    allergies JSONB,
    language_code TEXT
);

-- Enable RLS
ALTER TABLE voice_intake_records ENABLE ROW LEVEL SECURITY;

-- Basic policy for service role
CREATE POLICY "Service role full access"
    ON voice_intake_records
    FOR ALL
    USING (true);

-- Grant permissions
GRANT ALL ON voice_intake_records TO service_role;
GRANT ALL ON voice_intake_records TO authenticated;
```

## 🔄 After Running SQL Script

### Step 1: Verify Table Exists

In Supabase:
1. Go to Table Editor
2. Look for `voice_intake_records`
3. Should see the table with columns

### Step 2: Restart Backend

```bash
# Stop backend (Ctrl+C)
cd backend
python run.py
```

### Step 3: Test Again

1. Record voice intake (15-30 seconds)
2. Click "Save to Profile"
3. Check backend logs - should NOT see "table may not exist"
4. Click "View History"
5. Should see your saved record!

## 🐛 Common Issues

### Issue 1: "Permission Denied" Error

**Solution:** Add this policy:

```sql
CREATE POLICY "Service role full access"
    ON voice_intake_records
    FOR ALL
    USING (true);
```

### Issue 2: "Foreign Key Constraint" Error

**Solution:** The patient_id must exist in auth.users. Make sure you're logged in as a patient.

### Issue 3: Table Exists But Still Not Saving

**Check:**
1. Is backend restarted?
2. Check backend logs for actual error
3. Check browser console for response
4. Verify SUPABASE_SERVICE_KEY in backend/.env

### Issue 4: "Cannot Insert NULL" Error

**Solution:** Some fields might be required. Check the error message and make the field nullable:

```sql
ALTER TABLE voice_intake_records 
ALTER COLUMN [column_name] DROP NOT NULL;
```

## 📊 Verify Data is Saving

Run this query in Supabase SQL Editor:

```sql
SELECT 
    id,
    patient_id,
    full_name,
    chief_complaint,
    created_at
FROM voice_intake_records
ORDER BY created_at DESC
LIMIT 5;
```

**If you see rows** → Data is saving! ✅
**If empty** → Data is not saving, check above steps

## 🎯 Quick Test

1. **Check table exists:**
   ```sql
   SELECT * FROM voice_intake_records LIMIT 1;
   ```

2. **Try manual insert:**
   ```sql
   INSERT INTO voice_intake_records (patient_id, intake_data, full_name)
   VALUES (
       auth.uid(),
       '{"test": "data"}'::jsonb,
       'Test Patient'
   );
   ```

3. **If manual insert works** → Backend issue
4. **If manual insert fails** → Permission/RLS issue

## 🚀 Final Checklist

- [ ] SQL script ran without errors
- [ ] `voice_intake_records` table visible in Table Editor
- [ ] Backend restarted after SQL script
- [ ] No "table may not exist" in backend logs
- [ ] Browser console shows "saved successfully"
- [ ] History page shows saved records

## 💡 Still Not Working?

Check these:

1. **Backend .env file:**
   ```bash
   SUPABASE_URL=https://...
   SUPABASE_SERVICE_KEY=eyJ...  # Must be SERVICE key, not ANON key
   ```

2. **Backend logs when saving:**
   - Should show successful insert
   - No error messages

3. **Browser Network tab:**
   - Check /api/voice-intake/save-intake response
   - Should return success: true

If still stuck, share:
- Backend log output when clicking "Save"
- Browser console errors
- Supabase SQL Editor screenshot showing tables
