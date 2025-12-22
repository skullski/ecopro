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
    
    // Get from both admins and clients tables with is_locked status
    const result = await pool.query(`
      SELECT 
        id, 
        email, 
        full_name as name, 
        role, 
        'admin' as user_type, 
        created_at,
        COALESCE(is_locked, false) as is_locked,
        locked_reason,
        locked_at
      FROM admins
      UNION ALL
      SELECT 
        id, 
        email, 
        name, 
        role, 
        'client' as user_type, 
        created_at,
        COALESCE(is_locked, false) as is_locked,
        locked_reason,
        locked_at
      FROM clients
      ORDER BY created_at DESC
    `);
    
    res.json(result.rows);
  } catch (err) {
    console.error('listUsers error:', err);
    return jsonError(res, 500, `Failed to list users: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
};

// Get platform statistics (fast aggregated query)
export const getPlatformStats: RequestHandler = async (_req, res) => {
  try {
    const { pool } = await import("../utils/database");
    
    // Run all count queries in parallel for speed
    const [usersResult, subscriptionsResult, codesResult, newSignupsResult] = await Promise.all([
      pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM admins) + (SELECT COUNT(*) FROM clients) as total_users,
          (SELECT COUNT(*) FROM clients) as total_clients,
          (SELECT COUNT(*) FROM admins WHERE role = 'admin') as total_admins,
          (SELECT COUNT(*) FROM clients WHERE is_locked = true) as locked_accounts
      `),
      pool.query(`
        SELECT 
          COUNT(*) as total_subscriptions,
          COUNT(*) FILTER (WHERE status = 'active') as active_subscriptions,
          COUNT(*) FILTER (WHERE status = 'trial') as trial_subscriptions,
          COUNT(*) FILTER (WHERE status = 'expired' OR status = 'cancelled') as expired_subscriptions
        FROM subscriptions
      `).catch(() => ({ rows: [{ total_subscriptions: 0, active_subscriptions: 0, trial_subscriptions: 0, expired_subscriptions: 0 }] })),
      pool.query(`
        SELECT 
          COUNT(*) as total_codes,
          COUNT(*) FILTER (WHERE status = 'used') as redeemed_codes,
          COUNT(*) FILTER (WHERE status = 'pending' OR status = 'issued') as pending_codes,
          COUNT(*) FILTER (WHERE status = 'expired') as expired_codes
        FROM code_requests
      `).catch(() => ({ rows: [{ total_codes: 0, redeemed_codes: 0, pending_codes: 0, expired_codes: 0 }] })),
      pool.query(`
        SELECT 
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_signups_week,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_signups_month
        FROM clients
      `).catch(() => ({ rows: [{ new_signups_week: 0, new_signups_month: 0 }] })),
    ]);

    res.json({
      totalUsers: parseInt(usersResult.rows[0].total_users),
      totalClients: parseInt(usersResult.rows[0].total_clients),
      totalAdmins: parseInt(usersResult.rows[0].total_admins),
      lockedAccounts: parseInt(usersResult.rows[0].locked_accounts),
      activeSubscriptions: parseInt(subscriptionsResult.rows[0].active_subscriptions),
      trialSubscriptions: parseInt(subscriptionsResult.rows[0].trial_subscriptions),
      expiredSubscriptions: parseInt(subscriptionsResult.rows[0].expired_subscriptions),
      totalCodes: parseInt(codesResult.rows[0].total_codes),
      redeemedCodes: parseInt(codesResult.rows[0].redeemed_codes),
      pendingCodes: parseInt(codesResult.rows[0].pending_codes),
      expiredCodes: parseInt(codesResult.rows[0].expired_codes),
      newSignupsWeek: parseInt(newSignupsResult.rows[0].new_signups_week),
      newSignupsMonth: parseInt(newSignupsResult.rows[0].new_signups_month),
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
    const { email, user_type } = req.body;
    
    if (!id) {
      return jsonError(res, 400, "User id is required");
    }

    const userId = parseInt(id, 10);
    if (Number.isNaN(userId)) {
      return jsonError(res, 400, "Invalid user id");
    }

    // Prevent deleting the last admin
    // If user_type is provided, use it to determine the table
    let userRes: any;
    let tableToDelete = 'admins';
    let isAdmin = false;
    let userEmail = '';
    
    if (user_type === 'client') {
      // If explicitly told it's a client, look in clients table only
      userRes = await pool.query('SELECT id, role, user_type, email FROM clients WHERE id = $1', [userId]);
      tableToDelete = 'clients';
    } else if (user_type === 'admin') {
      // If explicitly told it's an admin, look in admins table only
      userRes = await pool.query('SELECT id, role, user_type, email FROM admins WHERE id = $1', [userId]);
      tableToDelete = 'admins';
      isAdmin = true;
    } else {
      // Fallback: check both tables (admins first, then clients)
      userRes = await pool.query('SELECT id, role, user_type, email FROM admins WHERE id = $1', [userId]);
      if (userRes.rows.length === 0) {
        userRes = await pool.query('SELECT id, role, user_type, email FROM clients WHERE id = $1', [userId]);
        tableToDelete = 'clients';
      } else {
        isAdmin = true;
      }
    }
    
    if (userRes.rows.length === 0) {
      return jsonError(res, 404, "User not found");
    }

    // Get the user's email for protection check
    userEmail = userRes.rows[0].email || '';

    // Protect the default admin account - check by email
    if (userEmail === 'admin@ecopro.com') {
      console.log(`Attempt to delete protected admin account: ${userEmail}`);
      return jsonError(res, 400, 'Cannot delete the default admin account');
    }
    
    // Only check admin count if actually deleting from admins table
    if (isAdmin) {
      const adminsCountRes = await pool.query("SELECT COUNT(*)::int AS cnt FROM admins WHERE role='admin'");
      const adminsCount = adminsCountRes.rows[0].cnt;
      if (adminsCount <= 1) {
        return jsonError(res, 400, 'Cannot delete the last admin');
      }
    }

    // Delete from appropriate table
    await pool.query(`DELETE FROM ${tableToDelete} WHERE id = $1`, [userId]);

    // Audit log
    const actorId = (req as any).user?.id ? parseInt((req as any).user.id, 10) : null;
    const targetRole = userRes.rows[0].role;
    if (actorId) {
      await pool.query(
        'INSERT INTO audit_logs(actor_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
        [actorId, 'delete_user', 'user', userId, JSON.stringify({ role: targetRole, table: tableToDelete })]
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
        c.id, c.email, c.name as store_name,
        COALESCE(css.store_slug, '') as store_slug,
        'active' as subscription_status,
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
        COALESCE(c.name, c.email) as seller_name,
        c.email as seller_email,
        COALESCE(p.views, 0) as views, p.created_at,
        p.images
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

// Flag a product for review/moderation (admin only)
export const flagProduct: RequestHandler = async (req, res) => {
  try {
    const { productId, reason, description } = req.body;
    const adminId = (req.user as any)?.id;

    if (!adminId) {
      return jsonError(res, 401, "Not authenticated");
    }

    if (!productId || !reason) {
      return jsonError(res, 400, "Product ID and reason are required");
    }

    // Get product info first
    const productResult = await pool.query(
      'SELECT client_id FROM client_store_products WHERE id = $1',
      [productId]
    );

    if (productResult.rows.length === 0) {
      return jsonError(res, 404, "Product not found");
    }

    const clientId = productResult.rows[0].client_id;

    // Insert flag record
    await pool.query(
      `INSERT INTO flagged_products (product_id, client_id, flagged_by, reason, description, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')`,
      [productId, clientId, adminId, reason, description]
    );

    // Update product to mark as flagged
    await pool.query(
      'UPDATE client_store_products SET is_flagged = true, flag_reason = $1 WHERE id = $2',
      [reason, productId]
    );

    res.json({ message: "Product flagged for review" });
  } catch (err) {
    console.error('Failed to flag product:', err);
    return jsonError(res, 500, "Failed to flag product");
  }
};

// Unflag a product (admin only)
export const unflagProduct: RequestHandler = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return jsonError(res, 400, "Product ID is required");
    }

    // Update flag records
    await pool.query(
      'UPDATE flagged_products SET status = $1, resolved_at = NOW() WHERE product_id = $2 AND status = $3',
      ['dismissed', productId, 'pending']
    );

    // Update product to unmark as flagged
    await pool.query(
      'UPDATE client_store_products SET is_flagged = false, flag_reason = NULL WHERE id = $1',
      [productId]
    );

    res.json({ message: "Product unflagged" });
  } catch (err) {
    console.error('Failed to unflag product:', err);
    return jsonError(res, 500, "Failed to unflag product");
  }
};
// Lock a user account (prevent login)
export const lockUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const { reason } = req.body;

    if (!id) {
      return jsonError(res, 400, "User ID is required");
    }

    const userId = parseInt(id, 10);
    if (Number.isNaN(userId)) {
      return jsonError(res, 400, "Invalid user ID");
    }

    // Check if user exists and get their email
    let userRes = await pool.query('SELECT id, email FROM admins WHERE id = $1', [userId]);
    
    if (userRes.rows.length === 0) {
      userRes = await pool.query('SELECT id, email FROM clients WHERE id = $1', [userId]);
    }

    if (userRes.rows.length === 0) {
      return jsonError(res, 404, "User not found");
    }

    // Protect the default admin account
    const userEmail = userRes.rows[0].email;
    if (userEmail === 'admin@ecopro.com') {
      return jsonError(res, 400, 'Cannot lock the default admin account');
    }

    const adminId = (req as any).user?.id ? parseInt((req as any).user.id, 10) : null;

    // Try locking in admins table first, then clients
    let result = await pool.query(
      `UPDATE admins SET is_locked = true, locked_reason = $1, locked_at = NOW(), locked_by_admin_id = $2 WHERE id = $3`,
      [reason || 'Account locked by admin', adminId, userId]
    );

    if (result.rowCount === 0) {
      result = await pool.query(
        `UPDATE clients SET is_locked = true, locked_reason = $1, locked_at = NOW(), locked_by_admin_id = $2 WHERE id = $3`,
        [reason || 'Account locked by admin', adminId, userId]
      );
    }

    if (result.rowCount === 0) {
      return jsonError(res, 404, "User not found");
    }

    res.json({ message: "User account locked successfully" });
  } catch (err) {
    console.error('Lock user error:', err);
    return jsonError(res, 500, "Failed to lock user account");
  }
};

