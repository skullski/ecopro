-- Add optional product columns (non-destructive)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS owner_email TEXT,
  ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS favorites INTEGER DEFAULT 0;

-- Add indexes to speed up lookups if desired (non-blocking)
CREATE INDEX IF NOT EXISTS idx_products_owner_email ON products(owner_email);
CREATE INDEX IF NOT EXISTS idx_products_views ON products(views);
CREATE INDEX IF NOT EXISTS idx_products_favorites ON products(favorites);
