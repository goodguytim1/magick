-- MINIMAL user_profiles table setup
-- Run this ONE statement at a time in Supabase SQL Editor

-- Step 1: Create the table (run this first)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE NULL,
  consent_version TEXT DEFAULT '1.0',
  consent_timestamp TIMESTAMP WITH TIME ZONE NULL,
  analytics_consent BOOLEAN DEFAULT FALSE,
  personalization_consent BOOLEAN DEFAULT FALSE,
  marketing_consent BOOLEAN DEFAULT FALSE,
  data_sharing_consent BOOLEAN DEFAULT FALSE,
  theme TEXT DEFAULT 'dark',
  favorite_categories TEXT[] DEFAULT '{}',
  personality_data JSONB NULL
);

-- Step 2: Enable RLS (run this second)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create basic policy (run this third)
CREATE POLICY "Users can manage their own profile" ON user_profiles
  FOR ALL USING (auth.uid() = id);