// Unlock a user account (allow login again)
export const unlockUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params as { id: string };

    if (!id) {
      return jsonError(res, 400, "User ID is required");
    }

    const userId = parseInt(id, 10);
    if (Number.isNaN(userId)) {
      return jsonError(res, 400, "Invalid user ID");
    }

    // Try unlocking in admins table first, then clients
    let result = await pool.query(
      `UPDATE admins SET is_locked = false, locked_reason = NULL, locked_at = NULL, locked_by_admin_id = NULL WHERE id = $1`,
      [userId]
    );

    if (result.rowCount === 0) {
      result = await pool.query(
        `UPDATE clients SET is_locked = false, locked_reason = NULL, locked_at = NULL, locked_by_admin_id = NULL WHERE id = $1`,
        [userId]
      );
    }

    if (result.rowCount === 0) {
      return jsonError(res, 404, "User not found");
    }

    res.json({ message: "User account unlocked successfully" });
  } catch (err) {
    console.error('Unlock user error:', err);
    return jsonError(res, 500, "Failed to unlock user account");
  }
};

/**
 * Get all locked accounts (for admin Tools page)
 */
export const getLockedAccounts: RequestHandler = async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        email, 
        name,
        locked_reason,
        locked_at,
        locked_by_admin_id,
        subscription_ends_at,
        created_at
      FROM clients
      WHERE is_locked = true
      ORDER BY locked_at DESC
    `);

    res.json({ accounts: result.rows });
  } catch (err) {
    console.error('Get locked accounts error:', err);
    return jsonError(res, 500, "Failed to fetch locked accounts");
  }
};

/**
 * Unlock account with options: extend subscription or mark as paid temporarily
 * POST /api/admin/unlock-account
 * Body: { client_id, unlock_reason, action: 'extend' | 'mark_paid', days?: number }
 */
export const unlockAccountWithOptions: RequestHandler = async (req, res) => {
  try {
    const adminUser = (req as any).user;
    if (!adminUser || adminUser.role !== 'admin') {
      return jsonError(res, 403, "Only admins can unlock accounts");
    }

    const { client_id, unlock_reason, action, days } = req.body;

    if (!client_id || !unlock_reason || !action) {
      return jsonError(res, 400, "client_id, unlock_reason, and action are required");
    }

    if (action !== 'extend' && action !== 'mark_paid') {
      return jsonError(res, 400, "action must be 'extend' or 'mark_paid'");
    }

    if (action === 'extend' && (!days || days < 1 || days > 365)) {
      return jsonError(res, 400, "days must be between 1 and 365 for extend action");
    }

    const clientId = parseInt(client_id, 10);
    if (Number.isNaN(clientId)) {
      return jsonError(res, 400, "Invalid client_id");
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get current client
      const clientResult = await client.query(
        'SELECT * FROM clients WHERE id = $1',
        [clientId]
      );

      if (clientResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return jsonError(res, 404, "Client not found");
      }

      const currentClient = clientResult.rows[0];

      // Prepare update fields
      let updateFields = `
        is_locked = false,
        locked_reason = NULL,
        locked_at = NULL,
        locked_by_admin_id = NULL,
        unlocked_by_admin_id = $2,
        unlock_reason = $3,
        unlocked_at = NOW()
      `;
      let params: any[] = [clientId, adminUser.id, unlock_reason];

      // Handle action-specific updates
      if (action === 'extend') {
        const extendUntil = new Date();
        extendUntil.setDate(extendUntil.getDate() + days);
        updateFields += `, subscription_extended_until = $4, is_paid_temporarily = false`;
        params.push(extendUntil);
      } else if (action === 'mark_paid') {
        updateFields += `, is_paid_temporarily = true`;
        // Set paid temporarily until some future date (e.g., 30 days)
        const paidUntil = new Date();
        paidUntil.setDate(paidUntil.getDate() + 30);
        updateFields += `, subscription_extended_until = $4`;
        params.push(paidUntil);
      }

      // Update client
      await client.query(
        `UPDATE clients SET ${updateFields} WHERE id = $1`,
        params
      );

      await client.query('COMMIT');

      res.json({
        message: "Account unlocked successfully",
        action,
        unlock_reason,
        extended_days: action === 'extend' ? days : null,
        marked_paid_temporarily: action === 'mark_paid'
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Unlock account with options error:', err);
    return jsonError(res, 500, "Failed to unlock account");
  }
};