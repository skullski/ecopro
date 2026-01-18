-- Stock product variants (color/size) similar to store product variants

CREATE TABLE IF NOT EXISTS client_stock_variants (
  id BIGSERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stock_id INTEGER NOT NULL REFERENCES client_stock_products(id) ON DELETE CASCADE,
  color TEXT NULL,
  size TEXT NULL,
  variant_name TEXT NULL,
  price NUMERIC(10, 2) NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  images TEXT[] NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_stock_variants_client_id ON client_stock_variants(client_id);
CREATE INDEX IF NOT EXISTS idx_client_stock_variants_stock_id ON client_stock_variants(stock_id);
CREATE INDEX IF NOT EXISTS idx_client_stock_variants_active ON client_stock_variants(is_active);

-- Prevent duplicate variants per stock item (case-insensitive; nulls treated as empty)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'uniq_client_stock_variants_stock_color_size'
  ) THEN
    CREATE UNIQUE INDEX uniq_client_stock_variants_stock_color_size
      ON client_stock_variants (
        stock_id,
        LOWER(COALESCE(color, '')),
        LOWER(COALESCE(size, ''))
      );
  END IF;
END $$;
