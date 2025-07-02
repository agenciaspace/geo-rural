-- Script completo para configurar o Supabase do zero ou corrigir instalação existente
-- Execute este script no SQL Editor do Supabase

-- ===========================================
-- PARTE 1: PREPARAR TABELAS PRINCIPAIS
-- ===========================================

-- 1.1 Criar tabela de clientes
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  client_type TEXT NOT NULL DEFAULT 'pessoa_fisica', -- pessoa_fisica, pessoa_juridica
  document TEXT, -- CPF ou CNPJ
  company_name TEXT, -- Para pessoa jurídica
  address JSONB, -- Endereço completo
  notes TEXT, -- Observações sobre o cliente
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  -- Informações de contato adicionais
  secondary_phone TEXT,
  website TEXT,
  -- Dados estatísticos
  total_budgets INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  last_budget_date TIMESTAMP WITH TIME ZONE,
  -- Constraint para evitar duplicatas por usuário
  UNIQUE(user_id, email)
);

-- 1.2 Verificar se tabela budgets existe, senão criar
CREATE TABLE IF NOT EXISTS budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active'
);

-- 1.3 Adicionar todas as colunas necessárias (IF NOT EXISTS evita erros)
ALTER TABLE budgets 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
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

-- 2.1 Criar clientes a partir de orçamentos existentes
INSERT INTO clients (user_id, name, email, phone, client_type, created_at, updated_at)
SELECT DISTINCT 
    user_id,
    client_name,
    client_email,
    client_phone,
    COALESCE(client_type, 'pessoa_fisica'),
    MIN(created_at),
    NOW()
FROM budgets 
WHERE client_name IS NOT NULL 
    AND client_email IS NOT NULL 
    AND NOT EXISTS (
        SELECT 1 FROM clients 
        WHERE clients.user_id = budgets.user_id 
        AND clients.email = budgets.client_email
    )
GROUP BY user_id, client_name, client_email, client_phone, client_type;

-- 2.2 Conectar orçamentos com clientes criados
UPDATE budgets 
SET client_id = clients.id
FROM clients
WHERE budgets.user_id = clients.user_id 
    AND budgets.client_email = clients.email
    AND budgets.client_id IS NULL;

-- 2.3 Migrar dados existentes para nova estrutura JSONB
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

-- 2.4 Atualizar estatísticas dos clientes
UPDATE clients 
SET 
    total_budgets = budget_stats.count,
    total_spent = budget_stats.total,
    last_budget_date = budget_stats.last_date
FROM (
    SELECT 
        client_id,
        COUNT(*) as count,
        SUM(COALESCE((budget_result->>'total_price')::DECIMAL, COALESCE(total, 0))) as total,
        MAX(created_at) as last_date
    FROM budgets 
    WHERE client_id IS NOT NULL
    GROUP BY client_id
) AS budget_stats
WHERE clients.id = budget_stats.client_id;

-- 2.2 Gerar custom_link para orçamentos sem link (abordagem simples e compatível)
DO $$
DECLARE
    budget_record RECORD;
    counter INTEGER := 1;
BEGIN
    FOR budget_record IN 
        SELECT id FROM budgets WHERE custom_link IS NULL ORDER BY created_at
    LOOP
        UPDATE budgets 
        SET custom_link = 'orcamento-' || LPAD(counter::TEXT, 4, '0')
        WHERE id = budget_record.id;
        counter := counter + 1;
    END LOOP;
END $$;

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

-- 3.2 Criar novos índices para budgets
CREATE INDEX IF NOT EXISTS idx_budgets_user_id_new ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_client_id_new ON budgets(client_id);
CREATE INDEX IF NOT EXISTS idx_budgets_created_at_new ON budgets(created_at);
CREATE INDEX IF NOT EXISTS idx_budgets_custom_link_new ON budgets(custom_link);
CREATE INDEX IF NOT EXISTS idx_budgets_status_new ON budgets(status);

-- 3.3 Criar índices para clientes
CREATE INDEX IF NOT EXISTS idx_clients_user_id_new ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_email_new ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_created_at_new ON clients(created_at);
CREATE INDEX IF NOT EXISTS idx_clients_is_active_new ON clients(is_active);

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

-- 4.1 Habilitar RLS nas tabelas
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- 4.2 Remover políticas existentes para recriar
DROP POLICY IF EXISTS "Users can view own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can create budgets" ON budgets;
DROP POLICY IF EXISTS "Users can update own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can delete own budgets" ON budgets;

DROP POLICY IF EXISTS "Users can view own clients" ON clients;
DROP POLICY IF EXISTS "Users can create clients" ON clients;
DROP POLICY IF EXISTS "Users can update own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;

-- 4.3 Criar políticas de segurança para budgets
CREATE POLICY "Users can view own budgets" ON budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create budgets" ON budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" ON budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" ON budgets
  FOR DELETE USING (auth.uid() = user_id);

-- 4.4 Criar políticas de segurança para clients
CREATE POLICY "Users can view own clients" ON clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients" ON clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients" ON clients
  FOR DELETE USING (auth.uid() = user_id);

-- ===========================================
-- PARTE 5: VERIFICAÇÃO E RELATÓRIO
-- ===========================================

DO $$
DECLARE
    budget_count INTEGER;
    client_count INTEGER;
    connected_budgets INTEGER;
    budget_columns INTEGER;
    client_columns INTEGER;
    total_indexes INTEGER;
BEGIN
    -- Contar registros
    SELECT COUNT(*) INTO budget_count FROM budgets;
    SELECT COUNT(*) INTO client_count FROM clients;
    SELECT COUNT(*) INTO connected_budgets FROM budgets WHERE client_id IS NOT NULL;
    
    -- Contar colunas das tabelas
    SELECT COUNT(*) INTO budget_columns 
    FROM information_schema.columns 
    WHERE table_name = 'budgets' AND table_schema = 'public';
    
    SELECT COUNT(*) INTO client_columns 
    FROM information_schema.columns 
    WHERE table_name = 'clients' AND table_schema = 'public';
    
    -- Contar índices totais
    SELECT COUNT(*) INTO total_indexes 
    FROM pg_indexes 
    WHERE tablename IN ('budgets', 'clients') AND schemaname = 'public';
    
    RAISE NOTICE '===========================================';
    RAISE NOTICE '✅ CONFIGURAÇÃO SUPABASE CONCLUÍDA!';
    RAISE NOTICE '===========================================';
    RAISE NOTICE '👥 Clientes cadastrados: %', client_count;
    RAISE NOTICE '📊 Orçamentos na base: %', budget_count;
    RAISE NOTICE '🔗 Orçamentos conectados a clientes: %', connected_budgets;
    RAISE NOTICE '📋 Colunas budgets: % | Colunas clients: %', budget_columns, client_columns;
    RAISE NOTICE '🔍 Índices criados: %', total_indexes;
    RAISE NOTICE '🔒 RLS habilitado e políticas aplicadas';
    RAISE NOTICE '🚀 Sistema com base de clientes pronto!';
    RAISE NOTICE '===========================================';
END $$;