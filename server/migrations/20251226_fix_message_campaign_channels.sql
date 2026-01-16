-- Allow telegram + whatsapp_cloud channels for Updates Bot campaigns

DO $$
BEGIN
  IF to_regclass('public.message_campaigns') IS NULL THEN
    RAISE NOTICE 'message_campaigns table not found; skipping channel constraint migration';
    RETURN;
  END IF;

  EXECUTE 'ALTER TABLE message_campaigns DROP CONSTRAINT IF EXISTS message_campaigns_channel_check';

  EXECUTE $stmt$
    ALTER TABLE message_campaigns
      ADD CONSTRAINT message_campaigns_channel_check
      CHECK (
        channel::text = ANY(
          ARRAY[
            'whatsapp',
            'whatsapp_cloud',
            'sms',
            'email',
            'telegram'
          ]::text[]
        )
      )
  $stmt$;
END $$;
