-- Consolidate authentication to use only clients, sellers, and admins tables
-- Remove users table and migrate skull account to clients table

-- Step 1: Add user_type column to clients table if it doesn't exist
ALTER TABLE clients ADD COLUMN IF NOT EXISTS user_type VARCHAR(50) DEFAULT 'client';

-- Step 2: Add is_verified column to clients table if it doesn't exist  
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Step 3: Update existing clients to have user_type = 'client'
UPDATE clients SET user_type = 'client' WHERE user_type IS NULL;

-- Step 4: Insert skull@gmail.com into clients table if not exists
INSERT INTO clients (email, password, name, role, user_type, is_verified, created_at, updated_at)
SELECT email, password, COALESCE(name, 'Store Owner'), 'client', 'client', COALESCE(is_verified, false), COALESCE(created_at, NOW()), COALESCE(updated_at, NOW())
FROM users
WHERE email = 'skull@gmail.com' AND NOT EXISTS (
  SELECT 1 FROM clients WHERE email = 'skull@gmail.com'
)
ON CONFLICT DO NOTHING;

-- Step 5: Update admin@ecopro.com if it exists in users table
INSERT INTO clients (email, password, name, role, user_type, is_verified, created_at, updated_at)
SELECT email, password, COALESCE(name, 'Admin User'), 'admin', 'admin', COALESCE(is_verified, false), COALESCE(created_at, NOW()), COALESCE(updated_at, NOW())
FROM users
WHERE email = 'admin@ecopro.com' AND NOT EXISTS (
  SELECT 1 FROM clients WHERE email = 'admin@ecopro.com'
)
ON CONFLICT DO NOTHING;

-- Step 6: Drop the users table
DROP TABLE IF EXISTS users CASCADE;

-- Confirm migration success
SELECT COUNT(*) as client_count FROM clients;
SELECT email, role, user_type FROM clients WHERE email IN ('skull@gmail.com', 'admin@ecopro.com', 'testowner@demo.com');

