import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

async function testCascadeFix() {
  try {
    console.log('🧪 Testing CASCADE fix...\n');

    // 1. Get first client
    const clientRes = await pool.query('SELECT id FROM users WHERE user_type = $1 LIMIT 1', ['client']);
    if (!clientRes.rows.length) {
      console.log('❌ No client found');
      return;
    }
    const clientId = clientRes.rows[0].id;
    console.log(`✓ Using client ID: ${clientId}`);

    // 2. Get first product for this client
    const productRes = await pool.query(
      'SELECT id, title FROM client_store_products WHERE client_id = $1 LIMIT 1',
      [clientId]
    );
    if (!productRes.rows.length) {
      console.log('❌ No products found');
      return;
    }
    const productId = productRes.rows[0].id;
    const productTitle = productRes.rows[0].title;
    console.log(`✓ Using product ID: ${productId} (${productTitle})\n`);

    // 3. Count orders for this product BEFORE deletion
    const ordersBefore = await pool.query(
      'SELECT COUNT(*)::int as count FROM store_orders WHERE product_id = $1',
      [productId]
    );
    const orderCount = ordersBefore.rows[0].count;
    console.log(`📊 Orders for this product BEFORE deletion: ${orderCount}`);

    if (orderCount === 0) {
      console.log('⚠️  No orders for this product. Creating a test order...');
      
      // Create a test order
      const createOrderRes = await pool.query(
        `INSERT INTO store_orders (product_id, client_id, quantity, total_price, status, customer_name, customer_phone)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [productId, clientId, 1, 100, 'pending', 'Test Customer', '+21234567890']
      );
      const newOrderId = createOrderRes.rows[0].id;
      console.log(`✓ Created test order ID: ${newOrderId}\n`);
    }

    // 4. List orders for this product
    const ordersListBefore = await pool.query(
      `SELECT id, customer_name, total_price, status FROM store_orders 
       WHERE product_id = $1 ORDER BY id`,
      [productId]
    );
    console.log(`📋 Orders before deletion:`);
    ordersListBefore.rows.forEach(o => {
      console.log(`   - Order #${o.id}: ${o.customer_name} (${o.total_price}DA, ${o.status})`);
    });

    // 5. Check foreign key constraint
    const fkCheck = await pool.query(`
      SELECT constraint_name, delete_rule 
      FROM information_schema.referential_constraints 
      WHERE constraint_name = 'store_orders_product_id_fkey'
    `);
    const deleteRule = fkCheck.rows[0]?.delete_rule || 'UNKNOWN';
    console.log(`\n🔗 Foreign key delete rule: ${deleteRule}`);

    if (deleteRule !== 'SET NULL') {
      console.log('❌ WRONG: Delete rule should be SET NULL');
      return;
    }

    // 6. DELETE THE PRODUCT
    console.log(`\n🗑️  Deleting product ${productId}...`);
    const deleteRes = await pool.query(
      'DELETE FROM client_store_products WHERE id = $1 RETURNING id',
      [productId]
    );
    if (deleteRes.rows.length > 0) {
      console.log(`✓ Product deleted successfully`);
    }

    // 7. Check orders AFTER deletion
    const ordersAfter = await pool.query(
      'SELECT id, product_id, customer_name, total_price, status FROM store_orders WHERE product_id IS NULL'
    );
    
    console.log(`\n✅ RESULT: After deleting product, found ${ordersAfter.rows.length} orders with NULL product_id:`);
    ordersAfter.rows.slice(0, 5).forEach(o => {
      console.log(`   - Order #${o.id}: product_id=${o.product_id}, ${o.customer_name} (${o.total_price}DA)`);
    });

    if (ordersAfter.rows.length > 0) {
      console.log('\n✅✅✅ CASCADE FIX IS WORKING! Orders survived product deletion! ✅✅✅');
    } else {
      console.log('\n❌❌❌ CASCADE FIX FAILED! No orders with NULL product_id found! ❌❌❌');
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  } finally {
    await pool.end();
  }
}

testCascadeFix();
