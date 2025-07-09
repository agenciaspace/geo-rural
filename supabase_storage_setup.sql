-- =============================================
-- OnGeo - Configuração do Storage Bucket
-- =============================================

-- IMPORTANTE: Execute estes comandos no painel do Supabase
-- Storage > Settings > Policies

-- 1. Criar o bucket 'gnss-files' (via interface do Supabase)
--    - Vá para Storage no painel
--    - Clique em "New bucket"
--    - Nome: gnss-files
--    - Public: false (privado)

-- 2. Políticas para o bucket gnss-files
-- Execute no SQL Editor do Supabase:

-- Política para upload de arquivos
CREATE POLICY "Usuários podem fazer upload de arquivos GNSS" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'gnss-files' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Política para visualizar arquivos
CREATE POLICY "Usuários podem ver seus próprios arquivos GNSS" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'gnss-files' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Política para deletar arquivos
CREATE POLICY "Usuários podem deletar seus próprios arquivos GNSS" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'gnss-files' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Política para atualizar arquivos
CREATE POLICY "Usuários podem atualizar seus próprios arquivos GNSS" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'gnss-files' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- =============================================
-- VERIFICAÇÃO
-- =============================================

-- Verificar se o bucket foi criado
SELECT * FROM storage.buckets WHERE name = 'gnss-files';

-- Verificar políticas do storage
SELECT * FROM storage.policies WHERE bucket_id = 'gnss-files';