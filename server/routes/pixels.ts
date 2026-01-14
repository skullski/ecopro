import { Router, RequestHandler } from "express";
import { ensureConnection } from "../utils/database";
import { authenticate, requireClient } from "../middleware/auth";

const router = Router();

// Get pool helper
async function getPool() {
  return await ensureConnection();
}

// Standard pixel events
const VALID_EVENTS = [
  'PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout', 
  'Purchase', 'Lead', 'CompleteRegistration', 'Search', 'AddToWishlist'
];

// =====================
// PIXEL SETTINGS
// =====================

// Get pixel settings for client
export const getPixelSettings: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user || user.role === 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const clientId = user.id;
    
    const pool = await getPool();
    const result = await pool.query(
      `SELECT * FROM client_pixel_settings WHERE client_id = $1`,
      [clientId]
    );
    
    if (result.rows.length === 0) {
      // Return empty defaults
      return res.json({
        client_id: clientId,
        facebook_pixel_id: null,
        tiktok_pixel_id: null,
        is_facebook_enabled: false,
        is_tiktok_enabled: false
      });
    }
    
    // Don't expose access tokens to frontend
    const settings = result.rows[0];
    res.json({
      ...settings,
      facebook_access_token: settings.facebook_access_token ? '***configured***' : null,
      tiktok_access_token: settings.tiktok_access_token ? '***configured***' : null
    });
  } catch (error) {
    console.error("Get pixel settings error:", error);
    res.status(500).json({ error: "Failed to fetch pixel settings" });
  }
};

// Update pixel settings
export const updatePixelSettings: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user || user.role === 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const clientId = user.id;
    const {
      facebook_pixel_id,
      facebook_access_token,
      tiktok_pixel_id,
      tiktok_access_token,
      is_facebook_enabled,
      is_tiktok_enabled
    } = req.body;
    
    const pool = await getPool();
    
    // Simple upsert approach
    const upsertResult = await pool.query(
      `INSERT INTO client_pixel_settings (
        client_id, facebook_pixel_id, facebook_access_token, 
        tiktok_pixel_id, tiktok_access_token,
        is_facebook_enabled, is_tiktok_enabled
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (client_id) DO UPDATE SET
        facebook_pixel_id = COALESCE(EXCLUDED.facebook_pixel_id, client_pixel_settings.facebook_pixel_id),
        facebook_access_token = CASE 
          WHEN EXCLUDED.facebook_access_token IS NOT NULL THEN EXCLUDED.facebook_access_token 
          ELSE client_pixel_settings.facebook_access_token 
        END,
        tiktok_pixel_id = COALESCE(EXCLUDED.tiktok_pixel_id, client_pixel_settings.tiktok_pixel_id),
        tiktok_access_token = CASE 
          WHEN EXCLUDED.tiktok_access_token IS NOT NULL THEN EXCLUDED.tiktok_access_token 
          ELSE client_pixel_settings.tiktok_access_token 
        END,
        is_facebook_enabled = EXCLUDED.is_facebook_enabled,
        is_tiktok_enabled = EXCLUDED.is_tiktok_enabled,
        updated_at = NOW()
      RETURNING *`,
      [
        clientId,
        facebook_pixel_id || null,
        facebook_access_token === '***configured***' ? null : (facebook_access_token || null),
        tiktok_pixel_id || null,
        tiktok_access_token === '***configured***' ? null : (tiktok_access_token || null),
        is_facebook_enabled ?? false,
        is_tiktok_enabled ?? false
      ]
    );
    
    const settings = upsertResult.rows[0];
    res.json({
      ...settings,
      facebook_access_token: settings.facebook_access_token ? '***configured***' : null,
      tiktok_access_token: settings.tiktok_access_token ? '***configured***' : null
    });
  } catch (error) {
    console.error("Update pixel settings error:", error);
    res.status(500).json({ error: "Failed to update pixel settings" });
  }
};

// =====================
// PIXEL EVENT TRACKING
// =====================

