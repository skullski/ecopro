import 'dotenv/config';
import { ensureConnection } from '../server/utils/database';

async function test() {
  const db = await ensureConnection();
  
  // Simulate scheduling a message using the new PostgreSQL INTERVAL method
  const delayMinutes = 5;
  const testOrderId = 999;
  const clientId = 10;
  
  // First clean up any existing test
  await db.query(`DELETE FROM scheduled_messages WHERE order_id = $1`, [testOrderId]);
  
  // Insert using the new method
  const result = await db.query(`
    INSERT INTO scheduled_messages 
    (client_id, order_id, telegram_chat_id, message_content, message_type, scheduled_at, status)
    VALUES ($1, $2, $3, $4, $5, NOW() + ($6 || ' minutes')::INTERVAL, 'pending')
    RETURNING id, scheduled_at, 
      NOW() as inserted_at,
      scheduled_at - NOW() as actual_delay
  `, [clientId, testOrderId, '5941629106', 'Test message', 'order_confirmation', delayMinutes]);
  
  console.log('Scheduled test message:');
  console.log('- ID:', result.rows[0].id);
  console.log('- Inserted at (NOW):', result.rows[0].inserted_at);
  console.log('- Scheduled at:', result.rows[0].scheduled_at);
  console.log('- Actual delay:', result.rows[0].actual_delay);
  
  // Verify the comparison works
  const check = await db.query(`
    SELECT 
      id,
      scheduled_at,
      NOW() as current_time,
      scheduled_at <= NOW() as is_ready_now,
      scheduled_at <= NOW() + INTERVAL '5 minutes' as will_be_ready_in_5min
    FROM scheduled_messages
    WHERE order_id = $1
  `, [testOrderId]);
  
  console.log('\nVerification:');
  console.log('- Is ready now?', check.rows[0].is_ready_now);
  console.log('- Will be ready in 5 min?', check.rows[0].will_be_ready_in_5min);
  
  // Clean up
  await db.query(`DELETE FROM scheduled_messages WHERE order_id = $1`, [testOrderId]);
  console.log('\nTest cleaned up successfully');
  
  process.exit(0);
}
test();
