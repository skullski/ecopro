import 'dotenv/config';
import { ensureConnection } from '../server/utils/database';

async function main() {
  const db = await ensureConnection();
  const clientId = 10;

  const res = await db.query(
    `SELECT di.delivery_company_id, dc.name AS company_name, di.is_enabled, di.configured_at, di.updated_at
     FROM delivery_integrations di
     JOIN delivery_companies dc ON dc.id = di.delivery_company_id
     WHERE di.client_id = $1
     ORDER BY di.updated_at DESC NULLS LAST, di.configured_at DESC NULLS LAST`,
    [clientId]
  );

  console.log(JSON.stringify(res.rows, null, 2));
  await db.end();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
