import { ensureConnection } from '../server/utils/database';

async function main() {
  const pool = await ensureConnection();
  
  const res = await pool.query('SELECT client_id, telegram_bot_token FROM bot_settings WHERE client_id = 2');
  const token = res.rows[0]?.telegram_bot_token;
  
  if (!token) {
    console.log('No token found for client 2');
    process.exit(1);
  }
  
  console.log('Token found, checking webhook...');
  
  // Get webhook info
  const webhookRes = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
  const data = await webhookRes.json();
  console.log('Webhook Info:');
  console.log(JSON.stringify(data, null, 2));
  
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
