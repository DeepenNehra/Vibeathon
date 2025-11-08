-- Update the signup trigger to include years_of_experience and consultation_fee
-- Run this in Supabase SQL Editor

-- Drop and recreate the trigger function with new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Get the role from user metadata
    IF NEW.raw_user_meta_data->>'role' = 'doctor' THEN
        -- Create doctor profile with experience and fee from signup form
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
        -- Create patient profile
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

-- Verify the function was updated
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Signup trigger updated!';
    RAISE NOTICE 'New doctors will now have:';
    RAISE NOTICE '  - Full name from signup form';
    RAISE NOTICE '  - Years of experience from signup form';
    RAISE NOTICE '  - Consultation fee from signup form';
END $$;
