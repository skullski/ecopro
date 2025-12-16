const { Pool } = require('pg');
(async () => {
  const pool = new Pool({
    connectionString: 'postgresql://eco_db_drrv_user:teCMT25hytwYFgWqpmg2Q0x97TJymRhs@dpg-d4cl4ubipnbc739hbcmg-a.oregon-postgres.render.com/eco_db_drrv',
    ssl: { rejectUnauthorized: false }
  });
  try {
    const client = await pool.connect();
    const r = await client.query("ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS store_images TEXT[]");
    console.log('ALTER RESULT', r.command);
    client.release();
  } catch (e) {
    console.error('ERR', e.message);
  } finally {
    await pool.end();
  }
})();
