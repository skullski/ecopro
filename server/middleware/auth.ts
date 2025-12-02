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
export const requireAdmin: RequestHandler = (req, res, next) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  if (user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  return next();
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
 * Middleware to check if user is a client (has dashboard access)
 */
export function requireClient(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  if (req.user.user_type !== "client" && req.user.user_type !== "admin") {
    res.status(403).json({ error: "Client access required" });
    return;
  }
  next();
}

/**
 * Middleware to check if user is a seller
 */
export function requireSeller(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  if (req.user.user_type !== "seller" && req.user.user_type !== "admin") {
    res.status(403).json({ error: "Seller access required" });
    return;
  }
  next();
}
