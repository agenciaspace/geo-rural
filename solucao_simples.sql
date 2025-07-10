-- SOLUÇÃO MAIS SIMPLES: Apenas desabilitar RLS
-- Execute este comando primeiro no SQL Editor do Supabase

-- 1. Desabilitar RLS na tabela budgets
ALTER TABLE budgets DISABLE ROW LEVEL SECURITY;

-- 2. Verificar se funcionou
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'budgets';
-- Deve mostrar rowsecurity = false

-- 3. Testar consulta
SELECT 
    id,
    custom_link,
    status,
    created_at
FROM budgets 
WHERE custom_link = 'orcamento-1752096006845';

-- Se este SELECT retornar dados, o link público deve funcionar!
-- Teste em: https://ongeo.up.railway.app/budget/orcamento-1752096006845