import { Router, RequestHandler } from "express";
import { pool } from "../utils/database";
import { sendBotMessagesForOrder } from "./order-confirmation";
import { createOrderTelegramLink } from "../utils/telegram";
import { replaceTemplateVariables } from "../utils/bot-messaging";

export const ordersRouter = Router();

/**
 * Create a new order from a buyer
 * POST /api/orders/create
 */
export const createOrder: RequestHandler = async (req, res) => {
  try {
    const {
      product_id,
      client_id,
      store_slug,
      quantity,
      total_price,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
    } = req.body;

    // Validate required fields
    if (!quantity || !total_price || !customer_name || !customer_phone) {
      res.status(400).json({ error: "Missing required fields: quantity, total_price, customer_name" });
      return;
    }

    const normalizedPhone = String(customer_phone).replace(/\s/g, '');
    if (!/^\+?[0-9]{7,}$/.test(normalizedPhone)) {
      res.status(400).json({ error: 'Invalid phone number' });
      return;
    }

    // Validate that we have either product_id or store_slug
    if (!product_id && !store_slug) {
      res.status(400).json({ error: "Must provide either product_id or store_slug" });
      return;
    }

    // Infer client_id by product or store_slug if not provided
    let resolvedClientId = client_id;
    let orderType = 'client'; // Track order type for later use
    
    console.log(`[Orders] Attempting to resolve client_id from product_id=${product_id} or store_slug=${store_slug}`);
    
    if (!resolvedClientId && product_id) {
      // First try client_store_products
      const pid = await pool.query('SELECT client_id FROM client_store_products WHERE id = $1', [product_id]);
      if (pid.rows.length > 0) {
        resolvedClientId = pid.rows[0].client_id;
        console.log(`[Orders] Resolved client_id from product: ${resolvedClientId}`);
      } else {
        // Try marketplace_products (seller) - but we need to handle this differently
        const mProduct = await pool.query('SELECT seller_id FROM marketplace_products WHERE id = $1', [product_id]);
        if (mProduct.rows.length > 0) {
          console.log(`[Orders] Product is a marketplace product (seller_id=${mProduct.rows[0].seller_id})`);
          // For now, orders from marketplace need special handling - we'll just fail gracefully
        }
      }
    }
    
    if (!resolvedClientId && store_slug) {
      // Try client_store_settings
      console.log(`[Orders] Looking up store_slug in client_store_settings...`);
      const cs = await pool.query('SELECT client_id FROM client_store_settings WHERE store_slug = $1', [store_slug]);
      if (cs.rows.length > 0) {
        resolvedClientId = cs.rows[0].client_id;
        orderType = 'client';
        console.log(`[Orders] Found in client_store_settings, client_id=${resolvedClientId}`);
      } else {
        // Fall back to seller_store_settings
        console.log(`[Orders] Not found in client_store_settings, trying seller_store_settings...`);
        const ss = await pool.query('SELECT seller_id FROM seller_store_settings WHERE store_slug = $1', [store_slug]);
        if (ss.rows.length > 0) {
          // For seller orders, we need to handle differently - store seller_id as client_id temporarily
          resolvedClientId = ss.rows[0].seller_id;
          orderType = 'seller';
          console.log(`[Orders] Found in seller_store_settings, seller_id=${resolvedClientId}`);
        } else {
          console.log(`[Orders] Store not found in either table: ${store_slug}`);
        }
      }
    }

    // Final check - must have client_id by now
    if (!resolvedClientId) {
      res.status(400).json({ error: "Could not determine client - provide client_id, product_id, or store_slug" });
      return;
    }
    
    console.log(`[Orders] Resolved ${orderType}_id: ${resolvedClientId}`);

    // Create order with pending status
    const result = await pool.query(
      `INSERT INTO store_orders (
        product_id, client_id, quantity, total_price, 
        customer_name, customer_email, customer_phone, shipping_address,
        status, payment_status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) 
      RETURNING *`,
      [
        product_id,
        resolvedClientId,
        quantity,
        total_price,
        customer_name,
        customer_email || null,
        customer_phone || null,
        customer_address || null,
        'pending',
        'unpaid'
      ]
    );

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

    // Fire-and-forget bot confirmation with confirmation link tied to this order
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

        sendBotMessagesForOrder(
          order.id,
          Number(resolvedClientId),
          toPhone,
          customer_name,
          storeName,
          productTitle,
          total_price,
          storeSlug
        ).catch(() => {/* swallow errors */});
      }
    }
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
};

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

    // Optimized query: use client_id directly and LEFT JOIN for products (handles deleted products)
    const result = await pool.query(
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
        COALESCE(cp.title, 'Deleted Product') as product_title,
        COALESCE(cp.price, 0) as product_price,
        COALESCE(cp.images, '{}') as product_images
      FROM store_orders o
      LEFT JOIN client_store_products cp ON o.product_id = cp.id
      WHERE o.client_id = $1
      ORDER BY o.created_at DESC
      LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    // Get total count for pagination
    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM store_orders WHERE client_id = $1',
      [req.user.id]
    );

    res.json({
      orders: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset,
      hasMore: offset + limit < parseInt(countResult.rows[0].total)
    });
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
    const sessionId = `${product_id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
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
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
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
            String(settings.template_shipping || 'تم تحديث حالة طلبك #{orderId}: {status}'),
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
      `SELECT id, name, color, icon, sort_order, is_default 
       FROM order_statuses 
       WHERE client_id = $1 
       ORDER BY sort_order ASC, id ASC`,
      [clientId]
    );

    // If no custom statuses exist, return default statuses
    if (result.rows.length === 0) {
      const defaultStatuses = [
        { id: 'pending', name: 'قيد الانتظار', color: '#eab308', icon: '●', sort_order: 0, is_default: true },
        { id: 'confirmed', name: 'مؤكد', color: '#22c55e', icon: '✓', sort_order: 1, is_default: true },
        { id: 'processing', name: 'قيد المعالجة', color: '#3b82f6', icon: '◐', sort_order: 2, is_default: true },
        { id: 'shipped', name: 'تم الشحن', color: '#8b5cf6', icon: '📦', sort_order: 3, is_default: true },
        { id: 'delivered', name: 'تم التوصيل', color: '#10b981', icon: '✓', sort_order: 4, is_default: true },
        { id: 'cancelled', name: 'ملغي', color: '#ef4444', icon: '✕', sort_order: 5, is_default: true },
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

    const { name, color, icon } = req.body;
    if (!name) {
      res.status(400).json({ error: "Status name is required" });
      return;
    }

    // Get max sort_order
    const maxOrder = await pool.query(
      'SELECT COALESCE(MAX(sort_order), -1) as max_order FROM order_statuses WHERE client_id = $1',
      [clientId]
    );

    const result = await pool.query(
      `INSERT INTO order_statuses (client_id, name, color, icon, sort_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, color, icon, sort_order, is_default`,
      [clientId, name, color || '#6b7280', icon || '●', (maxOrder.rows[0].max_order || 0) + 1]
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
export const updateOrderStatus: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user?.id;
    const statusId = req.params.id;
    if (!clientId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { name, color, icon, sort_order } = req.body;

    const result = await pool.query(
      `UPDATE order_statuses 
       SET name = COALESCE($1, name),
           color = COALESCE($2, color),
           icon = COALESCE($3, icon),
           sort_order = COALESCE($4, sort_order),
           updated_at = NOW()
       WHERE id = $5 AND client_id = $6
       RETURNING id, name, color, icon, sort_order, is_default`,
      [name, color, icon, sort_order, statusId, clientId]
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

    const result = await pool.query(
      'DELETE FROM order_statuses WHERE id = $1 AND client_id = $2 AND is_default = FALSE RETURNING id',
      [statusId, clientId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Status not found or cannot delete default status" });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Delete order status error:", error);
    res.status(500).json({ error: "Failed to delete order status" });
  }
};

