import jwt from "jsonwebtoken";
import { JWTPayload } from "@shared/api";
import { jsonError } from "../utils/httpHelpers";
import { RequestHandler } from "express";
import { hashPassword, comparePassword, generateToken, verifyToken, extractToken } from "../utils/auth";
import {
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  initializeDatabase,
  createDefaultAdmin,
  ensureConnection,
} from "../utils/database";
import { logSecurityEvent, getClientIp, getGeo, computeFingerprint, parseCookie } from "../utils/security";

// JWT authentication middleware
export const requireAuth: RequestHandler = (req, res, next) => {
  const token = extractToken(req.headers.authorization);
  if (!token) return jsonError(res, 401, "No token");
  try {
    const decoded = verifyToken(token);
    req.user = decoded as JWTPayload;
    next();
  } catch {
    return jsonError(res, 401, "Invalid token");
  }
};

// Database initialization moved to server startup (dev.ts / index.ts)
// Removed immediate init to prevent crashes when DB is unavailable

import { Router } from "express";
import { getUserFromRequest } from "../utils/auth";

const router = Router();

// POST /api/auth/register
export const register: RequestHandler = async (req, res) => {
  try {
    console.log("[REGISTER] Incoming body:", req.body);
    const { email, password, name, role } = req.body;

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      console.log("[REGISTER] Email already registered:", email);
      return jsonError(res, 400, "Email already registered");
    }

    // Check platform user limit (count from clients table only)
    const pool = await ensureConnection();
    const userCountResult = await pool.query("SELECT COUNT(*) as count FROM clients");
    const currentUserCount = parseInt(userCountResult.rows[0].count);
    
    const maxUsersResult = await pool.query(
      "SELECT setting_value FROM platform_settings WHERE setting_key = 'max_users'"
    );
    const maxUsers = maxUsersResult.rows.length > 0 
      ? parseInt(maxUsersResult.rows[0].setting_value) 
      : 1000; // Default to 1000 if not set
    
    if (currentUserCount >= maxUsers) {
      console.log("[REGISTER] User limit reached. Current:", currentUserCount, "Max:", maxUsers);
      return jsonError(res, 429, `Platform is at capacity. Maximum users: ${maxUsers}`);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);
    console.log("[REGISTER] Password hashed");

    // Create user
    // Map role to valid values: 'admin' stays admin, everything else becomes 'client'
    const normalizedRole = role === 'admin' ? 'admin' : 'client';
    const user = await createUser({
      email,
      password: hashedPassword,
      name,
      role: normalizedRole,
      user_type: normalizedRole === 'admin' ? 'admin' : 'client',
    });
    console.log("[REGISTER] User created:", user.id, user.email);

    // Fingerprint + security log (do not log secrets)
    try {
      const ip = getClientIp(req as any);
      const ua = (req.headers['user-agent'] as string | undefined) || null;
      const geo = getGeo(req as any, ip);
      const fpCookie = parseCookie(req as any, 'ecopro_fp');
      const fingerprint = computeFingerprint({ ip, userAgent: ua, cookie: fpCookie });

      await logSecurityEvent({
        event_type: 'auth_register_success',
        severity: 'info',
        request_id: (req as any).requestId || null,
        method: req.method,
        path: req.path,
        status_code: 201,
        ip,
        user_agent: ua,
        fingerprint,
        country_code: geo.country_code,
        region: geo.region,
        city: geo.city,
        user_id: String(user.id),
        user_type: user.user_type || (user.role === 'admin' ? 'admin' : 'client'),
        role: user.role || null,
        metadata: {
          scope: 'auth',
          action: 'register',
          email: user.email,
        },
      });
    } catch (e) {
      console.warn('[REGISTER] Failed to log security event:', (e as any)?.message || e);
    }

    // If user_type is 'client', also create a client record (for store owners)
    if (user.user_type === 'client') {
      try {
        await pool.query(
          `INSERT INTO clients (email, password, name, role, created_at, updated_at)
           VALUES ($1, $2, $3, $4, NOW(), NOW())
           ON CONFLICT (email) DO NOTHING`,
          [user.email, user.password, user.name || 'Store Owner', 'client']
        );
        console.log("[REGISTER] Client record created for:", user.email);
      } catch (clientError) {
        console.warn("[REGISTER] Could not create client record:", clientError);
        // Not critical - continue with registration
      }
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: (user.role as "user" | "admin") || "user",
      user_type: user.role === "admin" ? "admin" : "client",
    });
    console.log("[REGISTER] Token generated");

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("[REGISTER] Registration error:", error);
    return jsonError(res, 500, "Registration failed");
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    const inferLockType = (dbLockType: unknown, lockedReason: unknown): 'payment' | 'critical' => {
      if (dbLockType === 'payment' || dbLockType === 'critical') return dbLockType;
      const reason = typeof lockedReason === 'string' ? lockedReason : '';
      // If lock_type is missing (common when column hasn't existed / wasn't selected),
      // infer payment lock from subscription-related reasons.
      if (/(subscription|expired|payment|trial|billing)/i.test(reason)) return 'payment';
      return 'critical';
    };

    console.log("\n=== LOGIN ATTEMPT ===");
    console.log("Email:", email);
    console.log("Password length:", password?.length);

    // Find user
    const user = await findUserByEmail(email);
    console.log("User found:", !!user);
    if (user) {
      console.log("User role:", user.role);
      console.log("Hash starts with:", user.password?.substring(0, 10));
    }

    if (!user) {
      console.log("❌ User not found");
      // Security log: failed login attempt (no user_id)
      try {
        const ip = getClientIp(req as any);
        const ua = (req.headers['user-agent'] as string | undefined) || null;
        const geo = getGeo(req as any, ip);
        const fpCookie = parseCookie(req as any, 'ecopro_fp');
        const fingerprint = computeFingerprint({ ip, userAgent: ua, cookie: fpCookie });
        await logSecurityEvent({
          event_type: 'auth_login_failed',
          severity: 'warn',
          request_id: (req as any).requestId || null,
          method: req.method,
          path: req.path,
          status_code: 401,
          ip,
          user_agent: ua,
          fingerprint,
          country_code: geo.country_code,
          region: geo.region,
          city: geo.city,
          user_id: null,
          user_type: null,
          role: null,
          metadata: {
            scope: 'auth',
            action: 'login',
            reason: 'user_not_found',
            email_present: Boolean(email),
          },
        });
      } catch {
        // ignore
      }
      return jsonError(res, 401, "Invalid email or password");
    }

    // Verify password
    console.log("Comparing passwords...");
    const isValidPassword = await comparePassword(password, user.password);
    console.log("Password match:", isValidPassword ? "✅ YES" : "❌ NO");
    
    if (!isValidPassword) {
      console.log("❌ Invalid password");
      // Security log: failed login attempt
      try {
        const ip = getClientIp(req as any);
        const ua = (req.headers['user-agent'] as string | undefined) || null;
        const geo = getGeo(req as any, ip);
        const fpCookie = parseCookie(req as any, 'ecopro_fp');
        const fingerprint = computeFingerprint({ ip, userAgent: ua, cookie: fpCookie });
        await logSecurityEvent({
          event_type: 'auth_login_failed',
          severity: 'warn',
          request_id: (req as any).requestId || null,
          method: req.method,
          path: req.path,
          status_code: 401,
          ip,
          user_agent: ua,
          fingerprint,
          country_code: geo.country_code,
          region: geo.region,
          city: geo.city,
          user_id: String(user.id),
          user_type: (user.user_type as any) || (user.role === 'admin' ? 'admin' : 'client'),
          role: (user.role as any) || null,
          metadata: {
            scope: 'auth',
            action: 'login',
            reason: 'bad_password',
          },
        });
      } catch {
        // ignore
      }
      return jsonError(res, 401, "Invalid email or password");
    }

    // Check if account is locked
    // Payment locks: Allow login (blur overlay shown on dashboard)
    // Critical locks: Prevent login entirely
    if (user.is_locked) {
      const lockType = inferLockType((user as any).lock_type, (user as any).locked_reason);
      console.log("❌ Account is locked, type:", lockType, "reason:", user.locked_reason);
      
      if (lockType === 'critical') {
        // Critical lock - prevent login
        const reason = user.locked_reason || "Account locked by administrator";
        return res.status(403).json({ 
          error: `Account locked: ${reason}`,
          locked: true,
          locked_reason: reason,
          lock_type: 'critical'
        });
      }
      // Payment lock - allow login (blur overlay will be shown on dashboard)
      console.log("✅ Payment lock detected - allowing login, blur overlay will be shown");
    }

    console.log("✅ Login successful");

    // Generate token
    const token = generateToken({
      id: user.id.toString(),
      email: user.email,
      role: (user.role as any) || "user",
      user_type: (user.user_type as any) || (user.role === "admin" ? "admin" : "client"),
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        user_type: user.user_type || (user.role === "admin" ? "admin" : "client"),
        is_locked: !!(user as any).is_locked,
        locked_reason: (user as any).locked_reason || null,
        lock_type: user.is_locked ? inferLockType((user as any).lock_type, (user as any).locked_reason) : null,
      },
    });
  } catch (error) {
    console.error("[LOGIN] Login error:", error);
    return jsonError(res, 500, "Login failed");
  }
};

