import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "./index";

// Get __dirname equivalent in ES modules (compatible with Node.js 18+)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = createServer();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`🚀 EcoPro server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
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
