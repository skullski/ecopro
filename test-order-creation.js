#!/usr/bin/env node

/**
 * Test Order Creation Script
 * Tests if orders are being created via the API
 */

const API_URL = 'http://localhost:8080';

async function testOrderCreation() {
  console.log('🧪 Testing Order Creation...');
  console.log('================================\n');

  try {
    // Step 1: Check if product exists
    console.log('1️⃣ Checking available products...');
    const productsRes = await fetch(`${API_URL}/api/products`);
    const products = await productsRes.json();
    
    if (!Array.isArray(products) || products.length === 0) {
      console.log('⚠️  No products found. Creating test product first...\n');
      // We'll use product ID 1 which should exist
      var productId = 1;
    } else {
      console.log(`✅ Found ${products.length} products`);
      productId = products[0].id;
      console.log(`   Using product ID: ${productId}\n`);
    }

    // Step 2: Create a test order
    console.log('2️⃣ Creating test order...');
    const orderData = {
      product_id: productId,
      store_slug: 'test-store',
      quantity: 2,
      total_price: 10000,
      customer_name: 'Test Customer ' + Date.now(),
      customer_email: 'test-' + Date.now() + '@example.com',
      customer_phone: '+213555123456',
      customer_address: '123 Test Street, Test City'
    };

    console.log('   Order data:', JSON.stringify(orderData, null, 2));
    console.log('');

    const orderRes = await fetch(`${API_URL}/api/orders/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    const orderResponse = await orderRes.json();
    console.log('   Response status:', orderRes.status);
    console.log('   Response data:', JSON.stringify(orderResponse, null, 2));

    if (orderRes.ok && orderResponse.order) {
      const orderId = orderResponse.order.id;
      console.log(`\n✅ Order created successfully! Order ID: ${orderId}`);
      console.log('\n3️⃣ Checking order details...');
      console.log('   Order ID:', orderId);
      console.log('   Status:', orderResponse.order.status || 'pending');
      console.log('   Total Price:', orderResponse.order.total_price);
      console.log('   Customer:', orderResponse.order.customer_name);
      
      return { success: true, orderId, order: orderResponse.order };
    } else {
      console.log('\n❌ Order creation failed!');
      console.log('   Error:', orderResponse.error || 'Unknown error');
      return { success: false, error: orderResponse };
    }
  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    console.log('\n⚠️  Make sure:');
    console.log('   1. Server is running on http://localhost:8080');
    console.log('   2. Database is connected');
    console.log('   3. Product with ID 1 exists');
    return { success: false, error: error.message };
  }
}

// Run test
testOrderCreation().then(result => {
  console.log('\n================================');
  if (result.success) {
    console.log('✅ Order creation test PASSED');
  } else {
    console.log('❌ Order creation test FAILED');
  }
  process.exit(result.success ? 0 : 1);
});
