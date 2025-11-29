import "dotenv/config";
import { pool } from "./utils/database.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log("Running migration...");
    
    const migrationPath = path.join(__dirname, "migrations", "20251126_add_shipping_fields_to_marketplace_orders.sql");
    const sql = fs.readFileSync(migrationPath, "utf-8");
    
    await pool.query(sql);
    
    console.log("✅ Migration completed successfully");
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
