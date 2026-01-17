import { ensureConnection } from '../server/utils/database';

async function main() {
  const pool = await ensureConnection();
  
  // Get client 2's settings
  const res = await pool.query('SELECT telegram_bot_token, telegram_webhook_secret FROM bot_settings WHERE client_id = 2');
  const token = res.rows[0]?.telegram_bot_token;
  const secret = res.rows[0]?.telegram_webhook_secret;
  
  console.log('Token:', token?.substring(0, 15) + '...');
  console.log('Secret:', secret);
  
  // Re-register webhook with secret
  const webhookUrl = 'https://ecopro-1lbl.onrender.com/api/telegram/webhook';
  
  console.log('\nSetting webhook with secret...');
  const setRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: webhookUrl,
      secret_token: secret,
      drop_pending_updates: true,
    }),
  });
  
  const setData = await setRes.json();
  console.log('setWebhook response:', JSON.stringify(setData, null, 2));
  
  // Verify
  const infoRes = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
  const infoData = await infoRes.json();
  console.log('\nNew webhook info:');
  console.log('URL:', infoData.result?.url);
  console.log('Has secret:', !!infoData.result?.secret_token);
  
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
