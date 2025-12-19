#!/bin/bash

# Test Order Creation Script
# This script tests if orders are being created in the database

echo "🧪 Testing Order Creation..."
echo "================================"

# Step 1: Create a test order
echo ""
echo "1️⃣ Creating test order..."

ORDER_RESPONSE=$(curl -s -X POST http://localhost:8080/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "store_slug": "test-store",
    "quantity": 2,
    "total_price": 10000,
    "customer_name": "Test Customer",
    "customer_email": "test@example.com",
    "customer_phone": "+213555123456",
    "customer_address": "123 Test Street, Test City"
  }')

echo "Response:"
echo "$ORDER_RESPONSE" | jq . 2>/dev/null || echo "$ORDER_RESPONSE"

# Step 2: Extract order ID
ORDER_ID=$(echo "$ORDER_RESPONSE" | jq -r '.order.id // .id // "null"' 2>/dev/null)

if [ "$ORDER_ID" != "null" ] && [ -n "$ORDER_ID" ]; then
  echo ""
  echo "✅ Order created with ID: $ORDER_ID"
  echo ""
  echo "2️⃣ Verifying order in database..."
  
  # Try to query the database directly
  psql -h dpg-d510j0vfte5s739cdai0-a.oregon-postgres.render.com \
    -U ecopro_user \
    -d ecoprodata \
    -c "SELECT id, customer_name, total_price, status, created_at FROM orders WHERE id = $ORDER_ID LIMIT 1;" 2>/dev/null
  
  echo ""
  echo "✅ Order verification complete!"
else
  echo ""
  echo "❌ Failed to create order. Response:"
  echo "$ORDER_RESPONSE"
  echo ""
  echo "2️⃣ Checking if product exists..."
  curl -s http://localhost:8080/api/product/1 | jq . 2>/dev/null || echo "Product not found"
fi

echo ""
echo "================================"
echo "Test complete!"
