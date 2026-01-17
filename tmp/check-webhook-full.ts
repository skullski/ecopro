import { ensureConnection } from '../server/utils/database';

async function main() {
  const pool = await ensureConnection();
  
  // Get client 2's webhook secret
  const res = await pool.query('SELECT client_id, telegram_bot_token, telegram_webhook_secret FROM bot_settings WHERE client_id = 2');
  const token = res.rows[0]?.telegram_bot_token;
  const secret = res.rows[0]?.telegram_webhook_secret;
  
  console.log('Token exists:', !!token);
  console.log('Webhook secret exists:', !!secret);
  console.log('Secret value:', secret);
  
  // Check what webhook is set on Telegram's side
  const webhookRes = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
  const data = await webhookRes.json();
  console.log('\nWebhook Info from Telegram:');
  console.log('URL:', data.result?.url);
  console.log('Has custom certificate:', data.result?.has_custom_certificate);
  console.log('Pending updates:', data.result?.pending_update_count);
  console.log('Last error:', data.result?.last_error_message);
  console.log('Last error date:', data.result?.last_error_date ? new Date(data.result.last_error_date * 1000).toISOString() : 'none');
  
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
