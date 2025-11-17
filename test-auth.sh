#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:8081/api"

echo -e "${YELLOW}Testing Authentication System${NC}\n"

# Test 1: Register new user
echo -e "${YELLOW}Test 1: Register new user${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "name": "Test User"
  }')

if echo "$REGISTER_RESPONSE" | grep -q "token"; then
  echo -e "${GREEN}✅ Registration successful${NC}"
  TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  echo "Token: $TOKEN"
else
  echo -e "${RED}❌ Registration failed${NC}"
  echo "$REGISTER_RESPONSE"
fi

echo ""

# Test 2: Login with wrong password
echo -e "${YELLOW}Test 2: Login with wrong password (should fail)${NC}"
WRONG_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "WrongPassword"
  }')

if echo "$WRONG_LOGIN" | grep -q "error"; then
  echo -e "${GREEN}✅ Correctly rejected wrong password${NC}"
else
  echo -e "${RED}❌ Should have rejected wrong password${NC}"
fi

echo ""

# Test 3: Login with correct password
echo -e "${YELLOW}Test 3: Login with correct credentials${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
  echo -e "${GREEN}✅ Login successful${NC}"
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  echo "Token: $TOKEN"
else
  echo -e "${RED}❌ Login failed${NC}"
  echo "$LOGIN_RESPONSE"
fi

echo ""

# Test 4: Get current user with token
echo -e "${YELLOW}Test 4: Get current user (authenticated)${NC}"
ME_RESPONSE=$(curl -s -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN")

if echo "$ME_RESPONSE" | grep -q "test@example.com"; then
  echo -e "${GREEN}✅ Successfully retrieved user data${NC}"
  echo "$ME_RESPONSE"
else
  echo -e "${RED}❌ Failed to get user data${NC}"
  echo "$ME_RESPONSE"
fi

echo ""

# Test 5: Admin login
echo -e "${YELLOW}Test 5: Admin login${NC}"
ADMIN_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ecopro.com",
    "password": "admin123"
  }')

if echo "$ADMIN_LOGIN" | grep -q "admin"; then
  echo -e "${GREEN}✅ Admin login successful${NC}"
  ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  echo "Admin Token: $ADMIN_TOKEN"
else
  echo -e "${RED}❌ Admin login failed${NC}"
  echo "$ADMIN_LOGIN"
fi

echo ""

# Test 6: Rate limiting test
echo -e "${YELLOW}Test 6: Rate limiting (6 rapid login attempts)${NC}"
for i in {1..6}; do
  RATE_TEST=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test"}')
  
  if echo "$RATE_TEST" | grep -q "Too many"; then
    echo -e "${GREEN}✅ Rate limiting active after $i attempts${NC}"
    break
  elif [ $i -eq 6 ]; then
    echo -e "${YELLOW}⚠️  Rate limiting not triggered (might need 5+ failed attempts)${NC}"
  fi
done

echo ""
echo -e "${YELLOW}Test 7: Vendor signup (public)${NC}"
VENDOR_RESPONSE=$(curl -s -X POST "$API_URL/vendors" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vendor Test",
    "email": "vendor-test@example.com",
    "phone": "+10000000000",
    "businessName": "Vendor Test Store",
    "storeSlug": "vendor-test-store-1",
    "description": "A sample vendor",
    "rating": 0,
    "totalSales": 0,
    "totalProducts": 0,
    "verified": false,
    "isVIP": false,
    "subscriptionStatus": "free",
    "joinedAt": 0,
    "location": {"city": "City", "country": "Country"}
  }')

if echo "$VENDOR_RESPONSE" | grep -q "vendor_test" || echo "$VENDOR_RESPONSE" | grep -q "vendor-"; then
  echo -e "${GREEN}✅ Vendor signup successful${NC}"
else
  echo -e "${RED}❌ Vendor signup failed${NC}"
  echo "$VENDOR_RESPONSE"
fi

echo -e "${YELLOW}Test 8: Duplicate vendor signup${NC}"
DUP=$(curl -s -X POST "$API_URL/vendors" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Vendor Test", "email": "vendor-test@example.com" }')
if echo "$DUP" | grep -q "already exists"; then
  echo -e "${GREEN}✅ Duplicate vendor correctly rejected${NC}"
else
  echo -e "${RED}❌ Duplicate vendor accepted (should be rejected)${NC}"
  echo "$DUP"
fi

echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}Authentication tests completed!${NC}"
echo -e "${GREEN}==================================${NC}"

echo -e "\n${YELLOW}Test 9: Create public product (QuickSell) and verify marketplace visibility${NC}"
PUBLIC_PRODUCT_RESPONSE=$(curl -s -X POST "$API_URL/products/public" \
  -H "Content-Type: application/json" \
  -d '{"title":"Public Test","description":"Public created product","price":9.99,"images":[],"category":"demo","isExportedToMarketplace":true,"ownerEmail":"anon@example.com"}')

if echo "$PUBLIC_PRODUCT_RESPONSE" | grep -q "ownerKey"; then
  echo -e "${GREEN}✅ Public product created with ownerKey${NC}"
  OWNER_KEY=$(echo "$PUBLIC_PRODUCT_RESPONSE" | grep -o '"ownerKey":"[^']*' | cut -d'"' -f4)
  PRODUCT_ID=$(echo "$PUBLIC_PRODUCT_RESPONSE" | grep -o '"id":"[^']*' | cut -d'"' -f4)
  echo "OwnerKey: $OWNER_KEY ProductId: $PRODUCT_ID"

  # Check marketplace listing
  ALL_PRODUCTS=$(curl -s "$API_URL/products")
  if echo "$ALL_PRODUCTS" | grep -q "Public Test"; then
    echo -e "${GREEN}✅ Public product appears in marketplace${NC}"
  else
    echo -e "${RED}❌ Public product not visible in marketplace${NC}"
    echo "$ALL_PRODUCTS"
  fi
else
  echo -e "${RED}❌ Failed to create public product${NC}"
  echo "$PUBLIC_PRODUCT_RESPONSE"
fi
