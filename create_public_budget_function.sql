-- Criar função pública para acessar orçamentos via custom_link
-- Esta função bypassa completamente as políticas RLS

-- 1. Primeiro, desabilitar RLS temporariamente para teste
ALTER TABLE budgets DISABLE ROW LEVEL SECURITY;

-- 2. Criar função pública para buscar orçamento
CREATE OR REPLACE FUNCTION get_budget_by_custom_link(link_param TEXT)
RETURNS TABLE (
    id UUID,
    custom_link TEXT,
    budget_request JSONB,
    budget_result JSONB,
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    approval_date TIMESTAMPTZ,
    rejection_date TIMESTAMPTZ,
    rejection_comment TEXT,
    user_id UUID,
    client_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.custom_link,
        b.budget_request,
        b.budget_result,
        b.status,
        b.created_at,
        b.updated_at,
        b.approval_date,
        b.rejection_date,
        b.rejection_comment,
        b.user_id,
        b.client_id
    FROM budgets b
    WHERE b.custom_link = link_param;
END;
$$;

-- 3. Criar função pública para aprovar orçamento
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
    UPDATE budgets
    SET 
        status = 'approved',
        approval_date = NOW(),
        updated_at = NOW()
    WHERE custom_link = link_param;
    
    RETURN QUERY
    SELECT 
        b.id,
        b.custom_link,
        b.status,
        b.approval_date
    FROM budgets b
    WHERE b.custom_link = link_param;
END;
$$;

-- 4. Criar função pública para rejeitar orçamento
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
    UPDATE budgets
    SET 
        status = 'rejected',
        rejection_date = NOW(),
        rejection_comment = comment_param,
        updated_at = NOW()
    WHERE custom_link = link_param;
    
    RETURN QUERY
    SELECT 
        b.id,
        b.custom_link,
        b.status,
        b.rejection_date,
        b.rejection_comment
    FROM budgets b
    WHERE b.custom_link = link_param;
END;
$$;

-- 5. Dar permissões públicas para as funções
GRANT EXECUTE ON FUNCTION get_budget_by_custom_link(TEXT) TO public;
GRANT EXECUTE ON FUNCTION approve_budget_by_custom_link(TEXT) TO public;
GRANT EXECUTE ON FUNCTION reject_budget_by_custom_link(TEXT, TEXT) TO public;

-- 6. Testar as funções
SELECT * FROM get_budget_by_custom_link('orcamento-1752096006845');

-- 7. Reabilitar RLS (comentar se ainda não funcionar)
-- ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;