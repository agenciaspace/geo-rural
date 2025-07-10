-- Teste específico para verificar se o onboarding pode funcionar
-- Execute este script para diagnosticar o problema

-- 1. Verificar políticas RLS para user_profiles
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 2. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- 3. Simular inserção de dados do onboarding (teste manual)
-- Substitua 'YOUR_USER_ID' pelo ID do usuário que está tentando fazer onboarding
-- SELECT auth.uid(); -- Execute primeiro para obter o ID

/*
INSERT INTO user_profiles (
    id, 
    full_name, 
    phone, 
    company_name, 
    position, 
    city, 
    state, 
    updated_at
) VALUES (
    auth.uid(), 
    'Teste Nome', 
    '11999999999', 
    'Empresa Teste', 
    'Cargo Teste', 
    'São Paulo', 
    'SP', 
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    company_name = EXCLUDED.company_name,
    position = EXCLUDED.position,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    updated_at = EXCLUDED.updated_at;
*/

-- 4. Verificar se existe registro para o usuário
-- SELECT * FROM user_profiles WHERE id = auth.uid();

-- 5. Testar se o usuário pode fazer SELECT e UPDATE
-- SELECT 'SELECT permitido' WHERE EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid());