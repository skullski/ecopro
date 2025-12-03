-- Ensure sellers table exists with timestamps
CREATE TABLE IF NOT EXISTS sellers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adjust marketplace_products seller_id to reference sellers(id)
ALTER TABLE marketplace_products
  DROP CONSTRAINT IF EXISTS marketplace_products_seller_id_fkey;

ALTER TABLE marketplace_products
  ADD CONSTRAINT marketplace_products_seller_id_fkey
  FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE;
