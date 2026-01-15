import 'dotenv/config';
import { ensureConnection } from '../server/utils/database';

async function main() {
  const db = await ensureConnection();
  const platformPageId = String(process.env.PLATFORM_FB_PAGE_ID || '929814950220320').trim();

  const before = await db.query(
    `SELECT COUNT(*)::int AS cnt
     FROM bot_settings
     WHERE messenger_enabled = true
       AND fb_page_id = $1
       AND fb_page_access_token IS NOT NULL`,
    [platformPageId]
  );

  const upd = await db.query(
    `UPDATE bot_settings
     SET fb_page_access_token = NULL,
         updated_at = NOW()
     WHERE messenger_enabled = true
       AND fb_page_id = $1
       AND fb_page_access_token IS NOT NULL`,
    [platformPageId]
  );

  const after = await db.query(
    `SELECT COUNT(*)::int AS cnt
     FROM bot_settings
     WHERE messenger_enabled = true
       AND fb_page_id = $1
       AND fb_page_access_token IS NOT NULL`,
    [platformPageId]
  );

  console.log('platformPageId:', platformPageId);
  console.log('before count with token:', before.rows[0]?.cnt);
  console.log('rows updated:', upd.rowCount);
  console.log('after count with token:', after.rows[0]?.cnt);

  await db.end();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
