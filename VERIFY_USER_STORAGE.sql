-- Verify User Storage Setup
-- Run this to check if everything is working

-- ============================================================================
-- 1. Check if tables exist
-- ============================================================================
SELECT 
    'Tables Check' as check_type,
    table_name,
    CASE 
        WHEN table_name IN ('doctors', 'patients') THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('doctors', 'patients')
ORDER BY table_name;

-- ============================================================================
-- 2. Check if trigger exists
-- ============================================================================
SELECT 
    'Trigger Check' as check_type,
    trigger_name,
    event_object_table,
    action_timing,
    '✅ EXISTS' as status
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- ============================================================================
-- 3. Check existing users and their roles
-- ============================================================================
SELECT 
    'Users Check' as check_type,
    id,
    email,
    raw_user_meta_data->>'role' as role,
    created_at
FROM auth.users
ORDER BY created_at DESC;

-- ============================================================================
-- 4. Check doctor profiles
-- ============================================================================
SELECT 
    'Doctors Check' as check_type,
    d.id,
    d.email,
    d.full_name,
    u.email as auth_email,
    CASE 
        WHEN u.id IS NOT NULL THEN '✅ LINKED'
        ELSE '❌ ORPHANED'
    END as link_status
FROM public.doctors d
LEFT JOIN auth.users u ON d.id = u.id
ORDER BY d.created_at DESC;

-- ============================================================================
-- 5. Check patient profiles
-- ============================================================================
SELECT 
    'Patients Check' as check_type,
    p.id,
    p.user_id,
    p.email,
    p.name,
    u.email as auth_email,
    CASE 
        WHEN p.user_id IS NULL THEN '⚠️ NO AUTH (OK for doctor-created patients)'
        WHEN u.id IS NOT NULL THEN '✅ LINKED'
        ELSE '❌ ORPHANED'
    END as link_status
FROM public.patients p
LEFT JOIN auth.users u ON p.user_id = u.id
ORDER BY p.created_at DESC;

-- ============================================================================
-- 6. Check RLS policies
-- ============================================================================
SELECT 
    'RLS Policies Check' as check_type,
    tablename,
    policyname,
    cmd as operation,
    CASE 
        WHEN permissive = 'PERMISSIVE' THEN '✅ PERMISSIVE'
        ELSE '⚠️ RESTRICTIVE'
    END as policy_type
FROM pg_policies
WHERE tablename IN ('doctors', 'patients')
ORDER BY tablename, policyname;

-- ============================================================================
-- 7. Summary counts
-- ============================================================================
SELECT 
    'Summary' as check_type,
    (SELECT COUNT(*) FROM auth.users) as total_auth_users,
    (SELECT COUNT(*) FROM auth.users WHERE raw_user_meta_data->>'role' = 'doctor') as doctors_in_auth,
    (SELECT COUNT(*) FROM public.doctors) as doctors_with_profiles,
    (SELECT COUNT(*) FROM auth.users WHERE raw_user_meta_data->>'role' = 'patient') as patients_in_auth,
    (SELECT COUNT(*) FROM public.patients WHERE user_id IS NOT NULL) as patients_with_auth,
    (SELECT COUNT(*) FROM public.patients WHERE user_id IS NULL) as patients_without_auth;

-- ============================================================================
-- 8. Find users without profiles (if any)
-- ============================================================================
SELECT 
    'Missing Profiles' as check_type,
    u.id,
    u.email,
    u.raw_user_meta_data->>'role' as role,
    '❌ NO PROFILE' as status
FROM auth.users u
LEFT JOIN public.doctors d ON u.id = d.id
LEFT JOIN public.patients p ON u.id = p.user_id
WHERE u.raw_user_meta_data->>'role' IS NOT NULL
AND d.id IS NULL 
AND p.user_id IS NULL;

