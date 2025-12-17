-- Separate sellers and clients into distinct user tables
-- This migration creates sellers and clients tables for complete data isolation

-- Create sellers table
CREATE TABLE IF NOT EXISTS sellers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  business_name VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  role VARCHAR(20) DEFAULT 'seller' CHECK (role IN ('seller', 'admin')),
  is_verified BOOLEAN DEFAULT false,
  stripe_account_id VARCHAR(255),
  commission_rate NUMERIC(5, 2) DEFAULT 10.00,
  total_sales NUMERIC(10, 2) DEFAULT 0,
  rating NUMERIC(3, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  company_name VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  role VARCHAR(20) DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium', 'enterprise')),
  subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'trial')),
  stripe_customer_id VARCHAR(255),
  subscription_ends_at TIMESTAMP,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migrate existing users with user_type='seller' to sellers table
DO $$
DECLARE
  has_phone BOOLEAN;
  has_address BOOLEAN;
  has_role BOOLEAN;
  has_user_type BOOLEAN;
BEGIN
  -- Check if users table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    RAISE NOTICE 'Users table does not exist, skipping migration';
    RETURN;
  END IF;

  -- Check which columns exist
  has_phone := EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone');
  has_address := EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'address');
  has_role := EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role');
  has_user_type := EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'user_type');

  -- Skip if no user_type column (nothing to migrate)
  IF NOT has_user_type THEN
    RAISE NOTICE 'No user_type column in users table, skipping migration';
    RETURN;
  END IF;

  -- Build and execute dynamic SQL based on available columns
  IF has_phone AND has_address AND has_role THEN
    INSERT INTO sellers (email, password_hash, name, phone, address, role, created_at, updated_at)
    SELECT 
      email, password_hash, name, phone, address,
      CASE WHEN role = 'admin' THEN 'admin' ELSE 'seller' END,
      created_at, updated_at
    FROM users WHERE user_type = 'seller'
    ON CONFLICT (email) DO NOTHING;
  ELSIF has_phone AND has_address THEN
    INSERT INTO sellers (email, password_hash, name, phone, address, created_at, updated_at)
    SELECT email, password_hash, name, phone, address, created_at, updated_at
    FROM users WHERE user_type = 'seller'
    ON CONFLICT (email) DO NOTHING;
  ELSIF has_role THEN
    INSERT INTO sellers (email, password_hash, name, role, created_at, updated_at)
    SELECT 
      email, password_hash, name,
      CASE WHEN role = 'admin' THEN 'admin' ELSE 'seller' END,
      created_at, updated_at
    FROM users WHERE user_type = 'seller'
    ON CONFLICT (email) DO NOTHING;
  ELSE
    INSERT INTO sellers (email, password_hash, name, created_at, updated_at)
    SELECT email, password_hash, name, created_at, updated_at
    FROM users WHERE user_type = 'seller'
    ON CONFLICT (email) DO NOTHING;
  END IF;
END $$;

-- Migrate existing users with user_type='client' to clients table
DO $$
DECLARE
  has_phone BOOLEAN;
  has_address BOOLEAN;
  has_role BOOLEAN;
  has_user_type BOOLEAN;
BEGIN
  -- Check if users table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    RAISE NOTICE 'Users table does not exist, skipping migration';
    RETURN;
  END IF;

  -- Check which columns exist
  has_phone := EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone');
  has_address := EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'address');
  has_role := EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role');
  has_user_type := EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'user_type');

  -- Skip if no user_type column
  IF NOT has_user_type THEN
    RAISE NOTICE 'No user_type column in users table, skipping migration';
    RETURN;
  END IF;

  -- Build and execute based on available columns
  IF has_phone AND has_address AND has_role THEN
    INSERT INTO clients (email, password_hash, name, phone, address, role, created_at, updated_at)
    SELECT 
      email, password_hash, name, phone, address,
      CASE WHEN role = 'admin' THEN 'admin' ELSE 'client' END,
      created_at, updated_at
    FROM users WHERE user_type = 'client'
    ON CONFLICT (email) DO NOTHING;
  ELSIF has_phone AND has_address THEN
    INSERT INTO clients (email, password_hash, name, phone, address, created_at, updated_at)
    SELECT email, password_hash, name, phone, address, created_at, updated_at
    FROM users WHERE user_type = 'client'
    ON CONFLICT (email) DO NOTHING;
  ELSIF has_role THEN
    INSERT INTO clients (email, password_hash, name, role, created_at, updated_at)
    SELECT 
      email, password_hash, name,
      CASE WHEN role = 'admin' THEN 'admin' ELSE 'client' END,
      created_at, updated_at
    FROM users WHERE user_type = 'client'
    ON CONFLICT (email) DO NOTHING;
  ELSE
    INSERT INTO clients (email, password_hash, name, created_at, updated_at)
    SELECT email, password_hash, name, created_at, updated_at
    FROM users WHERE user_type = 'client'
    ON CONFLICT (email) DO NOTHING;
  END IF;
