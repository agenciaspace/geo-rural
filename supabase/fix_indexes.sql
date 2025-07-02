-- Script para corrigir conflitos de índices existentes
-- Execute este script se encontrar erros de índices duplicados

-- 1. Remover índices duplicados se existirem
DROP INDEX IF EXISTS idx_leads_email;
DROP INDEX IF EXISTS idx_leads_created_at;
DROP INDEX IF EXISTS idx_budgets_user_id;
DROP INDEX IF EXISTS idx_budgets_created_at;
DROP INDEX IF EXISTS idx_gnss_analyses_user_id;
DROP INDEX IF EXISTS idx_transactions_user_id;
DROP INDEX IF EXISTS idx_activity_logs_user_id;

-- 2. Recriar índices com nomes únicos
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