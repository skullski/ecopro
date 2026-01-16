-- Product variants (color/size) + order snapshot fields

-- 1) Variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id BIGSERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES client_store_products(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_product_variants_client_id ON product_variants(client_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_active ON product_variants(is_active);

-- Prevent duplicate variants per product (case-insensitive; nulls treated as empty)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'uniq_product_variants_product_color_size'
  ) THEN
    CREATE UNIQUE INDEX uniq_product_variants_product_color_size
      ON product_variants (
        product_id,
        LOWER(COALESCE(color, '')),
        LOWER(COALESCE(size, ''))
      );
  END IF;
END $$;

-- 2) Store order snapshot fields
ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS variant_id BIGINT;
ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS variant_color TEXT;
ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS variant_size TEXT;
ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS variant_name TEXT;
ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS unit_price NUMERIC(10, 2);

CREATE INDEX IF NOT EXISTS idx_store_orders_variant_id ON store_orders(variant_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'store_orders_variant_id_fkey'
  ) THEN
    ALTER TABLE store_orders
      ADD CONSTRAINT store_orders_variant_id_fkey
      FOREIGN KEY (variant_id) REFERENCES product_variants(id)
      ON DELETE SET NULL;
  END IF;
END $$;
