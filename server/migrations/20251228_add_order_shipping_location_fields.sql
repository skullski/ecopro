-- Add structured Algeria shipping location fields for better address UX (wilaya/commune/hai)
-- Safe: all columns are nullable and do not change existing behavior.

ALTER TABLE store_orders
  ADD COLUMN IF NOT EXISTS shipping_wilaya_id INTEGER,
  ADD COLUMN IF NOT EXISTS shipping_commune_id INTEGER,
  ADD COLUMN IF NOT EXISTS shipping_hai TEXT;

CREATE INDEX IF NOT EXISTS idx_store_orders_shipping_commune_id ON store_orders(shipping_commune_id);
CREATE INDEX IF NOT EXISTS idx_store_orders_shipping_wilaya_id ON store_orders(shipping_wilaya_id);
