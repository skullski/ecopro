import 'dotenv/config';
import { ensureConnection } from '../server/utils/database';

async function test() {
  const db = await ensureConnection();
  
  // Check customer_messaging_ids to see which customers have channels
  const customers = await db.query(`
    SELECT 
      cm.customer_phone,
      cm.telegram_chat_id,
      cm.viber_user_id,
      CASE 
        WHEN cm.telegram_chat_id IS NOT NULL THEN 'telegram'
        WHEN cm.viber_user_id IS NOT NULL THEN 'viber'
        ELSE 'none'
      END as detected_channel
    FROM customer_messaging_ids cm
    WHERE cm.client_id = 10
  `);
  
  console.log('Customer channels for client 10:');
  console.table(customers.rows);
  
  // Show how many would get messages via which channel
  const byChannel = await db.query(`
    SELECT 
      CASE 
        WHEN telegram_chat_id IS NOT NULL THEN 'telegram'
        WHEN viber_user_id IS NOT NULL THEN 'viber'
        ELSE 'none'
      END as channel,
      COUNT(*) as count
    FROM customer_messaging_ids
    WHERE client_id = 10
    GROUP BY 1
  `);
  console.log('\nChannel distribution:');
  console.table(byChannel.rows);
  
  process.exit(0);
}
test();
