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

const router = Router();

// Environment variables
const FB_VERIFY_TOKEN = process.env.FB_MESSENGER_VERIFY_TOKEN || 'ecopro_messenger_verify';
const FB_APP_SECRET = process.env.FB_APP_SECRET || '';

/**
 * GET /api/messenger/page-link/:storeSlug
 * Public endpoint: returns Messenger chat link for a store if enabled.
 */
export const getMessengerPageLink: RequestHandler = async (req, res) => {
  try {
    const { storeSlug } = req.params as any;
    const pool = await ensureConnection();

    const storeRes = await pool.query(
      `SELECT client_id, store_name
       FROM client_store_settings
       WHERE store_slug = $1
       LIMIT 1`,
      [storeSlug]
    );

    if (storeRes.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const clientId = Number(storeRes.rows[0].client_id);
    const storeName = storeRes.rows[0].store_name || 'EcoPro Store';

    const botRes = await pool.query(
      `SELECT messenger_enabled, fb_page_id
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
    if (!enabled || !pageId) {
      return res.json({ enabled: false });
    }

    return res.json({
      enabled: true,
      storeName,
      pageId,
      url: `https://m.me/${encodeURIComponent(pageId)}`,
    });
  } catch (error) {
    console.error('[Messenger] Failed to get page link:', error);
    return res.status(500).json({ error: 'Failed to fetch Messenger link' });
  }
};

/**
 * Verify request signature from Facebook
 */
function verifyFBSignature(req: any): boolean {
  if (!FB_APP_SECRET) return true; // Skip verification if not configured
  
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) return false;
  
  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', FB_APP_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');
    
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
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
      messaging_type: 'MESSAGE_TAG',
      tag: 'CONFIRMED_EVENT_UPDATE', // Allows sending outside 24h window for order updates
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
                type: 'web_url',
                url: confirmationLink,
                title: '✅ تأكيد الطلب',
                webview_height_ratio: 'full',
              },
              {
                type: 'postback',
                title: '❌ إلغاء',
                payload: `CANCEL_ORDER_${orderId}`,
              },
              {
                type: 'postback',
                title: '📞 اتصل بنا',
                payload: `CONTACT_STORE_${orderId}`,
              },
            ],
          },
        },
      },
      messaging_type: 'MESSAGE_TAG',
      tag: 'CONFIRMED_EVENT_UPDATE',
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

  if (mode === 'subscribe' && token === FB_VERIFY_TOKEN) {
    console.log('[Messenger] Webhook verified');
    res.status(200).send(challenge);
  } else {
    console.warn('[Messenger] Webhook verification failed');
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

      // Handle postback (button clicks)
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
 * Handle postback events (button clicks)
 */
async function handlePostback(pageId: string, senderId: string, postback: any) {
  const payload = postback.payload || '';
  console.log(`[Messenger] Postback from ${senderId}: ${payload}`);

  try {
    const pool = await ensureConnection();

    // Get page access token
    const settingsResult = await pool.query(
      `SELECT fb_page_access_token, store_name FROM bot_settings 
       WHERE fb_page_id = $1 AND messenger_enabled = true`,
      [pageId]
    );

    if (settingsResult.rows.length === 0) {
      console.warn(`[Messenger] No settings found for page ${pageId}`);
      return;
    }

    const { fb_page_access_token, store_name } = settingsResult.rows[0];

    // Handle different postback payloads
    if (payload.startsWith('CANCEL_ORDER_')) {
      const orderId = parseInt(payload.replace('CANCEL_ORDER_', ''), 10);
      
      // Update order status
      await pool.query(
        `UPDATE store_orders SET status = 'cancelled', updated_at = NOW() WHERE id = $1`,
        [orderId]
      );

      await sendMessengerMessage(
        fb_page_access_token,
        senderId,
        `تم إلغاء طلبك #${orderId}. شكراً لتواصلك مع ${store_name}. 🙏`
      );
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
    } else if (payload === 'GET_STARTED') {
      await sendMessengerMessage(
        fb_page_access_token,
        senderId,
        `مرحباً بك! 👋\n\nأنا مساعدك الآلي من ${store_name}.\n\nسأرسل لك تأكيدات الطلبات وتحديثات الشحن.\n\nللمساعدة، اكتب "مساعدة".`
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
  console.log(`[Messenger] Message from ${senderId}: ${text}`);

  try {
    const pool = await ensureConnection();

    // Get page access token
    const settingsResult = await pool.query(
      `SELECT fb_page_access_token, client_id, store_name FROM bot_settings 
       WHERE fb_page_id = $1 AND messenger_enabled = true`,
      [pageId]
    );

    if (settingsResult.rows.length === 0) return;

    const { fb_page_access_token, client_id, store_name } = settingsResult.rows[0];

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
router.get('/config', getConfig);

export default router;
