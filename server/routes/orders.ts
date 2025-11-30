import { Router, RequestHandler } from "express";
import { pool } from "../utils/database";

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
        client_id,
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
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ error: "Failed to update order" });
  }
};

