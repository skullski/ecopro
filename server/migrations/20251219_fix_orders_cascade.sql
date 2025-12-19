-- Fix the foreign key constraint on store_orders.product_id
-- Orders should NOT be deleted when a product is deleted
-- This preserves order history for accounting/reporting purposes

-- First make product_id nullable (it's currently NOT NULL)
ALTER TABLE store_orders
ALTER COLUMN product_id DROP NOT NULL;

-- Drop the cascading constraint
ALTER TABLE store_orders
DROP CONSTRAINT IF EXISTS store_orders_product_id_fkey;

-- Add the new constraint with SET NULL (allows orders to exist even if product is deleted)
ALTER TABLE store_orders
ADD CONSTRAINT store_orders_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES client_store_products(id) ON DELETE SET NULL;

-- This way:
-- - Deleting a product will NOT delete orders
-- - Orders will have product_id = NULL if their product is deleted
-- - Frontend shows "Deleted Product" via COALESCE(cp.title, 'Deleted Product') in queries
-- - The order history is preserved for accounting/reporting purposes
