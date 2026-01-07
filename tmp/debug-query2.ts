import 'dotenv/config';
import { ensureConnection } from '../server/utils/database';

async function check() {
  const db = await ensureConnection();
  
  // Check DB time vs message time
  const timeRes = await db.query(`SELECT NOW() as db_now`);
  console.log('DB NOW:', timeRes.rows[0].db_now);
  
  // Check message 12 directly
  const msg12 = await db.query(`
    SELECT id, status, scheduled_at, scheduled_at <= NOW() as is_ready
    FROM scheduled_messages WHERE id = 12
  `);
  console.log('Message 12:', msg12.rows[0]);
  
  // Check all pending
  const pending = await db.query(`
    SELECT id, order_id, status, scheduled_at, scheduled_at <= NOW() as is_ready, telegram_chat_id
    FROM scheduled_messages WHERE status = 'pending'
  `);
  console.log('\nAll pending messages:');
  console.table(pending.rows);
  
  process.exit(0);
}
check();
