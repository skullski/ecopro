import { Request, Response, NextFunction } from "express";
import { verifyToken, extractToken } from "../utils/auth";
import { JWTPayload } from "@shared/api";

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
    return res.status(403).json({ error: "Admin access required" });
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
    return res.status(403).json({ error: "Vendor access required" });
  }
  next();
}


/**
 * Optional authentication - attaches user if token is valid, but doesn't reject if missing
 */
export function optionalAuthenticate(req: Request, res: Response, next: NextFunction): void {
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

/**
 * Middleware to ensure user has seller role
 */
export function ensureSeller(req: Request, res: Response, next: NextFunction) {
  if (!req.user || (req.user.role !== "vendor" && req.user.role !== "admin")) {
    return res.status(403).json({ error: "Access denied." });
  }
  next();
}
