-- Add instant order notification templates
ALTER TABLE bot_settings ADD COLUMN IF NOT EXISTS template_instant_order TEXT;
ALTER TABLE bot_settings ADD COLUMN IF NOT EXISTS template_pin_instructions TEXT;
