import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { ensureConnection } from '../utils/database';
import { hashPassword, generateSecurePassword, comparePassword } from '../utils/auth';
import { StaffMember, ActivityLog } from '@shared/staff';
import { checkLoginAllowed, recordFailedLogin, recordSuccessfulLogin } from '../utils/brute-force';
import { getClientIp } from '../utils/security';

/**
 * CRITICAL SECURITY NOTE:
 * Staff members have COMPLETELY SEPARATE authentication from clients/store owners
 * Staff table is independent with its own email/password
 * A staff member can NEVER login as a store owner
 * All staff actions are logged for audit trails
 */

// Create new staff member with username and password
export const createStaff: RequestHandler = async (req, res) => {
  try {
    const pool = await ensureConnection();
    const { username, password, role, permissions } = req.body;
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    
    // Get client ID from user (client = store owner) - link by email since that's how users and clients are related
    const clientResult = await pool.query(
      'SELECT id FROM clients WHERE email = $1 LIMIT 1',
      [userEmail]
    );
    
    if (clientResult.rows.length === 0) {
      return res.status(401).json({ error: 'No store found' });
    }
    
    const clientId = clientResult.rows[0].id;

    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if staff already exists for this client with this username (email)
    const existing = await pool.query(
      'SELECT id FROM staff WHERE client_id = $1 AND email = $2',
      [clientId, username]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'A staff member with this email already exists' });
    }

    // Hash the provided password
    const passwordHash = await hashPassword(password);

    // Create staff record in STAFF table (completely separate from clients)
    let result;
    try {
      result = await pool.query(
        `INSERT INTO staff 
          (client_id, email, password, role, status, permissions, created_by, invited_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
          RETURNING id, email, role, status`,
        [clientId, username, passwordHash, role, 'active', JSON.stringify(permissions || {}), clientId]
      );
    } catch (dbError: any) {
      console.error('Error creating staff record:', dbError);
      
      if (dbError.code === '42P01') {
        return res.status(500).json({ error: 'Database not initialized - staff table missing' });
      }
      
      throw dbError;
    }

    const staffId = result.rows[0].id;

    // Log activity (non-blocking)
    try {
      await logActivity(clientId, staffId, 'staff_created', 'staff', staffId, username);
    } catch (logError) {
      console.warn('Failed to log activity:', logError);
    }

    res.json({
      message: 'Staff member created successfully',
      staff: {
        id: staffId,
        email: username,
        role,
        status: 'active',
        permissions: permissions || {},
      },
    });
  } catch (error) {
    console.error('[Staff] Create staff error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: 'Failed to create staff', message: errorMessage });
  }
};

