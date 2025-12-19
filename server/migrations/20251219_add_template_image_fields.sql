-- Migration: Add template-specific image fields
-- Date: 2025-12-19
-- Purpose: Add image upload fields for templates with multiple hero/featured images

-- Fashion3-Specific: Lookbook images (3 images max)
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS template_lookbook_1 VARCHAR(500);
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS template_lookbook_2 VARCHAR(500);
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS template_lookbook_3 VARCHAR(500);

-- Bags-Specific: Background image
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS template_bg_image VARCHAR(500);
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS template_hero_bg_blur INTEGER DEFAULT 12;

-- Fashion3-Specific: Hotspot image (for outfit with clickable points)
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS template_hotspot_image VARCHAR(500);
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS template_hotspot_config TEXT;

-- Fashion3-Specific: Video URL for hero
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS template_video_url VARCHAR(500);

-- Fashion3-Specific: Seasonal banner info
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS template_seasonal_title VARCHAR(255);
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS template_seasonal_subtitle TEXT;

-- Jewelry, Bags, Fashion3-Specific: Material and type filters
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS template_materials VARCHAR(500);
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS template_types VARCHAR(500);

-- Perfume-Specific: Realm filters
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS template_realms VARCHAR(500);

-- Fashion-Specific: Gender categories
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS template_genders VARCHAR(500);

-- Furniture-Specific: Mega menu categories
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS template_mega_menu_categories TEXT;

-- Fashion3-Specific: Furniture/other: Price range min/max
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS template_price_min NUMERIC(12, 2);
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS template_price_max NUMERIC(12, 2);

-- Jewelry-Specific: Featured product IDs for gold edit section
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS template_featured_ids VARCHAR(500);

-- Cafe-Specific: Store information
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS template_since_year INTEGER;
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS template_store_city VARCHAR(255);

-- Beauty-Specific: Shade colors for shade finder
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS template_shade_colors TEXT;

-- Electronics-Specific: Product IDs for hero sections
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS hero_product_id INTEGER;
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS split_hero_product_id INTEGER;
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS best_sellers_ids VARCHAR(500);
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS deals_ids VARCHAR(500);
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS hero_badge VARCHAR(255);

-- Create index for template-specific image URLs for faster retrieval
CREATE INDEX IF NOT EXISTS idx_store_settings_images ON client_store_settings(banner_url, template_bg_image, template_hotspot_image);

-- Add comment describing template-specific fields
COMMENT ON TABLE client_store_settings IS 'Extended template settings with image fields for each template type';

SELECT 'Template image fields migration completed successfully' AS status;
