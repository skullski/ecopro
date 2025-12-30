import { Request, Response, NextFunction } from "express";
import type { RequestHandler } from 'express';
import { verifyToken, extractToken } from "../utils/auth";
import { JWTPayload } from "@shared/api";
import { findUserById } from '../utils/database';
import { clearAuthCookies } from '../utils/auth-cookies';

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
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const cookieToken = (req as any).cookies?.ecopro_at as string | undefined;
    const headerToken = extractToken(req.headers.authorization);
    const token = cookieToken || headerToken;
    
    if (!token) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const decoded: any = verifyToken(token);
    if (decoded?.isStaff === true || decoded?.user_type === 'staff') {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }
    const role = decoded?.role;
    const normalizedRole = role === 'admin' || role === 'user' || role === 'seller' || role === 'root' ? role : 'user';
    req.user = { ...decoded, role: normalizedRole } as JWTPayload;

    // Enforce admin block immediately (logout + deny) even if token is still valid.
    try {
      const dbUser = await findUserById(String((req.user as any).id));
      if (dbUser && (dbUser as any).is_blocked) {
        clearAuthCookies(res as any);
        res.status(403).json({ error: 'Account is blocked', blocked: true, blocked_reason: (dbUser as any).blocked_reason || null });
        return;
      }
    } catch {
      res.status(503).json({ error: 'Unable to validate account status' });
      return;
    }

    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Middleware to check if user has admin role
 */
export const requireAdmin: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
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
    const cookieToken = ((req as any).cookies?.ecopro_at || (req as any).cookies?.ecopro_kernel_at) as string | undefined;
    const headerToken = extractToken(req.headers.authorization);
    const token = cookieToken || headerToken;
    
    if (token) {
      const decoded: any = verifyToken(token);
      if (decoded?.isStaff === true || decoded?.user_type === 'staff') {
        return next();
      }
      const role = decoded?.role;
      const normalizedRole = role === 'admin' || role === 'user' || role === 'seller' || role === 'root' ? role : 'user';
      req.user = { ...decoded, role: normalizedRole } as JWTPayload;
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
 * Middleware to check if user is a seller (REMOVED - sellers no longer exist)
 */
export function requireSeller(req: Request, res: Response, next: NextFunction) {
  // Sellers have been removed from the platform
  res.status(403).json({ error: "Seller functionality has been removed" });
  return;
}

/**
 * Middleware to check if user is a store owner (clients only)
 * Allows clients with stores
 */
export function requireStoreOwner(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required - no user in token" });
    return;
  }

  // Check if user has valid user_type
  if (!req.user.user_type) {
    res.status(403).json({ error: "Invalid token - user_type missing" });
    return;
  }

  // Allow if user is admin or client (removed seller check)
  if (req.user.user_type !== "admin" && req.user.user_type !== "client") {
    res.status(403).json({ error: `Store owner access required - got user_type: ${req.user.user_type}` });
    return;
  }
  next();
}
