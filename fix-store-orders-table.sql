-- Migration: Ensure store_orders table has all required columns for public store order creation
ALTER TABLE store_orders
  ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(32),
  ADD COLUMN IF NOT EXISTS shipping_address TEXT,
  ADD COLUMN IF NOT EXISTS status VARCHAR(32) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(32) DEFAULT 'unpaid';
-- created_at should already exist, but add if missing
ALTER TABLE store_orders
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
