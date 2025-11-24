import pool from './db';
import type { Product } from '../../shared/types';

function toSnakeCase(key: string) {
  return key.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
}

function mapKeysToSnake(obj: Record<string, any>) {
  const mapped: Record<string, any> = {};
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (v === undefined) continue; // don't include undefined values
    if (k === 'userId' || k === 'vendorId') mapped['vendor_id'] = v;
    else if (k === 'ownerKey') mapped['owner_key'] = v;
    else if (k === 'ownerEmail') mapped['owner_email'] = v;
    else if (k === 'createdAt') mapped['created_at'] = v;
    else if (k === 'updatedAt') mapped['updated_at'] = v;
    else mapped[toSnakeCase(k)] = v;
  }
  return mapped;
}

function mapRowToCamel(row: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const k of Object.keys(row)) {
    const v = row[k];
    if (k === 'vendor_id') out.vendorId = v;
    else if (k === 'owner_key') out.ownerKey = v;
    else if (k === 'owner_email') out.ownerEmail = v;
    else if (k === 'created_at') out.createdAt = v;
    else if (k === 'updated_at') out.updatedAt = v;
    else if (k === 'visibility_source') out.visibilitySource = v;
    else out[k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = v;
  }
  return out;
}

// Read all products (admin / internal)
export async function readProducts(): Promise<Product[]> {
  const cols = [
    'id',
    'vendor_id',
    'title',
    'description',
    'price',
    'images',
    'category',
    'condition',
    'quantity',
    'status',
    'published',
    'visibility_source',
    'owner_key',
    'owner_email',
    'views',
    'favorites',
    'created_at',
    'updated_at'
  ].join(',');
  const { rows } = await pool.query(`SELECT ${cols} FROM products ORDER BY created_at DESC`);
  return rows.map(mapRowToCamel) as unknown as Product[];
}

// Get public store items
export async function getItems(): Promise<Product[]> {
  const cols = [
    'id',
    'vendor_id',
    'title',
    'price',
    'images',
    'category',
    'published',
    'visibility_source',
    'owner_key',
    'created_at'
  ].join(',');
  // Return published products (public/store-visible)
  const { rows } = await pool.query(`SELECT ${cols} FROM products WHERE published = true ORDER BY created_at DESC`);
  return rows.map(mapRowToCamel) as unknown as Product[];
}

// Get items by seller user id
export async function getItemsByUserId(userId: string): Promise<Product[]> {
  const cols = ['id','title','price','images','category','published','created_at'].join(',');
  const { rows } = await pool.query(`SELECT ${cols} FROM products WHERE vendor_id = $1 ORDER BY created_at DESC`, [userId]);
  return rows.map(mapRowToCamel) as unknown as Product[];
}

// Find single product by id
export async function findProductById(id: string): Promise<Product | null> {
  const cols = [
    'id',
    'vendor_id',
    'title',
    'description',
    'price',
    'images',
    'category',
    'condition',
    'quantity',
    'status',
    'published',
    'visibility_source',
      'owner_key',
      'owner_email',
      'views',
      'favorites',
      'tags',
      'specifications',
      'shipping_options',
    'created_at',
    'updated_at'
  ].join(',');
  const { rows } = await pool.query(`SELECT ${cols} FROM products WHERE id = $1`, [id]);
  return rows[0] ? (mapRowToCamel(rows[0]) as unknown as Product) : null;
}

// Alias for findProductById
export const getItemById = findProductById;

export async function findProductsByOwnerKey(ownerKey: string): Promise<Product[]> {
  const cols = ['id','title','price','images','category','published','owner_key','created_at'].join(',');
  const { rows } = await pool.query(`SELECT ${cols} FROM products WHERE owner_key = $1 ORDER BY created_at DESC`, [ownerKey]);
  return rows.map(mapRowToCamel) as unknown as Product[];
}

// Create a new product. Accepts partial product; enforces published flag for store visibility.
export async function createProduct(product: any): Promise<Product> {
  const base = {
    ...product,
    published: product.published === undefined ? true : product.published,
    // visibilitySource removed - default to store-owned
    ownerKey: (product as any).ownerKey || 'anon',
  } as Record<string, any>;

  if ('id' in base) delete base.id;
  const mapped = mapKeysToSnake(base);
  const keys = Object.keys(mapped);
  const values = Object.values(mapped);
  if (keys.length === 0) throw new Error('No product data provided');
  const columns = keys.join(',');
  const placeholders = values.map((_, i) => `$${i + 1}`).join(',');

  const { rows } = await pool.query(
    `INSERT INTO products (${columns}) VALUES (${placeholders}) RETURNING *`,
    values
  );
  return mapRowToCamel(rows[0]) as unknown as Product;
}

export async function updateProduct(id: string, updates: any): Promise<Product | null> {
  const mapped = mapKeysToSnake(updates as Record<string, any>);
  const keys = Object.keys(mapped);
  const values = Object.values(mapped);
  if (keys.length === 0) return null;
  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const { rows } = await pool.query(
    `UPDATE products SET ${setClause}, updated_at = now() WHERE id = $${keys.length + 1} RETURNING *`,
    [...values, id]
  );
  return rows[0] ? (mapRowToCamel(rows[0]) as unknown as Product) : null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [id]);
  return rowCount > 0;
}
