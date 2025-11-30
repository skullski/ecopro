import { query } from '../db/index.js';

export class Product {
  static async create(productData) {
    const {
      client_id,
      name,
      description,
      price,
      stock,
      category,
      image_url,
      is_active = true,
    } = productData;

    const result = await query(
      `INSERT INTO products 
       (client_id, name, description, price, stock, category, image_url, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [client_id, name, description, price, stock, category, image_url, is_active]
    );

    return result.rows[0];
  }

  static async findById(id) {
    const result = await query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findByClientId(clientId, includeInactive = false) {
    const sql = includeInactive
      ? 'SELECT * FROM products WHERE client_id = $1 ORDER BY created_at DESC'
      : 'SELECT * FROM products WHERE client_id = $1 AND is_active = true ORDER BY created_at DESC';

    const result = await query(sql, [clientId]);
    return result.rows;
  }

  static async findByCategory(clientId, category) {
    const result = await query(
      'SELECT * FROM products WHERE client_id = $1 AND category = $2 AND is_active = true ORDER BY name',
      [clientId, category]
    );
    return result.rows;
  }

  static async update(id, updates) {
    const {
      name,
      description,
      price,
      stock,
      category,
      image_url,
      is_active,
    } = updates;

    const result = await query(
      `UPDATE products 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           stock = COALESCE($4, stock),
           category = COALESCE($5, category),
           image_url = COALESCE($6, image_url),
           is_active = COALESCE($7, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [name, description, price, stock, category, image_url, is_active, id]
    );

    return result.rows[0];
  }

  static async delete(id) {
    await query('DELETE FROM products WHERE id = $1', [id]);
  }

  static async updateStock(id, quantity) {
    const result = await query(
      'UPDATE products SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [quantity, id]
    );
    return result.rows[0];
  }

  static async search(clientId, searchTerm) {
    const result = await query(
      `SELECT * FROM products 
       WHERE client_id = $1 
       AND is_active = true 
       AND (name ILIKE $2 OR description ILIKE $2 OR category ILIKE $2)
       ORDER BY name`,
      [clientId, `%${searchTerm}%`]
    );
    return result.rows;
  }
}
