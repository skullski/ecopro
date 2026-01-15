import 'dotenv/config';
import { ensureConnection } from '../server/utils/database';

async function main() {
  const db = await ensureConnection();
  const clientId = Number(process.env.TEST_CLIENT_ID || 10);

  const res = await db.query(
    `SELECT id, client_id, customer_phone, status, created_at
     FROM store_orders
     WHERE client_id = $1
     ORDER BY created_at DESC
     LIMIT 5`,
    [clientId]
  );

  console.table(res.rows);
  await db.end();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
