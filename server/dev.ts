import { createServer } from "./index";
import { initializeDatabase, createDefaultAdmin } from "./utils/database";
import bcrypt from "bcrypt";

const PORT = process.env.PORT || 8080;

async function startServer() {
  try {
    // Initialize database and create tables
    console.log("🔄 Initializing database...");
    await initializeDatabase();

    // Create default admin user
    const adminEmail = "admin@ecopro.com";
    const adminPassword = "admin123";
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await createDefaultAdmin(adminEmail, hashedPassword);
    console.log(`✅ Default admin user created: ${adminEmail}`);
    console.log(`🔑 Default password: ${adminPassword}`);

    // Create and start server
    const app = createServer();
    app.listen(PORT, () => {
      console.log(`\n🚀 API Server running on http://localhost:${PORT}`);
      console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
      console.log(`📊 Dashboard available at http://localhost:${PORT}/dashboard\n`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
