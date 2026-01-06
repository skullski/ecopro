import { Router, RequestHandler } from "express";
import { randomBytes } from "crypto";
import { pool } from "../utils/database";
import { sendBotMessagesForOrder } from "./order-confirmation";
import { createOrderTelegramLink } from "../utils/telegram";
import { replaceTemplateVariables, sendTelegramMessage } from "../utils/bot-messaging";
import { z } from 'zod';

const isProduction = process.env.NODE_ENV === 'production';

export const ordersRouter = Router();

const createOrderBodySchema = z
  .object({
    product_id: z.preprocess((v) => (typeof v === 'string' ? Number(v) : v), z.number().int().positive()).optional(),
    client_id: z.preprocess((v) => (typeof v === 'string' ? Number(v) : v), z.number().int().positive()).optional(),
    store_slug: z.string().trim().min(1).max(100).optional(),
    quantity: z.preprocess((v) => (typeof v === 'string' ? Number(v) : v), z.number().int().positive().max(9999)),
    // Client-provided total_price is accepted for backward-compatibility but ignored.
    // Total is computed server-side from the current product price.
    total_price: z.preprocess((v) => (typeof v === 'string' ? Number(v) : v), z.number().finite().positive().max(1_000_000_000)).optional(),
    customer_name: z.string().trim().min(1).max(255),
    customer_email: z.string().trim().email().max(255).optional().nullable(),
    customer_phone: z.string().trim().min(7).max(50),
    customer_address: z.string().trim().max(1000).optional().nullable(),
    shipping_wilaya_id: z.preprocess(
      (v) => (v === '' || v === null || v === undefined ? undefined : typeof v === 'string' ? Number(v) : v),
      z.number().int().positive()
    ).optional().nullable(),
    shipping_commune_id: z.preprocess(
      (v) => (v === '' || v === null || v === undefined ? undefined : typeof v === 'string' ? Number(v) : v),
      z.number().int().positive()
    ).optional().nullable(),
    shipping_hai: z.string().trim().max(120).optional().nullable(),
  })
  .strict();

/**
 * Create a new order from a buyer
 * POST /api/orders/create
 */
