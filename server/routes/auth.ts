import jwt from "jsonwebtoken";
import { JWTPayload } from "@shared/api";
import { jsonError } from "../utils/httpHelpers";
import { RequestHandler } from "express";
import { hashPassword, comparePassword, generateToken, generateRefreshToken, verifyToken, extractToken } from "../utils/auth";
import crypto from 'crypto';
import {
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  initializeDatabase,
  createDefaultAdmin,
  ensureConnection,
} from "../utils/database";
import { sendPasswordResetEmail } from "../utils/email";
import { logSecurityEvent, getClientIp, getGeo, computeFingerprint, parseCookie } from "../utils/security";
import { checkLoginAllowed, recordFailedLogin, recordSuccessfulLogin } from "../utils/brute-force";
import { checkPasswordPolicy } from '../utils/password-policy';
import { checkPwnedPassword } from '../utils/pwned-passwords';
import { encryptData, decryptData, hashData } from '../utils/encryption';
import { buildOtpAuthUrl, generateTotpSecretBase32, verifyTotp } from '../utils/totp';
import { clearAuthCookies, getCookieOptions, cookieNames } from '../utils/auth-cookies';

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

const ACCESS_COOKIE = cookieNames.ACCESS_COOKIE;
const REFRESH_COOKIE = cookieNames.REFRESH_COOKIE;
const CSRF_COOKIE = cookieNames.CSRF_COOKIE;
const STAFF_ACCESS_COOKIE = cookieNames.STAFF_ACCESS_COOKIE;

function inferLockType(dbLockType: unknown, lockedReason: unknown): 'payment' | 'critical' {
  if (dbLockType === 'payment' || dbLockType === 'critical') return dbLockType;
  const reason = typeof lockedReason === 'string' ? lockedReason : '';
  // If lock_type is missing (common when column hasn't existed / wasn't selected),
  // infer payment lock from subscription-related reasons.
  if (/(subscription|expired|payment|trial|billing)/i.test(reason)) return 'payment';
  return 'critical';
}

// getCookieOptions is provided by utils/auth-cookies

