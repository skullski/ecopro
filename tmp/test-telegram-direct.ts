import { ensureConnection } from '../server/utils/database';
import { sendTelegramMessage } from '../server/utils/bot-messaging';

async function main() {
  const pool = await ensureConnection();
  
  // Get client 2's settings
  const res = await pool.query('SELECT telegram_bot_token FROM bot_settings WHERE client_id = 2');
  const token = res.rows[0]?.telegram_bot_token;
  
  // Get a test chat ID - we need to find your chat ID
  // Let's check if there's any way to get the bot's recent updates
  
  console.log('Bot token:', token?.substring(0, 15) + '...');
  
  // Let's try to get bot info
  const meRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
  const meData = await meRes.json();
  console.log('Bot info:', meData.result?.username);
  
  // If you know your chat ID, we can test sending a message
  // For now, let's delete the webhook temporarily to check for updates
  console.log('\nTemporarily deleting webhook to check updates...');
  
  await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`);
  
  // Wait a moment
  await new Promise(r => setTimeout(r, 1000));
  
  // Get updates
  const updatesRes = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=10`);
  const updatesData = await updatesRes.json();
  
  console.log('\nRecent updates:');
  if (updatesData.ok && updatesData.result?.length > 0) {
    for (const update of updatesData.result) {
      console.log('---');
      console.log('Update ID:', update.update_id);
      console.log('Chat ID:', update.message?.chat?.id);
      console.log('From:', update.message?.from?.username || update.message?.from?.first_name);
      console.log('Text:', update.message?.text);
    }
    
    // Try sending a test message to the first chat we found
    const chatId = updatesData.result[0]?.message?.chat?.id;
    if (chatId) {
      console.log('\nSending test message to chat', chatId);
      const result = await sendTelegramMessage(token, String(chatId), '✅ Test message from EcoPro - Telegram is working!');
      console.log('Send result:', result);
    }
  } else {
    console.log('No updates found. Please send /start to the bot first.');
  }
  
  // Re-register webhook
  console.log('\nRe-registering webhook...');
  const secret = (await pool.query('SELECT telegram_webhook_secret FROM bot_settings WHERE client_id = 2')).rows[0]?.telegram_webhook_secret;
  await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: 'https://ecopro-1lbl.onrender.com/api/telegram/webhook',
      secret_token: secret,
    }),
  });
  console.log('Webhook restored');
  
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
