import 'dotenv/config';
import { ensureConnection } from '../server/utils/database';

async function main() {
  const db = await ensureConnection();
  
  // Create a test order with Alger wilaya
  const result = await db.query(`
    INSERT INTO store_orders (client_id, customer_name, customer_phone, wilaya, commune, delivery_address, total_price, status, created_at, updated_at)
    VALUES (10, 'ZR Test Customer', '0555123456', 'Alger', 'Alger Centre', '123 Test Street', 2500, 'pending', NOW(), NOW())
    RETURNING id
  `);
  
  console.log('Created test order:', result.rows[0].id);
  process.exit(0);
}

main();
