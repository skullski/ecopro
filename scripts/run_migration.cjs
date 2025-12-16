const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

(async ()=>{
  const sqlPath = path.join(process.cwd(), 'server', 'migrations', '20251209_create_seller_store_settings.sql');
  if (!fs.existsSync(sqlPath)) { console.error('Migration file missing:', sqlPath); process.exit(1); }
  const sql = fs.readFileSync(sqlPath,'utf8');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('Migration applied');
  } catch (e){
    await client.query('ROLLBACK');
    console.error('Migration failed:', e.message || e);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();
