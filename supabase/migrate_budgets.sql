-- Script de migração para atualizar tabela budgets para nova estrutura
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar novas colunas à tabela budgets existente
ALTER TABLE budgets 
ADD COLUMN IF NOT EXISTS budget_request JSONB,
ADD COLUMN IF NOT EXISTS budget_result JSONB,
ADD COLUMN IF NOT EXISTS custom_link TEXT,
ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_comment TEXT,
ADD COLUMN IF NOT EXISTS resubmitted_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS version_history JSONB DEFAULT '[]'::jsonb;

-- 2. Migrar dados existentes para nova estrutura (se houver)
UPDATE budgets 
SET 
  budget_request = jsonb_build_object(
    'client_name', client_name,
    'client_email', client_email,
    'client_phone', client_phone,
    'property_name', property_name,
    'state', state,
    'city', city,
    'vertices_count', vertices_count,
    'property_area', property_area,
    'client_type', client_type,
    'is_urgent', is_urgent,
    'includes_topography', includes_topography,
    'includes_environmental', includes_environmental,
    'additional_notes', additional_notes
  ),
  budget_result = jsonb_build_object(
    'subtotal', subtotal,
    'discount_percentage', discount_percentage,
    'discount_amount', discount_amount,
    'urgency_fee', urgency_fee,
    'total_price', total,
    'success', true
  )
WHERE budget_request IS NULL;

-- 3. Atualizar status para usar nova nomenclatura
UPDATE budgets 
SET status = CASE 
  WHEN status = 'draft' THEN 'active'
  WHEN status = 'sent' THEN 'active'
  ELSE status
END;

-- 4. Criar índices para novas colunas (usando IF NOT EXISTS equivalente)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_budgets_custom_link_new') THEN
        CREATE INDEX idx_budgets_custom_link_new ON budgets(custom_link);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_budgets_status_new') THEN
        CREATE INDEX idx_budgets_status_new ON budgets(status);
    END IF;
END $$;

-- 5. Adicionar constraint único para custom_link (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'budgets_custom_link_unique'
    ) THEN
        ALTER TABLE budgets ADD CONSTRAINT budgets_custom_link_unique UNIQUE (custom_link);
    END IF;
END $$;

-- 6. Verificar migração
DO $$
DECLARE
    migrated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO migrated_count 
    FROM budgets 
    WHERE budget_request IS NOT NULL AND budget_result IS NOT NULL;
    
    RAISE NOTICE '✅ Migração concluída!';
    RAISE NOTICE '📊 Orçamentos migrados: %', migrated_count;
    RAISE NOTICE '🔄 Nova estrutura compatível com sistema atual';
END $$;