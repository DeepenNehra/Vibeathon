-- Add frontend-compatible SOAP note fields to consultations table
-- This migration adds 'raw_soap_note' and 'de_stigma_suggestions' columns
-- for compatibility with the frontend, while keeping the existing 'soap_notes' and 'stigma_suggestions' columns

-- Add raw_soap_note column (same as soap_notes, but with frontend-expected name)
ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS raw_soap_note JSONB;

-- Add de_stigma_suggestions column (same as stigma_suggestions, but with frontend-expected name)
ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS de_stigma_suggestions JSONB DEFAULT '[]'::jsonb;

-- Copy existing data from old columns to new columns (if any exists)
UPDATE consultations 
SET raw_soap_note = soap_notes 
WHERE soap_notes IS NOT NULL AND raw_soap_note IS NULL;

UPDATE consultations 
SET de_stigma_suggestions = stigma_suggestions 
WHERE stigma_suggestions IS NOT NULL AND de_stigma_suggestions IS NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_consultations_raw_soap_note ON consultations USING gin(raw_soap_note);
CREATE INDEX IF NOT EXISTS idx_consultations_de_stigma_suggestions ON consultations USING gin(de_stigma_suggestions);

