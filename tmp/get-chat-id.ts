import { ensureConnection } from '../server/utils/database';

async function main() {
  const pool = await ensureConnection();
  
  // Get bot token
  const res = await pool.query('SELECT telegram_bot_token FROM bot_settings WHERE client_id = 2');
  const token = res.rows[0]?.telegram_bot_token;
  
  console.log('Step 1: Deleting webhook temporarily...');
  await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`);
  
  console.log('Step 2: Waiting 2 seconds...');
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('\n=================================================');
  console.log('NOW: Open Telegram and send /start to @SahlaOrdersBot');
  console.log('Then press Enter here to continue...');
  console.log('=================================================\n');
  
  // Wait for user input (read a line from stdin)
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });
  
  console.log('Step 3: Getting updates...');
  const updatesRes = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=10`);
  const data = await updatesRes.json();
  
  if (data.ok && data.result?.length > 0) {
    console.log('\nFound updates:');
    for (const update of data.result) {
      const chatId = update.message?.chat?.id;
      const text = update.message?.text;
      const user = update.message?.from?.username || update.message?.from?.first_name;
      console.log(`- Chat ID: ${chatId}, From: ${user}, Text: "${text}"`);
    }
    
    const chatId = data.result[data.result.length - 1]?.message?.chat?.id;
    console.log('\n>>> Your Chat ID is:', chatId);
    console.log('>>> Run: pnpm -s exec tsx tmp/simulate-start.ts', chatId);
  } else {
    console.log('No updates found. Make sure you sent /start to @SahlaOrdersBot');
  }
  
  console.log('\nStep 4: Restoring webhook...');
  const secret = (await pool.query('SELECT telegram_webhook_secret FROM bot_settings WHERE client_id = 2')).rows[0]?.telegram_webhook_secret;
  await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: 'https://ecopro-1lbl.onrender.com/api/telegram/webhook',
      secret_token: secret,
    }),
  });
  console.log('Webhook restored!');
  
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
