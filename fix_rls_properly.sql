-- Re-enable RLS and create proper policies for unconfirmed users
-- This maintains security while allowing onboarding

-- Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;

-- Create policies that work for both confirmed and unconfirmed users
-- These policies check if the user exists in auth.users (regardless of confirmation)

-- Policy for viewing own profile
CREATE POLICY "Users can view own profile" ON user_profiles
FOR SELECT 
TO authenticated 
USING (
  auth.uid() = id AND 
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid())
);

-- Policy for inserting own profile (allows unconfirmed users)
CREATE POLICY "Users can insert own profile" ON user_profiles
FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() = id AND 
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid())
);

-- Policy for updating own profile (allows unconfirmed users)
CREATE POLICY "Users can update own profile" ON user_profiles
FOR UPDATE 
TO authenticated 
USING (
  auth.uid() = id AND 
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid())
)
WITH CHECK (
  auth.uid() = id AND 
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid())
);

-- Verify policies were created
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_profiles';