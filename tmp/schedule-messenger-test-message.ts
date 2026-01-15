import 'dotenv/config';
import { ensureConnection } from '../server/utils/database';

async function main() {
  const db = await ensureConnection();

  const clientId = Number(process.env.TEST_CLIENT_ID || 10);
  const orderId = Number(process.env.TEST_ORDER_ID || 0);
  const phone = String(process.env.TEST_PHONE || '0550000000').replace(/\D/g, '');

  if (!Number.isFinite(clientId) || clientId <= 0) {
    throw new Error('Invalid TEST_CLIENT_ID');
  }
  if (!Number.isFinite(orderId) || orderId <= 0) {
    throw new Error('Missing/invalid TEST_ORDER_ID (must be a real store_orders.id)');
  }
  if (phone.length < 9) {
    throw new Error('Invalid TEST_PHONE');
  }

  // Put a pending messenger confirmation message due immediately.
  const insert = await db.query(
    `INSERT INTO bot_messages (order_id, client_id, customer_phone, message_type, message_content, confirmation_link, send_at, status, created_at)
     VALUES ($1, $2, $3, 'messenger', $4, $5, NOW(), 'pending', NOW())
     RETURNING id, order_id, client_id, customer_phone, message_type, status, send_at`,
    [
      orderId,
      clientId,
      phone,
      `TEST: Please confirm order #${orderId} (simulated).`,
      `https://example.com/store/test/order/${orderId}/confirm`,
    ]
  );

  console.log('Inserted bot_messages row:', insert.rows[0]);
  await db.end();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
