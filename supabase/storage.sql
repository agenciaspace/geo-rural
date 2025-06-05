-- Configuração do Storage no Supabase

-- Criar bucket para arquivos GNSS
INSERT INTO storage.buckets (id, name, public)
VALUES ('gnss-files', 'gnss-files', false);

-- Criar bucket para propostas em PDF
INSERT INTO storage.buckets (id, name, public)
VALUES ('proposals', 'proposals', true);

-- Políticas de acesso para gnss-files
CREATE POLICY "Users can upload GNSS files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'gnss-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own GNSS files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'gnss-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own GNSS files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'gnss-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Políticas de acesso para proposals
CREATE POLICY "Users can upload proposals" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'proposals' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own proposals" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'proposals' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Public can view proposals with link" ON storage.objects
  FOR SELECT USING (bucket_id = 'proposals');