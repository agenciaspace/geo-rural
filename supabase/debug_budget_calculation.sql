-- Script para debugar o problema de cálculo do orçamento específico
-- ID: 7c3c891a-e491-4412-918a-bd5a0ac558ae

-- 1. Verificar dados do orçamento específico
SELECT 
    'DADOS DO ORÇAMENTO' as secao,
    id,
    total,
    total_price,
    budget_result,
    status,
    created_at,
    updated_at
FROM public.budgets 
WHERE id = '7c3c891a-e491-4412-918a-bd5a0ac558ae';

-- 2. Verificar itens do orçamento
SELECT 
    'ITENS DO ORÇAMENTO' as secao,
    id,
    item_type,
    description,
    quantity,
    unit,
    unit_price,
    total_price,
    notes,
    created_at
FROM public.budget_items 
WHERE budget_id = '7c3c891a-e491-4412-918a-bd5a0ac558ae'
ORDER BY item_type, created_at;

-- 3. Calcular total dos itens manualmente
SELECT 
    'CÁLCULO MANUAL DOS ITENS' as secao,
    COUNT(*) as total_itens,
    SUM(total_price) as soma_total_itens,
    SUM(quantity * unit_price) as soma_manual_verificacao
FROM public.budget_items 
WHERE budget_id = '7c3c891a-e491-4412-918a-bd5a0ac558ae';

-- 4. Comparar valores
SELECT 
    'COMPARAÇÃO DE VALORES' as secao,
    b.total as campo_total_antigo,
    b.total_price as campo_total_price_novo,
    COALESCE(SUM(bi.total_price), 0) as soma_itens_real,
    (b.total_price - COALESCE(SUM(bi.total_price), 0)) as diferenca_total_price_vs_itens,
    (b.total - COALESCE(SUM(bi.total_price), 0)) as diferenca_total_vs_itens,
    CASE 
        WHEN b.budget_result IS NOT NULL THEN 
            CAST(b.budget_result->>'total_price' AS DECIMAL(10,2))
        ELSE NULL 
    END as budget_result_total_price
FROM public.budgets b
LEFT JOIN public.budget_items bi ON bi.budget_id = b.id
WHERE b.id = '7c3c891a-e491-4412-918a-bd5a0ac558ae'
GROUP BY b.id, b.total, b.total_price, b.budget_result;

-- 5. Verificar se os triggers estão funcionando
SELECT 
    'VERIFICAÇÃO DE TRIGGERS' as secao,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'budget_items'
AND trigger_schema = 'public';

-- 6. Verificar estrutura da tabela budgets
SELECT 
    'ESTRUTURA TABELA BUDGETS' as secao,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'budgets'
AND column_name IN ('total', 'total_price', 'budget_result')
ORDER BY ordinal_position;

-- 7. Forçar recálculo do total_price para este orçamento específico
UPDATE public.budgets
SET total_price = (
    SELECT COALESCE(SUM(total_price), 0)
    FROM public.budget_items
    WHERE budget_id = '7c3c891a-e491-4412-918a-bd5a0ac558ae'
),
updated_at = NOW()
WHERE id = '7c3c891a-e491-4412-918a-bd5a0ac558ae';

-- 8. Verificar resultado após recálculo
SELECT 
    'RESULTADO APÓS RECÁLCULO' as secao,
    b.id,
    b.total as campo_total_antigo,
    b.total_price as campo_total_price_atualizado,
    COALESCE(SUM(bi.total_price), 0) as soma_itens_atual,
    b.updated_at as ultima_atualizacao
FROM public.budgets b
LEFT JOIN public.budget_items bi ON bi.budget_id = b.id
WHERE b.id = '7c3c891a-e491-4412-918a-bd5a0ac558ae'
GROUP BY b.id, b.total, b.total_price, b.updated_at;

-- 9. Verificar se há problemas com o campo budget_result
SELECT 
    'ANÁLISE BUDGET_RESULT' as secao,
    id,
    budget_result,
    CASE 
        WHEN budget_result IS NOT NULL THEN 
            jsonb_pretty(budget_result)
        ELSE 'NULL' 
    END as budget_result_formatado
FROM public.budgets 
WHERE id = '7c3c891a-e491-4412-918a-bd5a0ac558ae';

-- Instruções
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== DEBUG DO ORÇAMENTO 7c3c891a-e491-4412-918a-bd5a0ac558ae ===';
    RAISE NOTICE '1. Verificados dados do orçamento e itens';
    RAISE NOTICE '2. Comparados diferentes campos de total';
    RAISE NOTICE '3. Forçado recálculo do total_price';
    RAISE NOTICE '4. Analisado campo budget_result';
    RAISE NOTICE '';
    RAISE NOTICE 'POSSÍVEIS PROBLEMAS:';
    RAISE NOTICE '- Inconsistência entre total, total_price e soma dos itens';
    RAISE NOTICE '- Triggers não funcionando corretamente';
    RAISE NOTICE '- Frontend usando campo errado para exibição';
    RAISE NOTICE '- Campo budget_result desatualizado';
    RAISE NOTICE '===============================================';
END $$;
