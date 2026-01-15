-- Add page_views column to client_store_settings for tracking storefront page views
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS page_views INTEGER DEFAULT 0;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_client_store_settings_page_views ON client_store_settings(page_views);
