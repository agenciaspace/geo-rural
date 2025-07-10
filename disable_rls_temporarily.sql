-- Temporarily disable RLS on user_profiles table to allow onboarding
-- This is a quick fix to allow unconfirmed users to complete onboarding

-- Disable RLS temporarily
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Check if RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- To re-enable RLS later (when email confirmation is working), run:
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;