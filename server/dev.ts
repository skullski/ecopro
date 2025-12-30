import { createServer } from "./index";
import { initializeDatabase, runPendingMigrations } from "./utils/database";
import { processPendingMessages, cleanupOldOrders } from "./utils/bot-messaging";
import { cleanupExpiredCodes } from "./utils/code-utils";

const PORT = process.env.PORT || 8080;

async function startServer() {
  // Start server immediately (don't block boot on remote DB + migrations).
  const app = createServer();
  app.listen(PORT, () => {
    console.log(`\n🚀 API Server running on http://localhost:${PORT}`);
    console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
    console.log(`📊 Dashboard available at http://localhost:${PORT}/dashboard\n`);
  });

  // Initialize DB + migrations + background jobs asynchronously.
  (async () => {
    try {
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
