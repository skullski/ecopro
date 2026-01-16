import 'dotenv/config';
import { ensureConnection } from '../server/utils/database';
import { sendTelegramMessage } from '../server/utils/bot-messaging';

async function main() {
  const botUsername = (process.argv[2] || 'SahlaOrdersBot').trim();
  const message = (process.argv.slice(3).join(' ') || '✅ EcoPro test: Telegram bot messaging is working.').trim();

  const db = await ensureConnection();

  // Find the most recent Telegram chat mapped for this bot username.
  const row = await db.query(
    `SELECT bs.client_id,
            bs.telegram_bot_token,
            bs.telegram_bot_username,
            cmi.customer_phone,
            cmi.telegram_chat_id,
            cmi.updated_at
     FROM bot_settings bs
     JOIN customer_messaging_ids cmi ON cmi.client_id = bs.client_id
     WHERE bs.enabled = true
       AND bs.telegram_bot_token IS NOT NULL
       AND bs.telegram_bot_username IS NOT NULL
       AND LOWER(bs.telegram_bot_username) = LOWER($1)
       AND cmi.telegram_chat_id IS NOT NULL
     ORDER BY cmi.updated_at DESC NULLS LAST
     LIMIT 1`,
    [botUsername.replace(/^@/, '')]
  );

  const match = row.rows?.[0] as
    | {
        client_id: number;
        telegram_bot_token: string;
        telegram_bot_username: string;
        customer_phone: string;
        telegram_chat_id: string;
        updated_at: string;
      }
    | undefined;

  if (!match?.telegram_bot_token || !match?.telegram_chat_id) {
    console.log(
      JSON.stringify(
        {
          ok: false,
          reason: 'No recent telegram_chat_id found in DB for this bot username',
          botUsername,
        },
        null,
        2
      )
    );
    return;
  }

  await sendTelegramMessage(String(match.telegram_bot_token), String(match.telegram_chat_id), message);

  console.log(
    JSON.stringify(
      {
        ok: true,
        sentTo: {
          botUsername: match.telegram_bot_username,
          clientId: match.client_id,
          customerPhone: match.customer_phone,
          telegramChatId: match.telegram_chat_id,
          updatedAt: match.updated_at,
        },
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
