-- Limpar e recriar políticas RLS corretamente
-- Execute este script no SQL Editor do Supabase

-- 1. Limpar políticas de budgets que estão causando conflito
DROP POLICY IF EXISTS "Public read budgets via custom_link" ON budgets;
DROP POLICY IF EXISTS "Public update budgets via custom_link" ON budgets;
DROP POLICY IF EXISTS "Allow public read access to budgets via custom_link" ON budgets;
DROP POLICY IF EXISTS "Allow public update to budgets via custom_link" ON budgets;

-- 2. Recriar políticas de budgets se necessário
CREATE POLICY "Public read budgets via custom_link" 
ON budgets FOR SELECT 
TO public
USING (custom_link IS NOT NULL AND custom_link != '');

CREATE POLICY "Public update budgets via custom_link" 
ON budgets FOR UPDATE 
TO public
USING (custom_link IS NOT NULL AND custom_link != '');

-- 3. Agora reabilitar RLS e criar políticas para user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Limpar políticas existentes de user_profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;

-- 5. Criar políticas que funcionam para usuários confirmados e não confirmados
-- Policy for viewing own profile
CREATE POLICY "Users can view own profile" ON user_profiles
FOR SELECT 
TO authenticated 
USING (
  auth.uid() = id AND 
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid())
);

-- Policy for inserting own profile (allows unconfirmed users)
CREATE POLICY "Users can insert own profile" ON user_profiles
FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() = id AND 
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid())
);

-- Policy for updating own profile (allows unconfirmed users)
CREATE POLICY "Users can update own profile" ON user_profiles
FOR UPDATE 
TO authenticated 
USING (
  auth.uid() = id AND 
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid())
)
WITH CHECK (
  auth.uid() = id AND 
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid())
);

-- 6. Verificar políticas criadas
SELECT 
  tablename,
  policyname, 
  cmd, 
  roles,
  qual, 
  with_check 
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'budgets')
ORDER BY tablename, policyname;

-- 7. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('user_profiles', 'budgets');