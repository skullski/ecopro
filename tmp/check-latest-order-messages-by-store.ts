import 'dotenv/config';
import { ensureConnection } from '../server/utils/database';

async function main() {
  const storeSlug = (process.argv[2] || '').trim();
  if (!storeSlug) {
    console.error('Usage: tsx tmp/check-latest-order-messages-by-store.ts <storeSlug>');
    process.exit(1);
  }

  const pool = await ensureConnection();

  const storeRes = await pool.query(
    `SELECT client_id, store_slug, store_name
     FROM client_store_settings
     WHERE store_slug = $1
        OR LOWER(REGEXP_REPLACE(store_name, '[^a-zA-Z0-9]', '', 'g')) = LOWER($1)
     LIMIT 1`,
    [storeSlug]
  );

  if (!storeRes.rows.length) {
    console.error('Store not found for slug:', storeSlug);
    process.exit(1);
  }

  const clientId = Number(storeRes.rows[0].client_id);
  const orderRes = await pool.query(
    `SELECT id, customer_phone, created_at
     FROM store_orders
     WHERE client_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [clientId]
  );

  if (!orderRes.rows.length) {
    console.error('No orders found for client_id:', clientId);
    process.exit(1);
  }

  const order = orderRes.rows[0];

  const msgsRes = await pool.query(
    `SELECT id, message_type, status, send_at, sent_at, error_message
     FROM bot_messages
     WHERE client_id = $1 AND order_id = $2
     ORDER BY id ASC`,
    [clientId, Number(order.id)]
  );

  console.log(JSON.stringify({
    storeSlug,
    clientId,
    latestOrder: order,
    botMessages: msgsRes.rows,
  }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
