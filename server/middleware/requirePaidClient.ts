import { RequestHandler } from "express";
import { JWTPayload } from "@shared/api";

// Middleware to restrict access to paid clients (role: 'user' with is_paid_client true)
export const requirePaidClient: RequestHandler = (req, res, next) => {
  const user = req.user as unknown as import("@shared/api").JWTPayload | undefined;
  if (!user) return res.status(401).json({ error: "Not authenticated" });
  if (user.role === "user" && user.is_paid_client === true) {
    return next();
  }
  return res.status(403).json({ error: "Dashboard access requires a paid client account" });
};
