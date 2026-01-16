-- Add account locking feature for admins and clients
-- Allows admins to lock accounts preventing login

-- Fresh database safety: some environments create `admins` later.
-- Ensure the table exists so this migration is idempotent.
CREATE TABLE IF NOT EXISTS admins (
	id BIGSERIAL PRIMARY KEY,
	email VARCHAR(255) NOT NULL UNIQUE,
	password VARCHAR(255) NOT NULL,
	full_name VARCHAR(255),
	role VARCHAR(50) DEFAULT 'admin',
	user_type VARCHAR(50) DEFAULT 'admin',
	is_verified BOOLEAN DEFAULT false,
	is_locked BOOLEAN DEFAULT false,
	locked_reason TEXT,
	locked_at TIMESTAMP,
	locked_by_admin_id BIGINT REFERENCES admins(id) ON DELETE SET NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- Add is_locked column to admins table
ALTER TABLE admins ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS locked_reason TEXT;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP;

-- Add is_locked column to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS locked_reason TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_admins_is_locked ON admins(is_locked);
CREATE INDEX IF NOT EXISTS idx_clients_is_locked ON clients(is_locked);

-- Add created by admin field for audit trail
ALTER TABLE admins ADD COLUMN IF NOT EXISTS locked_by_admin_id BIGINT REFERENCES admins(id) ON DELETE SET NULL;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS locked_by_admin_id BIGINT REFERENCES admins(id) ON DELETE SET NULL;
