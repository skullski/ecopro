-- Add unique store slug to client_store_settings for secure URLs
ALTER TABLE IF EXISTS client_store_settings
  ADD COLUMN IF NOT EXISTS store_slug VARCHAR(255) UNIQUE;

-- Generate random slugs for existing stores
DO $$
DECLARE
  store_record RECORD;
  new_slug TEXT;
BEGIN
  FOR store_record IN SELECT id, client_id FROM client_store_settings WHERE store_slug IS NULL
  LOOP
    -- Generate a random slug: store-{random 8 chars}
    new_slug := 'store-' || substr(md5(random()::text), 1, 8);
    
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM client_store_settings WHERE store_slug = new_slug) LOOP
      new_slug := 'store-' || substr(md5(random()::text), 1, 8);
    END LOOP;
    
    UPDATE client_store_settings 
    SET store_slug = new_slug 
    WHERE id = store_record.id;
  END LOOP;
END $$;

-- Add index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_client_store_settings_slug ON client_store_settings(store_slug);
