# EcoPro Platform - Table Architecture & Data Flow

## Overview
The EcoPro platform uses a role-based access control system with **3 main user types** stored in a single `users` table with a `user_type` column, plus a separate `staff` table for store employees.

---

## Core Tables

### 1. `users` Table (All Platform Users)
**Purpose**: Central authentication for admins, store owners (clients), and legacy sellers

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(50),
  role VARCHAR(50) DEFAULT 'user', -- legacy field, mostly replaced by user_type
  user_type VARCHAR(20) NOT NULL DEFAULT 'client', -- CRITICAL FIELD
  -- user_type values:
  --   'admin' → Platform admin (full access to all stores)
  --   'client' → Store owner (access only to their own store)
  --   'seller' → Marketplace seller (DEPRECATED - being removed)
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Columns**:
- `user_type` - Determines authorization level:
  - `admin` = Platform administrator (can see all stores, users, staff)
  - `client` = Store owner (can only see their own store data)
  - `seller` = Deprecated marketplace seller (being removed)

---

### 2. `clients` Table (Store Owner Details)
**Purpose**: Store-specific information for store owners (users with user_type='client')

```sql
CREATE TABLE clients (
  id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  company_name VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  subscription_tier VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(20) DEFAULT 'active',
  subscription_ends_at TIMESTAMP,
  stripe_customer_id VARCHAR(255),
  features JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Relationship**: 
- `clients.id` references `users.id` (one-to-one with store owner users)
- Only users with `user_type='client'` have corresponding `clients` records

---

### 3. `staff` Table (Store Employees)
**Purpose**: Manager and staff accounts created by store owners to manage their store

```sql
CREATE TABLE staff (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'manager',
  status VARCHAR(50) DEFAULT 'pending', -- pending, active, inactive
  permissions JSONB DEFAULT '{}', -- Map of permission_name: boolean
  last_login TIMESTAMP,
  created_by BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(client_id, email)
);
```

**Key Relationship**:
- `staff.client_id` references `clients.id` (many staff per store)
- Staff have SEPARATE authentication from users table
- Staff can only login via `/api/staff/login` (not `/api/auth/login`)
- Staff members authenticate with their own email/password (not store owner's)

---

## Table Relationships Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       USERS TABLE                               │
│  (All platform users: admins, store owners, sellers)            │
│                                                                 │
│  id | email | password_hash | user_type | created_at           │
│  ──────────────────────────────────────────────────────────────  │
│  1  | admin@eco.com | *** | 'admin' | 2025-12-01              │
│  2  | owner@eco.com | *** | 'client'| 2025-12-05              │
│  7  | owner2@eco.com| *** | 'client'| 2025-12-10              │
│                                                                 │
│  Check: user_type IN ('admin', 'client', 'seller')             │
└─────────────────────────────────────────────────────────────────┘
         ↓                                  ↓
    ADMIN                            STORE OWNER (CLIENT)
   (user_id=1)                       (user_id=2, 7)
                                            ↓
                            ┌───────────────────────────────┐
                            │   CLIENTS TABLE               │
                            │ (Store owner details)         │
                            │                               │
                            │ id | email | subscription    │
                            │ ──────────────────────────────│
                            │ 2  | owner@eco.com | 'free'  │
                            │ 7  | owner2@eco.com| 'free'  │
                            └───────────────────────────────┘
                                            ↓
                        STORE-SPECIFIC RESOURCES
                   (client_store_settings, products, orders)
                                            ↓
                            ┌───────────────────────────────┐
                            │   STAFF TABLE                 │
                            │ (Store employees/managers)    │
                            │                               │
                            │ id | client_id | email | role│
                            │ ──────────────────────────────│
                            │ 1  | 2 | manager@... |manager│
                            │ 2  | 2 | staff@...   | staff │
                            │ 3  | 7 | mgr2@...    |manager│
                            └───────────────────────────────┘
```

---

## Data Flow & Authorization

### 1. Admin Login Flow
```
User submits email/password
         ↓
POST /api/auth/login
         ↓
Query: SELECT * FROM users WHERE email=$1 AND user_type='admin'
         ↓
Verify password with bcrypt/argon2
         ↓
Generate JWT token with user_type='admin'
         ↓
Token grants UNRESTRICTED ACCESS to all data
  - Can view all users, stores, products, orders
  - Can view all staff across all stores
  - Can delete/modify any resource
```

### 2. Store Owner (Client) Login Flow
```
User submits email/password
         ↓
POST /api/auth/login
         ↓
Query: SELECT * FROM users WHERE email=$1 AND user_type='client'
         ↓
Verify password
         ↓
Generate JWT token with user_type='client' + user_id=2
         ↓
Token grants SCOPED ACCESS via middleware:
  - Can only access: /api/client/* routes
  - Database queries filtered by: WHERE client_id = user_id
  - Can view their own:
    * client_store_settings
    * client_store_products
    * store_orders
    * staff (their own staff members)
  - Cannot view other stores' data
```

### 3. Store Manager/Staff Login Flow
```
User submits email/password
         ↓
POST /api/staff/login  ← DIFFERENT LOGIN ENDPOINT
         ↓
Query: SELECT * FROM staff WHERE email=$1
         ↓
Verify password
         ↓
Generate JWT token with role='staff' + client_id=2 + staff_id=1
         ↓
Token grants STORE-SCOPED ACCESS:
  - Can only access: /api/staff/* routes
  - Database queries filtered by: WHERE client_id = staff.client_id
  - Can view ONLY their store's:
    * Products
    * Orders
    * Activity logs
  - Permissions applied per action:
    * If permission['view_orders'] = false → 403 Forbidden
    * If permission['edit_products'] = true → Allow
```

