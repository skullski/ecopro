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

    // Check if seller already exists in sellers table
    const existingSeller = await pool.query(
      "SELECT id FROM sellers WHERE email = $1",
      [email]
    );
    if (existingSeller.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered as seller" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create seller in sellers table
    const result = await pool.query(
      "INSERT INTO sellers (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name",
      [email, hashedPassword, name || email.split("@")[0]]
    );

    const seller = result.rows[0];

    // Ensure seller has a storefront settings row
    try {
      const slug = 'seller-' + (seller.id || Math.random().toString(36).substr(2,8));
      await pool.query(
        `INSERT INTO seller_store_settings (seller_id, store_name, store_slug, created_at)
         VALUES ($1, $2, $3, NOW()) ON CONFLICT (seller_id) DO NOTHING`,
        [seller.id, seller.name || email.split('@')[0], slug]
      );
    } catch (e) {
      console.error('Could not create seller_store_settings for seller:', seller.id, (e as any).message);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: seller.id.toString(),
        email: seller.email,
        role: 'user',
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
        role: 'seller',
        user_type: 'seller',
      },
    });
  } catch (error) {
    console.error("Seller registration error:", error);
    const msg = (error as any)?.message || "Registration failed";
    if (msg.includes("unique") || msg.includes("already exists")) {
      return res.status(400).json({ error: "Email already registered" });
    }
    res.status(500).json({ error: msg });
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

    // Use sellers table for marketplace authentication
    const result = await pool.query(
      "SELECT * FROM sellers WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      console.log("[SELLER LOGIN] User not found");
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const seller = result.rows[0];
    console.log("[SELLER LOGIN] Found seller:", seller.email);

    // Verify password
    const validPassword = await bcrypt.compare(password, seller.password);
    if (!validPassword) {
      console.log("[SELLER LOGIN] Invalid password");
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // No role mixing here: sellers table implies seller access

    console.log("[SELLER LOGIN] Login successful for:", email);

    // Generate JWT token
    const token = jwt.sign(
      {
        id: seller.id.toString(),
        email: seller.email,
        role: 'user',
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
        role: 'seller',
        user_type: 'seller',
      },
    });
  } catch (error) {
    console.error("[SELLER LOGIN] Seller login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};
