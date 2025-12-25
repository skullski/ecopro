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

    // Daily revenue for last 30 days (show all orders revenue regardless of status)
    const dailyRevenueRes = await pool.query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*)::int as orders,
        COALESCE(SUM(total_price), 0)::float as revenue
       FROM store_orders 
       WHERE client_id = $1 AND created_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [clientId]
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

    // Top selling products
    const topProductsRes = await pool.query(
      `SELECT 
        p.id, p.title, p.price, p.image_url,
        COUNT(o.id)::int as total_orders,
        COALESCE(SUM(o.quantity), 0)::int as total_quantity,
        COALESCE(SUM(o.total_price), 0)::float as total_revenue
       FROM client_store_products p
       LEFT JOIN store_orders o ON o.product_id = p.id AND o.client_id = $1
       WHERE p.client_id = $1
       GROUP BY p.id, p.title, p.price, p.image_url
       ORDER BY total_orders DESC
       LIMIT 5`,
      [clientId]
    );

    // Recent orders
    const recentOrdersRes = await pool.query(
      `SELECT 
        id, customer_name, customer_phone, total_price, status, created_at, product_title
       FROM store_orders 
       WHERE client_id = $1 
       ORDER BY created_at DESC 
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

    // Orders by city
    const cityBreakdownRes = await pool.query(
      `SELECT 
        COALESCE(NULLIF(TRIM(shipping_city), ''), 'Not specified') as city,
        COUNT(*)::int as count,
        COALESCE(SUM(total_price), 0)::float as revenue
       FROM store_orders 
       WHERE client_id = $1
       GROUP BY COALESCE(NULLIF(TRIM(shipping_city), ''), 'Not specified')
       ORDER BY count DESC
       LIMIT 10`,
      [clientId]
    );

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
      cityBreakdown: cityBreakdownRes.rows,
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};
