import { RequestHandler } from "express";
import { pool } from "../utils/database";

// GET /api/dashboard/stats
// Aggregated metrics for the client/vendor dashboard
export const getDashboardStats: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user?.id;
    
    // Get custom statuses that count as revenue
    const revenueStatusesRes = await pool.query(
      `SELECT name FROM order_statuses WHERE client_id = $1 AND counts_as_revenue = true`,
      [clientId]
    );
    const revenueStatuses = revenueStatusesRes.rows.map(r => r.name);
    // Include built-in statuses for revenue calculation (English only)
    revenueStatuses.push('delivered', 'completed', 'confirmed');
    
    const [productsRes, ordersRes, revenueRes, pendingRes, completedRes] = await Promise.all([
      pool.query(
        `SELECT COUNT(*)::int AS products FROM client_store_products WHERE client_id = $1 AND status = 'active'`,
        [clientId]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS orders FROM store_orders WHERE client_id = $1`,
        [clientId]
      ),
      pool.query(
        `SELECT COALESCE(SUM(total_price),0)::float AS revenue FROM store_orders WHERE client_id = $1 AND status = ANY($2)`,
        [clientId, revenueStatuses]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS pending FROM store_orders WHERE status = 'pending' AND client_id = $1`,
        [clientId]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS completed FROM store_orders WHERE client_id = $1 AND status = ANY($2)`,
        [clientId, revenueStatuses]
      ),
    ]);

    // Get store views count
    const viewsRes = await pool.query(
      `SELECT COALESCE(SUM(views), 0)::int AS total_views FROM client_store_products WHERE client_id = $1`,
      [clientId]
    );

    const stats = {
      products: productsRes.rows[0]?.products ?? 0,
      orders: ordersRes.rows[0]?.orders ?? 0,
      revenue: revenueRes.rows[0]?.revenue ?? 0,
      pendingOrders: pendingRes.rows[0]?.pending ?? 0,
      completedOrders: completedRes.rows[0]?.completed ?? 0,
      visitors: viewsRes.rows[0]?.total_views ?? 0,
    };

    res.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      products: 0,
      orders: 0,
      revenue: 0,
      pendingOrders: 0,
      completedOrders: 0,
      visitors: 0,
      error: "Failed to fetch dashboard stats"
    });
  }
};

// GET /api/dashboard/analytics
// Rich analytics data for dashboard
export const getDashboardAnalytics: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user?.id;
    
    // Get custom statuses that count as revenue
    const revenueStatusesRes = await pool.query(
      `SELECT name FROM order_statuses WHERE client_id = $1 AND counts_as_revenue = true`,
      [clientId]
    );
    const revenueStatuses = revenueStatusesRes.rows.map(r => r.name);
    // Include built-in statuses for revenue calculation (English only)
    revenueStatuses.push('delivered', 'completed', 'confirmed');

    // Get all custom statuses for breakdown
    const customStatusesRes = await pool.query(
      `SELECT name, color, icon FROM order_statuses WHERE client_id = $1 ORDER BY sort_order`,
      [clientId]
    );

    // Daily revenue for last 30 days (only count revenue from revenue-counting statuses)
    const dailyRevenueRes = await pool.query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*)::int as orders,
        COALESCE(SUM(CASE WHEN status = ANY($2) THEN total_price ELSE 0 END), 0)::float as revenue
       FROM store_orders 
       WHERE client_id = $1 AND created_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [clientId, revenueStatuses]
    );

    // Today vs Yesterday comparison
    const todayRes = await pool.query(
      `SELECT 
        COUNT(*)::int as orders,
        COALESCE(SUM(CASE WHEN status = ANY($2) THEN total_price ELSE 0 END), 0)::float as revenue
       FROM store_orders 
       WHERE client_id = $1 AND DATE(created_at) = CURRENT_DATE`,
      [clientId, revenueStatuses]
    );

    const yesterdayRes = await pool.query(
      `SELECT 
        COUNT(*)::int as orders,
        COALESCE(SUM(CASE WHEN status = ANY($2) THEN total_price ELSE 0 END), 0)::float as revenue
       FROM store_orders 
       WHERE client_id = $1 AND DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'`,
      [clientId, revenueStatuses]
    );

    // This week vs last week
    const thisWeekRes = await pool.query(
      `SELECT 
        COUNT(*)::int as orders,
        COALESCE(SUM(CASE WHEN status = ANY($2) THEN total_price ELSE 0 END), 0)::float as revenue
       FROM store_orders 
       WHERE client_id = $1 AND created_at >= DATE_TRUNC('week', CURRENT_DATE)`,
      [clientId, revenueStatuses]
    );

    const lastWeekRes = await pool.query(
      `SELECT 
        COUNT(*)::int as orders,
        COALESCE(SUM(CASE WHEN status = ANY($2) THEN total_price ELSE 0 END), 0)::float as revenue
       FROM store_orders 
       WHERE client_id = $1 
         AND created_at >= DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '1 week'
         AND created_at < DATE_TRUNC('week', CURRENT_DATE)`,
      [clientId, revenueStatuses]
    );

    // This month vs last month
    const thisMonthRes = await pool.query(
      `SELECT 
        COUNT(*)::int as orders,
        COALESCE(SUM(CASE WHEN status = ANY($2) THEN total_price ELSE 0 END), 0)::float as revenue
       FROM store_orders 
       WHERE client_id = $1 AND created_at >= DATE_TRUNC('month', CURRENT_DATE)`,
      [clientId, revenueStatuses]
    );

    const lastMonthRes = await pool.query(
      `SELECT 
        COUNT(*)::int as orders,
        COALESCE(SUM(CASE WHEN status = ANY($2) THEN total_price ELSE 0 END), 0)::float as revenue
       FROM store_orders 
       WHERE client_id = $1 
         AND created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
         AND created_at < DATE_TRUNC('month', CURRENT_DATE)`,
      [clientId, revenueStatuses]
    );

    // Top selling products - use images[1] for first image as image_url
    const topProductsRes = await pool.query(
      `SELECT 
        p.id, p.title, p.price, 
        COALESCE(p.images[1], '') as image_url,
        COUNT(o.id)::int as total_orders,
        COALESCE(SUM(o.quantity), 0)::int as total_quantity,
        COALESCE(SUM(CASE WHEN o.status = ANY($2) THEN o.total_price ELSE 0 END), 0)::float as total_revenue
       FROM client_store_products p
       LEFT JOIN store_orders o ON o.product_id = p.id AND o.client_id = $1
       WHERE p.client_id = $1
       GROUP BY p.id, p.title, p.price, p.images
       ORDER BY total_orders DESC
       LIMIT 5`,
      [clientId, revenueStatuses]
    );

    // Recent orders - join with client_store_products to get product title
    const recentOrdersRes = await pool.query(
      `SELECT 
        o.id, o.customer_name, o.customer_phone, o.total_price, o.status, o.created_at,
        COALESCE(p.title, 'Unknown Product') as product_title
       FROM store_orders o
       LEFT JOIN client_store_products p ON o.product_id = p.id
       WHERE o.client_id = $1 
       ORDER BY o.created_at DESC 
       LIMIT 10`,
      [clientId]
    );

    // Orders by status (using custom statuses)
    const statusBreakdownRes = await pool.query(
      `SELECT 
        status,
        COUNT(*)::int as count,
        COALESCE(SUM(total_price), 0)::float as revenue
       FROM store_orders 
       WHERE client_id = $1
       GROUP BY status
       ORDER BY count DESC`,
      [clientId]
    );

    // Orders by city - use shipping_wilaya_id since shipping_city doesn't exist
    // Map wilaya IDs to names (Algeria wilayas)
    const cityBreakdownRes = await pool.query(
      `SELECT 
        CASE 
          WHEN shipping_wilaya_id IS NOT NULL THEN shipping_wilaya_id::text
          ELSE 'Not specified'
        END as city,
        shipping_wilaya_id,
        COUNT(*)::int as count,
        COALESCE(SUM(total_price), 0)::float as revenue
       FROM store_orders 
       WHERE client_id = $1
       GROUP BY shipping_wilaya_id
       ORDER BY count DESC
       LIMIT 10`,
      [clientId]
    );

    // Map wilaya IDs to names
    const algeriaWilayas: Record<number, string> = {
      1: 'Adrar', 2: 'Chlef', 3: 'Laghouat', 4: 'Oum El Bouaghi', 5: 'Batna',
      6: 'Béjaïa', 7: 'Biskra', 8: 'Béchar', 9: 'Blida', 10: 'Bouira',
      11: 'Tamanrasset', 12: 'Tébessa', 13: 'Tlemcen', 14: 'Tiaret', 15: 'Tizi Ouzou',
      16: 'Alger', 17: 'Djelfa', 18: 'Jijel', 19: 'Sétif', 20: 'Saïda',
      21: 'Skikda', 22: 'Sidi Bel Abbès', 23: 'Annaba', 24: 'Guelma', 25: 'Constantine',
      26: 'Médéa', 27: 'Mostaganem', 28: 'M\'Sila', 29: 'Mascara', 30: 'Ouargla',
      31: 'Oran', 32: 'El Bayadh', 33: 'Illizi', 34: 'Bordj Bou Arréridj', 35: 'Boumerdès',
      36: 'El Tarf', 37: 'Tindouf', 38: 'Tissemsilt', 39: 'El Oued', 40: 'Khenchela',
      41: 'Souk Ahras', 42: 'Tipaza', 43: 'Mila', 44: 'Aïn Defla', 45: 'Naâma',
      46: 'Aïn Témouchent', 47: 'Ghardaïa', 48: 'Relizane', 49: 'Timimoun', 50: 'Bordj Badji Mokhtar',
      51: 'Ouled Djellal', 52: 'Béni Abbès', 53: 'In Salah', 54: 'In Guezzam', 55: 'Touggourt',
      56: 'Djanet', 57: 'El M\'Ghair', 58: 'El Meniaa'
    };

    const cityBreakdown = cityBreakdownRes.rows.map(row => ({
      city: row.shipping_wilaya_id ? (algeriaWilayas[row.shipping_wilaya_id] || `Wilaya ${row.shipping_wilaya_id}`) : 'Not specified',
      count: row.count,
      revenue: row.revenue
    }));

    // Calculate growth percentages
    const calcGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const today = todayRes.rows[0] || { orders: 0, revenue: 0 };
    const yesterday = yesterdayRes.rows[0] || { orders: 0, revenue: 0 };
    const thisWeek = thisWeekRes.rows[0] || { orders: 0, revenue: 0 };
    const lastWeek = lastWeekRes.rows[0] || { orders: 0, revenue: 0 };
    const thisMonth = thisMonthRes.rows[0] || { orders: 0, revenue: 0 };
    const lastMonth = lastMonthRes.rows[0] || { orders: 0, revenue: 0 };

    res.json({
      dailyRevenue: dailyRevenueRes.rows,
      customStatuses: customStatusesRes.rows,
      comparisons: {
        today: {
          orders: today.orders,
          revenue: today.revenue,
          ordersGrowth: calcGrowth(today.orders, yesterday.orders),
          revenueGrowth: calcGrowth(today.revenue, yesterday.revenue),
        },
        thisWeek: {
          orders: thisWeek.orders,
          revenue: thisWeek.revenue,
          ordersGrowth: calcGrowth(thisWeek.orders, lastWeek.orders),
          revenueGrowth: calcGrowth(thisWeek.revenue, lastWeek.revenue),
        },
        thisMonth: {
          orders: thisMonth.orders,
          revenue: thisMonth.revenue,
          ordersGrowth: calcGrowth(thisMonth.orders, lastMonth.orders),
          revenueGrowth: calcGrowth(thisMonth.revenue, lastMonth.revenue),
        },
      },
      topProducts: topProductsRes.rows,
      recentOrders: recentOrdersRes.rows,
      statusBreakdown: statusBreakdownRes.rows,
      cityBreakdown: cityBreakdown,
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};
