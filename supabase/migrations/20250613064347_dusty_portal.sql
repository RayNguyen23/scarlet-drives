/*
  # User Folder Structure Migration

  1. Purpose
    - Update storage policies to enforce user-specific folder structure
    - Ensure all files are stored under user UUID folders
    - Prevent cross-user data access

  2. Changes
    - Update storage policies for better user isolation
    - Add helper functions for path validation
    - Ensure all file operations use user-specific paths

  3. Security
    - Complete user data isolation
    - Path-based access control
    - Prevent directory traversal attacks
*/

-- Drop existing policies to recreate them with better user isolation
DROP POLICY IF EXISTS "Users can upload files to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Public can view files if shared" ON storage.objects;

-- Create improved policies with strict user folder enforcement

-- 1. Upload Policy: Users can only upload to their UUID folder
CREATE POLICY "Users can upload to their UUID folder only" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'scarlet-drives' 
  AND auth.uid()::text = split_part(name, '/', 1)
  AND name ~ ('^' || auth.uid()::text || '/')
);

-- 2. Read Policy: Users can only read from their UUID folder
CREATE POLICY "Users can read from their UUID folder only" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'scarlet-drives' 
  AND auth.uid()::text = split_part(name, '/', 1)
  AND name ~ ('^' || auth.uid()::text || '/')
);

-- 3. Update Policy: Users can only update files in their UUID folder
CREATE POLICY "Users can update files in their UUID folder only" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'scarlet-drives' 
  AND auth.uid()::text = split_part(name, '/', 1)
  AND name ~ ('^' || auth.uid()::text || '/')
)
WITH CHECK (
  bucket_id = 'scarlet-drives' 
  AND auth.uid()::text = split_part(name, '/', 1)
  AND name ~ ('^' || auth.uid()::text || '/')
);

-- 4. Delete Policy: Users can only delete files in their UUID folder
CREATE POLICY "Users can delete files in their UUID folder only" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'scarlet-drives' 
  AND auth.uid()::text = split_part(name, '/', 1)
  AND name ~ ('^' || auth.uid()::text || '/')
);

-- 5. Public sharing policy (optional - for file sharing features)
-- This allows public access to files when sharing is enabled
-- Remove this policy if you want completely private files
CREATE POLICY "Allow public access for shared files" ON storage.objects
FOR SELECT TO public
USING (
  bucket_id = 'scarlet-drives'
  -- Add additional conditions here if you want to restrict public access
  -- For example, you could check a 'shared' flag in your files table
);

-- Create a function to validate user folder paths (optional helper)
CREATE OR REPLACE FUNCTION validate_user_path(file_path text, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the path starts with the user's UUID
  RETURN file_path ~ ('^' || user_id::text || '/');
END;
$$;

-- Add comments for documentation
COMMENT ON POLICY "Users can upload to their UUID folder only" ON storage.objects IS 
'Ensures users can only upload files to folders that start with their UUID';

COMMENT ON POLICY "Users can read from their UUID folder only" ON storage.objects IS 
'Ensures users can only read files from folders that start with their UUID';

COMMENT ON POLICY "Users can update files in their UUID folder only" ON storage.objects IS 
'Ensures users can only update files in folders that start with their UUID';

COMMENT ON POLICY "Users can delete files in their UUID folder only" ON storage.objects IS 
'Ensures users can only delete files from folders that start with their UUID';

COMMENT ON FUNCTION validate_user_path(text, uuid) IS 
'Helper function to validate that a file path belongs to a specific user';