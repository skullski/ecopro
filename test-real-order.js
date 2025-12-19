#!/usr/bin/env node

/**
 * Test Order Placement with Real Store Data
 * For skull@gmail.com account
 */

const API_URL = 'http://localhost:8080';

async function testWithRealStore() {
  console.log('🛍️ Testing Order Placement with Real Store');
  console.log('='.repeat(50) + '\n');

  try {
    // Step 1: Get store info (you'll need to provide store_slug)
    console.log('1️⃣ Fetching your store...');
    
    // Common store slugs - try these
    const possibleSlugs = ['skull-store', 'my-store', 'skull-gmail', 'store'];
    
    let storeFound = false;
    let storeSlug = null;
    
    for (const slug of possibleSlugs) {
      try {
        const settingsRes = await fetch(`${API_URL}/api/storefront/${slug}/settings`);
        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          console.log(`   ✓ Found store: ${slug}`);
          console.log(`   Store name: ${settings.store_name}`);
          storeSlug = slug;
          storeFound = true;
          break;
        }
      } catch (e) {
        // Continue to next slug
      }
    }

    if (!storeFound) {
      console.log('   ⚠️  Could not find store with common slugs');
      console.log('   Please provide your store slug (appears in URL)\n');
      console.log('   Example: /storefront/YOUR-STORE-SLUG\n');
      return;
    }

    // Step 2: Get products from your store
    console.log('\n2️⃣ Fetching products from your store...');
    const productsRes = await fetch(`${API_URL}/api/storefront/${storeSlug}/products`);
    const products = await productsRes.json();
    
    console.log(`   ✓ Found ${products.length} product(s)\n`);
    
    if (products.length === 0) {
      console.log('   ❌ No products in store');
      return;
    }

    const product = products[0];
    console.log(`   Product: ${product.title}`);
    console.log(`   ID: ${product.id}`);
    console.log(`   Price: ${product.price} DZD\n`);

    // Step 3: Create test order
    console.log('3️⃣ Creating test order...\n');
    
    const orderData = {
      product_id: product.id,
      store_slug: storeSlug,
      quantity: 1,
      total_price: product.price,
      customer_name: 'Test Customer ' + Date.now(),
      customer_email: 'test@example.com',
      customer_phone: '+213555123456',
      customer_address: '123 Test St, Algiers'
    };

    console.log('Order data being sent:');
    console.log(JSON.stringify(orderData, null, 2));
    console.log('');

    const orderRes = await fetch(`${API_URL}/api/orders/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    const orderResult = await orderRes.json();

    console.log('4️⃣ Order Response:\n');
    console.log(`Status: ${orderRes.status}`);
    console.log('Result:', JSON.stringify(orderResult, null, 2));

    if (orderRes.ok && orderResult.order) {
      console.log('\n' + '='.repeat(50));
      console.log('✅ ORDER CREATED SUCCESSFULLY!\n');
      console.log(`Order ID: ${orderResult.order.id}`);
      console.log(`Status: ${orderResult.order.status}`);
      console.log(`Total: ${orderResult.order.total_price} DZD`);
      console.log(`Customer: ${orderResult.order.customer_name}`);
      console.log('='.repeat(50));
    } else {
      console.log('\n' + '='.repeat(50));
      console.log('❌ ORDER CREATION FAILED\n');
      console.log(`Error: ${orderResult.error}`);
      console.log('='.repeat(50));
    }

  } catch (error) {
    console.error('\n❌ Test error:', error.message);
  }
}

testWithRealStore();
