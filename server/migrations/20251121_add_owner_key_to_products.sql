-- Add owner_key column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS owner_key TEXT;
-- Optionally, make it unique (uncomment if needed)
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_products_owner_key ON products(owner_key);
