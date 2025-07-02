-- Script completo para configurar o Supabase do zero ou corrigir instalação existente
-- Execute este script no SQL Editor do Supabase

-- ===========================================
-- PARTE 1: PREPARAR TABELA BUDGETS
-- ===========================================

-- 1.1 Verificar se tabela budgets existe, senão criar
CREATE TABLE IF NOT EXISTS budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active'
);

-- 1.2 Adicionar todas as colunas necessárias (IF NOT EXISTS evita erros)
ALTER TABLE budgets 
ADD COLUMN IF NOT EXISTS budget_request JSONB,
ADD COLUMN IF NOT EXISTS budget_result JSONB,
ADD COLUMN IF NOT EXISTS custom_link TEXT,
ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_comment TEXT,
ADD COLUMN IF NOT EXISTS resubmitted_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS version_history JSONB DEFAULT '[]'::jsonb;

-- 1.3 Adicionar colunas legadas se necessário (para compatibilidade)
ALTER TABLE budgets 
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS client_email TEXT,
ADD COLUMN IF NOT EXISTS client_phone TEXT,
ADD COLUMN IF NOT EXISTS property_name TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS vertices_count INTEGER,
ADD COLUMN IF NOT EXISTS property_area DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS client_type TEXT,
ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS includes_topography BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS includes_environmental BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS additional_notes TEXT,
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS urgency_fee DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS total DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- ===========================================
-- PARTE 2: MIGRAR DADOS EXISTENTES
-- ===========================================

-- 2.1 Se existem dados na estrutura antiga, migrar para nova
UPDATE budgets 
SET 
  budget_request = jsonb_build_object(
    'client_name', COALESCE(client_name, ''),
    'client_email', COALESCE(client_email, ''),
    'client_phone', COALESCE(client_phone, ''),
    'property_name', COALESCE(property_name, ''),
    'state', COALESCE(state, ''),
    'city', COALESCE(city, ''),
    'vertices_count', COALESCE(vertices_count, 4),
    'property_area', COALESCE(property_area, 1.0),
    'client_type', COALESCE(client_type, 'pessoa_fisica'),
    'is_urgent', COALESCE(is_urgent, false),
    'includes_topography', COALESCE(includes_topography, false),
    'includes_environmental', COALESCE(includes_environmental, false),
    'additional_notes', COALESCE(additional_notes, '')
  ),
  budget_result = jsonb_build_object(
    'subtotal', COALESCE(subtotal, 0),
    'discount_percentage', COALESCE(discount_percentage, 0),
    'discount_amount', COALESCE(discount_amount, 0),
    'urgency_fee', COALESCE(urgency_fee, 0),
    'total_price', COALESCE(total, 0),
    'success', true
  )
WHERE budget_request IS NULL AND client_name IS NOT NULL;

-- 2.2 Gerar custom_link para orçamentos sem link
UPDATE budgets 
SET custom_link = 'orcamento-' || LPAD((ROW_NUMBER() OVER (ORDER BY created_at))::TEXT, 4, '0')
WHERE custom_link IS NULL;

-- ===========================================
-- PARTE 3: LIMPAR E RECRIAR ÍNDICES
-- ===========================================

-- 3.1 Remover índices antigos que podem causar conflito
DROP INDEX IF EXISTS idx_leads_email;
DROP INDEX IF EXISTS idx_leads_created_at;
DROP INDEX IF EXISTS idx_budgets_user_id;
DROP INDEX IF EXISTS idx_budgets_created_at;
DROP INDEX IF EXISTS idx_budgets_custom_link;
DROP INDEX IF EXISTS idx_budgets_status;
DROP INDEX IF EXISTS idx_gnss_analyses_user_id;
DROP INDEX IF EXISTS idx_gnss_analyses_created_at;
DROP INDEX IF EXISTS idx_transactions_user_id;
DROP INDEX IF EXISTS idx_activity_logs_user_id;

-- 3.2 Criar novos índices
CREATE INDEX IF NOT EXISTS idx_budgets_user_id_new ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_created_at_new ON budgets(created_at);
CREATE INDEX IF NOT EXISTS idx_budgets_custom_link_new ON budgets(custom_link);
CREATE INDEX IF NOT EXISTS idx_budgets_status_new ON budgets(status);

-- 3.3 Criar constraint único para custom_link
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'budgets_custom_link_unique'
    ) THEN
        ALTER TABLE budgets ADD CONSTRAINT budgets_custom_link_unique UNIQUE (custom_link);
    END IF;
END $$;

-- ===========================================
-- PARTE 4: CONFIGURAR SEGURANÇA (RLS)
-- ===========================================

-- 4.1 Habilitar RLS na tabela budgets
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- 4.2 Remover políticas existentes para recriar
DROP POLICY IF EXISTS "Users can view own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can create budgets" ON budgets;
DROP POLICY IF EXISTS "Users can update own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can delete own budgets" ON budgets;

-- 4.3 Criar políticas de segurança
CREATE POLICY "Users can view own budgets" ON budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create budgets" ON budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" ON budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" ON budgets
  FOR DELETE USING (auth.uid() = user_id);

-- ===========================================
-- PARTE 5: VERIFICAÇÃO E RELATÓRIO
-- ===========================================

DO $$
DECLARE
    budget_count INTEGER;
    column_count INTEGER;
    index_count INTEGER;
BEGIN
    -- Contar orçamentos
    SELECT COUNT(*) INTO budget_count FROM budgets;
    
    -- Contar colunas da tabela budgets
    SELECT COUNT(*) INTO column_count 
    FROM information_schema.columns 
    WHERE table_name = 'budgets' AND table_schema = 'public';
    
    -- Contar índices da tabela budgets
    SELECT COUNT(*) INTO index_count 
    FROM pg_indexes 
    WHERE tablename = 'budgets' AND schemaname = 'public';
    
    RAISE NOTICE '===========================================';
    RAISE NOTICE '✅ CONFIGURAÇÃO SUPABASE CONCLUÍDA!';
    RAISE NOTICE '===========================================';
    RAISE NOTICE '📊 Orçamentos na base: %', budget_count;
    RAISE NOTICE '📋 Colunas na tabela budgets: %', column_count;
    RAISE NOTICE '🔍 Índices criados: %', index_count;
    RAISE NOTICE '🔒 RLS habilitado e políticas aplicadas';
    RAISE NOTICE '🚀 Sistema pronto para uso!';
    RAISE NOTICE '===========================================';
END $$;