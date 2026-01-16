import 'dotenv/config';
import { ensureConnection } from '../server/utils/database';

async function main() {
  const db = await ensureConnection();
  const r = await db.query(
    `SELECT client_id,
            enabled,
            provider,
            telegram_bot_username,
            length(COALESCE(telegram_bot_username,'')) as username_len,
            telegram_bot_token IS NOT NULL as has_token,
            updated_at
     FROM bot_settings
     WHERE telegram_bot_token IS NOT NULL
     ORDER BY updated_at DESC NULLS LAST
     LIMIT 50`
  );
  console.table(r.rows);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
