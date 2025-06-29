-- Comando direto para apagar tabelas incorretas do Supabase (GeoRural Pro)
-- Execute este comando no SQL Editor do Supabase

-- ⚠️  ATENÇÃO: Este comando irá apagar as tabelas listadas abaixo
-- Tabelas que SERÃO MANTIDAS (GeoRural Pro):
-- ✅ activity_logs
-- ✅ budgets  
-- ✅ gnss_analyses
-- ✅ leads
-- ✅ transactions
-- ✅ user_profiles

-- Apagar tabelas de sistema médico/saúde
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.clinics CASCADE;
DROP TABLE IF EXISTS public.doctor_availability CASCADE;
DROP TABLE IF EXISTS public.doctors CASCADE;
DROP TABLE IF EXISTS public.patient_record_audit CASCADE;
DROP TABLE IF EXISTS public.patient_records CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;

-- Apagar tabelas de notificações/comunicação genéricas
DROP TABLE IF EXISTS public.notification_logs CASCADE;
DROP TABLE IF EXISTS public.notification_preferences CASCADE;
DROP TABLE IF EXISTS public.notification_queue CASCADE;
DROP TABLE IF EXISTS public.email_templates CASCADE;
DROP TABLE IF EXISTS public.smtp_config CASCADE;

-- Apagar tabelas de sistema genérico
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- Verificar tabelas restantes
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Confirmar que as tabelas corretas do GeoRural Pro existem
DO $$
DECLARE
    required_tables TEXT[] := ARRAY['activity_logs', 'budgets', 'gnss_analyses', 'leads', 'transactions', 'user_profiles'];
    existing_tables TEXT[] := ARRAY[]::TEXT[];
    table_name TEXT;
BEGIN
    -- Verificar quais tabelas existem
    FOR table_name IN 
        SELECT t.table_name 
        FROM information_schema.tables t
        WHERE t.table_schema = 'public' 
        AND t.table_type = 'BASE TABLE'
        AND t.table_name = ANY(required_tables)
    LOOP
        existing_tables := array_append(existing_tables, table_name);
    END LOOP;
    
    RAISE NOTICE '✅ Tabelas do GeoRural Pro encontradas: %', array_to_string(existing_tables, ', ');
    
    -- Verificar se alguma está faltando
    FOREACH table_name IN ARRAY required_tables
    LOOP
        IF NOT (table_name = ANY(existing_tables)) THEN
            RAISE NOTICE '⚠️  Tabela faltando: % - Execute schema.sql para criar', table_name;
        END IF;
    END LOOP;
END $$;

RAISE NOTICE '🧹 Limpeza concluída! Tabelas incorretas removidas.'; 