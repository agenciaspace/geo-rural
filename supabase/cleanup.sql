-- Script para limpar tabelas incorretas do Supabase (GeoRural Pro)
-- Execute este script no SQL Editor do Supabase

-- 1. Remover tabelas que podem ter sido criadas de outros projetos
-- (Adicione aqui as tabelas que você identificou como incorretas)

-- Tabelas de outros projetos que podem ter sido criadas incorretamente:

-- E-commerce
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.plans CASCADE;
DROP TABLE IF EXISTS public.coupons CASCADE;
DROP TABLE IF EXISTS public.addresses CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.ratings CASCADE;
DROP TABLE IF EXISTS public.favorites CASCADE;
DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.wishlists CASCADE;
DROP TABLE IF EXISTS public.inventory CASCADE;
DROP TABLE IF EXISTS public.suppliers CASCADE;
DROP TABLE IF EXISTS public.categories_products CASCADE;
DROP TABLE IF EXISTS public.product_images CASCADE;
DROP TABLE IF EXISTS public.shipping CASCADE;
DROP TABLE IF EXISTS public.shipping_methods CASCADE;
DROP TABLE IF EXISTS public.tax_rates CASCADE;
DROP TABLE IF EXISTS public.discounts CASCADE;
DROP TABLE IF EXISTS public.refunds CASCADE;
DROP TABLE IF EXISTS public.returns CASCADE;

-- Blog/CMS
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.tags CASCADE;
DROP TABLE IF EXISTS public.post_tags CASCADE;
DROP TABLE IF EXISTS public.media CASCADE;
DROP TABLE IF EXISTS public.pages CASCADE;
DROP TABLE IF EXISTS public.menus CASCADE;

-- Gestão/CRM
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.memberships CASCADE;
DROP TABLE IF EXISTS public.invitations CASCADE;
DROP TABLE IF EXISTS public.contacts CASCADE;
DROP TABLE IF EXISTS public.leads_crm CASCADE;
DROP TABLE IF EXISTS public.opportunities CASCADE;
DROP TABLE IF EXISTS public.deals CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;

-- Sistema de usuários duplicado
DROP TABLE IF EXISTS public.users CASCADE; -- se houver uma tabela users que não seja a auth.users
DROP TABLE IF EXISTS public.profiles CASCADE; -- se for diferente de user_profiles
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.permissions CASCADE;
DROP TABLE IF EXISTS public.role_permissions CASCADE;

-- Sistema de notificações/comunicação
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.chats CASCADE;
DROP TABLE IF EXISTS public.emails CASCADE;
DROP TABLE IF EXISTS public.sms CASCADE;

-- Médico/Saúde
DROP TABLE IF EXISTS public.patients CASCADE;
DROP TABLE IF EXISTS public.doctors CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.clinics CASCADE;
DROP TABLE IF EXISTS public.patient_records CASCADE;
DROP TABLE IF EXISTS public.doctor_availability CASCADE;
DROP TABLE IF EXISTS public.notification_logs CASCADE;
DROP TABLE IF EXISTS public.notification_preferences CASCADE;
DROP TABLE IF EXISTS public.notification_queue CASCADE;
DROP TABLE IF EXISTS public.patient_record_audit CASCADE;
DROP TABLE IF EXISTS public.email_templates CASCADE;
DROP TABLE IF EXISTS public.smtp_config CASCADE;

-- Sistema genérico
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.configurations CASCADE;
DROP TABLE IF EXISTS public.analytics CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.api_keys CASCADE;
DROP TABLE IF EXISTS public.webhooks CASCADE;
DROP TABLE IF EXISTS public.integrations CASCADE;
DROP TABLE IF EXISTS public.exports CASCADE;
DROP TABLE IF EXISTS public.imports CASCADE;
DROP TABLE IF EXISTS public.backups CASCADE;
DROP TABLE IF EXISTS public.logs CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.tokens CASCADE;

-- Outras tabelas comuns
DROP TABLE IF EXISTS public.files CASCADE;
DROP TABLE IF EXISTS public.uploads CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.attachments CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.calendar CASCADE;
DROP TABLE IF EXISTS public.schedules CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;

-- 2. Remover funções incorretas
DROP FUNCTION IF EXISTS public.handle_user_signup CASCADE;
DROP FUNCTION IF EXISTS public.create_profile CASCADE;
DROP FUNCTION IF EXISTS public.update_profile CASCADE;
DROP FUNCTION IF EXISTS public.delete_user CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role CASCADE;
DROP FUNCTION IF EXISTS public.check_permissions CASCADE;

-- 3. Remover triggers incorretos (verificando se as tabelas existem)
DO $$
BEGIN
    -- Trigger em auth.users (sempre existe)
    DROP TRIGGER IF EXISTS on_user_created ON auth.users;
    
    -- Triggers em tabelas que podem não existir
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        DROP TRIGGER IF EXISTS update_user_updated_at ON public.profiles;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        DROP TRIGGER IF EXISTS update_user_updated_at ON public.user_profiles;
    END IF;
END $$;

-- 4. Remover políticas RLS incorretas (se existirem)
-- As políticas serão removidas automaticamente quando as tabelas forem removidas

-- 5. Verificar se as tabelas corretas do GeoRural Pro existem
-- Se não existirem, o schema.sql deve ser executado novamente

SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 6. Listar as tabelas que devem existir no GeoRural Pro:
-- Estas tabelas DEVEM existir após a limpeza:
-- ✓ leads
-- ✓ user_profiles  
-- ✓ budgets
-- ✓ gnss_analyses
-- ✓ transactions
-- ✓ activity_logs

-- Verificar se as tabelas corretas existem
DO $$
DECLARE
    required_tables TEXT[] := ARRAY['leads', 'user_profiles', 'budgets', 'gnss_analyses', 'transactions', 'activity_logs'];
    table_name TEXT;
    missing_tables TEXT[] := ARRAY[]::TEXT[];
BEGIN
    FOREACH table_name IN ARRAY required_tables
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = table_name
        ) THEN
            missing_tables := array_append(missing_tables, table_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE NOTICE 'ATENÇÃO: As seguintes tabelas obrigatórias estão faltando: %', array_to_string(missing_tables, ', ');
        RAISE NOTICE 'Execute o arquivo schema.sql para criar as tabelas necessárias.';
    ELSE
        RAISE NOTICE 'Todas as tabelas obrigatórias do GeoRural Pro estão presentes!';
    END IF;
END $$;

-- 7. Resetar sequências (se necessário)
-- Se você quiser resetar os IDs para começar do 1 novamente (CUIDADO: só faça isso em desenvolvimento)
-- SELECT setval(pg_get_serial_sequence('leads', 'id'), 1, false);

-- Mensagem final
DO $$
BEGIN
    RAISE NOTICE 'Limpeza do banco de dados concluída!';
    RAISE NOTICE 'Verifique a lista de tabelas acima e execute schema.sql se necessário.';
END $$; 