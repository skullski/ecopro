import 'dotenv/config';
import { ensureConnection } from '../server/utils/database';

async function main() {
  const pool = await ensureConnection();
  const clientRes = await pool.query(
    `SELECT id, email FROM clients WHERE email = $1 LIMIT 1`,
    ['skull@gmail.com']
  );
  if (!clientRes.rows.length) {
    console.log(JSON.stringify({ error: 'client_not_found' }, null, 2));
    return;
  }
  const clientId = Number(clientRes.rows[0].id);
  const res = await pool.query(
    `SELECT client_id, store_slug, store_name
     FROM client_store_settings
     WHERE client_id = $1
     LIMIT 5`,
    [clientId]
  );
  console.log(JSON.stringify({ clientId, stores: res.rows }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
