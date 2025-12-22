import { Router, RequestHandler } from "express";
import { pool } from "../utils/database";
import { logStoreSettings } from "../utils/logger";

const router = Router();

// Get all store products for client
export const getStoreProducts: RequestHandler = async (req, res) => {
  try {
    // Admins are platform users and should not manage client storefronts.
    const user = (req as any).user;
    if (user && (user.role === 'admin' || user.user_type === 'admin')) return res.status(403).json({ error: 'Admins are not allowed to manage client storefronts' });
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
    const user = (req as any).user;
    if (user && (user.role === 'admin' || user.user_type === 'admin')) return res.status(403).json({ error: 'Admins are not allowed to manage client storefronts' });
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
    const user = (req as any).user;
    if (user && (user.role === 'admin' || user.user_type === 'admin')) return res.status(403).json({ error: 'Admins are not allowed to manage client storefronts' });
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
    const user = (req as any).user;
    if (user && (user.role === 'admin' || user.user_type === 'admin')) return res.status(403).json({ error: 'Admins are not allowed to manage client storefronts' });
    const clientId = (req as any).user.id;
    const { id } = req.params;
    const updates = req.body;

    // Build dynamic update query
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== "id" && key !== "client_id" && key !== "slug" && key !== "created_at") {
        fields.push(`${key} = $${paramCount}`);
        // For arrays (like images), ensure proper formatting
        if (Array.isArray(value)) {
          values.push(value);
        } else {
          values.push(value);
        }
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id, clientId);

    console.log('[updateStoreProduct] SQL:', `UPDATE client_store_products SET ${fields.join(", ")} WHERE id = $${paramCount} AND client_id = $${paramCount + 1}`);
    console.log('[updateStoreProduct] Values:', values.map((v, i) => (Array.isArray(v) ? `[array of ${v.length} items]` : typeof v === 'string' && v.length > 100 ? v.substring(0, 100) + '...' : v)));

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
    console.error("Update store product error:", error instanceof Error ? error.message : String(error));
    console.error("Full error:", error);
    res.status(500).json({ error: "Failed to update product", details: error instanceof Error ? error.message : String(error) });
  }
};

