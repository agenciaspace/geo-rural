-- Schema seguro do banco de dados para GeoRural Pro
-- Este script verifica se os elementos já existem antes de criá-los

-- Tabela de leads (captura da landing page)
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  converted BOOLEAN DEFAULT FALSE,
  converted_at TIMESTAMP WITH TIME ZONE,
  source TEXT DEFAULT 'landing_page',
  metadata JSONB
);

-- Tabela de usuários estendida (além do auth.users do Supabase)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  cpf_cnpj TEXT,
  address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_status TEXT DEFAULT 'trial', -- trial, active, inactive, cancelled
  subscription_plan TEXT, -- free, professional, enterprise
  trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Tabela de orçamentos
CREATE TABLE IF NOT EXISTS budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  property_name TEXT NOT NULL,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  vertices_count INTEGER NOT NULL,
  property_area DECIMAL(10, 2) NOT NULL,
  client_type TEXT NOT NULL,
  is_urgent BOOLEAN DEFAULT FALSE,
  includes_topography BOOLEAN DEFAULT FALSE,
  includes_environmental BOOLEAN DEFAULT FALSE,
  additional_notes TEXT,
  subtotal DECIMAL(10, 2),
  discount_percentage DECIMAL(5, 2),
  discount_amount DECIMAL(10, 2),
  urgency_fee DECIMAL(10, 2),
  total DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'draft', -- draft, sent, approved, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  pdf_url TEXT
);

-- Tabela de análises GNSS
CREATE TABLE IF NOT EXISTS gnss_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  satellites_count INTEGER,
  satellites_list TEXT[],
  duration_hours DECIMAL(10, 2),
  quality_status TEXT, -- EXCELENTE, BOA, RUIM
  quality_color TEXT, -- green, orange, red
  issues TEXT[],
  technical_report TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processing_time_ms INTEGER,
  metadata JSONB,
  -- Novos campos para coordenadas
  latitude DECIMAL(12, 8),
  longitude DECIMAL(12, 8),
  altitude DECIMAL(8, 3),
  utm_zone TEXT,
  utm_easting DECIMAL(12, 3),
  utm_northing DECIMAL(12, 3),
  precision_horizontal DECIMAL(8, 3),
  precision_vertical DECIMAL(8, 3),
  pdop DECIMAL(5, 2),
  incra_status TEXT -- APPROVED, REPROCESSAR
);

-- Tabela de transações/pagamentos
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  type TEXT NOT NULL, -- subscription, single_analysis, budget_generation
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'BRL',
  status TEXT DEFAULT 'pending', -- pending, completed, failed, refunded
  payment_method TEXT, -- credit_card, pix, boleto
  payment_id TEXT, -- ID do gateway de pagamento
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);

-- Tabela de logs de atividade
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  action TEXT NOT NULL,
  entity_type TEXT, -- budget, gnss_analysis, profile, etc
  entity_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Índices para melhor performance (usando IF NOT EXISTS equivalente)
DO $$ 
BEGIN
    -- Índices para leads
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_leads_email') THEN
        CREATE INDEX idx_leads_email ON leads(email);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_leads_created_at') THEN
        CREATE INDEX idx_leads_created_at ON leads(created_at);
    END IF;
    
    -- Índices para budgets
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_budgets_user_id') THEN
        CREATE INDEX idx_budgets_user_id ON budgets(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_budgets_created_at') THEN
        CREATE INDEX idx_budgets_created_at ON budgets(created_at);
    END IF;
    
    -- Índices para gnss_analyses
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_gnss_analyses_user_id') THEN
        CREATE INDEX idx_gnss_analyses_user_id ON gnss_analyses(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_gnss_analyses_created_at') THEN
        CREATE INDEX idx_gnss_analyses_created_at ON gnss_analyses(created_at);
    END IF;
    
    -- Índices para transactions
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_transactions_user_id') THEN
        CREATE INDEX idx_transactions_user_id ON transactions(user_id);
    END IF;
    
    -- Índices para activity_logs
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_activity_logs_user_id') THEN
        CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
    END IF;
END $$;

-- Row Level Security (RLS) - apenas ativa se ainda não estiver
DO $$
BEGIN
    -- user_profiles
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'user_profiles' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- budgets
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'budgets' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- gnss_analyses
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'gnss_analyses' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE gnss_analyses ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- transactions
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'transactions' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- activity_logs
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'activity_logs' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Políticas de segurança (drop e recria se existir)
-- Perfis de usuário
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Orçamentos
DROP POLICY IF EXISTS "Users can view own budgets" ON budgets;
CREATE POLICY "Users can view own budgets" ON budgets
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create budgets" ON budgets;
CREATE POLICY "Users can create budgets" ON budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own budgets" ON budgets;
CREATE POLICY "Users can update own budgets" ON budgets
  FOR UPDATE USING (auth.uid() = user_id);

-- Análises GNSS
DROP POLICY IF EXISTS "Users can view own analyses" ON gnss_analyses;
CREATE POLICY "Users can view own analyses" ON gnss_analyses
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create analyses" ON gnss_analyses;
CREATE POLICY "Users can create analyses" ON gnss_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own analyses" ON gnss_analyses;
CREATE POLICY "Users can update own analyses" ON gnss_analyses
  FOR UPDATE USING (auth.uid() = user_id);

-- Transações
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Logs de atividade
DROP POLICY IF EXISTS "Users can view own activity" ON activity_logs;
CREATE POLICY "Users can view own activity" ON activity_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Funções auxiliares
-- Função para criar perfil de usuário automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, created_at)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', now())
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove trigger se existir e recria
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at (remove se existir e recria)
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_budgets_updated_at ON budgets;
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verificação final
DO $$
DECLARE
    required_tables TEXT[] := ARRAY['leads', 'user_profiles', 'budgets', 'gnss_analyses', 'transactions', 'activity_logs'];
    tbl_name TEXT;
    table_count INTEGER := 0;
BEGIN
    FOREACH tbl_name IN ARRAY required_tables
    LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = tbl_name
        ) THEN
            table_count := table_count + 1;
        END IF;
    END LOOP;
    
    RAISE NOTICE '✅ Schema GeoRural Pro configurado com sucesso!';
    RAISE NOTICE '📊 Tabelas criadas: % de %', table_count, array_length(required_tables, 1);
    RAISE NOTICE '🔒 RLS e políticas de segurança aplicadas';
    RAISE NOTICE '🔄 Triggers e funções configurados';
END $$; 