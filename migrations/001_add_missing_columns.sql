-- Migration: add columns expected by backend without breaking existing data
-- Safe (idempotent) to run multiple times

-- users table: backend expects name, avatar_url, last_login
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- If a legacy column full_name exists, backfill name from it once
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='full_name'
  ) THEN
    UPDATE users
      SET name = COALESCE(name, full_name)
    WHERE name IS NULL;
  END IF;
END $$;

-- trash_bins table: backend expects field_officer_id and last_updated
ALTER TABLE trash_bins
  ADD COLUMN IF NOT EXISTS field_officer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS last_updated TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Helpful indexes used in queries
CREATE INDEX IF NOT EXISTS idx_trash_bins_field_officer ON trash_bins(field_officer_id);
CREATE INDEX IF NOT EXISTS idx_trash_bins_last_updated ON trash_bins(last_updated DESC);
-- These may already exist, but keep idempotent guards
CREATE INDEX IF NOT EXISTS idx_trash_bins_status ON trash_bins(status);
CREATE INDEX IF NOT EXISTS idx_trash_bins_location ON trash_bins(location);
CREATE INDEX IF NOT EXISTS idx_trash_bins_coords ON trash_bins(latitude, longitude);

-- Ensure RLS is enabled (no-op if already)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trash_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
