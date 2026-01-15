import 'dotenv/config';
import { ensureConnection } from '../server/utils/database';

async function main() {
  const db = await ensureConnection();
  const clientId = 10;

  const bot = await db.query(
    `SELECT client_id,
            enabled,
            provider,
            -- Telegram
            telegram_bot_token IS NOT NULL AS has_telegram_bot_token,
            telegram_bot_username,
            telegram_delay_minutes,
            telegram_webhook_secret IS NOT NULL AS has_telegram_webhook_secret,
            template_instant_order IS NOT NULL AS has_template_instant_order,
            template_pin_instructions IS NOT NULL AS has_template_pin_instructions,
            template_order_confirmation IS NOT NULL AS has_template_order_confirmation,
            -- Messenger
            messenger_enabled,
            fb_page_id,
            fb_page_access_token IS NOT NULL AS has_fb_page_access_token,
            messenger_delay_minutes
     FROM bot_settings
     WHERE client_id = $1`,
    [clientId]
  );

  console.log(JSON.stringify(bot.rows[0] || null, null, 2));
  await db.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
