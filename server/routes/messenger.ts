/**
 * Facebook Messenger Integration Routes
 * 
 * Handles:
 * - Webhook verification (GET /api/messenger/webhook)
 * - Incoming messages (POST /api/messenger/webhook)
 * - Sending order confirmations via Messenger
 */

import { Router, RequestHandler } from 'express';
import { ensureConnection } from '../utils/database';
import crypto from 'crypto';
import { replaceTemplateVariables } from '../utils/bot-messaging';

const router = Router();

// Environment variables
const FB_VERIFY_TOKEN = process.env.FB_MESSENGER_VERIFY_TOKEN || 'ecopro_messenger_verify';
const FB_APP_SECRET = process.env.FB_APP_SECRET || '';

/**
 * Generate a unique ref token for Messenger preconnect
 */
function generateMessengerRefToken(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * GET /api/messenger/page-link/:storeSlug
 * Public endpoint: returns Messenger chat link for a store if enabled.
 * Optionally generates a preconnect token when phone is provided.
 */
export const getMessengerPageLink: RequestHandler = async (req, res) => {
  try {
    const { storeSlug } = req.params as any;
    const { phone } = req.query;
    const pool = await ensureConnection();

    const storeRes = await pool.query(
      `SELECT client_id, store_name
       FROM client_store_settings
       WHERE store_slug = $1
          OR LOWER(REGEXP_REPLACE(store_name, '[^a-zA-Z0-9]', '', 'g')) = LOWER($1)
       LIMIT 1`,
      [storeSlug]
    );

    if (storeRes.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const clientId = Number(storeRes.rows[0].client_id);
    const storeName = storeRes.rows[0].store_name || 'EcoPro Store';

    const botRes = await pool.query(
      `SELECT messenger_enabled, fb_page_id, fb_page_access_token
       FROM bot_settings
       WHERE client_id = $1
       LIMIT 1`,
      [clientId]
    );

    if (botRes.rows.length === 0) {
      return res.json({ enabled: false });
    }

    const enabled = Boolean(botRes.rows[0].messenger_enabled);
    const pageId = botRes.rows[0].fb_page_id ? String(botRes.rows[0].fb_page_id).trim() : '';
    const pageAccessToken = botRes.rows[0].fb_page_access_token
      ? String(botRes.rows[0].fb_page_access_token).trim()
      : '';
    if (!enabled || !pageId || !pageAccessToken) {
      return res.json({
        enabled: false,
        ...(enabled && pageId && !pageAccessToken ? { reason: 'missing_page_access_token' } : {}),
      });
    }

    let messengerUrl = `https://m.me/${encodeURIComponent(pageId)}`;
    let refToken = '';

    // Generate preconnect token if phone is provided
    if (phone) {
      const normalizedPhone = String(phone).replace(/\D/g, '');
      if (normalizedPhone.length >= 9) {
        refToken = generateMessengerRefToken();
        
        // Store preconnect token
        await pool.query(
          `INSERT INTO messenger_preconnect_tokens (client_id, customer_phone, ref_token, page_id, created_at, expires_at)
           VALUES ($1, $2, $3, $4, NOW(), NOW() + INTERVAL '24 hours')
           ON CONFLICT (client_id, customer_phone)
           DO UPDATE SET ref_token = $3, page_id = $4, created_at = NOW(), expires_at = NOW() + INTERVAL '24 hours', used_at = NULL`,
          [clientId, normalizedPhone, refToken, pageId]
        );

        // Add ref parameter for tracking
        messengerUrl = `https://m.me/${encodeURIComponent(pageId)}?ref=${encodeURIComponent(refToken)}`;
      }
    }

    return res.json({
      enabled: true,
      storeName,
      pageId,
      url: messengerUrl,
      refToken: refToken || undefined,
      instructions: {
        ar: 'اضغط على الزر لفتح Messenger وبدء محادثة. ثم ارجع هنا لإتمام طلبك وستتلقى التأكيد مباشرة!',
        en: 'Click the button to open Messenger and start a chat. Then come back here to place your order and receive instant confirmation!'
      }
    });
  } catch (error) {
    console.error('[Messenger] Failed to get page link:', error);
    return res.status(500).json({ error: 'Failed to fetch Messenger link' });
  }
};

/**
 * GET /api/messenger/check-connection/:storeSlug
 * Check if customer has connected their Messenger
 */
export const checkMessengerConnection: RequestHandler = async (req, res) => {
  try {
    const { storeSlug } = req.params;
    const { phone } = req.query;

    if (!storeSlug || !phone) {
      return res.json({ connected: false });
    }

    const normalizedPhone = String(phone).replace(/\D/g, '');
    if (normalizedPhone.length < 9) {
      return res.json({ connected: false });
    }

    const pool = await ensureConnection();

    // Get client_id from store slug
    const storeRes = await pool.query(
      `SELECT client_id
       FROM client_store_settings
       WHERE store_slug = $1
         OR LOWER(REGEXP_REPLACE(store_name, '[^a-zA-Z0-9]', '', 'g')) = LOWER($1)
       LIMIT 1`,
      [storeSlug]
    );

    if (!storeRes.rows.length) {
      return res.json({ connected: false });
    }

    const clientId = storeRes.rows[0].client_id;

    // Check if we have a messenger_psid for this phone
    const psidRes = await pool.query(
      `SELECT messenger_psid FROM customer_messaging_ids 
       WHERE client_id = $1 AND customer_phone = $2 AND messenger_psid IS NOT NULL
       LIMIT 1`,
      [clientId, normalizedPhone]
    );

    res.json({
      connected: psidRes.rows.length > 0,
      psid: psidRes.rows[0]?.messenger_psid || null
    });
  } catch (error) {
    console.error('[Messenger] Check connection error:', error);
    res.json({ connected: false });
  }
};

/**
 * Verify request signature from Facebook
 */
function verifyFBSignature(req: any): boolean {
  if (!FB_APP_SECRET) return true; // Skip verification if not configured
  
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) return false;

  const signatureValue = Array.isArray(signature) ? signature[0] : signature;
  if (typeof signatureValue !== 'string' || !signatureValue.startsWith('sha256=')) return false;

  const rawBody: Buffer = Buffer.isBuffer(req.rawBody)
    ? req.rawBody
    : Buffer.from(JSON.stringify(req.body ?? {}));
  
  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', FB_APP_SECRET)
    .update(rawBody)
    .digest('hex');

  const a = Buffer.from(signatureValue);
  const b = Buffer.from(expectedSignature);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Send message via Facebook Messenger API
 */
export async function sendMessengerMessage(
  pageAccessToken: string,
  recipientId: string,
  message: string,
  quickReplies?: Array<{ title: string; payload: string }>
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!pageAccessToken) {
      return { success: false, error: 'Page access token missing' };
    }
    if (!recipientId) {
      return { success: false, error: 'Recipient PSID missing' };
    }

    const payload: any = {
      recipient: { id: recipientId },
      message: { text: message },
      messaging_type: 'RESPONSE',
    };

    // Add quick reply buttons if provided
    if (quickReplies && quickReplies.length > 0) {
      payload.message.quick_replies = quickReplies.map(qr => ({
        content_type: 'text',
        title: qr.title,
        payload: qr.payload,
      }));
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${pageAccessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    const data: any = await response.json();
    
    if (!response.ok || data.error) {
      console.error('[Messenger] Send failed:', data.error);
      return { 
        success: false, 
        error: data.error?.message || `Send failed (${response.status})` 
      };
    }

    console.log(`[Messenger] Message sent to ${recipientId}: ${data.message_id}`);
    return { success: true, messageId: data.message_id };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[Messenger] Failed to send message: ${errorMsg}`);
    return { success: false, error: errorMsg };
  }
}

/**
 * Send order confirmation with buttons
 */
export async function sendMessengerOrderConfirmation(
  pageAccessToken: string,
  recipientId: string,
  orderDetails: {
    orderId: number;
    customerName: string;
    storeName: string;
    productName: string;
    price: number;
    confirmationLink: string;
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const { orderId, customerName, storeName, productName, price, confirmationLink } = orderDetails;

    // Send structured template with buttons
    const payload = {
      recipient: { id: recipientId },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'button',
            text: `مرحباً ${customerName}! 👋\n\nتم استلام طلبك من ${storeName}:\n\n📦 طلب #${orderId}\n🛍️ المنتج: ${productName}\n💰 المجموع: ${price} دج\n\nيرجى تأكيد طلبك:`,
            buttons: [
              {
                type: 'postback',
                title: '✅ تأكيد',
                payload: `CONFIRM_ORDER_${orderId}`,
              },
              {
                type: 'postback',
                title: '❌ إلغاء',
                payload: `DECLINE_ORDER_${orderId}`,
              },
            ],
          },
        },
      },
      messaging_type: 'RESPONSE',
    };

    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${pageAccessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    const data: any = await response.json();
    
    if (!response.ok || data.error) {
      console.error('[Messenger] Template send failed:', data.error);
      return { 
        success: false, 
        error: data.error?.message || `Send failed (${response.status})` 
      };
    }

    return { success: true, messageId: data.message_id };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[Messenger] Failed to send order confirmation: ${errorMsg}`);
    return { success: false, error: errorMsg };
  }
}

/**
 * GET /api/messenger/webhook - Facebook webhook verification
 */
const verifyWebhook: RequestHandler = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('[Messenger] Webhook verification attempt:', { mode, token: token ? '***' : 'missing', challenge: challenge ? 'present' : 'missing' });

  if (mode === 'subscribe' && token === FB_VERIFY_TOKEN) {
    console.log('[Messenger] Webhook verified successfully');
    // Facebook requires plain text response with the challenge
    res.set('Content-Type', 'text/plain');
    res.status(200).send(challenge);
  } else {
    console.warn('[Messenger] Webhook verification failed - token mismatch or wrong mode');
    res.sendStatus(403);
  }
};

/**
 * POST /api/messenger/webhook - Handle incoming messages
 */
const handleWebhook: RequestHandler = async (req, res) => {
  // Verify signature
  if (FB_APP_SECRET && !verifyFBSignature(req)) {
    console.warn('[Messenger] Invalid signature');
    return res.sendStatus(403);
  }

  const body = req.body;

  if (body.object !== 'page') {
    return res.sendStatus(404);
  }

  // Process each entry
  for (const entry of body.entry || []) {
    const pageId = entry.id;
    
    for (const event of entry.messaging || []) {
      const senderId = event.sender?.id;
      const recipientId = event.recipient?.id;

      // Handle referral (preconnect from m.me link with ref parameter)
      if (event.referral) {
        await handleReferral(pageId, senderId, event.referral);
      }

      // Handle postback (button clicks) - may also contain referral
      if (event.postback) {
        await handlePostback(pageId, senderId, event.postback);
      }

      // Handle message
      if (event.message) {
        await handleMessage(pageId, senderId, event.message);
      }

      // Handle message read
      if (event.read) {
        console.log(`[Messenger] Message read by ${senderId}`);
      }

      // Handle delivery confirmation
      if (event.delivery) {
        console.log(`[Messenger] Message delivered to ${senderId}`);
      }
    }
  }

  // Always respond with 200 OK quickly
  res.sendStatus(200);
};

/**
 * Handle referral events (from m.me links with ref parameter)
 * This is triggered when a user clicks a link like m.me/PAGE_ID?ref=TOKEN
 */
async function handleReferral(pageId: string, senderId: string, referral: any) {
  const refToken = referral.ref || '';
  console.log(`[Messenger] Referral from ${senderId} with ref: ${refToken}`);

  if (!refToken) return;

  try {
    const pool = await ensureConnection();

    // Look up the preconnect token
    const preconnectRes = await pool.query(
      `SELECT client_id, customer_phone FROM messenger_preconnect_tokens
       WHERE ref_token = $1 AND expires_at > NOW()
       LIMIT 1`,
      [refToken]
    );

    if (!preconnectRes.rows.length) {
      console.log(`[Messenger] Preconnect token not found or expired: ${refToken}`);
      return;
    }

    const { client_id, customer_phone } = preconnectRes.rows[0];

    // Get store settings
    const settingsRes = await pool.query(
      `SELECT fb_page_access_token, template_greeting FROM bot_settings 
       WHERE client_id = $1 AND messenger_enabled = true`,
      [client_id]
    );

    if (!settingsRes.rows.length) return;

    const { fb_page_access_token, template_greeting } = settingsRes.rows[0];

    // Save the phone->PSID mapping
    await pool.query(
      `INSERT INTO customer_messaging_ids (client_id, customer_phone, messenger_psid, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (client_id, customer_phone)
       DO UPDATE SET messenger_psid = EXCLUDED.messenger_psid, updated_at = NOW()`,
      [client_id, customer_phone, senderId]
    );

    // Also store in messenger_subscribers
    await pool.query(
      `INSERT INTO messenger_subscribers (client_id, psid, page_id, customer_phone, subscribed_at, last_interaction)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (client_id, psid) DO UPDATE SET customer_phone = $4, last_interaction = NOW()`,
      [client_id, senderId, pageId, customer_phone]
    );

    // Mark token as used
    await pool.query(
      `UPDATE messenger_preconnect_tokens SET used_at = NOW() WHERE ref_token = $1`,
      [refToken]
    );

    // Get store name
    const storeRes = await pool.query(
      `SELECT store_name FROM client_store_settings WHERE client_id = $1 LIMIT 1`,
      [client_id]
    );
    const storeName = storeRes.rows[0]?.store_name || 'Store';

    // Send welcome message
    const defaultGreeting = `مرحباً بك في ${storeName}! 🎉\n\n✅ تم ربط حسابك بنجاح.\n\nيمكنك الآن العودة لإتمام طلبك وستتلقى التأكيد هنا مباشرة! 📦`;
    
    let greeting = template_greeting || defaultGreeting;
    greeting = replaceTemplateVariables(greeting, { storeName, customerName: '' });
    
    await sendMessengerMessage(
      fb_page_access_token,
      senderId,
      greeting
    );

    console.log(`[Messenger] Successfully linked PSID ${senderId} to phone ${customer_phone} for client ${client_id}`);
  } catch (error) {
    console.error('[Messenger] Referral handler error:', error);
  }
}

/**
 * Handle postback events (button clicks)
 */
async function handlePostback(pageId: string, senderId: string, postback: any) {
  const payload = postback.payload || '';
  const referral = postback.referral; // Get Started can include referral
  console.log(`[Messenger] Postback from ${senderId}: ${payload}`);

  try {
    const pool = await ensureConnection();

    // Get client_id and page access token
    const settingsResult = await pool.query(
      `SELECT fb_page_access_token, client_id, store_name FROM bot_settings 
       WHERE fb_page_id = $1 AND messenger_enabled = true`,
      [pageId]
    );

    if (settingsResult.rows.length === 0) {
      console.warn(`[Messenger] No settings found for page ${pageId}`);
      return;
    }

    const { fb_page_access_token, client_id, store_name } = settingsResult.rows[0];

    // Handle GET_STARTED - this fires when user clicks m.me link or Get Started button
    if (payload === 'GET_STARTED') {
      // Check for ref in referral (from m.me link)
      if (referral?.ref) {
        await handleReferral(pageId, senderId, referral);
        return; // handleReferral sends its own message
      }

      // Check for pending preconnect token
      const pendingToken = await pool.query(
        `SELECT customer_phone, ref_token FROM messenger_preconnect_tokens 
         WHERE client_id = $1 AND used_at IS NULL AND expires_at > NOW()
         ORDER BY created_at DESC LIMIT 1`,
        [client_id]
      );

      if (pendingToken.rows.length > 0) {
        const { customer_phone, ref_token } = pendingToken.rows[0];
        
        // Link PSID to phone
        await pool.query(
          `INSERT INTO customer_messaging_ids (client_id, customer_phone, messenger_psid, created_at, updated_at)
           VALUES ($1, $2, $3, NOW(), NOW())
           ON CONFLICT (client_id, customer_phone)
           DO UPDATE SET messenger_psid = EXCLUDED.messenger_psid, updated_at = NOW()`,
          [client_id, customer_phone, senderId]
        );

        await pool.query(
          `UPDATE messenger_preconnect_tokens SET used_at = NOW() WHERE ref_token = $1`,
          [ref_token]
        );

        console.log(`[Messenger] Linked PSID ${senderId} to phone ${customer_phone} via GET_STARTED`);

        await sendMessengerMessage(
          fb_page_access_token,
          senderId,
          `✅ تم ربط حسابك بنجاح!\n\nيمكنك الآن العودة لإتمام طلبك. ستتلقى تأكيدات الطلبات هنا! 📦`
        );
        return;
      }

      // Default welcome if no preconnect
      await sendMessengerMessage(
        fb_page_access_token,
        senderId,
        `مرحباً بك! 👋\n\nأنا مساعدك الآلي من ${store_name}.\n\nسأرسل لك تأكيدات الطلبات وتحديثات الشحن.`
      );
      return;
    }

    // Handle different postback payloads
    if (payload.startsWith('CONFIRM_ORDER_')) {
      const orderId = parseInt(payload.replace('CONFIRM_ORDER_', ''), 10);

      const upd = await pool.query(
        `UPDATE store_orders
         SET status = 'confirmed', updated_at = NOW()
         WHERE id = $1 AND client_id = $2 AND status IN ('pending')
         RETURNING id`,
        [orderId, client_id]
      );

      if (upd.rows.length) {
        await pool.query(
          `INSERT INTO order_confirmations (order_id, client_id, response_type, confirmed_via, confirmed_at)
           SELECT $1, $2, 'approved', 'messenger', NOW()
           WHERE NOT EXISTS (
             SELECT 1 FROM order_confirmations WHERE order_id = $1 AND client_id = $2
           )`,
          [orderId, client_id]
        );
        await sendMessengerMessage(
          fb_page_access_token,
          senderId,
          `✅ تم تأكيد طلبك #${orderId}. شكراً لك!`
        );
      } else {
        await sendMessengerMessage(
          fb_page_access_token,
          senderId,
          `تمت معالجة هذا الطلب مسبقاً.`
        );
      }
    } else if (payload.startsWith('DECLINE_ORDER_') || payload.startsWith('CANCEL_ORDER_')) {
      const orderId = payload.startsWith('DECLINE_ORDER_')
        ? parseInt(payload.replace('DECLINE_ORDER_', ''), 10)
        : parseInt(payload.replace('CANCEL_ORDER_', ''), 10);

      const upd = await pool.query(
        `UPDATE store_orders
         SET status = 'declined', updated_at = NOW()
         WHERE id = $1 AND client_id = $2 AND status IN ('pending')
         RETURNING id`,
        [orderId, client_id]
      );

      if (upd.rows.length) {
        await pool.query(
          `INSERT INTO order_confirmations (order_id, client_id, response_type, confirmed_via, confirmed_at)
           SELECT $1, $2, 'declined', 'messenger', NOW()
           WHERE NOT EXISTS (
             SELECT 1 FROM order_confirmations WHERE order_id = $1 AND client_id = $2
           )`,
          [orderId, client_id]
        );
        await sendMessengerMessage(
          fb_page_access_token,
          senderId,
          `❌ تم إلغاء طلبك #${orderId}. شكراً لتواصلك مع ${store_name}.`
        );
      } else {
        await sendMessengerMessage(
          fb_page_access_token,
          senderId,
          `تمت معالجة هذا الطلب مسبقاً.`
        );
      }
    } else if (payload.startsWith('CONTACT_STORE_')) {
      const orderId = parseInt(payload.replace('CONTACT_STORE_', ''), 10);
      
      // Get store contact info
      const storeResult = await pool.query(
        `SELECT cs.phone, cs.store_name FROM client_store_settings cs
         JOIN store_orders so ON so.client_id = cs.client_id
         WHERE so.id = $1`,
        [orderId]
      );

      const phone = storeResult.rows[0]?.phone || 'غير متوفر';
      const storeName = storeResult.rows[0]?.store_name || store_name;

      await sendMessengerMessage(
        fb_page_access_token,
        senderId,
        `للتواصل مع ${storeName}:\n📞 ${phone}\n\nسنرد عليك في أقرب وقت! 💬`
      );
    }
  } catch (error) {
    console.error('[Messenger] Postback handler error:', error);
  }
}

