-- Step 1: Create the basic user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE NULL,
  
  -- Consent fields
  consent_version TEXT DEFAULT '1.0',
  consent_timestamp TIMESTAMP WITH TIME ZONE NULL,
  analytics_consent BOOLEAN DEFAULT FALSE,
  personalization_consent BOOLEAN DEFAULT FALSE,
  marketing_consent BOOLEAN DEFAULT FALSE,
  data_sharing_consent BOOLEAN DEFAULT FALSE,
  
  -- User preferences
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
  favorite_categories TEXT[] DEFAULT '{}',
  
  -- Personality test data (JSONB for flexibility)
  personality_data JSONB NULL
);

-- Step 2: Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
