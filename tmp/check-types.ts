import 'dotenv/config';
import { ensureConnection } from '../server/utils/database';

async function check() {
  const db = await ensureConnection();
  
  // Check column types
  const types = await db.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'scheduled_messages'
    AND column_name IN ('scheduled_at', 'created_at')
  `);
  console.log('Column types:');
  console.table(types.rows);
  
  // Check what the comparison actually returns
  const test = await db.query(`
    SELECT 
      id, 
      scheduled_at,
      NOW() as db_now,
      scheduled_at <= NOW() as is_ready,
      scheduled_at AT TIME ZONE 'UTC' as scheduled_utc,
      NOW() AT TIME ZONE 'UTC' as now_utc
    FROM scheduled_messages
    WHERE id = 12
  `);
  console.log('Test comparison:', test.rows[0]);
  
  process.exit(0);
}
check();
