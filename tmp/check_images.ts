import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ 
  connectionString: (process.env.DATABASE_URL || ''),
  ssl: { rejectUnauthorized: false }
});

async function check() {
  const settings = await pool.query(`
    SELECT client_id, store_logo, banner_url, hero_main_url, hero_tile1_url, hero_tile2_url, store_images 
    FROM client_store_settings 
    WHERE store_logo IS NOT NULL OR banner_url IS NOT NULL OR hero_main_url IS NOT NULL
    LIMIT 5
  `);
  console.log('Store Settings with images:');
  console.log(JSON.stringify(settings.rows, null, 2));

  const products = await pool.query(`
    SELECT client_id, id, title, images 
    FROM client_store_products 
    WHERE images IS NOT NULL AND array_length(images, 1) > 0
    LIMIT 10
  `);
  console.log('\nProducts with images:');
  console.log(JSON.stringify(products.rows, null, 2));

  await pool.end();
}
check();
