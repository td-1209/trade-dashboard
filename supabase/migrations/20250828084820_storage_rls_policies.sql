-- Storage RLS policies for public image access
-- Note: These policies may not work in local development due to permission restrictions
-- Use service key for local development, proper policies for production

DO $$
BEGIN
  -- Check if policies already exist to avoid errors
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public image upload') THEN
    CREATE POLICY "Public image upload" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'images');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public image view') THEN
    CREATE POLICY "Public image view" ON storage.objects  
    FOR SELECT USING (bucket_id = 'images');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public image update') THEN
    CREATE POLICY "Public image update" ON storage.objects
    FOR UPDATE USING (bucket_id = 'images') 
    WITH CHECK (bucket_id = 'images');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public image delete') THEN
    CREATE POLICY "Public image delete" ON storage.objects
    FOR DELETE USING (bucket_id = 'images');
  END IF;
END $$;