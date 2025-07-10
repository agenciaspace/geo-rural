-- Corrigir função approve_budget_by_custom_link
-- Execute este script no SQL Editor do Supabase

-- 1. Remover função existente para recriar sem ambiguidade
DROP FUNCTION IF EXISTS approve_budget_by_custom_link(text);

-- 2. Criar nova função sem ambiguidade de colunas
CREATE OR REPLACE FUNCTION approve_budget_by_custom_link(link_param TEXT)
RETURNS TABLE (
    id UUID,
    custom_link TEXT,
    status TEXT,
    approval_date TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Usar alias na tabela para evitar ambiguidade
    UPDATE budgets AS budget_table
    SET 
        status = 'approved',
        approval_date = NOW(),
        updated_at = NOW()
    WHERE budget_table.custom_link = link_param;
    
    -- Retornar dados atualizados
    RETURN QUERY
    SELECT 
        budget_table.id,
        budget_table.custom_link,
        budget_table.status,
        budget_table.approval_date
    FROM budgets AS budget_table
    WHERE budget_table.custom_link = link_param;
END;
$$;

-- 3. Dar permissões públicas
GRANT EXECUTE ON FUNCTION approve_budget_by_custom_link(TEXT) TO public;

-- 4. Testar a função
SELECT 'Testando função approve_budget_by_custom_link' as test_message;

-- Para testar, descomente a linha abaixo (mas não execute em produção):
-- SELECT * FROM approve_budget_by_custom_link('orcamento-1752096006845');