# Database Architecture: Seller vs Client Separation

## Overview

The EcoPro platform now uses **separate database tables** for marketplace sellers and client businesses to ensure complete data isolation and proper feature segregation.

## Table Structure

### Marketplace (Sellers)
**Users**: `user_type = 'seller'`

**Products Table**: `marketplace_products`
- Used for products listed by individual sellers on the public marketplace
- Visible to all users browsing `/marketplace`
- Managed via `/seller/dashboard`

**Orders Table**: `marketplace_orders`
- Orders placed by customers buying from marketplace sellers
- Tracked by sellers via `/api/seller/orders`

### Client Businesses
**Users**: `user_type = 'client'`

**Products Table**: `store_products`
- Used for products managed by paid client businesses in their own stores
- Accessed via client dashboard at `/dashboard`
- More advanced fields: SKU, barcode, weight, dimensions, tags, featured flag

**Orders Table**: `store_orders`
- Orders from client store customers
- More advanced tracking: payment status, tracking numbers, billing/shipping addresses
- Managed via client dashboard

### Platform Admin
**Users**: `user_type = 'admin'` and `role = 'admin'`

- Full access to all users, marketplace products, and client store data
- Accessed via `/platform-admin`

## API Endpoints

### Public Marketplace Endpoints
```
GET  /api/products           # List all active marketplace products (sellers only)
GET  /api/products/:id       # Get single marketplace product
```

### Seller Endpoints (Authentication Required)
```
GET    /api/seller/products     # Get seller's marketplace products
POST   /api/seller/products     # Create new marketplace product
PUT    /api/seller/products/:id # Update seller's marketplace product
DELETE /api/seller/products/:id # Delete seller's marketplace product
GET    /api/seller/orders       # Get seller's marketplace orders
```

### Client Dashboard Endpoints (Future)
```
GET    /api/client/products     # Get client's store products
POST   /api/client/products     # Create new store product
PUT    /api/client/products/:id # Update store product
DELETE /api/client/products/:id # Delete store product
GET    /api/client/orders       # Get store orders
```

### Admin Endpoints
```
GET  /api/admin/users           # List all users (includes user_type field)
POST /api/admin/promote         # Promote user to admin
```

## Migration

To apply the database separation, run:

```bash
psql "$DATABASE_URL" < server/migrations/20251125_separate_seller_client_products.sql
```

This migration:
1. Renames `products` → `marketplace_products`
2. Renames `orders` → `marketplace_orders`
3. Creates `store_products` table for client businesses
4. Creates `store_orders` table for client orders
5. Updates all foreign keys, indexes, and triggers

## User Types

| Type     | Description                          | Dashboard Route      | Product Table         |
|----------|--------------------------------------|----------------------|-----------------------|
| `seller` | Individual marketplace sellers       | `/seller/dashboard`  | `marketplace_products`|
| `client` | Business clients with stores         | `/dashboard`         | `store_products`      |
| `admin`  | Platform administrators              | `/platform-admin`    | (reads all tables)    |

## Login Flow

### Seller Login
1. POST `/api/seller/login`
2. Receives token + `user` object with `role: 'seller'`
3. Redirects to `/seller/dashboard`
4. Nav shows "Seller Dashboard" (not "Admin")

### Client Login
1. POST `/api/auth/login`
2. Receives token + `user` object with `role: 'client'` or `'user'`
3. Redirects to `/dashboard`
4. Nav shows "Dashboard"

### Admin Login
1. POST `/api/auth/login`
2. Receives token + `user` object with `role: 'admin'`
3. Redirects to `/platform-admin`
4. Nav shows "Admin" with crown icon

## Key Benefits

✅ **Complete Data Isolation**: Sellers can't see client products, clients can't see marketplace listings  
✅ **Role-Based Access**: Each user type has appropriate permissions and UI  
✅ **Scalability**: Separate tables allow independent schema evolution  
✅ **Clear Ownership**: No confusion about who owns what products  
✅ **Security**: Proper foreign key constraints and CASCADE rules per context  

## Notes

- The `user_type` column determines which dashboard and product table a user can access
- The `role` column is used for legacy compatibility and admin checks
- All seller routes validate that the authenticated user owns the resource
- Platform admins can view all data but should use appropriate endpoints
