-- Quick Diagnostic Script for user_profiles Issues
-- Run these queries one by one to diagnose the problem

-- 1. Check if you're authenticated
SELECT auth.uid() as current_user_id, auth.jwt() ->> 'email' as current_email;

-- 2. Check if your user profile exists
SELECT 
    id, 
    email, 
    created_at, 
    deleted_at,
    consent_version,
    personality_data IS NOT NULL as has_personality_data
FROM user_profiles 
WHERE id = auth.uid();

-- 3. Check RLS policies
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 4. If profile doesn't exist, create it manually
-- Replace 'your-email@example.com' with your actual email
INSERT INTO user_profiles (id, email)
VALUES (auth.uid(), auth.jwt() ->> 'email')
ON CONFLICT (id) DO NOTHING;

-- 5. Test if you can now access your profile
SELECT * FROM user_profiles WHERE id = auth.uid();
