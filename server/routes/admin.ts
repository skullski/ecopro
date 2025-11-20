import { pool, findUserById } from "../utils/database";

// List all premium users (admin only)
export const listPremiumUsers: RequestHandler = async (_req, res) => {
  try {
    const result = await pool.query("SELECT id, email, name, role FROM users WHERE is_paid_client = true OR role = 'premium' ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list premium users" });
  }
};

// Upgrade user to premium (admin only)
export const upgradeUserToPremium: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "User ID required" });
    const user = await findUserById(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { updateUser } = await import("../utils/database");
    const updated = await updateUser(id, { role: "premium", is_paid_client: true });
    res.json({ message: "User upgraded to premium", user: { id: updated.id, email: updated.email, role: updated.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upgrade user" });
  }
};

// Downgrade user to normal (admin only)
export const downgradeUserToNormal: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "User ID required" });
    const user = await findUserById(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { updateUser } = await import("../utils/database");
    const updated = await updateUser(id, { role: "seller", is_paid_client: false });
    res.json({ message: "User downgraded to normal", user: { id: updated.id, email: updated.email, role: updated.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to downgrade user" });
  }
};
import { RequestHandler } from "express";
import { requireAdmin } from "../middleware/auth";
import { findUserByEmail, updateUser } from "../utils/database";

// Promote a user to admin
export const promoteUserToAdmin: RequestHandler = async (req, res) => {
  try {
    // Only platform admins may call this endpoint
    // Middleware requireAdmin will enforce this

    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const user = await findUserByEmail(email);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const updated = await updateUser(user.id, { role: "admin" });
    res.json({ message: "User promoted to admin", user: { id: updated.id, email: updated.email, role: updated.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to promote user" });
  }
};

// List all users (platform admin only)
export const listUsers: RequestHandler = async (_req, res) => {
  try {
    const { pool } = await import("../utils/database");
    const result = await pool.query("SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list users" });
  }
};
