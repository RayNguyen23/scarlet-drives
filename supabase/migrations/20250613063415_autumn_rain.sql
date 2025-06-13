-- Storage bucket policies for 'scarlet-drives' bucket
-- Run these commands in your Supabase SQL Editor

-- 1. Create the storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('scarlet-drives', 'scarlet-drives', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload files to their own folder" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'scarlet-drives' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Policy: Allow authenticated users to view their own files
CREATE POLICY "Users can view their own files" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'scarlet-drives' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. Policy: Allow authenticated users to update their own files
CREATE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'scarlet-drives' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'scarlet-drives' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 6. Policy: Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'scarlet-drives' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 7. Policy: Allow public access to files (for sharing functionality)
-- Note: This allows public read access. Remove if you want private files only.
CREATE POLICY "Public can view files if shared" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'scarlet-drives');

-- 8. Alternative: Private files only (uncomment if you want private access only)
-- DROP POLICY IF EXISTS "Public can view files if shared" ON storage.objects;
-- 
-- CREATE POLICY "Private files only" ON storage.objects
-- FOR SELECT TO authenticated
-- USING (
--   bucket_id = 'scarlet-drives' 
--   AND auth.uid()::text = (storage.foldername(name))[1]
-- );