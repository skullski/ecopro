import { createServer } from "./index";
import { initializeDatabase, createDefaultAdmin } from "./utils/database";
import { startScheduledMessageWorker, stopScheduledMessageWorker } from "./utils/scheduled-messages";
import * as bcrypt from "bcrypt";

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

    // Create and start server with WebSocket support
    const app = createServer();
    const port = process.env.PORT || 3000;
    const http = require('http');
    const server = http.createServer(app);
    // WebSocket setup
    const WebSocket = require('ws');
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws: any) => {
      ws.on('message', (msg: string) => {
        // Optionally handle incoming messages from clients
      });
    });

    // Broadcast function for order updates
    function broadcastOrderUpdate(order: any) {
      wss.clients.forEach((client: any) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'order-update', order }));
        }
      });
    }

    server.listen(port, () => {
      console.log(`\n🚀 EcoPro server running on port ${port}`);
      console.log(`📱 Frontend: http://localhost:${port}`);
      console.log(`🔧 API: http://localhost:${port}/api`);
      console.log(`📊 Dashboard: http://localhost:${port}/dashboard\n`);
      
      // Start the scheduled message worker
      startScheduledMessageWorker();
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("🛑 Received SIGTERM, shutting down gracefully");
      stopScheduledMessageWorker();
      process.exit(0);
    });

    process.on("SIGINT", () => {
      console.log("🛑 Received SIGINT, shutting down gracefully");
      stopScheduledMessageWorker();
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
