import './dotenv';
import { ensureConnection } from '../server/utils/database';

async function main() {
  const pool = await ensureConnection();

  const tables = ['order_statuses', 'bot_settings', 'scheduled_messages', 'bot_messages'] as const;
  for (const table of tables) {
    const res = await pool.query(
      `SELECT column_name, data_type
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1
       ORDER BY ordinal_position`,
      [table]
    );
    console.log(`\n== ${table} columns ==`);
    for (const r of res.rows) {
      console.log(`${r.column_name}: ${r.data_type}`);
    }
  }

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
