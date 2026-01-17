import { ensureConnection } from '../server/utils/database';
import { sendTelegramMessage, replaceTemplateVariables } from '../server/utils/bot-messaging';

async function main() {
  const pool = await ensureConnection();
  
  const startToken = '0272ec44fdc2fba005774237ca9b1d71';
  const testChatId = process.argv[2]; // Pass chat ID as argument
  
  if (!testChatId) {
    console.log('Usage: tsx tmp/simulate-start.ts <chat_id>');
    console.log('\nTo get your chat ID:');
    console.log('1. Send /start to @SahlaOrdersBot');
    console.log('2. Run this script again after checking getUpdates');
    process.exit(1);
  }
  
  console.log('Simulating /start with token:', startToken);
  console.log('Chat ID:', testChatId);
  
  // Look up the link
  const linkRes = await pool.query(
    `SELECT order_id, client_id, customer_phone, customer_name
     FROM order_telegram_links
     WHERE start_token = $1
     LIMIT 1`,
    [startToken]
  );
  
  if (!linkRes.rows.length) {
    console.log('Link not found!');
    process.exit(1);
  }
  
  const { order_id: orderId, client_id: clientId, customer_phone: customerPhone, customer_name: customerName } = linkRes.rows[0];
  console.log('Found link:', { orderId, clientId, customerPhone, customerName });
  
  // Get bot token
  const tokenRes = await pool.query(
    `SELECT telegram_bot_token
     FROM bot_settings
     WHERE client_id = $1
       AND enabled = true
       AND telegram_bot_token IS NOT NULL
     LIMIT 1`,
    [clientId]
  );
  
  const botToken = tokenRes.rows[0]?.telegram_bot_token;
  if (!botToken) {
    console.log('No bot token found for client', clientId);
    process.exit(1);
  }
  console.log('Bot token found');
  
  // Bind this Telegram chat to this order
  await pool.query(
    `INSERT INTO order_telegram_chats (order_id, client_id, telegram_chat_id, telegram_user_id, created_at)
     VALUES ($1,$2,$3,NULL,NOW())
     ON CONFLICT (order_id) DO UPDATE SET telegram_chat_id = EXCLUDED.telegram_chat_id`,
    [orderId, clientId, testChatId]
  );
  console.log('Saved order_telegram_chats');
  
  // Also keep a phone->chat mapping
  await pool.query(
    `INSERT INTO customer_messaging_ids (client_id, customer_phone, telegram_chat_id, created_at, updated_at)
     VALUES ($1,$2,$3,NOW(),NOW())
     ON CONFLICT (client_id, customer_phone)
     DO UPDATE SET telegram_chat_id = EXCLUDED.telegram_chat_id, updated_at = NOW()`,
    [clientId, customerPhone, testChatId]
  );
  console.log('Saved customer_messaging_ids');
  
  // Mark link as used
  await pool.query(
    `UPDATE order_telegram_links SET used_at = NOW() WHERE start_token = $1`,
    [startToken]
  );
  console.log('Marked link as used');
  
  // Get store name and send greeting
  const storeRes = await pool.query(
    `SELECT store_name FROM client_store_settings WHERE client_id = $1 LIMIT 1`,
    [clientId]
  );
  const storeName = String(storeRes.rows[0]?.store_name || 'EcoPro Store');
  
  const greeting = replaceTemplateVariables(
    'Thank you for ordering from {storeName}, {customerName}!\n\n✅ Enable notifications on Telegram to receive order confirmation and tracking updates.',
    { storeName, customerName, orderId }
  );
  
  console.log('\nSending greeting message...');
  const result = await sendTelegramMessage(botToken, testChatId, greeting);
  console.log('Send result:', result);
  
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
