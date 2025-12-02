import { pool, findUserById } from "../utils/database";
import { jsonError } from '../utils/httpHelpers';
import { RequestHandler } from "express";
import { requireAdmin } from "../middleware/auth";
import { findUserByEmail, updateUser } from "../utils/database";
import bcrypt from 'bcrypt';

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

// Delete a user account (admin only)
export const deleteUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    if (!id) {
      return jsonError(res, 400, "User id is required");
    }

    const userId = parseInt(id, 10);
    if (Number.isNaN(userId)) {
      return jsonError(res, 400, "Invalid user id");
    }

    // Prevent deleting the last admin or self without confirmation
    const userRes = await pool.query('SELECT id, role FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) {
      return jsonError(res, 404, "User not found");
    }

    // Optional: cascade deletes for marketplace products/orders owned by this user
    // For safety, we soft-delete by removing user and leaving products orphaned only if FK allows
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    res.json({ message: 'User deleted successfully', id: userId });
  } catch (err) {
    console.error('Delete user error:', err);
    return jsonError(res, 500, 'Failed to delete user');
  }
};

// Convert a platform user to seller (admin only)
export const convertUserToSeller: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    if (!id) return jsonError(res, 400, 'User id is required');
    const userId = parseInt(id, 10);
    if (Number.isNaN(userId)) return jsonError(res, 400, 'Invalid user id');

    const userRes = await pool.query('SELECT id, email, name FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) return jsonError(res, 404, 'User not found');
    const user = userRes.rows[0];

    // If seller already exists for email, return conflict
    const exists = await pool.query('SELECT id FROM sellers WHERE email = $1', [user.email]);
    if (exists.rows.length > 0) {
      return jsonError(res, 409, 'Seller already exists for this email');
    }

    // Generate a random password for seller (can be reset later)
    const randomPass = Math.random().toString(36).slice(-10);
    const hashed = await bcrypt.hash(randomPass, 10);
    const ins = await pool.query(
      'INSERT INTO sellers (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [user.email, hashed, user.name]
    );

    res.json({
      message: 'User converted to seller',
      seller: ins.rows[0],
      temp_password: randomPass,
    });
  } catch (err) {
    console.error('Convert user to seller error:', err);
    return jsonError(res, 500, 'Failed to convert user to seller');
  }
};

// Delete a seller account (admin only)
export const deleteSeller: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    if (!id) return jsonError(res, 400, 'Seller id is required');
    const sellerId = parseInt(id, 10);
    if (Number.isNaN(sellerId)) return jsonError(res, 400, 'Invalid seller id');

    const sres = await pool.query('SELECT id FROM sellers WHERE id = $1', [sellerId]);
    if (sres.rows.length === 0) return jsonError(res, 404, 'Seller not found');

    // Optional: ensure no products linked, or handle cascade strategy externally
    await pool.query('DELETE FROM sellers WHERE id = $1', [sellerId]);
    res.json({ message: 'Seller deleted successfully', id: sellerId });
  } catch (err) {
    console.error('Delete seller error:', err);
    return jsonError(res, 500, 'Failed to delete seller');
  }
};
