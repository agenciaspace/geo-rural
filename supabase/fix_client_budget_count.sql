-- Script para corrigir a contagem de orçamentos dos clientes

-- 1. Primeiro, vamos verificar a situação atual
SELECT 
    c.id,
    c.name,
    c.total_budgets as total_budgets_atual,
    COUNT(b.id) as total_budgets_real,
    c.total_spent,
    COALESCE(SUM(b.total), 0) as total_spent_real
FROM public.clients c
LEFT JOIN public.budgets b ON b.client_id = c.id
GROUP BY c.id, c.name, c.total_budgets, c.total_spent
HAVING c.total_budgets != COUNT(b.id)
ORDER BY c.name;

-- 2. Corrigir a contagem de orçamentos para todos os clientes
UPDATE public.clients c
SET 
    total_budgets = subquery.budget_count,
    total_spent = subquery.total_amount,
    last_budget_date = subquery.last_date
FROM (
    SELECT 
        client_id,
        COUNT(*) as budget_count,
        COALESCE(SUM(total), 0) as total_amount,
        MAX(created_at) as last_date
    FROM public.budgets
    WHERE client_id IS NOT NULL
    GROUP BY client_id
) AS subquery
WHERE c.id = subquery.client_id;

-- 3. Para clientes sem orçamentos, garantir que os valores sejam 0
UPDATE public.clients
SET 
    total_budgets = 0,
    total_spent = 0,
    last_budget_date = NULL
WHERE id NOT IN (
    SELECT DISTINCT client_id 
    FROM public.budgets 
    WHERE client_id IS NOT NULL
);

-- 4. Verificar o resultado
SELECT 
    c.id,
    c.name,
    c.total_budgets,
    COUNT(b.id) as budgets_verificados,
    c.total_spent,
    COALESCE(SUM(b.total), 0) as total_verificado
FROM public.clients c
LEFT JOIN public.budgets b ON b.client_id = c.id
GROUP BY c.id, c.name, c.total_budgets, c.total_spent
ORDER BY c.name;

-- Instruções
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== CONTAGEM DE ORÇAMENTOS CORRIGIDA ===';
    RAISE NOTICE '1. Contagem de orçamentos atualizada para refletir dados reais';
    RAISE NOTICE '2. Total gasto recalculado baseado nos orçamentos existentes';
    RAISE NOTICE '3. Data do último orçamento atualizada';
    RAISE NOTICE '=========================================';
END $$;