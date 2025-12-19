#!/usr/bin/env node

/**
 * Setup Test Data for Order Testing
 * Creates a test store, client, and products
 */

const API_URL = 'http://localhost:8080';

async function setupTestData() {
  console.log('⚙️  Setting Up Test Data');
  console.log('================================\n');

  try {
    // Step 1: Check database health
    console.log('1️⃣ Checking database...');
    const healthRes = await fetch(`${API_URL}/api/health`);
    const health = await healthRes.json();
    console.log(`   Database connected: ${health.db?.connected ? '✓' : '✗'}`);

    if (!health.db?.connected) {
      throw new Error('Database not connected');
    }

    // Step 2: Create test client
    console.log('\n2️⃣ Creating test client...');
    const clientRes = await fetch(`${API_URL}/api/admin/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin-token'
      },
      body: JSON.stringify({
        name: 'Test Store',
        email: 'test@store.com',
        phone: '+213555000000'
      })
    });

    let clientId = 1;
    if (clientRes.ok) {
      const clientData = await clientRes.json();
      clientId = clientData.id || 1;
      console.log(`   ✓ Client created: ID ${clientId}`);
    } else {
      console.log(`   ℹ️  Using default client ID: ${clientId}`);
    }

    // Step 3: Create test product
    console.log('\n3️⃣ Creating test product...');
    const productRes = await fetch(`${API_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin-token'
      },
      body: JSON.stringify({
        title: 'Test Product',
        description: 'A test product for checkout',
        price: 5000,
        category: 'test',
        images: ['https://via.placeholder.com/200'],
        client_id: clientId
      })
    });

    let productId = 1;
    if (productRes.ok) {
      const productData = await productRes.json();
      productId = productData.id || 1;
      console.log(`   ✓ Product created: ID ${productId}`);
    } else {
      console.log(`   Response: ${productRes.status}`);
      const error = await productRes.json();
      console.log(`   ℹ️  ${error.error || 'Could not create product'}`);
    }

    console.log('\n✅ Test data setup complete!');
    console.log(`\nNow you can:
  1. Visit http://localhost:8080/product/${productId}
  2. Click "Buy Now"
  3. Fill the checkout form
  4. Click "Place Order"
  5. Check console for order details`);

    return { clientId, productId };

  } catch (error) {
    console.error('\n❌ Setup error:', error.message);
    console.log('\nMake sure server is running on http://localhost:8080');
    return null;
  }
}

setupTestData();
