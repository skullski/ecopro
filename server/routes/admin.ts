import { pool, findUserById } from "../utils/database";
import { jsonError } from '../utils/httpHelpers';
import { RequestHandler } from "express";
import { requireAdmin } from "../middleware/auth";
import { findUserByEmail, updateUser } from "../utils/database";

// Promote a user to admin
export const promoteUserToAdmin: RequestHandler = async (req, res) => {
  try {
    // Only platform admins may call this endpoint
    // Middleware requireAdmin will enforce this

    const { email } = req.body;
    if (!email) {
      return jsonError(res, 400, "Email is required");
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return jsonError(res, 404, "User not found");
    }

    const updated = await updateUser(user.id, { role: "admin" });
    res.json({ message: "User promoted to admin", user: { id: updated.id, email: updated.email, role: updated.role } });
  } catch (err) {
    console.error(err);
    return jsonError(res, 500, "Failed to promote user");
  }
};

// List all users (platform admin only)
export const listUsers: RequestHandler = async (_req, res) => {
  try {
    const { pool } = await import("../utils/database");
    const result = await pool.query("SELECT id, email, name, role, user_type, created_at FROM users ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    return jsonError(res, 500, "Failed to list users");
  }
};

// Get platform statistics (fast aggregated query)
export const getPlatformStats: RequestHandler = async (_req, res) => {
  try {
    const { pool } = await import("../utils/database");
    
    // Run all count queries in parallel for speed
    const [usersResult, productsResult, ordersResult] = await Promise.all([
      pool.query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(*) FILTER (WHERE user_type = 'client') as total_clients,
          COUNT(*) FILTER (WHERE user_type = 'seller') as total_sellers
        FROM users
      `),
      pool.query(`
        SELECT 
          COUNT(*) as total_products,
          COUNT(*) FILTER (WHERE status = 'active') as active_products
        FROM marketplace_products
      `),
      pool.query(`
        SELECT 
          COUNT(*) as total_orders,
          COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
          COALESCE(SUM(total_price), 0) as total_revenue
        FROM marketplace_orders
      `).catch(() => ({ rows: [{ total_orders: 0, pending_orders: 0, total_revenue: 0 }] })),
    ]);

    res.json({
      totalUsers: parseInt(usersResult.rows[0].total_users),
      totalClients: parseInt(usersResult.rows[0].total_clients),
      totalSellers: parseInt(usersResult.rows[0].total_sellers),
      totalProducts: parseInt(productsResult.rows[0].total_products),
      activeProducts: parseInt(productsResult.rows[0].active_products),
      totalOrders: parseInt(ordersResult.rows[0].total_orders),
      pendingOrders: parseInt(ordersResult.rows[0].pending_orders),
      totalRevenue: parseFloat(ordersResult.rows[0].total_revenue),
    });
  } catch (err) {
    console.error('Get stats error:', err);
    return jsonError(res, 500, "Failed to get platform stats");
  }
};
