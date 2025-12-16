const { Pool } = require('pg');
(async () => {
  const pool = new Pool({
    connectionString: 'postgresql://eco_db_drrv_user:teCMT25hytwYFgWqpmg2Q0x97TJymRhs@dpg-d4cl4ubipnbc739hbcmg-a.oregon-postgres.render.com/eco_db_drrv',
    ssl: { rejectUnauthorized: false }
  });
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT id, client_id, store_slug, store_images, banner_url, hero_main_url, hero_tile1_url, hero_tile2_url FROM client_store_settings WHERE store_slug = $1', ['store-tvwz4tu3']);
    console.log(JSON.stringify(res.rows, null, 2));
    client.release();
  } catch (e) {
    console.error('ERR', e.message);
  } finally {
    await pool.end();
  }
})();
