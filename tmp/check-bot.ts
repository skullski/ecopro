import 'dotenv/config';
import { ensureConnection } from '../server/utils/database';

async function check() {
  const db = await ensureConnection();
  
  // Check recent scheduled messages
  const msgs = await db.query(`
    SELECT id, order_id, telegram_chat_id, message_type, status, scheduled_at, sent_at, error_message
    FROM scheduled_messages
    ORDER BY created_at DESC LIMIT 10
  `);
  console.log('Recent scheduled messages:');
  console.table(msgs.rows);
  
  // Check bot settings for client 10
  const bot = await db.query('SELECT client_id, enabled, provider, telegram_bot_token IS NOT NULL as has_telegram_token, whatsapp_token IS NOT NULL as has_whatsapp_token, telegram_delay_minutes, updates_enabled FROM bot_settings WHERE client_id = 10');
  console.log('\nBot settings for client 10:');
  console.table(bot.rows);
  
  // Check customer_messaging_ids
  const links = await db.query(`
    SELECT * FROM customer_messaging_ids WHERE client_id = 10 LIMIT 5
  `);
  console.log('\nCustomer messaging IDs:');
  console.table(links.rows);
  
  process.exit(0);
}
check();
