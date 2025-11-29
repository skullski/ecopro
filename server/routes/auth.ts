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
    const user = await createUser({
      email,
      password: hashedPassword,
      name,
      role: (role as "user" | "admin") || "user",
    });
    console.log("[REGISTER] User created:", user.id, user.email);

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

    // Find user
    const user = await findUserByEmail(email);
    if (!user) {
      return jsonError(res, 401, "Invalid email or password");
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return jsonError(res, 401, "Invalid email or password");
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: (user.role as "user" | "admin") || "user",
      user_type: user.role === "admin" ? "admin" : (user.user_type as "client" | "seller") || "client",
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
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
