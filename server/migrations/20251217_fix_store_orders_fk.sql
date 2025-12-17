-- Fix store_orders foreign key to reference client_store_products instead of store_products
-- This ensures orders can be created for products in client_store_products table

-- Drop the old constraint
ALTER TABLE IF EXISTS store_orders 
DROP CONSTRAINT IF EXISTS store_orders_product_id_fkey;

-- Add new constraint that references client_store_products
ALTER TABLE store_orders
ADD CONSTRAINT store_orders_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES client_store_products(id) ON DELETE CASCADE;

-- Also ensure the table structure has all needed columns
ALTER TABLE IF EXISTS store_orders
ADD COLUMN IF NOT EXISTS id SERIAL PRIMARY KEY,
ADD COLUMN IF NOT EXISTS product_id INTEGER NOT NULL,
ADD COLUMN IF NOT EXISTS client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_price NUMERIC(10, 2) NOT NULL,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS shipping_address TEXT,
ADD COLUMN IF NOT EXISTS billing_address TEXT,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'unpaid',
ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(255),
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_store_orders_client_id ON store_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_store_orders_product_id ON store_orders(product_id);
