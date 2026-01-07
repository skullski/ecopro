import 'dotenv/config';
import { ensureConnection } from '../server/utils/database';

async function check() {
  const db = await ensureConnection();
  const now = new Date().toISOString();
  
  const msg = await db.query(`
    SELECT sm.*, bs.telegram_bot_token IS NOT NULL as has_token, bs.enabled as bot_enabled, bs.provider
    FROM scheduled_messages sm
    LEFT JOIN bot_settings bs ON sm.client_id = bs.client_id
    WHERE sm.id = 12
  `);
  console.log('Message 12:', JSON.stringify(msg.rows[0], null, 2));
  console.log('Current time:', now);
  console.log('Scheduled at:', msg.rows[0]?.scheduled_at);
  console.log('Is past due?', new Date(msg.rows[0]?.scheduled_at) <= new Date());
  
  process.exit(0);
}
check();
