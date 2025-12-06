import { Router, RequestHandler } from "express";
import { pool } from "../utils/database";
import { sendWhatsAppMessage } from "../utils/messaging";

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
    if (!product_id || !client_id || !quantity || !total_price || !customer_name) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Infer client_id by product or store_slug if not provided
    let resolvedClientId = client_id;
    if (!resolvedClientId && product_id) {
      const pid = await pool.query('SELECT client_id FROM client_store_products WHERE id = $1', [product_id]);
      resolvedClientId = pid.rows?.[0]?.client_id || resolvedClientId;
    }
    if (!resolvedClientId && store_slug) {
      const cs = await pool.query('SELECT client_id FROM client_store_settings WHERE store_slug = $1', [store_slug]);
      resolvedClientId = cs.rows?.[0]?.client_id || resolvedClientId;
    }

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

    res.status(201).json({
      success: true,
      order: result.rows[0],
      message: 'Order created successfully'
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

    // Fire-and-forget WhatsApp confirmation (non-blocking)
    const order = result.rows[0];
    const toPhone = customer_phone;
    if (toPhone) {
      const storeName = (await pool.query(
        'SELECT store_name FROM client_store_settings WHERE client_id = $1 LIMIT 1',
        [resolvedClientId]
      )).rows?.[0]?.store_name || 'EcoPro Store';
      const productTitle = (await pool.query(
        'SELECT title FROM store_products WHERE id = $1 LIMIT 1',
        [product_id]
      )).rows?.[0]?.title || 'Product';
      const price = total_price;
      const msg = `Hi ${customer_name}, your order for ${productTitle} at ${storeName} is received. Total: ${price}. We will contact you soon. Thank you!`;
      sendWhatsAppMessage(toPhone, msg).catch(() => {/* swallow errors */});
    }
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
};

/**
 * Get all orders for a client (dashboard)
 * GET /api/client/orders
 */
export const getClientOrders: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    const result = await pool.query(
      `SELECT 
        o.*,
        p.title as product_title,
        p.price as product_price,
        p.images as product_images
      FROM store_orders o
      LEFT JOIN store_products p ON o.product_id = p.id
      WHERE o.client_id = $1
      ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Get client orders error:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
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
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ error: "Failed to update order" });
  }
};

