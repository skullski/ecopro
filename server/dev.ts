import { createServer } from "./index";
import http from "http";
import { initializeDatabase, runPendingMigrations, ensureConnection } from "./utils/database";
import { processPendingMessages, cleanupOldOrders } from "./utils/bot-messaging";
import { cleanupExpiredCodes } from "./utils/code-utils";
import { initWebSocket } from "./utils/websocket";

const PORT = process.env.PORT || 8080;

async function startServer() {
  // Warm up DB connection before starting server to avoid first-request timeout
  console.log("🔄 Warming up database connection...");
  try {
    await ensureConnection();
    console.log("✅ Database connection ready");
  } catch (err) {
    console.error("⚠️ Database warm-up failed (will retry on first request):", (err as any)?.message);
  }

  // Start server immediately (don't block boot on remote DB + migrations).
  const app = createServer({ skipDbInit: true });
  const server = http.createServer(app);
  
  // Initialize WebSocket server for real-time chat
  initWebSocket(server);
  
  server.listen(PORT, () => {
    console.log(`\n🚀 API Server running on http://localhost:${PORT}`);
    console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
    console.log(`🔌 WebSocket available at ws://localhost:${PORT}/ws/chat`);
    console.log(`📊 Dashboard available at http://localhost:${PORT}/dashboard\n`);
  });

  // Initialize DB + migrations + background jobs asynchronously.
  (async () => {
    try {
      const devDbInit = String(process.env.DEV_DB_INIT || '').toLowerCase();
      const shouldInitDb = devDbInit === '1' || devDbInit === 'true' || devDbInit === 'yes';

      if (!shouldInitDb) {
        console.log('⏭️ DEV_DB_INIT disabled — skipping database init/migrations/background jobs in dev');
        return;
      }

      if (process.env.DATABASE_URL) {
        const url = process.env.DATABASE_URL || '';
        const masked = url.replace(/:(.*?)@/, ':****@');
        console.log("🔄 Initializing database... using DATABASE_URL=", masked);
        await initializeDatabase();
        await runPendingMigrations();
        console.log('✅ Database ready');

        setInterval(() => {
          processPendingMessages().catch(err => console.error("Bot message processor error:", err));
        }, 5 * 60 * 1000);
        console.log("🤖 Bot message processor started (runs every 5 minutes)");

        setInterval(() => {
          cleanupOldOrders().catch(err => console.error("Order cleanup error:", err));
        }, 60 * 60 * 1000);
        console.log("🧹 Order cleanup started (runs every 1 hour)");

        setInterval(() => {
          cleanupExpiredCodes().catch(err => console.error("Code cleanup error:", err));
        }, 10 * 60 * 1000);
        console.log("📋 Subscription code cleanup started (runs every 10 minutes)");
      } else {
        console.log("⚠️  No DATABASE_URL found - skipping database initialization");
      }
    } catch (error) {
      console.error("❌ DB init failed (server still running):", error);
    }
  })();
}

startServer();
