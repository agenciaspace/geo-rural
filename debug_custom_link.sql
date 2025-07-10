-- Debug detalhado do custom_link
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar exatamente como está o custom_link na base
SELECT 
    id,
    custom_link,
    length(custom_link) as link_length,
    ascii(substring(custom_link from 1 for 1)) as first_char_ascii,
    ascii(substring(custom_link from -1)) as last_char_ascii,
    custom_link = 'orcamento-1752096006845' as exact_match,
    status,
    created_at
FROM budgets 
WHERE custom_link IS NOT NULL
ORDER BY created_at DESC;

-- 2. Tentar diferentes variações de busca
SELECT 'Teste busca exata' as teste, COUNT(*) as found
FROM budgets 
WHERE custom_link = 'orcamento-1752096006845'

UNION ALL

SELECT 'Teste busca LIKE' as teste, COUNT(*) as found
FROM budgets 
WHERE custom_link LIKE '%orcamento-1752096006845%'

UNION ALL

SELECT 'Teste busca ILIKE' as teste, COUNT(*) as found
FROM budgets 
WHERE custom_link ILIKE '%orcamento-1752096006845%'

UNION ALL

SELECT 'Teste busca trim' as teste, COUNT(*) as found
FROM budgets 
WHERE trim(custom_link) = 'orcamento-1752096006845';

-- 3. Verificar se o orçamento existe com qualquer custom_link
SELECT 
    'Orçamentos com custom_link' as info,
    COUNT(*) as total
FROM budgets 
WHERE custom_link IS NOT NULL;

-- 4. Mostrar todos os custom_links existentes
SELECT 
    id,
    custom_link,
    status,
    created_at
FROM budgets 
WHERE custom_link IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- 5. Verificar RLS status
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'budgets';

-- 6. Se encontrar o orçamento, mostrar dados completos
SELECT *
FROM budgets 
WHERE id = '502d6aa4-5549-41ab-b6de-d4f4138b506b';