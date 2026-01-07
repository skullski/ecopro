-- Add 'auto' channel option for multi-channel campaigns
ALTER TABLE message_campaigns
  DROP CONSTRAINT IF EXISTS message_campaigns_channel_check;

ALTER TABLE message_campaigns
  ADD CONSTRAINT message_campaigns_channel_check
  CHECK (
    channel::text = ANY(
      ARRAY[
        'whatsapp',
        'whatsapp_cloud',
        'sms',
        'email',
        'telegram',
        'auto'
      ]::text[]
    )
  );
