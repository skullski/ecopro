-- Consolidate authentication to use only clients, sellers, and admins tables
-- Remove users table and migrate accounts to respective tables

-- Step 1: Add user_type column to clients table if it doesn't exist
ALTER TABLE clients ADD COLUMN IF NOT EXISTS user_type VARCHAR(50) DEFAULT 'client';

-- Step 2: Add is_verified column to clients table if it doesn't exist  
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Step 3: Update existing clients to have user_type = 'client'
UPDATE clients SET user_type = 'client' WHERE user_type IS NULL;

-- Step 4: Migrate from users table if it exists
DO $$
DECLARE
  clients_pw_col TEXT;
  users_pw_col TEXT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    RETURN;
  END IF;

  -- Support both schemas:
  -- - older: password
  -- - current: password_hash
  clients_pw_col := CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'password_hash') THEN 'password_hash'
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'password') THEN 'password'
    ELSE NULL
  END;

  users_pw_col := CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_hash') THEN 'password_hash'
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password') THEN 'password'
    ELSE NULL
  END;

  IF clients_pw_col IS NULL OR users_pw_col IS NULL THEN
    RAISE NOTICE 'Skipping users->clients auth migration: password column not found';
    RETURN;
  END IF;

  -- Insert skull@gmail.com into clients table if not exists
  EXECUTE format(
    'INSERT INTO clients (email, %I, name, role, user_type, is_verified, created_at, updated_at)
     SELECT email, %I, COALESCE(name, ''Store Owner''), ''client'', ''client'', COALESCE(is_verified, false), COALESCE(created_at, NOW()), COALESCE(updated_at, NOW())
     FROM users
     WHERE email = ''skull@gmail.com'' AND NOT EXISTS (SELECT 1 FROM clients WHERE email = ''skull@gmail.com'')
     ON CONFLICT DO NOTHING',
    clients_pw_col,
    users_pw_col
  );

  -- Insert admin@ecopro.com if it exists in users table
  EXECUTE format(
    'INSERT INTO clients (email, %I, name, role, user_type, is_verified, created_at, updated_at)
     SELECT email, %I, COALESCE(name, ''Admin User''), ''admin'', ''admin'', COALESCE(is_verified, false), COALESCE(created_at, NOW()), COALESCE(updated_at, NOW())
     FROM users
     WHERE email = ''admin@ecopro.com'' AND NOT EXISTS (SELECT 1 FROM clients WHERE email = ''admin@ecopro.com'')
     ON CONFLICT DO NOTHING',
    clients_pw_col,
    users_pw_col
  );

  -- Drop the users table
  DROP TABLE IF EXISTS users CASCADE;
END $$;

-- Confirm migration success
SELECT COUNT(*) as client_count FROM clients;

