-- Add sizes/colors and shipping options to stock products
-- (Used by stock add-product UI and copied into store products metadata)

ALTER TABLE client_stock_products
  ADD COLUMN IF NOT EXISTS sizes TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS colors TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS shipping_mode VARCHAR(32) DEFAULT 'delivery_pricing' CHECK (shipping_mode IN ('delivery_pricing', 'flat', 'free')),
  ADD COLUMN IF NOT EXISTS shipping_flat_fee DECIMAL(10, 2);

CREATE INDEX IF NOT EXISTS idx_client_stock_shipping_mode ON client_stock_products(shipping_mode);
