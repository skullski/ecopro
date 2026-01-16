import './dotenv';
import { ensureConnection } from '../server/utils/database';

async function main() {
  const db = await ensureConnection();

  const noest = await db.query(
    "SELECT id, name FROM delivery_companies WHERE LOWER(name) = 'noest' AND is_active = true LIMIT 1"
  );
  const companyId = noest.rows?.[0]?.id as number | undefined;

  let integrationsPreview: any[] = [];
  if (companyId) {
    const integAny = await db.query(
      'SELECT client_id, is_enabled, configured_at, updated_at FROM delivery_integrations WHERE delivery_company_id = $1 ORDER BY updated_at DESC NULLS LAST, configured_at DESC NULLS LAST LIMIT 5',
      [companyId]
    );
    integrationsPreview = integAny.rows;
  }

  let clientId: number | null = null;
  if (companyId) {
    const integ = await db.query(
      'SELECT client_id FROM delivery_integrations WHERE delivery_company_id = $1 AND is_enabled = true ORDER BY updated_at DESC NULLS LAST, configured_at DESC NULLS LAST LIMIT 1',
      [companyId]
    );
    clientId = (integ.rows?.[0]?.client_id as number | undefined) ?? null;
  }

  let orderId: number | null = null;
  let orderClientId: number | null = null;
  if (clientId) {
    const order = await db.query(
      'SELECT id, delivery_company_id FROM store_orders WHERE client_id = $1 ORDER BY created_at DESC LIMIT 1',
      [clientId]
    );
    orderId = (order.rows?.[0]?.id as number | undefined) ?? null;
  }

  // If no client has Noest integration yet, still try to find an order already assigned to Noest
  // so we can attempt generate-label without modifying any orders.
  if (!orderId && companyId) {
    const existingNoestOrder = await db.query(
      'SELECT id, client_id FROM store_orders WHERE delivery_company_id = $1 ORDER BY created_at DESC LIMIT 1',
      [companyId]
    );
    orderId = (existingNoestOrder.rows?.[0]?.id as number | undefined) ?? null;
    orderClientId = (existingNoestOrder.rows?.[0]?.client_id as number | undefined) ?? null;
  }

  console.log(
    JSON.stringify({ companyId: companyId ?? null, clientId, orderId, orderClientId, integrationsPreview }, null, 2)
  );

  await db.end();
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