/**
 * Verify token and get current user
 * GET /api/auth/me
 */
export const getCurrentUser: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return jsonError(res, 401, "Not authenticated");
    }

    const user = await findUserById(req.user.id);
    if (!user) {
      return jsonError(res, 404, "User not found");
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "user" | "admin",
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return jsonError(res, 500, "Failed to get user");
  }
};

/**
 * Change password
 * POST /api/auth/change-password
 */
export const changePassword: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return jsonError(res, 401, "Not authenticated");
    }

    const { currentPassword, newPassword } = req.body;

    const user = await findUserById(req.user.id);
    if (!user) {
      return jsonError(res, 404, "User not found");
    }

    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, user.password);
    if (!isValidPassword) {
      return jsonError(res, 401, "Current password is incorrect");
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);
    await updateUser(user.id, { password: hashedPassword });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return jsonError(res, 500, "Failed to change password");
  }
};

/**
 * Search for a user by email (admin only)
 * GET /api/users/search?email=...
 */
export const searchUserByEmail: RequestHandler = async (req, res) => {
  try {
    const adminUser = req.user as any;
    
    // Verify admin access
    if (!adminUser || (adminUser.role !== 'admin' && adminUser.user_type !== 'admin')) {
      return jsonError(res, 403, 'Admin access required');
    }

    const { email } = req.query;
    if (!email || typeof email !== 'string') {
      return jsonError(res, 400, 'Email query parameter required');
    }

    // Search in clients table
    const { pool } = await import("../utils/database");
    const result = await pool.query(
      'SELECT id, email, name, user_type FROM clients WHERE email = $1 LIMIT 1',
      [email]
    );

    if (result.rows.length === 0) {
      return jsonError(res, 404, 'User not found');
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error searching user:', error);
    return jsonError(res, 500, 'Failed to search user');
  }
};
