import type { RequestHandler } from 'express';
import { ensureConnection } from '../utils/database';
import { replaceTemplateVariables, sendTelegramMessage } from '../utils/bot-messaging';
import crypto from 'crypto';

// Temporary endpoint to set webhook secret for testing
export const setWebhookSecret: RequestHandler = async (req, res) => {
  try {
    const { storeSlug, secret } = req.body;
    if (!storeSlug || !secret) {
      return res.status(400).json({ error: 'storeSlug and secret required' });
    }
    const pool = await ensureConnection();
    const result = await pool.query(
      `UPDATE bot_settings SET telegram_webhook_secret = $1, updated_at = NOW()
       WHERE client_id = (SELECT client_id FROM client_store_settings WHERE store_slug = $2 OR LOWER(store_name) = LOWER($2) LIMIT 1)
       RETURNING client_id`,
      [secret, storeSlug]
    );
    if (result.rows.length) {
      res.json({ ok: true, clientId: result.rows[0].client_id });
    } else {
      res.status(404).json({ error: 'Store not found or no bot settings' });
    }
  } catch (error) {
    console.error('[setWebhookSecret] error:', error);
    res.status(500).json({ error: 'Failed' });
  }
};

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

// Parse simple callback format: confirm_order_ID_CLIENTID or cancel_order_ID_CLIENTID
function parseSimpleCallback(data: string | undefined | null): { action: 'confirm' | 'cancel'; orderId: number; clientId: number } | null {
  if (!data) return null;
  const match = data.match(/^(confirm|cancel)_order_(\d+)_(\d+)$/);
  if (!match) return null;
  return {
    action: match[1] as 'confirm' | 'cancel',
    orderId: parseInt(match[2], 10),
    clientId: parseInt(match[3], 10)
  };
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

/**
 * Get Telegram bot link for a store (public endpoint)
 * Used by checkout page to show "Connect with Telegram" button
 */
export const getTelegramBotLink: RequestHandler = async (req, res) => {
  try {
    const { storeSlug } = req.params;
    const { phone } = req.query;
    
    if (!storeSlug) {
      return res.status(400).json({ error: 'Store slug required' });
    }
    
    const pool = await ensureConnection();
    
    // Get client_id from store slug OR store name (for backwards compatibility)
    const storeRes = await pool.query(
      `SELECT client_id, store_name, store_slug FROM client_store_settings 
       WHERE store_slug = $1 OR LOWER(store_name) = LOWER($1) 
       LIMIT 1`,
      [storeSlug]
    );
    
    if (!storeRes.rows.length) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const clientId = storeRes.rows[0].client_id;
    const storeName = storeRes.rows[0].store_name;
    const actualStoreSlug = storeRes.rows[0].store_slug;
    
    // Get bot settings
    const botRes = await pool.query(
      `SELECT enabled, provider, telegram_bot_username 
       FROM bot_settings 
       WHERE client_id = $1 AND enabled = true AND provider = 'telegram'
       LIMIT 1`,
      [clientId]
    );
    
    if (!botRes.rows.length || !botRes.rows[0].telegram_bot_username) {
      return res.json({ 
        enabled: false, 
        message: 'Telegram not configured for this store' 
      });
    }
    
    const botUsername = botRes.rows[0].telegram_bot_username.replace(/^@/, '');
    
    // Generate a pre-connect token based on phone (if provided)
    let startToken = '';
    let botUrl = `https://t.me/${botUsername}`;
    
    if (phone) {
      // Normalize phone
      const normalizedPhone = String(phone).replace(/\D/g, '');
      if (normalizedPhone.length >= 9) {
        // Generate unique token for this phone + store combo
        startToken = crypto.createHash('sha256')
          .update(`${clientId}:${normalizedPhone}:preconnect`)
          .digest('hex')
          .substring(0, 32);
        
        // Store the pre-connect mapping
        await pool.query(
          `INSERT INTO customer_preconnect_tokens (client_id, customer_phone, token, created_at, expires_at)
           VALUES ($1, $2, $3, NOW(), NOW() + INTERVAL '24 hours')
           ON CONFLICT (client_id, customer_phone) 
           DO UPDATE SET token = $3, created_at = NOW(), expires_at = NOW() + INTERVAL '24 hours'`,
          [clientId, normalizedPhone, startToken]
        );
        
        botUrl = `https://t.me/${botUsername}?start=${startToken}`;
      }
    }
    
    res.json({
      enabled: true,
      botUsername,
      botUrl,
      storeName,
      instructions: {
        ar: 'Click the button to open Telegram and start a chat with the bot. Then come back here to place your order and you\'ll receive instant confirmation!',
        en: 'Click the button to open Telegram and start a chat with the bot. Then come back here to place your order and you\'ll receive instant confirmation!'
      }
    });
  } catch (error) {
    console.error('[getTelegramBotLink] error:', error);
    res.status(500).json({ error: 'Failed to get bot link' });
  }
};

/**
 * Check if customer has connected their Telegram (public endpoint)
 */
export const checkTelegramConnection: RequestHandler = async (req, res) => {
  try {
    const { storeSlug } = req.params;
    const { phone } = req.query;
    
    if (!storeSlug || !phone) {
      return res.status(400).json({ connected: false });
    }
    
    const normalizedPhone = String(phone).replace(/\D/g, '');
    if (normalizedPhone.length < 9) {
      return res.json({ connected: false });
    }
    
    const pool = await ensureConnection();
    
    // Get client_id from store slug OR store name
    const storeRes = await pool.query(
      `SELECT client_id FROM client_store_settings 
       WHERE store_slug = $1 OR LOWER(store_name) = LOWER($1) 
       LIMIT 1`,
      [storeSlug]
    );
    
    if (!storeRes.rows.length) {
      return res.json({ connected: false });
    }
    
    const clientId = storeRes.rows[0].client_id;
    
    // Check if we have a telegram_chat_id for this phone
    const chatRes = await pool.query(
      `SELECT telegram_chat_id FROM customer_messaging_ids 
       WHERE client_id = $1 AND customer_phone = $2 AND telegram_chat_id IS NOT NULL
       LIMIT 1`,
      [clientId, normalizedPhone]
    );
    
    res.json({ 
      connected: chatRes.rows.length > 0,
      chatId: chatRes.rows[0]?.telegram_chat_id || null
    });
  } catch (error) {
    console.error('[checkTelegramConnection] error:', error);
    res.json({ connected: false });
  }
};

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

      // Try simple callback format first (confirm_order_ID_CLIENTID)
      const simpleCallback = parseSimpleCallback(data);
      if (simpleCallback && callbackId && chatId) {
        const { action, orderId, clientId: cbClientId } = simpleCallback;
        
        // Verify this callback is for the correct store
        if (cbClientId !== clientId) {
          await answerCallbackQuery({ botToken, callbackQueryId: callbackId, text: 'Invalid request' });
          return res.status(200).json({ ok: true });
        }

        if (action === 'confirm') {
          const upd = await pool.query(
            `UPDATE store_orders SET status = 'confirmed', updated_at = NOW()
             WHERE id = $1 AND client_id = $2 AND status IN ('pending')
             RETURNING id`,
            [orderId, clientId]
          );
          if (upd.rows.length) {
            await pool.query(
              `INSERT INTO order_confirmations (order_id, client_id, response_type, confirmed_via, confirmed_at)
               VALUES ($1, $2, 'approved', 'telegram', NOW())
               ON CONFLICT DO NOTHING`,
              [orderId, clientId]
            );
            await answerCallbackQuery({ botToken, callbackQueryId: callbackId, text: 'Confirmed ✅' });
            await sendTelegramMessage(botToken, chatId, '✅ Your order has been confirmed!\n\nWe will contact you soon to arrange delivery. Thank you for your trust! 🙏');
          } else {
            await answerCallbackQuery({ botToken, callbackQueryId: callbackId, text: 'Already processed' });
          }
        }

        if (action === 'cancel') {
          const upd = await pool.query(
            `UPDATE store_orders SET status = 'declined', updated_at = NOW()
             WHERE id = $1 AND client_id = $2 AND status IN ('pending')
             RETURNING id`,
            [orderId, clientId]
          );
          if (upd.rows.length) {
            await pool.query(
              `INSERT INTO order_confirmations (order_id, client_id, response_type, confirmed_via, confirmed_at)
               VALUES ($1, $2, 'declined', 'telegram', NOW())
               ON CONFLICT DO NOTHING`,
              [orderId, clientId]
            );
            await answerCallbackQuery({ botToken, callbackQueryId: callbackId, text: 'Cancelled ❌' });
            await sendTelegramMessage(botToken, chatId, '❌ Order declined.\n\nIf you change your mind, you can order again from the store.');
          } else {
            await answerCallbackQuery({ botToken, callbackQueryId: callbackId, text: 'Already processed' });
          }
        }

        return res.status(200).json({ ok: true });
      }

      // Fall back to old callback format (approve:token or decline:token)
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
           WHERE id = $1 AND client_id = $2 AND status IN ('pending')
           RETURNING id`,
          [orderId, clientId]
        );
        if (upd.rows.length) {
          await pool.query(
            `INSERT INTO order_confirmations (order_id, client_id, response_type, confirmed_via, confirmed_at)
             VALUES ($1, $2, 'approved', 'telegram', NOW())`,
            [orderId, clientId]
          );
          await answerCallbackQuery({ botToken, callbackQueryId: callbackId, text: 'Confirmed' });
          await sendTelegramMessage(botToken, chatId, '✅ Order confirmed. Thank you!');
        } else {
          await answerCallbackQuery({ botToken, callbackQueryId: callbackId, text: 'Already processed' });
        }
      }

      if (parsed.action === 'decline') {
        const upd = await pool.query(
          `UPDATE store_orders SET status = 'declined', updated_at = NOW()
           WHERE id = $1 AND client_id = $2 AND status IN ('pending')
           RETURNING id`,
          [orderId, clientId]
        );
        if (upd.rows.length) {
          await pool.query(
            `INSERT INTO order_confirmations (order_id, client_id, response_type, confirmed_via, confirmed_at)
             VALUES ($1, $2, 'declined', 'telegram', NOW())`,
            [orderId, clientId]
          );
          await answerCallbackQuery({ botToken, callbackQueryId: callbackId, text: 'Declined' });
          await sendTelegramMessage(botToken, chatId, '❌ Order cancelled.');
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

    // First try: Check if this is a preconnect token (customer connecting BEFORE placing order)
    const preconnectRes = await pool.query(
      `SELECT customer_phone FROM customer_preconnect_tokens
       WHERE token = $1 AND client_id = $2 AND expires_at > NOW()
       LIMIT 1`,
      [startToken, clientId]
    );

    if (preconnectRes.rows.length) {
      // This is a preconnect - customer is connecting before placing order
      const customerPhone = String(preconnectRes.rows[0].customer_phone);
      
      // Save the phone->chat mapping
      await pool.query(
        `INSERT INTO customer_messaging_ids (client_id, customer_phone, telegram_chat_id, created_at, updated_at)
         VALUES ($1,$2,$3,NOW(),NOW())
         ON CONFLICT (client_id, customer_phone)
         DO UPDATE SET telegram_chat_id = EXCLUDED.telegram_chat_id, updated_at = NOW()`,
        [clientId, customerPhone, chatId]
      );
      
      // Mark token as used
      await pool.query(
        `UPDATE customer_preconnect_tokens SET used_at = NOW() WHERE token = $1`,
        [startToken]
      );
      
      // Get store name
      const storeRes = await pool.query(
        `SELECT store_name FROM client_store_settings WHERE client_id = $1 LIMIT 1`,
        [clientId]
      );
      const storeName = String(storeRes.rows[0]?.store_name || 'Store');
      
      // Send "bot connected" message (configurable via template_greeting)
      const defaultConnect = `Welcome to {storeName}! 🎉

✅ Your Telegram has been linked successfully.

You can now go back to the order page and complete your purchase.
We will send you order confirmation directly here! 📦`;

      const connectMsg = replaceTemplateVariables(
        String(greetingTemplate || defaultConnect),
        {
          storeName,
          customerName: 'Customer',
          orderId: 0,
        }
      );

      await sendTelegramMessage(botToken, chatId, connectMsg);
      
      return res.status(200).json({ ok: true });
    }

    // Second try: Check if this is an order-specific token (after order placed)
    const linkRes = await pool.query(
      `SELECT order_id, customer_phone, customer_name
       FROM order_telegram_links
       WHERE start_token = $1 AND client_id = $2
       LIMIT 1`,
      [startToken, clientId]
    );

    if (!linkRes.rows.length) {
      await sendTelegramMessage(botToken, chatId, 'The link is invalid or expired. Please go back to the order page and click the Telegram button again.');
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
      greetingTemplate || 'Thank you for ordering from {storeName}, {customerName}!\n\n✅ Enable notifications on Telegram to receive order confirmation and tracking updates.',
      { storeName, customerName, orderId }
    );

    await sendTelegramMessage(botToken, chatId, greeting);

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[TelegramWebhook] error:', (e as any)?.message || e);
    return res.status(200).json({ ok: true });
  }
};
