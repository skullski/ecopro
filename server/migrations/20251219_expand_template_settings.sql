-- Migration: Expand template settings with professional features
-- Date: 2025-12-19
-- Purpose: Add comprehensive settings for all templates (logo, typography, layout, SEO, etc.)

-- Add universal branding columns
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500);
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS logo_width INTEGER DEFAULT 150;

-- Add color columns
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS text_color VARCHAR(7) DEFAULT '#1A1A1A';
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS secondary_text_color VARCHAR(7) DEFAULT '#666666';

-- Add typography columns
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS font_family VARCHAR(100) DEFAULT 'Inter';
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS heading_size_multiplier VARCHAR(50) DEFAULT 'Large';
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS body_font_size INTEGER DEFAULT 16;

-- Add layout columns
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS section_padding INTEGER DEFAULT 40;
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS border_radius INTEGER DEFAULT 8;
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS enable_sidebar BOOLEAN DEFAULT TRUE;

-- Add theme columns
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS enable_dark_mode BOOLEAN DEFAULT TRUE;
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS default_theme VARCHAR(50) DEFAULT 'Light';
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS show_product_shadows BOOLEAN DEFAULT TRUE;
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS enable_animations BOOLEAN DEFAULT TRUE;

-- Add SEO columns
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255);
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS meta_keywords VARCHAR(255);

-- Add featured section columns
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS show_featured_section BOOLEAN DEFAULT TRUE;
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS featured_section_title VARCHAR(255) DEFAULT 'Featured Products';
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS featured_product_ids VARCHAR(500);

-- Add testimonials columns
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS show_testimonials BOOLEAN DEFAULT FALSE;
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS testimonials TEXT;

-- Add newsletter columns
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS show_newsletter BOOLEAN DEFAULT TRUE;
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS newsletter_title VARCHAR(255) DEFAULT 'Subscribe to our newsletter';
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS newsletter_subtitle VARCHAR(500);

-- Add trust badges columns
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS show_trust_badges BOOLEAN DEFAULT TRUE;
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS trust_badges TEXT;

-- Add FAQ columns
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS show_faq BOOLEAN DEFAULT FALSE;
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS faq_items TEXT;

-- Add footer columns
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS footer_about TEXT;
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS footer_links TEXT;
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS social_links TEXT;
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS footer_contact VARCHAR(255);

-- Add header/navigation columns
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS header_sticky BOOLEAN DEFAULT TRUE;
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS show_search_bar BOOLEAN DEFAULT TRUE;
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS show_cart_icon BOOLEAN DEFAULT TRUE;
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS custom_menu_items TEXT;

-- Create indexes for frequently accessed settings
CREATE INDEX IF NOT EXISTS idx_store_settings_template ON client_store_settings(template);
CREATE INDEX IF NOT EXISTS idx_store_settings_meta ON client_store_settings(meta_title, meta_keywords);
CREATE INDEX IF NOT EXISTS idx_store_settings_featured ON client_store_settings(show_featured_section);

-- Add comment describing the expansion
COMMENT ON TABLE client_store_settings IS 'Expanded template settings with branding, typography, layout, SEO, and advanced sections';
