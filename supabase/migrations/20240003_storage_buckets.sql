-- ============================================================
-- Storage buckets + RLS
-- Già applicato su Supabase via MCP
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('pet-photos',    'pet-photos',    false, 5242880,  ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('pet-documents', 'pet-documents', false, 20971520, ARRAY['application/pdf','image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- RLS pet-photos (path: {user_id}/{filename})
CREATE POLICY "photos_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "photos_select" ON storage.objects FOR SELECT USING  (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "photos_update" ON storage.objects FOR UPDATE USING  (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "photos_delete" ON storage.objects FOR DELETE USING  (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS pet-documents
CREATE POLICY "docs_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pet-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "docs_select" ON storage.objects FOR SELECT USING  (bucket_id = 'pet-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "docs_update" ON storage.objects FOR UPDATE USING  (bucket_id = 'pet-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "docs_delete" ON storage.objects FOR DELETE USING  (bucket_id = 'pet-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
