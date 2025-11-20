import { pool } from "./database";

async function run() {
  try {
    console.log("Running migration: add is_paid_client column to users...");
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_paid_client BOOLEAN NOT NULL DEFAULT false;`);
    console.log("Migration complete: is_paid_client column added.");
  } catch (e) {
    console.error("Migration failed:", e);
  } finally {
    await pool.end();
  }
}

run();
