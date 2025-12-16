import { RequestHandler } from 'express';
import { pool } from '../utils/database';

// Get seller storefront settings (authenticated seller)
export const getSellerStoreSettings: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const sellerId = user?.id;
    if (!sellerId) return res.status(401).json({ error: 'Unauthorized' });

    let result = await pool.query('SELECT * FROM seller_store_settings WHERE seller_id = $1', [sellerId]);
    if (result.rows.length === 0) {
      // create a default row
      const slug = 'seller-' + (sellerId || Math.random().toString(36).substr(2,8));
      const created = await pool.query(
        `INSERT INTO seller_store_settings (seller_id, store_slug, store_name, created_at)
         VALUES ($1, $2, $3, NOW()) RETURNING *`,
        [sellerId, slug, (user?.name || user?.email || 'Seller')]
      );
      result = created;
    }
    res.json(result.rows[0]);
  } catch (e) {
    console.error('Get seller store settings error:', (e as any).message);
    res.status(500).json({ error: 'Failed to fetch seller store settings' });
  }
};

// Update seller storefront settings
export const updateSellerStoreSettings: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const sellerId = user?.id;
    if (!sellerId) return res.status(401).json({ error: 'Unauthorized' });

    const updates = req.body || {};
    // Allowed columns
    const allowed = new Set(['store_name','store_description','store_logo','primary_color','secondary_color','template','banner_url','currency_code','hero_main_url','hero_tile1_url','hero_tile2_url','store_images','store_slug']);

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;
    Object.entries(updates).forEach(([k, v]) => {
      if (!allowed.has(k)) return;
      fields.push(`${k} = $${idx}`);
      values.push(v);
      idx++;
    });

    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

    values.push(sellerId);
    const q = `UPDATE seller_store_settings SET ${fields.join(', ')}, updated_at = NOW() WHERE seller_id = $${idx} RETURNING *`;
    const result = await pool.query(q, values);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Seller store not found' });
    res.json(result.rows[0]);
  } catch (e) {
    console.error('Update seller store settings error:', (e as any).message);
    res.status(500).json({ error: 'Failed to update seller store settings' });
  }
};
