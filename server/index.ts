import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { handleDemo } from "./routes/demo";
import * as vendorRoutes from "./routes/vendors";
import * as uploadRoutes from "./routes/uploads";
import * as authRoutes from "./routes/auth";
import marketplaceRouter from "./routes/marketplace";
import storeProductsRouter from "./routes/storeProducts";
import { authenticate, requireAdmin, requireVendor } from "./middleware/auth";
import * as adminRoutes from "./routes/admin";
import {
  validate,
  registerValidation,
  loginValidation,
  productValidation,
  vendorValidation,
} from "./middleware/validation";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createServer() {
  const app = express();
  
  // Trust proxy for rate limiting (required for deployment behind reverse proxies like Render)
  app.set('trust proxy', 1);
    app.get("/api/products/owner/:ownerKey", vendorRoutes.getProductsByOwnerKey);
    app.get("/api/products/owner-email/:ownerEmail", vendorRoutes.getProductsByOwnerEmail);

  // Security: Helmet adds security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    })
  );

  // Claim a public product to this vendor
  // Removed premium claim product route

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

  // Image upload for product images (multipart/form-data)
  app.post("/api/products/upload", apiLimiter, uploadRoutes.upload.single('image'), uploadRoutes.uploadImage);

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

  // Marketplace (seller) routes
  app.use("/api/marketplace", marketplaceRouter);

  // Store products (premium dashboard) routes
  app.use("/api/store-products", storeProductsRouter);

  // Public vendor/product routes
  app.get("/api/vendors", apiLimiter, vendorRoutes.getVendors);
  app.get("/api/vendors/:id", apiLimiter, vendorRoutes.getVendorById);
  app.get("/api/vendors/slug/:slug", apiLimiter, vendorRoutes.getVendorBySlug);
  app.get("/api/products", apiLimiter, vendorRoutes.getProducts);
  app.get(
    "/api/products/vendor/:vendorId",
    apiLimiter,
    vendorRoutes.getVendorProducts
  );

  // Protected vendor routes (require authentication)
  // Public vendor signup: allow unauthenticated users to create vendor accounts
  app.post(
    "/api/vendors",
    vendorValidation,
    validate,
    vendorRoutes.createVendor
  );
  app.put(
    "/api/vendors/:id",
    authenticate,
    requireVendor,
    vendorValidation,
    validate,
    vendorRoutes.updateVendor
  );

  // Public product creation (anonymous marketplace sellers)
  app.post(
    "/api/products/public",
    vendorRoutes.createPublicProduct
  );

  // Protected product routes (require authentication)
  app.post(
    "/api/products",
    authenticate, // allow authenticated users to add products
    productValidation,
    validate,
    vendorRoutes.createProduct
  );
  app.put(
    "/api/products/:id",
    authenticate,
    requireVendor,
    productValidation,
    validate,
    vendorRoutes.updateProduct
  );
  app.delete(
    "/api/products/:id",
    authenticate,
    requireVendor,
    vendorRoutes.deleteProduct
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
