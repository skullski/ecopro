import { createServer } from "./index";

const PORT = process.env.PORT || 8080;

const app = createServer();

app.listen(PORT, () => {
  console.log(`\n🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`\n✅ Default admin user created: admin@ecopro.com`);
  console.log(`🔑 Default password: admin123\n`);
});