export const createOrder: RequestHandler = async (req, res) => {
  let client: any;
  let inTransaction = false;
  try {
    const parsed = createOrderBodySchema.safeParse(req.body);
    if (parsed.success === false) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }
    const {
      product_id,
      client_id,
      store_slug,
      quantity,
      total_price: _ignoredTotalPrice,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      shipping_wilaya_id,
      shipping_commune_id,
      shipping_hai,
    } = parsed.data;

    const normalizedPhone = String(customer_phone).replace(/\s/g, '');
    if (!/^\+?[0-9]{7,}$/.test(normalizedPhone)) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    if (!product_id) {
      return res.status(400).json({ error: 'product_id is required' });
    }
    
    if (!isProduction) {
      console.log(`[Orders] Attempting to resolve client_id from product_id=${product_id} or store_slug=${store_slug}`);
    }
    
    let resolvedClientId: number | null = null;

    // Resolve owner from store_slug first (if given)
    if (store_slug) {
      if (!isProduction) console.log(`[Orders] Looking up store_slug in client_store_settings...`);
      const cs = await pool.query('SELECT client_id FROM client_store_settings WHERE store_slug = $1 LIMIT 1', [store_slug]);
      if (cs.rows.length > 0) {
        resolvedClientId = Number(cs.rows[0].client_id);
        if (!isProduction) console.log(`[Orders] Found in client_store_settings, client_id=${resolvedClientId}`);
      } else {
        return res.status(404).json({ error: 'Store not found' });
      }
    }

    // Resolve owner + pricing from product_id (and cross-check if store_slug was provided)
    const productRes = await pool.query(
      'SELECT client_id, price, stock_quantity, status FROM client_store_products WHERE id = $1 LIMIT 1',
      [product_id]
    );
    if (productRes.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const productRow = productRes.rows[0];
    const productClientId = Number(productRow.client_id);
    if (!resolvedClientId) {
      resolvedClientId = productClientId;
      if (!isProduction) console.log(`[Orders] Resolved client_id from product: ${resolvedClientId}`);
    } else if (resolvedClientId !== productClientId) {
      return res.status(400).json({ error: 'Product does not belong to store' });
    }

    if (String(productRow.status || 'active') !== 'active') {
      return res.status(400).json({ error: 'Product is not available' });
    }

    const unitPrice = Number(productRow.price);
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      return res.status(400).json({ error: 'Invalid product price' });
    }

    const availableStock = Number(productRow.stock_quantity ?? 0);
    if (!Number.isFinite(availableStock) || availableStock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const expectedTotalPrice = unitPrice * Number(quantity);

    if (!resolvedClientId) {
      return res.status(400).json({ error: 'Could not determine store owner' });
    }

    if (client_id && Number(client_id) !== Number(resolvedClientId)) {
      return res.status(400).json({ error: 'client_id mismatch' });
    }

    // Create order with pending status + atomically decrement stock
    client = await pool.connect();
    await client.query('BEGIN');
    inTransaction = true;
    const result = await client.query(
      `INSERT INTO store_orders (
        product_id, client_id, quantity, total_price, 
        customer_name, customer_email, customer_phone, shipping_address,
        shipping_wilaya_id, shipping_commune_id, shipping_hai,
        status, payment_status, created_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,TIMEZONE('UTC', NOW())) 
      RETURNING *`,
      [
        product_id || null,
        resolvedClientId,
        quantity,
        expectedTotalPrice,
        customer_name,
        customer_email || null,
        normalizedPhone || null,
        customer_address || null,
        shipping_wilaya_id || null,
        shipping_commune_id || null,
        shipping_hai || null,
        'pending',
        'unpaid'
      ]
    );

    const stockUpdate = await client.query(
      'UPDATE client_store_products SET stock_quantity = stock_quantity - $1 WHERE id = $2 AND client_id = $3 AND stock_quantity >= $1 RETURNING stock_quantity',
      [quantity, product_id, resolvedClientId]
    );
    if (stockUpdate.rows.length === 0) {
      await client.query('ROLLBACK');
      inTransaction = false;
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    await client.query('COMMIT');
    inTransaction = false;

    // Create Telegram deep-link for this order (optional for the customer)
    const telegram = await createOrderTelegramLink({
      orderId: Number(result.rows[0].id),
      clientId: Number(resolvedClientId),
      customerPhone: normalizedPhone,
      customerName: String(customer_name),
    }).catch(() => ({ startToken: '', startUrl: null } as any));

    res.status(201).json({
      success: true,
      order: result.rows[0],
      message: 'Order created successfully',
      telegramStartUrl: telegram?.startUrl || null,
      telegramUrls: telegram?.startUrl ? [telegram.startUrl] : [],
    });
    // Broadcast order creation
    if (global.broadcastOrderUpdate) {
      global.broadcastOrderUpdate(result.rows[0]);
    }

    // Audit log
    try {
      await pool.query(
        `INSERT INTO audit_logs(actor_type, actor_id, action, target_type, target_id, details, created_at)
         VALUES($1,$2,$3,$4,$5,$6,NOW())`,
        ['system', resolvedClientId || null, 'create_order', 'order', result.rows[0]?.id || null, JSON.stringify({ product_id, customer_name })]
      );
    } catch {}

    // Fire-and-forget bot messaging (Telegram instant + scheduled confirmation with buttons)
    const order = result.rows[0];
    const toPhone = normalizedPhone;
    if (toPhone) {
      const storeRow = (await pool.query(
        'SELECT store_name, store_slug FROM client_store_settings WHERE client_id = $1 LIMIT 1',
        [resolvedClientId]
      )).rows?.[0];
      const storeName = storeRow?.store_name || 'EcoPro Store';
      const storeSlug = storeRow?.store_slug || store_slug;

      if (storeSlug) {
        const productTitle = (await pool.query(
          'SELECT title FROM client_store_products WHERE id = $1 LIMIT 1',
          [product_id]
        )).rows?.[0]?.title || 'Product';

        try {
          // If Telegram is enabled for this store, try to send instant messages when connected,
          // and always schedule a confirmation message with buttons.
          const botRes = await pool.query(
            `SELECT telegram_bot_token, template_instant_order, template_pin_instructions,
                    telegram_delay_minutes, template_order_confirmation
             FROM bot_settings
             WHERE client_id = $1 AND enabled = true AND provider = 'telegram'
             LIMIT 1`,
            [resolvedClientId]
          );

          const bot = botRes.rows[0];
          const botToken: string | undefined = bot?.telegram_bot_token;

          // Default templates (same spirit as public-store.ts)
          const defaultInstantOrder = `🎉 Thank you, {customerName}!

Your order has been received successfully ✅

━━━━━━━━━━━━━━━━
📦 Order Details
━━━━━━━━━━━━━━━━
🔢 Order ID: #{orderId}
📱 Product: {productName}
💰 Price: {totalPrice} DZD
📍 Quantity: {quantity}

━━━━━━━━━━━━━━━━
👤 Delivery Information
━━━━━━━━━━━━━━━━
📛 Name: {customerName}
📞 Phone: {customerPhone}
🏠 Address: {address}

━━━━━━━━━━━━━━━━
🚚 Order Status: Processing
━━━━━━━━━━━━━━━━

We will contact you soon for confirmation 📞

⭐ From {storeName}`;

          const defaultPinInstructions = `📌 Important tip:

Long press on the previous message and select "Pin" to easily track your order!

🔔 Make sure to:
• Enable notifications for the bot
• Don't mute the conversation
• You will receive order status updates here directly`;

          const defaultConfirmationTemplate = `Hello {customerName}! 🌟

Do you confirm your order from {storeName}?

📦 Product: {productName}
💰 Price: {totalPrice} DZD
📍 Address: {address}

Press one of the buttons to confirm or cancel:`;

          const orderVars = {
            customerName: customer_name,
            productName: productTitle,
            totalPrice: String(order.total_price ?? expectedTotalPrice),
            price: String(order.total_price ?? expectedTotalPrice),
            quantity: quantity,
            orderId: order.id,
            customerPhone: customer_phone || normalizedPhone,
            address: customer_address || 'Not specified',
            storeName: storeName,
            companyName: storeName,
          };

          // Check if customer is already linked (phone -> chat mapping)
          let telegramChatId: string | null = null;
          const chatRes = await pool.query(
            `SELECT telegram_chat_id FROM customer_messaging_ids
             WHERE client_id = $1 AND customer_phone = $2 AND telegram_chat_id IS NOT NULL
             LIMIT 1`,
            [resolvedClientId, normalizedPhone]
          );
          if (chatRes.rows.length && chatRes.rows[0]?.telegram_chat_id) {
            telegramChatId = String(chatRes.rows[0].telegram_chat_id);
          }

          // If connected, send the immediate messages now and bind chat to this order.
          if (botToken && telegramChatId) {
            await pool.query(
              `INSERT INTO order_telegram_chats (order_id, client_id, telegram_chat_id, created_at)
               VALUES ($1, $2, $3, NOW())
               ON CONFLICT (order_id) DO UPDATE SET telegram_chat_id = EXCLUDED.telegram_chat_id`,
              [order.id, resolvedClientId, telegramChatId]
            );

            const instantOrderTemplate = bot.template_instant_order || defaultInstantOrder;
            const pinTemplate = bot.template_pin_instructions || defaultPinInstructions;
            const orderMessage = replaceTemplateVariables(String(instantOrderTemplate), orderVars);

            const sent = await sendTelegramMessage(botToken, telegramChatId, orderMessage);
            if (sent.success) {
              await sendTelegramMessage(botToken, telegramChatId, String(pinTemplate));
            }
          }

          // Always schedule confirmation message with buttons (worker will wait for chat link if needed)
          if (botToken) {
            const delayMinutes = bot?.telegram_delay_minutes || 5;
            const scheduledTime = new Date(Date.now() + Number(delayMinutes) * 60 * 1000);
            console.log(`[Orders] Scheduling confirmation for order ${order.id} in ${delayMinutes} minutes (at ${scheduledTime.toISOString()}, db value: ${bot?.telegram_delay_minutes})`);
            const confirmationTemplate = bot?.template_order_confirmation || defaultConfirmationTemplate;
            const confirmationMessage = replaceTemplateVariables(String(confirmationTemplate), orderVars);

            await pool.query(
              `INSERT INTO scheduled_messages
               (client_id, order_id, telegram_chat_id, message_content, message_type, scheduled_at, status)
               VALUES ($1, $2, $3, $4, $5, $6, 'pending')
               ON CONFLICT DO NOTHING`,
              [resolvedClientId, order.id, telegramChatId, confirmationMessage, 'order_confirmation', scheduledTime]
            );
          }
        } catch (e) {
          // Fall back to the old flow (bot_messages) if anything above fails
          sendBotMessagesForOrder(
            order.id,
            Number(resolvedClientId),
            toPhone,
            customer_name,
            storeName,
            productTitle,
            Number(order.total_price ?? expectedTotalPrice),
            storeSlug
          ).catch(() => {/* swallow errors */});
        }
      }
    }
  } catch (error) {
    if (inTransaction && client) {
      try {
        await client.query('ROLLBACK');
      } catch {}
    }
    console.error("Create order error:", error);
    res.status(500).json({ error: "Failed to create order" });
  } finally {
    try {
      if (client) client.release();
    } catch {}
  }
};

// In-memory cache for orders (per-client)
const ordersCache = new Map<number, { data: any; timestamp: number }>();
const ORDERS_CACHE_TTL = 5 * 1000; // 5 seconds cache - orders need to be more real-time

// Clear orders cache when an order is modified
export function clearOrdersCache(clientId: number) {
  ordersCache.delete(clientId);
}

/**
 * Get all orders for a client (dashboard)
 * GET /api/client/orders
 * Query params: limit (default 100), offset (default 0)
 */
export const getClientOrders: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    // Get pagination params
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 500); // Max 500 to prevent huge queries
    const offset = parseInt(req.query.offset as string) || 0;
    
    // Check cache (only for initial page loads with no offset)
    const cacheKey = req.user.id;
    if (offset === 0 && limit === 100) {
      const cached = ordersCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < ORDERS_CACHE_TTL) {
        return res.json(cached.data);
      }
    }

    // Optimized query using Promise.all for parallel execution
    const [result, countResult] = await Promise.all([
      pool.query(
        `SELECT 
          o.id,
          o.product_id,
          o.client_id,
          o.quantity,
          o.total_price,
          o.status,
          o.customer_name,
          o.customer_email,
          o.customer_phone,
          o.shipping_address,
          o.created_at,
          o.updated_at,
          o.delivery_company_id,
          o.tracking_number,
          o.delivery_status,
          o.shipping_label_url,
          COALESCE(cp.title, 'Deleted Product') as product_title,
          COALESCE(cp.price, 0) as product_price,
          COALESCE(cp.images, '{}') as product_images
        FROM store_orders o
        LEFT JOIN client_store_products cp ON o.product_id = cp.id
        WHERE o.client_id = $1
        ORDER BY o.created_at DESC
        LIMIT $2 OFFSET $3`,
        [req.user.id, limit, offset]
      ),
      pool.query(
        'SELECT COUNT(*) as total FROM store_orders WHERE client_id = $1',
        [req.user.id]
      )
    ]);

    const responseData = {
      orders: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset,
      hasMore: offset + limit < parseInt(countResult.rows[0].total)
    };

    // Cache the response for default pagination
    if (offset === 0 && limit === 100) {
      ordersCache.set(cacheKey, { data: responseData, timestamp: Date.now() });
    }

    res.json(responseData);
  } catch (error) {
    console.error("Get client orders error:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

/**
 * Store product data for checkout (temporary session data)
 * POST /api/checkout/save-product
 * Stores product in database instead of localStorage
 */
export const saveProductForCheckout: RequestHandler = async (req, res) => {
  try {
    const { product_id, product_data, store_slug } = req.body;

    if (!product_id || !product_data) {
      res.status(400).json({ error: "Missing product_id or product_data" });
      return;
    }

    // Store in a temporary checkout_sessions table
    // This persists across page refreshes and browser restarts
    const sessionId = `${product_id}-${Date.now()}-${randomBytes(16).toString('base64url')}`;
    
    const result = await pool.query(
      `INSERT INTO checkout_sessions (session_id, product_id, product_data, store_slug, created_at, expires_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW() + INTERVAL '24 hours')
       RETURNING session_id`,
      [sessionId, product_id, JSON.stringify(product_data), store_slug || null]
    );

    res.json({
      success: true,
      sessionId: result.rows[0].session_id
    });
  } catch (error) {
    console.error("Save product for checkout error:", error);
    res.status(500).json({ error: "Failed to save product" });
  }
};

/**
 * Retrieve product data for checkout
 * GET /api/checkout/get-product/:sessionId
 * Retrieves product from database instead of localStorage
 */
export const getProductForCheckout: RequestHandler = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      res.status(400).json({ error: "Missing sessionId" });
      return;
    }

    const result = await pool.query(
      `SELECT * FROM checkout_sessions 
       WHERE session_id = $1 AND expires_at > NOW()`,
      [sessionId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Checkout session not found or expired" });
      return;
    }

    res.json({
      success: true,
      product: result.rows[0].product_data,
      store_slug: result.rows[0].store_slug
    });
  } catch (error) {
    console.error("Get product for checkout error:", error);
    res.status(500).json({ error: "Failed to retrieve product" });
  }
};

