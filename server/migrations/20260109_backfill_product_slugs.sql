-- Backfill slug for client_store_products that have NULL slug
-- This ensures all products have a navigable slug for the checkout page

UPDATE client_store_products
SET slug = lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || id
WHERE slug IS NULL OR slug = '';

-- For marketplace_products, check if slug column exists first
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marketplace_products' AND column_name = 'slug'
  ) THEN
    EXECUTE 'UPDATE marketplace_products SET slug = lower(regexp_replace(title, ''[^a-zA-Z0-9]+'', ''-'', ''g'')) || ''-'' || id WHERE slug IS NULL OR slug = ''''';
  END IF;
END $$;
