-- Align bot_settings schema with server/routes/bot.ts expectations
-- Rename user_id -> client_id and add required columns

-- If column user_id exists, rename to client_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bot_settings' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE bot_settings RENAME COLUMN user_id TO client_id;
  END IF;
END $$;

-- Ensure client_id exists with proper defaults
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bot_settings' AND column_name = 'client_id'
  ) THEN
    ALTER TABLE bot_settings ADD COLUMN client_id INTEGER;
  END IF;
END $$;

-- Add columns used by bot.ts if missing
ALTER TABLE bot_settings ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'whatsapp_cloud';
ALTER TABLE bot_settings ADD COLUMN IF NOT EXISTS whatsapp_phone_id VARCHAR(100);
ALTER TABLE bot_settings ADD COLUMN IF NOT EXISTS whatsapp_token TEXT;
ALTER TABLE bot_settings ADD COLUMN IF NOT EXISTS template_order_confirmation TEXT;
ALTER TABLE bot_settings ADD COLUMN IF NOT EXISTS template_payment TEXT;
ALTER TABLE bot_settings ADD COLUMN IF NOT EXISTS template_shipping TEXT;

-- Maintain created_at/updated_at defaults
ALTER TABLE bot_settings
  ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
  ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;
