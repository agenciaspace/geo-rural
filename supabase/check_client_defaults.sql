-- Verificar a estrutura da tabela clients e valores padrão

-- 1. Verificar estrutura da coluna total_budgets
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'clients'
AND column_name IN ('total_budgets', 'total_spent');

-- 2. Verificar se há triggers na tabela clients
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table = 'clients';

-- 3. Analisar a situação atual - clientes com contagem incorreta
SELECT 
    c.id,
    c.name,
    c.total_budgets as total_budgets_campo,
    COUNT(b.id) as total_budgets_real,
    c.total_budgets - COUNT(b.id) as diferenca
FROM public.clients c
LEFT JOIN public.budgets b ON b.client_id = c.id
GROUP BY c.id, c.name, c.total_budgets
ORDER BY diferenca DESC, c.name;

-- 4. Verificar se há algum valor padrão sendo aplicado
SELECT 
    c.id,
    c.name,
    c.created_at,
    c.total_budgets,
    c.total_spent,
    EXISTS (SELECT 1 FROM public.budgets WHERE client_id = c.id) as tem_orcamentos
FROM public.clients c
WHERE c.total_budgets > 0
ORDER BY c.created_at DESC
LIMIT 20;