-- Limitar para apenas um link por usuário

-- 1. Remover links extras mantendo apenas o mais recente por usuário
DELETE FROM public.budget_form_links
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id) id
    FROM public.budget_form_links
    ORDER BY user_id, created_at DESC
);

-- 2. Adicionar constraint único para garantir apenas um link por usuário
ALTER TABLE public.budget_form_links
DROP CONSTRAINT IF EXISTS unique_user_link;

ALTER TABLE public.budget_form_links
ADD CONSTRAINT unique_user_link UNIQUE (user_id);

-- 3. Modificar a função de criar link padrão para não criar duplicatas
CREATE OR REPLACE FUNCTION create_default_form_link() RETURNS TRIGGER AS $$
BEGIN
    -- Apenas criar se o usuário ainda não tem um link
    IF NOT EXISTS (
        SELECT 1 FROM public.budget_form_links WHERE user_id = NEW.id
    ) THEN
        INSERT INTO public.budget_form_links (
            user_id,
            slug,
            title,
            description
        )
        VALUES (
            NEW.id,
            generate_unique_slug(COALESCE(NEW.company_name, NEW.full_name, 'orcamento')),
            'Solicitar Orçamento - ' || COALESCE(NEW.company_name, NEW.full_name, 'OnGeo'),
            'Preencha o formulário abaixo para solicitar um orçamento personalizado.'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Verificar quantos links cada usuário tem
SELECT 
    user_id,
    COUNT(*) as link_count,
    array_agg(slug ORDER BY created_at DESC) as slugs
FROM public.budget_form_links
GROUP BY user_id
HAVING COUNT(*) > 1
ORDER BY link_count DESC;

-- 5. Mostrar estatísticas finais
SELECT 
    COUNT(DISTINCT user_id) as usuarios_com_links,
    COUNT(*) as total_links,
    CASE 
        WHEN COUNT(*) = COUNT(DISTINCT user_id) 
        THEN 'OK - Cada usuário tem apenas um link'
        ELSE 'ERRO - Alguns usuários têm múltiplos links'
    END as status
FROM public.budget_form_links;

-- Instruções
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== RESTRIÇÃO APLICADA ===';
    RAISE NOTICE '1. Links duplicados foram removidos (mantido o mais recente)';
    RAISE NOTICE '2. Constraint única adicionada (user_id)';
    RAISE NOTICE '3. Cada usuário agora pode ter apenas 1 link';
    RAISE NOTICE '==========================';
END $$;