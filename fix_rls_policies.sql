-- Corrigir políticas RLS para permitir acesso público aos orçamentos
-- Execute este script no SQL Editor do Supabase

-- 1. Primeiro, verificar se RLS está habilitado
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'budgets';

-- 2. Remover políticas existentes que podem estar bloqueando (se existirem)
DROP POLICY IF EXISTS "Allow public read access to budgets via custom_link" ON budgets;
DROP POLICY IF EXISTS "Allow public update to budgets via custom_link" ON budgets;

-- 3. Criar política para permitir leitura pública de orçamentos via custom_link
CREATE POLICY "Public read budgets via custom_link" 
ON budgets FOR SELECT 
TO public
USING (custom_link IS NOT NULL AND custom_link != '');

-- 4. Criar política para permitir atualização pública de orçamentos via custom_link
CREATE POLICY "Public update budgets via custom_link" 
ON budgets FOR UPDATE 
TO public
USING (custom_link IS NOT NULL AND custom_link != '');

-- 5. Verificar se as políticas foram criadas
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'budgets';

-- 6. Testar consulta pública
SELECT 
    id,
    custom_link,
    status,
    created_at
FROM budgets 
WHERE custom_link = 'orcamento-1752096006845';

-- 7. Se ainda não funcionar, considere desabilitar temporariamente RLS para teste
-- CUIDADO: Use apenas para teste, não em produção
-- ALTER TABLE budgets DISABLE ROW LEVEL SECURITY;

-- Para reabilitar RLS depois do teste:
-- ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;