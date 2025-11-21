-- Add vendor_id column to products table for marketplace compatibility
ALTER TABLE products ADD COLUMN IF NOT EXISTS vendor_id VARCHAR(255);
