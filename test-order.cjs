const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    console.log('🔍 Step 1: Finding a store...');
    const storeRes = await pool.query('SELECT store_slug, client_id FROM client_store_settings LIMIT 1');
    if (!storeRes.rows.length) {
      console.log('❌ No stores found');
      process.exit(1);
    }
    const { store_slug, client_id } = storeRes.rows[0];
    console.log('✅ Found store:', store_slug, 'with client_id:', client_id);

    console.log('\n🔍 Step 2: Finding a product in this store...');
    const prodRes = await pool.query('SELECT id, title, price FROM client_store_products WHERE client_id = $1 LIMIT 1', [client_id]);
    if (!prodRes.rows.length) {
      console.log('❌ No products found for this store');
      process.exit(1);
    }
    const { id: product_id, title, price } = prodRes.rows[0];
    console.log('✅ Found product:', title, '- ID:', product_id, '- Price:', price);

    console.log('\n📦 Step 3: Creating test order...');
    const testCustomerName = 'Test Customer ' + Date.now();
    const orderPayload = {
      product_id: product_id,
      quantity: 1,
      total_price: price,
      customer_name: testCustomerName,
      customer_email: 'test@example.com',
      customer_phone: '+213790000000',
      customer_address: 'Test Address, Algiers'
    };
    console.log('Order payload:', JSON.stringify(orderPayload, null, 2));

    const orderRes = await pool.query(
      `INSERT INTO store_orders (
        product_id, client_id, quantity, total_price,
        customer_name, customer_email, customer_phone, shipping_address,
        status, payment_status, created_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW()) RETURNING *`,
      [
        product_id,
        client_id,
        1,
        price,
        testCustomerName,
        'test@example.com',
        '+213790000000',
        'Test Address, Algiers',
        'pending',
        'unpaid'
      ]
    );
    console.log('✅ Order created with ID:', orderRes.rows[0].id);

    console.log('\n🔍 Step 4: Verifying order appears in database...');
    const verifyRes = await pool.query(
      'SELECT id, customer_name, total_price, status FROM store_orders WHERE client_id = $1 ORDER BY created_at DESC LIMIT 1',
      [client_id]
    );
    if (verifyRes.rows.length) {
      console.log('✅ Order verified in database:');
      console.log('   - ID:', verifyRes.rows[0].id);
      console.log('   - Customer:', verifyRes.rows[0].customer_name);
      console.log('   - Total:', verifyRes.rows[0].total_price);
      console.log('   - Status:', verifyRes.rows[0].status);
      console.log('\n✅ SUCCESS! Order is in the database and should appear in dashboard within 5 seconds');
    } else {
      console.log('❌ Order not found in database');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
    process.exit(0);
  }
})();
