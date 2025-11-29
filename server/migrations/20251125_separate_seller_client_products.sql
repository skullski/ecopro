-- Separate seller marketplace products from client store products
-- This migration creates distinct tables for sellers and clients

-- Rename existing products table to marketplace_products (for sellers)
ALTER TABLE IF EXISTS products RENAME TO marketplace_products;

-- Rename existing orders table to marketplace_orders
ALTER TABLE IF EXISTS orders RENAME TO marketplace_orders;

-- Update foreign key constraints for marketplace_orders
ALTER TABLE marketplace_orders 
  DROP CONSTRAINT IF EXISTS orders_product_id_fkey,
  ADD CONSTRAINT marketplace_orders_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES marketplace_products(id) ON DELETE CASCADE;

ALTER TABLE marketplace_orders 
  DROP CONSTRAINT IF EXISTS orders_buyer_id_fkey,
  ADD CONSTRAINT marketplace_orders_buyer_id_fkey 
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE marketplace_orders 
  DROP CONSTRAINT IF EXISTS orders_seller_id_fkey,
  ADD CONSTRAINT marketplace_orders_seller_id_fkey 
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create store_products table for client businesses
CREATE TABLE IF NOT EXISTS store_products (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id INTEGER, -- Optional: if clients can have multiple stores
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  original_price NUMERIC(10, 2),
  category VARCHAR(100),
  sku VARCHAR(100),
  barcode VARCHAR(100),
  images TEXT[],
  stock INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock')),
  condition VARCHAR(20) DEFAULT 'new' CHECK (condition IN ('new', 'used', 'refurbished')),
  weight NUMERIC(10, 2), -- For shipping calculations
  dimensions VARCHAR(100), -- e.g., "10x20x5 cm"
  tags TEXT[],
  featured BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create store_orders table for client store orders
CREATE TABLE IF NOT EXISTS store_orders (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id INTEGER, -- Optional: if clients have multiple stores
  quantity INTEGER DEFAULT 1,
  total_price NUMERIC(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  shipping_address TEXT,
  billing_address TEXT,
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded', 'partially_refunded')),
  tracking_number VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for marketplace_products
DROP INDEX IF EXISTS idx_products_seller_id;
DROP INDEX IF EXISTS idx_products_status;
DROP INDEX IF EXISTS idx_products_category;
CREATE INDEX IF NOT EXISTS idx_marketplace_products_seller_id ON marketplace_products(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_status ON marketplace_products(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_category ON marketplace_products(category);

-- Create indexes for marketplace_orders
DROP INDEX IF EXISTS idx_orders_seller_id;
DROP INDEX IF EXISTS idx_orders_buyer_id;
DROP INDEX IF EXISTS idx_orders_status;
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_seller_id ON marketplace_orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_buyer_id ON marketplace_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_status ON marketplace_orders(status);

-- Create indexes for store_products
CREATE INDEX IF NOT EXISTS idx_store_products_client_id ON store_products(client_id);
CREATE INDEX IF NOT EXISTS idx_store_products_store_id ON store_products(store_id);
CREATE INDEX IF NOT EXISTS idx_store_products_status ON store_products(status);
CREATE INDEX IF NOT EXISTS idx_store_products_category ON store_products(category);
CREATE INDEX IF NOT EXISTS idx_store_products_sku ON store_products(sku);

-- Create indexes for store_orders
CREATE INDEX IF NOT EXISTS idx_store_orders_client_id ON store_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_store_orders_store_id ON store_orders(store_id);
CREATE INDEX IF NOT EXISTS idx_store_orders_product_id ON store_orders(product_id);
CREATE INDEX IF NOT EXISTS idx_store_orders_status ON store_orders(status);
CREATE INDEX IF NOT EXISTS idx_store_orders_payment_status ON store_orders(payment_status);

-- Update triggers for store_products
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_marketplace_products_updated_at ON marketplace_products;
CREATE TRIGGER update_marketplace_products_updated_at 
BEFORE UPDATE ON marketplace_products 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_products_updated_at 
BEFORE UPDATE ON store_products 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Update triggers for orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS update_marketplace_orders_updated_at ON marketplace_orders;
CREATE TRIGGER update_marketplace_orders_updated_at 
BEFORE UPDATE ON marketplace_orders 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_orders_updated_at 
BEFORE UPDATE ON store_orders 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Add comment to clarify table purposes
COMMENT ON TABLE marketplace_products IS 'Products listed by marketplace sellers (user_type=seller) for public marketplace';
COMMENT ON TABLE store_products IS 'Products managed by client businesses (user_type=client) for their own stores/dashboard';
COMMENT ON TABLE marketplace_orders IS 'Orders for marketplace products from sellers';
COMMENT ON TABLE store_orders IS 'Orders for client store products';
