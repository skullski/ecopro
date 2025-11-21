-- Create products table for marketplace

-- Updated products table for marketplace publishing
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    images TEXT,
    location VARCHAR(255),
    published BOOLEAN DEFAULT FALSE,
    visibility_source VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_location ON products(location);
