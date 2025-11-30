import { query } from '../db/index.js';

export class Buyer {
  static async create(buyerData) {
    const { client_id, name, phone, email, address } = buyerData;

    const result = await query(
      `INSERT INTO buyers (client_id, name, phone, email, address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [client_id, name, phone, email, address]
    );

    return result.rows[0];
  }

  static async findById(id) {
    const result = await query(
      `SELECT * FROM buyers WHERE id = $1`,
      [id]
    );

    return result.rows[0];
  }

  static async findByClientId(clientId) {
    const result = await query(
      `SELECT * FROM buyers WHERE client_id = $1 ORDER BY created_at DESC`,
      [clientId]
    );

    return result.rows;
  }

  static async findByPhone(phone, clientId) {
    const result = await query(
      `SELECT * FROM buyers WHERE phone = $1 AND client_id = $2`,
      [phone, clientId]
    );

    return result.rows[0];
  }

  // Find or create buyer by phone
  static async findOrCreateByPhone(clientId, phone, buyerData = {}) {
    let buyer = await this.findByPhone(phone, clientId);
    
    if (!buyer) {
      buyer = await this.create({
        client_id: clientId,
        phone,
        name: buyerData.name || 'Unknown',
        email: buyerData.email || null,
        address: buyerData.address || null,
      });
    }

    return buyer;
  }

  static async update(id, updates) {
    const { name, phone, email, address } = updates;

    const result = await query(
      `UPDATE buyers 
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           email = COALESCE($3, email),
           address = COALESCE($4, address),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [name, phone, email, address, id]
    );

    return result.rows[0];
  }

  // Search buyers
  static async search(clientId, searchTerm) {
    const result = await query(
      `SELECT * FROM buyers 
       WHERE client_id = $1 
       AND (name ILIKE $2 OR phone ILIKE $2 OR email ILIKE $2 OR address ILIKE $2)
       ORDER BY name`,
      [clientId, `%${searchTerm}%`]
    );
    return result.rows;
  }
}
