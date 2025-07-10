-- Corrigir função reject_budget_by_custom_link
-- Execute este script no SQL Editor do Supabase

-- 1. Remover função existente para recriar sem ambiguidade
DROP FUNCTION IF EXISTS reject_budget_by_custom_link(text, text);

-- 2. Criar nova função sem ambiguidade de colunas
CREATE OR REPLACE FUNCTION reject_budget_by_custom_link(link_param TEXT, comment_param TEXT)
RETURNS TABLE (
    id UUID,
    custom_link TEXT,
    status TEXT,
    rejection_date TIMESTAMPTZ,
    rejection_comment TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Usar alias na tabela para evitar ambiguidade
    UPDATE budgets AS budget_table
    SET 
        status = 'rejected',
        rejection_date = NOW(),
        rejection_comment = comment_param,
        updated_at = NOW()
    WHERE budget_table.custom_link = link_param;
    
    -- Retornar dados atualizados
    RETURN QUERY
    SELECT 
        budget_table.id,
        budget_table.custom_link,
        budget_table.status,
        budget_table.rejection_date,
        budget_table.rejection_comment
    FROM budgets AS budget_table
    WHERE budget_table.custom_link = link_param;
END;
$$;

-- 3. Dar permissões públicas
GRANT EXECUTE ON FUNCTION reject_budget_by_custom_link(TEXT, TEXT) TO public;

-- 4. Testar a função
SELECT 'Testando função reject_budget_by_custom_link' as test_message;

-- Para testar, descomente a linha abaixo (mas não execute em produção):
-- SELECT * FROM reject_budget_by_custom_link('orcamento-1752096006845', 'Teste de rejeição');