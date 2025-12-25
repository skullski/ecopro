-- Add lock fields to users table (for honeypot auto-blocking)
-- The is_locked field may already exist but locked_reason/locked_at might not

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_by TEXT; -- 'auto_honeypot', 'admin', etc.

-- Index for quick lookup of locked users
CREATE INDEX IF NOT EXISTS idx_users_is_locked ON users(is_locked);
CREATE INDEX IF NOT EXISTS idx_users_locked_by ON users(locked_by) WHERE locked_by IS NOT NULL;
