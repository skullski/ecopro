-- Add detailed shipping fields to marketplace_orders for guest checkout support
-- This allows guest buyers to provide shipping info without creating an account

ALTER TABLE marketplace_orders 
  ADD COLUMN IF NOT EXISTS shipping_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS shipping_line1 VARCHAR(255),
  ADD COLUMN IF NOT EXISTS shipping_line2 VARCHAR(255),
  ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS shipping_state VARCHAR(100),
  ADD COLUMN IF NOT EXISTS shipping_postal_code VARCHAR(20),
  ADD COLUMN IF NOT EXISTS shipping_country VARCHAR(100),
  ADD COLUMN IF NOT EXISTS shipping_phone VARCHAR(50);

-- Make buyer_id nullable to allow guest orders
ALTER TABLE marketplace_orders 
  ALTER COLUMN buyer_id DROP NOT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_created_at ON marketplace_orders(created_at DESC);
