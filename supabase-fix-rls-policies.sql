-- Fix RLS Policy Issues for user_profiles
-- This script diagnoses and fixes RLS policy problems

-- Step 1: Check if user profile exists for current user
-- Run this first to see if your profile exists
SELECT 
    id, 
    email, 
    created_at, 
    deleted_at,
    consent_version,
    personality_data IS NOT NULL as has_personality_data
FROM user_profiles 
WHERE id = auth.uid();

-- Step 2: Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Step 3: Temporarily disable RLS to test (BE CAREFUL - only for testing!)
-- ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Step 4: Create a comprehensive RLS policy that covers all cases
-- First, drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON user_profiles;

-- Create new comprehensive policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id AND deleted_at IS NULL);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id AND deleted_at IS NULL);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 5: Create a function to ensure user profile exists
CREATE OR REPLACE FUNCTION public.ensure_user_profile()
RETURNS void AS $$
BEGIN
  -- Insert user profile if it doesn't exist
  INSERT INTO public.user_profiles (id, email)
  SELECT 
    auth.uid(),
    auth.jwt() ->> 'email'
  WHERE auth.uid() IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create a trigger to ensure profile exists on any auth operation
CREATE OR REPLACE FUNCTION public.handle_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure user profile exists
  PERFORM public.ensure_user_profile();
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Test the fix by running this query
-- This should return your user profile or create one if it doesn't exist
SELECT public.ensure_user_profile();

-- Step 8: Verify the profile exists
SELECT 
    id, 
    email, 
    created_at, 
    deleted_at,
    consent_version,
    personality_data IS NOT NULL as has_personality_data
FROM user_profiles 
WHERE id = auth.uid();

-- Step 9: Re-enable RLS (if you disabled it for testing)
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
