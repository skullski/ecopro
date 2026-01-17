import { ensureConnection } from '../server/utils/database';

async function main() {
  const pool = await ensureConnection();
  
  // Check bot_settings
  console.log('=== Bot Settings ===');
  const botSettings = await pool.query(`
    SELECT id, client_id, enabled, provider, 
           telegram_bot_token IS NOT NULL as has_token, 
           length(telegram_bot_token) as token_len,
           telegram_bot_username, 
           telegram_delay_minutes 
    FROM bot_settings 
    WHERE enabled = true 
    ORDER BY id LIMIT 10
  `);
  for (const row of botSettings.rows) {
    console.log(row);
  }
  
  // Check customer_messaging_ids for telegram connections
  console.log('\n=== Customer Telegram Connections ===');
  const customers = await pool.query(`
    SELECT client_id, customer_phone, 
           telegram_chat_id, created_at
    FROM customer_messaging_ids 
    WHERE telegram_chat_id IS NOT NULL 
    ORDER BY created_at DESC LIMIT 10
  `);
  for (const row of customers.rows) {
    console.log(row);
  }
  
  // Check order_telegram_chats
  console.log('\n=== Order Telegram Chats ===');
  const orderChats = await pool.query(`
    SELECT order_id, client_id, telegram_chat_id, created_at
    FROM order_telegram_chats
    ORDER BY created_at DESC LIMIT 10
  `);
  for (const row of orderChats.rows) {
    console.log(row);
  }
  
  // Check pending bot_messages
  console.log('\n=== Pending Bot Messages ===');
  const pending = await pool.query(`
    SELECT id, order_id, client_id, message_type, status, error_message, send_at 
    FROM bot_messages 
    WHERE status = 'pending' 
    ORDER BY send_at LIMIT 10
  `);
  for (const row of pending.rows) {
    console.log(row);
  }
  
  // Check recent failed messages
  console.log('\n=== Recent Failed Messages ===');
  const failed = await pool.query(`
    SELECT id, order_id, client_id, message_type, status, error_message 
    FROM bot_messages 
    WHERE status = 'failed' 
    ORDER BY id DESC LIMIT 10
  `);
  for (const row of failed.rows) {
    console.log(row);
  }
  
  // Check scheduled_messages
  console.log('\n=== Scheduled Messages ===');
  const scheduled = await pool.query(`
    SELECT id, client_id, order_id, telegram_chat_id, message_type, status, scheduled_at, sent_at
    FROM scheduled_messages 
    ORDER BY id DESC LIMIT 10
  `);
  for (const row of scheduled.rows) {
    console.log(row);
  }

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
