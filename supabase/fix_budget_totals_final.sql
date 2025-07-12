-- Script para corrigir definitivamente os totais dos orçamentos
-- Este script garante que o campo total_price reflita o valor correto

-- 1. Primeiro, atualizar total_price baseado no budget_result para orçamentos sem itens
UPDATE public.budgets
SET 
    total_price = CASE 
        WHEN budget_result IS NOT NULL AND budget_result->>'total_price' IS NOT NULL THEN
            CAST(budget_result->>'total_price' AS DECIMAL(10,2))
        WHEN budget_result IS NOT NULL AND budget_result->>'total_cost' IS NOT NULL THEN
            CAST(budget_result->>'total_cost' AS DECIMAL(10,2))
        ELSE 
            COALESCE(total, 0)
    END,
    updated_at = NOW()
WHERE id NOT IN (
    SELECT DISTINCT budget_id 
    FROM public.budget_items 
    WHERE budget_id IS NOT NULL
);

-- 2. Para orçamentos com itens, recalcular baseado na soma dos itens
UPDATE public.budgets b
SET 
    total_price = (
        SELECT COALESCE(SUM(bi.total_price), 0)
        FROM public.budget_items bi
        WHERE bi.budget_id = b.id
    ),
    updated_at = NOW()
WHERE id IN (
    SELECT DISTINCT budget_id 
    FROM public.budget_items 
    WHERE budget_id IS NOT NULL
);

-- 3. Verificar resultados
SELECT 
    'VERIFICAÇÃO FINAL DOS TOTAIS' as info,
    id,
    client_name,
    property_name,
    total as total_antigo,
    total_price as total_corrigido,
    CASE 
        WHEN budget_result IS NOT NULL AND budget_result->>'total_price' IS NOT NULL THEN
            CAST(budget_result->>'total_price' AS DECIMAL(10,2))
        ELSE NULL
    END as budget_result_total,
    (
        SELECT COUNT(*) 
        FROM public.budget_items bi 
        WHERE bi.budget_id = budgets.id
    ) as qtd_itens,
    (
        SELECT COALESCE(SUM(bi.total_price), 0)
        FROM public.budget_items bi 
        WHERE bi.budget_id = budgets.id
    ) as soma_itens
FROM public.budgets
ORDER BY created_at DESC
LIMIT 20;

-- 4. Criar função e triggers se não existirem
CREATE OR REPLACE FUNCTION update_budget_total_on_item_change() 
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar o total do orçamento quando itens forem modificados
    UPDATE public.budgets
    SET 
        total_price = (
            SELECT COALESCE(SUM(total_price), 0)
            FROM public.budget_items
            WHERE budget_id = COALESCE(NEW.budget_id, OLD.budget_id)
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.budget_id, OLD.budget_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Remover triggers antigos se existirem
DROP TRIGGER IF EXISTS sync_budget_total_on_item_insert ON public.budget_items;
DROP TRIGGER IF EXISTS sync_budget_total_on_item_update ON public.budget_items;
DROP TRIGGER IF EXISTS sync_budget_total_on_item_delete ON public.budget_items;

-- Criar triggers novos
CREATE TRIGGER sync_budget_total_on_item_insert
AFTER INSERT ON public.budget_items
FOR EACH ROW EXECUTE FUNCTION update_budget_total_on_item_change();

CREATE TRIGGER sync_budget_total_on_item_update
AFTER UPDATE ON public.budget_items
FOR EACH ROW EXECUTE FUNCTION update_budget_total_on_item_change();

CREATE TRIGGER sync_budget_total_on_item_delete
AFTER DELETE ON public.budget_items
FOR EACH ROW EXECUTE FUNCTION update_budget_total_on_item_change();

-- 5. Estatísticas finais
SELECT 
    'RESUMO DOS ORÇAMENTOS' as info,
    COUNT(*) as total_orcamentos,
    COUNT(CASE WHEN total_price > 0 THEN 1 END) as com_valor_positivo,
    COUNT(CASE WHEN total_price = 0 OR total_price IS NULL THEN 1 END) as sem_valor,
    ROUND(AVG(total_price), 2) as valor_medio,
    ROUND(SUM(total_price), 2) as valor_total
FROM public.budgets;

-- Instruções
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== CORREÇÃO DE TOTAIS CONCLUÍDA ===';
    RAISE NOTICE '';
    RAISE NOTICE 'Este script:';
    RAISE NOTICE '1. Atualizou total_price baseado no budget_result para orçamentos sem itens';
    RAISE NOTICE '2. Recalculou total_price baseado na soma dos itens para orçamentos com itens';
    RAISE NOTICE '3. Criou triggers para manter sincronização automática';
    RAISE NOTICE '';
    RAISE NOTICE 'IMPORTANTE:';
    RAISE NOTICE '- O frontend agora mostra o valor correto no Resumo Financeiro';
    RAISE NOTICE '- Para orçamentos com breakdown, usa a soma dos itens do breakdown';
    RAISE NOTICE '- Para orçamentos sem breakdown, usa o total_price do banco';
    RAISE NOTICE '================================================';
END $$;