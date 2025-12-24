import { RequestHandler } from "express";
import { pool } from "../utils/database";
import { createConfirmationLink, sendOrderConfirmationMessages } from "../utils/bot-messaging";

/**
 * GET /api/storefront/:storeSlug/order/:orderId
 * Load order details for confirmation page
 */
export const getOrderForConfirmation: RequestHandler = async (req, res) => {
  try {
    const { storeSlug, orderId } = req.params;

    // Get order details
    const orderResult = await pool.query(
      `SELECT o.*, p.title as product_title, s.store_name, s.store_slug
       FROM store_orders o
       LEFT JOIN client_store_products p ON o.product_id = p.id
       LEFT JOIN client_store_settings s ON o.client_id = s.client_id
       WHERE o.id = $1 AND s.store_slug = $2 AND o.status = 'pending'`,
      [orderId, storeSlug]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: "Order not found or already confirmed" });
    }

    const order = orderResult.rows[0];

    // Check confirmation link validity
    const linkResult = await pool.query(
      `SELECT * FROM confirmation_links 
       WHERE order_id = $1 AND expires_at > NOW()`,
      [orderId]
    );

    if (linkResult.rows.length === 0) {
      return res.status(410).json({ error: "Confirmation link expired" });
    }

    // Update accessed count
    await pool.query(
      `UPDATE confirmation_links SET accessed_count = accessed_count + 1, accessed_at = NOW()
       WHERE order_id = $1`,
      [orderId]
    );

    res.json({
      order: {
        id: order.id,
        product_title: order.product_title,
        quantity: order.quantity,
        total_price: order.total_price,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone,
        shipping_address: order.shipping_address,
        store_name: order.store_name
      }
    });
  } catch (error) {
    console.error("Get order for confirmation error:", error);
    res.status(500).json({ error: "Failed to load order" });
  }
};

/**
 * POST /api/storefront/:storeSlug/order/:orderId/confirm
 * Customer confirms, declines, or changes order
 */
export const confirmOrder: RequestHandler = async (req, res) => {
  try {
    const { storeSlug, orderId } = req.params;
    const { action, orderData } = req.body;

    // Validate confirmation link
    const linkResult = await pool.query(
      `SELECT * FROM confirmation_links 
       WHERE order_id = $1 AND expires_at > NOW()`,
      [orderId]
    );

    if (linkResult.rows.length === 0) {
      return res.status(410).json({ error: "Confirmation link expired" });
    }

    if (action === "approve") {
      // Update order status to confirmed
      const updateResult = await pool.query(
        `UPDATE store_orders SET status = 'confirmed', updated_at = NOW()
         WHERE id = $1 RETURNING *`,
        [orderId]
      );

      if (updateResult.rows.length === 0) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Record confirmation
      await pool.query(
        `INSERT INTO order_confirmations (order_id, client_id, response_type, confirmed_via, confirmed_at)
         VALUES ($1, $2, 'approved', 'link', NOW())`,
        [orderId, linkResult.rows[0].client_id]
      );

      res.json({ success: true, message: "Order confirmed" });
    } else if (action === "decline") {
      // Mark order as declined
      await pool.query(
        `UPDATE store_orders SET status = 'declined', updated_at = NOW()
         WHERE id = $1`,
        [orderId]
      );

      // Record confirmation
      await pool.query(
        `INSERT INTO order_confirmations (order_id, client_id, response_type, confirmed_via, confirmed_at)
         VALUES ($1, $2, 'declined', 'link', NOW())`,
        [orderId, linkResult.rows[0].client_id]
      );

      res.json({ success: true, message: "Order declined" });
    } else {
      res.status(400).json({ error: "Invalid action" });
    }
  } catch (error) {
    console.error("Confirm order error:", error);
    res.status(500).json({ error: "Failed to confirm order" });
  }
};

/**
 * PATCH /api/storefront/:storeSlug/order/:orderId/update
 * Customer updates order details before confirming
 */
export const updateOrderDetails: RequestHandler = async (req, res) => {
  try {
    const { storeSlug, orderId } = req.params;
    const { customer_name, customer_email, customer_phone, shipping_address, quantity } = req.body;

    // Verify confirmation link is still valid
    const linkResult = await pool.query(
      `SELECT * FROM confirmation_links 
       WHERE order_id = $1 AND expires_at > NOW()`,
      [orderId]
    );

    if (linkResult.rows.length === 0) {
      return res.status(410).json({ error: "Confirmation link expired" });
    }

    // Update order
    const updateResult = await pool.query(
      `UPDATE store_orders 
       SET customer_name = $1, customer_email = $2, customer_phone = $3, 
           shipping_address = $4, quantity = $5, updated_at = NOW()
       WHERE id = $6 AND status = 'pending'
       RETURNING *`,
      [customer_name, customer_email, customer_phone, shipping_address, quantity, orderId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: "Order not found or already confirmed" });
    }

    res.json({
      success: true,
      order: updateResult.rows[0]
    });
  } catch (error) {
    console.error("Update order details error:", error);
    res.status(500).json({ error: "Failed to update order" });
  }
};

/**
 * Helper: Send bot messages when order is created
 */
export async function sendBotMessagesForOrder(
  orderId: number,
  clientId: number,
  customerPhone: string,
  customerName: string,
  storeName: string,
  productName: string,
  price: number,
  storeSlug: string
): Promise<void> {
  try {
    // Create confirmation link
    const confirmationToken = await createConfirmationLink(orderId, clientId);
    const baseUrl = process.env.BASE_URL || "https://ecopro-1lbl.onrender.com";
    const confirmationLink = `${baseUrl}/store/${storeSlug}/order/${orderId}/confirm`;

    // Send bot messages
    await sendOrderConfirmationMessages(
      orderId,
      clientId,
      customerPhone,
      customerName,
      storeName,
      productName,
      price,
      confirmationLink
    );

    console.log(`[Orders] Bot messages scheduled for order ${orderId}`);
  } catch (error) {
    console.error(`Error sending bot messages for order ${orderId}:`, error);
    // Don't throw - order should still be created even if bot fails
  }
}
