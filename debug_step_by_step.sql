-- Execute essas consultas uma por uma no Supabase

-- 1. Verificar usuários não confirmados
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  confirmed_at
FROM auth.users 
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC
LIMIT 5;

-- 2. Verificar policies RLS para user_profiles
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
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- 3. Verificar a função handle_new_user
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 4. Verificar se há registros na tabela user_profiles
SELECT 
  id,
  full_name,
  phone,
  company_name,
  position,
  city,
  state,
  created_at
FROM user_profiles
ORDER BY created_at DESC
LIMIT 5;