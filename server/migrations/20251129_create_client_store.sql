-- Client Private Store Products Table
CREATE TABLE IF NOT EXISTS client_store_products (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  images TEXT[] DEFAULT '{}',
  category VARCHAR(100),
  stock_quantity INTEGER DEFAULT 0,
  status VARCHAR(32) DEFAULT 'active', -- active, draft, archived
  is_featured BOOLEAN DEFAULT false,
  slug VARCHAR(255) UNIQUE,
  views INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}', -- For custom fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Client Store Settings Table
CREATE TABLE IF NOT EXISTS client_store_settings (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  store_name VARCHAR(255),
  store_description TEXT,
  store_logo TEXT,
  primary_color VARCHAR(7) DEFAULT '#3b82f6',
  secondary_color VARCHAR(7) DEFAULT '#8b5cf6',
  custom_domain VARCHAR(255),
  is_public BOOLEAN DEFAULT false, -- Whether entire store is public
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_store_products_client_id ON client_store_products(client_id);
CREATE INDEX IF NOT EXISTS idx_client_store_products_status ON client_store_products(status);
CREATE INDEX IF NOT EXISTS idx_client_store_products_slug ON client_store_products(slug);
CREATE INDEX IF NOT EXISTS idx_client_store_products_featured ON client_store_products(is_featured);

-- Function to generate unique slug
CREATE OR REPLACE FUNCTION generate_product_slug(product_title TEXT, product_id INTEGER)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(product_title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || product_id;
END;
$$ LANGUAGE plpgsql;
