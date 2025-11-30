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
import {
  findClientByEmail,
  findClientById,
  createClient,
  updateClient,
} from "../utils/client-database";

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

    // Check if client already exists
    const existingClient = await findClientByEmail(email);
    if (existingClient) {
      console.log("[REGISTER] Email already registered:", email);
      return jsonError(res, 400, "Email already registered");
    }

    // Hash password
    const hashedPassword = await hashPassword(password);
    console.log("[REGISTER] Password hashed");

    // Create client
    const client = await createClient({
      email,
      password: hashedPassword,
      name,
      role: (role as "client" | "admin") || "client",
    });
    console.log("[REGISTER] Client created:", client.id, client.email);

    // Generate token
    const token = generateToken({
      id: client.id.toString(),
      email: client.email,
      role: (client.role as "user" | "admin") || "user",
      user_type: client.role === "admin" ? "admin" : "client",
    });
    console.log("[REGISTER] Token generated");

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: client.id,
        email: client.email,
        name: client.name,
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

    // Find client (check both clients table and users table for backwards compatibility)
    let client = await findClientByEmail(email);
    let isFromUsersTable = false;

    // Fallback: check old users table if not found in clients
    if (!client) {
      const user = await findUserByEmail(email);
      if (user && (user.user_type === 'client' || user.role === 'client' || user.role === 'user' || user.role === 'admin')) {
        client = user as any;
        isFromUsersTable = true;
      }
    }

    if (!client) {
      return jsonError(res, 401, "Invalid email or password");
    }

    // Verify password
    const isValidPassword = await comparePassword(password, client.password);
    if (!isValidPassword) {
      return jsonError(res, 401, "Invalid email or password");
    }

    // If user was found in old users table, migrate them to clients table
    if (isFromUsersTable) {
      try {
        const migratedClient = await createClient({
          email: client.email,
          password: client.password, // Already hashed
          name: client.name,
          phone: client.phone,
          role: client.role === 'admin' ? 'admin' : 'client',
        });
        client = migratedClient;
      } catch (migrateError: any) {
        // If duplicate key error (already migrated), fetch from clients table
        if (migrateError.code === '23505') {
          client = await findClientByEmail(email);
        } else {
          console.error("Migration error (non-fatal):", migrateError);
        }
      }
    }

    // Generate token
    const token = generateToken({
      id: client.id.toString(),
      email: client.email,
      role: (client.role as "user" | "admin") || "user",
      user_type: client.role === "admin" ? "admin" : "client",
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: client.id,
        email: client.email,
        name: client.name,
        role: client.role,
        user_type: "client",
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

    const client = await findClientById(req.user.id);
    if (!client) {
      return jsonError(res, 404, "User not found");
    }

    res.json({
      id: client.id,
      email: client.email,
      name: client.name,
      role: client.role as "user" | "admin",
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

    const client = await findClientById(req.user.id);
    if (!client) {
      return jsonError(res, 404, "User not found");
    }

    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, client.password);
    if (!isValidPassword) {
      return jsonError(res, 401, "Current password is incorrect");
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);
    await updateClient(client.id, { password: hashedPassword });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return jsonError(res, 500, "Failed to change password");
  }
};
