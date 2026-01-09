import "dotenv/config";
import express from "express";
import compression from "compression";
import cors from "cors";
import cookieParser from 'cookie-parser';
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import crypto from 'crypto';
import fs from 'fs/promises';
import { handleDemo } from "./routes/demo";
import * as authRoutes from "./routes/auth";
import * as stockRoutes from "./routes/stock";
import * as clientStoreRoutes from "./routes/client-store";
import * as publicStoreRoutes from "./routes/public-store";
import * as templateRoutes from "./routes/templates";
import { createProduct as createStorefrontProduct, updateProduct as updateStorefrontProduct, deleteProduct as deleteStorefrontProduct, handleUploadImages as uploadStorefrontImages } from "./routes/storefront";
import * as orderRoutes from "./routes/orders";
import * as orderConfirmationRoutes from "./routes/order-confirmation";
import { upload, uploadImage, serveSignedUpload } from "./routes/uploads";
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
import pixelsRouter from "./routes/pixels";
import { authenticateStaff, requireStaffPermission, requireStaffClientAccess } from "./utils/staff-middleware";
import { initializeDatabase, createDefaultAdmin, runPendingMigrations } from "./utils/database";
import { handleHealth } from "./routes/health";
import { handleDbCheck } from "./routes/db-check";
import { hashPassword } from "./utils/auth";
import { purgeOldSecurityEvents, securityMiddleware } from "./utils/security";
import { startScheduledMessageWorker } from "./utils/scheduled-messages";
import oauthRouter from "./routes/oauth";
import messengerRouter from "./routes/messenger";
import deliveryPricesRouter, { getStorefrontDeliveryPrices } from "./routes/delivery-prices";
import {
  validate,
  registerValidation,
  loginValidation,
} from "./middleware/validation";
import { deleteStoreImage } from "./routes/store";
import { validateProductionEnv } from "./utils/required-env";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createServer(options?: { skipDbInit?: boolean }) {
  const app = express();
  const isProduction = process.env.NODE_ENV === 'production';

  // Fail-fast on missing secrets / unsafe config in production.
  // (Keep this early; it should run before expensive initialization.)
  if (isProduction) {
    try {
      validateProductionEnv();
    } catch (e: any) {
      console.error(e?.message || e);
      process.exit(1);
    }
  }
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
  const url = (process.env.DATABASE_URL || '').trim();
  const hasDatabaseUrl = Boolean(url);
  const masked = url.replace(/:(.*?)@/, ':****@');
  if (!isProduction) {
    console.log('🗄️ DATABASE_URL:', hasDatabaseUrl ? masked : '(not set)');
  }

  const skipDbInit = Boolean(options?.skipDbInit);
  if (skipDbInit && !isProduction) {
    console.log('⏭️ SKIP_DB_INIT (dev) — skipping database initialization in createServer');
  } else if (hasDatabaseUrl || isProduction) {
    initializeDatabase()
      .then(async () => {
        if (process.env.SKIP_MIGRATIONS === 'true') {
          console.log('⏭️ SKIP_MIGRATIONS=true — skipping SQL migrations');
          await initKernel().catch((e) => console.error('Kernel init failed:', e));
          startScheduledMessageWorker();
          return;
        }
        await runPendingMigrations();
        await initKernel().catch((e) => console.error('Kernel init failed:', e));
        // Start the scheduled message worker (for bot confirmations)
        startScheduledMessageWorker();
      })
      .catch((err) => {
        console.error('Failed to initialize database:', err);
        if (isProduction) {
          process.exit(1);
        }
        console.warn('⚠️ Dev mode: continuing without DB (routes that require DB will fail until DB is reachable)');
      });
  } else {
    console.log('⚠️  No DATABASE_URL set; skipping database initialization');
  }

  // Default admin bootstrap
  // - Never auto-create an admin with a hardcoded password in production.
  // - In dev only, you may opt-in via env to simplify local testing.
  if (process.env.CREATE_DEFAULT_ADMIN === 'true') {
    const email = (process.env.DEFAULT_ADMIN_EMAIL || 'admin@ecopro.com').trim();
    const password = (process.env.DEFAULT_ADMIN_PASSWORD || '').trim();

    if (!password) {
      console.warn('⚠️  CREATE_DEFAULT_ADMIN=true but DEFAULT_ADMIN_PASSWORD is not set; skipping admin bootstrap');
    } else {
      hashPassword(password).then((hashedPassword) => {
        createDefaultAdmin(email, hashedPassword).catch(console.error);
      });
    }
  }

  // Trust proxy for rate limiting (required for deployment behind reverse proxies like Render)
  app.set("trust proxy", 1);

  // Reduce fingerprinting
  app.disable('x-powered-by');

  // Enforce HTTPS in production (Render terminates TLS and forwards proto)
  if (isProduction) {
    app.use((req, res, next) => {
      const forwardedProto = (req.get('x-forwarded-proto') || '').toLowerCase();
      const isHttps = req.secure || forwardedProto === 'https';
      if (isHttps) return next();

      const host = req.get('host');
      if (!host) return res.status(400).json({ error: 'HTTPS required' });
      const url = `https://${host}${req.originalUrl}`;

      if (req.method === 'GET' || req.method === 'HEAD') {
        return res.redirect(301, url);
      }
      return res.status(400).json({ error: 'HTTPS required' });
    });
  }

  // Per-request CSP nonce (used by Helmet + index.html injection)
  if (isProduction) {
    app.use((req, res, next) => {
      const nonce = crypto.randomBytes(16).toString('base64');
      (req as any).cspNonce = nonce;
      (res.locals as any).cspNonce = nonce;
      next();
    });
  }

  // Security: Helmet adds security headers (prod-only to avoid breaking local dev tooling)
  if (isProduction) {
    // Permissions-Policy (explicit header; keep separate from Helmet options for TS compatibility)
    app.use((_req, res, next) => {
      res.setHeader(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), payment=(), usb=(), fullscreen=(self)'
      );
      next();
    });

    app.use(
      helmet({
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        },
        referrerPolicy: { policy: 'no-referrer' },
        frameguard: { action: 'deny' },
        noSniff: true,
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            defaultSrc: ["'self'"],
            baseUri: ["'self'"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
            formAction: ["'self'"],
            blockAllMixedContent: [],
            upgradeInsecureRequests: [],
            // NOTE: Some UI libs inject inline styles; keep this while blocking inline JS.
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            scriptSrc: [
              "'self'",
              (req) => `'nonce-${(req as any).cspNonce}'`,
            ],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", 'https:'],
          },
        },
      })
    );
  }

  // Security: Rate limiting to prevent brute force attacks (prod-only)
  const authLimiter = isProduction
    ? rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 20,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: 'Too many requests. Please try again later.' },
      })
    : (_req: any, _res: any, next: any) => next();

  const apiLimiter = isProduction
    ? rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 300,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: 'Too many requests. Please try again later.' },
      })
    : (_req: any, _res: any, next: any) => next();

  // Public storefront order limiter (protects checkout from spam/fake orders)
  const storefrontOrderLimiter = isProduction
    ? rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 50,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: 'Too many order attempts. Please try again later.' },
      })
    : (_req: any, _res: any, next: any) => next();

  // Security: CORS configuration
  // - In production, origins must be explicitly configured.
  // - Never use wildcard origins with credentials.
  const configuredOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  // Auto-detect Render URL if not configured
  const renderUrl = process.env.RENDER_EXTERNAL_URL;
  const allowedOrigins = configuredOrigins.length > 0 
    ? configuredOrigins 
    : renderUrl 
      ? [renderUrl, renderUrl.replace('http://', 'https://')]
      : [];

  // Also allow the known Render URL
  if (renderUrl && !allowedOrigins.includes(renderUrl)) {
    allowedOrigins.push(renderUrl);
    allowedOrigins.push(renderUrl.replace('http://', 'https://'));
  }

  // Add common Render patterns
  const renderPattern = /^https:\/\/ecopro[a-z0-9-]*\.onrender\.com$/;

  if (isProduction && allowedOrigins.length === 0) {
    console.warn('⚠️  ALLOWED_ORIGINS not set - will use Render pattern matching');
  }

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);

        // Allow any localhost port for dev convenience
        const isLocalhost = /^http:\/\/localhost:\d+$/.test(origin);
        if (!isProduction && (isLocalhost || allowedOrigins.includes(origin))) {
          return callback(null, true);
        }

        // In production, allow explicitly configured origins
        if (isProduction && allowedOrigins.length > 0 && allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        // In production, allow Render URLs matching the pattern
        if (isProduction && renderPattern.test(origin)) {
          return callback(null, true);
        }

        console.warn('CORS blocked origin:', origin);
        callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "X-CSRF-Token"],
    })
  );

  // Cookies (required for HttpOnly cookie auth + CSRF)
  app.use(cookieParser());

  // Minimal double-submit CSRF protection for cookie-authenticated requests
  // - Sets a readable CSRF cookie if missing
  // - For unsafe methods, requires X-CSRF-Token header to match the CSRF cookie
  const CSRF_COOKIE = 'ecopro_csrf';
  const ACCESS_COOKIE = 'ecopro_at';
  const REFRESH_COOKIE = 'ecopro_rt';
  const STAFF_ACCESS_COOKIE = 'ecopro_staff_at';
  const KERNEL_ACCESS_COOKIE = 'ecopro_kernel_at';
  const csrfCookieOptions = {
    httpOnly: false,
    secure: isProduction,
    sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
    path: '/',
  };

  app.use((req, res, next) => {
    if (!req.cookies?.[CSRF_COOKIE]) {
      const token = crypto.randomBytes(32).toString('hex');
      res.cookie(CSRF_COOKIE, token, { ...csrfCookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });
    }
    next();
  });

  app.use((req, res, next) => {
    const method = req.method.toUpperCase();
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return next();

    // Never require CSRF for initial authentication endpoints.
    // (A stale/other auth cookie like ecopro_kernel_at should not block login.)
    const p = req.path;
    if (p === '/api/auth/login' || p === '/api/auth/register') return next();

    const hasAuthCookie = Boolean(
      req.cookies?.[ACCESS_COOKIE] ||
        req.cookies?.[REFRESH_COOKIE] ||
        req.cookies?.[STAFF_ACCESS_COOKIE] ||
        req.cookies?.[KERNEL_ACCESS_COOKIE]
    );
    if (!hasAuthCookie) return next();

    const cookieToken = req.cookies?.[CSRF_COOKIE];
    const headerToken = req.get('X-CSRF-Token');
    if (!cookieToken || !headerToken || headerToken !== cookieToken) {
      return res.status(403).json({ error: 'CSRF token missing or invalid' });
    }

    return next();
  });

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

  // Email config check (for debugging)
  app.get("/api/email-status", (_req, res) => {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;
    res.json({
      configured: !!(user && pass),
      user: user ? `${user.substring(0, 3)}...@${user.split('@')[1] || '?'}` : null,
      passwordSet: !!pass,
      passwordLength: pass?.length || 0,
    });
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
      const details = !isProduction ? (e as any)?.message : undefined;
      return res.status(500).json({
        error: 'DB ping failed',
        ...(details ? { details } : {}),
      });
    }
  });

  app.get("/api/demo", handleDemo);

  // Telegram webhook (public)
  app.post('/api/telegram/webhook', telegramRoutes.telegramWebhook);
  
  // Telegram public endpoints for customer pre-connection
  app.get('/api/telegram/bot-link/:storeSlug', telegramRoutes.getTelegramBotLink);
  app.get('/api/telegram/check-connection/:storeSlug', telegramRoutes.checkTelegramConnection);
  app.post('/api/telegram/set-webhook-secret', telegramRoutes.setWebhookSecret); // Temporary for testing

  // Auth routes (with rate limiting)
  app.post(
    "/api/auth/register",
    authLimiter,
    registerValidation,
    validate,
    authRoutes.register
  );
  // Email verification signup flow
  app.post(
    "/api/auth/send-verification",
    authLimiter,
    authRoutes.sendVerificationCodeHandler
  );
  app.post(
    "/api/auth/verify-and-register",
    authLimiter,
    authRoutes.verifyAndRegister
  );
  app.post(
    "/api/auth/login",
    authLimiter,
    loginValidation,
    validate,
    authRoutes.login
  );
  app.post(
    "/api/auth/refresh",
    authLimiter,
    authRoutes.refresh
  );
  app.post(
    "/api/auth/logout",
    authLimiter,
    authRoutes.logout
  );
  // Password reset flow
  app.post(
    "/api/auth/forgot-password",
    authLimiter,
    authRoutes.forgotPassword
  );
  app.post(
    "/api/auth/reset-password",
    authLimiter,
    authRoutes.resetPassword
  );
  // Admin 2FA (TOTP)
  app.post('/api/auth/2fa/setup', authenticate, requireAdmin, authRoutes.setupAdmin2FA);
  app.post('/api/auth/2fa/enable', authenticate, requireAdmin, authRoutes.enableAdmin2FA);
  app.post('/api/auth/2fa/disable', authenticate, requireAdmin, authRoutes.disableAdmin2FA);
  app.get("/api/auth/me", authenticate, authRoutes.getCurrentUser);
  app.post("/api/auth/change-password", authenticate, authRoutes.changePassword);

  // OAuth Social Login routes (public)
  app.use('/api/oauth', oauthRouter);

  // Facebook Messenger webhook (public for FB verification)
  app.use('/api/messenger', messengerRouter);

  // Kernel (root-only) APIs
  app.use('/api/kernel', kernelRouter);
  
  // IP Intelligence APIs (public + admin)
  app.use('/api/intel', intelRouter);
  
  // Admin: Search user by email
  app.get("/api/users/search", authenticate, authRoutes.searchUserByEmail);

  // Client profile APIs
  app.use('/api/users', authenticate, usersRouter);

  // Templates API (public)
  app.get("/api/templates", apiLimiter, templateRoutes.getTemplates);
  app.get("/api/templates/:id", apiLimiter, templateRoutes.getTemplateById);
  app.get("/api/templates/category/:category", apiLimiter, templateRoutes.getTemplatesByCategory);

  // Staff orders route (staff members can access their store's orders)
  app.get(
    "/api/staff/orders",
    authenticateStaff,
    requireStaffPermission('view_orders_list'),
    staffRoutes.getStaffOrders
  );

  // Staff profile (auth check)
  app.get(
    "/api/staff/me",
    authenticateStaff,
    staffRoutes.getStaffMe
  );

  // Staff order status update route
  app.patch(
    "/api/staff/orders/:orderId/status",
    authenticateStaff,
    requireStaffPermission('edit_order_status'),
    staffRoutes.updateStaffOrderStatus
  );

  // Staff login (unauthenticated)
  app.post(
    "/api/staff/login",
    apiLimiter,
    staffRoutes.staffLogin
  );

  // Staff logout (clears staff auth cookie)
  app.post(
    "/api/staff/logout",
    staffRoutes.staffLogout
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

  // Dashboard rich analytics (authenticated users)
  app.get(
    "/api/dashboard/analytics",
    authenticate,
    apiLimiter,
    dashboardRoutes.getDashboardAnalytics
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
    "/api/admin/health",
    authenticate,
    requireAdmin,
    adminRoutes.getServerHealth
  );

  app.get(
    "/api/admin/capacity",
    authenticate,
    requireAdmin,
    adminRoutes.getSystemCapacity
  );

  app.get(
    "/api/admin/active-users",
    authenticate,
    requireAdmin,
    adminRoutes.getActiveUsers
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
    "/api/admin/audit-logs",
    authenticate,
    requireAdmin,
    adminRoutes.listAdminAuditLogs
  );

  // Admin maintenance actions
  app.post(
    "/api/admin/clear-cache",
    authenticate,
    requireAdmin,
    adminRoutes.clearCache
  );

  app.get(
    "/api/admin/export-db",
    authenticate,
    requireAdmin,
    adminRoutes.exportDbSnapshot
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
    "/api/client/stock/categories/all",
    authenticate,
    requireClient,
    stockRoutes.getAllStockCategories
  );
  app.post(
    "/api/client/stock/categories",
    authenticate,
    requireClient,
    apiLimiter,
    stockRoutes.createStockCategory
  );
  app.delete(
    "/api/client/stock/categories/:id",
    authenticate,
    requireClient,
    stockRoutes.deleteStockCategory
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
  app.get("/api/storefront/:storeSlug/address/hai-suggestions", publicStoreRoutes.getStorefrontHaiSuggestions);
  app.get("/api/store/:storeSlug/:productSlug", publicStoreRoutes.getPublicProduct);
  app.get("/api/product-info/:productId", publicStoreRoutes.getProductWithStoreInfo);
  app.post(
    "/api/storefront/:storeSlug/orders",
    storefrontOrderLimiter,
    publicStoreRoutes.createPublicStoreOrder
  );

  // Private store product management (seller/client must be authenticated)
  app.post("/api/storefront/:storeSlug/products", authenticate, requireClient, apiLimiter, createStorefrontProduct);
  app.put("/api/storefront/:storeSlug/products/:id", authenticate, requireClient, apiLimiter, updateStorefrontProduct);
  app.delete("/api/storefront/:storeSlug/products/:id", authenticate, requireClient, deleteStorefrontProduct);
  app.post("/api/storefront/:storeSlug/products/:id/images", authenticate, requireClient, uploadStorefrontImages);

  // Order routes
  app.post("/api/orders/create", storefrontOrderLimiter, orderRoutes.createOrder); // Public - buyers can create orders
  app.get("/api/client/orders", authenticate, requireClient, orderRoutes.getClientOrders);
  app.get("/api/orders/new-count", authenticate, requireClient, orderRoutes.getNewOrdersCount); // Get count of new orders;
  
  // Order statuses routes (authenticated - client only)
  app.get("/api/client/order-statuses", authenticate, requireClient, orderRoutes.getOrderStatuses);
  app.post("/api/client/order-statuses", authenticate, requireClient, orderRoutes.createOrderStatus);
  app.patch("/api/client/order-statuses/:id", authenticate, requireClient, orderRoutes.updateCustomOrderStatus as any);
  app.delete("/api/client/order-statuses/:id", authenticate, requireClient, orderRoutes.deleteOrderStatus as any);

  // Order confirmation routes (public - no auth required)
  app.get("/api/storefront/:storeSlug/order/:orderId", orderConfirmationRoutes.getOrderForConfirmation);
  app.post("/api/storefront/:storeSlug/order/:orderId/confirm", orderConfirmationRoutes.confirmOrder);
  app.patch("/api/storefront/:storeSlug/order/:orderId/update", orderConfirmationRoutes.updateOrderDetails);
  app.patch("/api/client/orders/:id/status", authenticate, requireClient, orderRoutes.updateOrderStatus);

  // Delivery routes (authenticated)
  app.use('/api/delivery', authenticate, deliveryRouter);

  // Delivery pricing routes (authenticated for sellers, public endpoint for storefront)
  app.use('/api/delivery-prices', authenticate, deliveryPricesRouter);
  app.get('/api/storefront/:storeSlug/delivery-prices', getStorefrontDeliveryPrices);

  // Google Sheets integration routes (authenticated)
  app.use('/api/google', authenticate, googleSheetsRouter);

  // Chat routes (authenticated - handles both client and seller roles)
  app.use('/api/chat', authenticate, chatRouter);

  // Subscription codes routes (authenticated - client/seller operations)
  app.use('/api/codes', authenticate, codesRouter);

  // Customer Bot routes (authenticated - for store owners to message customers)
  app.use('/api/customer-bot', authenticate, requireClient, customerBotRouter);

  // Pixel tracking routes (mixed - some public, some authenticated)
  app.use('/api/pixels', pixelsRouter);  // Router handles auth internally

  // Checkout session routes (database-backed, not localStorage)
  app.post("/api/checkout/save-product", orderRoutes.saveProductForCheckout); // Public - save product for checkout
  app.get("/api/checkout/get-product/:sessionId", orderRoutes.getProductForCheckout); // Public - retrieve product from checkout session

  // Image upload route (authenticated users) - with error handling for multer
  app.post("/api/upload", authenticate, (req, res, next) => {
    upload.single('image')(req, res, (err: any) => {
      if (err) {
        const isProduction = process.env.NODE_ENV === 'production';
        console.error('[upload middleware] multer error:', isProduction ? (err as any)?.message : err);
        const message = isProduction ? 'Upload failed' : `Upload failed: ${err.message}`;
        return res.status(400).json({ error: message });
      }
      uploadImage(req, res, next);
    });
  });

  // Register the delete store image route
  app.delete("/api/store/image", authenticate, requireClient, deleteStoreImage);

  // Serve uploaded files via signed URLs (private storage, no public directory exposure)
  app.get('/uploads/:filename', serveSignedUpload);

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
        const nonce = (res.locals as any).cspNonce;
        const indexPath = path.join(spaBuildPath, 'index.html');
        fs.readFile(indexPath, 'utf8')
          .then((html) => {
            const injected = nonce
              ? html.replace(/<script\s+type="module"\s+/g, `<script type="module" nonce="${nonce}" `)
              : html;
            res.setHeader('Cache-Control', 'no-store');
            res.type('html').send(injected);
          })
          .catch(() => {
            res.sendFile(indexPath);
          });
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
      const details = !isProduction ? (e as any)?.message : undefined;
      return res.status(500).json({
        error: 'Schema introspection failed',
        ...(details ? { details } : {}),
      });
    }
  });

  // Global error handler (after routes)
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (res.headersSent) return;
    const status = Number(err?.status) || 500;
    console.error('Unhandled error:', err);

    const message =
      status >= 500
        ? (isProduction ? 'Internal server error' : (err?.message || String(err)))
        : (err?.message || 'Request failed');

    return res.status(status).json({ error: message, status });
  });

  return app;
}
