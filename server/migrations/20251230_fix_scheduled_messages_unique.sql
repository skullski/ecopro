-- Add unique constraint to prevent duplicate scheduled messages for same order
-- Also add default for telegram_delay_minutes in bot_settings

-- Create unique index (allows NULL order_id since those are not order confirmations)
CREATE UNIQUE INDEX IF NOT EXISTS idx_scheduled_messages_order_type_unique 
ON scheduled_messages(order_id, message_type) 
WHERE order_id IS NOT NULL AND status = 'pending';

-- Set default telegram_delay_minutes to 5 if NULL
UPDATE bot_settings SET telegram_delay_minutes = 5 WHERE telegram_delay_minutes IS NULL;
