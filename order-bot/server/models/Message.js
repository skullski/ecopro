import { query } from '../db/index.js';

export class Message {
  static async create(messageData) {
    const {
      order_id,
      client_id,
      buyer_id,
      message_type,
      recipient_phone,
      message_content
    } = messageData;

    const result = await query(
      `INSERT INTO messages 
       (order_id, client_id, buyer_id, message_type, recipient_phone, message_content, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [order_id, client_id, buyer_id, message_type, recipient_phone, message_content]
    );

    return result.rows[0];
  }

  static async updateStatus(id, status, errorMessage = null) {
    const result = await query(
      `UPDATE messages 
       SET status = $1, 
           sent_at = CASE WHEN $1 IN ('sent', 'delivered') THEN CURRENT_TIMESTAMP ELSE sent_at END,
           delivered_at = CASE WHEN $1 = 'delivered' THEN CURRENT_TIMESTAMP ELSE delivered_at END,
           error_message = $2
       WHERE id = $3
       RETURNING *`,
      [status, errorMessage, id]
    );

    return result.rows[0];
  }

  static async findByOrderId(orderId) {
    const result = await query(
      `SELECT * FROM messages WHERE order_id = $1 ORDER BY created_at DESC`,
      [orderId]
    );

    return result.rows;
  }

  static async findByClientId(clientId) {
    const result = await query(
      `SELECT m.*, o.order_number, b.name as buyer_name
       FROM messages m
       JOIN orders o ON m.order_id = o.id
       JOIN buyers b ON m.buyer_id = b.id
       WHERE m.client_id = $1
       ORDER BY m.created_at DESC
       LIMIT 100`,
      [clientId]
    );

    return result.rows;
  }
}
