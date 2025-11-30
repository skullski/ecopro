import { Router, RequestHandler } from "express";
import { pool } from "../utils/database";

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

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get store settings error:", error);
    res.status(500).json({ error: "Failed to fetch store settings" });
  }
};

// Update store settings
export const updateStoreSettings: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user.id;
    const updates = req.body;

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

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update store settings error:", error);
    res.status(500).json({ error: "Failed to update store settings" });
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

    const baseUrl = process.env.BASE_URL || "https://ecopro-1lbl.onrender.com";
    const shareLink = `${baseUrl}/store/${clientId}/${result.rows[0].slug}`;

    res.json({ shareLink, slug: result.rows[0].slug });
  } catch (error) {
    console.error("Get share link error:", error);
    res.status(500).json({ error: "Failed to generate share link" });
  }
};

export default router;
