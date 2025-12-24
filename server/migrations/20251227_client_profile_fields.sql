-- Add profile/account fields for store owners (clients)
-- Safe/idempotent: uses IF NOT EXISTS

ALTER TABLE clients ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS city TEXT;
