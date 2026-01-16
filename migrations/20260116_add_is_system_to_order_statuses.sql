-- Add is_system flag to order_statuses (missing in initial migration)

ALTER TABLE order_statuses
ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT false;

-- Backfill: treat default/system statuses as system
UPDATE order_statuses
SET is_system = true
WHERE (is_default = true OR key IN (
  'pending','confirmed','completed','cancelled','at_delivery',
  'processing','shipped','delivered','followup','didnt_pickup'
))
  AND (is_system IS DISTINCT FROM true);
