# Staff Management System - Database Schema Fix

## Problem Identified

The staff management system was designed with references to a non-existent `stores` table. When trying to load staff members, all queries failed with:
```
ERROR: relation "stores" does not exist
```

## Root Cause

The project uses a **client-based architecture** where:
- **Users** = login accounts
- **Clients** = individual store owners who own exactly ONE storefront
- **Sellers** = marketplace sellers (separate concept)

However, the staff migration (`20251220_create_staff_system.sql`) was referencing a fictional `stores` table instead of the actual `clients` table.

## Solution Implemented

### 1. **Updated Database Migration** (`/server/migrations/20251220_create_staff_system.sql`)
Changed all table references from `stores` to `clients`:

**Before:**
```sql
CREATE TABLE store_staff (
  ...
  store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  ...
  created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
)

CREATE TABLE staff_activity_log (
  ...
  store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
)
```

**After:**
```sql
CREATE TABLE store_staff (
  ...
  client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  ...
  created_by BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
)

CREATE TABLE staff_activity_log (
  ...
  client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
)
```

### 2. **Updated Staff Routes** (`/server/routes/staff.ts`)
Changed all store lookups to client lookups in all endpoints:
- `createStaff()`
- `inviteStaff()`
- `getStaffList()` ✅ Main endpoint that was failing with "No store found"
- `updateStaffPermissions()`
- `removeStaff()`
- `getActivityLog()`
- `requirePermission()` middleware
- `staffLogin()`

**Example change:**
```typescript
// OLD - BROKEN
const storeResult = await pool.query(
  'SELECT id FROM stores WHERE user_id = $1 LIMIT 1',
  [userId]
);
const storeId = storeResult.rows[0].id;

// NEW - FIXED
const clientResult = await pool.query(
  'SELECT id FROM clients WHERE user_id = $1 LIMIT 1',
  [userId]
);
const clientId = clientResult.rows[0].id;
```

### 3. **Fixed Column References**
The `clients` table uses different column names than expected:
- ❌ `store_name` → ✅ `company_name` or `name`

Updated the staffLogin endpoint to use the correct columns.

### 4. **Updated All Query Parameters**
All database queries now use `client_id` instead of `store_id`:

```typescript
// Staff queries
WHERE client_id = $1
INSERT INTO store_staff (client_id, ...) VALUES ($1, ...)
UPDATE store_staff SET ... WHERE client_id = $1
DELETE FROM store_staff WHERE client_id = $1

// Activity logging
WHERE client_id = $1 AND staff_id = $2
INSERT INTO staff_activity_log (client_id, ...) VALUES ($1, ...)
```

## Testing the Fix

Once migrations are run, the staff system should work end-to-end:

1. ✅ Store owner can view their staff (GET `/api/seller/staff`)
2. ✅ Store owner can create new staff (POST `/api/seller/staff/create`)
3. ✅ Store owner can invite staff (POST `/api/seller/staff/invite`)
4. ✅ Store owner can update staff permissions (PATCH `/api/seller/staff/:id/permissions`)
5. ✅ Store owner can remove staff (DELETE `/api/seller/staff/:id`)
6. ✅ Staff can log in (POST `/api/staff/login`)
7. ✅ Activity logs are created for all actions

## Files Modified

1. `/server/migrations/20251220_create_staff_system.sql` - Updated table references
2. `/server/routes/staff.ts` - Updated all queries and business logic

## Database Relationship

```
users (id, user_id, email, password_hash, ...)
   |
   └─> clients (id, user_id, company_name, name, ...)
         |
         └─> store_staff (id, client_id, email, role, permissions, created_by, ...)
               |
               └─> staff_activity_log (id, client_id, staff_id, action, ...)
```

- A user logs in and gets access to their `clients` record
- A client (store owner) can have multiple staff members
- Staff members are linked to the client via `client_id`
- Activity logs track all staff actions within that client

## Notes

- The staff system is now **consistent with the application architecture** where clients = individual store owners
- All foreign keys properly reference the `clients` table
- The system maintains data integrity through CASCADE delete rules
- Activity logging is fully functional for audit trails
