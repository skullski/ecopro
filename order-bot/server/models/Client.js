import { query } from '../db/index.js';
import bcrypt from 'bcrypt';

export class Client {
  static async create(clientData) {
    const { name, email, password, phone, company_name } = clientData;
    const password_hash = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO clients (name, email, password_hash, phone, company_name)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, phone, company_name, created_at`,
      [name, email, password_hash, phone, company_name]
    );

    return result.rows[0];
  }

  static async findById(id) {
    const result = await query(
      `SELECT id, name, email, phone, company_name, created_at, updated_at
       FROM clients
       WHERE id = $1`,
      [id]
    );

    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await query(
      `SELECT * FROM clients WHERE email = $1`,
      [email]
    );

    return result.rows[0];
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async update(id, updates) {
    const { name, phone, company_name } = updates;
    
    const result = await query(
      `UPDATE clients 
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           company_name = COALESCE($3, company_name),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, name, email, phone, company_name, updated_at`,
      [name, phone, company_name, id]
    );

    return result.rows[0];
  }

  static async saveResetToken(id, token, expires) {
    await query(
      `UPDATE clients 
       SET reset_token = $1, reset_token_expires = $2
       WHERE id = $3`,
      [token, expires, id]
    );
  }

  static async findByResetToken(token) {
    const result = await query(
      `SELECT * FROM clients 
       WHERE reset_token = $1 AND reset_token_expires > NOW()`,
      [token]
    );
    return result.rows[0];
  }

  static async clearResetToken(id) {
    await query(
      `UPDATE clients 
       SET reset_token = NULL, reset_token_expires = NULL
       WHERE id = $1`,
      [id]
    );
  }

  static async updatePassword(id, password) {
    const password_hash = await bcrypt.hash(password, 10);
    await query(
      `UPDATE clients 
       SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [password_hash, id]
    );
  }

  static async updateLanguage(id, language) {
    await query(
      `UPDATE clients 
       SET language = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [language, id]
    );
  }
}
