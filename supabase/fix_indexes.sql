-- Script para corrigir conflitos de índices existentes
-- Execute este script se encontrar erros de índices duplicados

-- 0. Verificar estrutura atual da tabela budgets
DO $$
BEGIN
    RAISE NOTICE 'Verificando estrutura da tabela budgets...';
END $$;

-- 1. Primeiro, adicionar colunas necessárias se não existirem
ALTER TABLE budgets 
ADD COLUMN IF NOT EXISTS budget_request JSONB,
ADD COLUMN IF NOT EXISTS budget_result JSONB,
ADD COLUMN IF NOT EXISTS custom_link TEXT,
ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_comment TEXT,
ADD COLUMN IF NOT EXISTS resubmitted_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS version_history JSONB DEFAULT '[]'::jsonb;

-- 2. Remover índices duplicados se existirem
DROP INDEX IF EXISTS idx_leads_email;
DROP INDEX IF EXISTS idx_leads_created_at;
DROP INDEX IF EXISTS idx_budgets_user_id;
DROP INDEX IF EXISTS idx_budgets_created_at;
DROP INDEX IF EXISTS idx_budgets_custom_link;
DROP INDEX IF EXISTS idx_budgets_status;
DROP INDEX IF EXISTS idx_gnss_analyses_user_id;
DROP INDEX IF EXISTS idx_transactions_user_id;
DROP INDEX IF EXISTS idx_activity_logs_user_id;

-- 3. Recriar índices com nomes únicos (agora que as colunas existem)
CREATE INDEX IF NOT EXISTS idx_leads_email_v2 ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at_v2 ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id_v2 ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_created_at_v2 ON budgets(created_at);
CREATE INDEX IF NOT EXISTS idx_budgets_custom_link_v2 ON budgets(custom_link);
CREATE INDEX IF NOT EXISTS idx_budgets_status_v2 ON budgets(status);
CREATE INDEX IF NOT EXISTS idx_gnss_analyses_user_id_v2 ON gnss_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_gnss_analyses_created_at_v2 ON gnss_analyses(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id_v2 ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id_v2 ON activity_logs(user_id);

-- 3. Verificar índices criados
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename IN ('leads', 'budgets', 'gnss_analyses', 'transactions', 'activity_logs')
ORDER BY tablename, indexname;