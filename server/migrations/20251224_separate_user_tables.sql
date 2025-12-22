-- Create proper user account separation: admins, clients, staff tables
-- Drop sellers and users tables if they exist

-- Step 1: Create admins table if not exists
CREATE TABLE IF NOT EXISTS admins (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  user_type VARCHAR(50) DEFAULT 'admin',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 2: Ensure clients table has proper schema
ALTER TABLE clients ADD COLUMN IF NOT EXISTS user_type VARCHAR(50) DEFAULT 'client';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
UPDATE clients SET user_type = 'client' WHERE user_type IS NULL;

-- Step 3: Insert admin@ecopro.com into admins table
INSERT INTO admins (email, password, full_name, role, user_type, is_verified, created_at, updated_at)
VALUES ('admin@ecopro.com', 'admin123', 'Admin User', 'admin', 'admin', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Step 4: Insert skull@gmail.com into clients table
INSERT INTO clients (email, password, name, role, user_type, is_verified, created_at, updated_at)
VALUES ('skull@gmail.com', 'anaimad', 'skull', 'client', 'client', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Step 5: Drop users and sellers tables if they exist
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS sellers CASCADE;

-- Verify
SELECT 'admins' as table_name, COUNT(*) as count FROM admins
UNION ALL
SELECT 'clients', COUNT(*) FROM clients
UNION ALL
SELECT 'staff', COUNT(*) FROM staff;
