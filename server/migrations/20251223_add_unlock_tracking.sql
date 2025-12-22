-- Add unlock tracking fields for manual account unlocks
-- Allows admins to unlock locked accounts with notes and extend subscriptions

-- Add columns to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS unlocked_by_admin_id BIGINT REFERENCES admins(id) ON DELETE SET NULL;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS unlock_reason TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS unlocked_at TIMESTAMP;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS subscription_extended_until TIMESTAMP;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_paid_temporarily BOOLEAN DEFAULT false;

-- Create indexes for queries
CREATE INDEX IF NOT EXISTS idx_clients_unlocked_by_admin ON clients(unlocked_by_admin_id);
CREATE INDEX IF NOT EXISTS idx_clients_is_paid_temporarily ON clients(is_paid_temporarily);
