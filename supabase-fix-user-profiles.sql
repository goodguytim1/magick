-- Fix User Profile Issues - Manual Approach
-- This script fixes the user profile issues without relying on auth.uid()

-- Step 1: Check what users exist in auth.users table
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 10;

-- Step 2: Check what profiles exist in user_profiles table
SELECT id, email, created_at FROM user_profiles ORDER BY created_at DESC LIMIT 10;

-- Step 3: Find users without profiles (run this to see missing profiles)
SELECT 
    u.id, 
    u.email, 
    u.created_at as auth_created,
    p.id as profile_id,
    p.created_at as profile_created
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- Step 4: Create missing profiles for all users
-- This will create profiles for any users that don't have them
INSERT INTO user_profiles (id, email, created_at)
SELECT 
    u.id, 
    u.email, 
    u.created_at
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Step 5: Verify all users now have profiles
SELECT 
    u.id, 
    u.email, 
    p.id as profile_id,
    p.created_at as profile_created
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- Step 6: Test RLS policies by checking if profiles are accessible
-- This should work now that profiles exist
SELECT COUNT(*) as total_profiles FROM user_profiles;