/**
 * Handle incoming messages
 */
async function handleMessage(pageId: string, senderId: string, message: any) {
  const text = message.text?.toLowerCase() || '';
  console.log(`[Messenger] Message from ${senderId} to page ${pageId}: ${text}`);

  try {
    const pool = await ensureConnection();

    // Get page access token - try both exact match and partial match
    let settingsResult = await pool.query(
      `SELECT fb_page_access_token, client_id, store_name FROM bot_settings 
       WHERE fb_page_id = $1 AND messenger_enabled = true`,
      [pageId]
    );

    // Fallback: if no exact match, try finding by partial match or any enabled messenger
    if (settingsResult.rows.length === 0) {
      console.log(`[Messenger] No exact match for pageId ${pageId}, trying fallback...`);
      settingsResult = await pool.query(
        `SELECT fb_page_access_token, client_id, store_name FROM bot_settings 
         WHERE messenger_enabled = true AND fb_page_access_token IS NOT NULL
         LIMIT 1`
      );
    }

    if (settingsResult.rows.length === 0) {
      console.log(`[Messenger] No settings found for page ${pageId}`);
      return;
    }

    const { fb_page_access_token, client_id, store_name } = settingsResult.rows[0];
    console.log(`[Messenger] Found client ${client_id} for page ${pageId}`);

    // Check if there's a pending preconnect token for this PSID (user just clicked m.me link)
    // First check if we have any unexpired token for this client where the user might be connecting
    const pendingToken = await pool.query(
      `SELECT customer_phone, ref_token FROM messenger_preconnect_tokens 
       WHERE client_id = $1 AND used_at IS NULL AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [client_id]
    );

    if (pendingToken.rows.length > 0) {
      const { customer_phone, ref_token } = pendingToken.rows[0];
      
      // Link this PSID to the phone
      await pool.query(
        `INSERT INTO customer_messaging_ids (client_id, customer_phone, messenger_psid, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         ON CONFLICT (client_id, customer_phone)
         DO UPDATE SET messenger_psid = EXCLUDED.messenger_psid, updated_at = NOW()`,
        [client_id, customer_phone, senderId]
      );

      // Mark token as used
      await pool.query(
        `UPDATE messenger_preconnect_tokens SET used_at = NOW() WHERE ref_token = $1`,
        [ref_token]
      );

      console.log(`[Messenger] Linked PSID ${senderId} to phone ${customer_phone} via message`);

      // Send welcome/confirmation
      await sendMessengerMessage(
        fb_page_access_token,
        senderId,
        `✅ تم ربط حسابك بنجاح!\n\nيمكنك الآن العودة لإتمام طلبك. ستتلقى تأكيدات الطلبات هنا مباشرة! 📦`
      );
    }

    // Store/update customer's PSID for future messaging
    await pool.query(
      `INSERT INTO messenger_subscribers (client_id, psid, page_id, subscribed_at, last_interaction)
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (client_id, psid) DO UPDATE SET last_interaction = NOW()`,
      [client_id, senderId, pageId]
    );

    // Handle help command
    if (text.includes('مساعدة') || text.includes('help')) {
      await sendMessengerMessage(
        fb_page_access_token,
        senderId,
        `كيف يمكنني مساعدتك؟ 🤔\n\n• للاستفسار عن طلب، أرسل رقم الطلب\n• للتواصل مع الدعم، اكتب "دعم"\n• لمعرفة حالة طلبك، اكتب "طلباتي"`
      );
    } else if (text.includes('طلباتي') || text.includes('orders')) {
      // Get recent orders for this customer
      const ordersResult = await pool.query(
        `SELECT so.id, so.status, so.total_price, so.created_at
         FROM store_orders so
         JOIN messenger_subscribers ms ON ms.client_id = so.client_id
         WHERE ms.psid = $1 AND so.customer_phone IS NOT NULL
         ORDER BY so.created_at DESC LIMIT 5`,
        [senderId]
      );

      if (ordersResult.rows.length === 0) {
        await sendMessengerMessage(fb_page_access_token, senderId, 'لا توجد طلبات حالياً.');
      } else {
        const ordersList = ordersResult.rows
          .map(o => `📦 #${o.id} - ${o.status} - ${o.total_price} دج`)
          .join('\n');
        await sendMessengerMessage(
          fb_page_access_token,
          senderId,
          `طلباتك الأخيرة:\n\n${ordersList}`
        );
      }
    }
  } catch (error) {
    console.error('[Messenger] Message handler error:', error);
  }
}

