-- Add lock_type column to clients table to differentiate between payment and critical locks
-- Payment locks: Account can login but dashboard is blurred, must enter voucher code
-- Critical locks: Account cannot login at all

ALTER TABLE clients ADD COLUMN IF NOT EXISTS lock_type VARCHAR(50) DEFAULT 'critical';

-- Update existing locked accounts to 'critical' (for backward compatibility)
UPDATE clients SET lock_type = 'critical' WHERE is_locked = TRUE AND lock_type IS NULL;

-- Add comment
COMMENT ON COLUMN clients.lock_type IS 'Type of lock: payment (can login, blur overlay) or critical (cannot login)';
