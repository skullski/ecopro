-- Align bot_settings schema with server/routes/bot.ts expectations
-- Rename user_id -> client_id and add required columns

BEGIN;

-- If column user_id exists, rename to client_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bot_settings' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE bot_settings RENAME COLUMN user_id TO client_id;
  END IF;
END$$;

-- Ensure client_id has proper FK to users(id)
ALTER TABLE bot_settings
  ADD CONSTRAINT IF NOT EXISTS fk_bot_settings_client
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add columns used by bot.ts if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bot_settings' AND column_name = 'provider'
  ) THEN
    ALTER TABLE bot_settings ADD COLUMN provider VARCHAR(50) DEFAULT 'whatsapp_cloud';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bot_settings' AND column_name = 'whatsapp_phone_id'
  ) THEN
    ALTER TABLE bot_settings ADD COLUMN whatsapp_phone_id VARCHAR(100);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bot_settings' AND column_name = 'whatsapp_token'
  ) THEN
    ALTER TABLE bot_settings ADD COLUMN whatsapp_token TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bot_settings' AND column_name = 'template_order_confirmation'
  ) THEN
    ALTER TABLE bot_settings ADD COLUMN template_order_confirmation TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bot_settings' AND column_name = 'template_payment'
  ) THEN
    ALTER TABLE bot_settings ADD COLUMN template_payment TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bot_settings' AND column_name = 'template_shipping'
  ) THEN
    ALTER TABLE bot_settings ADD COLUMN template_shipping TEXT;
  END IF;
END$$;

-- Maintain created_at/updated_at defaults
ALTER TABLE bot_settings
  ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
  ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;

COMMIT;
