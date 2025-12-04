import { createServer } from "./index";
import { initializeDatabase, createDefaultAdmin } from "./utils/database";
import bcrypt from "bcrypt";

const PORT = process.env.PORT || 8080;

async function startServer() {
  try {
    // Initialize database and create tables (skip if no DATABASE_URL for local dev)
    if (process.env.DATABASE_URL) {
      const url = process.env.DATABASE_URL || '';
      const masked = url.replace(/:(.*?)@/, ':****@');
      console.log("🔄 Initializing database... using DATABASE_URL=", masked);
      await initializeDatabase();

      // Create default admin user
      const adminEmail = "admin@ecopro.com";
      const adminPassword = "admin123";
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
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
