import 'dotenv/config';
import { ensureConnection } from '../server/utils/database';
import { sendBotMessagesForOrder } from '../server/routes/order-confirmation';

async function main() {
  const orderId = Number(process.argv[2] || 0);
  if (!Number.isFinite(orderId) || orderId <= 0) {
    console.error('Usage: tsx tmp/schedule-messenger-for-existing-order.ts <orderId>');
    process.exit(1);
  }

  const pool = await ensureConnection();

  const orderRes = await pool.query(
    `SELECT id, client_id, product_id, customer_name, customer_phone, total_price
     FROM store_orders
     WHERE id = $1
     LIMIT 1`,
    [orderId]
  );

  if (!orderRes.rows.length) {
    console.error('Order not found:', orderId);
    process.exit(1);
  }

  const order = orderRes.rows[0];
  const clientId = Number(order.client_id);

  const storeRes = await pool.query(
    `SELECT store_name, COALESCE(store_slug, '') as store_slug
     FROM client_store_settings
     WHERE client_id = $1
     LIMIT 1`,
    [clientId]
  );
  const storeName = storeRes.rows[0]?.store_name || 'EcoPro Store';
  const storeSlug = (storeRes.rows[0]?.store_slug || '').trim();
  if (!storeSlug) {
    console.error('Store slug missing for client_id:', clientId);
    process.exit(1);
  }

  const productRes = await pool.query(
    `SELECT title FROM client_store_products WHERE id = $1 LIMIT 1`,
    [Number(order.product_id)]
  );
  const productTitle = productRes.rows[0]?.title || 'Product';

  await sendBotMessagesForOrder(
    Number(order.id),
    clientId,
    String(order.customer_phone || ''),
    String(order.customer_name || ''),
    storeName,
    productTitle,
    Number(order.total_price || 0),
    storeSlug,
    { skipTelegram: true }
  );

  const msgsRes = await pool.query(
    `SELECT id, message_type, status, send_at, error_message
     FROM bot_messages
     WHERE client_id = $1 AND order_id = $2
     ORDER BY id ASC`,
    [clientId, Number(order.id)]
  );

  console.log(JSON.stringify({
    scheduled: true,
    orderId: Number(order.id),
    clientId,
    storeSlug,
    botMessages: msgsRes.rows,
  }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
