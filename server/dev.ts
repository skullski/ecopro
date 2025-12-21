import { createServer } from "./index";
import { initializeDatabase, createDefaultAdmin, runPendingMigrations } from "./utils/database";
import { processPendingMessages, cleanupOldOrders } from "./utils/bot-messaging";
import * as argon2 from "argon2";

const PORT = process.env.PORT || 8080;

async function startServer() {
  try {
    // Initialize database and create tables (skip if no DATABASE_URL for local dev)
    if (process.env.DATABASE_URL) {
      const url = process.env.DATABASE_URL || '';
      const masked = url.replace(/:(.*?)@/, ':****@');
      console.log("🔄 Initializing database... using DATABASE_URL=", masked);
      await initializeDatabase();

      // Run pending migrations
      await runPendingMigrations();

      // Create default admin user with argon2id hashing
      const adminEmail = "admin@ecopro.com";
      const adminPassword = "admin123";
      const hashedPassword = await argon2.hash(adminPassword, {
        type: argon2.argon2id,
        timeCost: 2,
        memoryCost: 65536,
        parallelism: 1,
      });
      await createDefaultAdmin(adminEmail, hashedPassword);
      console.log(`✅ Default admin user created: ${adminEmail}`);
      console.log(`🔑 Default password: ${adminPassword}`);
    } else {
      console.log("⚠️  No DATABASE_URL found - skipping database initialization");
      console.log("💡 Frontend will be available but API endpoints will fail");
    }

    // Create and start server
    const app = createServer();
    app.listen(PORT, () => {
      console.log(`\n🚀 API Server running on http://localhost:${PORT}`);
      console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
      console.log(`📊 Dashboard available at http://localhost:${PORT}/dashboard\n`);
    });

    // Start background job to process pending bot messages (every 5 minutes)
    setInterval(() => {
      processPendingMessages().catch(err => console.error("Bot message processor error:", err));
    }, 5 * 60 * 1000);
    console.log("🤖 Bot message processor started (runs every 5 minutes)");

    // Start background job to cleanup old orders (every 1 hour)
    setInterval(() => {
      cleanupOldOrders().catch(err => console.error("Order cleanup error:", err));
    }, 60 * 60 * 1000);
    console.log("🧹 Order cleanup started (runs every 1 hour)");
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    console.log("💡 Starting server anyway for frontend development...");
    
    // Start server even if DB fails (for frontend dev)
    const app = createServer();
    app.listen(PORT, () => {
      console.log(`\n⚠️  API Server running (DB connection failed)`);
      console.log(`📡 Frontend available at http://localhost:${PORT}\n`);
    });
  }
}

startServer();
