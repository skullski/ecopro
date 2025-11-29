import { RequestHandler } from "express";
import { pool } from "../utils/database";
import { Product } from "@shared/api";

/**
 * Get category counts
 * GET /api/products/categories/counts
 */
export const getCategoryCounts: RequestHandler = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        category,
        COUNT(*) as count
      FROM marketplace_products
      WHERE status = 'active'
      GROUP BY category
      ORDER BY count DESC`
    );

    // Add cache headers - categories change less frequently
    res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes

    res.json(result.rows);
  } catch (error) {
    console.error("Get category counts error:", error);
    res.status(500).json({ error: "Failed to fetch category counts" });
  }
};

/**
 * Get all active marketplace products (from sellers)
 * GET /api/products
 */
export const getAllProducts: RequestHandler = async (req, res) => {
  try {
    const { category, search, min_price, max_price, sort = 'created_at', order = 'DESC', limit = '20', offset = '0' } = req.query;
    
    // Only return first image from array for better performance
    let query = `
      SELECT 
        p.id, p.seller_id, p.title, p.price, p.original_price,
        p.category, p.stock, p.condition,
        p.shipping_available, p.views, p.created_at,
        CASE 
          WHEN array_length(p.images, 1) > 0 THEN ARRAY[p.images[1]]
          ELSE ARRAY[]::text[]
        END as images,
        u.name as seller_name
      FROM marketplace_products p
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE p.status = 'active'
    `;
    
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND p.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (search) {
      query += ` AND (p.title ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (min_price) {
      query += ` AND p.price >= $${paramIndex}`;
      params.push(min_price);
      paramIndex++;
    }

    if (max_price) {
      query += ` AND p.price <= $${paramIndex}`;
      params.push(max_price);
      paramIndex++;
    }

    // Validate sort and order to prevent SQL injection
    const validSorts = ['created_at', 'price', 'views', 'title'];
    const validOrders = ['ASC', 'DESC'];
    const sortField = validSorts.includes(sort as string) ? sort : 'created_at';
    const sortOrder = validOrders.includes((order as string).toUpperCase()) ? order : 'DESC';

    query += ` ORDER BY p.${sortField} ${sortOrder}`;
    
    // Add pagination
    const limitValue = Math.min(parseInt(limit as string) || 20, 100);
    const offsetValue = Math.max(parseInt(offset as string) || 0, 0);
    query += ` LIMIT ${limitValue} OFFSET ${offsetValue}`;

    // Set query timeout to 5 seconds for faster response
    const client = await pool.connect();
    try {
      await client.query('SET statement_timeout = 5000');
      const result = await client.query(query, params);
      
      // Shorter cache for more dynamic content
      res.set('Cache-Control', 'public, max-age=30');
      res.json(result.rows as Product[]);
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Get products error:", error.message);
    
    // If query times out, return empty array with warning
    if (error.message.includes('timeout')) {
      return res.status(200).json([]);
    }
    
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

/**
 * Get single marketplace product by ID
 * GET /api/products/:id
 */
export const getProductById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        p.*,
        u.name as seller_name,
        u.email as seller_email
      FROM marketplace_products p
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    // Increment view count
    await pool.query(
      "UPDATE marketplace_products SET views = views + 1 WHERE id = $1",
      [id]
    );

    res.json(result.rows[0] as Product);
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

/**
 * Get seller's marketplace products
 * GET /api/seller/products
 * Requires authentication
 */
export const getSellerProducts: RequestHandler = async (req, res) => {
  try {
    const sellerId = (req as any).user?.id;

    if (!sellerId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    // Exclude large images array for performance; return only first image or empty array
    const result = await pool.query(
      `SELECT 
        id, seller_id, title, description, price, original_price, category, 
        CASE 
          WHEN array_length(images, 1) > 0 THEN ARRAY[images[1]] 
          ELSE ARRAY[]::text[] 
        END as images,
        stock, status, condition, location, shipping_available, views, created_at, updated_at
      FROM marketplace_products 
      WHERE seller_id = $1 
      ORDER BY created_at DESC`,
      [sellerId]
    );

    res.json(result.rows as Product[]);
  } catch (error) {
    console.error("Get seller products error:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

/**
 * Create new product
 * POST /api/seller/products
 * Requires authentication
 */
export const createProduct: RequestHandler = async (req, res) => {
  try {
    const sellerId = (req as any).user?.id;

    if (!sellerId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const {
      title,
      description,
      price,
      original_price,
      category,
      images,
      stock,
      condition,
      location,
      shipping_available,
    } = req.body;

    if (!title || !price) {
      res.status(400).json({ error: "Title and price are required" });
      return;
    }

    const result = await pool.query(
      `INSERT INTO marketplace_products 
        (seller_id, title, description, price, original_price, category, images, stock, condition, location, shipping_available)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        sellerId,
        title,
        description || null,
        price,
        original_price || null,
        category || null,
        images || [],
        stock || 1,
        condition || 'new',
        location || null,
        shipping_available !== false,
      ]
    );

    res.status(201).json(result.rows[0] as Product);
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
};

/**
 * Update product
 * PUT /api/seller/products/:id
 * Requires authentication and ownership
 */
export const updateProduct: RequestHandler = async (req, res) => {
  try {
    const sellerId = (req as any).user?.id;
    const { id } = req.params;

    if (!sellerId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    // Verify ownership
    const ownerCheck = await pool.query(
      "SELECT seller_id FROM marketplace_products WHERE id = $1",
      [id]
    );

    if (ownerCheck.rows.length === 0) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    if (ownerCheck.rows[0].seller_id !== parseInt(sellerId)) {
      res.status(403).json({ error: "Not authorized to update this product" });
      return;
    }

    const {
      title,
      description,
      price,
      original_price,
      category,
      images,
      stock,
      status,
      condition,
      location,
      shipping_available,
    } = req.body;

    const result = await pool.query(
      `UPDATE marketplace_products SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        original_price = COALESCE($4, original_price),
        category = COALESCE($5, category),
        images = COALESCE($6, images),
        stock = COALESCE($7, stock),
        status = COALESCE($8, status),
        condition = COALESCE($9, condition),
        location = COALESCE($10, location),
        shipping_available = COALESCE($11, shipping_available)
      WHERE id = $12
      RETURNING *`,
      [
        title,
        description,
        price,
        original_price,
        category,
        images,
        stock,
        status,
        condition,
        location,
        shipping_available,
        id,
      ]
    );

    res.json(result.rows[0] as Product);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
};

/**
 * Delete product
 * DELETE /api/seller/products/:id
 * Requires authentication and ownership
 */
export const deleteProduct: RequestHandler = async (req, res) => {
  try {
    const sellerId = (req as any).user?.id;
    const { id } = req.params;

    if (!sellerId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    // Verify ownership
    const ownerCheck = await pool.query(
      "SELECT seller_id FROM marketplace_products WHERE id = $1",
      [id]
    );

    if (ownerCheck.rows.length === 0) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    if (ownerCheck.rows[0].seller_id !== parseInt(sellerId)) {
      res.status(403).json({ error: "Not authorized to delete this product" });
      return;
    }

    await pool.query("DELETE FROM marketplace_products WHERE id = $1", [id]);

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
};

/**
 * Get seller's orders
 * GET /api/seller/orders
 * Requires authentication
 */
export const getSellerOrders: RequestHandler = async (req, res) => {
  try {
    const sellerId = (req as any).user?.id;

    if (!sellerId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const result = await pool.query(
      `SELECT 
        o.*,
        p.title as product_title,
        p.images as product_images
      FROM marketplace_orders o
      LEFT JOIN marketplace_products p ON o.product_id = p.id
      WHERE o.seller_id = $1
      ORDER BY o.created_at DESC`,
      [sellerId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get seller orders error:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

/**
 * Create guest order (no authentication)
 * POST /api/guest/orders
 * Body: { product_id: number|string, shipping_name, shipping_line1, shipping_line2?, shipping_city, shipping_state?, shipping_postal_code, shipping_country, shipping_phone? }
 */
export const createGuestOrder: RequestHandler = async (req, res) => {
  try {
    const {
      product_id,
      shipping_name,
      shipping_line1,
      shipping_line2,
      shipping_city,
      shipping_state,
      shipping_postal_code,
      shipping_country,
      shipping_phone,
    } = req.body || {};

    if (!product_id || !shipping_name || !shipping_line1 || !shipping_city || !shipping_postal_code || !shipping_country) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find product to get seller_id
    const productRes = await pool.query(
      `SELECT id, seller_id FROM marketplace_products WHERE id = $1`,
      [product_id]
    );
    if (productRes.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    const sellerId = productRes.rows[0].seller_id;

    // Create order; guest has no buyer_id, store null and rely on shipping_* fields
    const insertRes = await pool.query(
      `INSERT INTO marketplace_orders (
        product_id, seller_id, status, total_price,
        shipping_name, shipping_line1, shipping_line2,
        shipping_city, shipping_state, shipping_postal_code,
        shipping_country, shipping_phone
      )
      VALUES (
        $1, $2, 'pending',
        (SELECT price FROM marketplace_products WHERE id = $1),
        $3, $4, $5, $6, $7, $8, $9, $10
      )
      RETURNING *`,
      [
        product_id,
        sellerId,
        shipping_name,
        shipping_line1,
        shipping_line2 ?? null,
        shipping_city,
        shipping_state ?? null,
        shipping_postal_code,
        shipping_country,
        shipping_phone ?? null,
      ]
    );

    res.status(201).json(insertRes.rows[0]);
  } catch (error) {
    console.error("Create guest order error:", error);
    res.status(500).json({ error: "Failed to create guest order" });
  }
};
