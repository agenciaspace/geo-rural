-- Políticas RLS para permitir acesso público aos orçamentos via custom_link
-- Execute este script no SQL Editor do Supabase

-- Política para permitir leitura pública de orçamentos via custom_link
CREATE POLICY "Allow public read access to budgets via custom_link" 
ON budgets FOR SELECT 
USING (custom_link IS NOT NULL);

-- Política para permitir atualização pública de orçamentos via custom_link (para aprovação/rejeição)
CREATE POLICY "Allow public update to budgets via custom_link" 
ON budgets FOR UPDATE 
USING (custom_link IS NOT NULL);

-- Verificar se as políticas foram criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'budgets';