-- SOLUÇÃO DEFINITIVA: Desabilitar confirmação de email no Supabase
-- Execute estes comandos no SQL Editor do Supabase

-- 1. Verificar configuração atual
SELECT * FROM auth.config;

-- 2. Desabilitar confirmação de email completamente
UPDATE auth.config 
SET enable_signup = true, enable_confirmations = false
WHERE enable_signup IS NOT NULL;

-- 3. Se não funcionar, tentar configuração alternativa
-- (Supabase v2)
INSERT INTO auth.config (enable_signup, enable_confirmations)
VALUES (true, false)
ON CONFLICT DO NOTHING;

-- 4. Verificar se foi aplicado
SELECT * FROM auth.config;

-- 5. Confirmar todos os usuários existentes (opcional - para usuários já criados)
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 6. Verificar usuários confirmados
SELECT id, email, email_confirmed_at, confirmed_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;