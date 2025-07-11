-- Adicionar coluna total_spent se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'clients' 
        AND column_name = 'total_spent'
    ) THEN
        ALTER TABLE public.clients 
        ADD COLUMN total_spent DECIMAL(10, 2) DEFAULT 0;
        
        RAISE NOTICE 'Coluna total_spent adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna total_spent já existe.';
    END IF;
    
    -- Adicionar coluna last_budget_date se não existir
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'clients' 
        AND column_name = 'last_budget_date'
    ) THEN
        ALTER TABLE public.clients 
        ADD COLUMN last_budget_date TIMESTAMP WITH TIME ZONE;
        
        RAISE NOTICE 'Coluna last_budget_date adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna last_budget_date já existe.';
    END IF;
END $$;

-- Atualizar os totais de clientes existentes baseado nos orçamentos
UPDATE public.clients c
SET 
    total_spent = COALESCE((
        SELECT SUM(CAST(b.total AS DECIMAL(10,2)))
        FROM public.budgets b
        WHERE b.client_id = c.id
        AND b.status = 'active'
    ), 0),
    total_budgets = COALESCE((
        SELECT COUNT(*)
        FROM public.budgets b
        WHERE b.client_id = c.id
        AND b.status = 'active'
    ), 0),
    last_budget_date = (
        SELECT MAX(b.created_at)
        FROM public.budgets b
        WHERE b.client_id = c.id
    )
WHERE c.is_active = true;

-- Mostrar estatísticas atualizadas
SELECT 
    COUNT(*) as total_clients,
    COUNT(CASE WHEN total_spent > 0 THEN 1 END) as clients_with_budgets,
    SUM(total_spent) as total_revenue,
    AVG(total_spent) as avg_spent_per_client
FROM public.clients
WHERE is_active = true;