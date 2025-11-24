import { RequestHandler } from "express";
import { JWTPayload } from "@shared/api";

// Middleware to restrict access to paid clients (role: 'user' with is_paid_client true)
export const requirePaidClient: RequestHandler = (req, res, next) => {
  // Paid-client gating has been removed. This middleware now only requires authentication.
  const user = req.user as unknown as import("@shared/api").JWTPayload | undefined;
  if (!user) return res.status(401).json({ error: "Not authenticated" });
  return next();
};