// Invite new staff member with permissions
export const inviteStaff: RequestHandler = async (req, res) => {
  try {
    const pool = await ensureConnection();
    const { email, role, permissions } = req.body;
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    
    // Get client ID from authenticated user - link by email
    const clientResult = await pool.query(
      'SELECT id FROM clients WHERE email = $1 LIMIT 1',
      [userEmail]
    );
    
    if (clientResult.rows.length === 0) {
      return res.status(401).json({ error: 'No store found' });
    }
    
    const clientId = clientResult.rows[0].id;

    if (!email || !role || !permissions) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if staff already exists for this client
    const existing = await pool.query(
      'SELECT id FROM staff WHERE client_id = $1 AND email = $2',
      [clientId, email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Staff member already exists with this email' });
    }

    // Generate temporary password for staff
    const tempPassword = generateSecurePassword();
    const passwordHash = await hashPassword(tempPassword);

    // Create staff record
    const result = await pool.query(
      `INSERT INTO staff 
        (client_id, email, password, role, status, permissions, created_by, invited_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING id`,
      [clientId, email, passwordHash, role || 'staff', 'pending', JSON.stringify(permissions || {}), clientId]
    );

    const staffId = result.rows[0].id;

    // TODO: Send invitation email with credentials
    // await sendEmail({...})

    // Log activity (non-blocking)
    try {
      await logActivity(clientId, staffId, 'staff_invited', 'staff', staffId, email);
    } catch (logError) {
      console.warn('Failed to log activity:', logError);
    }

    // Return temporary password ONLY in creation response (one-time display)
    res.json({
      message: 'Staff member invited successfully',
      tempPassword,
      staff: {
        id: staffId,
        email,
        role,
        status: 'pending',
        permissions,
      },
    });
  } catch (error) {
    console.error('Invite staff error:', error);
    res.status(500).json({ error: 'Failed to invite staff' });
  }
};

// Get all staff for a client
export const getStaffList: RequestHandler = async (req, res) => {
  console.log('[Staff] getStaffList called');
  
  try {
    res.setHeader('Content-Type', 'application/json');
    const pool = await ensureConnection();
    
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    console.log('[Staff] userId:', userId, 'email:', userEmail);
    
    if (!userEmail) {
      console.log('[Staff] No userEmail found');
      return res.status(401).json({ error: 'User email not found in token' });
    }

    console.log('[Staff] Querying clients for user:', userEmail);
    const clientResult = await pool.query(
      'SELECT id FROM clients WHERE email = $1 LIMIT 1',
      [userEmail]
    );
    console.log('[Staff] Client result rows:', clientResult.rows.length);

    if (clientResult.rows.length === 0) {
      console.log('[Staff] No client found, returning empty array');
      return res.json([]);
    }

    const clientId = clientResult.rows[0].id;
    console.log('[Staff] Found client:', clientId);

    console.log('[Staff] Querying staff table');
    const result = await pool.query(
      `SELECT 
        id, client_id, email, full_name, role, status, permissions,
        last_login, invited_at, activated_at, created_at
      FROM staff 
      WHERE client_id = $1
      ORDER BY created_at DESC`,
      [clientId]
    );
    
    console.log('[Staff] Query result:', result.rows.length, 'rows');

    const formatted = result.rows.map((s: any) => ({
      ...s,
      permissions: typeof s.permissions === 'string' ? JSON.parse(s.permissions) : s.permissions,
    }));

    console.log('[Staff] Sending response with', formatted.length, 'items');
    return res.json(formatted);
    
  } catch (error: any) {
    console.error('[Staff] CATCH ERROR:', error.message);
    console.error('[Staff] Error stack:', error.stack);
    console.error('[Staff] Error code:', error.code);
    
    // Always return valid JSON
    return res.status(500).json({ 
      error: 'Failed to get staff list', 
      message: error?.message || 'Unknown error',
      code: error?.code || 'UNKNOWN'
    });
  }
};

// Update staff permissions (instant apply)
export const updateStaffPermissions: RequestHandler = async (req, res) => {
  try {
    const pool = await ensureConnection();
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    const staffId = parseInt(req.params.id);
    const { permissions } = req.body;

    // Get client ID from user (client = store owner) - link by email
    const clientResult = await pool.query(
      'SELECT id FROM clients WHERE email = $1 LIMIT 1',
      [userEmail]
    );

    if (clientResult.rows.length === 0) {
      return res.status(401).json({ error: 'No store found' });
    }

    const clientId = clientResult.rows[0].id;

    // Verify this staff belongs to the client
    const staff = await pool.query(
      'SELECT id FROM staff WHERE id = $1 AND client_id = $2',
      [staffId, clientId]
    );

    if (staff.rows.length === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    // Update permissions
    await pool.query(
      'UPDATE staff SET permissions = $1, updated_at = NOW() WHERE id = $2',
      [JSON.stringify(permissions), staffId]
    );

    // Log activity (non-blocking)
    try {
      await logActivity(clientId, staffId, 'permissions_updated', 'staff', staffId);
    } catch (logError) {
      console.warn('Failed to log activity:', logError);
    }

    res.json({ message: 'Permissions updated successfully' });
  } catch (error) {
    console.error('Update staff permissions error:', error);
    res.status(500).json({ error: 'Failed to update permissions' });
  }
};

// Remove staff member
export const removeStaff: RequestHandler = async (req, res) => {
  try {
    const pool = await ensureConnection();
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    const staffId = parseInt(req.params.id);

    // Get client ID from user (client = store owner) - link by email
    const clientResult = await pool.query(
      'SELECT id FROM clients WHERE email = $1 LIMIT 1',
      [userEmail]
    );

    if (clientResult.rows.length === 0) {
      return res.status(401).json({ error: 'No store found' });
    }

    const clientId = clientResult.rows[0].id;

    // Verify this staff belongs to the client
    const staff = await pool.query(
      'SELECT id, email FROM staff WHERE id = $1 AND client_id = $2',
      [staffId, clientId]
    );

    if (staff.rows.length === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    const staffEmail = staff.rows[0].email;

    // Delete staff record
    await pool.query('DELETE FROM staff WHERE id = $1', [staffId]);

    // Log activity (non-blocking)
    try {
      await logActivity(clientId, staffId, 'staff_removed', 'staff', staffId, staffEmail);
    } catch (logError) {
      console.warn('Failed to log activity:', logError);
    }

    res.json({ message: 'Staff member removed successfully' });
  } catch (error) {
    console.error('Remove staff error:', error);
    res.status(500).json({ error: 'Failed to remove staff' });
  }
};

// Get activity log for a staff member
export const getActivityLog: RequestHandler = async (req, res) => {
  try {
    const pool = await ensureConnection();
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    const staffId = req.params.id ? parseInt(req.params.id) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    // Get client ID from user (client = store owner) - link by email
    const clientResult = await pool.query(
      'SELECT id FROM clients WHERE email = $1 LIMIT 1',
      [userEmail]
    );

    if (clientResult.rows.length === 0) {
      return res.status(401).json({ error: 'No store found' });
    }

    const clientId = clientResult.rows[0].id;

    const logs = await pool.query(
      `SELECT 
        id, staff_id, action, resource_type, resource_id, resource_name,
        before_value, after_value, timestamp
      FROM staff_activity_log 
      WHERE client_id = $1 AND ($2 = 0 OR staff_id = $2)
      ORDER BY timestamp DESC
      LIMIT $3`,
      [clientId, staffId, limit]
    );

    const formatted = logs.rows.map((log: any) => ({
      ...log,
      before_value: log.before_value ? JSON.parse(log.before_value) : null,
      after_value: log.after_value ? JSON.parse(log.after_value) : null,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get activity log error:', error);
    res.status(500).json({ error: 'Failed to get activity log' });
  }
};

// Helper function to log activity
export async function logActivity(
  clientId: number,
  staffId: number,
  action: string,
  resourceType: string,
  resourceId?: number,
  resourceName?: string,
  beforeValue?: Record<string, any>,
  afterValue?: Record<string, any>
) {
  try {
    const pool = await ensureConnection();
    await pool.query(
      `INSERT INTO staff_activity_log 
        (client_id, staff_id, action, resource_type, resource_id, resource_name, before_value, after_value, timestamp)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [
        clientId,
        staffId,
        action,
        resourceType,
        resourceId || null,
        resourceName || null,
        beforeValue ? JSON.stringify(beforeValue) : null,
        afterValue ? JSON.stringify(afterValue) : null,
      ]
    );
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

// Middleware to check staff permissions
export function requirePermission(permission: string): RequestHandler {
  return async (req, res, next) => {
    try {
      const pool = await ensureConnection();
      const staffId = req.user?.staffId; // Staff ID from JWT token
      const clientId = req.user?.clientId; // Client ID from JWT token

      if (!staffId || !clientId) {
        return res.status(401).json({ error: 'Invalid staff authentication' });
      }

      // Get staff record and their permissions
      const staffRecord = await pool.query(
        'SELECT permissions, status FROM staff WHERE id = $1 AND client_id = $2',
        [staffId, clientId]
      );

      if (staffRecord.rows.length === 0 || staffRecord.rows[0].status !== 'active') {
        return res.status(403).json({ error: 'Staff member not found or inactive' });
      }

      const permissions = typeof staffRecord.rows[0].permissions === 'string' 
        ? JSON.parse(staffRecord.rows[0].permissions) 
        : staffRecord.rows[0].permissions;

      if (permissions[permission] !== true) {
        // Log unauthorized attempt
        try {
          await logActivity(clientId, staffId, 'permission_denied', 'access_attempt', undefined, permission);
        } catch (err) {
          console.warn('Failed to log permission denial:', err);
        }
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
 * STAFF LOGIN - Completely separate from client/owner login
 * Staff authenticate with their own email/password
 * They receive a JWT token with staffId (NOT userId or clientId as owner)
 * This ensures staff can NEVER escalate to owner privileges
 */
export const staffLogin: RequestHandler = async (req, res) => {
  try {
    const pool = await ensureConnection();
    const { username, password } = req.body;
    const ip = getClientIp(req as any);

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // BRUTE FORCE CHECK
    const bruteCheck = checkLoginAllowed(ip, username);
    if (!bruteCheck.allowed) {
      const waitTime = bruteCheck.blockedUntil 
        ? Math.ceil((bruteCheck.blockedUntil - Date.now()) / 1000 / 60) 
        : 30;
      return res.status(429).json({ error: `Too many login attempts. Please try again in ${waitTime} minutes.` });
    }

    console.log(`[Staff] Login attempt for username: ${username}`);

    // CRITICAL: Query STAFF table, NOT clients or users
    // This prevents any privilege escalation
    // Username can be email or any identifier
    const result = await pool.query(
      `SELECT id, email, password, client_id, role, status, permissions, full_name
       FROM staff 
       WHERE email = $1 AND status IN ('active', 'pending')`,
      [username]
    );

    if (result.rows.length === 0) {
      console.log(`[Staff] No staff found with username: ${username}`);
      await recordFailedLogin(req, username, 'user_not_found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const staffMember = result.rows[0];

    // Check password
    const passwordMatch = await comparePassword(password, staffMember.password);
    if (!passwordMatch) {
      console.log(`[Staff] Password mismatch for staff ${staffMember.id}`);
      await recordFailedLogin(req, username, 'bad_password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check status
    if (staffMember.status === 'inactive' || staffMember.status === 'suspended') {
      await recordFailedLogin(req, username, 'account_locked');
      return res.status(403).json({ error: 'Your account has been deactivated' });
    }

    // Successful login - clear failed attempts
    recordSuccessfulLogin(ip, username);

    // Get client info for display
    const clientResult = await pool.query(
      'SELECT company_name, name FROM clients WHERE id = $1',
      [staffMember.client_id]
    );

    const storeName = clientResult.rows[0]?.company_name || clientResult.rows[0]?.name || 'Store';

    // Create JWT token with STAFF identity (NOT owner identity)
    const token = jwt.sign(
      {
        staffId: staffMember.id,           // Staff member ID
        clientId: staffMember.client_id,   // The client they work for
        email: staffMember.email,
        isStaff: true,                     // CRITICAL: Mark as staff, not owner
        role: staffMember.role,
      },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    // Update last login and activate if pending
    await pool.query(
      'UPDATE staff SET last_login = NOW(), status = $1 WHERE id = $2',
      [staffMember.status === 'pending' ? 'active' : staffMember.status, staffMember.id]
    );

    // Log the login
    try {
      await logActivity(staffMember.client_id, staffMember.id, 'staff_login', 'auth', staffMember.id, staffMember.email);
    } catch (err) {
      console.warn('Failed to log login:', err);
    }

    console.log(`[Staff] Staff ${staffMember.id} logged in successfully`);

    res.json({
      token,
      staffId: staffMember.id,
      user: {
        id: staffMember.id,
        email: staffMember.email,
        fullName: staffMember.full_name,
        role: staffMember.role,
        isStaff: true,
        permissions: typeof staffMember.permissions === 'string' ? JSON.parse(staffMember.permissions) : staffMember.permissions,
        storeName: storeName,
        status: 'active',
      },
    });
  } catch (error) {
    console.error('Staff login error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Error details:', errorMsg);
    res.status(500).json({ error: 'Login failed', details: errorMsg });
  }
};

/**
 * STAFF ACCESS: Get orders for the staff member's assigned store
 * Used by staff members to view orders in their store
 * 
 * CRITICAL SECURITY:
 * - Staff member's clientId is verified by middleware (authenticateStaff)
 * - This handler only queries orders for that specific clientId
 * - Staff cannot access another store's orders
 */
export const getStaffOrders: RequestHandler = async (req, res) => {
  try {
    const pool = await ensureConnection();
    const clientId = req.user?.clientId;
    const staffId = req.user?.staffId;

    if (!clientId || !staffId) {
      return res.status(401).json({ error: 'Invalid authentication' });
    }

    // Verify staff still has access to this store
    const staffVerify = await pool.query(
      'SELECT id FROM staff WHERE id = $1 AND client_id = $2 AND status = $3',
      [staffId, clientId, 'active']
    );

    if (staffVerify.rows.length === 0) {
      return res.status(403).json({ error: 'You do not have access to this store' });
    }

    // Get all store orders for this client
    const orders = await pool.query(
      `SELECT 
        o.id, o.product_id, o.status, o.total_price, o.created_at, o.customer_name, o.customer_phone, o.shipping_address,
        p.title as product_title, p.images as product_images
      FROM store_orders o
      LEFT JOIN client_store_products p ON o.product_id = p.id
      WHERE o.client_id = $1
      ORDER BY o.created_at DESC`,
      [clientId]
    );

    res.json(orders.rows);
  } catch (error) {
    console.error('[Staff] Get orders error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: 'Failed to fetch orders', details: errorMsg });
  }
};

/**
 * STAFF ACCESS: Update order status
 * Staff members can change order status (pending -> confirmed -> shipped -> delivered)
 * 
 * CRITICAL SECURITY:
 * - Verify order belongs to staff's assigned store (clientId match)
 * - Verify staff has edit_orders permission
 * - Log all status changes for audit trail
 */
export const updateStaffOrderStatus: RequestHandler = async (req, res) => {
  try {
    const pool = await ensureConnection();
    const clientId = req.user?.clientId;
    const staffId = req.user?.staffId;
    const { orderId, status } = req.body;

    if (!clientId || !staffId) {
      return res.status(401).json({ error: 'Invalid authentication' });
    }

    if (!orderId || !status) {
      return res.status(400).json({ error: 'Missing orderId or status' });
    }

    // Verify staff has permission
    const staffRecord = await pool.query(
      'SELECT permissions FROM staff WHERE id = $1 AND client_id = $2',
      [staffId, clientId]
    );

    if (staffRecord.rows.length === 0) {
      return res.status(403).json({ error: 'You do not have access to this store' });
    }

    const permissions = typeof staffRecord.rows[0].permissions === 'string'
      ? JSON.parse(staffRecord.rows[0].permissions)
      : staffRecord.rows[0].permissions;

    if (permissions.edit_orders !== true) {
      return res.status(403).json({ error: 'Permission denied: edit_orders' });
    }

    // Get current order and verify it belongs to this store
    const orderResult = await pool.query(
      'SELECT id, status as current_status FROM store_orders WHERE id = $1 AND client_id = $2',
      [orderId, clientId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found or does not belong to your store' });
    }

    const currentStatus = orderResult.rows[0].current_status;

    // Update order status
    await pool.query(
      'UPDATE store_orders SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, orderId]
    );

    // Log activity
    try {
      await logActivity(
        clientId,
        staffId,
        'order_status_changed',
        'store_orders',
        orderId,
        `Order ${orderId}`,
        { status: currentStatus },
        { status: status }
      );
    } catch (logErr) {
      console.warn('Failed to log order status change:', logErr);
    }

    res.json({ message: 'Order status updated', orderId, newStatus: status });
  } catch (error) {
    console.error('[Staff] Update order status error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: 'Failed to update order status', details: errorMsg });
  }
};

