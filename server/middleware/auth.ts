/**
 * Middleware to check if user has premium (dashboard) access
 */
export function requirePremium(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  if (req.user.role !== "premium" && req.user.role !== "admin") {
    res.status(403).json({ error: "Premium access required" });
    return;
  }
  next();
}
import { Request, Response, NextFunction } from "express";
import { verifyToken, extractToken, JWTPayload } from "../utils/auth";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractToken(req.headers.authorization);
    
    if (!token) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Middleware to check if user has admin role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }

  next();
}

/**
 * Middleware to check if user has vendor role
 */
export function requireVendor(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  if (req.user.role !== "vendor" && req.user.role !== "admin") {
    res.status(403).json({ error: "Vendor access required" });
    return;
  }

  next();
}

/**
 * Middleware to check vendor has VIP subscription (paid)
 */
export async function requireVip(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  // Admins bypass VIP restriction
  if (req.user.role === "admin") return next();

  // Only vendors supported here
  if (req.user.role !== "vendor") {
    res.status(403).json({ error: "Vendor access required" });
    return;
  }

  // Find vendor record by email and ensure they are VIP
  try {
    const { findVendorByEmail } = await import("../utils/vendorsDb");
    const vendor = await findVendorByEmail(req.user.email);
    if (!vendor) {
      return res.status(403).json({ error: "Vendor account not found" });
    }

    if (!vendor.isVIP && vendor.subscriptionStatus !== "vip") {
      return res.status(403).json({ error: "VIP subscription required for management" });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to validate vendor subscription" });
  }
}

/**
 * Optional authentication - attaches user if token is valid, but doesn't reject if missing
 */
export function optionalAuthenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractToken(req.headers.authorization);
    
    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded;
    }
  } catch (error) {
    // Token invalid but we don't reject the request
  }
  
  next();
}
