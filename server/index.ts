import "dotenv/config";
import express from "express";
import compression from "compression";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { handleDemo } from "./routes/demo";
import * as authRoutes from "./routes/auth";
import * as sellerAuthRoutes from "./routes/seller-auth";
import * as productRoutes from "./routes/products";
import * as stockRoutes from "./routes/stock";
import * as clientStoreRoutes from "./routes/client-store";
import * as publicStoreRoutes from "./routes/public-store";
import * as orderRoutes from "./routes/orders";
import { upload, uploadImage } from "./routes/uploads";
import { authenticate, requireAdmin, requireSeller, requireClient } from "./middleware/auth";
import * as adminRoutes from "./routes/admin";
import * as dashboardRoutes from "./routes/dashboard";
import * as botRoutes from "./routes/bot";
import { initializeDatabase, createDefaultAdmin, runPendingMigrations } from "./utils/database";
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
  // Compression early to reduce payload size
  app.use(
    compression({
      threshold: 0,
      level: 6,
    })
  );
  // Single body parsers with elevated limits BEFORE routes
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Initialize database then run pending migrations
  initializeDatabase()
    .then(() => runPendingMigrations())
    .catch((err) => {
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

  // NOTE: Removed duplicate express.json()/urlencoded registrations to avoid
  // early PayloadTooLargeError from default 100kb parser.

  // Graceful handler for payload too large errors
  app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err && err.type === 'entity.too.large') {
      return res.status(413).json({ error: 'Payload too large. Use image upload endpoint or reduce size.' });
    }
    return next(err);
  });

  // Public routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Database connectivity ping (quick simple query)
  app.get('/api/db/ping', async (_req, res) => {
    const start = performance.now();
    try {
      const r = await (await import('./utils/database')).pool.query('SELECT 1 as ok');
      const dur = performance.now() - start;
      res.set('Server-Timing', `db;dur=${dur.toFixed(2)}`);
      res.json({ ok: r.rows[0].ok, db_time_ms: dur });
    } catch (e) {
      res.status(500).json({ error: 'DB ping failed', details: (e as any).message });
    }
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

  // Bot settings routes (authenticated clients)
  app.get(
    "/api/bot/settings",
    authenticate,
    requireClient,
    apiLimiter,
    botRoutes.getBotSettings
  );

  app.put(
    "/api/bot/settings",
    authenticate,
    requireClient,
    apiLimiter,
    botRoutes.updateBotSettings
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

  app.delete(
    "/api/admin/users/:id",
    authenticate,
    requireAdmin,
    adminRoutes.deleteUser
  );

  app.post(
    "/api/admin/users/:id/convert-to-seller",
    authenticate,
    requireAdmin,
    adminRoutes.convertUserToSeller
  );

  app.delete(
    "/api/admin/sellers/:id",
    authenticate,
    requireAdmin,
    adminRoutes.deleteSeller
  );

  app.get(
    "/api/admin/stats",
    authenticate,
    requireAdmin,
    adminRoutes.getPlatformStats
  );

  // Client Stock Management routes (protected)
  app.get(
    "/api/client/stock",
    authenticate,
    requireClient,
    apiLimiter,
    stockRoutes.getClientStock
  );
  app.get(
    "/api/client/stock/alerts/low-stock",
    authenticate,
    requireClient,
    stockRoutes.getLowStockAlerts
  );
  app.get(
    "/api/client/stock/categories",
    authenticate,
    requireClient,
    stockRoutes.getStockCategories
  );
  app.get(
    "/api/client/stock/:id",
    authenticate,
    requireClient,
    stockRoutes.getStockById
  );
  app.get(
    "/api/client/stock/:id/history",
    authenticate,
    requireClient,
    stockRoutes.getStockHistory
  );
  app.post(
    "/api/client/stock",
    authenticate,
    requireClient,
    apiLimiter,
    stockRoutes.createStock
  );
  app.put(
    "/api/client/stock/:id",
    authenticate,
    requireClient,
    apiLimiter,
    stockRoutes.updateStock
  );
  app.post(
    "/api/client/stock/:id/adjust",
    authenticate,
    requireClient,
    apiLimiter,
    stockRoutes.adjustStockQuantity
  );
  app.delete(
    "/api/client/stock/:id",
    authenticate,
    requireClient,
    stockRoutes.deleteStock
  );

  // Client Store routes (private store for clients)
  app.get(
    "/api/client/store/products",
    authenticate,
    requireClient,
    clientStoreRoutes.getStoreProducts
  );
  app.get(
    "/api/client/store/products/:id",
    authenticate,
    requireClient,
    clientStoreRoutes.getStoreProduct
  );
  app.post(
    "/api/client/store/products",
    authenticate,
    requireClient,
    apiLimiter,
    clientStoreRoutes.createStoreProduct
  );
  app.put(
    "/api/client/store/products/:id",
    authenticate,
    requireClient,
    apiLimiter,
    clientStoreRoutes.updateStoreProduct
  );
  app.delete(
    "/api/client/store/products/:id",
    authenticate,
    requireClient,
    clientStoreRoutes.deleteStoreProduct
  );
  app.get(
    "/api/client/store/categories",
    authenticate,
    requireClient,
    clientStoreRoutes.getStoreCategories
  );
  app.get(
    "/api/client/store/settings",
    authenticate,
    requireClient,
    clientStoreRoutes.getStoreSettings
  );
  app.put(
    "/api/client/store/settings",
    authenticate,
    requireClient,
    apiLimiter,
    clientStoreRoutes.updateStoreSettings
  );
  app.get(
    "/api/client/store/stats",
    authenticate,
    requireClient,
    clientStoreRoutes.getStoreStats
  );
  app.get(
    "/api/client/store/products/:id/share-link",
    authenticate,
    requireClient,
    clientStoreRoutes.getProductShareLink
  );

  // Public store routes (no authentication required)
  app.get("/api/storefront/:storeSlug/products", publicStoreRoutes.getStorefrontProducts);
  app.get("/api/storefront/:storeSlug/settings", publicStoreRoutes.getStorefrontSettings);
  app.get("/api/store/:storeSlug/:productSlug", publicStoreRoutes.getPublicProduct);

  // Order routes
  app.post("/api/orders/create", orderRoutes.createOrder); // Public - buyers can create orders
  app.get("/api/client/orders", authenticate, requireClient, orderRoutes.getClientOrders);
  app.patch("/api/client/orders/:id/status", authenticate, requireClient, orderRoutes.updateOrderStatus);

  // Image upload route (authenticated users)
  app.post("/api/upload", authenticate, upload.single('image'), uploadImage);

  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

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

  // Lightweight health endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      uptime_seconds: process.uptime(),
      timestamp: new Date().toISOString(),
      commit: process.env.RENDER_GIT_COMMIT || process.env.GIT_COMMIT || null
    });
  });

  // Debug schema route (guarded by admin auth)
  app.get('/api/debug/schema', authenticate, requireAdmin, async (_req, res) => {
    try {
      const { pool } = await import('./utils/database');
      const tables = await pool.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema='public'
        ORDER BY table_name`);
      const details: Record<string, any[]> = {};
      for (const row of tables.rows) {
        const cols = await pool.query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = $1 AND table_schema='public'`, [row.table_name]);
        details[row.table_name] = cols.rows;
      }
      res.json({ tables: tables.rows.map(r => r.table_name), columns: details });
    } catch (e) {
      res.status(500).json({ error: 'Schema introspection failed', details: (e as any).message });
    }
  });

  // Global error handler (after routes)
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (res.headersSent) return;
    const status = err.status || 500;
    console.error('Unhandled error:', err);
    res.status(status).json({ error: err.message || 'Internal Server Error', status });
  });

  return app;
}
