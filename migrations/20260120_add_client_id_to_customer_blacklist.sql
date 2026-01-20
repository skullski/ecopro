-- Migration: Add client_id column to customer_blacklist
ALTER TABLE customer_blacklist ADD COLUMN IF NOT EXISTS client_id INTEGER;
CREATE INDEX IF NOT EXISTS idx_customer_blacklist_client_id ON customer_blacklist(client_id);