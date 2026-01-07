import 'dotenv/config';
import { ensureConnection } from '../server/utils/database';

async function check() {
  const db = await ensureConnection();
  
  // Check recent preconnect tokens
  const tokens = await db.query(`
    SELECT token, customer_phone, client_id, created_at, expires_at, used_at,
           expires_at > NOW() as is_valid
    FROM customer_preconnect_tokens
    ORDER BY created_at DESC
    LIMIT 10
  `);
  console.log('Recent preconnect tokens:');
  console.table(tokens.rows);
  
  // Check customer_messaging_ids for phone 055252618 or similar
  const links = await db.query(`
    SELECT * FROM customer_messaging_ids
    WHERE customer_phone LIKE '%552526%' OR customer_phone LIKE '%55252%'
  `);
  console.log('\nCustomer messaging IDs for phone containing 552526:');
  console.table(links.rows);
  
  process.exit(0);
}
check();
