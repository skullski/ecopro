import { RequestHandler } from "express";
import { pool } from "../utils/database";

// Ensure images column exists on module load
(async () => {
  try {
    await pool.query(
      `ALTER TABLE IF EXISTS client_stock_products 
       ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT ARRAY[]::TEXT[]`
    );
  } catch (error) {
    console.warn('[stock.ts] Warning: Could not ensure images column exists:', error);
  }
})();

/**
 * Get all stock products for authenticated client
 * GET /api/client/stock
 */
export const getClientStock: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user?.id;
    
    if (!clientId) {
      console.error('[getClientStock] No clientId in request');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { category, status, search, low_stock } = req.query;

    let query = `
      SELECT 
        id, client_id, name, sku, description, category,
        quantity, unit_price, reorder_level, location,
        supplier_name, supplier_contact, status, notes, images,
        created_at, updated_at,
        CASE WHEN quantity <= reorder_level THEN true ELSE false END as is_low_stock
      FROM client_stock_products
      WHERE client_id = $1
    `;

    const params: any[] = [clientId];
    let paramIndex = 2;

    if (category) {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR sku ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (low_stock === 'true') {
      query += ` AND quantity <= reorder_level`;
    }

    query += ` ORDER BY name ASC`;

    console.log('[getClientStock] Fetching stock for clientId:', clientId);
    const result = await pool.query(query, params);
    console.log('[getClientStock] Found', result.rows.length, 'items');
    res.json(result.rows);
  } catch (error) {
    console.error('[getClientStock] error:', error);
    res.status(500).json({ error: 'Failed to fetch stock' });
  }
};

/**
 * Get single stock item by ID
 * GET /api/client/stock/:id
 */
export const getStockById: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user?.id;
    
    if (!clientId) {
      console.error('[getStockById] No clientId in request');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM client_stock_products WHERE id = $1 AND client_id = $2`,
      [id, clientId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Stock item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('[getStockById] error:', error);
    res.status(500).json({ error: 'Failed to fetch stock item' });
  }
};

/**
 * Create new stock item
 * POST /api/client/stock
 */
export const createStock: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user?.id;
    
    if (!clientId) {
      console.error('[createStock] No clientId in request');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const {
      name,
      sku,
      description,
      category,
      quantity,
      unit_price,
      reorder_level,
      location,
      supplier_name,
      supplier_contact,
      status,
      notes,
      images,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    console.log('[createStock] Creating stock item:', { name, sku, clientId, hasImages: !!images });

    let result;
    let triedWithImages = false;
    
    try {
      // Try with images column
      triedWithImages = true;
      console.log('[createStock] Attempting insert with images column');
      result = await pool.query(
        `INSERT INTO client_stock_products (
          client_id, name, sku, description, category,
          quantity, unit_price, reorder_level, location,
          supplier_name, supplier_contact, status, notes, images
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *`,
        [
          clientId,
          name,
          sku || null,
          description || null,
          category || null,
          quantity || 0,
          unit_price || null,
          reorder_level || 10,
          location || null,
          supplier_name || null,
          supplier_contact || null,
          status || 'active',
          notes || null,
          Array.isArray(images) ? images : [],
        ]
      );
      console.log('[createStock] Insert with images succeeded');
    } catch (e: any) {
      const error = e as any;
      console.warn('[createStock] Insert with images failed:', error.message);
      
      // Only retry without images if the column doesn't exist
      if (error.message && error.message.includes('column "images" of relation "client_stock_products" does not exist')) {
        console.log('[createStock] Images column missing, retrying without images');
        result = await pool.query(
          `INSERT INTO client_stock_products (
            client_id, name, sku, description, category,
            quantity, unit_price, reorder_level, location,
            supplier_name, supplier_contact, status, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING *`,
          [
            clientId,
            name,
            sku || null,
            description || null,
            category || null,
            quantity || 0,
            unit_price || null,
            reorder_level || 10,
            location || null,
            supplier_name || null,
            supplier_contact || null,
            status || 'active',
            notes || null,
          ]
        );
        console.log('[createStock] Insert without images succeeded');
      } else {
        // Re-throw if it's not the "missing column" error
        throw error;
      }
    }

    // Log initial stock creation in history
    if (quantity && quantity > 0) {
      try {
        await pool.query(
          `INSERT INTO client_stock_history (
            stock_id, client_id, quantity_before, quantity_after, adjustment, reason, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [result.rows[0].id, clientId, 0, quantity, quantity, 'initial_stock', clientId]
        );
      } catch (historyError) {
        console.warn('[createStock] Failed to log stock history:', historyError);
        // Don't fail the entire request if history logging fails
      }
    }

    console.log('[createStock] Stock item created successfully, ID:', result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('[createStock] Unexpected error:', error);
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'SKU already exists' });
    }
    if (error.code === '23502') { // NOT NULL constraint violation
      return res.status(400).json({ error: 'Required field is missing' });
    }
    if (error.code === '23503') { // Foreign key constraint violation
      return res.status(400).json({ error: 'Invalid reference in data' });
    }
    res.status(500).json({ error: error.message || 'Failed to create stock item' });
  }
};

