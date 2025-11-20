import pool from './db';

export interface StoreProduct {
  id: string;
  storeId: string;
  userId: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  condition: string;
  quantity: number;
  featured: boolean;
  status: string;
  createdAt: number;
  updatedAt: number;
}

export async function createStoreProduct(product: Omit<StoreProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<StoreProduct> {
  const now = Date.now();
  const { rows } = await pool.query(
    `INSERT INTO store_products (store_id, user_id, title, description, price, category, images, condition, quantity, featured, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING *`,
    [product.storeId, product.userId, product.title, product.description, product.price, product.category, JSON.stringify(product.images), product.condition, product.quantity, product.featured, product.status, now, now]
  );
  return rows[0];
}

export async function getStoreProductsByUser(userId: string): Promise<StoreProduct[]> {
  const { rows } = await pool.query('SELECT * FROM store_products WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  return rows.map(row => ({ ...row, images: JSON.parse(row.images) }));
}

export async function getStoreProductsByStore(storeId: string): Promise<StoreProduct[]> {
  const { rows } = await pool.query('SELECT * FROM store_products WHERE store_id = $1 ORDER BY created_at DESC', [storeId]);
  return rows.map(row => ({ ...row, images: JSON.parse(row.images) }));
}

export async function updateStoreProduct(id: string, updates: Partial<StoreProduct>): Promise<StoreProduct | null> {
  const fields = Object.keys(updates);
  if (fields.length === 0) return null;
  const setClause = fields.map((k, i) => `${k === 'images' ? 'images' : k.replace(/[A-Z]/g, c => '_' + c.toLowerCase())} = $${i + 1}`).join(', ');
  const values = fields.map(k => k === 'images' ? JSON.stringify((updates as any)[k]) : (updates as any)[k]);
  values.push(id);
  const { rows } = await pool.query(
    `UPDATE store_products SET ${setClause}, updated_at = $${fields.length + 1} WHERE id = $${fields.length + 2} RETURNING *`,
    [...values, Date.now(), id]
  );
  return rows[0] || null;
}

export async function deleteStoreProduct(id: string): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM store_products WHERE id = $1', [id]);
  return rowCount > 0;
}
