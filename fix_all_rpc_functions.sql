-- Corrigir todas as funções RPC para orçamentos públicos
-- Execute este script no SQL Editor do Supabase

-- ================================
-- PARTE 1: REMOVER FUNÇÕES ANTIGAS
-- ================================

DROP FUNCTION IF EXISTS get_budget_by_custom_link(text);
DROP FUNCTION IF EXISTS approve_budget_by_custom_link(text);
DROP FUNCTION IF EXISTS reject_budget_by_custom_link(text, text);

-- ================================
-- PARTE 2: FUNÇÃO PARA BUSCAR ORÇAMENTO
-- ================================

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
        budget_table.id,
        budget_table.custom_link,
        budget_table.budget_request,
        budget_table.budget_result,
        budget_table.status,
        budget_table.created_at,
        budget_table.updated_at,
        budget_table.approval_date,
        budget_table.rejection_date,
        budget_table.rejection_comment,
        budget_table.user_id,
        budget_table.client_id
    FROM budgets AS budget_table
    WHERE budget_table.custom_link = link_param;
END;
$$;

-- ================================
-- PARTE 3: FUNÇÃO PARA APROVAR ORÇAMENTO
-- ================================

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
    -- Atualizar status para aprovado
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

-- ================================
-- PARTE 4: FUNÇÃO PARA REJEITAR ORÇAMENTO
-- ================================

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
    -- Atualizar status para rejeitado com comentário
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

-- ================================
-- PARTE 5: DAR PERMISSÕES PÚBLICAS
-- ================================

GRANT EXECUTE ON FUNCTION get_budget_by_custom_link(TEXT) TO public;
GRANT EXECUTE ON FUNCTION approve_budget_by_custom_link(TEXT) TO public;
GRANT EXECUTE ON FUNCTION reject_budget_by_custom_link(TEXT, TEXT) TO public;

-- ================================
-- PARTE 6: VERIFICAR SE TUDO ESTÁ OK
-- ================================

-- Verificar se as funções foram criadas
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_name IN (
    'get_budget_by_custom_link',
    'approve_budget_by_custom_link', 
    'reject_budget_by_custom_link'
)
AND routine_schema = 'public';

-- Verificar se a tabela budgets existe e tem RLS desabilitado (se necessário)
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'budgets'
AND schemaname = 'public';

SELECT 'Funções RPC corrigidas com sucesso!' as result;