#!/usr/bin/env node

/**
 * Final Order Placement Test
 * Tests the order creation with all available data combinations
 */

const API_URL = 'http://localhost:8080';

async function runFinalTest() {
  console.log('🎯 Final Order Placement Test');
  console.log('================================\n');

  try {
    // First, let's see what data we have
    console.log('📊 Gathering System Information...\n');

    // Check health
    const healthRes = await fetch(`${API_URL}/api/health`);
    const health = await healthRes.json();
    console.log('✓ Server Status: Online');
    console.log(`✓ Database: ${health.db?.connected ? 'Connected' : 'Disconnected'}`);

    // Get products
    const productsRes = await fetch(`${API_URL}/api/products`);
    const products = await productsRes.json();
    console.log(`✓ Marketplace Products: ${products.length}`);

    // Attempt order creation with all scenarios
    console.log('\n📝 Testing Order Creation Scenarios...\n');

    const scenarios = [
      {
        name: 'Scenario 1: Minimal Data (product_id + client_id)',
        data: {
          product_id: 1,
          client_id: 1,
          quantity: 1,
          total_price: 5000,
          customer_name: 'Test User'
        }
      },
      {
        name: 'Scenario 2: With customer details',
        data: {
          product_id: 1,
          client_id: 1,
          quantity: 2,
          total_price: 10000,
          customer_name: 'John Doe',
          customer_email: 'john@example.com',
          customer_phone: '+213555123456',
          customer_address: 'Address City'
        }
      },
      {
        name: 'Scenario 3: Using store_slug',
        data: {
          product_id: 1,
          store_slug: 'test-store',
          quantity: 1,
          total_price: 5000,
          customer_name: 'Test User'
        }
      }
    ];

    let successCount = 0;

    for (const scenario of scenarios) {
      console.log(`\n🔹 ${scenario.name}`);
      console.log('   Data:', JSON.stringify(scenario.data, null, 2).split('\n').join('\n   '));

      try {
        const response = await fetch(`${API_URL}/api/orders/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scenario.data)
        });

        const result = await response.json();

        console.log(`   Status: ${response.status}`);
        console.log(`   Result: ${JSON.stringify(result)}`);

        if (response.ok && result.order) {
          console.log(`   ✅ SUCCESS! Order ID: ${result.order.id}`);
          successCount++;
        } else {
          console.log(`   ❌ FAILED: ${result.error || 'Unknown error'}`);
        }
      } catch (err) {
        console.log(`   ❌ ERROR: ${err.message}`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`\n📈 Test Results: ${successCount}/${scenarios.length} scenarios passed\n`);

    if (successCount === 0) {
      console.log('🔍 Diagnosis:');
      console.log('  • No valid products in the database');
      console.log('  • No valid clients in the database');
      console.log('  • Store slug "test-store" does not exist');
      console.log('\n💡 Solution:');
      console.log('  1. Go to http://localhost:8080/dashboard');
      console.log('  2. Create a store and add products');
      console.log('  3. Then test checkout on those products');
    } else {
      console.log('✅ Order creation is working!');
      console.log('   You can now test the checkout flow in the browser.');
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

runFinalTest();
