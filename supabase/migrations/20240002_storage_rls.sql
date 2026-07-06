-- ============================================================
-- Storage RLS — pet-photos bucket
-- Struttura path: {user_id}/{pet_id}/{filename}
-- ============================================================

CREATE POLICY "photos_owner_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'pet-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "photos_owner_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'pet-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "photos_owner_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'pet-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "photos_owner_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'pet-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- Storage RLS — pet-documents bucket (V2)
-- ============================================================

CREATE POLICY "documents_owner_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'pet-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "documents_owner_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'pet-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "documents_owner_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'pet-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "documents_owner_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'pet-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
