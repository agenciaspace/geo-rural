-- Fix RLS policies to allow unconfirmed users to create profiles
-- This allows users to complete onboarding without email confirmation

-- First, check current policies
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;

-- Create new policies that allow unconfirmed users
-- Policy for SELECT (viewing own profile)
CREATE POLICY "Users can view own profile" ON user_profiles
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Policy for INSERT (creating profile) - more permissive
CREATE POLICY "Users can insert own profile" ON user_profiles
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Policy for UPDATE (updating profile) - more permissive  
CREATE POLICY "Users can update own profile" ON user_profiles
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Alternative: Create a more permissive policy for unconfirmed users
-- This policy allows any authenticated user to create/update profiles
-- (you may want to use this if the above doesn't work)

-- CREATE POLICY "Allow authenticated users to manage profiles" ON user_profiles
-- FOR ALL 
-- TO authenticated 
-- USING (true)
-- WITH CHECK (true);

-- Verify policies were created
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_profiles';