/**
 * Setup "Get Started" button for a page - call this once per page
 */
export async function setupGetStartedButton(pageAccessToken: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/messenger_profile?access_token=${pageAccessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          get_started: { payload: 'GET_STARTED' }
        }),
      }
    );
    const data: any = await response.json();
    console.log('[Messenger] Get Started button setup:', data);
    return data.result === 'success';
  } catch (error) {
    console.error('[Messenger] Failed to setup Get Started:', error);
    return false;
  }
}

/**
 * POST /api/messenger/setup-get-started/:storeSlug - Setup Get Started button for store's page
 */
const setupGetStarted: RequestHandler = async (req, res) => {
  try {
    const { storeSlug } = req.params as any;
    const pool = await ensureConnection();

    const storeRes = await pool.query(
      `SELECT client_id FROM client_store_settings WHERE store_slug = $1 LIMIT 1`,
      [storeSlug]
    );
    if (storeRes.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const botRes = await pool.query(
      `SELECT fb_page_access_token FROM bot_settings WHERE client_id = $1 AND messenger_enabled = true`,
      [storeRes.rows[0].client_id]
    );
    if (botRes.rows.length === 0 || !botRes.rows[0].fb_page_access_token) {
      return res.status(400).json({ error: 'Messenger not configured' });
    }

    const success = await setupGetStartedButton(botRes.rows[0].fb_page_access_token);
    res.json({ success });
  } catch (error) {
    console.error('[Messenger] Setup Get Started error:', error);
    res.status(500).json({ error: 'Setup failed' });
  }
};

/**
 * GET /api/messenger/config - Get Messenger configuration status
 */
const getConfig: RequestHandler = async (req, res) => {
  res.json({
    enabled: !!process.env.FB_APP_SECRET,
    webhookUrl: `${process.env.BASE_URL || 'https://ecopro-1lbl.onrender.com'}/api/messenger/webhook`,
    verifyToken: FB_VERIFY_TOKEN,
  });
};

// Register routes
router.get('/webhook', verifyWebhook);
router.post('/webhook', handleWebhook);
router.get('/page-link/:storeSlug', getMessengerPageLink);
router.get('/check-connection/:storeSlug', checkMessengerConnection);
router.post('/setup-get-started/:storeSlug', setupGetStarted);
router.get('/config', getConfig);

export default router;
