
import pool from './db';
import type { MarketplaceProduct } from '../../shared/types';

export async function readProducts(): Promise<MarketplaceProduct[]> {
  const { rows } = await pool.query('SELECT * FROM products');
  return rows;
}

export async function findProductById(id: string): Promise<MarketplaceProduct | null> {
  const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function findProductsByOwnerKey(ownerKey: string): Promise<MarketplaceProduct[]> {
  const { rows } = await pool.query('SELECT * FROM products WHERE owner_key = $1', [ownerKey]);
  return rows;
}

export async function createProduct(product: MarketplaceProduct): Promise<MarketplaceProduct> {
  const keys = Object.keys(product);
  const values = Object.values(product);
  const columns = keys.map((k) => k.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase()));
  const placeholders = values.map((_, i) => `$${i + 1}`);
  const { rows } = await pool.query(
    `INSERT INTO products (${columns.join(',')}) VALUES (${placeholders.join(',')}) RETURNING *`,
    values
  );
  return rows[0];
}

export async function updateProduct(id: string, updates: Partial<MarketplaceProduct>): Promise<MarketplaceProduct | null> {
  const keys = Object.keys(updates);
  const values = Object.values(updates);
  if (keys.length === 0) return null;
  const setClause = keys.map((k, i) => `${k.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase())} = $${i + 1}`).join(', ');
  const { rows } = await pool.query(
    `UPDATE products SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
    [...values, id]
  );
  return rows[0] || null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [id]);
  return rowCount > 0;
}
