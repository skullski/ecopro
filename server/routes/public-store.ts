import { RequestHandler } from "express";
import { ensureConnection } from "../utils/database";
import { sendBotMessagesForOrder } from "./order-confirmation";
import { createOrderTelegramLink } from "../utils/telegram";
import { createConfirmationLink, sendTelegramMessage, replaceTemplateVariables } from "../utils/bot-messaging";
import { z, ZodError } from "zod";

const StoreSlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .refine((v) => v !== 'null' && v !== 'undefined', { message: 'Invalid store ID' });

const ProductSlugSchema = z.string().trim().min(1).max(200);
const ProductIdSchema = z.preprocess((v) => Number(v), z.number().int().positive());

// Get all products for a storefront
export const getStorefrontProducts: RequestHandler = async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const startTime = Date.now();
  let storeSlug: string;
  try {
    storeSlug = StoreSlugSchema.parse(req.params.storeSlug);
  } catch {
    return res.status(400).json({ error: 'Invalid store ID' });
  }

  try {
    if (!isProduction) {
      console.log(`[Storefront] Fetching products for store: ${storeSlug}`);
    }
    const pool = await ensureConnection();
    if (!isProduction) {
      console.log(`[Storefront] DB connection established in ${Date.now() - startTime}ms`);
    }
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
      if (!isProduction) {
        console.log(`Loading client store ${storeSlug} for client ID ${clientId}`);
      }
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
      if (!isProduction) {
        console.log(`Found ${result.rows.length} client products for store ${storeSlug}`);
      }
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
      if (!isProduction) {
        console.log(`Store not found: ${storeSlug}`);
      }
      return res.status(404).json({ error: 'Store not found' });
    }
    const sellerId = sellerCheck.rows[0].seller_id;
    if (!isProduction) {
      console.log(`Loading seller store ${storeSlug} for seller ID ${sellerId}`);
    }
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
    if (!isProduction) {
      console.log(`Found ${mResult.rows.length} marketplace products for seller store ${storeSlug}`);
    }
    res.json(mResult.rows);
  } catch (error) {
    const isProduction = process.env.NODE_ENV === 'production';
    console.error('Get storefront products error:', isProduction ? (error as any)?.message : error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};
// Get store settings for a storefront
export const getStorefrontSettings: RequestHandler = async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const startTime = Date.now();
  let storeSlug: string;
  try {
    storeSlug = StoreSlugSchema.parse(req.params.storeSlug);
  } catch {
    return res.status(400).json({ error: 'Invalid store ID' });
  }

  try {
    if (!isProduction) {
      console.log(`[Storefront] Fetching settings for store: ${storeSlug}`);
    }
    
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
    if (!isProduction) {
      console.log(`[Storefront] DB connection established in ${Date.now() - startTime}ms`);
    }
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
         WHERE store_slug = $1
            OR LOWER(REGEXP_REPLACE(store_name, '[^a-zA-Z0-9]', '', 'g')) = LOWER($1)`,
        [querySlug]
      );
    } catch (err: any) {
      // If query fails (columns don't exist yet), try without new columns
      if (err.code === '42703') {
          clientRes = await pool.query(
            "SELECT store_name, store_description, store_logo, primary_color, secondary_color, template, banner_url, currency_code, NULL as hero_main_url, NULL as hero_tile1_url, NULL as hero_tile2_url, store_images, owner_name, owner_email, NULL as template_hero_heading, NULL as template_hero_subtitle, NULL as template_button_text, NULL as template_accent_color, NULL as template_settings, NULL as template_settings_by_template, NULL as global_settings, store_slug FROM client_store_settings WHERE store_slug = $1 OR LOWER(REGEXP_REPLACE(store_name, '[^a-zA-Z0-9]', '', 'g')) = LOWER($1)",
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
           FROM seller_store_settings
           WHERE store_slug = $1
              OR LOWER(REGEXP_REPLACE(store_name, '[^a-zA-Z0-9]', '', 'g')) = LOWER($1)`,
          [querySlug]
        );
      } catch (err: any) {
        // If query fails (columns don't exist), try without them
        if (err.code === '42703') {
          sellerRes = await pool.query(
            "SELECT store_name, store_description, store_logo, primary_color, secondary_color, template, banner_url, currency_code, NULL as hero_main_url, NULL as hero_tile1_url, NULL as hero_tile2_url, store_images FROM seller_store_settings WHERE store_slug = $1 OR LOWER(REGEXP_REPLACE(store_name, '[^a-zA-Z0-9]', '', 'g')) = LOWER($1)",
            [querySlug]
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

    // Debug: log what template is being returned
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[storefront:${storeSlug}] template from DB: ${row.template}`);
    }

    // IMPORTANT: Ensure row.template is NOT overridden by templateSettings/globalSettings
    // The template field from the database row takes precedence
    const dbTemplate = row.template;

    res.json({
      ...globalSettings,
      ...templateSettings,
      ...row,
      template: dbTemplate, // Explicitly set to ensure it's not overridden
      store_slug: storeSlug,
      banner_url: sanitize(row.banner_url),
      hero_main_url: sanitize(row.hero_main_url),
      hero_tile1_url: sanitize(row.hero_tile1_url),
      hero_tile2_url: sanitize(row.hero_tile2_url),
      store_images: storeImagesArr,
    });
  } catch (error) {
    console.error('Get storefront settings error:', isProduction ? (error as any)?.message : error);
    res.status(500).json({ error: 'Failed to fetch store settings' });
  }
};

// Get single product for a storefront
export const getPublicProduct: RequestHandler = async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  let storeSlug: string;
  let productSlug: string;
  try {
    storeSlug = StoreSlugSchema.parse(req.params.storeSlug);
    productSlug = ProductSlugSchema.parse(req.params.productSlug);
  } catch {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    const pool = await ensureConnection();
    if (!isProduction) {
      console.log('[getPublicProduct] Looking for:', { storeSlug, productSlug });
    }
    
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
    if (!isProduction) {
      console.log('[getPublicProduct] Found rows:', productResult.rows.length);
    }
    
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
    console.error('Get public product error:', isProduction ? (error as any)?.message : error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

// Get single product by ID for a storefront
export const getStorefrontProductById: RequestHandler = async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  let storeSlug: string;
  let productId: number;
  try {
    storeSlug = StoreSlugSchema.parse(req.params.storeSlug);
    productId = ProductIdSchema.parse(req.params.productId);
  } catch {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    const pool = await ensureConnection();
    if (!isProduction) {
      console.log('[getStorefrontProductById] Looking for:', { storeSlug, productId });
    }
    
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
    console.error('Get storefront product by ID error:', isProduction ? (error as any)?.message : error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

// Create order via public storefront using storeSlug
export const createPublicStoreOrder: RequestHandler = async (req, res) => {
  const { storeSlug } = req.params as any;
  let pool: any;
  let client: any;
  let inTransaction = false;
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    pool = await ensureConnection();
    client = await pool.connect();

    const trimmedOptionalString = (maxLen: number) =>
      z.preprocess(
        (v) => {
          if (v === null || v === undefined) return undefined;
          if (typeof v !== 'string') return v;
          const t = v.trim();
          return t === '' ? undefined : t;
        },
        z.string().max(maxLen)
      );

    const CreatePublicStoreOrderSchema = z.object({
      product_id: z.preprocess((v) => Number(v), z.number().int().positive()),
      quantity: z.preprocess((v) => Number(v), z.number().int().positive()),
      // Client-provided total_price is accepted for backward-compatibility but ignored.
      // Total is computed server-side from the current product price.
      total_price: z.preprocess((v) => Number(v), z.number().positive()).optional(),
      customer_name: z.preprocess(
        (v) => (typeof v === 'string' ? v.trim() : v),
        z.string().min(1).max(120)
      ),
      customer_phone: z.preprocess(
        (v) => (typeof v === 'string' ? v.trim() : v),
        z.string().min(7).max(32)
      ),
      customer_email: trimmedOptionalString(255).pipe(z.string().email()).optional(),
      customer_address: trimmedOptionalString(500).optional(),
      shipping_wilaya_id: z.preprocess((v) => (v === '' || v === null || v === undefined ? undefined : Number(v)), z.number().int().positive()).optional(),
      shipping_commune_id: z.preprocess((v) => (v === '' || v === null || v === undefined ? undefined : Number(v)), z.number().int().positive()).optional(),
      shipping_hai: trimmedOptionalString(120).optional(),
    });

    let data: z.infer<typeof CreatePublicStoreOrderSchema>;
    try {
      data = CreatePublicStoreOrderSchema.parse(req.body);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      return res.status(400).json({ error: 'Invalid request' });
    }

    const {
      product_id,
      quantity,
      total_price: _ignoredTotalPrice,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      shipping_wilaya_id,
      shipping_commune_id,
      shipping_hai,
    } = data;

    const normalizedPhone = String(customer_phone).replace(/\s/g, '');
    if (!/^\+?[0-9]{7,}$/.test(normalizedPhone)) {
      res.status(400).json({ error: 'Invalid phone number' });
      return;
    }

    // Match by exact store_slug OR normalized store_name (same as storefront loading)
    const cs = await pool.query(
      `SELECT client_id, store_name
       FROM client_store_settings
       WHERE store_slug = $1
          OR LOWER(REGEXP_REPLACE(store_name, '[^a-zA-Z0-9]', '', 'g')) = LOWER($1)`,
      [storeSlug]
    );
    
    let clientId: number | string;
    let storeName: string;
    
    if (cs.rows.length > 0) {
      clientId = cs.rows[0].client_id;
      storeName = cs.rows[0].store_name || 'EcoPro Store';
      if (!isProduction) {
        console.log('[createPublicStoreOrder] Found client store, client_id:', clientId);
      }
    } else {
      // NOTE: This endpoint is for client storefronts only.
      if (!isProduction) {
        console.log('[createPublicStoreOrder] Client store not found for slug:', storeSlug);
      }
      res.status(404).json({ error: 'Store not found' });
      return;
    }

    // Ensure product belongs to this store (prevents cross-tenant product/order spoofing)
    const productRes = await pool.query(
      `SELECT id, price, stock_quantity
       FROM client_store_products
       WHERE id = $1 AND client_id = $2 AND status = 'active'
       LIMIT 1`,
      [product_id, clientId]
    );

    if (productRes.rows.length === 0) {
      if (!isProduction) {
        console.log('[createPublicStoreOrder] Product not found for store:', { product_id, clientId });
      }
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const productRow = productRes.rows[0];
    const unitPrice = Number(productRow.price);
    const expectedTotalPrice = unitPrice * Number(quantity);

    await client.query('BEGIN');
    inTransaction = true;

    const result = await client.query(
      `INSERT INTO store_orders (
        product_id, client_id, quantity, total_price,
        customer_name, customer_email, customer_phone, shipping_address,
        shipping_wilaya_id, shipping_commune_id, shipping_hai,
        status, payment_status, created_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,TIMEZONE('UTC', NOW())) RETURNING *`,
      [
        product_id,
        clientId, // Store owner's client_id so orders appear in their dashboard
        quantity,
        expectedTotalPrice,
        customer_name,
        customer_email || null,
        normalizedPhone || null,
        customer_address || null,
        shipping_wilaya_id || null,
        shipping_commune_id || null,
        shipping_hai || null,
        'pending',
        'unpaid'
      ]
    );
    if (!isProduction) {
      console.log('[createPublicStoreOrder] Inserted order id:', result.rows?.[0]?.id);
    }

    // Create Telegram deep-link for this order (optional for the customer)
    const telegram = await createOrderTelegramLink({
      orderId: Number(result.rows[0].id),
      clientId: Number(clientId),
      customerPhone: normalizedPhone,
      customerName: String(customer_name),
    }).catch(() => ({ startToken: '', startUrl: null } as any));

    // Decrease stock after successful order creation (scoped + guarded)
    const stockUpdate = await client.query(
      'UPDATE client_store_products SET stock_quantity = stock_quantity - $1 WHERE id = $2 AND client_id = $3 AND stock_quantity >= $1 RETURNING stock_quantity',
      [quantity, product_id, clientId]
    );
    if (stockUpdate.rows.length === 0) {
      await client.query('ROLLBACK');
      inTransaction = false;
      return res.status(400).json({ error: 'Insufficient stock.' });
    }
    if (!isProduction) {
      console.log(`[createPublicStoreOrder] Stock decreased by ${quantity} for product ${product_id}`);
    }

    await client.query('COMMIT');
    inTransaction = false;
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
      const orderTotalPrice = Number(result.rows?.[0]?.total_price ?? expectedTotalPrice);
      const productTitle = (await pool.query('SELECT title FROM client_store_products WHERE id = $1', [product_id])).rows?.[0]?.title || 'Product';

      // Check if customer has pre-connected via Telegram
      const preConnectRes = await pool.query(
        `SELECT telegram_chat_id FROM customer_messaging_ids 
         WHERE client_id = $1 AND customer_phone = $2 AND telegram_chat_id IS NOT NULL
         LIMIT 1`,
        [clientId, normalizedPhone]
      );
      if (!isProduction) {
        console.log('[createPublicStoreOrder] Pre-connect found:', preConnectRes.rows.length > 0);
      }

      if (preConnectRes.rows.length > 0) {
        // Customer is pre-connected! Send immediate notification
        const chatId = preConnectRes.rows[0].telegram_chat_id;
        if (!isProduction) {
          console.log('[createPublicStoreOrder] Customer is pre-connected, chat_id:', chatId);
        }
        
        // Get bot settings
        const botRes = await pool.query(
          `SELECT telegram_bot_token, template_instant_order, template_pin_instructions, 
                  telegram_delay_minutes, template_order_confirmation
           FROM bot_settings 
           WHERE client_id = $1 AND enabled = true AND provider = 'telegram'
           LIMIT 1`,
          [clientId]
        );
        if (!isProduction) {
          console.log('[createPublicStoreOrder] Bot settings found:', botRes.rows.length > 0);
        }

        if (botRes.rows.length > 0 && botRes.rows[0].telegram_bot_token) {
          const botToken = botRes.rows[0].telegram_bot_token;
          if (!isProduction) {
            console.log('[createPublicStoreOrder] Sending Telegram message to chat:', chatId);
          }
          
          // Default instant order template
          const defaultInstantOrder = `🎉 Thank you, {customerName}!

Your order has been received successfully ✅

━━━━━━━━━━━━━━━━
📦 Order Details
━━━━━━━━━━━━━━━━
🔢 Order ID: #{orderId}
📱 Product: {productName}
💰 Price: {totalPrice} DZD
📍 Quantity: {quantity}

━━━━━━━━━━━━━━━━
👤 Delivery Information
━━━━━━━━━━━━━━━━
📛 Name: {customerName}
📞 Phone: {customerPhone}
🏠 Address: {address}

━━━━━━━━━━━━━━━━
🚚 Order Status: Processing
━━━━━━━━━━━━━━━━

We will contact you soon for confirmation 📞

⭐ From {storeName}`;

          const defaultPinInstructions = `📌 Important tip:

Long press on the previous message and select "Pin" to easily track your order!

🔔 Make sure to:
• Enable notifications for the bot
• Don't mute the conversation
• You will receive order status updates here directly`;

          const instantOrderTemplate = botRes.rows[0].template_instant_order || defaultInstantOrder;
          const pinInstructionsTemplate = botRes.rows[0].template_pin_instructions || defaultPinInstructions;
          
          // Replace variables
          const orderMessage = replaceTemplateVariables(instantOrderTemplate, {
            customerName: customer_name,
            productName: productTitle,
            totalPrice: orderTotalPrice.toLocaleString(),
            quantity: quantity,
            orderId: result.rows[0].id,
            customerPhone: normalizedPhone,
            address: customer_address || 'Not specified',
            storeName: storeName,
            companyName: storeName,
          });

          // Send instant order notification (NO buttons - just info)
          const orderId = result.rows[0].id;
          
          const msgResult = await sendTelegramMessage(botToken, chatId, orderMessage);
          if (!isProduction) {
            console.log('[createPublicStoreOrder] Telegram send result:', msgResult);
          }
          
          // Send pinning instruction as separate message
          if (msgResult.success) {
            const pinResult = await sendTelegramMessage(botToken, chatId, pinInstructionsTemplate);
            if (!isProduction) {
              console.log('[createPublicStoreOrder] Pin instructions send result:', pinResult);
            }
          }
          
          // Schedule confirmation message with buttons after delay
          const delayMinutes = botRes.rows[0].telegram_delay_minutes || 5; // default 5 minutes
          const scheduledTime = new Date(Date.now() + delayMinutes * 60 * 1000);
          console.log(`[PublicStore] Scheduling confirmation for order ${orderId} in ${delayMinutes} minutes (at ${scheduledTime.toISOString()}, db value: ${botRes.rows[0].telegram_delay_minutes})`);
          
          // Get confirmation template
          const defaultConfirmationTemplate = `Hello {customerName}! 🌟

Do you confirm your order from {storeName}?

📦 Product: {productName}
💰 Price: {totalPrice} DZD
📍 Address: {address}

Press one of the buttons to confirm or cancel:`;
          const confirmationTemplate = botRes.rows[0].template_order_confirmation || defaultConfirmationTemplate;
          
          const confirmationMessage = replaceTemplateVariables(confirmationTemplate, {
            customerName: customer_name,
            productName: productTitle,
            totalPrice: String(orderTotalPrice),
            quantity: quantity,
            orderId: orderId,
            customerPhone: normalizedPhone,
            address: customer_address || 'Not specified',
            storeName: storeName,
            companyName: storeName,
          });
          
          // Insert into scheduled_messages table (use DO NOTHING to prevent duplicates for same order)
          await pool.query(
            `INSERT INTO scheduled_messages 
             (client_id, order_id, telegram_chat_id, message_content, message_type, scheduled_at, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'pending')
             ON CONFLICT DO NOTHING`,
            [clientId, orderId, chatId, confirmationMessage, 'order_confirmation', scheduledTime]
          );
          if (!isProduction) {
            console.log(`[createPublicStoreOrder] Scheduled confirmation message for ${delayMinutes} minutes later`);
          }

          // Also create the order-telegram link for future use
          await pool.query(
            `INSERT INTO order_telegram_chats (order_id, client_id, telegram_chat_id, created_at)
             VALUES ($1, $2, $3, NOW())
             ON CONFLICT (order_id) DO UPDATE SET telegram_chat_id = EXCLUDED.telegram_chat_id`,
            [result.rows[0].id, clientId, chatId]
          );

          if (!isProduction) {
            console.log(`[createPublicStoreOrder] Sent immediate Telegram notification to chat ${chatId}`);
          }
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
          orderTotalPrice,
          storeSlug
        ).catch(() => {});
      }
    }

    if (!isProduction) {
      console.log('[createPublicStoreOrder] Order creation successful, sending response...');
    }

    // Create a tokenized confirmation URL for the buyer (lets web flow work securely)
    let confirmationUrl: string | null = null;
    try {
      const token = await createConfirmationLink(Number(result.rows[0].id), Number(clientId));
      confirmationUrl = `/store/${storeSlug}/order/${result.rows[0].id}/confirm?t=${encodeURIComponent(String(token))}`;
    } catch {
      confirmationUrl = null;
    }

    // Return only safe fields - don't expose client_id to buyers
    const { client_id, ...safeOrder } = result.rows[0];
    res.status(201).json({ success: true, order: safeOrder, telegramStartUrl: telegram?.startUrl || null, confirmationUrl });
  } catch (error) {
    if (inTransaction && client) {
      try {
        await client.query('ROLLBACK');
      } catch {}
    }
    const isProduction = process.env.NODE_ENV === 'production';
    console.error(
      'Create public store order error:',
      isProduction ? (error instanceof Error ? error.message : String(error)) : error
    );
    if (!isProduction) {
      console.error('Full error details:', error);
    }
    if (!res.headersSent) {
      const details = isProduction ? undefined : (error instanceof Error ? error.message : String(error));
      res.status(500).json({
        error: 'Failed to create order',
        ...(details ? { details } : {}),
      });
    }
  } finally {
    try {
      if (client) client.release();
    } catch {}
  }
};

// Get Hai / Neighborhood suggestions for a storefront (public)
// GET /api/storefront/:storeSlug/address/hai-suggestions?communeId=123
export const getStorefrontHaiSuggestions: RequestHandler = async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  let storeSlug: string;
  try {
    storeSlug = StoreSlugSchema.parse((req.params as any).storeSlug);
  } catch {
    return res.status(400).json({ error: 'Invalid store ID' });
  }

  const communeIdRaw = (req.query as any)?.communeId;
  const communeId = Number(communeIdRaw);
  if (!Number.isFinite(communeId) || communeId <= 0) {
    return res.status(400).json({ error: 'communeId is required' });
  }

  try {
    const pool = await ensureConnection();
    const cs = await pool.query(
      `SELECT client_id
       FROM client_store_settings
       WHERE store_slug = $1
          OR LOWER(REGEXP_REPLACE(store_name, '[^a-zA-Z0-9]', '', 'g')) = LOWER($1)`,
      [storeSlug]
    );
    if (cs.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    const clientId = Number(cs.rows[0].client_id);

    const result = await pool.query(
      `SELECT shipping_hai AS value, COUNT(*)::int AS count
       FROM store_orders
       WHERE client_id = $1
         AND shipping_commune_id = $2
         AND shipping_hai IS NOT NULL
         AND BTRIM(shipping_hai) <> ''
       GROUP BY shipping_hai
       ORDER BY COUNT(*) DESC, shipping_hai ASC
       LIMIT 50`,
      [clientId, communeId]
    );

    res.json({ suggestions: result.rows });
  } catch (error) {
    console.error('Get Hai suggestions error:', isProduction ? (error as any)?.message : error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
};

// Get product by ID or slug with store info (for Telegram integration)
export const getProductWithStoreInfo: RequestHandler = async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  let productId: string;
  try {
    productId = z.string().trim().min(1).max(200).parse(req.params.productId);
  } catch {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    const pool = await ensureConnection();
    
    // Determine if it's an ID (numeric) or slug
    const isNumericId = /^\d+$/.test(productId);
    const idOrSlug: number | string = isNumericId ? Number(productId) : productId;
    
    // Try client store product first - search by ID or slug
    const result = await pool.query(
      `SELECT 
        p.id, p.title, p.description, p.price, p.original_price,
        p.images, p.category, p.stock_quantity, p.slug, p.status,
        s.store_name, s.store_slug, s.primary_color, s.template_accent_color
      FROM client_store_products p
      INNER JOIN client_store_settings s ON p.client_id = s.client_id
      WHERE ${isNumericId ? 'p.id = $1' : 'p.slug = $1'}`,
      [idOrSlug]
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
      [idOrSlug]
    );

    if (mResult.rows.length > 0) {
      return res.json(mResult.rows[0]);
    }

    res.status(404).json({ error: 'Product not found' });
  } catch (error) {
    console.error('Get product with store info error:', isProduction ? (error as any)?.message : error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};
// trigger rebuild