/**
 * Update order status
 * PATCH /api/client/orders/:id/status
 */
export const updateOrderStatus: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const { id } = req.params;
    const { status: rawStatus } = req.body;
    const status = rawStatus?.trim();
    
    if (!status) {
      res.status(400).json({ error: "Status is required" });
      return;
    }
    
    if (!isProduction) console.log('[updateOrderStatus] User:', req.user.id, 'Order:', id, 'Status:', status);

    // Built-in valid statuses
    const builtInStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    
    // Check if status is a built-in status OR a custom status for this client
    let isValidStatus = builtInStatuses.includes(status);
    
    if (!isValidStatus) {
      // Check custom statuses in the database
      if (!isProduction) console.log('[updateOrderStatus] Checking custom status for client_id:', req.user.id, 'status:', status);
      const customStatusCheck = await pool.query(
        'SELECT id FROM order_statuses WHERE client_id = $1 AND name = $2',
        [req.user.id, status]
      );
      if (!isProduction) console.log('[updateOrderStatus] Custom status query result:', customStatusCheck.rows);
      isValidStatus = customStatusCheck.rows.length > 0;
    }
    
    if (!isValidStatus) {
      if (!isProduction) console.log('[updateOrderStatus] Invalid status rejected');
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    const result = await pool.query(
      `UPDATE store_orders 
       SET status = $1, updated_at = NOW() 
       WHERE id = $2 AND client_id = $3
       RETURNING *`,
      [status, id, req.user.id]
    );
    
    if (!isProduction) console.log('[updateOrderStatus] Update result rows:', result.rows.length);

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.json(result.rows[0]);
    // Broadcast order status update
    if (global.broadcastOrderUpdate) {
      global.broadcastOrderUpdate(result.rows[0]);
    }

    // Telegram tracking updates (fire-and-forget)
    try {
      const settingsRes = await pool.query(
        `SELECT enabled, provider, telegram_bot_token, template_shipping
         FROM bot_settings WHERE client_id = $1 LIMIT 1`,
        [req.user.id]
      );
      const settings = settingsRes.rows[0];
      if (settings?.enabled && settings?.provider === 'telegram' && settings?.telegram_bot_token) {
        const orderRow = result.rows[0];
        const shouldNotify = ['processing', 'shipped', 'delivered', 'cancelled'].includes(String(status));
        if (shouldNotify) {
          const msg = replaceTemplateVariables(
            String(settings.template_shipping || 'Order #{orderId} status updated: {status}'),
            {
              orderId: orderRow.id,
              status: String(status),
              trackingNumber: '',
            }
          );
          await pool.query(
            `INSERT INTO bot_messages (order_id, client_id, customer_phone, message_type, message_content, confirmation_link, send_at)
             VALUES ($1,$2,$3,'telegram',$4,NULL,NOW())`,
            [orderRow.id, req.user.id, orderRow.customer_phone || '', msg]
          );
        }
      }
    } catch {
      // ignore bot tracking failures
    }
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ error: "Failed to update order" });
  }
};

