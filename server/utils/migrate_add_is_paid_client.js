const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addIsPaidClientColumn() {
  const query = `
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS is_paid_client BOOLEAN DEFAULT false;
  `;

  try {
    await pool.query(query);
    console.log("Column 'is_paid_client' added successfully.");
  } catch (error) {
    console.error("Error adding column 'is_paid_client':", error);
  } finally {
    await pool.end();
  }
}

addIsPaidClientColumn();