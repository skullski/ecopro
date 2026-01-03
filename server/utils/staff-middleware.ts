import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { ensureConnection } from './database';
import { getJwtSecret } from './auth';

/**
 * STAFF AUTHENTICATION MIDDLEWARE
 * 
 * Validates staff member has:
 * 1. Valid JWT token with staffId + clientId
 * 2. Active status in database
 * 3. Store assignment (clientId)
 * 
 * Sets req.user with staff identity for use in handlers
 */
export const authenticateStaff: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const headerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const cookies = (req as any).cookies as Record<string, string | undefined> | undefined;
    const cookieToken = cookies?.ecopro_staff_at || cookies?.ecopro_at;
    const token = cookieToken || headerToken;
    if (!token) {
      return res.status(401).json({ error: 'No authorization token' });
    }
    const decoded: any = jwt.verify(token, getJwtSecret());

    // Verify staff identity
    const staffId = decoded.staffId || decoded.staff_id || decoded.id;
    const clientId = decoded.clientId || decoded.client_id;
    if (!staffId || !clientId || decoded.isStaff !== true) {
      return res.status(401).json({ error: 'Invalid staff token format' });
    }

    // Verify staff member exists and is active
    const pool = await ensureConnection();
    const result = await pool.query(
      'SELECT id, client_id, status FROM staff WHERE id = $1 AND client_id = $2',
      [staffId, clientId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Staff member not found' });
    }

    const staff = result.rows[0];
    if (staff.status !== 'active') {
      return res.status(403).json({ error: 'Staff member account is not active' });
    }

    // Enforce subscription/payment lock of the parent client.
    try {
      const lockRes = await pool.query(
        `SELECT is_locked, locked_reason, lock_type
         FROM clients
         WHERE id = $1`,
        [clientId]
      );
      if (lockRes.rows.length) {
        const row = lockRes.rows[0];
        const lockType = row.lock_type || (typeof row.locked_reason === 'string' && /(subscription|expired|payment|trial|billing)/i.test(row.locked_reason)
          ? 'payment'
          : 'critical');
        if (row.is_locked && lockType === 'payment') {
          return res.status(403).json({
            error: row.locked_reason || 'Subscription expired. Your store access is temporarily disabled.',
            accountLocked: true,
            paymentRequired: true,
            code: 'SUBSCRIPTION_EXPIRED',
          });
        }
      }
    } catch {
      // If we cannot validate lock status, fail closed for staff.
      return res.status(503).json({ error: 'Unable to validate store subscription status' });
    }

    // Attach staff info to request - cast to any to bypass type checking since staff is not in standard Express.Request.user
    (req as any).user = {
      staffId,
      clientId,
      email: decoded.email,
      isStaff: true,
      role: decoded.role,
      id: staffId,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    const isProduction = process.env.NODE_ENV === 'production';
    console.error('Staff auth error:', isProduction ? (error as any)?.message : error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * STAFF PERMISSION CHECK MIDDLEWARE
 * 
 * Ensures staff member has specific permission
 * Must be used AFTER authenticateStaff middleware
 * 
 * Usage: app.get('/endpoint', authenticateStaff, requireStaffPermission('view_orders'), handler)
 */
export function requireStaffPermission(permission: string): RequestHandler {
  return async (req, res, next) => {
    try {
      const staffId = req.user?.staffId;
      const clientId = req.user?.clientId;

      if (!staffId || !clientId) {
        return res.status(401).json({ error: 'Invalid authentication' });
      }

      const pool = await ensureConnection();
      const result = await pool.query(
        'SELECT permissions FROM staff WHERE id = $1 AND client_id = $2',
        [staffId, clientId]
      );

      if (result.rows.length === 0) {
        return res.status(403).json({ error: 'Staff member not found' });
      }

      const permissions = typeof result.rows[0].permissions === 'string'
        ? JSON.parse(result.rows[0].permissions)
        : result.rows[0].permissions;

      // Backward-compatible permission aliases
      // The UI uses shared/staff.ts keys (e.g. view_orders_list, edit_order_status),
      // while some older routes/middleware used legacy keys (e.g. view_orders, edit_orders).
      const permissionAliases: Record<string, string[]> = {
        view_orders: ['view_orders_list'],
        edit_orders: ['edit_order_status'],
      };

      const hasDirect = permissions?.[permission] === true;
      const hasAlias = (permissionAliases[permission] || []).some((p) => permissions?.[p] === true);
      if (!hasDirect && !hasAlias) {
        return res.status(403).json({ error: `Permission denied: ${permission}` });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

/**
 * STAFF CLIENT ISOLATION MIDDLEWARE
 * 
 * Ensures staff can only access data from their assigned store (clientId)
 * Prevents staff from accessing another store's data through URL manipulation
 * 
 * Usage: app.get('/store/:clientId/orders', authenticateStaff, requireStaffClientAccess('clientId'), handler)
 */
export function requireStaffClientAccess(paramName: string = 'clientId'): RequestHandler {
  return (req, res, next) => {
    try {
      const staffClientId = req.user?.clientId;
      const requestedClientId = parseInt(req.params[paramName], 10);

      if (!staffClientId) {
        return res.status(401).json({ error: 'Invalid authentication' });
      }

      if (staffClientId !== requestedClientId) {
        console.warn(
          `[Security] Staff ${req.user?.staffId} attempted to access store ${requestedClientId}, ` +
          `but they belong to store ${staffClientId}`
        );
        return res.status(403).json({ error: 'You do not have access to this store' });
      }

      next();
    } catch (error) {
      console.error('Client access check error:', error);
      res.status(403).json({ error: 'Access denied' });
    }
  };
}