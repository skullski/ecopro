-- Remove the status CHECK constraint to allow custom statuses
-- The order_statuses table now handles custom status validation at the application level

ALTER TABLE store_orders DROP CONSTRAINT IF EXISTS store_orders_status_check;

-- Add a comment to explain why the constraint was removed
COMMENT ON COLUMN store_orders.status IS 'Order status - can be built-in (pending, confirmed, processing, shipped, delivered, cancelled, refunded) or custom statuses defined in order_statuses table';
