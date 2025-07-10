-- Reabilitar confirmação de email no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Reabilitar confirmação de email
UPDATE auth.config 
SET enable_signup = true, enable_confirmations = true
WHERE enable_signup IS NOT NULL;

-- 2. Verificar configuração
SELECT * FROM auth.config;

-- 3. Verificar usuários não confirmados
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  (EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400)::int as days_since_signup
FROM auth.users 
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;