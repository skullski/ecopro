import "dotenv/config";
import express from "express";
import compression from "compression";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
// import rateLimit from "express-rate-limit"; // DISABLED FOR TESTING
import { handleDemo } from "./routes/demo";
import * as authRoutes from "./routes/auth";
import * as productRoutes from "./routes/products";
import * as stockRoutes from "./routes/stock";
import * as clientStoreRoutes from "./routes/client-store";
import * as publicStoreRoutes from "./routes/public-store";
import * as templateRoutes from "./routes/templates";
import { createProduct as createStorefrontProduct, updateProduct as updateStorefrontProduct, deleteProduct as deleteStorefrontProduct, handleUploadImages as uploadStorefrontImages } from "./routes/storefront";
import * as orderRoutes from "./routes/orders";
import * as orderConfirmationRoutes from "./routes/order-confirmation";
import { upload, uploadImage } from "./routes/uploads";
import { authenticate, optionalAuthenticate, requireAdmin, requireClient, requireStoreOwner } from "./middleware/auth";
import { requireActiveSubscription } from "./middleware/subscription-check";
import * as adminRoutes from "./routes/admin";
import * as dashboardRoutes from "./routes/dashboard";
import * as botRoutes from "./routes/bot";
import * as telegramRoutes from "./routes/telegram";
import { trafficMiddleware } from './utils/traffic';
import * as staffRoutes from "./routes/staff";
import * as billingRoutes from "./routes/billing";
import kernelRouter, { initKernel } from "./routes/kernel";
import trapsRouter from "./routes/traps";
import intelRouter from "./routes/intel";
import { usersRouter } from "./routes/users";
import { deliveryRouter } from "./routes/delivery";
import googleSheetsRouter from "./routes/google-sheets";
import chatRouter from "./routes/chat";
import codesRouter from "./routes/codes";
import customerBotRouter from "./routes/customer-bot";
import { authenticateStaff, requireStaffPermission, requireStaffClientAccess } from "./utils/staff-middleware";
import { initializeDatabase, createDefaultAdmin, runPendingMigrations } from "./utils/database";
import { handleHealth } from "./routes/health";
import { handleDbCheck } from "./routes/db-check";
import { hashPassword } from "./utils/auth";
import { purgeOldSecurityEvents, securityMiddleware } from "./utils/security";
import {
  validate,
  registerValidation,
  loginValidation,
} from "./middleware/validation";
import { deleteStoreImage } from "./routes/store";

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
  const url = process.env.DATABASE_URL || '';
  const masked = url.replace(/:(.*?)@/, ':****@');
  console.log('🗄️ DATABASE_URL:', masked || '(not set)');
  initializeDatabase()
    .then(async () => {
      if (process.env.SKIP_MIGRATIONS === 'true') {
        console.log('⏭️ SKIP_MIGRATIONS=true — skipping SQL migrations');
        await initKernel().catch((e) => console.error('Kernel init failed:', e));
        return;
      }
      await runPendingMigrations();
      await initKernel().catch((e) => console.error('Kernel init failed:', e));
    })
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

  // Security: Helmet adds security headers (DISABLED for troubleshooting)
  /*
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
  */

  // Security: Rate limiting to prevent brute force attacks
  // Rate limiting DISABLED for testing
  const authLimiter = (_req: any, _res: any, next: any) => next();
  const apiLimiter = (_req: any, _res: any, next: any) => next();

  // Security: CORS configuration
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["http://localhost:8080", "http://localhost:5173"];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        // In production, allow same-origin requests
        const isProduction = process.env.NODE_ENV === 'production';
        if (isProduction) {
          return callback(null, true);
        }
        
        // Allow any localhost port for dev convenience
        const isLocalhost = /^http:\/\/localhost:\d+$/.test(origin);
        if (isLocalhost || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        
        console.warn('CORS blocked origin:', origin);
        callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Attach req.user when a valid token exists (without rejecting missing/invalid tokens)
  app.use(optionalAuthenticate);

  // Lightweight in-memory traffic capture (used by Kernel portal)
  app.use(trafficMiddleware);

  // Security monitoring: DZ-only hard block for unauth traffic + event logging
  app.use(
    securityMiddleware({
      dzOnlyUnauth: true,
      allowUnknownCountry: false,
      retentionDays: 90,
    })
  );

  // Obvious trap endpoints/pages (always 404, but logged)
  app.use(trapsRouter);

  // Enforce 90-day retention for security events
  void purgeOldSecurityEvents(90)
    .then((n) => {
      if (n > 0) console.log(`[security] Purged ${n} old events`);
    })
    .catch(() => null);
  setInterval(() => {
    void purgeOldSecurityEvents(90).catch(() => null);
  }, 6 * 60 * 60 * 1000);

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

  // Health check: confirms DB connectivity regardless of frontend port
  app.get("/api/health", handleHealth);

  // DB details check (non-sensitive; shows current_database and socket)
  app.get("/api/db-check", handleDbCheck);

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

  // Telegram webhook (public)
  app.post('/api/telegram/webhook', telegramRoutes.telegramWebhook);

  // Auth routes (with rate limiting)
  app.post(
    "/api/auth/register",
    // authLimiter, // REMOVED FOR TESTING
    registerValidation,
    validate,
    authRoutes.register
  );
  app.post(
    "/api/auth/login",
    // authLimiter, // REMOVED FOR TESTING
    loginValidation,
    validate,
    authRoutes.login
  );
  app.get("/api/auth/me", authenticate, authRoutes.getCurrentUser);
  app.post("/api/auth/change-password", authenticate, authRoutes.changePassword);

  // Kernel (root-only) APIs
  app.use('/api/kernel', kernelRouter);
  
  // IP Intelligence APIs (public + admin)
  app.use('/api/intel', intelRouter);
  
  // Admin: Search user by email
  app.get("/api/users/search", authenticate, authRoutes.searchUserByEmail);

  // Client profile APIs
  app.use('/api/users', authenticate, usersRouter);

  // Public product routes
  app.get(
    "/api/products/categories/counts",
    apiLimiter,
    productRoutes.getCategoryCounts
  );
  app.get("/api/products", apiLimiter, productRoutes.getAllProducts);
  app.get("/api/products/:id", apiLimiter, productRoutes.getProductById);

  // Templates API (public)
  app.get("/api/templates", apiLimiter, templateRoutes.getTemplates);
  app.get("/api/templates/:id", apiLimiter, templateRoutes.getTemplateById);
  app.get("/api/templates/category/:category", apiLimiter, templateRoutes.getTemplatesByCategory);

  // Guest checkout (no auth)
  app.post("/api/guest/orders", apiLimiter, productRoutes.createGuestOrder);

  // Staff orders route (staff members can access their store's orders)
  app.get(
    "/api/staff/orders",
    authenticateStaff,
    requireStaffPermission('view_orders'),
    staffRoutes.getStaffOrders
  );

  // Staff order status update route
  app.patch(
    "/api/staff/orders/:orderId/status",
    authenticateStaff,
    requireStaffPermission('edit_orders'),
    staffRoutes.updateStaffOrderStatus
  );

  // Staff login (unauthenticated)
  app.post(
    "/api/staff/login",
    apiLimiter,
    staffRoutes.staffLogin
  );

  // Subscription check middleware: Enforce active subscriptions on /api/client/*, /api/seller/*, and /api/store/* routes
  // This must come AFTER staff/login (public route) but BEFORE authenticated routes
  app.use(/^\/api\/client\//, authenticate, requireActiveSubscription);
  app.use(/^\/api\/seller\//, authenticate, requireActiveSubscription);
  app.use(/^\/api\/store\//, authenticate, requireActiveSubscription);

  // Staff management routes (authenticated store owners/clients only)
  app.post(
    "/api/client/staff/create",
    authenticate,
    requireStoreOwner,
    apiLimiter,
    staffRoutes.createStaff
  );
  app.post(
    "/api/client/staff/invite",
    authenticate,
    requireStoreOwner,
    apiLimiter,
    staffRoutes.inviteStaff
  );
  app.get(
    "/api/client/staff",
    authenticate,
    requireStoreOwner,
    staffRoutes.getStaffList
  );
  app.patch(
    "/api/client/staff/:id/permissions",
    authenticate,
    requireStoreOwner,
    apiLimiter,
    staffRoutes.updateStaffPermissions
  );
  app.delete(
    "/api/client/staff/:id",
    authenticate,
    requireStoreOwner,
    apiLimiter,
    staffRoutes.removeStaff
  );
  app.get(
    "/api/client/staff/:id/activity",
    authenticate,
    requireStoreOwner,
    staffRoutes.getActivityLog
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
  app.delete(
    "/api/admin/client-store/products/:id",
    authenticate,
    requireAdmin,
    adminRoutes.deleteClientStoreProduct
  );

  app.get(
    "/api/admin/stats",
    authenticate,
    requireAdmin,
    adminRoutes.getPlatformStats
  );

  app.get(
    "/api/admin/staff",
    authenticate,
    requireAdmin,
    adminRoutes.listAllStaff
  );

  app.delete(
    "/api/admin/staff/:id",
    authenticate,
    requireAdmin,
    adminRoutes.deleteStaffMember
  );

  app.get(
    "/api/admin/stores",
    authenticate,
    requireAdmin,
    adminRoutes.listAllStores
  );

  app.get(
    "/api/admin/activity-logs",
    authenticate,
    requireAdmin,
    adminRoutes.listActivityLogs
  );

  app.get(
    "/api/admin/products",
    authenticate,
    requireAdmin,
    adminRoutes.listAllProducts
  );

  app.post(
    "/api/admin/flag-product",
    authenticate,
    requireAdmin,
    adminRoutes.flagProduct
  );

  app.post(
    "/api/admin/unflag-product",
    authenticate,
    requireAdmin,
    adminRoutes.unflagProduct
  );

  // Account lock/unlock routes
  app.post(
    "/api/admin/users/:id/lock",
    authenticate,
    requireAdmin,
    adminRoutes.lockUser
  );

  app.post(
    "/api/admin/users/:id/unlock",
    authenticate,
    requireAdmin,
    adminRoutes.unlockUser
  );

  // Get locked accounts (for Tools page)
  app.get(
    "/api/admin/locked-accounts",
    authenticate,
    requireAdmin,
    adminRoutes.getLockedAccounts
  );

  // Unlock account with options (extend days or mark as paid)
  app.post(
    "/api/admin/unlock-account",
    authenticate,
    requireAdmin,
    adminRoutes.unlockAccountWithOptions
  );

  // Lock account manually for subscription issues
  app.post(
    "/api/admin/lock-account",
    authenticate,
    requireAdmin,
    adminRoutes.lockAccountManually
  );

  // Billing routes (both user and admin)
  app.get(
    "/api/billing/subscription",
    authenticate,
    billingRoutes.getSubscription
  );

  app.get(
    "/api/billing/check-access",
    authenticate,
    billingRoutes.checkAccess
  );

  // Admin billing routes
  app.get(
    "/api/billing/admin/subscriptions",
    authenticate,
    requireAdmin,
    billingRoutes.getAllSubscriptions
  );

  app.get(
    "/api/billing/admin/metrics",
    authenticate,
    requireAdmin,
    billingRoutes.getPaymentMetrics
  );

  app.get(
    "/api/billing/admin/settings",
    authenticate,
    requireAdmin,
    billingRoutes.getPlatformSettings
  );

  app.post(
    "/api/billing/admin/settings",
    authenticate,
    requireAdmin,
    billingRoutes.updatePlatformSettings
  );

  app.get(
    "/api/billing/admin/stores",
    authenticate,
    requireAdmin,
    billingRoutes.getStoresWithSubscription
  );

  // Admin: Expire subscription (for testing)
  app.post(
    "/api/billing/admin/expire-subscription",
    authenticate,
    requireAdmin,
    billingRoutes.expireSubscription
  );

  // Admin: Reactivate subscription
  app.post(
    "/api/billing/admin/reactivate-subscription",
    authenticate,
    requireAdmin,
    billingRoutes.reactivateSubscription
  );

  // Phase 3: Checkout and payment endpoints
  app.post(
    "/api/billing/checkout",
    authenticate,
    apiLimiter,
    billingRoutes.createCheckout
  );

  app.get(
    "/api/billing/payments",
    authenticate,
    billingRoutes.getPaymentHistory
  );

  // Payment failures management endpoints
  app.get(
    "/api/billing/admin/payment-failures",
    authenticate,
    requireAdmin,
    billingRoutes.getPaymentFailures
  );

  app.post(
    "/api/billing/admin/retry-payment",
    authenticate,
    requireAdmin,
    billingRoutes.retryPayment
  );
  // RedotPay webhook (public, signature verified, with raw body parser)
  app.post(
    "/api/billing/webhook/redotpay",
    express.raw({ type: 'application/json' }),
    (req, res, next) => {
      // Convert raw body back to json for handler
      try {
        if (Buffer.isBuffer(req.body)) {
          (req as any).rawBody = req.body.toString('utf8');
          req.body = JSON.parse((req as any).rawBody);
        }
        next();
      } catch (e) {
        res.status(400).json({ error: 'Invalid JSON' });
      }
    },
    billingRoutes.handleRedotPayWebhook
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
  app.get("/api/storefront/:storeSlug/products/:productId", publicStoreRoutes.getStorefrontProductById);
  app.get("/api/storefront/:storeSlug/settings", publicStoreRoutes.getStorefrontSettings);
  app.get("/api/store/:storeSlug/:productSlug", publicStoreRoutes.getPublicProduct);
  app.post("/api/storefront/:storeSlug/orders", publicStoreRoutes.createPublicStoreOrder);

  // Private store product management (seller/client must be authenticated)
  app.post("/api/storefront/:storeSlug/products", authenticate, requireClient, apiLimiter, createStorefrontProduct);
  app.put("/api/storefront/:storeSlug/products/:id", authenticate, requireClient, apiLimiter, updateStorefrontProduct);
  app.delete("/api/storefront/:storeSlug/products/:id", authenticate, requireClient, deleteStorefrontProduct);
  app.post("/api/storefront/:storeSlug/products/:id/images", authenticate, requireClient, uploadStorefrontImages);

  // Order routes
  app.post("/api/orders/create", orderRoutes.createOrder); // Public - buyers can create orders
  app.get("/api/client/orders", authenticate, requireClient, orderRoutes.getClientOrders);
  
  // Order statuses routes (authenticated - client only)
  app.get("/api/client/order-statuses", authenticate, requireClient, orderRoutes.getOrderStatuses);
  app.post("/api/client/order-statuses", authenticate, requireClient, orderRoutes.createOrderStatus);
  app.patch("/api/client/order-statuses/:id", authenticate, requireClient, orderRoutes.updateOrderStatus as any);
  app.delete("/api/client/order-statuses/:id", authenticate, requireClient, orderRoutes.deleteOrderStatus as any);

  // Order confirmation routes (public - no auth required)
  app.get("/api/storefront/:storeSlug/order/:orderId", orderConfirmationRoutes.getOrderForConfirmation);
  app.post("/api/storefront/:storeSlug/order/:orderId/confirm", orderConfirmationRoutes.confirmOrder);
  app.patch("/api/storefront/:storeSlug/order/:orderId/update", orderConfirmationRoutes.updateOrderDetails);
  app.patch("/api/client/orders/:id/status", authenticate, requireClient, orderRoutes.updateOrderStatus);

  // Delivery routes (authenticated)
  app.use('/api/delivery', authenticate, deliveryRouter);

  // Google Sheets integration routes (authenticated)
  app.use('/api/google', authenticate, googleSheetsRouter);

  // Chat routes (authenticated - handles both client and seller roles)
  app.use('/api/chat', authenticate, chatRouter);

  // Subscription codes routes (authenticated - client/seller operations)
  app.use('/api/codes', authenticate, codesRouter);

  // Customer Bot routes (authenticated - for store owners to message customers)
  app.use('/api/customer-bot', authenticate, requireClient, customerBotRouter);

  // Checkout session routes (database-backed, not localStorage)
  app.post("/api/checkout/save-product", orderRoutes.saveProductForCheckout); // Public - save product for checkout
  app.get("/api/checkout/get-product/:sessionId", orderRoutes.getProductForCheckout); // Public - retrieve product from checkout session

  // Image upload route (authenticated users) - with error handling for multer
  app.post("/api/upload", authenticate, (req, res, next) => {
    upload.single('image')(req, res, (err: any) => {
      if (err) {
        console.error('[upload middleware] multer error:', err);
        return res.status(400).json({ error: `Upload failed: ${err.message}` });
      }
      uploadImage(req, res, next);
    });
  });

  // Register the delete store image route
  app.delete("/api/store/image", deleteStoreImage);

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
