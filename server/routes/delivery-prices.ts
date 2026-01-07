/**
 * Delivery Pricing Routes
 * 
 * Allows sellers to set custom delivery prices per wilaya and delivery company.
 * Customers can fetch delivery prices at checkout.
 */

import { Router, RequestHandler } from 'express';
import { ensureConnection } from '../utils/database';

const router = Router();

// Type for delivery price
interface DeliveryPrice {
  id: number;
  client_id: number;
  wilaya_id: number;
  wilaya_name?: string;
  delivery_company_id: number | null;
  delivery_company_name?: string;
  home_delivery_price: number;
  desk_delivery_price: number | null;
  is_active: boolean;
  estimated_days: number;
  notes: string | null;
}

/**
 * GET /api/delivery-prices
 * Get all delivery prices for the authenticated client
 */
export const getDeliveryPrices: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user?.id;
    if (!clientId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const pool = await ensureConnection();
    
    const result = await pool.query(
      `SELECT dp.*
       FROM delivery_prices dp
       WHERE dp.client_id = $1
       ORDER BY dp.wilaya_id ASC`,
      [clientId]
    );

    res.json({ prices: result.rows });
  } catch (error) {
    console.error('[DeliveryPrices] Error fetching prices:', error);
    res.status(500).json({ error: 'Failed to fetch delivery prices' });
  }
};

/**
 * POST /api/delivery-prices
 * Create or update a delivery price for a wilaya
 */
export const upsertDeliveryPrice: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user?.id;
    if (!clientId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { 
      wilaya_id, 
      delivery_company_id, 
      home_delivery_price, 
      desk_delivery_price, 
      is_active, 
      estimated_days,
      notes 
    } = req.body;

    if (!wilaya_id || wilaya_id < 1 || wilaya_id > 58) {
      return res.status(400).json({ error: 'Invalid wilaya_id (must be 1-58)' });
    }

    if (home_delivery_price === undefined || home_delivery_price < 0) {
      return res.status(400).json({ error: 'home_delivery_price is required and must be >= 0' });
    }

    const pool = await ensureConnection();

    // Upsert: insert or update on conflict
    const result = await pool.query(
      `INSERT INTO delivery_prices (
        client_id, wilaya_id, delivery_company_id, home_delivery_price, 
        desk_delivery_price, is_active, estimated_days, notes, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (client_id, wilaya_id, delivery_company_id) 
      DO UPDATE SET 
        home_delivery_price = EXCLUDED.home_delivery_price,
        desk_delivery_price = EXCLUDED.desk_delivery_price,
        is_active = EXCLUDED.is_active,
        estimated_days = EXCLUDED.estimated_days,
        notes = EXCLUDED.notes,
        updated_at = NOW()
      RETURNING *`,
      [
        clientId,
        wilaya_id,
        delivery_company_id || null,
        home_delivery_price,
        desk_delivery_price ?? null,
        is_active ?? true,
        estimated_days ?? 3,
        notes || null
      ]
    );

    res.json({ success: true, price: result.rows[0] });
  } catch (error) {
    console.error('[DeliveryPrices] Error upserting price:', error);
    res.status(500).json({ error: 'Failed to save delivery price' });
  }
};

/**
 * POST /api/delivery-prices/bulk
 * Bulk update delivery prices for multiple wilayas
 */
