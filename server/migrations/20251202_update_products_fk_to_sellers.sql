-- Ensure marketplace_products.seller_id references sellers(id)
-- Create sellers table first if not exists (safety in case migrations ran out of order)
CREATE TABLE IF NOT EXISTS sellers (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Add index for products.seller_id lookups
CREATE INDEX IF NOT EXISTS idx_marketplace_products_seller_id ON marketplace_products(seller_id);

-- Drop existing FK if it points to users
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
     AND tc.table_schema = kcu.table_schema
    WHERE tc.table_name = 'marketplace_products'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND tc.constraint_name = 'marketplace_products_seller_id_fkey'
  ) THEN
    ALTER TABLE marketplace_products
      DROP CONSTRAINT marketplace_products_seller_id_fkey;
  END IF;
END$$;

-- Add FK to sellers(id)
ALTER TABLE marketplace_products
  ADD CONSTRAINT marketplace_products_seller_id_fkey
  FOREIGN KEY (seller_id)
  REFERENCES sellers(id)
  ON UPDATE CASCADE
  ON DELETE RESTRICT;
