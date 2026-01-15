import 'dotenv/config';
import { ensureConnection } from '../server/utils/database';

async function main() {
  const db = await ensureConnection();
  const clientId = Number(process.env.TEST_CLIENT_ID || 10);

  const res = await db.query(
    `SELECT client_id, messenger_enabled, fb_page_id, fb_page_access_token
     FROM bot_settings
     WHERE client_id = $1
     LIMIT 1`,
    [clientId]
  );

  const row = res.rows[0];
  if (!row) {
    console.error('No bot_settings row for client', clientId);
    process.exitCode = 1;
    return;
  }

  const token = String(row.fb_page_access_token || '').trim();
  const storedPageId = String(row.fb_page_id || '').trim();

  console.log('client_id:', row.client_id);
  console.log('messenger_enabled:', row.messenger_enabled);
  console.log('stored fb_page_id:', storedPageId || '(empty)');
  console.log('has token:', !!token);

  if (!token) {
    console.log('No token to validate.');
    return;
  }

  const url = `https://graph.facebook.com/v18.0/me?fields=id,name,category&access_token=${encodeURIComponent(token)}`;
  const resp = await fetch(url);
  const data: any = await resp.json().catch(() => null);

  console.log('Graph /me status:', resp.status);
  console.log('Graph /me response:', JSON.stringify(data, null, 2));

  if (resp.ok && data?.id) {
    const tokenPageId = String(data.id);
    if (storedPageId && storedPageId !== tokenPageId) {
      console.log('MISMATCH: stored page id != token page id');
      console.log('stored:', storedPageId);
      console.log('token :', tokenPageId);
    } else {
      console.log('MATCH: stored page id matches token page id (or stored empty).');
    }
  }

  await db.end();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
