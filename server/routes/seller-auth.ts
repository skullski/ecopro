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

    // Check if seller already exists
    const existingSeller = await pool.query(
      "SELECT * FROM sellers WHERE email = $1",
      [email]
    );

    if (existingSeller.rows.length > 0) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create seller
    const result = await pool.query(
      "INSERT INTO sellers (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role",
      [email, hashedPassword, name || email.split("@")[0], "seller"]
    );

    const seller = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      {
        id: seller.id.toString(),
        email: seller.email,
        role: seller.role,
        user_type: 'seller',
      } as JWTPayload,
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: seller.id,
        email: seller.email,
        name: seller.name,
        role: seller.role,
        user_type: 'seller',
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

    // Find seller
    const result = await pool.query(
      "SELECT * FROM sellers WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const seller = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, seller.password);
    if (!validPassword) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: seller.id.toString(),
        email: seller.email,
        role: seller.role,
        user_type: 'seller',
      } as JWTPayload,
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: seller.id,
        email: seller.email,
        name: seller.name,
        role: seller.role,
        user_type: 'seller',
      },
    });
  } catch (error) {
    console.error("Seller login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};
