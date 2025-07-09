-- =============================================
-- OnGeo - Schemas das Tabelas do Supabase
-- =============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. TABELA: leads
-- Para capturar leads da landing page
-- =============================================
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(255),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para leads
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads (email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads (created_at);

-- =============================================
-- 2. TABELA: clients
-- Para gerenciar clientes
-- =============================================
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    client_type VARCHAR(20) DEFAULT 'pessoa_fisica' CHECK (client_type IN ('pessoa_fisica', 'pessoa_juridica')),
    document VARCHAR(50),
    company_name VARCHAR(255),
    address JSONB DEFAULT '{}',
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    total_budgets INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para clients
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients (user_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients (email);
CREATE INDEX IF NOT EXISTS idx_clients_is_active ON public.clients (is_active);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON public.clients (created_at);

-- =============================================
-- 3. TABELA: budgets
-- Para gerenciar orçamentos
-- =============================================
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    custom_link VARCHAR(255) UNIQUE,
    
    -- Dados do orçamento (JSON para flexibilidade)
    budget_request JSONB NOT NULL,
    budget_result JSONB,
    
    -- Campos específicos para consultas mais fáceis
    client_name VARCHAR(255),
    client_email VARCHAR(255),
    property_name VARCHAR(255),
    total_price DECIMAL(10,2),
    
    -- Status do orçamento
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'accepted', 'rejected', 'expired')),
    rejection_comment TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para budgets
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets (user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_client_id ON public.budgets (client_id);
CREATE INDEX IF NOT EXISTS idx_budgets_custom_link ON public.budgets (custom_link);
CREATE INDEX IF NOT EXISTS idx_budgets_status ON public.budgets (status);
CREATE INDEX IF NOT EXISTS idx_budgets_created_at ON public.budgets (created_at);

-- =============================================
-- 4. TABELA: gnss_analyses
-- Para análises GNSS
-- =============================================
CREATE TABLE IF NOT EXISTS public.gnss_analyses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    file_size INTEGER,
    analysis_result JSONB,
    quality_color VARCHAR(20),
    processing_status VARCHAR(20) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para gnss_analyses
CREATE INDEX IF NOT EXISTS idx_gnss_analyses_user_id ON public.gnss_analyses (user_id);
CREATE INDEX IF NOT EXISTS idx_gnss_analyses_status ON public.gnss_analyses (processing_status);
CREATE INDEX IF NOT EXISTS idx_gnss_analyses_created_at ON public.gnss_analyses (created_at);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS para todas as tabelas
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gnss_analyses ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLÍTICAS RLS
-- =============================================

-- Políticas para leads (apenas admin pode ver todos)
CREATE POLICY "Leads são públicos para inserção" ON public.leads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins podem ver todos os leads" ON public.leads
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para clients (usuário só vê seus próprios)
CREATE POLICY "Usuários podem ver seus próprios clientes" ON public.clients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios clientes" ON public.clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios clientes" ON public.clients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios clientes" ON public.clients
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para budgets (usuário só vê seus próprios)
CREATE POLICY "Usuários podem ver seus próprios orçamentos" ON public.budgets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios orçamentos" ON public.budgets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios orçamentos" ON public.budgets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios orçamentos" ON public.budgets
    FOR DELETE USING (auth.uid() = user_id);

-- Política especial para visualização pública via custom_link
CREATE POLICY "Orçamentos são públicos via custom_link" ON public.budgets
    FOR SELECT USING (custom_link IS NOT NULL);

-- Políticas para gnss_analyses (usuário só vê suas próprias)
CREATE POLICY "Usuários podem ver suas próprias análises GNSS" ON public.gnss_analyses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias análises GNSS" ON public.gnss_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias análises GNSS" ON public.gnss_analyses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias análises GNSS" ON public.gnss_analyses
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- TRIGGERS E FUNÇÕES
-- =============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON public.clients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at 
    BEFORE UPDATE ON public.budgets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gnss_analyses_updated_at 
    BEFORE UPDATE ON public.gnss_analyses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at 
    BEFORE UPDATE ON public.leads 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNÇÃO PARA ATUALIZAR CONTADOR DE ORÇAMENTOS
-- =============================================

-- Função para atualizar total_budgets do cliente
CREATE OR REPLACE FUNCTION update_client_budget_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.clients 
        SET total_budgets = total_budgets + 1 
        WHERE id = NEW.client_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.clients 
        SET total_budgets = total_budgets - 1 
        WHERE id = OLD.client_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger para atualizar contador automaticamente
CREATE TRIGGER update_client_budget_count_trigger
    AFTER INSERT OR DELETE ON public.budgets
    FOR EACH ROW EXECUTE FUNCTION update_client_budget_count();

-- =============================================
-- STORAGE BUCKET PARA ARQUIVOS GNSS
-- =============================================

-- Criar bucket para arquivos GNSS (execute no painel do Supabase)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('gnss-files', 'gnss-files', false);

-- Políticas para storage bucket gnss-files
-- CREATE POLICY "Usuários podem fazer upload de arquivos GNSS" ON storage.objects
--     FOR INSERT WITH CHECK (bucket_id = 'gnss-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Usuários podem ver seus próprios arquivos GNSS" ON storage.objects
--     FOR SELECT USING (bucket_id = 'gnss-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Usuários podem deletar seus próprios arquivos GNSS" ON storage.objects
--     FOR DELETE USING (bucket_id = 'gnss-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =============================================
-- DADOS INICIAIS (OPCIONAL)
-- =============================================

-- Comentado - descomente se precisar de dados de teste
-- INSERT INTO public.leads (name, email, phone, company, message) VALUES
-- ('João Silva', 'joao@teste.com', '(11) 99999-9999', 'Fazenda ABC', 'Preciso de georreferenciamento para minha propriedade rural');

COMMIT;