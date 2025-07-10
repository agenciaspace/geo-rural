-- Habilitar RLS para budgets também
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Verificar se foi habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'budgets';