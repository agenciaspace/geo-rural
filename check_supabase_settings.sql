-- Verificar configurações do Supabase relacionadas a confirmação de email

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

-- 2. Verificar se há policies que bloqueiam usuários não confirmados
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

-- 3. Verificar se a função handle_new_user está funcionando
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 4. Verificar triggers
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';