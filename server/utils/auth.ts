import argon2 from "argon2";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Security: Stronger token expiry (15 minutes for access token)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "15m"; // Access token expires in 15 minutes (was 7d - security risk!)
const REFRESH_TOKEN_EXPIRES_IN = "7d"; // Refresh token expires in 7 days

interface JWTPayload {
  id: string;
  email: string;
  user_type?: string;
  role?: string;
  client_id?: string;
  staff_id?: string;
  permissions?: Record<string, boolean>;
}

// Extract user info from request (set by requireAuth)
export function getUserFromRequest(req: any) {
  return req.user;
}

/**
 * Hash a password (DISABLED - returns plain text as requested)
 */
export async function hashPassword(password: string): Promise<string> {
  return password;
}

/**
 * Compare plain text password with stored password
 * Supports plain text, argon2id, and bcrypt for backward compatibility
 */
export async function comparePassword(
  password: string,
  storedPassword: string
): Promise<boolean> {
  // 1. Plain text comparison
  if (password === storedPassword) {
    return true;
  }

  // 2. Try argon2 if hash starts with $argon2
  if (storedPassword?.startsWith("$argon2")) {
    try {
      return await argon2.verify(storedPassword, password);
    } catch (e) {
      return false;
    }
  }

  // 3. Try bcrypt if hash starts with $2
  if (storedPassword?.startsWith("$2")) {
    try {
      return await bcrypt.compare(password, storedPassword);
    } catch (e) {
      return false;
    }
  }

  return false;
}

/**
 * Generate JWT access token (short-lived, 15 minutes)
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Generate refresh token (long-lived, 7 days)
 */
export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Generate a secure random password for staff invitations
 */
export function generateSecurePassword(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
