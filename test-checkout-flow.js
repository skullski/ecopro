#!/usr/bin/env node

/**
 * Complete Order Placement Test
 * Simulates the full checkout flow
 */

const API_URL = 'http://localhost:8080';

async function testCompleteCheckout() {
  console.log('🛒 Complete Checkout Flow Test');
  console.log('================================\n');

  try {
    // Step 1: Get or create a store
    console.log('1️⃣ Checking for stores...');
    const storesRes = await fetch(`${API_URL}/api/client/stores`, {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log(`   Response: ${storesRes.status}`);

    // Step 2: Try to get available products
    console.log('\n2️⃣ Checking for products...');
    const productsRes = await fetch(`${API_URL}/api/products`);
    const products = await productsRes.json();
    console.log(`   Found ${products.length} products`);
    
    if (products.length === 0) {
      console.log('\n⚠️  No products found in marketplace');
      console.log('   Trying storefront products...\n');
      
      // Try a storefront
      const storefrontRes = await fetch(`${API_URL}/api/storefront/baby/products`);
      if (storefrontRes.ok) {
        const sfProducts = await storefrontRes.json();
        console.log(`   Found ${sfProducts.length} products in baby store`);
      }
    }

    // Step 3: Simulate order with minimal valid data
    console.log('\n3️⃣ Attempting order creation (Test 1: With product_id)...');
    const orderData1 = {
      product_id: 1,
      client_id: 1,
      quantity: 1,
      total_price: 5000,
      customer_name: 'Test Customer ' + Date.now(),
      customer_email: 'test@example.com',
      customer_phone: '+213555123456',
      customer_address: '123 Test St, Test City'
    };

    console.log('   Order data:', JSON.stringify(orderData1, null, 2));
    
    const res1 = await fetch(`${API_URL}/api/orders/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData1)
    });

    const data1 = await res1.json();
    console.log(`   Status: ${res1.status}`);
    console.log('   Response:', JSON.stringify(data1, null, 2));

    if (!res1.ok) {
      console.log('\n📝 Test 1 failed, trying Test 2: With store_slug...');
      
      const orderData2 = {
        product_id: 1,
        store_slug: 'test-store',
        quantity: 1,
        total_price: 5000,
        customer_name: 'Test Customer ' + Date.now(),
        customer_email: 'test@example.com',
        customer_phone: '+213555123456',
        customer_address: '123 Test St, Test City'
      };

      console.log('   Order data:', JSON.stringify(orderData2, null, 2));
      
      const res2 = await fetch(`${API_URL}/api/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData2)
      });

      const data2 = await res2.json();
      console.log(`   Status: ${res2.status}`);
      console.log('   Response:', JSON.stringify(data2, null, 2));

      if (res2.ok) {
        console.log('\n✅ Test 2 PASSED! Order created:');
        console.log(`   Order ID: ${data2.order?.id}`);
        console.log(`   Status: ${data2.order?.status}`);
        return true;
      }
    } else {
      console.log('\n✅ Test 1 PASSED! Order created:');
      console.log(`   Order ID: ${data1.order?.id}`);
      console.log(`   Status: ${data1.order?.status}`);
      return true;
    }

    console.log('\n❌ All tests failed.');
    console.log('\nPossible issues:');
    console.log('  • Product ID 1 does not exist in client_store_products');
    console.log('  • No client exists with ID 1');
    console.log('  • Store slug "test-store" is not valid');
    console.log('\nNext steps:');
    console.log('  1. Create a store via dashboard');
    console.log('  2. Add products to that store');
    console.log('  3. Use the correct store_slug and product_id');
    
    return false;

  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    console.log('\nMake sure:');
    console.log('  1. Server is running on http://localhost:8080');
    console.log('  2. Database is connected');
    return false;
  }
}

// Run test
testCompleteCheckout().then(success => {
  console.log('\n================================');
  process.exit(success ? 0 : 1);
});