export const bulkUpdateDeliveryPrices: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user?.id;
    if (!clientId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { prices, delivery_company_id } = req.body;
    
    if (!Array.isArray(prices) || prices.length === 0) {
      return res.status(400).json({ error: 'prices array is required' });
    }

    const pool = await ensureConnection();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const results = [];
      for (const p of prices) {
        if (!p.wilaya_id || p.wilaya_id < 1 || p.wilaya_id > 58) continue;
        
        const result = await client.query(
          `INSERT INTO delivery_prices (
            client_id, wilaya_id, delivery_company_id, home_delivery_price, 
            desk_delivery_price, is_active, estimated_days, notes, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
          ON CONFLICT (client_id, wilaya_id, delivery_company_id) 
          DO UPDATE SET 
            home_delivery_price = EXCLUDED.home_delivery_price,
            desk_delivery_price = EXCLUDED.desk_delivery_price,
            is_active = EXCLUDED.is_active,
            estimated_days = EXCLUDED.estimated_days,
            notes = EXCLUDED.notes,
            updated_at = NOW()
          RETURNING *`,
          [
            clientId,
            p.wilaya_id,
            delivery_company_id || null,
            p.home_delivery_price ?? 0,
            p.desk_delivery_price ?? null,
            p.is_active ?? true,
            p.estimated_days ?? 3,
            p.notes || null
          ]
        );
        results.push(result.rows[0]);
      }

      await client.query('COMMIT');
      res.json({ success: true, count: results.length, prices: results });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[DeliveryPrices] Bulk update error:', error);
    res.status(500).json({ error: 'Failed to bulk update prices' });
  }
};

/**
 * DELETE /api/delivery-prices/:id
 * Delete a specific delivery price
 */
export const deleteDeliveryPrice: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user?.id;
    if (!clientId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    const pool = await ensureConnection();
    
    const result = await pool.query(
      `DELETE FROM delivery_prices WHERE id = $1 AND client_id = $2 RETURNING id`,
      [id, clientId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Price not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('[DeliveryPrices] Delete error:', error);
    res.status(500).json({ error: 'Failed to delete price' });
  }
};

/**
 * GET /api/storefront/:storeSlug/delivery-prices
 * Public endpoint: Get delivery prices for a store (for checkout)
 */
export const getStorefrontDeliveryPrices: RequestHandler = async (req, res) => {
  try {
    const { storeSlug } = req.params;
    const { wilaya_id } = req.query;

    const pool = await ensureConnection();

    // Get client ID from store slug
    const storeResult = await pool.query(
      `SELECT client_id FROM client_store_settings WHERE store_slug = $1`,
      [storeSlug]
    );

    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const clientId = storeResult.rows[0].client_id;

    // If wilaya_id is provided, get specific price
    if (wilaya_id) {
      const priceResult = await pool.query(
        `SELECT dp.*
         FROM delivery_prices dp
         WHERE dp.client_id = $1 AND dp.wilaya_id = $2 AND dp.is_active = true
         ORDER BY dp.home_delivery_price ASC
         LIMIT 1`,
        [clientId, wilaya_id]
      );

      if (priceResult.rows.length === 0) {
        // Return default price if no specific price set
        return res.json({ 
          price: null, 
          message: 'No delivery price set for this wilaya',
          default_price: 500 // Fallback default
        });
      }

      return res.json({ price: priceResult.rows[0] });
    }

    // Get all active delivery prices for the store
    const result = await pool.query(
      `SELECT dp.wilaya_id, dp.home_delivery_price, dp.desk_delivery_price, 
              dp.estimated_days, dp.is_active
       FROM delivery_prices dp
       WHERE dp.client_id = $1 AND dp.is_active = true
       ORDER BY dp.wilaya_id ASC`,
      [clientId]
    );

    res.json({ prices: result.rows });
  } catch (error) {
    console.error('[DeliveryPrices] Storefront fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch delivery prices' });
  }
};

/**
 * POST /api/delivery-prices/import-from-company
 * Import delivery prices from a connected delivery company's API
 */
export const importFromDeliveryCompany: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user?.id;
    if (!clientId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // This feature depends on delivery company integrations, which may not be present
    // in all deployments. Keep the route but return a safe response.
    res.status(501).json({
      success: false,
      message: 'Auto-import from delivery company API is not available. Please enter prices manually.'
    });

  } catch (error) {
    console.error('[DeliveryPrices] Import error:', error);
    res.status(500).json({ error: 'Failed to import prices' });
  }
};

// Register routes
router.get('/', getDeliveryPrices);
router.post('/', upsertDeliveryPrice);
router.post('/bulk', bulkUpdateDeliveryPrices);
router.delete('/:id', deleteDeliveryPrice);
router.post('/import-from-company', importFromDeliveryCompany);

export default router;
