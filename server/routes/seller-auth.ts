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

    // Check if user already exists
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

    // Create seller user
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

    // Find user
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Ensure user_type is set (for backwards compatibility)
    if (!user.user_type) {
      await pool.query(
        "UPDATE users SET user_type = $1 WHERE id = $2",
        [user.role === 'admin' ? 'admin' : 'seller', user.id]
      );
      user.user_type = user.role === 'admin' ? 'admin' : 'seller';
    }

    // Only allow sellers and admins to login here
    if (user.user_type !== 'seller' && user.user_type !== 'admin') {
      res.status(403).json({ 
        error: "Access denied. This login is for sellers only. Please use the platform home login for client accounts." 
      });
      return;
    }

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
    console.error("Seller login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};
