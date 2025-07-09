-- =============================================
-- OnGeo - Complemento para Schema Existente
-- =============================================

-- 1. CRIAR TABELA CLIENTS (que está faltando)
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    client_type TEXT DEFAULT 'pessoa_fisica' CHECK (client_type IN ('pessoa_fisica', 'pessoa_juridica')),
    document TEXT,
    company_name TEXT,
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

-- 2. ADICIONAR COLUNA client_id NA TABELA BUDGETS
ALTER TABLE public.budgets 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;

-- Índice para client_id
CREATE INDEX IF NOT EXISTS idx_budgets_client_id ON public.budgets (client_id);

-- 3. ADICIONAR COLUNAS PARA ONBOARDING NA TABELA user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS position TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT;

-- 4. TRIGGERS PARA UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para clients
CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON public.clients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para user_profiles (se não existir)
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. FUNÇÃO PARA ATUALIZAR CONTADOR DE ORÇAMENTOS
CREATE OR REPLACE FUNCTION update_client_budget_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.client_id IS NOT NULL THEN
        UPDATE public.clients 
        SET total_budgets = total_budgets + 1 
        WHERE id = NEW.client_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' AND OLD.client_id IS NOT NULL THEN
        UPDATE public.clients 
        SET total_budgets = total_budgets - 1 
        WHERE id = OLD.client_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Se mudou o cliente
        IF OLD.client_id IS DISTINCT FROM NEW.client_id THEN
            -- Decrementa do cliente antigo
            IF OLD.client_id IS NOT NULL THEN
                UPDATE public.clients 
                SET total_budgets = total_budgets - 1 
                WHERE id = OLD.client_id;
            END IF;
            -- Incrementa no cliente novo
            IF NEW.client_id IS NOT NULL THEN
                UPDATE public.clients 
                SET total_budgets = total_budgets + 1 
                WHERE id = NEW.client_id;
            END IF;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger para atualizar contador
CREATE TRIGGER update_client_budget_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.budgets
    FOR EACH ROW EXECUTE FUNCTION update_client_budget_count();

-- 6. HABILITAR RLS NAS TABELAS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gnss_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 7. POLÍTICAS RLS

-- Políticas para clients
CREATE POLICY "Usuários podem ver seus próprios clientes" ON public.clients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios clientes" ON public.clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios clientes" ON public.clients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios clientes" ON public.clients
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para budgets
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

-- Políticas para user_profiles
CREATE POLICY "Usuários podem ver seu próprio perfil" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seu próprio perfil" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para gnss_analyses
CREATE POLICY "Usuários podem ver suas próprias análises GNSS" ON public.gnss_analyses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias análises GNSS" ON public.gnss_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias análises GNSS" ON public.gnss_analyses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias análises GNSS" ON public.gnss_analyses
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para leads (inserção pública)
CREATE POLICY "Leads são públicos para inserção" ON public.leads
    FOR INSERT WITH CHECK (true);

-- Apenas admins podem ver leads (opcional)
-- CREATE POLICY "Admins podem ver todos os leads" ON public.leads
--     FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- 8. INICIALIZAR CONTADOR DE ORÇAMENTOS PARA CLIENTES EXISTENTES
-- (Execute isso após criar alguns clientes)
-- UPDATE public.clients SET total_budgets = (
--     SELECT COUNT(*) FROM public.budgets WHERE client_id = clients.id
-- );

COMMIT;