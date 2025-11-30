-- Add store template and branding fields to client_store_settings
ALTER TABLE IF EXISTS client_store_settings
  ADD COLUMN IF NOT EXISTS template VARCHAR(24) DEFAULT 'classic',
  ADD COLUMN IF NOT EXISTS banner_url TEXT,
  ADD COLUMN IF NOT EXISTS currency_code VARCHAR(16) DEFAULT 'DZD';

-- Helpful index for querying by client_id already exists; no changes needed
