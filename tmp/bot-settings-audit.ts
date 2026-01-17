import { ensureConnection } from '../server/utils/database';

function mask(value: unknown) {
  const s = String(value || '').trim();
  if (!s) return '';
  if (s.length <= 8) return '***';
  return `${s.slice(0, 3)}***${s.slice(-3)}`;
}

async function main() {
  const pool = await ensureConnection();

  // Only show whether creds exist; never print full secrets.
  const res = await pool.query(
    `SELECT
        client_id,
        COALESCE(store_name, '') AS store_name,
        enabled,
        COALESCE(provider, '') AS provider,
        telegram_bot_username,
        (telegram_bot_token IS NOT NULL AND BTRIM(telegram_bot_token) <> '') AS has_telegram_token,
        messenger_enabled,
        fb_page_id,
        (fb_page_access_token IS NOT NULL AND BTRIM(fb_page_access_token) <> '') AS has_fb_token
     FROM bot_settings
     ORDER BY client_id ASC`
  );

  console.log('bot_settings rows:', res.rowCount);
  for (const row of res.rows) {
    const store = row.store_name ? ` (${row.store_name})` : '';
    const telegramUser = row.telegram_bot_username ? `@${row.telegram_bot_username}` : '';
    const fbPage = row.fb_page_id ? mask(row.fb_page_id) : '';
    console.log(
      `- client_id=${row.client_id}${store} enabled=${row.enabled} provider=${row.provider || '-'} ` +
        `telegram_token=${row.has_telegram_token} telegram_user=${telegramUser || '-'} ` +
        `messenger_enabled=${row.messenger_enabled} fb_page_id=${fbPage || '-'} fb_token=${row.has_fb_token}`
    );
  }
}

main().catch((e) => {
  console.error('audit failed:', e);
  process.exit(1);
});
