-- Migration: Add missing image/gallery columns for client_store_settings
-- Date: 2025-12-26
-- Purpose: Ensure client_store_settings supports hero tile URLs and gallery images

ALTER TABLE client_store_settings
  ADD COLUMN IF NOT EXISTS hero_tile1_url TEXT,
  ADD COLUMN IF NOT EXISTS hero_tile2_url TEXT,
  ADD COLUMN IF NOT EXISTS store_images TEXT[];

SELECT 'client_store_settings tile/gallery columns ensured' AS status;
