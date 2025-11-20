import { RequestHandler } from "express";

// Middleware to restrict access to paid clients (role: 'client' or is_paid_client true)
export const requirePaidClient: RequestHandler = (req, res, next) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "Not authenticated" });
  if (user.role === "client" || user.is_paid_client === true) {
    return next();
  }
  return res.status(403).json({ error: "Dashboard access requires a paid client account" });
};
