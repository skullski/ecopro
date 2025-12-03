import { Router, RequestHandler } from "express";
import { pool } from "../utils/database";
import { logStoreSettings } from "../utils/logger";

const router = Router();

// Get all store products for client
export const getStoreProducts: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user.id;
    const { status, category, search } = req.query;

    let query = `
      SELECT id, title, description, price, original_price, images, 
             category, stock_quantity, status, is_featured, slug, views,
             created_at, updated_at
      FROM client_store_products
      WHERE client_id = $1
    `;
    const params: any[] = [clientId];
    let paramCount = 2;

    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (category) {
      query += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (search) {
      query += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Get store products error:", error);
    res.status(500).json({ error: "Failed to fetch store products" });
  }
};

// Get single product
export const getStoreProduct: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user.id;
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM client_store_products 
       WHERE id = $1 AND client_id = $2`,
      [id, clientId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get store product error:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

// Create product
export const createStoreProduct: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user.id;
    const {
      title,
      description,
      price,
      original_price,
      images,
      category,
      stock_quantity,
      status,
      is_featured,
    } = req.body;

    if (!title || !price) {
      return res.status(400).json({ error: "Title and price are required" });
    }

    const result = await pool.query(
      `INSERT INTO client_store_products 
       (client_id, title, description, price, original_price, images, 
        category, stock_quantity, status, is_featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        clientId,
        title,
        description || null,
        price,
        original_price || null,
        images || [],
        category || null,
        stock_quantity || 0,
        status || "active",
        is_featured || false,
      ]
    );

    // Generate and update slug
    const product = result.rows[0];
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${product.id}`;
    
    await pool.query(
      `UPDATE client_store_products SET slug = $1 WHERE id = $2`,
      [slug, product.id]
    );

    product.slug = slug;
    // Audit log create
    try {
      await pool.query(
        'INSERT INTO audit_logs(actor_id, action, target_type, target_id, details) VALUES ($1,$2,$3,$4,$5)',
        [clientId, 'create_store_product', 'client_store_product', product.id, JSON.stringify({ title })]
      );
    } catch (e) {
      // Non-fatal
      console.error('Audit log (create_store_product) failed:', (e as any).message);
    }
    res.status(201).json(product);
  } catch (error) {
    console.error("Create store product error:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
};

// Update product
export const updateStoreProduct: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user.id;
    const { id } = req.params;
    const updates = req.body;

    // Build dynamic update query
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== "id" && key !== "client_id" && key !== "slug") {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id, clientId);

    const result = await pool.query(
      `UPDATE client_store_products 
       SET ${fields.join(", ")}
       WHERE id = $${paramCount} AND client_id = $${paramCount + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    // Audit log update (record the fields changed, excluding large arrays)
    const changedKeys = Object.keys(updates).filter(k => !['images'].includes(k));
    try {
      await pool.query(
        'INSERT INTO audit_logs(actor_id, action, target_type, target_id, details) VALUES ($1,$2,$3,$4,$5)',
        [clientId, 'update_store_product', 'client_store_product', id, JSON.stringify({ changed: changedKeys })]
      );
    } catch (e) {
      console.error('Audit log (update_store_product) failed:', (e as any).message);
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update store product error:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
};

// Delete product
export const deleteStoreProduct: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user.id;
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM client_store_products 
       WHERE id = $1 AND client_id = $2
       RETURNING id`,
      [id, clientId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    try {
      await pool.query(
        'INSERT INTO audit_logs(actor_id, action, target_type, target_id) VALUES ($1,$2,$3,$4)',
        [clientId, 'delete_store_product', 'client_store_product', id]
      );
    } catch (e) {
      console.error('Audit log (delete_store_product) failed:', (e as any).message);
    }
    res.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error("Delete store product error:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
};

// Get store categories
export const getStoreCategories: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user.id;

    const result = await pool.query(
      `SELECT DISTINCT category 
       FROM client_store_products 
       WHERE client_id = $1 AND category IS NOT NULL
       ORDER BY category`,
      [clientId]
    );

    res.json(result.rows.map(r => r.category));
  } catch (error) {
    console.error("Get store categories error:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

// Get store settings
export const getStoreSettings: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user.id;
    logStoreSettings('getStoreSettings:start', { clientId });

    let result = await pool.query(
      `SELECT * FROM client_store_settings WHERE client_id = $1`,
      [clientId]
    );

    if (result.rows.length === 0) {
      // Generate unique slug
      const randomSlug = 'store-' + Math.random().toString(36).substr(2, 8);
      
      // Create default settings with slug
      result = await pool.query(
        `INSERT INTO client_store_settings (client_id, store_slug) 
         VALUES ($1, $2) RETURNING *`,
        [clientId, randomSlug]
      );
    }

    // Handle legacy rows missing store_slug
    if (result.rows[0].store_slug == null) {
      const newSlug = 'store-' + Math.random().toString(36).substr(2, 8);
      const updated = await pool.query(
        `UPDATE client_store_settings SET store_slug = $1 WHERE client_id = $2 RETURNING *`,
        [newSlug, clientId]
      );
      result.rows[0] = updated.rows[0];
    }

    logStoreSettings('getStoreSettings:success', { clientId, result: result.rows[0] });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get store settings error:", error);
    logStoreSettings('getStoreSettings:error', { error: (error as any)?.message });
    res.status(500).json({ error: "Failed to fetch store settings" });
  }
};

// Update store settings
export const updateStoreSettings: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user.id;
    const updates = req.body;
    logStoreSettings('updateStoreSettings:start', { clientId, keys: Object.keys(updates), updates });

    // Normalize image list fields: trim whitespace, remove duplicate commas, convert empty to NULL
    const imageKeys = new Set(['banner_url', 'hero_main_url', 'hero_tile1_url', 'hero_tile2_url']);
    Object.keys(updates).forEach((key) => {
      const val = updates[key];
      if (imageKeys.has(key) && typeof val === 'string') {
        // Normalize: split by comma, trim each, filter empties, dedupe
        const parts = val
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0);
        const deduped: string[] = [];
        parts.forEach((p: string) => {
          if (!deduped.includes(p)) deduped.push(p);
        });
        if (deduped.length === 0) {
          updates[key] = null;
        } else {
          updates[key] = deduped.join(',');
        }
      }
      // Explicitly allow clearing by sending null
      if (imageKeys.has(key) && (val === '' || val === undefined)) {
        updates[key] = null;
      }
    });

    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== "id" && key !== "client_id") {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(clientId);

    const result = await pool.query(
      `UPDATE client_store_settings 
       SET ${fields.join(", ")}
       WHERE client_id = $${paramCount}
       RETURNING *`,
      values
    );

    logStoreSettings('updateStoreSettings:success', { clientId, updated: result.rows[0] });

    // Audit log settings update
    const changedSettings = Object.keys(updates);
    try {
      await pool.query(
        'INSERT INTO audit_logs(actor_id, action, target_type, target_id, details) VALUES ($1,$2,$3,$4,$5)',
        [clientId, 'update_store_settings', 'client_store_settings', clientId, JSON.stringify({ changed: changedSettings })]
      );
    } catch (e) {
      console.error('Audit log (update_store_settings) failed:', (e as any).message);
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update store settings error:", error);
    logStoreSettings('updateStoreSettings:error', { error: (error as any)?.message });
    res.status(500).json({ error: "Failed to update store settings" });
  }
};

// Store stats (aggregated)
export const getStoreStats: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user.id;
    const statsRes = await pool.query(
      `SELECT 
        COUNT(*) AS total_products,
        COUNT(*) FILTER (WHERE status='active') AS active_products,
        COUNT(*) FILTER (WHERE status='draft') AS draft_products,
        COALESCE(SUM(views),0) AS total_views
       FROM client_store_products
       WHERE client_id = $1`,
      [clientId]
    );
    res.json(statsRes.rows[0]);
  } catch (e) {
    console.error('Get store stats error:', e);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

// Generate shareable link for product
export const getProductShareLink: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user.id;
    const { id } = req.params;

    const result = await pool.query(
      `SELECT slug FROM client_store_products 
       WHERE id = $1 AND client_id = $2`,
      [id, clientId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Fetch store slug to build human-friendly URL
    const settingsRes = await pool.query(
      `SELECT store_slug FROM client_store_settings WHERE client_id = $1`,
      [clientId]
    );
    const storeSlug = settingsRes.rows[0]?.store_slug || clientId;
    const baseUrl = process.env.BASE_URL || "https://ecopro-1lbl.onrender.com";
    const shareLink = `${baseUrl}/store/${storeSlug}/${result.rows[0].slug}`;

    res.json({ shareLink, slug: result.rows[0].slug, store_slug: storeSlug });
  } catch (error) {
    console.error("Get share link error:", error);
    res.status(500).json({ error: "Failed to generate share link" });
  }
};

export default router;
