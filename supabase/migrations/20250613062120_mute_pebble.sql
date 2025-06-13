/*
  # Add soft delete functionality

  1. Changes
    - Add `is_deleted` column to `files` table
    - Add `is_deleted` column to `folders` table
    - Add `deleted_at` column to both tables for tracking deletion time
    - Set default values for existing records

  2. Security
    - No changes to RLS policies needed as deleted items will be filtered in queries
*/

-- Add is_deleted and deleted_at columns to files table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'files' AND column_name = 'is_deleted'
  ) THEN
    ALTER TABLE files ADD COLUMN is_deleted boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'files' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE files ADD COLUMN deleted_at timestamptz;
  END IF;
END $$;

-- Add is_deleted and deleted_at columns to folders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'folders' AND column_name = 'is_deleted'
  ) THEN
    ALTER TABLE folders ADD COLUMN is_deleted boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'folders' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE folders ADD COLUMN deleted_at timestamptz;
  END IF;
END $$;

-- Create indexes for better performance on soft delete queries
CREATE INDEX IF NOT EXISTS idx_files_is_deleted ON files(is_deleted);
CREATE INDEX IF NOT EXISTS idx_folders_is_deleted ON folders(is_deleted);
CREATE INDEX IF NOT EXISTS idx_files_deleted_at ON files(deleted_at);
CREATE INDEX IF NOT EXISTS idx_folders_deleted_at ON folders(deleted_at);