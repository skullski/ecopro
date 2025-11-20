import jwt from "jsonwebtoken";

// JWT authentication middleware
export const requireAuth: RequestHandler = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token" });
  try {
    const decoded = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET || "changeme");
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
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

// Initialize database and create default admin user
(async () => {
  try {
    await initializeDatabase();
    const adminPassword = await hashPassword("admin123");
    await createDefaultAdmin("admin@ecopro.com", adminPassword);
  } catch (error) {
    console.error("Database initialization error:", error);
  }
})();

import { Router } from "express";
import { getUserFromRequest } from "../utils/auth";
import { updateUser, findUserById } from "../utils/database";

const router = Router();

// Seller to paid client (VIP) upgrade endpoint
// POST /api/auth/upgrade
  const user = getUserFromRequest(req);
  const dbUser = await findUserById(user.userId);
  if (!dbUser) return res.status(404).json({ error: "User not found" });
  if (dbUser.role !== "seller" || dbUser.is_paid_client) {
    return res.status(400).json({ error: "Upgrade not allowed" });
  }
  await updateUser(dbUser.id, { role: "client", is_paid_client: true });
  const upgraded = await findUserById(dbUser.id);
  res.json({ message: "Upgraded to VIP", user: upgraded });
});
// POST /api/auth/register
export const register: RequestHandler = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    // role: 'client' (paid) or 'seller' (default)
    const userRole = role === 'client' ? 'client' : 'seller';
    const isPaidClient = userRole === 'client';

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await createUser({
      email,
      password: hashedPassword,
      name,
      role: userRole,
      is_paid_client: isPaidClient,
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      is_paid_client: user.is_paid_client,
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        is_paid_client: user.is_paid_client,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
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
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
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
    res.status(500).json({ error: "Login failed" });
  }
};

/**
 * Verify token and get current user
 * GET /api/auth/me
 */
export const getCurrentUser: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const user = await findUserById(req.user.userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
};

/**
 * Change password
 * POST /api/auth/change-password
 */
export const changePassword: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    const user = await findUserById(req.user.userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: "Current password is incorrect" });
      return;
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);
    await updateUser(user.id, { password: hashedPassword });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
};
