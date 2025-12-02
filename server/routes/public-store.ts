import { RequestHandler } from "express";
import { pool } from "../utils/database";
import { sendWhatsAppMessage } from "../utils/messaging";

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

// Create order via public storefront using storeSlug
export const createPublicStoreOrder: RequestHandler = async (req, res) => {
  const { storeSlug } = req.params as any;
  try {
    const {
      product_id,
      quantity,
      total_price,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
    } = req.body;

    if (!product_id || !quantity || !total_price || !customer_name) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const cs = await pool.query('SELECT client_id, store_name FROM client_store_settings WHERE store_slug = $1', [storeSlug]);
    if (!cs.rows.length) {
      res.status(404).json({ error: 'Store not found' });
      return;
    }
    const clientId = cs.rows[0].client_id;
    const storeName = cs.rows[0].store_name || 'EcoPro Store';

    const result = await pool.query(
      `INSERT INTO store_orders (
        product_id, client_id, quantity, total_price,
        customer_name, customer_email, customer_phone, shipping_address,
        status, payment_status, created_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW()) RETURNING *`,
      [
        product_id,
        clientId,
        quantity,
        total_price,
        customer_name,
        customer_email || null,
        customer_phone || null,
        customer_address || null,
        'pending',
        'unpaid'
      ]
    );

    // Audit log
    try {
      await pool.query(
        `INSERT INTO audit_logs(actor_type, actor_id, action, target_type, target_id, details, created_at)
         VALUES($1,$2,$3,$4,$5,$6,NOW())`,
        ['system', clientId, 'create_order', 'order', result.rows[0]?.id || null, JSON.stringify({ product_id, customer_name })]
      );
    } catch {}

    // WhatsApp confirmation
    if (customer_phone) {
      const productTitle = (await pool.query('SELECT title FROM client_store_products WHERE id = $1', [product_id])).rows?.[0]?.title || 'Product';
      const msg = `Hi ${customer_name}, your order for ${productTitle} at ${storeName} is received. Total: ${total_price}. We will contact you soon.`;
      sendWhatsAppMessage(customer_phone, msg).catch(() => {});
    }

    res.status(201).json({ success: true, order: result.rows[0] });
  } catch (error) {
    console.error('Create public store order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};
