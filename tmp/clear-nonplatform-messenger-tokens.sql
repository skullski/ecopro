-- Clear per-store FB tokens when the store is configured to use the platform shared Page.
-- This ensures ONE platform token is used for all stores.

UPDATE bot_settings
SET fb_page_access_token = NULL,
    updated_at = NOW()
WHERE messenger_enabled = true
  AND fb_page_id = '929814950220320'
  AND fb_page_access_token IS NOT NULL;
