-- Fix store_orders client_id foreign key to allow NULL for public orders
-- Public customers shouldn't need to be registered users

-- Drop the old foreign key constraint on client_id
ALTER TABLE IF EXISTS store_orders
DROP CONSTRAINT IF EXISTS store_orders_client_id_fkey;

-- Make client_id nullable and add back the FK constraint as optional
ALTER TABLE IF EXISTS store_orders
ALTER COLUMN client_id DROP NOT NULL;

-- Add the foreign key constraint back, but now it allows NULL
ALTER TABLE IF EXISTS store_orders
ADD CONSTRAINT store_orders_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE SET NULL;

-- Add index on nullable client_id
CREATE INDEX IF NOT EXISTS idx_store_orders_client_id_nullable ON store_orders(client_id) 
WHERE client_id IS NOT NULL;
