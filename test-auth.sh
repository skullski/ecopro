#!/bin/bash

# Minimal ASCII-only smoke test for core flows
# - register/login/me
# - create public vendor
# - create public product
# - list public store products

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

API_URL="${API_URL:-http://localhost:8080/api}"

echo -e "${YELLOW}Starting minimal smoke tests${NC}\n"

# 1) Register
echo -e "${YELLOW}1) Register test user${NC}"
PAYLOAD=$(printf '{"email":"%s","password":"%s","name":"%s"}' 'smoke@example.com' 'Test1234' 'Smoke User')
RESP=$(curl -s -X POST "$API_URL/auth/register" -H "Content-Type: application/json" -d "$PAYLOAD")
if echo "$RESP" | grep -q 'token'; then
  echo -e "${GREEN}[OK] register returned token${NC}"
  TOKEN=$(echo "$RESP" | sed -n 's/.*"token":"\([^\"]*\)".*/\1/p')
elif echo "$RESP" | grep -q 'Too many'; then
  echo -e "${YELLOW}[WARN] register rate-limited; continuing without token${NC}"
else
  echo -e "${YELLOW}[WARN] register did not return token (might already exist)${NC}"
  echo "$RESP"
fi

# 2) Login
echo -e "\n${YELLOW}2) Login test user${NC}"
PAYLOAD=$(printf '{"email":"%s","password":"%s"}' 'smoke@example.com' 'Test1234')
RESP=$(curl -s -X POST "$API_URL/auth/login" -H "Content-Type: application/json" -d "$PAYLOAD")
if echo "$RESP" | grep -q 'token'; then
  echo -e "${GREEN}[OK] login returned token${NC}"
  TOKEN=$(echo "$RESP" | sed -n 's/.*"token":"\([^\"]*\)".*/\1/p')
elif echo "$RESP" | grep -q 'Too many'; then
  echo -e "${YELLOW}[WARN] login rate-limited; continuing without token${NC}"
  TOKEN=''
else
  echo -e "${RED}[FAIL] login did not return token${NC}"
  echo "$RESP"
  exit 1
fi

# 3) Me
echo -e "\n${YELLOW}3) Get current user (me)${NC}"
ME=$(curl -s -X GET "$API_URL/auth/me" -H "Authorization: Bearer $TOKEN")
if echo "$ME" | grep -q 'smoke@example.com'; then
  echo -e "${GREEN}[OK] /auth/me returned user${NC}"
else
  echo -e "${RED}[FAIL] /auth/me did not return expected user${NC}"
  echo "$ME"
fi

# 4) Create public vendor
echo -e "\n${YELLOW}4) Create public vendor${NC}"
TS=$(date +%s)
VEMAIL="vendor-smoke-${TS}@example.com"
VPAYLOAD=$(printf '{"name":"%s","email":"%s","businessName":"%s","storeSlug":"%s"}' 'Smoke Vendor' "$VEMAIL" 'Smoke Store' "smoke-store-$TS")
VRESP=$(curl -s -X POST "$API_URL/vendors" -H "Content-Type: application/json" -d "$VPAYLOAD")
if echo "$VRESP" | grep -q 'id'; then
  echo -e "${GREEN}[OK] vendor created${NC}"
else
  echo -e "${YELLOW}[WARN] vendor creation returned unexpected response${NC}"
  echo "$VRESP"
fi

# 5) Create public product
echo -e "\n${YELLOW}5) Create public product${NC}"
PPAYLOAD=$(printf '{"title":"%s","description":"%s","price":%s,"images":["%s"],"category":"%s"}' 'Smoke Product' 'A product created by smoke test' 1.99 'https://example.com/test.png' 'demo')
PRESP=$(curl -s -X POST "$API_URL/products/public" -H "Content-Type: application/json" -d "$PPAYLOAD")
if echo "$PRESP" | grep -q 'ownerKey'; then
  echo -e "${GREEN}[OK] public product created${NC}"
else
  echo -e "${RED}[FAIL] public product creation failed${NC}"
  echo "$PRESP"
fi

# 6) List products
echo -e "\n${YELLOW}6) List public store products${NC}"
LIST=$(curl -s "$API_URL/products")
if echo "$LIST" | grep -q 'Smoke Product'; then
  echo -e "${GREEN}[OK] product visible in public store${NC}"
else
  echo -e "${YELLOW}[WARN] product not found in public store result${NC}"
  echo "$LIST"
fi

echo -e "\n${YELLOW}Minimal smoke tests complete${NC}\n"

exit 0
