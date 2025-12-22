#!/bin/bash

# Test Voucher Code Redemption Flow
# This script simulates creating an expired account and redeeming a code to reactivate it

set -e

BASE_URL="http://localhost:8080"
API_KEY="test"

echo "🎯 Testing Voucher Code Redemption Flow"
echo "========================================"
echo ""

# Step 1: Create a test account
echo "Step 1: Creating test account..."
TEST_EMAIL="voucher-test-$(date +%s)@example.com"
TEST_PASSWORD="TestPass123!"

SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"name\": \"Voucher Test User\",
    \"user_type\": \"client\"
  }")

CLIENT_ID=$(echo "$SIGNUP_RESPONSE" | jq -r '.userId // .client_id' 2>/dev/null || echo "")
AUTH_TOKEN=$(echo "$SIGNUP_RESPONSE" | jq -r '.authToken // .token' 2>/dev/null || echo "")

if [ -z "$CLIENT_ID" ] || [ "$CLIENT_ID" == "null" ]; then
  echo "❌ Failed to create account"
  echo "Response: $SIGNUP_RESPONSE"
  exit 1
fi

echo "✓ Account created"
echo "  Email: $TEST_EMAIL"
echo "  Client ID: $CLIENT_ID"
echo "  Auth Token: ${AUTH_TOKEN:0:20}..."
echo ""

# Step 2: Login to get auth token
echo "Step 2: Logging in to get auth token..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

AUTH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.authToken // .token' 2>/dev/null || echo "")

if [ -z "$AUTH_TOKEN" ] || [ "$AUTH_TOKEN" == "null" ]; then
  echo "❌ Failed to login"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✓ Logged in successfully"
echo ""

# Step 3: Check current subscription status
echo "Step 3: Checking current subscription status..."
SUB_STATUS=$(curl -s -X GET "$BASE_URL/api/billing/subscription" \
  -H "Authorization: Bearer $AUTH_TOKEN")

echo "Current status: $(echo "$SUB_STATUS" | jq -r '.status // .message')"
echo ""

# Step 4: Expire the account (requires admin SQL or special endpoint)
echo "Step 4: Setting account to expired state..."
echo "   Note: In production, this would be done via database"
echo "   We'll need to run SQL directly to set subscription expired"
echo ""

echo "To simulate an expired account, you can:"
echo "1. Run this SQL against the Render database:"
echo ""
echo "   UPDATE subscriptions"
echo "   SET status = 'expired',"
echo "       current_period_end = NOW() - INTERVAL '1 day'"
echo "   WHERE user_id = (SELECT id FROM clients WHERE id = $CLIENT_ID);"
echo ""
echo "   UPDATE clients"
echo "   SET is_locked = true,"
echo "       locked_reason = 'Subscription expired. Please renew your subscription.',"
echo "       locked_at = NOW()"
echo "   WHERE id = $CLIENT_ID;"
echo ""

# Step 5: Generate a voucher code (requires admin auth)
echo "Step 5: Generate a voucher code (admin only)..."
echo ""
echo "You need to:"
echo "1. Login to the platform as admin"
echo "2. Go to Admin Dashboard > Codes tab"
echo "3. Select 'bronze' or 'silver' tier"
echo "4. Click 'Generate Code'"
echo "5. Copy the generated code"
echo ""

# Step 6: Test code redemption with the generated code
read -p "Enter the generated voucher code to test redemption: " VOUCHER_CODE

if [ -z "$VOUCHER_CODE" ]; then
  echo "Skipping redemption test"
  exit 0
fi

echo ""
echo "Step 6: Redeeming voucher code..."

REDEEM_RESPONSE=$(curl -s -X POST "$BASE_URL/api/codes/redeem" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d "{
    \"code\": \"$VOUCHER_CODE\"
  }")

echo "Redemption response:"
echo "$REDEEM_RESPONSE" | jq '.'

REDEEM_SUCCESS=$(echo "$REDEEM_RESPONSE" | jq -r '.success // false')

if [ "$REDEEM_SUCCESS" == "true" ]; then
  echo ""
  echo "✅ Code redeemed successfully!"
  echo ""
  
  # Step 7: Verify account is unlocked
  echo "Step 7: Verifying account status after redemption..."
  
  NEW_STATUS=$(curl -s -X GET "$BASE_URL/api/billing/subscription" \
    -H "Authorization: Bearer $AUTH_TOKEN")
  
  echo "New status:"
  echo "$NEW_STATUS" | jq '.'
  
  echo ""
  echo "✅ Voucher code flow test complete!"
else
  echo ""
  echo "❌ Code redemption failed"
  echo "Error: $(echo "$REDEEM_RESPONSE" | jq -r '.error // "Unknown error"')"
fi

echo ""
echo "========================================"
echo "Test Account Details:"
echo "  Email: $TEST_EMAIL"
echo "  Password: $TEST_PASSWORD"
echo "  Client ID: $CLIENT_ID"
echo "========================================"
