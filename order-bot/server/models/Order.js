import { query } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';

export class Order {
  static async create(orderData) {
    const {
      order_number,
      client_id,
      buyer_id,
      product_name,
      quantity,
      total_price,
      notes
    } = orderData;

    const confirmation_token = uuidv4();

    const result = await query(
      `INSERT INTO orders 
       (order_number, client_id, buyer_id, product_name, quantity, total_price, confirmation_token, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [order_number, client_id, buyer_id, product_name, quantity, total_price, confirmation_token, notes]
    );

    return result.rows[0];
  }

  static async findById(id) {
    const result = await query(
      `SELECT o.*, 
              c.name as client_name, c.email as client_email, c.phone as client_phone,
              b.name as buyer_name, b.phone as buyer_phone, b.email as buyer_email, b.address as buyer_address
       FROM orders o
       JOIN clients c ON o.client_id = c.id
       JOIN buyers b ON o.buyer_id = b.id
       WHERE o.id = $1`,
      [id]
    );

    return result.rows[0];
  }

  static async findByToken(token) {
    const result = await query(
      `SELECT o.*, 
              c.name as client_name, c.email as client_email, c.phone as client_phone,
              b.name as buyer_name, b.phone as buyer_phone, b.email as buyer_email, b.address as buyer_address
       FROM orders o
       JOIN clients c ON o.client_id = c.id
       JOIN buyers b ON o.buyer_id = b.id
       WHERE o.confirmation_token = $1`,
      [token]
    );

    return result.rows[0];
  }

  static async updateStatus(id, status, notes = null) {
    const result = await query(
      `UPDATE orders 
       SET status = $1, confirmed_at = CURRENT_TIMESTAMP, notes = COALESCE($2, notes), updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, notes, id]
    );

    return result.rows[0];
  }

  // Update order details
  static async update(id, updates) {
    const {
      product_name,
      quantity,
      total_price,
      status,
      internal_notes,
      payment_status,
      payment_method,
      shipping_address,
      wilaya,
      commune,
      delivery_status,
    } = updates;

    const result = await query(
      `UPDATE orders 
       SET product_name = COALESCE($1, product_name),
           quantity = COALESCE($2, quantity),
           total_price = COALESCE($3, total_price),
           status = COALESCE($4, status),
           internal_notes = COALESCE($5, internal_notes),
           payment_status = COALESCE($6, payment_status),
           payment_method = COALESCE($7, payment_method),
           shipping_address = COALESCE($8, shipping_address),
           wilaya = COALESCE($9, wilaya),
           commune = COALESCE($10, commune),
           delivery_status = COALESCE($11, delivery_status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $12
       RETURNING *`,
      [
        product_name,
        quantity,
        total_price,
        status,
        internal_notes,
        payment_status,
        payment_method,
        shipping_address,
        wilaya,
        commune,
        delivery_status,
        id,
      ]
    );

    return result.rows[0];
  }

  static async markWhatsAppSent(id) {
    await query(
      `UPDATE orders 
       SET whatsapp_sent = TRUE, whatsapp_sent_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id]
    );
  }

  static async markSMSSent(id) {
    await query(
      `UPDATE orders 
       SET sms_sent = TRUE, sms_sent_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id]
    );
  }

  static async findByClientId(clientId, status = null) {
    let sql = `
      SELECT o.*, 
             b.name as buyer_name, b.phone as buyer_phone, b.email as buyer_email
      FROM orders o
      JOIN buyers b ON o.buyer_id = b.id
      WHERE o.client_id = $1
    `;

    const params = [clientId];

    if (status) {
      sql += ` AND o.status = $2`;
      params.push(status);
    }

    sql += ` ORDER BY o.created_at DESC`;

    const result = await query(sql, params);
    return result.rows;
  }

  // Search orders with filters
  static async search(clientId, filters = {}) {
    let sql = `
      SELECT o.*, 
             b.name as buyer_name, b.phone as buyer_phone, b.email as buyer_email
      FROM orders o
      JOIN buyers b ON o.buyer_id = b.id
      WHERE o.client_id = $1
    `;
    
    const params = [clientId];
    let paramCount = 1;

    // Filter by status
    if (filters.status) {
      paramCount++;
      sql += ` AND o.status = $${paramCount}`;
      params.push(filters.status);
    }

    // Filter by payment status
    if (filters.payment_status) {
      paramCount++;
      sql += ` AND o.payment_status = $${paramCount}`;
      params.push(filters.payment_status);
    }

    // Filter by delivery status
    if (filters.delivery_status) {
      paramCount++;
      sql += ` AND o.delivery_status = $${paramCount}`;
      params.push(filters.delivery_status);
    }

    // Filter by date range
    if (filters.start_date) {
      paramCount++;
      sql += ` AND o.created_at >= $${paramCount}`;
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      paramCount++;
      sql += ` AND o.created_at <= $${paramCount}`;
      params.push(filters.end_date);
    }

    // Search by order number, product, or buyer name
    if (filters.search) {
      paramCount++;
      sql += ` AND (o.order_number ILIKE $${paramCount} OR o.product_name ILIKE $${paramCount} OR b.name ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
    }

    sql += ` ORDER BY o.created_at DESC`;

    const result = await query(sql, params);
    return result.rows;
  }

  static async getPendingOrders() {
    const result = await query(
      `SELECT o.*, 
              c.name as client_name, c.email as client_email, c.phone as client_phone,
              b.name as buyer_name, b.phone as buyer_phone, b.email as buyer_email
       FROM orders o
       JOIN clients c ON o.client_id = c.id
       JOIN buyers b ON o.buyer_id = b.id
       WHERE o.status = 'pending'
       ORDER BY o.created_at DESC`
    );

    return result.rows;
  }

  // Find unprocessed orders (for bot to monitor)
  static async findUnprocessedOrders() {
    const result = await query(
      `SELECT o.*, 
              c.name as client_name,
              b.name as buyer_name, b.phone as buyer_phone
       FROM orders o
       JOIN clients c ON o.client_id = c.id
       JOIN buyers b ON o.buyer_id = b.id
       WHERE o.status = 'pending' AND o.whatsapp_sent = false
       ORDER BY o.created_at ASC`
    );

    return result.rows;
  }
}
