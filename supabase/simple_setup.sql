-- Script SIMPLES para configurar Supabase (sem stored procedures complexas)
-- Execute este script se o complete_setup.sql der problemas

-- ===========================================
-- PARTE 1: PREPARAR TABELA BUDGETS
-- ===========================================

-- 1.1 Criar tabela budgets se não existir
CREATE TABLE IF NOT EXISTS budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active'
);

-- 1.2 Adicionar colunas principais
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS budget_request JSONB;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS budget_result JSONB;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS custom_link TEXT;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS rejection_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS rejection_comment TEXT;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS resubmitted_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS version_history JSONB DEFAULT '[]'::jsonb;

-- 1.3 Adicionar colunas legadas (compatibilidade)
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS client_email TEXT;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS client_phone TEXT;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS property_name TEXT;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS vertices_count INTEGER;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS property_area DECIMAL(10, 2);
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS client_type TEXT;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT FALSE;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS includes_topography BOOLEAN DEFAULT FALSE;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS includes_environmental BOOLEAN DEFAULT FALSE;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS additional_notes TEXT;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2);
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5, 2);
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2);
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS urgency_fee DECIMAL(10, 2);
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS total DECIMAL(10, 2);
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- ===========================================
-- PARTE 2: MIGRAR DADOS (BÁSICO)
-- ===========================================

-- 2.1 Migrar dados existentes para nova estrutura (simples)
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
  )
WHERE budget_request IS NULL AND client_name IS NOT NULL;

UPDATE budgets 
SET 
  budget_result = jsonb_build_object(
    'subtotal', COALESCE(subtotal, 0),
    'discount_percentage', COALESCE(discount_percentage, 0),
    'discount_amount', COALESCE(discount_amount, 0),
    'urgency_fee', COALESCE(urgency_fee, 0),
    'total_price', COALESCE(total, 0),
    'success', true
  )
WHERE budget_result IS NULL AND total IS NOT NULL;

-- 2.2 Gerar custom_link básico (sem numeração sequencial complexa)
UPDATE budgets 
SET custom_link = 'orcamento-' || SUBSTR(id::TEXT, 1, 8)
WHERE custom_link IS NULL;

-- ===========================================
-- PARTE 3: ÍNDICES (BÁSICOS)
-- ===========================================

-- 3.1 Remover índices antigos
DROP INDEX IF EXISTS idx_leads_email;
DROP INDEX IF EXISTS idx_budgets_user_id;
DROP INDEX IF EXISTS idx_budgets_created_at;
DROP INDEX IF EXISTS idx_budgets_custom_link;
DROP INDEX IF EXISTS idx_budgets_status;

-- 3.2 Criar índices essenciais
CREATE INDEX IF NOT EXISTS idx_budgets_user_id_v3 ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_created_at_v3 ON budgets(created_at);
CREATE INDEX IF NOT EXISTS idx_budgets_custom_link_v3 ON budgets(custom_link);
CREATE INDEX IF NOT EXISTS idx_budgets_status_v3 ON budgets(status);

-- ===========================================
-- PARTE 4: SEGURANÇA BÁSICA
-- ===========================================

-- 4.1 Habilitar RLS
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- 4.2 Políticas básicas (remover e recriar)
DROP POLICY IF EXISTS "Users can view own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can create budgets" ON budgets;
DROP POLICY IF EXISTS "Users can update own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can delete own budgets" ON budgets;

CREATE POLICY "Users can view own budgets" ON budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create budgets" ON budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" ON budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" ON budgets
  FOR DELETE USING (auth.uid() = user_id);

-- ===========================================
-- VERIFICAÇÃO FINAL
-- ===========================================

SELECT 
  'budgets table configured successfully' as status,
  COUNT(*) as total_budgets
FROM budgets;