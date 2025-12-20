import jwt from "jsonwebtoken";
import { JWTPayload } from "@shared/api";
import { jsonError } from "../utils/httpHelpers";

// JWT authentication middleware
export const requireAuth: RequestHandler = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return jsonError(res, 401, "No token");
  try {
    const decoded = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET || "changeme");
    if (typeof decoded === "object" && decoded !== null) {
      req.user = decoded as JWTPayload;
    } else {
      req.user = undefined;
    }
    next();
  } catch {
    return jsonError(res, 401, "Invalid token");
  }
};
import { RequestHandler } from "express";
import { hashPassword, comparePassword, generateToken } from "../utils/auth";
import {
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  initializeDatabase,
  createDefaultAdmin,
  ensureConnection,
} from "../utils/database";

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

    // Hash password
    const hashedPassword = await hashPassword(password);
    console.log("[REGISTER] Password hashed");

    // Create user
    // Allow 'seller' role and map user_type accordingly
    const normalizedRole = (role === 'admin' || role === 'seller') ? role : 'user';
    const user = await createUser({
      email,
      password_hash: hashedPassword,
      name,
      role: normalizedRole,
      user_type: normalizedRole === 'admin' ? 'admin' : (normalizedRole === 'seller' ? 'seller' : 'client'),
    });
    console.log("[REGISTER] User created:", user.id, user.email);

    // If user_type is 'client', also create a client record (for store owners)
    if (user.user_type === 'client') {
      try {
        const pool = await ensureConnection();
        await pool.query(
          `INSERT INTO clients (email, password_hash, name, role, created_at, updated_at)
           VALUES ($1, $2, $3, $4, NOW(), NOW())
           ON CONFLICT (email) DO NOTHING`,
          [user.email, user.password_hash, user.name || 'Store Owner', 'client']
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
      role: (user.role as "user" | "admin" | "seller") || "user",
      user_type: user.role === "admin" ? "admin" : (user.user_type as "client" | "seller") || "client",
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

    console.log("[LOGIN] Attempting login for:", email);

    // Find user
    const user = await findUserByEmail(email);
    console.log("[LOGIN] Found user:", !!user, "role:", user?.role);

    if (!user) {
      console.log("[LOGIN] User not found");
      return jsonError(res, 401, "Invalid email or password");
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      console.log("[LOGIN] Invalid password");
      return jsonError(res, 401, "Invalid email or password");
    }

    console.log("[LOGIN] Login successful for:", email, "role:", user.role);

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: (user.role as "user" | "admin" | "seller") || "user",
      user_type: user.role === "admin" ? "admin" : (user.user_type as "client" | "seller") || (user.role === 'seller' ? 'seller' : 'client'),
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        user_type: user.role === "admin" ? "admin" : (user.user_type as "client" | "seller") || (user.role === 'seller' ? 'seller' : 'client'),
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
    const isValidPassword = await comparePassword(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return jsonError(res, 401, "Current password is incorrect");
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);
    await updateUser(user.id, { password_hash: hashedPassword });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return jsonError(res, 500, "Failed to change password");
  }
};
