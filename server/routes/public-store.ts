import { RequestHandler } from "express";
import { ensureConnection } from "../utils/database";
import { sendBotMessagesForOrder } from "./order-confirmation";
import { createOrderTelegramLink } from "../utils/telegram";
import { sendTelegramMessage, replaceTemplateVariables } from "../utils/bot-messaging";

// Get all products for a storefront
export const getStorefrontProducts: RequestHandler = async (req, res) => {
  const { storeSlug } = req.params;

  // Validate storeSlug
  if (!storeSlug || storeSlug === 'null' || storeSlug === 'undefined') {
    return res.status(400).json({ error: 'Invalid store ID' });
  }

  try {
    const pool = await ensureConnection();
    // First try client storefronts (client_store_settings)
    // Match by exact store_slug OR by store_name (case-insensitive, spaces/special chars removed)
    const clientCheck = await pool.query(
      `SELECT client_id FROM client_store_settings 
       WHERE store_slug = $1 
          OR LOWER(REGEXP_REPLACE(store_name, '[^a-zA-Z0-9]', '', 'g')) = LOWER($1)`,
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
      `SELECT seller_id FROM seller_store_settings 
       WHERE store_slug = $1 
          OR LOWER(REGEXP_REPLACE(store_name, '[^a-zA-Z0-9]', '', 'g')) = LOWER($1)`,
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
  let { storeSlug } = req.params;

  try {
    // Helper function to convert store name to clean format (same as client-side)
    // Preserves case, removes spaces only
    const storeNameToClean = (name: string): string => {
      return name
        .trim()
        .replace(/\s+/g, '')           // Remove spaces
        .replace(/[^a-zA-Z0-9]/g, '')  // Remove non-alphanumeric
        || 'store';
    };

    // First, try to find by exact store_slug match
    let querySlug = storeSlug;
    
    const pool = await ensureConnection();
    // Try client storefront settings first
    let clientRes;
    try {
      clientRes = await pool.query(
        `SELECT store_name, store_description, store_logo, 
                primary_color, secondary_color,
                template, banner_url, currency_code,
                hero_main_url, hero_tile1_url, hero_tile2_url, 
                store_images,
                owner_name, owner_email,
                template_hero_heading, template_hero_subtitle, template_button_text, template_accent_color,
                 template_settings, template_settings_by_template, global_settings,
                store_slug
         FROM client_store_settings
         WHERE store_slug = $1 OR REPLACE(store_name, ' ', '') = $1`,
        [querySlug]
      );
    } catch (err: any) {
      // If query fails (columns don't exist yet), try without new columns
      if (err.code === '42703') {
          clientRes = await pool.query(
            "SELECT store_name, store_description, store_logo, primary_color, secondary_color, template, banner_url, currency_code, NULL as hero_main_url, NULL as hero_tile1_url, NULL as hero_tile2_url, store_images, owner_name, owner_email, NULL as template_hero_heading, NULL as template_hero_subtitle, NULL as template_button_text, NULL as template_accent_color, NULL as template_settings, NULL as template_settings_by_template, NULL as global_settings, store_slug FROM client_store_settings WHERE store_slug = $1",
            [querySlug]
          );
      } else {
        throw err;
      }
    }

    let row: any = null;
    if (clientRes.rows.length > 0) {
      row = clientRes.rows[0];
    } else {
      // Fall back to seller storefront settings
      let sellerRes;
      try {
        sellerRes = await pool.query(
          `SELECT store_name, store_description, store_logo, primary_color, secondary_color, template, banner_url, currency_code, 
                  hero_main_url, hero_tile1_url, hero_tile2_url, store_images
           FROM seller_store_settings WHERE store_slug = $1`,
          [querySlug]
        );
      } catch (err: any) {
        // If query fails (columns don't exist), try without them
        if (err.code === '42703') {
          sellerRes = await pool.query(
            'SELECT store_name, store_description, store_logo, primary_color, secondary_color, template, banner_url, currency_code, NULL as hero_main_url, NULL as hero_tile1_url, NULL as hero_tile2_url, store_images FROM seller_store_settings WHERE store_slug = $1',
            [storeSlug]
          );
        } else {
          throw err;
        }
      }
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
          hero_tile2_url: null,
          store_slug: storeSlug
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

    const templateSettings = row?.template_settings && typeof row.template_settings === 'object' ? row.template_settings : {};
    const globalSettings = row?.global_settings && typeof row.global_settings === 'object' ? row.global_settings : {};

    res.json({
      ...globalSettings,
      ...templateSettings,
      ...row,
      store_slug: storeSlug,
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
    const pool = await ensureConnection();
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

// Get single product by ID for a storefront
export const getStorefrontProductById: RequestHandler = async (req, res) => {
  const { storeSlug, productId } = req.params;

  try {
    const pool = await ensureConnection();
    console.log('[getStorefrontProductById] Looking for:', { storeSlug, productId });
    
    // Try client store product first by ID
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
      WHERE s.store_slug = $1 AND p.id = $2`,
      [storeSlug, productId]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = productResult.rows[0];
    res.json(product);
  } catch (error) {
    console.error('Get storefront product by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

// Create order via public storefront using storeSlug
export const createPublicStoreOrder: RequestHandler = async (req, res) => {
  const { storeSlug } = req.params as any;
  console.log('[createPublicStoreOrder] Starting with storeSlug:', storeSlug);
  try {
    const pool = await ensureConnection();
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

    if (!product_id || !quantity || !total_price || !customer_name || !customer_phone) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const normalizedPhone = String(customer_phone).replace(/\s/g, '');
    if (!/^\+?[0-9]{7,}$/.test(normalizedPhone)) {
      res.status(400).json({ error: 'Invalid phone number' });
      return;
    }

    console.log('[createPublicStoreOrder] About to query store settings...');
    // Match by exact store_slug OR normalized store_name (same as storefront loading)
    const cs = await pool.query(
      `SELECT client_id, store_name
       FROM client_store_settings
       WHERE store_slug = $1
          OR LOWER(REGEXP_REPLACE(store_name, '[^a-zA-Z0-9]', '', 'g')) = LOWER($1)`,
      [storeSlug]
    );
    console.log('[createPublicStoreOrder] Client store lookup:', cs.rows);
    
    let clientId: number | string;
    let storeName: string;
    
    if (cs.rows.length > 0) {
      clientId = cs.rows[0].client_id;
      storeName = cs.rows[0].store_name || 'EcoPro Store';
      console.log('[createPublicStoreOrder] Found client store, client_id:', clientId);
    } else {
      // Try seller_store_settings as fallback
      console.log('[createPublicStoreOrder] Not found in client_store_settings, trying seller_store_settings...');
      const ss = await pool.query(
        `SELECT seller_id, store_name
         FROM seller_store_settings
         WHERE store_slug = $1
            OR LOWER(REGEXP_REPLACE(store_name, '[^a-zA-Z0-9]', '', 'g')) = LOWER($1)`,
        [storeSlug]
      );
      console.log('[createPublicStoreOrder] Seller store lookup:', ss.rows);
      
      if (!ss.rows.length) {
        console.log('[createPublicStoreOrder] Store not found for slug:', storeSlug);
        res.status(404).json({ error: 'Store not found' });
        return;
      }
      clientId = ss.rows[0].seller_id;
      storeName = ss.rows[0].store_name || 'EcoPro Store';
      console.log('[createPublicStoreOrder] Found seller store, seller_id:', clientId);
    }

    // For public orders, use the store owner's client_id so they can see the orders in their dashboard
    // Check stock availability
    const stockCheckResult = await pool.query(
      'SELECT stock_quantity FROM client_store_products WHERE id = $1',
      [product_id]
    );
    
    if (stockCheckResult.rows.length === 0) {
      console.log('[createPublicStoreOrder] Product not found:', product_id);
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const availableStock = stockCheckResult.rows[0].stock_quantity || 0;
    if (availableStock < quantity) {
      console.log(`[createPublicStoreOrder] Insufficient stock: requested ${quantity}, available ${availableStock}`);
      res.status(400).json({ error: `Insufficient stock. Only ${availableStock} available.` });
      return;
    }

    console.log('[createPublicStoreOrder] Insert order params:', [
      product_id,
      clientId, // Store owner's client_id so orders appear in their dashboard
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
        clientId, // Store owner's client_id so orders appear in their dashboard
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

    // Create Telegram deep-link for this order (optional for the customer)
    const telegram = await createOrderTelegramLink({
      orderId: Number(result.rows[0].id),
      clientId: Number(clientId),
      customerPhone: normalizedPhone,
      customerName: String(customer_name),
    }).catch(() => ({ startToken: '', startUrl: null } as any));

    // Decrease stock after successful order creation
    await pool.query(
      'UPDATE client_store_products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
      [quantity, product_id]
    );
    console.log(`[createPublicStoreOrder] Stock decreased by ${quantity} for product ${product_id}`);
    // Audit log
    try {
      await pool.query(
        `INSERT INTO audit_logs(actor_type, actor_id, action, target_type, target_id, details, created_at)
         VALUES($1,$2,$3,$4,$5,$6,NOW())`,
        ['system', clientId, 'create_order', 'order', result.rows[0]?.id || null, JSON.stringify({ product_id, customer_name })]
      );
    } catch {}

    // Fire-and-forget bot confirmation with confirmation link tied to this order
    if (normalizedPhone) {
      const productTitle = (await pool.query('SELECT title FROM client_store_products WHERE id = $1', [product_id])).rows?.[0]?.title || 'Product';

      // Check if customer has pre-connected via Telegram
      const preConnectRes = await pool.query(
        `SELECT telegram_chat_id FROM customer_messaging_ids 
         WHERE client_id = $1 AND customer_phone = $2 AND telegram_chat_id IS NOT NULL
         LIMIT 1`,
        [clientId, normalizedPhone]
      );

      if (preConnectRes.rows.length > 0) {
        // Customer is pre-connected! Send immediate notification
        const chatId = preConnectRes.rows[0].telegram_chat_id;
        
        // Get bot settings
        const botRes = await pool.query(
          `SELECT telegram_bot_token, template_order_confirmation 
           FROM bot_settings 
           WHERE client_id = $1 AND enabled = true AND provider = 'telegram'
           LIMIT 1`,
          [clientId]
        );

        if (botRes.rows.length > 0 && botRes.rows[0].telegram_bot_token) {
          const botToken = botRes.rows[0].telegram_bot_token;
          
          // Detailed order confirmation message
          const orderMessage = `🎉 شكراً لك يا ${customer_name}!

تم استلام طلبك بنجاح ✅

━━━━━━━━━━━━━━━━
📦 تفاصيل الطلب
━━━━━━━━━━━━━━━━
🔢 رقم الطلب: #${result.rows[0].id}
📱 المنتج: ${productTitle}
💰 السعر: ${total_price.toLocaleString()} دج
📍 الكمية: ${quantity}

━━━━━━━━━━━━━━━━
👤 معلومات التوصيل
━━━━━━━━━━━━━━━━
📛 الاسم: ${customer_name}
📞 الهاتف: ${customer_phone || normalizedPhone}
🏠 العنوان: ${customer_address || 'غير محدد'}

━━━━━━━━━━━━━━━━
🚚 حالة الطلب: قيد المعالجة
━━━━━━━━━━━━━━━━

سنتواصل معك قريباً للتأكيد 📞

⭐ من ${storeName}`;

          // Send order confirmation
          const msgResult = await sendTelegramMessage(botToken, chatId, orderMessage);
          
          // Send pinning instruction as separate message
          if (msgResult.success) {
            await sendTelegramMessage(botToken, chatId, 
              `📌 نصيحة مهمة:
              
اضغط مطولاً على الرسالة السابقة واختر "تثبيت" (Pin) لتتبع طلبك بسهولة!

🔔 تأكد من:
• تفعيل الإشعارات للبوت
• عدم كتم صوت المحادثة
• ستصلك تحديثات حالة الطلب هنا مباشرة`
            );
          }

          // Also create the order-telegram link for future use
          await pool.query(
            `INSERT INTO order_telegram_chats (order_id, client_id, telegram_chat_id, created_at)
             VALUES ($1, $2, $3, NOW())
             ON CONFLICT (order_id) DO UPDATE SET telegram_chat_id = EXCLUDED.telegram_chat_id`,
            [result.rows[0].id, clientId, chatId]
          );

          console.log(`[createPublicStoreOrder] Sent immediate Telegram notification to chat ${chatId}`);
        }
      } else {
        // Customer not pre-connected, use the scheduled bot message flow
        sendBotMessagesForOrder(
          result.rows[0].id,
          Number(clientId),
          normalizedPhone,
          customer_name,
          storeName,
          productTitle,
          total_price,
          storeSlug
        ).catch(() => {});
      }
    }

    console.log('[createPublicStoreOrder] Order creation successful, sending response...');
    // Return only safe fields - don't expose client_id to buyers
    const { client_id, ...safeOrder } = result.rows[0];
    res.status(201).json({ success: true, order: safeOrder, telegramStartUrl: telegram?.startUrl || null });
  } catch (error) {
    console.error('Create public store order error:', error instanceof Error ? error.message : String(error));
    console.error('Full error details:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to create order', details: error instanceof Error ? error.message : String(error) });
    }
  }
};

// Get product by ID or slug with store info (for Telegram integration)
export const getProductWithStoreInfo: RequestHandler = async (req, res) => {
  const { productId } = req.params;

  try {
    const pool = await ensureConnection();
    
    // Determine if it's an ID (numeric) or slug (string with letters/hyphens)
    const isNumericId = /^\d+$/.test(productId);
    
    // Try client store product first - search by ID or slug
    const result = await pool.query(
      `SELECT 
        p.id, p.title, p.description, p.price, p.original_price,
        p.images, p.category, p.stock_quantity, p.slug, p.status,
        s.store_name, s.store_slug, s.primary_color, s.template_accent_color
      FROM client_store_products p
      INNER JOIN client_store_settings s ON p.client_id = s.client_id
      WHERE ${isNumericId ? 'p.id = $1' : 'p.slug = $1'}`,
      [productId]
    );

    if (result.rows.length > 0) {
      return res.json(result.rows[0]);
    }

    // Try marketplace product - search by ID or slug
    const mResult = await pool.query(
      `SELECT 
        p.id, p.title, p.description, p.price, p.original_price,
        p.images, p.category, p.stock, p.slug, p.status,
        ss.store_name, ss.store_slug, ss.primary_color
      FROM marketplace_products p
      INNER JOIN seller_store_settings ss ON p.seller_id = ss.seller_id
      WHERE ${isNumericId ? 'p.id = $1' : 'p.slug = $1'}`,
      [productId]
    );

    if (mResult.rows.length > 0) {
      return res.json(mResult.rows[0]);
    }

    res.status(404).json({ error: 'Product not found' });
  } catch (error) {
    console.error('Get product with store info error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};
