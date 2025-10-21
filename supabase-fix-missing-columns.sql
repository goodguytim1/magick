-- Fix Missing Columns in user_profiles Table
-- This migration adds missing columns to the existing user_profiles table
-- Run this in your Supabase SQL Editor

-- Step 1: Add missing columns to user_profiles table
-- These ALTER TABLE statements will add columns if they don't exist

-- Soft delete column
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE NULL;

-- Consent fields
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS consent_version TEXT DEFAULT '1.0';

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMP WITH TIME ZONE NULL;

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS analytics_consent BOOLEAN DEFAULT FALSE;

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS personalization_consent BOOLEAN DEFAULT FALSE;

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT FALSE;

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS data_sharing_consent BOOLEAN DEFAULT FALSE;

-- User preferences
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'dark';

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS favorite_categories TEXT[] DEFAULT '{}';

-- Personality test data
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS personality_data JSONB NULL;

-- Step 2: Add constraint for theme column
-- First check if constraint already exists, then add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_theme_values' 
        AND table_name = 'user_profiles'
    ) THEN
        ALTER TABLE user_profiles 
        ADD CONSTRAINT check_theme_values 
        CHECK (theme IN ('light', 'dark'));
    END IF;
END $$;

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_deleted_at ON user_profiles(deleted_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_personality_data ON user_profiles USING GIN(personality_data);

-- Step 4: Enable Row Level Security (if not already enabled)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies (drop existing ones first to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON user_profiles;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 6: Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Step 8: Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING; -- Prevent errors if profile already exists
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Create trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 10: Verify the table structure
-- This query will show you all columns in the user_profiles table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;
