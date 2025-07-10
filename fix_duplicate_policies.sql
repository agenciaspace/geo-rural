-- Corrigir políticas RLS duplicadas na tabela user_profiles

-- 1. Remover políticas duplicadas em português (manter as em inglês)
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON user_profiles;
DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON user_profiles;
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON user_profiles;

-- 2. Verificar se as políticas em inglês estão corretas
-- (elas devem continuar existindo)

-- 3. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- 4. Listar políticas restantes
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