function setAuthCookies(res: any, accessToken: string, refreshToken: string) {
  const { isProduction, sameSite, domain } = getCookieOptions();

  res.cookie(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite,
    domain,
    path: '/',
    maxAge: 15 * 60 * 1000,
  });

  res.cookie(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite,
    domain,
    path: '/api/auth',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  // Ensure CSRF cookie exists (readable by JS)
  if (!res.req?.cookies?.[CSRF_COOKIE]) {
    const csrf = crypto.randomBytes(32).toString('hex');
    res.cookie(CSRF_COOKIE, csrf, {
      httpOnly: false,
      secure: isProduction,
      sameSite,
      domain,
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }
}

// clearAuthCookies is provided by utils/auth-cookies

// POST /api/auth/register
export const register: RequestHandler = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Strong password policy + breach check
    const policy = checkPasswordPolicy(password, email);
    if (policy.ok === false) {
      return jsonError(res, 400, policy.reason);
    }
    const pwned = await checkPwnedPassword(password);
    if (pwned.ok && pwned.pwned) {
      return jsonError(res, 400, 'Password has appeared in a data breach; choose a different password');
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
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
      return jsonError(res, 429, `Platform is at capacity. Maximum users: ${maxUsers}`);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

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

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
      role: (user.role as any) || 'user',
      user_type: user.role === 'admin' ? 'admin' : 'client',
    });

    setAuthCookies(res as any, token, refreshToken);

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
    const { email, password, totp_code, backup_code } = req.body as any;
    const ip = getClientIp(req as any);

    // BRUTE FORCE CHECK: Block if too many failed attempts
    const bruteCheck = checkLoginAllowed(ip, email);
    if (!bruteCheck.allowed) {
      const waitTime = bruteCheck.blockedUntil 
        ? Math.ceil((bruteCheck.blockedUntil - Date.now()) / 1000 / 60) 
        : 30;
      return jsonError(res, 429, `Too many login attempts. Please try again in ${waitTime} minutes.`);
    }

    // Find user
    const user = await findUserByEmail(email);
    if (!user) {
      // Record failed login for brute force protection
      await recordFailedLogin(req, email, 'user_not_found');
      return jsonError(res, 401, "Invalid email or password");
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    
    if (!isValidPassword) {
      // Record failed login for brute force protection
      await recordFailedLogin(req, email, 'bad_password');
      return jsonError(res, 401, "Invalid email or password");
    }

    // Check if account is BLOCKED (admin action - cannot login at all)
    if ((user as any).is_blocked) {
      await recordFailedLogin(req, email, 'account_blocked');
      const reason = (user as any).blocked_reason || "Account blocked by administrator";
      clearAuthCookies(res as any);
      return res.status(403).json({ 
        error: `Account blocked: ${reason}`,
        blocked: true,
        blocked_reason: reason
      });
    }

    // LOCKED (subscription) accounts are allowed to login.
    // The UI enforces restrictions (subscription ended page, blurred orders, bots off, etc)
    // using the is_locked / locked_reason / lock_type flags.

    // Admin 2FA gate (TOTP or backup code)
    const isAdmin = (user as any).role === 'admin' || (user as any).user_type === 'admin';
    const totpEnabled = Boolean((user as any).totp_enabled);
    if (isAdmin && totpEnabled) {
      const secretEnc = (user as any).totp_secret_encrypted as string | null | undefined;
      if (!secretEnc) {
        console.error('[2FA] Admin has totp_enabled but missing secret');
        return jsonError(res, 500, 'Two-factor authentication misconfigured');
      }

      let ok = false;

      if (typeof totp_code === 'string' && totp_code.trim()) {
        ok = verifyTotp(decryptData(secretEnc), totp_code.trim());
      }

      if (!ok && typeof backup_code === 'string' && backup_code.trim()) {
        try {
          const pool = await ensureConnection();
          const r = await pool.query('SELECT totp_backup_codes_hashes FROM admins WHERE id = $1', [user.id]);
          const hashes: string[] = Array.isArray(r.rows?.[0]?.totp_backup_codes_hashes)
            ? r.rows[0].totp_backup_codes_hashes
            : [];
          const providedHash = hashData(backup_code.trim());
          if (hashes.includes(providedHash)) {
            const remaining = hashes.filter((h) => h !== providedHash);
            await pool.query(
              'UPDATE admins SET totp_backup_codes_hashes = $2, updated_at = NOW() WHERE id = $1',
              [user.id, remaining]
            );
            ok = true;
          }
        } catch (e) {
          console.error('[2FA] Backup-code verification failed:', (e as any)?.message || e);
        }
      }

      if (!ok) {
        return res.status(401).json({ error: 'Two-factor authentication required', twoFactorRequired: true });
      }
    }

    // Generate token
    const token = generateToken({
      id: user.id.toString(),
      email: user.email,
      role: (user.role as any) || "user",
      user_type: (user.user_type as any) || (user.role === "admin" ? "admin" : "client"),
    });

    const refreshToken = generateRefreshToken({
      id: user.id.toString(),
      email: user.email,
      role: (user.role as any) || 'user',
      user_type: (user.user_type as any) || (user.role === 'admin' ? 'admin' : 'client'),
    });

    setAuthCookies(res as any, token, refreshToken);

    // Record successful login (clears failed attempt counters)
    recordSuccessfulLogin(ip, email);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        user_type: user.user_type || (user.role === "admin" ? "admin" : "client"),
        is_blocked: !!(user as any).is_blocked,
        blocked_reason: (user as any).blocked_reason || null,
        is_locked: !!(user as any).is_locked,
        locked_reason: (user as any).locked_reason || null,
        lock_type: (user as any).lock_type || inferLockType((user as any).lock_type, (user as any).locked_reason),
      },
    });
  } catch (error) {
    console.error("[LOGIN] Login error:", error);
    return jsonError(res, 500, "Login failed");
  }
};

