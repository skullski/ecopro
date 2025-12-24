import type { RequestHandler } from 'express';
import { ensureConnection } from '../utils/database';
import { replaceTemplateVariables, sendTelegramMessage } from '../utils/bot-messaging';

async function answerCallbackQuery(opts: { botToken: string; callbackQueryId: string; text?: string }): Promise<void> {
  try {
    const url = `https://api.telegram.org/bot${opts.botToken}/answerCallbackQuery`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: opts.callbackQueryId, text: opts.text || '' }),
    }).catch(() => null);
  } catch {
    // ignore
  }
}

function parseCallback(data: string | undefined | null): { action: 'approve' | 'decline'; token: string } | null {
  if (!data) return null;
  const trimmed = String(data).trim();
  const [actionRaw, token] = trimmed.split(':', 2);
  if (!token) return null;
  if (actionRaw === 'approve' || actionRaw === 'decline') {
    return { action: actionRaw, token };
  }
  return null;
}

function parseStartPayload(text: string | undefined | null): string | null {
  if (!text) return null;
  const trimmed = text.trim();
  if (!trimmed.startsWith('/start')) return null;
  const parts = trimmed.split(/\s+/);
  const payload = parts[1];
  if (!payload) return null;
  return payload.trim();
}

export const telegramWebhook: RequestHandler = async (req, res) => {
  // Telegram expects fast response.
  try {
    const secret = (req.headers['x-telegram-bot-api-secret-token'] as string | undefined)?.trim();
    if (!secret) return res.status(401).json({ ok: false });

    const pool = await ensureConnection();

    const botRes = await pool.query(
      `SELECT client_id, telegram_bot_token, template_greeting
       FROM bot_settings
       WHERE telegram_webhook_secret = $1 AND enabled = true AND provider = 'telegram'
       LIMIT 1`,
      [secret]
    );

    if (!botRes.rows.length) {
      return res.status(401).json({ ok: false });
    }

    const clientId = Number(botRes.rows[0].client_id);
    const botToken = botRes.rows[0].telegram_bot_token as string | undefined;
    const greetingTemplate = botRes.rows[0].template_greeting as string | undefined;

    if (!botToken) return res.status(200).json({ ok: true });

    const update = req.body as any;

    // Inline button callbacks
    const cb = update?.callback_query;
    if (cb) {
      const callbackId = cb?.id != null ? String(cb.id) : null;
      const chatId = cb?.message?.chat?.id != null ? String(cb.message.chat.id) : null;
      const data = cb?.data as string | undefined;

      const parsed = parseCallback(data);
      if (!callbackId || !chatId || !parsed) {
        if (callbackId) await answerCallbackQuery({ botToken, callbackQueryId: callbackId, text: 'Invalid action' });
        return res.status(200).json({ ok: true });
      }

      // Resolve order by start token (unguessable)
      const linkRes = await pool.query(
        `SELECT order_id, client_id
         FROM order_telegram_links
         WHERE start_token = $1 AND client_id = $2
         LIMIT 1`,
        [parsed.token, clientId]
      );

      if (!linkRes.rows.length) {
        await answerCallbackQuery({ botToken, callbackQueryId: callbackId, text: 'Link expired' });
        return res.status(200).json({ ok: true });
      }

      const orderId = Number(linkRes.rows[0].order_id);

      // Bind chat to order if not already (safety)
      await pool.query(
        `INSERT INTO order_telegram_chats (order_id, client_id, telegram_chat_id, telegram_user_id, created_at)
         VALUES ($1,$2,$3,NULL,NOW())
         ON CONFLICT (order_id) DO UPDATE SET telegram_chat_id = EXCLUDED.telegram_chat_id`,
        [orderId, clientId, chatId]
      );

      if (parsed.action === 'approve') {
        const upd = await pool.query(
          `UPDATE store_orders SET status = 'confirmed', updated_at = NOW()
           WHERE id = $1 AND status IN ('pending')
           RETURNING id`,
          [orderId]
        );
        if (upd.rows.length) {
          await pool.query(
            `INSERT INTO order_confirmations (order_id, client_id, response_type, confirmed_via, confirmed_at)
             VALUES ($1, $2, 'approved', 'telegram', NOW())`,
            [orderId, clientId]
          );
          await answerCallbackQuery({ botToken, callbackQueryId: callbackId, text: 'Confirmed' });
          await sendTelegramMessage(botToken, chatId, '✅ تم تأكيد الطلب. شكراً لك!');
        } else {
          await answerCallbackQuery({ botToken, callbackQueryId: callbackId, text: 'Already processed' });
        }
      }

      if (parsed.action === 'decline') {
        const upd = await pool.query(
          `UPDATE store_orders SET status = 'declined', updated_at = NOW()
           WHERE id = $1 AND status IN ('pending')
           RETURNING id`,
          [orderId]
        );
        if (upd.rows.length) {
          await pool.query(
            `INSERT INTO order_confirmations (order_id, client_id, response_type, confirmed_via, confirmed_at)
             VALUES ($1, $2, 'declined', 'telegram', NOW())`,
            [orderId, clientId]
          );
          await answerCallbackQuery({ botToken, callbackQueryId: callbackId, text: 'Declined' });
          await sendTelegramMessage(botToken, chatId, '❌ تم إلغاء الطلب.');
        } else {
          await answerCallbackQuery({ botToken, callbackQueryId: callbackId, text: 'Already processed' });
        }
      }

      return res.status(200).json({ ok: true });
    }

    const msg = update?.message;
    const text = msg?.text as string | undefined;
    const chatId = msg?.chat?.id != null ? String(msg.chat.id) : null;
    const telegramUserId = msg?.from?.id != null ? String(msg.from.id) : null;

    if (!chatId) return res.status(200).json({ ok: true });

    const startToken = parseStartPayload(text);
    if (!startToken) {
      // Ignore non-/start messages for now.
      return res.status(200).json({ ok: true });
    }

    const linkRes = await pool.query(
      `SELECT order_id, customer_phone, customer_name
       FROM order_telegram_links
       WHERE start_token = $1 AND client_id = $2
       LIMIT 1`,
      [startToken, clientId]
    );

    if (!linkRes.rows.length) {
      await sendTelegramMessage(botToken, chatId, 'الرابط غير صالح أو منتهي. رجاءً ارجع لصفحة الطلب واضغط زر Telegram مرة أخرى.');
      return res.status(200).json({ ok: true });
    }

    const orderId = Number(linkRes.rows[0].order_id);
    const customerPhone = String(linkRes.rows[0].customer_phone || '');
    const customerName = String(linkRes.rows[0].customer_name || '');

    // Bind this Telegram chat to this order (order-scoped).
    await pool.query(
      `INSERT INTO order_telegram_chats (order_id, client_id, telegram_chat_id, telegram_user_id, created_at)
       VALUES ($1,$2,$3,$4,NOW())
       ON CONFLICT (order_id) DO UPDATE SET telegram_chat_id = EXCLUDED.telegram_chat_id, telegram_user_id = EXCLUDED.telegram_user_id`,
      [orderId, clientId, chatId, telegramUserId]
    );

    // Also keep a phone->chat mapping for convenience.
    await pool.query(
      `INSERT INTO customer_messaging_ids (client_id, customer_phone, telegram_chat_id, created_at, updated_at)
       VALUES ($1,$2,$3,NOW(),NOW())
       ON CONFLICT (client_id, customer_phone)
       DO UPDATE SET telegram_chat_id = EXCLUDED.telegram_chat_id, updated_at = NOW()`,
      [clientId, customerPhone, chatId]
    );

    await pool.query(
      `UPDATE order_telegram_links SET used_at = NOW() WHERE start_token = $1`,
      [startToken]
    );

    const storeRes = await pool.query(
      `SELECT store_name FROM client_store_settings WHERE client_id = $1 LIMIT 1`,
      [clientId]
    );
    const storeName = String(storeRes.rows[0]?.store_name || 'EcoPro Store');

    const greeting = replaceTemplateVariables(
      greetingTemplate || 'شكراً لطلبك من {storeName} يا {customerName}!\n\n✅ فعّل الإشعارات في Telegram باش توصلك رسالة التأكيد وتتبع الطلب.',
      { storeName, customerName, orderId }
    );

    await sendTelegramMessage(botToken, chatId, greeting);

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[TelegramWebhook] error:', (e as any)?.message || e);
    return res.status(200).json({ ok: true });
  }
};
