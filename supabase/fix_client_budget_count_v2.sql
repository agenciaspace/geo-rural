-- Script para corrigir a contagem duplicada de orçamentos dos clientes
-- Este script deve ser executado após a correção do código para evitar futuras duplicações

-- 1. Primeiro, vamos identificar clientes com contagem incorreta
SELECT 
    c.id,
    c.name,
    c.email,
    c.total_budgets as total_budgets_campo,
    COUNT(b.id) as total_budgets_real,
    c.total_budgets - COUNT(b.id) as diferenca,
    c.total_spent as total_spent_campo,
    COALESCE(SUM(b.total), 0) as total_spent_real
FROM public.clients c
LEFT JOIN public.budgets b ON b.client_id = c.id
GROUP BY c.id, c.name, c.email, c.total_budgets, c.total_spent
HAVING c.total_budgets != COUNT(b.id) OR c.total_spent != COALESCE(SUM(b.total), 0)
ORDER BY c.name;

-- 2. Corrigir a contagem para TODOS os clientes (força recálculo completo)
UPDATE public.clients c
SET 
    total_budgets = COALESCE(subquery.budget_count, 0),
    total_spent = COALESCE(subquery.total_amount, 0),
    last_budget_date = subquery.last_date,
    updated_at = NOW()
FROM (
    SELECT 
        client_id,
        COUNT(*) as budget_count,
        SUM(total) as total_amount,
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
    last_budget_date = NULL,
    updated_at = NOW()
WHERE id NOT IN (
    SELECT DISTINCT client_id 
    FROM public.budgets 
    WHERE client_id IS NOT NULL
);

-- 4. Verificar o resultado final
SELECT 
    'Total de clientes corrigidos:' as info,
    COUNT(*) as quantidade
FROM public.clients
WHERE updated_at >= NOW() - INTERVAL '1 minute'
UNION ALL
SELECT 
    'Clientes com orçamentos:' as info,
    COUNT(DISTINCT c.id) as quantidade
FROM public.clients c
INNER JOIN public.budgets b ON b.client_id = c.id
UNION ALL
SELECT 
    'Clientes sem orçamentos:' as info,
    COUNT(*) as quantidade
FROM public.clients c
WHERE NOT EXISTS (SELECT 1 FROM public.budgets b WHERE b.client_id = c.id);

-- 5. Mostrar alguns exemplos de clientes corrigidos
SELECT 
    c.id,
    c.name,
    c.email,
    c.total_budgets,
    c.total_spent,
    c.last_budget_date,
    COUNT(b.id) as budgets_verificados,
    COALESCE(SUM(b.total), 0) as total_verificado
FROM public.clients c
LEFT JOIN public.budgets b ON b.client_id = c.id
WHERE c.name ILIKE '%samira%' OR c.updated_at >= NOW() - INTERVAL '1 minute'
GROUP BY c.id, c.name, c.email, c.total_budgets, c.total_spent, c.last_budget_date
ORDER BY c.name
LIMIT 10;

-- Instruções
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== CONTAGEM DE ORÇAMENTOS CORRIGIDA ===';
    RAISE NOTICE '1. Todos os clientes tiveram suas contagens recalculadas';
    RAISE NOTICE '2. Total de orçamentos agora reflete a quantidade real';
    RAISE NOTICE '3. Total gasto foi recalculado com base nos orçamentos existentes';
    RAISE NOTICE '4. Execute este script novamente se necessário';
    RAISE NOTICE '';
    RAISE NOTICE 'IMPORTANTE: O código da aplicação foi atualizado para evitar futuras duplicações';
    RAISE NOTICE '=========================================';
END $$;