/**
 * Refresh access token using refresh cookie
 * POST /api/auth/refresh
 */
export const refresh: RequestHandler = async (req, res) => {
  try {
    const rt = (req as any).cookies?.[REFRESH_COOKIE] as string | undefined;
    if (!rt) return jsonError(res, 401, 'No refresh token');

    const decoded = verifyToken(rt) as any;

    // Re-check user status in DB to enforce blocks immediately.
    // (Otherwise a user blocked after login could keep refreshing tokens.)
    const dbUser = await findUserById(String(decoded.id));
    if (!dbUser) {
      clearAuthCookies(res as any);
      return jsonError(res, 401, 'User not found');
    }
    if ((dbUser as any).is_blocked) {
      clearAuthCookies(res as any);
      return jsonError(res, 403, 'Account is blocked');
    }

    const token = generateToken({
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      user_type: decoded.user_type,
      client_id: decoded.client_id,
      staff_id: decoded.staff_id,
      permissions: decoded.permissions,
    });

    const refreshToken = generateRefreshToken({
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      user_type: decoded.user_type,
      client_id: decoded.client_id,
      staff_id: decoded.staff_id,
      permissions: decoded.permissions,
    });

    setAuthCookies(res as any, token, refreshToken);
    return res.json({ ok: true });
  } catch {
    return jsonError(res, 401, 'Invalid refresh token');
  }
};

/**
 * Logout (clear auth cookies)
 * POST /api/auth/logout
 */
