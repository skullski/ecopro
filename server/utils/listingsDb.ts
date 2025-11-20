import pool from './db';
import { v4 as uuidv4 } from 'uuid';

export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  location?: string;
  image_url?: string;
  views: number;
  comments: number;
  contact_requests: number;
  created_at: Date;
  updated_at: Date;
}

export async function createListing(listing: Omit<Listing, 'id' | 'views' | 'comments' | 'contact_requests' | 'created_at' | 'updated_at'>): Promise<Listing> {
  const id = uuidv4();
  const { user_id, title, description, price, category, location, image_url } = listing;
  const { rows } = await pool.query(
    `INSERT INTO listings (id, user_id, title, description, price, category, location, image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [id, user_id, title, description, price, category, location || null, image_url || null]
  );
  return rows[0];
}

export async function getListingById(id: string): Promise<Listing | null> {
  const { rows } = await pool.query('SELECT * FROM listings WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function getListings({ category, priceMin, priceMax, location }: { category?: string; priceMin?: number; priceMax?: number; location?: string }): Promise<Listing[]> {
  let query = 'SELECT * FROM listings WHERE 1=1';
  const params: any[] = [];
  if (category) {
    params.push(category);
    query += ` AND category = $${params.length}`;
  }
  if (priceMin !== undefined) {
    params.push(priceMin);
    query += ` AND price >= $${params.length}`;
  }
  if (priceMax !== undefined) {
    params.push(priceMax);
    query += ` AND price <= $${params.length}`;
  }
  if (location) {
    params.push(location);
    query += ` AND location = $${params.length}`;
  }
  query += ' ORDER BY created_at DESC';
  const { rows } = await pool.query(query, params);
  return rows;
}

export async function getListingsByUser(user_id: string): Promise<Listing[]> {
  const { rows } = await pool.query('SELECT * FROM listings WHERE user_id = $1 ORDER BY created_at DESC', [user_id]);
  return rows;
}

export async function updateListing(id: string, updates: Partial<Omit<Listing, 'id' | 'user_id' | 'created_at' | 'views' | 'comments' | 'contact_requests'>>): Promise<Listing | null> {
  const keys = Object.keys(updates);
  if (keys.length === 0) return null;
  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const values = Object.values(updates);
  values.push(id);
  const { rows } = await pool.query(
    `UPDATE listings SET ${setClause}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
    values
  );
  return rows[0] || null;
}

export async function deleteListing(id: string): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM listings WHERE id = $1', [id]);
  return rowCount > 0;
}