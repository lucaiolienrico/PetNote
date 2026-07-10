-- Storage RLS — pet-photos
-- Path: {user_id}/{filename}
CREATE POLICY "photos_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'pet-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "photos_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'pet-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "photos_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'pet-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "photos_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'pet-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage RLS — pet-documents
CREATE POLICY "docs_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'pet-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "docs_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'pet-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "docs_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'pet-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "docs_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'pet-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