/**
 * Get custom order statuses for a client
 * GET /api/client/order-statuses
 */
export const getOrderStatuses: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user?.id;
    if (!clientId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const result = await pool.query(
      `SELECT id, name, key, color, icon, sort_order, is_default, is_system, counts_as_revenue 
       FROM order_statuses 
       WHERE client_id = $1 
       ORDER BY sort_order ASC, id ASC`,
      [clientId]
    );

    // If no custom statuses exist, return default statuses
    if (result.rows.length === 0) {
      const defaultStatuses = [
        { id: 'pending', name: 'Pending', key: 'pending', color: '#eab308', icon: '●', sort_order: 0, is_default: true, is_system: true, counts_as_revenue: false },
        { id: 'confirmed', name: 'Confirmed', key: 'confirmed', color: '#22c55e', icon: '✓', sort_order: 1, is_default: true, is_system: true, counts_as_revenue: false },
        { id: 'completed', name: 'Completed', key: 'completed', color: '#10b981', icon: '✓', sort_order: 2, is_default: true, is_system: true, counts_as_revenue: true },
        { id: 'cancelled', name: 'Cancelled', key: 'cancelled', color: '#ef4444', icon: '✕', sort_order: 3, is_default: true, is_system: true, counts_as_revenue: false },
        { id: 'at_delivery', name: 'At Delivery', key: 'at_delivery', color: '#8b5cf6', icon: '🚚', sort_order: 4, is_default: true, is_system: true, counts_as_revenue: false },
      ];
      res.json(defaultStatuses);
      return;
    }

    res.json(result.rows);
  } catch (error) {
    console.error("Get order statuses error:", error);
    res.status(500).json({ error: "Failed to fetch order statuses" });
  }
};

