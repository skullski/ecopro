import 'dotenv/config';
import { ensureConnection } from '../server/utils/database';
import { registerTelegramWebhook, upsertTelegramWebhookSecret } from '../server/utils/telegram';
import { getPublicBaseUrl } from '../server/utils/public-url';

type TgResp<T> = { ok: boolean; result?: T; description?: string; error_code?: number };

async function tgCall<T>(botToken: string, method: string, body?: any): Promise<TgResp<T>> {
  const url = `https://api.telegram.org/bot${botToken}/${method}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  const data = (await resp.json().catch(() => null)) as TgResp<T> | null;
  return (
    data || {
      ok: false,
      description: `Invalid response (${resp.status})`,
      error_code: resp.status,
    }
  );
}

async function main() {
  const botUsername = (process.argv[2] || 'SahlaOrdersBot').trim().replace(/^@/, '');
  const db = await ensureConnection();

  const botRow = await db.query(
    `SELECT client_id, telegram_bot_token
     FROM bot_settings
     WHERE enabled = true
       AND telegram_bot_username IS NOT NULL
       AND LOWER(telegram_bot_username) = LOWER($1)
       AND telegram_bot_token IS NOT NULL
     ORDER BY updated_at DESC NULLS LAST
     LIMIT 1`,
    [botUsername]
  );

  const clientId = Number(botRow.rows?.[0]?.client_id);
  const botToken = String(botRow.rows?.[0]?.telegram_bot_token || '').trim();

  if (!clientId || !botToken) {
    console.log(JSON.stringify({ ok: false, reason: 'Bot not found/configured', botUsername }, null, 2));
    return;
  }

  const before = await tgCall<any>(botToken, 'getWebhookInfo');

  const secret = await upsertTelegramWebhookSecret(clientId, botToken);
  const baseUrl = getPublicBaseUrl();
  const hook = await registerTelegramWebhook({ botToken, baseUrl, secretToken: secret });

  const after = await tgCall<any>(botToken, 'getWebhookInfo');

  console.log(
    JSON.stringify(
      {
        ok: true,
        botUsername,
        clientId,
        baseUrl,
        registerWebhookOk: hook.ok,
        registerWebhookError: hook.error,
        webhookInfoBefore: before,
        webhookInfoAfter: after,
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
