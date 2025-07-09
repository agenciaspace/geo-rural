-- Script para verificar a estrutura da tabela budgets
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela budgets existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'budgets'
) AS budget_table_exists;

-- 2. Verificar estrutura da tabela budgets
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'budgets'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar se existe a coluna custom_link
SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'budgets' 
    AND column_name = 'custom_link'
    AND table_schema = 'public'
) AS custom_link_column_exists;

-- 4. Verificar registros na tabela budgets
SELECT 
    COUNT(*) as total_budgets,
    COUNT(custom_link) as budgets_with_custom_link
FROM budgets;

-- 5. Verificar se existe o orçamento específico
SELECT EXISTS (
    SELECT FROM budgets 
    WHERE custom_link = 'orcamento-1752096006845'
) AS specific_budget_exists;

-- 6. Verificar políticas RLS da tabela budgets
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'budgets';

-- 7. Verificar se RLS está habilitado
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'budgets';

-- 8. Listar alguns orçamentos para debug
SELECT 
    id,
    custom_link,
    created_at,
    status
FROM budgets 
ORDER BY created_at DESC 
LIMIT 5;