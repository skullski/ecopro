import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { handleDemo } from "./routes/demo";
import * as authRoutes from "./routes/auth";
import * as sellerAuthRoutes from "./routes/seller-auth";
import * as productRoutes from "./routes/products";
import { authenticate, requireAdmin, requireSeller } from "./middleware/auth";
import * as adminRoutes from "./routes/admin";
import * as dashboardRoutes from "./routes/dashboard";
import { initializeDatabase, createDefaultAdmin } from "./utils/database";
import { hashPassword } from "./utils/auth";
import {
  validate,
  registerValidation,
  loginValidation,
} from "./middleware/validation";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createServer() {
  const app = express();
  app.use(express.json());

  // Initialize database on startup
  initializeDatabase().catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });

  // Create default admin user
  hashPassword("admin123").then((hashedPassword) => {
    createDefaultAdmin("admin@ecopro.com", hashedPassword).catch(console.error);
  });

  // Trust proxy for rate limiting (required for deployment behind reverse proxies like Render)
  app.set("trust proxy", 1);

  // Security: Helmet adds security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      }
    })
  );

  // Security: Rate limiting to prevent brute force attacks
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: "Too many authentication attempts, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
  });

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: "Too many requests, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Security: CORS configuration
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["http://localhost:8080", "http://localhost:5173"];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Middleware
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Public routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth routes (with rate limiting)
  app.post(
    "/api/auth/register",
    authLimiter,
    registerValidation,
    validate,
    authRoutes.register
  );
  app.post(
    "/api/auth/login",
    authLimiter,
    loginValidation,
    validate,
    authRoutes.login
  );
  app.get("/api/auth/me", authenticate, authRoutes.getCurrentUser);
  app.post("/api/auth/change-password", authenticate, authRoutes.changePassword);

  // Seller auth routes (with rate limiting)
  app.post(
    "/api/seller/register",
    authLimiter,
    registerValidation,
    validate,
    sellerAuthRoutes.registerSeller
  );
  app.post(
    "/api/seller/login",
    authLimiter,
    loginValidation,
    validate,
    sellerAuthRoutes.loginSeller
  );

  // Public product routes
  app.get(
    "/api/products/categories/counts",
    apiLimiter,
    productRoutes.getCategoryCounts
  );
  app.get("/api/products", apiLimiter, productRoutes.getAllProducts);
  app.get("/api/products/:id", apiLimiter, productRoutes.getProductById);

  // Guest checkout (no auth)
  app.post("/api/guest/orders", apiLimiter, productRoutes.createGuestOrder);

  // Seller product management routes (protected)
  app.get(
    "/api/seller/products",
    authenticate,
    requireSeller,
    productRoutes.getSellerProducts
  );
  app.post(
    "/api/seller/products",
    authenticate,
    requireSeller,
    apiLimiter,
    productRoutes.createProduct
  );
  app.put(
    "/api/seller/products/:id",
    authenticate,
    requireSeller,
    apiLimiter,
    productRoutes.updateProduct
  );
  app.delete(
    "/api/seller/products/:id",
    authenticate,
    requireSeller,
    productRoutes.deleteProduct
  );

  // Seller orders route (DB-backed)
  app.get(
    "/api/seller/orders",
    authenticate,
    requireSeller,
    productRoutes.getSellerOrders
  );

  // Dashboard aggregated stats (authenticated users)
  app.get(
    "/api/dashboard/stats",
    authenticate,
    apiLimiter,
    dashboardRoutes.getDashboardStats
  );

  // Admin management routes (platform admin only)
  app.post(
    "/api/admin/promote",
    authenticate,
    requireAdmin,
    adminRoutes.promoteUserToAdmin
  );

  app.get(
    "/api/admin/users",
    authenticate,
    requireAdmin,
    adminRoutes.listUsers
  );

  // Serve static files from React build (only in production)
  if (process.env.NODE_ENV === "production") {
    // In production, __dirname is dist/server/, so we need to go up one level to dist/, then into spa/
    const spaBuildPath = path.join(__dirname, "../spa");
    app.use(express.static(spaBuildPath));

    // Handle React routing - send all non-API requests to index.html
    // Note: Using a middleware function instead of app.get("*") for Express 5 compatibility
    app.use((req, res, next) => {
      // Only serve index.html for GET requests that don't start with /api
      if (req.method === "GET" && !req.path.startsWith("/api")) {
        res.sendFile(path.join(spaBuildPath, "index.html"));
      } else {
        next();
      }
    });
  }

  return app;
}