END $$;

-- Update marketplace_products to reference sellers table
ALTER TABLE marketplace_products 
  DROP CONSTRAINT IF EXISTS marketplace_products_seller_id_fkey;

-- Add new seller_id column if needed and update references
-- Note: We'll keep the old seller_id temporarily and create a mapping
DO $$
BEGIN
  -- Create a temporary mapping table
  CREATE TEMP TABLE seller_id_mapping AS
  SELECT u.id as old_id, s.id as new_id
  FROM users u
  JOIN sellers s ON u.email = s.email
  WHERE u.user_type = 'seller';

  -- Update marketplace_products with new seller IDs
  UPDATE marketplace_products mp
  SET seller_id = m.new_id
  FROM seller_id_mapping m
  WHERE mp.seller_id = m.old_id;
END $$;

-- Now add the foreign key constraint to sellers table
ALTER TABLE marketplace_products 
  ADD CONSTRAINT marketplace_products_seller_id_fkey 
    FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE;

-- Update marketplace_orders to reference sellers table
ALTER TABLE marketplace_orders
  DROP CONSTRAINT IF EXISTS marketplace_orders_seller_id_fkey;

DO $$
BEGIN
  -- Update marketplace_orders with new seller IDs
  UPDATE marketplace_orders mo
  SET seller_id = (
    SELECT s.id 
    FROM sellers s
    JOIN users u ON u.email = s.email
    WHERE u.id = mo.seller_id
    AND u.user_type = 'seller'
    LIMIT 1
  )
  WHERE EXISTS (
    SELECT 1 FROM users WHERE id = mo.seller_id AND user_type = 'seller'
  );
END $$;

ALTER TABLE marketplace_orders
  ADD CONSTRAINT marketplace_orders_seller_id_fkey 
    FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE;

-- Update store_products to reference clients table
ALTER TABLE store_products
  DROP CONSTRAINT IF EXISTS store_products_client_id_fkey;

DO $$
BEGIN
  -- Update store_products with new client IDs if any exist
  UPDATE store_products sp
  SET client_id = (
    SELECT c.id 
    FROM clients c
    JOIN users u ON u.email = c.email
    WHERE u.id = sp.client_id
    AND u.user_type = 'client'
    LIMIT 1
  )
  WHERE EXISTS (
    SELECT 1 FROM users WHERE id = sp.client_id AND user_type = 'client'
  );
END $$;

ALTER TABLE store_products
  ADD CONSTRAINT store_products_client_id_fkey 
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- Update store_orders to reference clients table
ALTER TABLE store_orders
  DROP CONSTRAINT IF EXISTS store_orders_client_id_fkey;

DO $$
BEGIN
  -- Update store_orders with new client IDs if any exist
  UPDATE store_orders so
  SET client_id = (
    SELECT c.id 
    FROM clients c
    JOIN users u ON u.email = c.email
    WHERE u.id = so.client_id
    AND u.user_type = 'client'
    LIMIT 1
  )
  WHERE EXISTS (
    SELECT 1 FROM users WHERE id = so.client_id AND user_type = 'client'
  );
END $$;

ALTER TABLE store_orders
  ADD CONSTRAINT store_orders_client_id_fkey 
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- Create indexes for sellers
CREATE INDEX IF NOT EXISTS idx_sellers_email ON sellers(email);
CREATE INDEX IF NOT EXISTS idx_sellers_role ON sellers(role);
CREATE INDEX IF NOT EXISTS idx_sellers_is_verified ON sellers(is_verified);

-- Create indexes for clients
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_role ON clients(role);
CREATE INDEX IF NOT EXISTS idx_clients_subscription_tier ON clients(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_clients_subscription_status ON clients(subscription_status);

-- Create triggers for updated_at
CREATE TRIGGER update_sellers_updated_at 
BEFORE UPDATE ON sellers 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at 
BEFORE UPDATE ON clients 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE sellers IS 'Marketplace sellers who list products for sale';
COMMENT ON TABLE clients IS 'Business clients who manage their own stores and products';

-- Note: Keep the users table for now for backwards compatibility
-- You can drop it later once all code is updated:
-- DROP TABLE IF EXISTS users CASCADE;
