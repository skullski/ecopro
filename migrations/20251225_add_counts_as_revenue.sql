-- Add counts_as_revenue flag to order_statuses table
-- This allows users to mark which custom statuses should count towards revenue/gain calculation

ALTER TABLE order_statuses 
ADD COLUMN IF NOT EXISTS counts_as_revenue BOOLEAN DEFAULT false;

-- Add comment explaining the field
COMMENT ON COLUMN order_statuses.counts_as_revenue IS 'When true, orders with this status are included in revenue calculations';
