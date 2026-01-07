import 'dotenv/config';
import { ensureConnection } from '../server/utils/database';

async function debug() {
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
  
  console.log('Pending messages ready to process:', result.rows.length);
  for (const msg of result.rows) {
    console.log(`- Msg ${msg.id} for order ${msg.order_id}: chat_id=${msg.telegram_chat_id}, has_token=${msg.has_token}`);
  }
  
  // Check if messages 9,10,11 have telegram_chat_id
  const msgs = await db.query(`
    SELECT id, order_id, telegram_chat_id, error_message
    FROM scheduled_messages
    WHERE id IN (9, 10, 11)
  `);
  console.log('\nMessages 9,10,11 details:');
  console.table(msgs.rows);
  
  process.exit(0);
}
debug();
