-- Add transcript column to consultations table if it doesn't exist
-- This migration ensures compatibility with different database schemas

-- Add transcript column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'consultations' 
        AND column_name = 'transcript'
    ) THEN
        ALTER TABLE consultations ADD COLUMN transcript TEXT;
        RAISE NOTICE 'Added transcript column to consultations table';
    ELSE
        RAISE NOTICE 'transcript column already exists in consultations table';
    END IF;
END $$;

-- Add full_transcript column if it doesn't exist (for compatibility)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'consultations' 
        AND column_name = 'full_transcript'
    ) THEN
        ALTER TABLE consultations ADD COLUMN full_transcript TEXT;
        RAISE NOTICE 'Added full_transcript column to consultations table';
    ELSE
        RAISE NOTICE 'full_transcript column already exists in consultations table';
    END IF;
END $$;

-- Sync data: if full_transcript exists but transcript doesn't, copy it
UPDATE consultations 
SET transcript = full_transcript 
WHERE full_transcript IS NOT NULL 
  AND (transcript IS NULL OR transcript = '');

-- Sync data: if transcript exists but full_transcript doesn't, copy it
UPDATE consultations 
SET full_transcript = transcript 
WHERE transcript IS NOT NULL 
  AND (full_transcript IS NULL OR full_transcript = '');