---

## Store-Specific Tables (Scoped by client_id)

```
┌─────────────────────────────────────────────────────────┐
│   ALL STORE DATA IS SCOPED BY client_id                │
│                                                          │
│   ┌─────────────────────────────────────────────────┐  │
│   │ client_store_settings                           │  │
│   │ (id, client_id, store_name, template_settings) │  │
│   └─────────────────────────────────────────────────┘  │
│                      ↓                                   │
│   ┌─────────────────────────────────────────────────┐  │
│   │ client_store_products                           │  │
│   │ (id, client_id, title, price, stock_quantity) │  │
│   └─────────────────────────────────────────────────┘  │
│                      ↓                                   │
│   ┌─────────────────────────────────────────────────┐  │
│   │ store_orders                                    │  │
│   │ (id, client_id, customer_name, total_price)   │  │
│   └─────────────────────────────────────────────────┘  │
│                      ↓                                   │
│   ┌─────────────────────────────────────────────────┐  │
│   │ staff_activity_log                              │  │
│   │ (id, client_id, staff_id, action, timestamp)   │  │
│   └─────────────────────────────────────────────────┘  │
│                                                          │
│   QUERY PATTERN:                                        │
│   SELECT * FROM client_store_products                  │
│   WHERE client_id = :authenticatedUserId               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Authentication & Authorization Middleware

### Middleware Chain
```
Request arrives
         ↓
authenticate() middleware
  - Extract JWT from Authorization header
  - Verify JWT signature
  - Attach user info to req.user
         ↓
requireAdmin() middleware
  - Check: req.user.user_type === 'admin'
  - If false → return 403 Forbidden
         ↓
Route Handler
  - Access allowed resources based on role
```

### Role-Based Access Patterns

**Admin Endpoint** (requires user_type='admin'):
```typescript
app.get('/api/admin/staff', requireAdmin, (req, res) => {
  // Can see ALL staff across ALL stores
  const result = await pool.query(`
    SELECT * FROM staff
    LEFT JOIN clients ON staff.client_id = clients.id
  `);
  res.json(result.rows); // Returns all 3 staff members
});
```

**Client/Store Owner Endpoint** (requires user_type='client'):
```typescript
app.get('/api/client/staff', requireStoreOwner, (req, res) => {
  // Can see ONLY their own staff
  const result = await pool.query(`
    SELECT * FROM staff
    WHERE client_id = $1
  `, [req.user.id]); // Scoped by store owner's id
  res.json(result.rows); // Returns only staff in their store
});
```

**Staff Member Endpoint** (requires staff role):
```typescript
app.get('/api/staff/orders', requireStaff, (req, res) => {
  // Can see ONLY their store's orders
  const result = await pool.query(`
    SELECT * FROM store_orders
    WHERE client_id = $1
  `, [req.user.client_id]); // Scoped by their store
  res.json(result.rows);
});
```

---

## How It Differs from Your Spec

### Your Spec:
- Separate `clients`, `staff`, `admins` tables

### EcoPro Implementation (Current):
| User Type | Stored In | Has Record In | Authentication |
|-----------|-----------|---------------|-----------------|
| Admin | `users` (user_type='admin') | ❌ None | `/api/auth/login` |
| Store Owner | `users` (user_type='client') | ✅ `clients` | `/api/auth/login` |
| Staff/Manager | ❌ Not in `users` | ✅ `staff` | `/api/staff/login` |

**Why this design?**
1. **Admins & Store Owners** use same `users` table with `user_type` discriminator (simpler)
2. **Staff** use separate `staff` table for security isolation (prevent privilege escalation)
3. Each user type has different login endpoint + different JWT claims

---

## Current Issues & Status

### ✅ Working
- Admin authentication & access to all data
- Client/store owner scoped data access
- Staff table properly separated and isolated
- Role-based middleware enforcing access control
- Admin panel showing admins, clients, and staff

### 🟡 Recent Fixes
- Fixed `/api/admin/staff` endpoint to properly query staff table
- Query now LEFT JOINs with `client_store_settings` to get store names
- Staff card in admin panel now displays all 3 managers with store info

### ⚠️ To Review
- `seller` user type (marked for removal - marketplace feature deleted)
- Consider consolidating `users.user_type` check vs `users.role` vs `clients.role`
- Phone/email encryption not yet implemented (security hardening TODO)

---

## Key Files

| File | Purpose |
|------|---------|
| `server/middleware/auth.ts` | JWT decode, role checks |
| `server/routes/auth.ts` | Login/register for admins & clients |
| `server/routes/staff-auth.ts` | Login for staff members |
| `server/routes/admin.ts` | Admin-only endpoints (listAllStaff) |
| `client/pages/PlatformAdmin.tsx` | Admin dashboard showing all users/staff |

---

## Summary
EcoPro uses a **hybrid model**: unified user table for platform users (admins/clients) + separate staff table for employees. This balances simplicity (fewer tables) with security (staff can't escalate to owner access). All data is scoped by `client_id` at the database query level, enforced by middleware.
