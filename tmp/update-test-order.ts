import 'dotenv/config';
import { ensureConnection } from '../server/utils/database';

async function main() {
  const db = await ensureConnection();
  
  // Update order 101 with Alger wilaya (id=16) and a commune id
  // Use shipping_wilaya_id=16 (Alger) and shipping_commune_id=some valid value
  const result = await db.query(`
    UPDATE store_orders
    SET shipping_wilaya_id = 16,
        shipping_commune_id = 1601,
        shipping_address = '123 Test Street, Alger Centre',
        status = 'pending',
        delivery_company_id = NULL,
        tracking_number = NULL
    WHERE id = 101
    RETURNING id, shipping_wilaya_id, shipping_commune_id, shipping_address
  `);
  
  if (result.rows.length === 0) {
    console.log('Order 101 not found');
  } else {
    console.log('Updated order 101:', result.rows[0]);
  }
  process.exit(0);
}

main();
