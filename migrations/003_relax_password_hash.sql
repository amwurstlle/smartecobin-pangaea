-- Relax NOT NULL constraint on users.password_hash to allow profile auto-create
ALTER TABLE IF EXISTS users
  ADD COLUMN IF NOT EXISTS password_hash TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='password_hash'
  ) THEN
    -- Drop NOT NULL if present
    BEGIN
      ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
    EXCEPTION WHEN others THEN
      -- Ignore if constraint not present
      NULL;
    END;
  END IF;
END $$;