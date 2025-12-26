-- Migration: Create client stock categories table
-- Date: December 26, 2025
-- Purpose: Allow clients to manage their own stock categories

CREATE TABLE IF NOT EXISTS client_stock_categories (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(20) DEFAULT '#3b82f6',
  icon VARCHAR(10) DEFAULT '📦',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(client_id, name)
);

CREATE INDEX IF NOT EXISTS idx_client_stock_categories_client ON client_stock_categories(client_id);
CREATE INDEX IF NOT EXISTS idx_client_stock_categories_name ON client_stock_categories(name);

-- Migrate existing categories from products to the new table (only for valid clients)
INSERT INTO client_stock_categories (client_id, name, created_at)
SELECT DISTINCT p.client_id, p.category, NOW()
FROM client_stock_products p
INNER JOIN clients c ON c.id = p.client_id
WHERE p.category IS NOT NULL AND p.category != ''
ON CONFLICT (client_id, name) DO NOTHING;
