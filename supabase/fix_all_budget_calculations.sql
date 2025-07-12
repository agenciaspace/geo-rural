-- Script para corrigir cálculos de TODOS os orçamentos
-- Resolve inconsistências entre total, total_price e budget_result.total_price

-- 1. Análise inicial dos problemas
SELECT 
    'ANÁLISE INICIAL' as secao,
    COUNT(*) as total_orcamentos,
    COUNT(CASE WHEN total_price IS NULL THEN 1 END) as total_price_null,
    COUNT(CASE WHEN total_price = 0 THEN 1 END) as total_price_zero,
    COUNT(CASE WHEN budget_result IS NULL THEN 1 END) as budget_result_null
FROM public.budgets;

-- 2. Identificar orçamentos sem itens
SELECT 
    'ORÇAMENTOS SEM ITENS' as secao,
    b.id,
    b.client_name,
    b.total as total_antigo,
    b.total_price as total_price_atual,
    CASE 
        WHEN b.budget_result IS NOT NULL THEN 
            CAST(b.budget_result->>'total_price' AS DECIMAL(10,2))
        ELSE b.total 
    END as total_correto,
    COUNT(bi.id) as qtd_itens
FROM public.budgets b
LEFT JOIN public.budget_items bi ON bi.budget_id = b.id
GROUP BY b.id, b.client_name, b.total, b.total_price, b.budget_result
HAVING COUNT(bi.id) = 0;

-- 3. Criar itens detalhados para orçamentos sem itens baseados no budget_result
INSERT INTO public.budget_items (budget_id, item_type, description, quantity, unit, unit_price, notes)
SELECT 
    b.id as budget_id,
    'servico_geo' as item_type,
    'Serviço de Georreferenciamento' as description,
    1 as quantity,
    'serviço' as unit,
    CASE 
        WHEN b.budget_result IS NOT NULL THEN 
            CAST(b.budget_result->>'total_price' AS DECIMAL(10,2))
        ELSE COALESCE(b.total, 0)
    END as unit_price,
    CONCAT(
        'Migração automática - ',
        'Cliente: ', COALESCE(b.client_name, 'N/A'),
        ' | Propriedade: ', COALESCE(b.property_name, 'N/A'),
        ' | Área: ', COALESCE(b.property_area, 0), ' ha',
        CASE WHEN b.vertices_count IS NOT NULL THEN CONCAT(' | Vértices: ', b.vertices_count) ELSE '' END,
        CASE WHEN b.is_urgent THEN ' | URGENTE' ELSE '' END,
        CASE WHEN b.includes_topography THEN ' | Com Topografia' ELSE '' END,
        CASE WHEN b.includes_environmental THEN ' | Com Estudo Ambiental' ELSE '' END
    ) as notes
FROM public.budgets b
LEFT JOIN public.budget_items bi ON bi.budget_id = b.id
WHERE bi.id IS NULL  -- Apenas orçamentos sem itens
AND (
    b.budget_result IS NOT NULL 
    OR b.total IS NOT NULL
)
GROUP BY b.id, b.client_name, b.property_name, b.property_area, b.vertices_count, 
         b.is_urgent, b.includes_topography, b.includes_environmental, b.total, b.budget_result;

-- 4. Criar itens detalhados baseados no breakdown do budget_result (quando disponível)
INSERT INTO public.budget_items (budget_id, item_type, description, quantity, unit, unit_price, notes)
SELECT 
    b.id as budget_id,
    CASE 
        WHEN breakdown_item->>'item' ILIKE '%base%' OR breakdown_item->>'item' ILIKE '%taxa base%' THEN 'servico_geo'
        WHEN breakdown_item->>'item' ILIKE '%vértice%' OR breakdown_item->>'item' ILIKE '%vertices%' THEN 'servico_geo'
        WHEN breakdown_item->>'item' ILIKE '%urgência%' OR breakdown_item->>'item' ILIKE '%urgencia%' THEN 'outros'
        WHEN breakdown_item->>'item' ILIKE '%topográfico%' OR breakdown_item->>'item' ILIKE '%topografia%' THEN 'servico_geo'
        WHEN breakdown_item->>'item' ILIKE '%ambiental%' THEN 'servico_geo'
        WHEN breakdown_item->>'item' ILIKE '%desconto%' THEN 'outros'
        ELSE 'servico_geo'
    END as item_type,
    breakdown_item->>'item' as description,
    1 as quantity,
    'serviço' as unit,
    ABS(CAST(breakdown_item->>'value' AS DECIMAL(10,2))) as unit_price,
    CONCAT(
        'Detalhamento automático do orçamento - ',
        'Cliente: ', COALESCE(b.client_name, 'N/A')
    ) as notes
