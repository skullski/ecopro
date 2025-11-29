import { RequestHandler } from "express";
import { pool } from "../utils/database";

// Get all products for a storefront
export const getStorefrontProducts: RequestHandler = async (req, res) => {
  const { clientId } = req.params;

  // Validate clientId
  if (!clientId || clientId === 'null' || clientId === 'undefined') {
    return res.status(400).json({ error: 'Invalid store ID' });
  }

  try {
    // First check if the client exists (any user can have a store)
    const clientCheck = await pool.query(
      'SELECT id, user_type FROM users WHERE id = $1',
      [clientId]
    );

    if (clientCheck.rows.length === 0) {
      console.log(`Store not found: User ID ${clientId} does not exist`);
      return res.status(404).json({ error: 'Store not found' });
    }

    const user = clientCheck.rows[0];
    console.log(`Loading store for user ID ${clientId}, type: ${user.user_type}`);

    // Get products (can be empty array)
    const result = await pool.query(
      `SELECT 
        id, title, description, price, original_price, 
        images, category, stock_quantity, is_featured, 
        slug, views, created_at
      FROM client_store_products
      WHERE client_id = $1 AND status = 'active'
      ORDER BY is_featured DESC, created_at DESC`,
      [clientId]
    );

    console.log(`Found ${result.rows.length} products for store ${clientId}`);
    res.json(result.rows);
  } catch (error) {
    console.error('Get storefront products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Get store settings for a storefront
export const getStorefrontSettings: RequestHandler = async (req, res) => {
  const { clientId } = req.params;

  try {
    const result = await pool.query(
      `SELECT store_name, store_description, store_logo, 
              primary_color, secondary_color
       FROM client_store_settings
       WHERE client_id = $1`,
      [clientId]
    );

    if (result.rows.length === 0) {
      // Return default settings if none exist
      return res.json({
        store_name: 'Store',
        primary_color: '#3b82f6',
        secondary_color: '#8b5cf6',
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get storefront settings error:', error);
    res.status(500).json({ error: 'Failed to fetch store settings' });
  }
};

// Get single product for a storefront
export const getPublicProduct: RequestHandler = async (req, res) => {
  const { clientId, slug } = req.params;

  try {
    // Get product with store settings
    const productResult = await pool.query(
      `SELECT 
        p.*,
        s.store_name,
        s.primary_color,
        s.secondary_color
      FROM client_store_products p
      LEFT JOIN client_store_settings s ON p.client_id = s.client_id
      WHERE p.client_id = $1 AND p.slug = $2 AND p.status = 'active'`,
      [clientId, slug]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = productResult.rows[0];

    // Increment view count
    await pool.query(
      'UPDATE client_store_products SET views = views + 1 WHERE id = $1',
      [product.id]
    );

    res.json({
      ...product,
      views: product.views + 1, // Return updated view count
    });
  } catch (error) {
    console.error('Get public product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};
