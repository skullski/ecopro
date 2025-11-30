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

    // Find seller (check both sellers table and users table for backwards compatibility)
    let result = await pool.query(
      "SELECT * FROM sellers WHERE email = $1",
      [email]
    );

    let seller = result.rows[0];
    let isFromUsersTable = false;

    // Fallback: check old users table if not found in sellers
    if (!seller) {
      result = await pool.query(
        "SELECT * FROM users WHERE email = $1 AND (user_type = 'seller' OR role = 'seller' OR role = 'admin')",
        [email]
      );
      seller = result.rows[0];
      isFromUsersTable = true;
    }

    if (!seller) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, seller.password);
    if (!validPassword) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // If user was found in old users table, migrate them to sellers table
    if (isFromUsersTable) {
      try {
        const migrateResult = await pool.query(
          "INSERT INTO sellers (email, password, name, phone, address, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (email) DO NOTHING RETURNING id",
          [
            seller.email,
            seller.password,
            seller.name,
            seller.phone,
            seller.address,
            seller.role === 'admin' ? 'admin' : 'seller',
            seller.created_at,
            seller.updated_at
          ]
        );
        if (migrateResult.rows[0]) {
          seller.id = migrateResult.rows[0].id;
        }
      } catch (migrateError) {
        console.error("Migration error (non-fatal):", migrateError);
      }
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
