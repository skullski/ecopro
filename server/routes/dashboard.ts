import { RequestHandler } from "express";
import { pool } from "../utils/database";

// GET /api/dashboard/stats
// Aggregated metrics for the client/vendor dashboard
export const getDashboardStats: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user?.id;
    const [productsRes, ordersRes, revenueRes, pendingRes, completedRes] = await Promise.all([
      pool.query(
        `SELECT COUNT(*)::int AS products FROM client_store_products WHERE client_id = $1 AND status = 'active'`,
        [clientId]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS orders FROM marketplace_orders WHERE seller_id = $1`,
        [clientId]
      ),
      pool.query(
        `SELECT COALESCE(SUM(total_price),0)::float AS revenue FROM marketplace_orders WHERE status = 'completed' AND seller_id = $1`,
        [clientId]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS pending FROM marketplace_orders WHERE status = 'pending' AND seller_id = $1`,
        [clientId]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS completed FROM marketplace_orders WHERE status = 'completed' AND seller_id = $1`,
        [clientId]
      ),
    ]);

    const stats = {
      products: productsRes.rows[0]?.products ?? 0,
      orders: ordersRes.rows[0]?.orders ?? 0,
      revenue: revenueRes.rows[0]?.revenue ?? 0,
      pendingOrders: pendingRes.rows[0]?.pending ?? 0,
      completedOrders: completedRes.rows[0]?.completed ?? 0,
      visitors: 0, // Placeholder until real tracking added
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
