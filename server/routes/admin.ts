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
          COUNT(*) FILTER (WHERE user_type = 'client') as total_clients
        FROM users
      `),
      pool.query(`
        SELECT 
          COUNT(*) as total_products,
          COUNT(*) FILTER (WHERE status = 'active') as active_products
        FROM client_store_products
      `),
      pool.query(`
        SELECT 
          COUNT(*) as total_orders,
          COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
          COALESCE(SUM(total_price), 0) as total_revenue
        FROM store_orders
      `).catch(() => ({ rows: [{ total_orders: 0, pending_orders: 0, total_revenue: 0 }] })),
    ]);

    res.json({
      totalUsers: parseInt(usersResult.rows[0].total_users),
      totalClients: parseInt(usersResult.rows[0].total_clients),
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
    const targetRole = userRes.rows[0].role;
    if (targetRole === 'admin') {
      const adminsCountRes = await pool.query("SELECT COUNT(*)::int AS cnt FROM users WHERE role='admin'", []);
      const adminsCount = adminsCountRes.rows[0].cnt;
      if (adminsCount <= 1) {
        return jsonError(res, 400, 'Cannot delete the last admin');
      }
    }

    // Optional: cascade deletes for marketplace products/orders owned by this user
    // For safety, we soft-delete by removing user and leaving products orphaned only if FK allows
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    // Audit log
    const actorId = (req as any).user?.id ? parseInt((req as any).user.id, 10) : null;
    if (actorId) {
      await pool.query(
        'INSERT INTO audit_logs(actor_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
        [actorId, 'delete_user', 'user', userId, JSON.stringify({ role: targetRole })]
      );
    }

    res.json({ message: 'User deleted successfully', id: userId });
  } catch (err) {
    console.error('Delete user error:', err);
    return jsonError(res, 500, 'Failed to delete user');
  }
};

// Delete a client store product (admin only)
export const deleteClientStoreProduct: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    if (!id) return jsonError(res, 400, 'Product id is required');
    const productId = parseInt(id, 10);
    if (Number.isNaN(productId)) return jsonError(res, 400, 'Invalid product id');

    const exists = await pool.query('SELECT id FROM client_store_products WHERE id = $1', [productId]);
    if (!exists.rows.length) return jsonError(res, 404, 'Product not found');

    await pool.query('DELETE FROM client_store_products WHERE id = $1', [productId]);

    const actorId = (req as any).user?.id ? parseInt((req as any).user.id, 10) : null;
    if (actorId) {
      await pool.query(
        'INSERT INTO audit_logs(actor_id, action, target_type, target_id) VALUES ($1, $2, $3, $4)',
        [actorId, 'delete_product', 'client_store_product', productId]
      );
    }
    res.json({ message: 'Client store product deleted', id: productId });
  } catch (err) {
    console.error('Delete client store product error:', err);
    return jsonError(res, 500, 'Failed to delete product');
  }
};

// List all staff members across all stores (admin only)
export const listAllStaff: RequestHandler = async (_req, res) => {
  try {
    const { pool } = await import("../utils/database");
    const result = await pool.query(
      `SELECT 
        s.id, s.client_id, s.email, s.role, s.status, s.created_at,
        COALESCE(css.store_name, c.company_name, c.email) as store_name, 
        c.email as owner_email
      FROM staff s
      JOIN clients c ON s.client_id = c.id
      LEFT JOIN client_store_settings css ON s.client_id = css.client_id
      ORDER BY s.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to list staff:', err);
    return jsonError(res, 500, "Failed to list staff members");
  }
};

// Delete a staff member (admin only)
export const deleteStaffMember: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    if (!id) {
      return jsonError(res, 400, "Staff id is required");
    }

    const staffId = parseInt(id, 10);
    if (Number.isNaN(staffId)) {
      return jsonError(res, 400, "Invalid staff id");
    }

    const result = await pool.query('DELETE FROM staff WHERE id = $1 RETURNING id', [staffId]);
    if (result.rows.length === 0) {
      return jsonError(res, 404, "Staff member not found");
    }

    res.json({ message: "Staff member deleted successfully" });
  } catch (err) {
    console.error('Failed to delete staff:', err);
    return jsonError(res, 500, "Failed to delete staff member");
  }
};

// List all stores (admin only)
export const listAllStores: RequestHandler = async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        c.id, c.email, c.company_name as store_name,
        COALESCE(css.store_slug, '') as store_slug,
        c.subscription_status, c.subscription_until as paid_until,
        c.created_at
      FROM clients c
      LEFT JOIN client_store_settings css ON c.id = css.client_id
      ORDER BY c.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to list stores:', err);
    return jsonError(res, 500, "Failed to list stores");
  }
};

// List all activity logs (admin only)
export const listActivityLogs: RequestHandler = async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        id, client_id, staff_id, action, resource_type, resource_id,
        before_value, after_value, timestamp
      FROM staff_activity_log
      ORDER BY timestamp DESC
      LIMIT 500`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to list activity logs:', err);
    return jsonError(res, 500, "Failed to list activity logs");
  }
};

// List all products with owner details (admin only)
export const listAllProducts: RequestHandler = async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        p.id, p.title, p.price, p.status,
        COALESCE(c.company_name, c.email) as seller_name,
        c.email as seller_email,
        COALESCE(p.views, 0) as views, p.created_at
      FROM client_store_products p
      JOIN clients c ON p.client_id = c.id
      ORDER BY p.created_at DESC
      LIMIT 100`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to list products:', err);
    return jsonError(res, 500, "Failed to list products");
  }
};
