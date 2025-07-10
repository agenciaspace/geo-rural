-- SOLUÇÃO TEMPORÁRIA: Desabilitar RLS para teste
-- Execute este script para permitir acesso público imediato

-- 1. Desabilitar RLS temporariamente na tabela budgets
ALTER TABLE budgets DISABLE ROW LEVEL SECURITY;

-- 2. Verificar se RLS foi desabilitado
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'budgets';

-- 3. Testar consulta pública
SELECT 
    id,
    custom_link,
    status,
    created_at,
    budget_request,
    budget_result
FROM budgets 
WHERE custom_link = 'orcamento-1752096006845';

-- 4. Verificar se o orçamento pode ser acessado publicamente
-- Este SELECT deve funcionar agora sem problemas
SELECT EXISTS (
    SELECT 1 FROM budgets 
    WHERE custom_link = 'orcamento-1752096006845'
) AS budget_accessible;

-- IMPORTANTE: Para reabilitar RLS depois que funcionar:
-- ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- IMPORTANTE: Depois de funcionar, você deve criar políticas RLS adequadas:
-- 1. Reabilitar RLS
-- 2. Criar políticas que permitam acesso público via custom_link
-- 3. Testar novamente