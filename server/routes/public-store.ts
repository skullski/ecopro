import { RequestHandler } from "express";
import { pool } from "../utils/database";

// Get all products for a storefront
export const getStorefrontProducts: RequestHandler = async (req, res) => {
  const { storeSlug } = req.params;

  // Validate storeSlug
  if (!storeSlug || storeSlug === 'null' || storeSlug === 'undefined') {
    return res.status(400).json({ error: 'Invalid store ID' });
  }

  try {
    // Get client_id from store_slug
    const storeCheck = await pool.query(
      'SELECT client_id FROM client_store_settings WHERE store_slug = $1',
      [storeSlug]
    );

    if (storeCheck.rows.length === 0) {
      console.log(`Store not found: ${storeSlug}`);
      return res.status(404).json({ error: 'Store not found' });
    }

    const clientId = storeCheck.rows[0].client_id;
    console.log(`Loading store ${storeSlug} for client ID ${clientId}`);

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

    console.log(`Found ${result.rows.length} products for store ${storeSlug}`);
    res.json(result.rows);
  } catch (error) {
    console.error('Get storefront products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Get store settings for a storefront
export const getStorefrontSettings: RequestHandler = async (req, res) => {
  const { storeSlug } = req.params;

  try {
    const result = await pool.query(
      `SELECT store_name, store_description, store_logo, 
              primary_color, secondary_color,
              template, banner_url, currency_code
       FROM client_store_settings
       WHERE store_slug = $1`,
      [storeSlug]
    );

    if (result.rows.length === 0) {
      // Return default settings if none exist
      return res.json({
        store_name: 'Store',
        primary_color: '#3b82f6',
        secondary_color: '#8b5cf6',
        template: 'classic',
        currency_code: 'DZD',
        banner_url: null
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
  const { storeSlug, productSlug } = req.params;

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
      WHERE s.store_slug = $1 AND p.slug = $2 AND p.status = 'active'`,
      [storeSlug, productSlug]
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
