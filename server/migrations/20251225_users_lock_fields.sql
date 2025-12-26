-- Add lock fields to clients and admins tables (for honeypot auto-blocking)
-- The is_locked field may already exist but locked_reason/locked_at might not

-- For clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS locked_reason TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS locked_by TEXT;

-- For admins table  
ALTER TABLE admins ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS locked_reason TEXT;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS locked_by TEXT;

-- Index for quick lookup of locked users
CREATE INDEX IF NOT EXISTS idx_clients_is_locked ON clients(is_locked);
CREATE INDEX IF NOT EXISTS idx_clients_locked_by ON clients(locked_by) WHERE locked_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_admins_is_locked ON admins(is_locked);