/**
 * Update stock item
 * PUT /api/client/stock/:id
 */
export const updateStock: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user?.id;
    
    if (!clientId) {
      console.error('[updateStock] No clientId in request');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;

    // Verify ownership
    const ownerCheck = await pool.query(
      'SELECT * FROM client_stock_products WHERE id = $1 AND client_id = $2',
      [id, clientId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Stock item not found' });
    }

    const {
      name,
      sku,
      description,
      category,
      unit_price,
      reorder_level,
      location,
      supplier_name,
      supplier_contact,
      status,
      notes,
      images,
    } = req.body;

    let result;
    try {
      // Try with images column
      result = await pool.query(
        `UPDATE client_stock_products SET
          name = COALESCE($1, name),
          sku = COALESCE($2, sku),
          description = COALESCE($3, description),
          category = COALESCE($4, category),
          unit_price = COALESCE($5, unit_price),
          reorder_level = COALESCE($6, reorder_level),
          location = COALESCE($7, location),
          supplier_name = COALESCE($8, supplier_name),
          supplier_contact = COALESCE($9, supplier_contact),
          status = COALESCE($10, status),
          notes = COALESCE($11, notes),
          images = CASE 
            WHEN $14::text[] IS NOT NULL AND array_length($14::text[], 1) > 0 THEN $14::text[]
            ELSE images 
          END,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $12 AND client_id = $13
        RETURNING *`,
        [
          name, sku, description, category, unit_price,
          reorder_level, location, supplier_name, supplier_contact,
          status, notes, id, clientId, Array.isArray(images) ? images : null
        ]
      );
    } catch (e: any) {
      const error = e as any;
      console.warn('[updateStock] Insert with images failed:', error.message);
      
      // If images column doesn't exist, retry without it
      if (error.message && error.message.includes('column "images" of relation "client_stock_products" does not exist')) {
        console.log('[updateStock] Images column missing, retrying without images');
        result = await pool.query(
          `UPDATE client_stock_products SET
            name = COALESCE($1, name),
            sku = COALESCE($2, sku),
            description = COALESCE($3, description),
            category = COALESCE($4, category),
            unit_price = COALESCE($5, unit_price),
            reorder_level = COALESCE($6, reorder_level),
            location = COALESCE($7, location),
            supplier_name = COALESCE($8, supplier_name),
            supplier_contact = COALESCE($9, supplier_contact),
            status = COALESCE($10, status),
            notes = COALESCE($11, notes),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $12 AND client_id = $13
          RETURNING *`,
          [
            name, sku, description, category, unit_price,
            reorder_level, location, supplier_name, supplier_contact,
            status, notes, id, clientId
          ]
        );
        console.log('[updateStock] Update without images succeeded');
      } else {
        throw error;
      }
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('[updateStock] error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'SKU already exists' });
    }
    res.status(500).json({ error: 'Failed to update stock item' });
  }
};

/**
 * Adjust stock quantity with history tracking
 * POST /api/client/stock/:id/adjust
 */
export const adjustStockQuantity: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user?.id;
    const { id } = req.params;
    const { adjustment, reason, notes } = req.body;

    if (!adjustment || !reason) {
      return res.status(400).json({ error: 'Adjustment and reason are required' });
    }

    const adjustmentNum = parseInt(adjustment, 10);
    if (isNaN(adjustmentNum)) {
      return res.status(400).json({ error: 'Invalid adjustment value' });
    }

    // Get current stock
    const stockResult = await pool.query(
      'SELECT * FROM client_stock_products WHERE id = $1 AND client_id = $2',
      [id, clientId]
    );

    if (stockResult.rows.length === 0) {
      return res.status(404).json({ error: 'Stock item not found' });
    }

    const currentStock = stockResult.rows[0];
    const newQuantity = currentStock.quantity + adjustmentNum;

    if (newQuantity < 0) {
      return res.status(400).json({ error: 'Insufficient stock for this adjustment' });
    }

    // Update quantity
    const updateResult = await pool.query(
      `UPDATE client_stock_products 
       SET quantity = $1, 
           status = CASE WHEN $1 = 0 THEN 'out_of_stock' ELSE status END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND client_id = $3
       RETURNING *`,
      [newQuantity, id, clientId]
    );

    // Log adjustment in history
    await pool.query(
      `INSERT INTO client_stock_history (
        stock_id, client_id, quantity_before, quantity_after, 
        adjustment, reason, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id, clientId, currentStock.quantity, newQuantity,
        adjustmentNum, reason, notes || null, clientId
      ]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('[adjustStockQuantity] error:', error);
    res.status(500).json({ error: 'Failed to adjust stock quantity' });
  }
};

/**
 * Get stock adjustment history
 * GET /api/client/stock/:id/history
 */
export const getStockHistory: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user?.id;
    const { id } = req.params;

    // Verify ownership
    const ownerCheck = await pool.query(
      'SELECT id FROM client_stock_products WHERE id = $1 AND client_id = $2',
      [id, clientId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Stock item not found' });
    }

    const result = await pool.query(
      `SELECT 
        h.*,
        u.name as adjusted_by_name
      FROM client_stock_history h
      LEFT JOIN users u ON h.created_by = u.id
      WHERE h.stock_id = $1 AND h.client_id = $2
      ORDER BY h.created_at DESC`,
      [id, clientId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('[getStockHistory] error:', error);
    res.status(500).json({ error: 'Failed to fetch stock history' });
  }
};

/**
 * Delete stock item
 * DELETE /api/client/stock/:id
 */
export const deleteStock: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user?.id;
    
    if (!clientId) {
      console.error('[deleteStock] No clientId in request');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM client_stock_products WHERE id = $1 AND client_id = $2 RETURNING id',
      [id, clientId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Stock item not found' });
    }

    res.json({ message: 'Stock item deleted successfully' });
  } catch (error) {
    console.error('[deleteStock] error:', error);
    res.status(500).json({ error: 'Failed to delete stock item' });
  }
};

/**
 * Get low stock alerts
 * GET /api/client/stock/alerts/low-stock
 */
export const getLowStockAlerts: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user?.id;

    const result = await pool.query(
      `SELECT 
        id, name, sku, quantity, reorder_level, category, location,
        (reorder_level - quantity) as shortage
      FROM client_stock_products
      WHERE client_id = $1 
        AND status = 'active'
        AND quantity <= reorder_level
      ORDER BY shortage DESC, name ASC`,
      [clientId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('[getLowStockAlerts] error:', error);
    res.status(500).json({ error: 'Failed to fetch low stock alerts' });
  }
};

/**
 * Get stock categories for filtering
 * GET /api/client/stock/categories
 */
export const getStockCategories: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user?.id;

    const result = await pool.query(
      `SELECT DISTINCT category, COUNT(*) as count
       FROM client_stock_products
       WHERE client_id = $1 AND category IS NOT NULL
       GROUP BY category
       ORDER BY category ASC`,
      [clientId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('[getStockCategories] error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};
