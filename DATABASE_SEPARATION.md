# Database Architecture: Complete Seller vs Client Separation

## Overview

The EcoPro platform now uses **completely separate database tables** for marketplace sellers and client businesses, including separate user tables. This ensures complete data isolation and proper feature segregation.

## Table Structure

### Marketplace (Sellers)
**Users Table**: `sellers`
- Separate user table for all sellers
- Fields: id, email, password, name, business_name, phone, address, role, is_verified, stripe_account_id, commission_rate, total_sales, rating
- Role can be 'seller' or 'admin'

**Products Table**: `marketplace_products`
- Used for products listed by individual sellers on the public marketplace
- Visible to all users browsing `/marketplace`
- Managed via `/seller/dashboard`
- Foreign key: `seller_id` → `sellers(id)`

**Orders Table**: `marketplace_orders`
- Orders placed by customers buying from marketplace sellers
- Tracked by sellers via `/api/seller/orders`
- Foreign keys: `seller_id` → `sellers(id)`, `product_id` → `marketplace_products(id)`

### Client Businesses
**Users Table**: `clients`
- Separate user table for all business clients
- Fields: id, email, password, name, company_name, phone, address, role, subscription_tier, subscription_status, stripe_customer_id, subscription_ends_at, features
- Role can be 'client' or 'admin'
- Subscription management fields for billing

**Products Table**: `store_products`
- Used for products managed by paid client businesses in their own stores
- Accessed via client dashboard at `/dashboard`
- More advanced fields: SKU, barcode, weight, dimensions, tags, featured flag
- Foreign key: `client_id` → `clients(id)`

**Orders Table**: `store_orders`
- Orders from client store customers
- More advanced tracking: payment status, tracking numbers, billing/shipping addresses
- Managed via client dashboard
- Foreign keys: `client_id` → `clients(id)`, `product_id` → `store_products(id)`

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

The database separation requires two migrations:

### 1. Separate Product and Order Tables
```bash
psql "$DATABASE_URL" < server/migrations/20251125_separate_seller_client_products.sql
```

This migration:
1. Renames `products` → `marketplace_products`
2. Renames `orders` → `marketplace_orders`
3. Creates `store_products` table for client businesses
4. Creates `store_orders` table for client orders
5. Updates all foreign keys, indexes, and triggers

### 2. Separate User Tables
```bash
psql "$DATABASE_URL" < server/migrations/20251130_separate_user_tables.sql
```

This migration:
1. Creates `sellers` table for marketplace sellers
2. Creates `clients` table for business clients
3. Migrates existing users to appropriate tables based on `user_type`
4. Updates all foreign keys to point to new tables
5. Keeps old `users` table for backwards compatibility (can be dropped later)

## User Types

| Type     | Table      | Description                          | Dashboard Route      | Product Table         |
|----------|------------|--------------------------------------|----------------------|-----------------------|
| `seller` | `sellers`  | Individual marketplace sellers       | `/seller/dashboard`  | `marketplace_products`|
| `client` | `clients`  | Business clients with stores         | `/dashboard`         | `store_products`      |
| `admin`  | Both       | Platform administrators              | `/platform-admin`    | (reads all tables)    |

## Login Flow

### Seller Login
1. POST `/api/seller/login` (queries `sellers` table)
2. Receives token + `user` object with `role: 'seller'`, `user_type: 'seller'`
3. Redirects to `/seller/dashboard`
4. Nav shows "Seller Dashboard" (not "Admin")

### Client Login
1. POST `/api/auth/login` (queries `clients` table)
2. Receives token + `user` object with `role: 'client'`, `user_type: 'client'`
3. Redirects to `/dashboard`
4. Nav shows "Dashboard"

### Admin Login
1. POST `/api/auth/login` or `/api/seller/login` (depends on admin type)
2. Receives token + `user` object with `role: 'admin'`
3. Redirects to `/platform-admin`
4. Nav shows "Admin" with crown icon

## Key Benefits

✅ **Complete Data Isolation**: Sellers and clients use entirely separate tables - no data mixing  
✅ **Security**: Impossible for sellers to access client data or vice versa  
✅ **Role-Based Access**: Each user type has appropriate permissions and UI  
✅ **Scalability**: Separate tables allow independent schema evolution  
✅ **Clear Ownership**: No confusion about who owns what products  
✅ **Schema Flexibility**: Each user type can have type-specific fields  
✅ **Performance**: Smaller, focused tables with better query performance  

## Notes

- Sellers are stored in `sellers` table, clients in `clients` table - complete separation
- The old `users` table is kept temporarily for backwards compatibility
- All seller routes validate that the authenticated seller owns the resource
- All client routes validate that the authenticated client owns the resource
- Platform admins can view all data but should use appropriate endpoints
- Foreign keys ensure data integrity across the separated tables
