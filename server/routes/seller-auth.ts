import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { pool } from "../utils/database";
import { JWTPayload } from "@shared/api";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * Register a new seller account
 * POST /api/seller/register
 */
export const registerSeller: RequestHandler = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    // Check if user already exists in users table
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in users table with seller role
    const result = await pool.query(
      "INSERT INTO users (email, password, name, role, user_type) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role, user_type",
      [email, hashedPassword, name || email.split("@")[0], "seller", "seller"]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id.toString(),
        email: user.email,
        role: user.role,
        user_type: user.user_type,
      } as JWTPayload,
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        user_type: user.user_type,
      },
    });
  } catch (error) {
    console.error("Seller registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
};

/**
 * Login for seller accounts
 * POST /api/seller/login
 */
export const loginSeller: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    console.log("[SELLER LOGIN] Attempting login for:", email);

    // Use users table directly (sellers/clients tables don't exist yet)
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      console.log("[SELLER LOGIN] User not found");
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const user = result.rows[0];
    console.log("[SELLER LOGIN] Found user, role:", user.role, "user_type:", user.user_type);

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log("[SELLER LOGIN] Invalid password");
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    console.log("[SELLER LOGIN] Login successful for:", email);

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id.toString(),
        email: user.email,
        role: user.role,
        user_type: user.user_type || 'seller',
      } as JWTPayload,
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        user_type: user.user_type || 'seller',
      },
    });
  } catch (error) {
    console.error("[SELLER LOGIN] Seller login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};
