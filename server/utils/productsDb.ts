// Get items by user ID (for seller's own listings)
export async function getItemsByUserId(userId: string): Promise<MarketplaceProduct[]> {
  const { rows } = await pool.query('SELECT * FROM products WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  return rows;
}


// Get all items (marketplace feed)
export async function getItems(): Promise<MarketplaceProduct[]> {
  const { rows } = await pool.query(
    "SELECT * FROM products WHERE published = true AND (visibility_source = 'marketplace' OR visibility_source = 'both') ORDER BY created_at DESC"
  );
  return rows;
}

// Get single item by ID
export async function getItemById(id: string): Promise<MarketplaceProduct | null> {
  const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  return rows[0] || null;
}

// Create new item
export async function createItem(item: Partial<MarketplaceProduct>): Promise<MarketplaceProduct> {
  // Always force published true and visibility_source marketplace, let Postgres handle id
  const newItem: any = {
    ...item,
    published: true,
    visibility_source: 'marketplace',
    owner_key: item.ownerKey || 'anon',
  };
  if ('id' in newItem) delete newItem.id;
  const keys = Object.keys(newItem);
  const values = Object.values(newItem);
  const columns = keys.map((k) => k.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase()));
  const placeholders = values.map((_, i) => `$${i + 1}`);
  const { rows } = await pool.query(
    `INSERT INTO products (${columns.join(',')}) VALUES (${placeholders.join(',')}) RETURNING *`,
    values
  );
  return rows[0];
}

// Update item
export async function updateItem(id: string, updates: Partial<MarketplaceProduct>): Promise<MarketplaceProduct | null> {
  const keys = Object.keys(updates);
  const values = Object.values(updates);
  if (keys.length === 0) return null;
  const setClause = keys.map((k, i) => `${k === 'userId' ? 'user_id' : k.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase())} = $${i + 1}`).join(', ');
  const { rows } = await pool.query(
    `UPDATE products SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
    [...values, id]
  );
  return rows[0] || null;
}

// Delete item
export async function deleteItem(id: string): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [id]);
  return rowCount > 0;
}

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
  // Always force published true and visibility_source marketplace, let Postgres handle id
  const newProduct: any = {
    ...product,
    published: true,
    visibility_source: 'marketplace',
    owner_key: product.ownerKey || 'anon',
  };
  if ('id' in newProduct) delete newProduct.id;
  const keys = Object.keys(newProduct);
  const values = Object.values(newProduct);
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
