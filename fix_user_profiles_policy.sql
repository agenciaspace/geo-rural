-- Diagnóstico completo para user_profiles
-- Investigar por que o onboarding está falhando

-- 1. Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 2. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- 3. Testar permissões do usuário atual
SELECT auth.uid() as current_user_id;
SELECT current_user;

-- 4. Verificar estrutura da tabela
\d user_profiles;

-- 5. Tentar inserir um registro de teste (descomente se necessário)
-- INSERT INTO user_profiles (id, full_name, phone, company_name, position, city, state)
-- VALUES (auth.uid(), 'Teste', '11999999999', 'Empresa Teste', 'Cargo Teste', 'Cidade Teste', 'SP');