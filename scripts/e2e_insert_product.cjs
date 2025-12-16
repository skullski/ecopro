const { Pool } = require('pg');
require('dotenv').config();

(async function(){
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const sellerRes = await pool.query("SELECT id FROM sellers WHERE email = $1", ['e2e_seller@test.local']);
    if (sellerRes.rows.length === 0) { console.error('Seller not found'); process.exit(1); }
    const sellerId = sellerRes.rows[0].id;
    console.log('Seller id:', sellerId);

    const ss = await pool.query('SELECT store_slug FROM seller_store_settings WHERE seller_id = $1', [sellerId]);
    const storeSlug = ss.rows[0] ? ss.rows[0].store_slug : null;
    console.log('Seller store slug:', storeSlug);

    const title = 'Inserted E2E Product';
    const desc = 'Inserted via script';
    const price = 33.50;
    const res = await pool.query(
      `INSERT INTO marketplace_products (seller_id, title, description, price, original_price, category, images, stock, condition, location, shipping_available, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW()) RETURNING id`,
      [sellerId, title, desc, price, null, 'e2e', [], 10, 'new', null, true]
    );
    const id = res.rows[0].id;
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g,'-')}-${id}`;
    await pool.query('UPDATE marketplace_products SET slug=$1 WHERE id=$2', [slug, id]);
    console.log('Inserted product id:', id, 'slug:', slug);
    console.log('storeSlug', storeSlug, 'productSlug', slug);
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
