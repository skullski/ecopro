const { Pool } = require('pg');
(async () => {
  const slug = 'store-tvwz4tu3';
  const pool = new Pool({
    connectionString: 'postgresql://eco_db_drrv_user:teCMT25hytwYFgWqpmg2Q0x97TJymRhs@dpg-d4cl4ubipnbc739hbcmg-a.oregon-postgres.render.com/eco_db_drrv',
    ssl: { rejectUnauthorized: false }
  });
  try {
    const client = await pool.connect();
    const r = await client.query('SELECT store_images FROM client_store_settings WHERE store_slug = $1', [slug]);
    if (!r.rows.length) {
      console.error('Store not found');
      client.release();
      await pool.end();
      process.exit(1);
    }
    const images = r.rows[0].store_images || [];
    console.log('Current images:', images);
    const next = Array.isArray(images) ? images.slice(1) : [];
    console.log('Removing first image, new images:', next);
    const upd = await client.query('UPDATE client_store_settings SET store_images = $1, updated_at = CURRENT_TIMESTAMP WHERE store_slug = $2 RETURNING store_images', [next.length ? next : null, slug]);
    console.log('Updated:', upd.rows[0]);
    client.release();
  } catch (e) {
    console.error('ERR', e.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
