#!/bin/bash

echo "=== Testing Admin Login ==="
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecopro.com","password":"admin123"}' \
  2>/dev/null | jq . | head -30

echo -e "\n=== Testing Client Login ==="
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"skull@gmail.com","password":"password123"}' \
  2>/dev/null | jq . | head -30

echo -e "\n=== Testing Platform Stats (Admin) ==="
curl -X GET http://localhost:8080/api/admin/platform-stats \
  -H "Authorization: Bearer test-token" \
  2>/dev/null | jq . | head -30
