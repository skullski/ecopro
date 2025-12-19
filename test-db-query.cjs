const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ecopro_dev'
});

async function checkStores() {
  try {
    console.log('\n=== CLIENT STORES ===');
    const clientStores = await pool.query(
      `SELECT client_id, store_name, store_slug FROM client_store_settings LIMIT 10`
    );
    console.log(`Found ${clientStores.rows.length} client stores:`);
    clientStores.rows.forEach(row => {
      console.log(`  - ${row.store_name} (slug: ${row.store_slug}, client_id: ${row.client_id})`);
    });

    console.log('\n=== SELLER STORES ===');
    const sellerStores = await pool.query(
      `SELECT seller_id, store_name, store_slug FROM seller_store_settings LIMIT 10`
    );
    console.log(`Found ${sellerStores.rows.length} seller stores:`);
    sellerStores.rows.forEach(row => {
      console.log(`  - ${row.store_name} (slug: ${row.store_slug}, seller_id: ${row.seller_id})`);
    });

    console.log('\n=== LOOKING FOR skull-store ===');
    const searchClient = await pool.query(
      `SELECT * FROM client_store_settings WHERE store_slug ILIKE '%skull%'`
    );
    console.log(`Client stores matching 'skull': ${searchClient.rows.length}`);
    searchClient.rows.forEach(row => console.log(JSON.stringify(row, null, 2)));

    const searchSeller = await pool.query(
      `SELECT * FROM seller_store_settings WHERE store_slug ILIKE '%skull%'`
    );
    console.log(`Seller stores matching 'skull': ${searchSeller.rows.length}`);
    searchSeller.rows.forEach(row => console.log(JSON.stringify(row, null, 2)));

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

checkStores();
