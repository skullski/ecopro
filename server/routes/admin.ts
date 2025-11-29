import { pool, findUserById } from "../utils/database";
import { jsonError } from '../utils/httpHelpers';
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
      return jsonError(res, 400, "Email is required");
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return jsonError(res, 404, "User not found");
    }

    const updated = await updateUser(user.id, { role: "admin" });
    res.json({ message: "User promoted to admin", user: { id: updated.id, email: updated.email, role: updated.role } });
  } catch (err) {
    console.error(err);
    return jsonError(res, 500, "Failed to promote user");
  }
};

// List all users (platform admin only)
export const listUsers: RequestHandler = async (_req, res) => {
  try {
    const { pool } = await import("../utils/database");
    const result = await pool.query("SELECT id, email, name, role, user_type, created_at FROM users ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    return jsonError(res, 500, "Failed to list users");
  }
};
