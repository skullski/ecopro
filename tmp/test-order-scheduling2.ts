import 'dotenv/config';
import { ensureConnection } from '../server/utils/database';

async function test() {
  const db = await ensureConnection();
  
  // Test using the new PostgreSQL INTERVAL method with a simple test
  const delayMinutes = 5;
  
  // Just test the SQL expression works correctly
  const result = await db.query(`
    SELECT 
      NOW() as now,
      NOW() + ($1 || ' minutes')::INTERVAL as scheduled_for,
      (NOW() + ($1 || ' minutes')::INTERVAL) - NOW() as delay_interval
  `, [delayMinutes]);
  
  console.log('Testing PostgreSQL INTERVAL scheduling:');
  console.log('- NOW():', result.rows[0].now);
  console.log('- Scheduled for:', result.rows[0].scheduled_for);
  console.log('- Delay:', result.rows[0].delay_interval);
  
  // Check if an existing scheduled message would be processed
  const check = await db.query(`
    SELECT 
      id, order_id, status,
      scheduled_at,
      NOW() as current_time,
      scheduled_at <= NOW() as is_ready
    FROM scheduled_messages
    WHERE status = 'pending'
    LIMIT 3
  `);
  
  console.log('\nCurrent pending messages:');
  for (const row of check.rows) {
    console.log(`- Msg ${row.id} for order ${row.order_id}: ready=${row.is_ready}`);
  }
  
  process.exit(0);
}
test();
