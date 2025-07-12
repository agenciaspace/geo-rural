-- Criar tabelas para itens detalhados de orçamento

-- 1. Criar enum para tipos de item (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'budget_item_type') THEN
        CREATE TYPE budget_item_type AS ENUM (
            'servico_geo',      -- Serviços de georreferenciamento
            'insumo',          -- Insumos (materiais, equipamentos)
            'deslocamento',    -- Custos de deslocamento
            'hospedagem',      -- Custos de hospedagem
            'alimentacao',     -- Custos de alimentação
            'outros'           -- Outros custos
        );
    END IF;
END$$;

-- 2. Criar tabela de itens de orçamento
CREATE TABLE IF NOT EXISTS public.budget_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
    item_type budget_item_type NOT NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 1,
    unit VARCHAR(50), -- unidade de medida (ex: 'ha', 'km', 'diária', 'unidade')
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Criar índices
CREATE INDEX idx_budget_items_budget_id ON public.budget_items(budget_id);
CREATE INDEX idx_budget_items_type ON public.budget_items(item_type);

-- 4. Adicionar coluna total_price se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'budgets' 
                   AND column_name = 'total_price') THEN
        ALTER TABLE public.budgets ADD COLUMN total_price DECIMAL(10,2) DEFAULT 0;
    END IF;
END$$;

-- 5. Criar função para atualizar o total do orçamento
CREATE OR REPLACE FUNCTION update_budget_total() RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar o total do orçamento somando todos os itens
    UPDATE public.budgets
    SET total_price = (
        SELECT COALESCE(SUM(total_price), 0)
        FROM public.budget_items
        WHERE budget_id = COALESCE(NEW.budget_id, OLD.budget_id)
    ),
    updated_at = NOW()
    WHERE id = COALESCE(NEW.budget_id, OLD.budget_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar triggers para atualizar o total
CREATE TRIGGER update_budget_total_on_insert
    AFTER INSERT ON public.budget_items
    FOR EACH ROW
    EXECUTE FUNCTION update_budget_total();

CREATE TRIGGER update_budget_total_on_update
    AFTER UPDATE ON public.budget_items
    FOR EACH ROW
    EXECUTE FUNCTION update_budget_total();

CREATE TRIGGER update_budget_total_on_delete
    AFTER DELETE ON public.budget_items
    FOR EACH ROW
    EXECUTE FUNCTION update_budget_total();

-- 7. Adicionar RLS (Row Level Security)
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;

-- Política para visualizar itens (mesmo acesso que o orçamento)
CREATE POLICY "Users can view budget items" ON public.budget_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.budgets b
            WHERE b.id = budget_items.budget_id
            AND b.user_id = auth.uid()
        )
    );

-- Política para criar itens
CREATE POLICY "Users can create budget items" ON public.budget_items
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.budgets b
            WHERE b.id = budget_items.budget_id
            AND b.user_id = auth.uid()
        )
    );

-- Política para atualizar itens
CREATE POLICY "Users can update budget items" ON public.budget_items
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.budgets b
            WHERE b.id = budget_items.budget_id
            AND b.user_id = auth.uid()
        )
    );

-- Política para deletar itens
CREATE POLICY "Users can delete budget items" ON public.budget_items
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.budgets b
            WHERE b.id = budget_items.budget_id
            AND b.user_id = auth.uid()
        )
    );

-- 8. Migrar dados existentes para a nova estrutura
-- Criar itens baseados nos campos existentes da tabela budgets
INSERT INTO public.budget_items (budget_id, item_type, description, quantity, unit, unit_price, notes)
SELECT 
    id as budget_id,
    'servico_geo' as item_type,
    'Serviço de Georreferenciamento' as description,
    1 as quantity,
    'serviço' as unit,
    COALESCE(total, 0) as unit_price,
    CONCAT(
        'Propriedade: ', COALESCE(property_name, 'Não informada'),
        ' | Área: ', COALESCE(property_area, 0), ' ha',
        CASE WHEN vertices_count IS NOT NULL THEN CONCAT(' | Vértices: ', vertices_count) ELSE '' END,
        CASE WHEN additional_notes IS NOT NULL AND additional_notes != '' THEN CONCAT(' | ', additional_notes) ELSE '' END
    ) as notes
FROM public.budgets
WHERE COALESCE(total, 0) > 0;

-- 9. Criar tabela de templates de itens (para facilitar adição de itens comuns)
CREATE TABLE IF NOT EXISTS public.budget_item_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    item_type budget_item_type NOT NULL,
    description TEXT NOT NULL,
    unit VARCHAR(50),
    unit_price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para templates
CREATE INDEX idx_budget_item_templates_user_id ON public.budget_item_templates(user_id);
CREATE INDEX idx_budget_item_templates_type ON public.budget_item_templates(item_type);

-- RLS para templates
ALTER TABLE public.budget_item_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their templates" ON public.budget_item_templates
    FOR ALL
    USING (auth.uid() = user_id);

-- 10. Inserir alguns templates padrão
INSERT INTO public.budget_item_templates (user_id, item_type, description, unit, unit_price)
SELECT DISTINCT 
    b.user_id,
    t.item_type,
    t.description,
    t.unit,
    t.unit_price
FROM public.budgets b
CROSS JOIN (
    VALUES 
        ('insumo'::budget_item_type, 'Marco de concreto', 'unidade', 25.00),
        ('insumo'::budget_item_type, 'Placa de identificação', 'unidade', 80.00),
        ('deslocamento'::budget_item_type, 'Combustível', 'km', 1.20),
        ('deslocamento'::budget_item_type, 'Pedágio', 'unidade', 15.00),
        ('hospedagem'::budget_item_type, 'Diária hotel', 'diária', 150.00),
        ('alimentacao'::budget_item_type, 'Refeição', 'unidade', 35.00),
        ('outros'::budget_item_type, 'Taxa de ART', 'unidade', 250.00)
) AS t(item_type, description, unit, unit_price)
WHERE EXISTS (SELECT 1 FROM public.budgets WHERE user_id = b.user_id LIMIT 1);

-- Instruções
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== ESTRUTURA DE ITENS DE ORÇAMENTO CRIADA ===';
    RAISE NOTICE '1. Tabela budget_items criada com tipos variados';
    RAISE NOTICE '2. Triggers para atualização automática de totais';
    RAISE NOTICE '3. RLS configurado para segurança';
    RAISE NOTICE '4. Dados existentes migrados';
    RAISE NOTICE '5. Templates de itens criados';
    RAISE NOTICE '============================================';
END $$;