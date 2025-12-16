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
    // First try client storefronts (client_store_settings)
    const clientCheck = await pool.query(
      'SELECT client_id FROM client_store_settings WHERE store_slug = $1',
      [storeSlug]
    );

    if (clientCheck.rows.length > 0) {
      const clientId = clientCheck.rows[0].client_id;
      console.log(`Loading client store ${storeSlug} for client ID ${clientId}`);
      // Include store-level fields so product cards can show owner/store info without extra round-trip
      const result = await pool.query(
        `SELECT 
          p.id, p.title, p.description, p.price, p.original_price, 
          p.images, p.category, p.stock_quantity, p.is_featured, 
          p.slug, p.views, p.created_at,
          s.store_name, s.owner_name AS seller_name, s.owner_email AS seller_email
        FROM client_store_products p
        INNER JOIN client_store_settings s ON p.client_id = s.client_id
        WHERE p.client_id = $1 AND p.status = 'active'
        ORDER BY p.is_featured DESC, p.created_at DESC`,
        [clientId]
      );
      console.log(`Found ${result.rows.length} client products for store ${storeSlug}`);
      return res.json(result.rows);
    }

    // Otherwise try seller storefronts (seller_store_settings) and return marketplace_products
    const sellerCheck = await pool.query(
      'SELECT seller_id FROM seller_store_settings WHERE store_slug = $1',
      [storeSlug]
    );
    if (sellerCheck.rows.length === 0) {
      console.log(`Store not found: ${storeSlug}`);
      return res.status(404).json({ error: 'Store not found' });
    }
    const sellerId = sellerCheck.rows[0].seller_id;
    console.log(`Loading seller store ${storeSlug} for seller ID ${sellerId}`);
    const mResult = await pool.query(
      `SELECT p.id, p.title, p.description, p.price, p.original_price, p.images, p.category, p.stock, p.condition, p.location, p.shipping_available AS shipping, p.views, p.created_at,
              ss.store_name, sel.name AS seller_name, sel.email AS seller_email
       FROM marketplace_products p
       INNER JOIN seller_store_settings ss ON p.seller_id = ss.seller_id
       LEFT JOIN sellers sel ON p.seller_id = sel.id
       WHERE p.seller_id = $1 AND p.status = 'active'
       ORDER BY p.created_at DESC`,
      [sellerId]
    );
    console.log(`Found ${mResult.rows.length} marketplace products for seller store ${storeSlug}`);
    res.json(mResult.rows);
  } catch (error) {
    console.error('Get storefront products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Get store settings for a storefront
export const getStorefrontSettings: RequestHandler = async (req, res) => {
  const { storeSlug } = req.params;

  try {
    // Try client storefront settings first
    const clientRes = await pool.query(
      `SELECT store_name, store_description, store_logo, 
              primary_color, secondary_color,
              template, banner_url, currency_code,
              hero_main_url, hero_tile1_url, hero_tile2_url, store_images,
              owner_name, owner_email
       FROM client_store_settings
       WHERE store_slug = $1`,
      [storeSlug]
    );

    let row: any = null;
    if (clientRes.rows.length > 0) {
      row = clientRes.rows[0];
    } else {
      // Fall back to seller storefront settings
      const sellerRes = await pool.query(
        `SELECT store_name, store_description, store_logo, primary_color, secondary_color, template, banner_url, currency_code, hero_main_url, hero_tile1_url, hero_tile2_url, store_images
         FROM seller_store_settings WHERE store_slug = $1`,
        [storeSlug]
      );
      if (sellerRes.rows.length === 0) {
        return res.json({
          store_name: 'Store',
          primary_color: '#3b82f6',
          secondary_color: '#8b5cf6',
          template: 'classic',
          currency_code: 'DZD',
          banner_url: null,
          hero_main_url: null,
          hero_tile1_url: null,
          hero_tile2_url: null
        });
      }
      row = sellerRes.rows[0];
    }
    // Sanitize image list fields: trim, remove empties; return null if empty
    const sanitize = (v: any) => {
      if (v == null) return null;
      if (typeof v !== 'string') return v;
      const parts = v
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);
      const deduped: string[] = [];
      parts.forEach((p: string) => {
        if (!deduped.includes(p)) deduped.push(p);
      });
      return deduped.length ? deduped.join(',') : null;
    };

    // Convert store_images (text[]) to JS array or fallback to hero tiles
    let storeImagesArr: string[] | null = null;
    if (row.store_images && Array.isArray(row.store_images) && row.store_images.length) {
      storeImagesArr = row.store_images.map((s: string) => (s == null ? '' : String(s).trim())).filter((s: string) => s.length > 0);
    } else {
      // Fallback to hero tiles if no explicit store_images
      storeImagesArr = [row.hero_main_url, row.hero_tile1_url, row.hero_tile2_url].filter((s: any) => s != null && String(s).trim().length > 0) as string[];
      if (storeImagesArr.length === 0) storeImagesArr = null;
    }

    res.json({
      ...row,
      banner_url: sanitize(row.banner_url),
      hero_main_url: sanitize(row.hero_main_url),
      hero_tile1_url: sanitize(row.hero_tile1_url),
      hero_tile2_url: sanitize(row.hero_tile2_url),
      store_images: storeImagesArr,
    });
  } catch (error) {
    console.error('Get storefront settings error:', error);
    res.status(500).json({ error: 'Failed to fetch store settings' });
  }
};

// Get single product for a storefront
export const getPublicProduct: RequestHandler = async (req, res) => {
  const { storeSlug, productSlug } = req.params;

  try {
    console.log('[getPublicProduct] Looking for:', { storeSlug, productSlug });
    
    // Try client store product first
    const productResult = await pool.query(
      `SELECT 
        p.*,
        s.store_name,
        s.primary_color,
        s.secondary_color,
        s.store_slug,
        s.owner_name AS seller_name,
        s.owner_email AS seller_email
      FROM client_store_products p
      INNER JOIN client_store_settings s ON p.client_id = s.client_id
      WHERE s.store_slug = $1 AND p.slug = $2`,
      [storeSlug, productSlug]
    );

    console.log('[getPublicProduct] Found rows:', productResult.rows.length);
    
    if (productResult.rows.length === 0) {
      // Try marketplace product for seller storefronts
      const mResult = await pool.query(
        `SELECT p.*, ss.store_name, ss.primary_color, ss.secondary_color, ss.store_slug, sel.name AS seller_name, sel.email AS seller_email
         FROM marketplace_products p
         INNER JOIN seller_store_settings ss ON p.seller_id = ss.seller_id
         LEFT JOIN sellers sel ON p.seller_id = sel.id
         WHERE ss.store_slug = $1 AND p.slug = $2`,
        [storeSlug, productSlug]
      );

      if (mResult.rows.length === 0) {
        // Debug: Check if product exists with different criteria
        const debugResult = await pool.query(
          `SELECT p.id, p.slug, p.status, p.client_id, p.seller_id
           FROM client_store_products p
           WHERE p.slug = $1`,
          [productSlug]
        );
        console.log('[getPublicProduct] Debug - Product by slug:', debugResult.rows);
        return res.status(404).json({ error: 'Product not found' });
      }

      const mprod = mResult.rows[0];
      await pool.query('UPDATE marketplace_products SET views = views + 1 WHERE id = $1', [mprod.id]);
      return res.json({ ...mprod, views: (mprod.views || 0) + 1 });
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
    console.log('[createPublicStoreOrder] Incoming:', req.body);
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
    console.log('[createPublicStoreOrder] Store lookup:', cs.rows);
    if (!cs.rows.length) {
      res.status(404).json({ error: 'Store not found' });
      return;
    }
    const clientId = cs.rows[0].client_id;
    const storeName = cs.rows[0].store_name || 'EcoPro Store';

    console.log('[createPublicStoreOrder] Insert order params:', [
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
    ]);
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
    console.log('[createPublicStoreOrder] Inserted order:', result.rows);
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
