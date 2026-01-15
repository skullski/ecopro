import 'dotenv/config';
import { ensureConnection } from '../server/utils/database';

async function main() {
  const db = await ensureConnection();
  const clientId = Number(process.env.TEST_CLIENT_ID || 10);

  // The platform page id used by Render (render.yaml) is 929814950220320.
  // We move client 10 to use the platform env token by clearing the DB token.
  const platformPageId = String(process.env.PLATFORM_FB_PAGE_ID || '929814950220320').trim();

  const before = await db.query(
    `SELECT client_id, messenger_enabled, fb_page_id, fb_page_access_token IS NOT NULL AS has_token
     FROM bot_settings
     WHERE client_id = $1`,
    [clientId]
  );
  console.log('Before:', before.rows[0]);

  await db.query(
    `UPDATE bot_settings
     SET messenger_enabled = true,
         provider = 'facebook',
         fb_page_id = $2,
         fb_page_access_token = NULL,
         updated_at = NOW()
     WHERE client_id = $1`,
    [clientId, platformPageId]
  );

  const after = await db.query(
    `SELECT client_id, messenger_enabled, fb_page_id, fb_page_access_token IS NOT NULL AS has_token
     FROM bot_settings
     WHERE client_id = $1`,
    [clientId]
  );
  console.log('After:', after.rows[0]);

  await db.end();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
