#!/bin/bash

# Test Lock Account Endpoint

API_URL="http://localhost:8080"
ADMIN_TOKEN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecopro.com","password":"admin123"}' | jq -r '.token')

echo "Admin Token: $ADMIN_TOKEN"

if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" == "null" ]; then
  echo "❌ Failed to get admin token"
  exit 1
fi

# Get a client to lock
CLIENT=$(curl -s -X GET "$API_URL/api/admin/locked-accounts" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.accounts[0]')

CLIENT_ID=$(echo $CLIENT | jq -r '.id')
echo "Found client to lock: $CLIENT_ID"

if [ -z "$CLIENT_ID" ] || [ "$CLIENT_ID" == "null" ]; then
  echo "❌ No clients found"
  exit 1
fi

# Test lock endpoint
echo "🔒 Testing lock endpoint..."
LOCK_RESPONSE=$(curl -s -X POST "$API_URL/api/admin/lock-account" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{\"client_id\":$CLIENT_ID,\"reason\":\"Test lock - voucher code issue\"}")

echo "Response: $LOCK_RESPONSE" | jq .

SUCCESS=$(echo "$LOCK_RESPONSE" | jq -r '.message' | grep -i "success")
if [ -n "$SUCCESS" ]; then
  echo "✅ Lock endpoint works!"
else
  ERROR=$(echo "$LOCK_RESPONSE" | jq -r '.error')
  echo "❌ Lock failed: $ERROR"
fi
