import { createServer } from "./index";
import { initializeDatabase, createDefaultAdmin } from "./utils/database";
import bcrypt from "bcrypt";

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
    const port = process.env.PORT || 3000;

    app.listen(port, () => {
      console.log(`\n🚀 EcoPro server running on port ${port}`);
      console.log(`📱 Frontend: http://localhost:${port}`);
      console.log(`🔧 API: http://localhost:${port}/api`);
      console.log(`📊 Dashboard: http://localhost:${port}/dashboard\n`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("🛑 Received SIGTERM, shutting down gracefully");
      process.exit(0);
    });

    process.on("SIGINT", () => {
      console.log("🛑 Received SIGINT, shutting down gracefully");
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
