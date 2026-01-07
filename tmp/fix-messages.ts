import 'dotenv/config';
import { ensureConnection } from '../server/utils/database';

async function fix() {
  const db = await ensureConnection();
  
  // Check timezone
  const tz = await db.query(`SHOW timezone`);
  console.log('DB Timezone:', tz.rows[0].timezone);
  
  // Fix the scheduled_at for messages that should already be ready
  // Set them to 5 minutes ago to trigger immediately
  const result = await db.query(`
    UPDATE scheduled_messages 
    SET scheduled_at = NOW() - INTERVAL '5 minutes'
    WHERE status = 'pending'
    RETURNING id, order_id, scheduled_at
  `);
  
  console.log('Fixed messages:', result.rows);
  
  process.exit(0);
}
fix();
