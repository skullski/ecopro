import { createServer } from "./index";
import http from "http";
import { startScheduledMessageWorker, stopScheduledMessageWorker } from "./utils/scheduled-messages";
import { startBotMessageWorker, stopBotMessageWorker } from "./utils/bot-messaging";
import { initWebSocket } from "./utils/websocket";

async function startServer() {
  try {
    // Create and start server with WebSocket support
    const app = createServer();
    const port = process.env.PORT || 3000;
    const server = http.createServer(app);
    
    // Initialize WebSocket server for real-time chat
    initWebSocket(server);

    server.listen(port, () => {
      console.log(`\n🚀 EcoPro server running on port ${port}`);
      console.log(`📱 Frontend: http://localhost:${port}`);
      console.log(`🔧 API: http://localhost:${port}/api`);
      console.log(`🔌 WebSocket: ws://localhost:${port}/ws/chat`);
      console.log(`📊 Dashboard: http://localhost:${port}/dashboard\n`);
      
      // Start the scheduled message worker
      startScheduledMessageWorker();
      // Process bot_messages (Messenger instant/pin/confirmations, etc.)
      startBotMessageWorker({ intervalMs: 30 * 1000 });
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("🛑 Received SIGTERM, shutting down gracefully");
      stopScheduledMessageWorker();
      stopBotMessageWorker();
      process.exit(0);
    });

    process.on("SIGINT", () => {
      console.log("🛑 Received SIGINT, shutting down gracefully");
      stopScheduledMessageWorker();
      stopBotMessageWorker();
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