FROM public.budgets b
CROSS JOIN jsonb_array_elements(b.budget_result->'breakdown') as breakdown_item
WHERE b.budget_result IS NOT NULL 
AND b.budget_result->'breakdown' IS NOT NULL
AND jsonb_array_length(b.budget_result->'breakdown') > 0
AND NOT EXISTS (
    SELECT 1 FROM public.budget_items bi2 
    WHERE bi2.budget_id = b.id 
    AND bi2.description = breakdown_item->>'item'
)
AND CAST(breakdown_item->>'value' AS DECIMAL(10,2)) > 0;  -- Apenas valores positivos

-- 5. Atualizar total_price para orçamentos que ainda estão incorretos
UPDATE public.budgets
SET total_price = (
    SELECT COALESCE(SUM(bi.total_price), 0)
    FROM public.budget_items bi
    WHERE bi.budget_id = budgets.id
),
updated_at = NOW()
WHERE id IN (
    SELECT b.id
    FROM public.budgets b
    LEFT JOIN public.budget_items bi ON bi.budget_id = b.id
    GROUP BY b.id, b.total_price
    HAVING b.total_price != COALESCE(SUM(bi.total_price), 0)
);

-- 6. Para orçamentos que ainda não têm total_price correto, usar budget_result ou total
UPDATE public.budgets
SET total_price = CASE 
    WHEN budget_result IS NOT NULL THEN 
        CAST(budget_result->>'total_price' AS DECIMAL(10,2))
    ELSE COALESCE(total, 0)
END,
updated_at = NOW()
WHERE total_price IS NULL 
OR total_price = 0
OR total_price != CASE 
    WHEN budget_result IS NOT NULL THEN 
        CAST(budget_result->>'total_price' AS DECIMAL(10,2))
    ELSE COALESCE(total, 0)
END;

-- 7. Verificação final - mostrar resultados
SELECT 
    'VERIFICAÇÃO FINAL' as secao,
    b.id,
    b.client_name,
    b.total as total_antigo,
    b.total_price as total_price_corrigido,
    CASE 
        WHEN b.budget_result IS NOT NULL THEN 
            CAST(b.budget_result->>'total_price' AS DECIMAL(10,2))
        ELSE NULL 
    END as budget_result_total,
    COALESCE(SUM(bi.total_price), 0) as soma_itens,
    COUNT(bi.id) as qtd_itens,
    CASE 
        WHEN b.total_price = COALESCE(SUM(bi.total_price), 0) THEN 'CORRETO'
        ELSE 'INCONSISTENTE'
    END as status
FROM public.budgets b
LEFT JOIN public.budget_items bi ON bi.budget_id = b.id
GROUP BY b.id, b.client_name, b.total, b.total_price, b.budget_result
ORDER BY b.created_at DESC;

-- 8. Estatísticas finais
SELECT 
    'ESTATÍSTICAS FINAIS' as secao,
    COUNT(*) as total_orcamentos,
    COUNT(CASE WHEN total_price > 0 THEN 1 END) as com_total_price_positivo,
    COUNT(CASE WHEN total_price = 0 THEN 1 END) as com_total_price_zero,
    AVG(total_price) as media_total_price,
    SUM(total_price) as soma_total_price
FROM public.budgets;

-- 9. Verificar se triggers estão funcionando
SELECT 
    'VERIFICAÇÃO DE TRIGGERS' as secao,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'budget_items'
AND trigger_schema = 'public'
ORDER BY trigger_name;

-- Instruções finais
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== CORREÇÃO DE CÁLCULOS DE ORÇAMENTO CONCLUÍDA ===';
    RAISE NOTICE '1. Itens criados para orçamentos sem itens';
    RAISE NOTICE '2. Itens detalhados criados baseados no breakdown';
    RAISE NOTICE '3. Campo total_price sincronizado';
    RAISE NOTICE '4. Triggers verificados';
    RAISE NOTICE '';
    RAISE NOTICE 'PRÓXIMOS PASSOS:';
    RAISE NOTICE '- Verificar se frontend está usando campo correto';
    RAISE NOTICE '- Testar orçamentos específicos';
    RAISE NOTICE '- Monitorar novos orçamentos';
    RAISE NOTICE '================================================';
END $$;