/**
 * Create a custom order status
 * POST /api/client/order-statuses
 */
export const createOrderStatus: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user?.id;
    if (!clientId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { name, key, color, icon, counts_as_revenue } = req.body;
    const trimmedName = name?.trim();
    if (!trimmedName) {
      res.status(400).json({ error: "Status name is required" });
      return;
    }

    // Get max sort_order
    const maxOrder = await pool.query(
      'SELECT COALESCE(MAX(sort_order), -1) as max_order FROM order_statuses WHERE client_id = $1',
      [clientId]
    );

    const result = await pool.query(
      `INSERT INTO order_statuses (client_id, name, key, color, icon, sort_order, counts_as_revenue)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, key, color, icon, sort_order, is_default, counts_as_revenue`,
      [clientId, trimmedName, key || null, color || '#6b7280', icon || '●', (maxOrder.rows[0].max_order || 0) + 1, counts_as_revenue || false]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Create order status error:", error);
    res.status(500).json({ error: "Failed to create order status" });
  }
};

/**
 * Update a custom order status
 * PATCH /api/client/order-statuses/:id
 */
export const updateCustomOrderStatus: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user?.id;
    const statusId = req.params.id;
    if (!clientId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { name, color, icon, sort_order, counts_as_revenue } = req.body;

    const result = await pool.query(
      `UPDATE order_statuses 
       SET name = COALESCE($1, name),
           color = COALESCE($2, color),
           icon = COALESCE($3, icon),
           sort_order = COALESCE($4, sort_order),
           counts_as_revenue = COALESCE($5, counts_as_revenue),
           updated_at = NOW()
       WHERE id = $6 AND client_id = $7
       RETURNING id, name, color, icon, sort_order, is_default, counts_as_revenue`,
      [name, color, icon, sort_order, counts_as_revenue, statusId, clientId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Status not found" });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
};

/**
 * Delete a custom order status
 * DELETE /api/client/order-statuses/:id
 */
export const deleteOrderStatus: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user?.id;
    const statusId = req.params.id;
    if (!clientId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Check if this is a system status (cannot be deleted)
    const checkResult = await pool.query(
      'SELECT is_system FROM order_statuses WHERE id = $1 AND client_id = $2',
      [statusId, clientId]
    );

    if (checkResult.rows.length === 0) {
      res.status(404).json({ error: "Status not found" });
      return;
    }

    if (checkResult.rows[0].is_system) {
      res.status(400).json({ error: "Cannot delete system status. These statuses are required for platform functionality." });
      return;
    }

    const result = await pool.query(
      'DELETE FROM order_statuses WHERE id = $1 AND client_id = $2 AND is_system = FALSE RETURNING id',
      [statusId, clientId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Status not found or cannot delete system status" });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Delete order status error:", error);
    res.status(500).json({ error: "Failed to delete order status" });
  }
};

/**
 * Get count of new orders since a given timestamp
 * GET /api/orders/new-count?since=ISO_TIMESTAMP
 */
export const getNewOrdersCount: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user?.id;
    if (!clientId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const since = req.query.since as string | undefined;
    
    let query: string;
    let params: any[];

    if (since) {
      // Count orders created since the given timestamp
      query = `SELECT COUNT(*)::int AS count FROM store_orders WHERE client_id = $1 AND created_at > $2`;
      params = [clientId, since];
    } else {
      // Count all pending orders if no timestamp provided
      query = `SELECT COUNT(*)::int AS count FROM store_orders WHERE client_id = $1 AND status = 'pending'`;
      params = [clientId];
    }

    const result = await pool.query(query, params);
    res.json({ count: result.rows[0]?.count || 0 });
  } catch (error) {
    console.error("Get new orders count error:", error);
    res.status(500).json({ error: "Failed to get new orders count" });
  }
};
