import pool from './db';

export interface MarketplaceListing {
  id: string;
  userId: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  location?: string;
  views: number;
  saves: number;
  contacts: number;
  createdAt: number;
  updatedAt: number;
}

export async function createMarketplaceListing(listing: Omit<MarketplaceListing, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'saves' | 'contacts'>): Promise<MarketplaceListing> {
  const now = Date.now();
  const { rows } = await pool.query(
    `INSERT INTO marketplace_listings (user_id, title, description, price, category, images, location, views, saves, contacts, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0, 0, $8, $9)
     RETURNING *`,
    [listing.userId, listing.title, listing.description, listing.price, listing.category, JSON.stringify(listing.images), listing.location || '', now, now]
  );
  return rows[0];
}

export async function getMarketplaceListings(): Promise<MarketplaceListing[]> {
  const { rows } = await pool.query('SELECT * FROM marketplace_listings ORDER BY created_at DESC');
  return rows.map(row => ({ ...row, images: JSON.parse(row.images) }));
}

export async function getMarketplaceListingsByUser(userId: string): Promise<MarketplaceListing[]> {
  const { rows } = await pool.query('SELECT * FROM marketplace_listings WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  return rows.map(row => ({ ...row, images: JSON.parse(row.images) }));
}

export async function updateMarketplaceListing(id: string, updates: Partial<MarketplaceListing>): Promise<MarketplaceListing | null> {
  const fields = Object.keys(updates);
  if (fields.length === 0) return null;
  const setClause = fields.map((k, i) => `${k === 'images' ? 'images' : k.replace(/[A-Z]/g, c => '_' + c.toLowerCase())} = $${i + 1}`).join(', ');
  const values = fields.map(k => k === 'images' ? JSON.stringify((updates as any)[k]) : (updates as any)[k]);
  values.push(Date.now(), id);
  const { rows } = await pool.query(
    `UPDATE marketplace_listings SET ${setClause}, updated_at = $${fields.length + 1} WHERE id = $${fields.length + 2} RETURNING *`,
    values
  );
  return rows[0] || null;
}

export async function deleteMarketplaceListing(id: string): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM marketplace_listings WHERE id = $1', [id]);
  return rowCount > 0;
}
