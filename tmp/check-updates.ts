import { ensureConnection } from '../server/utils/database';
import { sendTelegramMessage } from '../server/utils/bot-messaging';

async function main() {
  const pool = await ensureConnection();
  
  // Get bot token for client 2
  const res = await pool.query('SELECT telegram_bot_token FROM bot_settings WHERE client_id = 2');
  const token = res.rows[0]?.telegram_bot_token;
  
  if (!token) {
    console.log('No token found');
    process.exit(1);
  }
  
  // We need a chat_id to send to - let's use getUpdates to see pending messages
  console.log('Checking for pending Telegram updates...');
  const updatesRes = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
  const updates = await updatesRes.json();
  
  console.log('Updates response:', JSON.stringify(updates, null, 2));
  
  // If there are messages, find a chat_id we can use
  if (updates.ok && updates.result?.length > 0) {
    for (const update of updates.result) {
      const chatId = update.message?.chat?.id;
      const text = update.message?.text;
      console.log(`Update ${update.update_id}: chat_id=${chatId}, text="${text}"`);
    }
  } else {
    console.log('No pending updates');
  }
  
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
