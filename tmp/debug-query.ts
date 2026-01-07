import 'dotenv/config';
import { ensureConnection } from '../server/utils/database';

async function check() {
  const db = await ensureConnection();
  
  // Run the exact query from the worker
  const result = await db.query(`
    SELECT sm.*, bs.telegram_bot_token IS NOT NULL as has_token
    FROM scheduled_messages sm
    JOIN bot_settings bs ON sm.client_id = bs.client_id AND bs.provider = 'telegram' AND bs.enabled = true
    WHERE sm.status = 'pending' 
      AND sm.scheduled_at <= NOW()
    ORDER BY sm.scheduled_at ASC
    LIMIT 50
  `);
  
  console.log('Pending messages ready to send:', result.rows.length);
  for (const row of result.rows) {
    console.log(`- Message ${row.id} for order ${row.order_id}, scheduled: ${row.scheduled_at}, chat_id: ${row.telegram_chat_id}`);
  }
  
  process.exit(0);
}
check();
