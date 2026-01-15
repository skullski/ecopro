import 'dotenv/config';
import { ensureConnection } from '../server/utils/database';

async function main() {
  const db = await ensureConnection();
  const id = Number(process.env.BOT_MESSAGE_ID || 0);
  if (!id) throw new Error('Missing BOT_MESSAGE_ID');

  const res = await db.query(
    `SELECT id, order_id, client_id, customer_phone, message_type, status, send_at, sent_at, error_message, created_at, updated_at
     FROM bot_messages
     WHERE id = $1`,
    [id]
  );

  console.log(JSON.stringify(res.rows[0] || null, null, 2));
  await db.end();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
