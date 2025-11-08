-- Add Years of Experience and Consultation Fee to Doctors Table
-- Run this if you already have the doctors table created

-- ============================================================================
-- Add new columns to doctors table
-- ============================================================================

-- Add years_of_experience column
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS years_of_experience INTEGER DEFAULT 0;

-- Add consultation_fee column
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS consultation_fee DECIMAL(10, 2) DEFAULT 0.00;

-- Add constraints for data validation
ALTER TABLE public.doctors 
ADD CONSTRAINT check_years_of_experience_positive 
CHECK (years_of_experience >= 0);

ALTER TABLE public.doctors 
ADD CONSTRAINT check_consultation_fee_positive 
CHECK (consultation_fee >= 0);

-- Add comments for documentation
COMMENT ON COLUMN public.doctors.years_of_experience IS 'Number of years the doctor has been practicing';
COMMENT ON COLUMN public.doctors.consultation_fee IS 'Consultation fee in local currency (e.g., INR)';

-- ============================================================================
-- Verify the changes
-- ============================================================================

SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'doctors'
AND column_name IN ('years_of_experience', 'consultation_fee')
ORDER BY ordinal_position;

-- ============================================================================
-- Optional: Update existing doctors with sample data
-- ============================================================================

-- Uncomment to set default values for existing doctors
/*
UPDATE public.doctors 
SET 
    years_of_experience = 5,
    consultation_fee = 500.00
WHERE years_of_experience IS NULL OR consultation_fee IS NULL;
*/

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Doctor fields added successfully!';
    RAISE NOTICE 'New fields:';
    RAISE NOTICE '  - years_of_experience (INTEGER, default: 0)';
    RAISE NOTICE '  - consultation_fee (DECIMAL, default: 0.00)';
    RAISE NOTICE '';
    RAISE NOTICE 'Constraints added:';
    RAISE NOTICE '  - Both fields must be >= 0';
END $$;