export const logout: RequestHandler = async (_req, res) => {
  clearAuthCookies(res as any);
  return res.json({ ok: true });
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

    if ((user as any).is_blocked) {
      clearAuthCookies(res as any);
      return jsonError(res, 403, 'Account is blocked');
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "user" | "admin",
      is_blocked: !!(user as any).is_blocked,
      blocked_reason: (user as any).blocked_reason || null,
      is_locked: !!(user as any).is_locked,
      locked_reason: (user as any).locked_reason || null,
      lock_type: (user as any).lock_type || inferLockType((user as any).lock_type, (user as any).locked_reason),
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

    // Strong password policy + breach check
    const policy = checkPasswordPolicy(newPassword, user.email);
    if (policy.ok === false) {
      return jsonError(res, 400, policy.reason);
    }
    const pwned = await checkPwnedPassword(newPassword);
    if (pwned.ok && pwned.pwned) {
      return jsonError(res, 400, 'Password has appeared in a data breach; choose a different password');
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
 * Admin 2FA setup (TOTP)
 * POST /api/auth/2fa/setup
 */
export const setupAdmin2FA: RequestHandler = async (req, res) => {
  try {
    const u = req.user as any;
    if (!u || (u.role !== 'admin' && u.user_type !== 'admin')) {
      return jsonError(res, 403, 'Admin access required');
    }

    const user = await findUserById(String(u.id));
    if (!user) return jsonError(res, 404, 'User not found');

    const secretBase32 = generateTotpSecretBase32(20);
    const otpAuthUrl = buildOtpAuthUrl({ issuer: 'EcoPro', accountName: user.email, secretBase32 });

    await updateUser(String(u.id), {
      totp_pending_secret_encrypted: encryptData(secretBase32),
    } as any);

    return res.json({ otpAuthUrl });
  } catch (e) {
    console.error('[2FA] setup failed:', (e as any)?.message || e);
    return jsonError(res, 500, 'Failed to start 2FA setup');
  }
};

/**
 * Admin 2FA enable (verify TOTP)
 * POST /api/auth/2fa/enable
 * Body: { code: string }
 */
export const enableAdmin2FA: RequestHandler = async (req, res) => {
  try {
    const u = req.user as any;
    if (!u || (u.role !== 'admin' && u.user_type !== 'admin')) {
      return jsonError(res, 403, 'Admin access required');
    }

    const code = String((req.body as any)?.code || '').trim();
    if (!code) return jsonError(res, 400, 'Code is required');

    const pool = await ensureConnection();
    const r = await pool.query('SELECT totp_pending_secret_encrypted FROM admins WHERE id = $1', [u.id]);
    const pendingEnc = r.rows?.[0]?.totp_pending_secret_encrypted as string | null | undefined;
    if (!pendingEnc) return jsonError(res, 400, 'No pending 2FA setup found');

    const secret = decryptData(pendingEnc);
    if (!verifyTotp(secret, code)) {
      return jsonError(res, 400, 'Invalid 2FA code');
    }

    const backupCodes: string[] = Array.from({ length: 10 }).map(() => {
      const raw = crypto.randomBytes(8).toString('hex');
      return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}`;
    });
    const backupHashes = backupCodes.map((c) => hashData(c));

    await pool.query(
      `UPDATE admins
       SET totp_enabled = true,
           totp_secret_encrypted = $2,
           totp_pending_secret_encrypted = NULL,
           totp_backup_codes_hashes = $3,
           totp_enrolled_at = NOW(),
           updated_at = NOW()
       WHERE id = $1`,
      [u.id, encryptData(secret), backupHashes]
    );

    return res.json({ ok: true, backupCodes });
  } catch (e) {
    console.error('[2FA] enable failed:', (e as any)?.message || e);
    return jsonError(res, 500, 'Failed to enable 2FA');
  }
};

/**
 * Admin 2FA disable
 * POST /api/auth/2fa/disable
 * Body: { code?: string, backup_code?: string }
 */
export const disableAdmin2FA: RequestHandler = async (req, res) => {
  try {
    const u = req.user as any;
    if (!u || (u.role !== 'admin' && u.user_type !== 'admin')) {
      return jsonError(res, 403, 'Admin access required');
    }

    const code = String((req.body as any)?.code || '').trim();
    const backup = String((req.body as any)?.backup_code || '').trim();
    if (!code && !backup) return jsonError(res, 400, '2FA code or backup code required');

    const pool = await ensureConnection();
    const r = await pool.query(
      'SELECT totp_enabled, totp_secret_encrypted, totp_backup_codes_hashes FROM admins WHERE id = $1',
      [u.id]
    );
    if (!r.rows.length) return jsonError(res, 404, 'User not found');

    const row = r.rows[0];
    if (!row.totp_enabled) return jsonError(res, 400, '2FA is not enabled');

    let ok = false;
    if (code && row.totp_secret_encrypted) {
      ok = verifyTotp(decryptData(row.totp_secret_encrypted), code);
    }
    if (!ok && backup) {
      const hashes: string[] = Array.isArray(row.totp_backup_codes_hashes) ? row.totp_backup_codes_hashes : [];
      ok = hashes.includes(hashData(backup));
    }
    if (!ok) return jsonError(res, 400, 'Invalid 2FA proof');

    await pool.query(
      `UPDATE admins
       SET totp_enabled = false,
           totp_secret_encrypted = NULL,
           totp_pending_secret_encrypted = NULL,
           totp_backup_codes_hashes = NULL,
           totp_enrolled_at = NULL,
           updated_at = NOW()
       WHERE id = $1`,
      [u.id]
    );

    return res.json({ ok: true });
  } catch (e) {
    console.error('[2FA] disable failed:', (e as any)?.message || e);
    return jsonError(res, 500, 'Failed to disable 2FA');
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

// ========================================
// EMAIL VERIFICATION FOR SIGNUP
// ========================================

import { sendVerificationCode, generateVerificationCode } from '../services/email';

/**
 * Send verification code to email
 * POST /api/auth/send-verification
 */
export const sendVerificationCodeHandler: RequestHandler = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !password) {
      return jsonError(res, 400, 'Email and password are required');
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return jsonError(res, 400, 'Email already registered');
    }

    // Strong password policy check
    const policy = checkPasswordPolicy(password, email);
    if (policy.ok === false) {
      return jsonError(res, 400, policy.reason);
    }

    // Check for breached password
    const pwned = await checkPwnedPassword(password);
    if (pwned.ok && pwned.pwned) {
      return jsonError(res, 400, 'Password has appeared in a data breach; choose a different password');
    }

    const pool = await ensureConnection();

    // Check rate limit - max 3 codes per email per hour
    const recentCodes = await pool.query(
      `SELECT COUNT(*) as count FROM email_verifications 
       WHERE email = $1 AND created_at > NOW() - INTERVAL '1 hour'`,
      [email]
    );
    
    if (parseInt(recentCodes.rows[0].count) >= 3) {
      return jsonError(res, 429, 'Too many verification requests. Please wait before trying again.');
    }

    // Generate 6-digit code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store verification record (delete old ones for this email first)
    await pool.query('DELETE FROM email_verifications WHERE email = $1', [email]);
    await pool.query(
      `INSERT INTO email_verifications (email, code, expires_at) VALUES ($1, $2, $3)`,
      [email, code, expiresAt]
    );

    // Send email
    const emailResult = await sendVerificationCode(email, code);
    
    if (!emailResult.success) {
      console.error('[AUTH] Failed to send verification email:', emailResult.error);
      // Still return success - code is in DB, user can retry
    }

    res.json({ 
      success: true, 
      message: 'Verification code sent to your email',
      // Only include code in development for testing
      ...(process.env.NODE_ENV !== 'production' ? { code } : {})
    });
  } catch (error) {
    console.error('[AUTH] Send verification error:', error);
    return jsonError(res, 500, 'Failed to send verification code');
  }
};

/**
 * Verify code and complete registration
 * POST /api/auth/verify-and-register
 */
export const verifyAndRegister: RequestHandler = async (req, res) => {
  try {
    const { email, password, name, code } = req.body;

    if (!email || !password || !code) {
      return jsonError(res, 400, 'Email, password, and verification code are required');
    }

    const pool = await ensureConnection();

    // Find valid verification record
    const verifyResult = await pool.query(
      `SELECT * FROM email_verifications 
       WHERE email = $1 AND code = $2 AND expires_at > NOW() AND verified = false
       LIMIT 1`,
      [email, code]
    );

    if (verifyResult.rows.length === 0) {
      // Check if code exists but expired or wrong
      const anyCode = await pool.query(
        `SELECT * FROM email_verifications WHERE email = $1 ORDER BY created_at DESC LIMIT 1`,
        [email]
      );
      
      if (anyCode.rows.length > 0) {
        const record = anyCode.rows[0];
        if (record.code !== code) {
          // Update attempts
          await pool.query(
            `UPDATE email_verifications SET attempts = attempts + 1 WHERE id = $1`,
            [record.id]
          );
          return jsonError(res, 400, 'Invalid verification code');
        }
        if (new Date(record.expires_at) < new Date()) {
          return jsonError(res, 400, 'Verification code has expired. Please request a new one.');
        }
        if (record.verified) {
          return jsonError(res, 400, 'This code has already been used');
        }
      }
      
      return jsonError(res, 400, 'Invalid or expired verification code');
    }

    // Mark as verified
    await pool.query(
      `UPDATE email_verifications SET verified = true WHERE id = $1`,
      [verifyResult.rows[0].id]
    );

    // Now proceed with actual registration (same as original register function)
    
    // Check if user already exists (double-check)
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return jsonError(res, 400, 'Email already registered');
    }

    // Check platform user limit
    const userCountResult = await pool.query("SELECT COUNT(*) as count FROM clients");
    const currentUserCount = parseInt(userCountResult.rows[0].count);
    
    const maxUsersResult = await pool.query(
      "SELECT setting_value FROM platform_settings WHERE setting_key = 'max_users'"
    );
    const maxUsers = maxUsersResult.rows.length > 0 
      ? parseInt(maxUsersResult.rows[0].setting_value) 
      : 1000;
    
    if (currentUserCount >= maxUsers) {
      return jsonError(res, 429, `Platform is at capacity. Maximum users: ${maxUsers}`);
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = await createUser({
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
      role: 'client',
      user_type: 'client',
    });

    // Create client record
    try {
      await pool.query(
        `INSERT INTO clients (email, password, name, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         ON CONFLICT (email) DO NOTHING`,
        [user.email, user.password, user.name || 'Store Owner', 'client']
      );
    } catch (clientError) {
      console.warn("[REGISTER] Could not create client record:", clientError);
    }

    // Log security event
    try {
      const ip = getClientIp(req as any);
      const ua = (req.headers['user-agent'] as string | undefined) || null;
      const geo = getGeo(req as any, ip);
      const fpCookie = parseCookie(req as any, 'ecopro_fp');
      const fingerprint = computeFingerprint({ ip, userAgent: ua, cookie: fpCookie });

      await logSecurityEvent({
        event_type: 'auth_register_verified',
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
        user_type: 'client',
        role: 'client',
        metadata: {
          scope: 'auth',
          action: 'register_with_email_verification',
        },
      });
    } catch (e) {
      console.warn('[REGISTER] Failed to log security event:', (e as any)?.message || e);
    }

    // Generate tokens
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: 'user',
      user_type: 'client',
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
      role: 'user',
      user_type: 'client',
    });

    setAuthCookies(res as any, token, refreshToken);

    // Cleanup old verification codes for this email
    await pool.query('DELETE FROM email_verifications WHERE email = $1', [email]);

    res.status(201).json({
      message: 'Email verified and account created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('[AUTH] Verify and register error:', error);
    return jsonError(res, 500, 'Registration failed');
  }
};

/**
 * Forgot password - sends reset email
 * POST /api/auth/forgot-password
 */
export const forgotPassword: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return jsonError(res, 400, 'Email is required');
    }

    const user = await findUserByEmail(email.toLowerCase().trim());
    
    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If an account exists, a reset link has been sent.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token in database
    const pool = await ensureConnection();
    await pool.query(`
      INSERT INTO password_resets (email, token_hash, expires_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO UPDATE SET token_hash = $2, expires_at = $3, created_at = NOW()
    `, [email.toLowerCase().trim(), resetTokenHash, expiresAt]);

    // Build reset URL
    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Send email
    await sendPasswordResetEmail(email, resetToken, resetUrl);

    res.json({ message: 'If an account exists, a reset link has been sent.' });
  } catch (error) {
    console.error('[AUTH] Forgot password error:', error);
    return jsonError(res, 500, 'Failed to process request');
  }
};

/**
 * Reset password - sets new password using token
 * POST /api/auth/reset-password
 */
export const resetPassword: RequestHandler = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    
    if (!email || !token || !newPassword) {
      return jsonError(res, 400, 'Email, token, and new password are required');
    }

    if (newPassword.length < 8) {
      return jsonError(res, 400, 'Password must be at least 8 characters');
    }

    const pool = await ensureConnection();
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find valid reset token
    const result = await pool.query(`
      SELECT * FROM password_resets 
      WHERE email = $1 AND token_hash = $2 AND expires_at > NOW()
    `, [email.toLowerCase().trim(), tokenHash]);

    if (result.rows.length === 0) {
      return jsonError(res, 400, 'Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password in clients table
    await pool.query(`
      UPDATE clients SET password = $1, updated_at = NOW() WHERE email = $2
    `, [hashedPassword, email.toLowerCase().trim()]);

    // Delete used reset token
    await pool.query('DELETE FROM password_resets WHERE email = $1', [email.toLowerCase().trim()]);

    // Log security event
    try {
      const ip = getClientIp(req as any);
      await logSecurityEvent({
        event_type: 'password_reset_success',
        severity: 'info',
        request_id: (req as any).requestId || null,
        method: req.method,
        path: req.path,
        status_code: 200,
        ip,
        user_agent: req.headers['user-agent'] || null,
        metadata: { email },
      });
    } catch (e) {
      console.warn('[AUTH] Failed to log security event:', e);
    }

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    console.error('[AUTH] Reset password error:', error);
    return jsonError(res, 500, 'Failed to reset password');
  }
};