// Track a pixel event (called from storefront)
export const trackPixelEvent: RequestHandler = async (req, res) => {
  try {
    const {
      store_slug,
      pixel_type,
      event_name,
      event_data,
      page_url,
      session_id,
      visitor_id,
      product_id,
      order_id,
      revenue,
      currency
    } = req.body;
    
    if (!store_slug || !pixel_type || !event_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (!['facebook', 'tiktok'].includes(pixel_type)) {
      return res.status(400).json({ error: 'Invalid pixel type' });
    }
    
    const pool = await getPool();

    // Normalize page path from page_url (for dedupe + analytics)
    let pagePath: string | null = null;
    if (typeof page_url === 'string' && page_url) {
      try {
        const u = new URL(page_url);
        pagePath = u.pathname || null;
      } catch {
        pagePath = null;
      }
    }
    
    // Get client_id from store_slug
    const storeResult = await pool.query(
      `SELECT client_id
       FROM client_store_settings
       WHERE store_slug = $1
          OR LOWER(REGEXP_REPLACE(store_name, '[^a-zA-Z0-9]', '', 'g')) = LOWER($1)`,
      [store_slug]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const clientId = storeResult.rows[0].client_id;
    
    // Check if pixel is enabled for this store
    const pixelSettings = await pool.query(
      `SELECT * FROM client_pixel_settings WHERE client_id = $1`,
      [clientId]
    );
    
    if (pixelSettings.rows.length === 0) {
      return res.json({ tracked: false, reason: 'No pixel configured' });
    }
    
    const settings = pixelSettings.rows[0];
    if (pixel_type === 'facebook' && !settings.is_facebook_enabled) {
      return res.json({ tracked: false, reason: 'Facebook pixel disabled' });
    }
    if (pixel_type === 'tiktok' && !settings.is_tiktok_enabled) {
      return res.json({ tracked: false, reason: 'TikTok pixel disabled' });
    }

    // De-duplicate noisy events (refresh, React strict-mode double effects, multiple mounts).
    // This keeps the dashboard usable and closer to “unique per session per page”.
    // Window: short TTL to still allow legitimate repeat navigation.
    const dedupeWindowMinutes = 10;
    if (session_id && (event_name === 'PageView' || event_name === 'ViewContent')) {
      const dedupeParams: any[] = [clientId, event_name, session_id];
      let dedupeWhere = `client_id = $1 AND event_name = $2 AND session_id = $3 AND created_at > NOW() - INTERVAL '${dedupeWindowMinutes} minutes'`;

      if (event_name === 'PageView' && pagePath) {
        dedupeWhere += ` AND (event_data->>'page_path') = $4`;
        dedupeParams.push(pagePath);
      }

      if (event_name === 'ViewContent' && product_id) {
        dedupeWhere += ` AND product_id = $4`;
        dedupeParams.push(product_id);
      }

      // Only dedupe when we have a stable key (page_path for PageView, product_id for ViewContent)
      const shouldDedupe =
        (event_name === 'PageView' && Boolean(pagePath)) ||
        (event_name === 'ViewContent' && Boolean(product_id));

      if (shouldDedupe) {
        const exists = await pool.query(
          `SELECT 1 FROM pixel_events WHERE ${dedupeWhere} LIMIT 1`,
          dedupeParams
        );
        if (exists.rows.length > 0) {
          return res.json({ tracked: false, reason: 'Deduped' });
        }
      }
    }
    
    // Get IP and User Agent
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
    const userAgent = req.headers['user-agent'] || null;
    
    // Insert event
    const mergedEventData = {
      ...(event_data && typeof event_data === 'object' ? event_data : {}),
      ...(pagePath ? { page_path: pagePath } : {}),
    };

    await pool.query(
      `INSERT INTO pixel_events (
        client_id, pixel_type, event_name, event_data, page_url,
        user_agent, ip_address, session_id, visitor_id,
        product_id, order_id, revenue, currency
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        clientId,
        pixel_type,
        event_name,
        JSON.stringify(mergedEventData),
        page_url || null,
        userAgent,
        ip ? String(ip).split(',')[0].trim() : null,
        session_id || null,
        visitor_id || null,
        product_id || null,
        order_id || null,
        revenue || null,
        currency || 'DZD'
      ]
    );
    
    // Update daily stats
    await updateDailyStats(clientId, pixel_type, event_name, revenue);
    
    res.json({ tracked: true });
  } catch (error) {
    console.error("Track pixel event error:", error);
    res.status(500).json({ error: "Failed to track event" });
  }
};

// Helper to update daily aggregated stats
async function updateDailyStats(clientId: number, pixelType: string, eventName: string, revenue?: number) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Map event names to stat columns
    const eventColumnMap: Record<string, string> = {
      'PageView': 'page_views',
      'ViewContent': 'view_content',
      'AddToCart': 'add_to_cart',
      'InitiateCheckout': 'initiate_checkout',
      'Purchase': 'purchases'
    };
    
    const column = eventColumnMap[eventName];
    if (!column) return;
    
    const pool = await getPool();
    
    // Upsert daily stats
    let query = `
      INSERT INTO pixel_stats_daily (client_id, pixel_type, stat_date, ${column}, total_revenue)
      VALUES ($1, $2, $3, 1, $4)
      ON CONFLICT (client_id, pixel_type, stat_date) DO UPDATE SET
        ${column} = pixel_stats_daily.${column} + 1,
        total_revenue = pixel_stats_daily.total_revenue + COALESCE($4, 0),
        updated_at = NOW()
    `;
    
    await pool.query(query, [clientId, pixelType, today, revenue || 0]);
  } catch (error) {
    console.error("Update daily stats error:", error);
  }
}

// =====================
// PIXEL STATISTICS
// =====================

// Get pixel statistics for client dashboard
export const getPixelStats: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user || user.role === 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const clientId = user.id;
    const { days = 30, pixel_type } = req.query;
    const numDays = Math.min(90, Math.max(1, parseInt(String(days)) || 30));
    
    const pool = await getPool();
    
    // Get daily stats for the period
    let statsQuery = `
      SELECT 
        stat_date,
        pixel_type,
        page_views,
        view_content,
        add_to_cart,
        initiate_checkout,
        purchases,
        total_revenue
      FROM pixel_stats_daily
      WHERE client_id = $1 
        AND stat_date >= CURRENT_DATE - INTERVAL '${numDays} days'
    `;
    
    const params: any[] = [clientId];
    if (pixel_type && ['facebook', 'tiktok'].includes(String(pixel_type))) {
      statsQuery += ` AND pixel_type = $2`;
      params.push(pixel_type);
    }
    
    statsQuery += ` ORDER BY stat_date DESC`;
    
    const statsResult = await pool.query(statsQuery, params);
    
    // Get totals
    const totalsQuery = `
      SELECT 
        pixel_type,
        SUM(page_views) as total_page_views,
        SUM(view_content) as total_view_content,
        SUM(add_to_cart) as total_add_to_cart,
        SUM(initiate_checkout) as total_initiate_checkout,
        SUM(purchases) as total_purchases,
        SUM(total_revenue) as total_revenue
      FROM pixel_stats_daily
      WHERE client_id = $1 
        AND stat_date >= CURRENT_DATE - INTERVAL '${numDays} days'
      GROUP BY pixel_type
    `;
    
    const totalsResult = await pool.query(totalsQuery, [clientId]);
    
    // Calculate conversion rates
    const facebookTotals = totalsResult.rows.find(r => r.pixel_type === 'facebook') || {};
    const tiktokTotals = totalsResult.rows.find(r => r.pixel_type === 'tiktok') || {};
    
    const calcConversionRate = (purchases: number, pageViews: number) => {
      if (!pageViews || pageViews === 0) return 0;
      return ((purchases / pageViews) * 100).toFixed(2);
    };
    
    const calcCartRate = (addToCart: number, viewContent: number) => {
      if (!viewContent || viewContent === 0) return 0;
      return ((addToCart / viewContent) * 100).toFixed(2);
    };
    
    res.json({
      period_days: numDays,
      daily_stats: statsResult.rows,
      facebook: {
        ...facebookTotals,
        conversion_rate: calcConversionRate(
          parseInt(facebookTotals.total_purchases) || 0,
          parseInt(facebookTotals.total_page_views) || 0
        ),
        cart_rate: calcCartRate(
          parseInt(facebookTotals.total_add_to_cart) || 0,
          parseInt(facebookTotals.total_view_content) || 0
        )
      },
      tiktok: {
        ...tiktokTotals,
        conversion_rate: calcConversionRate(
          parseInt(tiktokTotals.total_purchases) || 0,
          parseInt(tiktokTotals.total_page_views) || 0
        ),
        cart_rate: calcCartRate(
          parseInt(tiktokTotals.total_add_to_cart) || 0,
          parseInt(tiktokTotals.total_view_content) || 0
        )
      }
    });
  } catch (error) {
    console.error("Get pixel stats error:", error);
    res.status(500).json({ error: "Failed to fetch pixel statistics" });
  }
};

// Get recent pixel events for debugging
export const getRecentPixelEvents: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user || user.role === 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const clientId = user.id;
    const { limit = 50, pixel_type, event_name } = req.query;
    const numLimit = Math.min(200, Math.max(1, parseInt(String(limit)) || 50));
    
    const pool = await getPool();
    
    let query = `
      SELECT 
        id, pixel_type, event_name, event_data, page_url,
        product_id, order_id, revenue, currency, created_at
      FROM pixel_events
      WHERE client_id = $1
    `;
    
    const params: any[] = [clientId];
    let paramCount = 2;
    
    if (pixel_type && ['facebook', 'tiktok'].includes(String(pixel_type))) {
      query += ` AND pixel_type = $${paramCount++}`;
      params.push(pixel_type);
    }
    
    if (event_name) {
      query += ` AND event_name = $${paramCount++}`;
      params.push(event_name);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${paramCount}`;
    params.push(numLimit);
    
    const result = await pool.query(query, params);
    
    res.json({
      events: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error("Get recent pixel events error:", error);
    res.status(500).json({ error: "Failed to fetch recent events" });
  }
};

// Get funnel analysis
export const getPixelFunnel: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user || user.role === 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const clientId = user.id;
    const { days = 30, pixel_type = 'facebook' } = req.query;
    const numDays = Math.min(90, Math.max(1, parseInt(String(days)) || 30));
    
    const pool = await getPool();
    
    // Get funnel data
    const funnelQuery = `
      SELECT 
        SUM(page_views) as page_views,
        SUM(view_content) as view_content,
        SUM(add_to_cart) as add_to_cart,
        SUM(initiate_checkout) as initiate_checkout,
        SUM(purchases) as purchases,
        SUM(total_revenue) as total_revenue
      FROM pixel_stats_daily
      WHERE client_id = $1 
        AND pixel_type = $2
        AND stat_date >= CURRENT_DATE - INTERVAL '${numDays} days'
    `;
    
    const result = await pool.query(funnelQuery, [clientId, pixel_type]);
    const data = result.rows[0] || {};
    
    const pageViews = parseInt(data.page_views) || 0;
    const viewContent = parseInt(data.view_content) || 0;
    const addToCart = parseInt(data.add_to_cart) || 0;
    const initiateCheckout = parseInt(data.initiate_checkout) || 0;
    const purchases = parseInt(data.purchases) || 0;
    
    res.json({
      pixel_type,
      period_days: numDays,
      funnel: [
        { stage: 'Page Views', count: pageViews, rate: 100 },
        { stage: 'View Content', count: viewContent, rate: pageViews ? ((viewContent / pageViews) * 100).toFixed(1) : 0 },
        { stage: 'Add to Cart', count: addToCart, rate: viewContent ? ((addToCart / viewContent) * 100).toFixed(1) : 0 },
        { stage: 'Checkout', count: initiateCheckout, rate: addToCart ? ((initiateCheckout / addToCart) * 100).toFixed(1) : 0 },
        { stage: 'Purchase', count: purchases, rate: initiateCheckout ? ((purchases / initiateCheckout) * 100).toFixed(1) : 0 }
      ],
      total_revenue: parseFloat(data.total_revenue) || 0,
      avg_order_value: purchases > 0 ? ((parseFloat(data.total_revenue) || 0) / purchases).toFixed(2) : 0
    });
  } catch (error) {
    console.error("Get pixel funnel error:", error);
    res.status(500).json({ error: "Failed to fetch funnel data" });
  }
};

// Get public pixel config by store slug (for frontend script injection - no auth)
export const getPublicPixelConfig: RequestHandler = async (req, res) => {
  try {
    const { storeSlug } = req.params;
    
    if (!storeSlug) {
      return res.status(400).json({ error: 'Store slug required' });
    }
    
    const pool = await getPool();
    
    // Get client_id from store_slug
    const storeResult = await pool.query(
      `SELECT client_id
       FROM client_store_settings
       WHERE store_slug = $1
          OR LOWER(REGEXP_REPLACE(store_name, '[^a-zA-Z0-9]', '', 'g')) = LOWER($1)`,
      [storeSlug]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const clientId = storeResult.rows[0].client_id;
    
    // Get pixel settings
    const pixelSettings = await pool.query(
      `SELECT facebook_pixel_id, tiktok_pixel_id, is_facebook_enabled, is_tiktok_enabled 
       FROM client_pixel_settings WHERE client_id = $1`,
      [clientId]
    );
    
    if (pixelSettings.rows.length === 0) {
      return res.json({ 
        facebook_pixel_id: null, 
        tiktok_pixel_id: null,
        is_facebook_enabled: false,
        is_tiktok_enabled: false
      });
    }
    
    const settings = pixelSettings.rows[0];
    res.json({
      facebook_pixel_id: settings.is_facebook_enabled ? settings.facebook_pixel_id : null,
      tiktok_pixel_id: settings.is_tiktok_enabled ? settings.tiktok_pixel_id : null,
      is_facebook_enabled: settings.is_facebook_enabled,
      is_tiktok_enabled: settings.is_tiktok_enabled
    });
  } catch (error) {
    console.error("Get public pixel config error:", error);
    res.status(500).json({ error: "Failed to fetch pixel config" });
  }
};

// =====================
// ROUTES
// =====================

// Protected routes (require auth + client role)
router.get('/settings', authenticate, requireClient, getPixelSettings);
router.put('/settings', authenticate, requireClient, updatePixelSettings);
router.get('/stats', authenticate, requireClient, getPixelStats);
router.get('/events', authenticate, requireClient, getRecentPixelEvents);
router.get('/funnel', authenticate, requireClient, getPixelFunnel);

// Public routes (no auth required)
router.post('/track', trackPixelEvent);
router.get('/config/:storeSlug', getPublicPixelConfig);

export default router;
