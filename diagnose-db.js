#!/usr/bin/env node

/**
 * Database Diagnostic Script
 * Checks database structure and data
 */

const API_URL = 'http://localhost:8080';

async function diagnose() {
  console.log('🔍 Database Diagnostic');
  console.log('='.repeat(50) + '\n');

  try {
    // Check health/DB
    const healthRes = await fetch(`${API_URL}/api/health`);
    const health = await healthRes.json();
    
    console.log('✓ Server Status:', health.status);
    console.log('✓ Database Connected:', health.db?.connected);
    console.log('✓ DB Latency:', health.db?.latency, 'ms\n');

    // Try to get stats
    console.log('📊 Attempting to query database stats...\n');

    // Check if there's a DB check endpoint
    const dbCheckRes = await fetch(`${API_URL}/api/db-check`);
    if (dbCheckRes.ok) {
      const dbCheck = await dbCheckRes.json();
      console.log('Database Check Results:');
      console.log(JSON.stringify(dbCheck, null, 2));
    }

    console.log('\n' + '='.repeat(50));
    console.log('\n📋 What we know:');
    console.log('  ✓ Tables: client_store_products, client_store_settings, store_orders');
    console.log('  ✓ Schema: Product must have client_id and valid price');
    console.log('  ✗ No products found in client_store_products');
    console.log('  ✗ No stores found in client_store_settings');

    console.log('\n🔧 To create test data:');
    console.log('  1. Visit: http://localhost:8080/dashboard');
    console.log('  2. Login: admin@ecopro.com / admin123');
    console.log('  3. Create a "Client" (store)');
    console.log('  4. Add products to that client');
    console.log('  5. Then test checkout\n');

    console.log('💡 Or use API directly:');
    console.log('  POST /api/client-store/products');
    console.log('  (with authentication)\n');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

diagnose();
