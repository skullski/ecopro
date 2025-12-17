-- Add missing columns to client_store_settings
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS seller_name TEXT;
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS seller_email TEXT;
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS hero_main_url TEXT;
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS template_hero_heading TEXT;
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS template_hero_subtitle TEXT;
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS template_button_text TEXT;
ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS template_accent_color TEXT;
