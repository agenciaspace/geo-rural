-- Create a function to insert user profiles that bypasses RLS
-- This allows unconfirmed users to create their profiles

-- Create or replace function to create user profile
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id UUID,
  profile_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- This runs with the privileges of the function owner
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Insert or update user profile
  INSERT INTO user_profiles (
    id,
    full_name,
    phone,
    company_name,
    position,
    city,
    state,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    profile_data->>'name',
    profile_data->>'phone',
    profile_data->>'company',
    profile_data->>'position',
    profile_data->>'city',
    profile_data->>'state',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    company_name = EXCLUDED.company_name,
    position = EXCLUDED.position,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    updated_at = NOW()
  RETURNING to_jsonb(user_profiles.*) INTO result;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'error', true,
      'message', SQLERRM,
      'code', SQLSTATE
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_user_profile(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_profile(UUID, JSONB) TO anon;

-- Test the function (uncomment to test)
-- SELECT create_user_profile(
--   '00000000-0000-0000-0000-000000000000'::UUID,
--   '{"name": "Test User", "phone": "123456789", "company": "Test Co", "position": "Developer", "city": "Test City", "state": "TS"}'::JSONB
-- );