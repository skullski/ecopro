import 'dotenv/config';
import { ensureConnection } from '../server/utils/database';

async function main() {
  const db = await ensureConnection();
  const clientId = 10;

  const bot = await db.query(
    `SELECT client_id,
            messenger_enabled,
            fb_page_id,
            fb_page_access_token IS NOT NULL AS has_fb_page_access_token,
            messenger_delay_minutes,
            enabled AS bot_enabled,
            provider,
            updates_enabled
     FROM bot_settings
     WHERE client_id = $1`,
    [clientId]
  );

  const subs = await db.query(
    `SELECT *
     FROM messenger_subscribers
     WHERE client_id = $1
     ORDER BY subscribed_at DESC
     LIMIT 10`,
    [clientId]
  );

  const tokens = await db.query(
    `SELECT *
     FROM messenger_preconnect_tokens
     WHERE client_id = $1
     ORDER BY created_at DESC
     LIMIT 10`,
    [clientId]
  );

  const links = await db.query(
    `SELECT *
     FROM customer_messaging_ids
     WHERE client_id = $1 AND messenger_psid IS NOT NULL
     ORDER BY updated_at DESC NULLS LAST, created_at DESC
     LIMIT 10`,
    [clientId]
  );

  const orderChats = await db.query(
    `SELECT *
     FROM order_messenger_chats
     WHERE client_id = $1
     ORDER BY created_at DESC
     LIMIT 10`,
    [clientId]
  );

  console.log('bot_settings:', bot.rows);
  console.log('messenger_subscribers:', subs.rows);
  console.log('messenger_preconnect_tokens:', tokens.rows);
  console.log('customer_messaging_ids (with messenger_psid):', links.rows);
  console.log('order_messenger_chats:', orderChats.rows);

  await db.end();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
