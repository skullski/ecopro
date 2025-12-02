-- Backfill store_slug for legacy rows missing it
UPDATE client_store_settings
SET store_slug = 'store-' || substr(md5(random()::text), 1, 8)
WHERE store_slug IS NULL;
