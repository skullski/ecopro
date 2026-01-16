import 'dotenv/config';
import { ensureConnection } from '../server/utils/database';
import { upsertTelegramWebhookSecret, registerTelegramWebhook } from '../server/utils/telegram';
import { getPublicBaseUrl } from '../server/utils/public-url';
import { sendTelegramMessage } from '../server/utils/bot-messaging';

type TgResp<T> = { ok: boolean; result?: T; description?: string; error_code?: number };

async function tgCall<T>(botToken: string, method: string, body?: any): Promise<TgResp<T>> {
  const url = `https://api.telegram.org/bot${botToken}/${method}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : JSON.stringify({}),
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
  const message = (process.argv.slice(3).join(' ') || '✅ EcoPro test: Telegram messaging is working.').trim();

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

  // Snapshot webhook info (best-effort)
  const webhookInfo = await tgCall<any>(botToken, 'getWebhookInfo');

  // Temporarily disable webhook so we can use getUpdates to discover chat id.
  const del = await tgCall<any>(botToken, 'deleteWebhook', { drop_pending_updates: false });

  // Pull a few recent updates; look for /start.
  const updates = await tgCall<any>(botToken, 'getUpdates', { limit: 20, timeout: 0 });

  // Restore webhook to current public URL + stable secret.
  const secretToken = await upsertTelegramWebhookSecret(clientId, botToken);
  const baseUrl = getPublicBaseUrl();
  const hook = await registerTelegramWebhook({ botToken, baseUrl, secretToken });

  const candidates: Array<{ chatId: string; text: string; date?: number }> = [];
  if (updates.ok && Array.isArray(updates.result)) {
    for (const u of updates.result) {
      const text: string | undefined = u?.message?.text;
      const chatId = u?.message?.chat?.id != null ? String(u.message.chat.id) : null;
      if (chatId && typeof text === 'string' && text.trim().startsWith('/start')) {
        candidates.push({ chatId, text: text.trim(), date: u?.message?.date });
      }
    }
  }

  // Pick most recent /start.
  candidates.sort((a, b) => (b.date || 0) - (a.date || 0));
  const picked = candidates[0];

  if (!picked) {
    console.log(
      JSON.stringify(
        {
          ok: false,
          reason: 'Could not find a recent /start update (no chat id discovered)',
          botUsername,
          webhookInfo,
          deleteWebhookOk: del.ok,
          restoreWebhookOk: hook.ok,
        },
        null,
        2
      )
    );
    return;
  }

  await sendTelegramMessage(botToken, picked.chatId, message);

  console.log(
    JSON.stringify(
      {
        ok: true,
        botUsername,
        sentToChatId: picked.chatId,
        startTextSeen: picked.text,
        webhookInfo,
        deleteWebhookOk: del.ok,
        restoreWebhookOk: hook.ok,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