// Delete product
export const deleteStoreProduct: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    if (user && (user.role === 'admin' || user.user_type === 'admin')) return res.status(403).json({ error: 'Admins are not allowed to manage client storefronts' });
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
    const user = (req as any).user;
    if (user && (user.role === 'admin' || user.user_type === 'admin')) return res.status(403).json({ error: 'Admins are not allowed to manage client storefronts' });
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
    const user = (req as any).user;
    if (user && (user.role === 'admin' || user.user_type === 'admin')) return res.status(403).json({ error: 'Admins do not have a client store' });
    const clientId = (req as any).user.id;
    logStoreSettings('getStoreSettings:start', { clientId });

    let result = await pool.query(
      `SELECT * FROM client_store_settings WHERE client_id = $1`,
      [clientId]
    );

    if (result.rows.length === 0) {
      // Check platform store limit before creating new store
      const storeCountResult = await pool.query(
        "SELECT COUNT(*) as count FROM client_store_settings WHERE client_id IS NOT NULL"
      );
      const currentStoreCount = parseInt(storeCountResult.rows[0].count);
      
      const maxStoresResult = await pool.query(
        "SELECT setting_value FROM platform_settings WHERE setting_key = 'max_stores'"
      );
      const maxStores = maxStoresResult.rows.length > 0 
        ? parseInt(maxStoresResult.rows[0].setting_value) 
        : 1000; // Default to 1000 if not set
      
      if (currentStoreCount >= maxStores) {
        console.log("[STORE] Store limit reached. Current:", currentStoreCount, "Max:", maxStores);
        return res.status(429).json({ 
          error: `Platform store limit reached. Maximum stores: ${maxStores}`,
          code: "STORE_LIMIT_REACHED"
        });
      }

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
    const user = (req as any).user;
    if (user && (user.role === 'admin' || user.user_type === 'admin')) return res.status(403).json({ error: 'Admins are not allowed to manage client storefronts' });
    const clientId = (req as any).user.id;
    const updates = req.body;
    // Debug: log incoming updates for easier diagnosis during development
    console.log('[updateStoreSettings] clientId=', clientId, 'payload=', JSON.stringify(updates));
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

    // Support `store_images` (array) for gallery images. Normalize to text[] or NULL.
    if (Object.prototype.hasOwnProperty.call(updates, 'store_images')) {
      const v = updates.store_images;
      if (v == null) {
        updates.store_images = null;
      } else if (Array.isArray(v)) {
        const arr = v.map((s: any) => (s == null ? '' : String(s).trim())).filter((s: string) => s.length > 0);
        updates.store_images = arr.length ? arr : null;
      } else if (typeof v === 'string') {
        const arr = v
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0);
        updates.store_images = arr.length ? arr : null;
      } else {
        // Unknown type - coerce to null
        updates.store_images = null;
      }
    }

    // Ensure DB has necessary columns (safe to run on each update)
    try {
      await pool.query(`ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS store_images TEXT[]`);
      await pool.query(`ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS template_hero_heading TEXT`);
      await pool.query(`ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS template_hero_subtitle TEXT`);
      await pool.query(`ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS template_button_text TEXT`);
      await pool.query(`ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS template_accent_color TEXT`);
      await pool.query(`ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS hero_main_url TEXT`);
      await pool.query(`ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS hero_tile1_url TEXT`);
      await pool.query(`ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS hero_tile2_url TEXT`);
      await pool.query(`ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS seller_name TEXT`);
      await pool.query(`ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS seller_email TEXT`);
    } catch (e) {
      // Non-fatal if DB doesn't allow alter; we'll attempt update and let it fail loudly
      console.error('Could not ensure store columns exist:', (e as any).message);
    }

    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Whitelist of allowed store settings columns (avoid unknown keys causing DB errors)
    const allowedCols = new Set([
      'store_name', 'store_description', 'store_logo', 'primary_color', 'secondary_color',
      'custom_domain', 'is_public', 'store_slug', 'template', 'banner_url', 'currency_code',
      'hero_main_url', 'hero_tile1_url', 'hero_tile2_url', 'owner_name', 'owner_email', 'store_images',
      // Template customization fields
      'template_hero_heading', 'template_hero_subtitle', 'template_button_text', 'template_accent_color',
      // allow older/client payloads to include seller fields without failing
      'seller_name', 'seller_email'
    ]);

    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'id' || key === 'client_id') return;
      if (!allowedCols.has(key)) {
        // Skip unknown/legacy keys (log for visibility)
        console.warn('[updateStoreSettings] skipping unknown key:', key);
        return;
      }
      // Always add the field to update, even if null
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    });

    if (fields.length === 0) {
      // No fields to update - still return success with current settings
      const result = await pool.query(
        'SELECT * FROM client_store_settings WHERE client_id = $1',
        [clientId]
      );
      return res.json(result.rows[0]);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(clientId);

    const queryText = `UPDATE client_store_settings 
       SET ${fields.join(", ")}
       WHERE client_id = $${paramCount}
       RETURNING *`;
    // Debug: log the exact SQL and parameter values sent to Postgres
    console.log('[updateStoreSettings] SQL=', queryText);
    console.log('[updateStoreSettings] SQL values=', JSON.stringify(values));
    const result = await pool.query(queryText, values);

    // Debug: log the DB result so we can confirm persisted values
    console.log('[updateStoreSettings] updatedRow=', JSON.stringify(result.rows[0]));
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
    const payload: any = { error: "Failed to update store settings" };
    // Always include details in development
    payload.details = (error as any)?.message || String(error);
    console.log('[updateStoreSettings] Error response:', JSON.stringify(payload));
    res.status(500).json(payload);
  }
};

// Store stats (aggregated)
export const getStoreStats: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    if (user && (user.role === 'admin' || user.user_type === 'admin')) return res.status(403).json({ error: 'Admins do not have a client store' });
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
    const user = (req as any).user;
    if (user && (user.role === 'admin' || user.user_type === 'admin')) return res.status(403).json({ error: 'Admins do not have a client store' });
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
