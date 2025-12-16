-- Migration: create seller_store_settings to give each seller a separate storefront
CREATE TABLE IF NOT EXISTS seller_store_settings (
  id SERIAL PRIMARY KEY,
  seller_id INTEGER NOT NULL UNIQUE REFERENCES sellers(id) ON DELETE CASCADE,
  store_name VARCHAR(255),
  store_description TEXT,
  store_logo TEXT,
  primary_color VARCHAR(7) DEFAULT '#3b82f6',
  secondary_color VARCHAR(7) DEFAULT '#8b5cf6',
  template VARCHAR(64) DEFAULT 'classic',
  store_slug VARCHAR(255) UNIQUE,
  banner_url TEXT,
  currency_code VARCHAR(16),
  hero_main_url TEXT,
  hero_tile1_url TEXT,
  hero_tile2_url TEXT,
  store_images TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure index for lookups by slug
CREATE INDEX IF NOT EXISTS idx_seller_store_settings_slug ON seller_store_settings(store_slug);
