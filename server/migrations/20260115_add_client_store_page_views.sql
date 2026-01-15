-- Adds storefront page view counter for client stores

ALTER TABLE client_store_settings
  ADD COLUMN IF NOT EXISTS page_views INTEGER DEFAULT 0;

ALTER TABLE seller_store_settings
  ADD COLUMN IF NOT EXISTS page_views INTEGER DEFAULT 0;
