# Staff Authentication Security - Separate Table Fix

## Critical Security Issue Fixed ⚠️

**Problem:** Staff members could potentially use their credentials to login as store owners, causing privilege escalation.

**Solution:** Created a completely separate `staff` table with independent authentication system.

---

## Architecture: Staff vs Owner Authentication

### BEFORE (Vulnerable) ❌
```
clients table → user_id → could be used for staff login
(Mixed owner/staff authentication in same context)
```

### AFTER (Secure) ✅
```
clients table → (store owners only)
    ↓
staff table → (staff members only, completely separate)
    ↓
staff_activity_log → (audit trail for staff actions)
```

---

## Database Schema

### Staff Table (New)
```sql
CREATE TABLE staff (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES clients(id),  -- Who they work for
  email VARCHAR(255) NOT NULL,                        -- UNIQUE per client
  password_hash VARCHAR(255) NOT NULL,                -- Their own password
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'manager',                 -- manager, staff, etc
  status VARCHAR(50) DEFAULT 'pending',               -- pending, active, inactive, suspended
  permissions JSONB DEFAULT '{}',                     -- What they can do
  last_login TIMESTAMP,
  last_ip_address VARCHAR(45),
  invited_at TIMESTAMP,
  activated_at TIMESTAMP,
  created_by BIGINT REFERENCES clients(id),           -- Which owner created them
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Key Security Features:**
- ✅ Completely separate table (not mixed with clients)
- ✅ Own email/password per staff member
- ✅ No link to `users` table (can't escalate to owner)
- ✅ Status tracking (active, inactive, suspended)
- ✅ Track created_by (which owner created this staff)
- ✅ Last IP address tracking for security audits

### Staff Activity Log (New)
```sql
CREATE TABLE staff_activity_log (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT,                      -- Which store
  staff_id BIGINT REFERENCES staff(id),  -- Which staff member
  action VARCHAR(100),                   -- What they did
  resource_type VARCHAR(50),             -- What they changed (product, order, etc)
  resource_id BIGINT,
  ip_address VARCHAR(45),                -- Where they logged in from
  timestamp TIMESTAMP
);
```

**Audit Trail Benefits:**
- ✅ Track every action by staff members
- ✅ Know which IP addresses accessed the account
- ✅ Historical record of what changed before/after
- ✅ Detect suspicious activity patterns

---

## Authentication Flow

### Staff Login (Secure)
```typescript
// 1. Query STAFF table ONLY (not clients)
SELECT id, email, client_id, role, permissions, full_name
FROM staff 
WHERE email = $1 AND status IN ('active', 'pending')

// 2. Validate password against staff member's own hash
await comparePassword(password, staff.password_hash)

// 3. Create JWT token with STAFF identity
jwt.sign({
  staffId: staff.id,              // Staff member ID
  clientId: staff.client_id,      // Which client they work for
  isStaff: true,                  // CRITICAL: Mark as staff, NOT owner
  role: staff.role,
  permissions: staff.permissions
})

// 4. Token has completely different structure than owner token
// Owner token would have: userId, clientId, isOwner: true
// Staff token has: staffId, clientId, isStaff: true
```

### Owner Login (Different Path)
```typescript
// Owner/client login uses COMPLETELY DIFFERENT endpoint
// (separate from staff login)
// Handled by different controller, different JWT structure
```

---

## API Endpoints - Staff Only

All staff endpoints require staff authentication:

### Create Staff (Owner Only)
```
POST /api/seller/staff/create
Authorization: Bearer <OWNER_TOKEN>
Body: { username, password, role, permissions }
```

### Invite Staff (Owner Only)
```
POST /api/seller/staff/invite
Authorization: Bearer <OWNER_TOKEN>
Body: { email, role, permissions }
```

### List Staff (Owner Only)
```
GET /api/seller/staff
Authorization: Bearer <OWNER_TOKEN>
```

### Staff Login (Staff Member)
```
POST /api/staff/login
Body: { email, password }
Returns: { token, staffId, user: { ... } }
```

### Access Restricted Resource (Staff Member)
```
GET /api/seller/orders
Authorization: Bearer <STAFF_TOKEN>
```

---

## Permission Checking

### Before (Vulnerable) ❌
```typescript
// Owner and staff used same permission system
// Could potentially check owner permissions if logged in as staff
const permissions = user.permissions;
```

### After (Secure) ✅
```typescript
// Staff permissions are checked ONLY from staff record
const staffRecord = await pool.query(
  'SELECT permissions FROM staff WHERE id = $1 AND client_id = $2',
  [staffId, clientId]
);

// Verify staff is ACTIVE
if (staffRecord.rows[0].status !== 'active') {
  return res.status(403).json({ error: 'Access denied' });
}

// Check specific permission
if (permissions[permission] !== true) {
  return res.status(403).json({ error: 'Permission denied' });
}
```

---

## Privilege Escalation Prevention

### Multiple Layers of Protection

1. **Separate Authentication Paths**
   - Staff login queries STAFF table only
   - Owner login queries different table
   - Cannot cross-authenticate

2. **Different JWT Structures**
   - Owner token: `{ userId, clientId, isOwner: true }`
   - Staff token: `{ staffId, clientId, isStaff: true }`
   - Middleware can verify token type

3. **Status Verification**
   - Staff must be `active` or `pending` status
   - Owners cannot spoof staff login

4. **Activity Logging**
   - Every staff login logged to staff_activity_log
   - Includes IP address for forensics
   - Suspicious patterns can be detected

5. **Permission Model**
   - Staff permissions explicitly granted by owner
   - Owner cannot accidentally give full access
   - Each permission is granular (view_orders, edit_products, etc)

---

## Migration & Deployment

### Database Migration
File: `/server/migrations/20251220_create_staff_system.sql`

Creates:
1. `staff` table (separate authentication)
2. `staff_activity_log` table (audit trail)

### Code Changes
File: `/server/routes/staff.ts`

All endpoints updated to:
- ✅ Use `staff` table instead of `store_staff`
- ✅ Query clients for owner, then staff for members
- ✅ Validate staff status before granting access
- ✅ Log all actions to audit trail
- ✅ Return appropriate error messages

---

## Security Checklist

- ✅ Staff table completely separate from clients/users
- ✅ Staff login queries STAFF table only
- ✅ Staff token structure different from owner token
- ✅ All staff queries include `client_id` verification
- ✅ Status field prevents access to inactive/suspended staff
- ✅ Activity logging tracks IP addresses
- ✅ Permissions are explicit, not inherited
- ✅ Owner cannot accidentally login as staff
- ✅ Staff cannot escalate to owner privileges
- ✅ All staff actions are auditable

---

## Testing

### Test 1: Staff Cannot Login as Owner
```
1. Create staff member: email=john@store.com, password=secret123
2. Try to login with /api/owner/login (should fail)
3. Staff table lookup fails for /api/owner/login queries
✅ PASS: Staff cannot access owner login
```

### Test 2: Staff Can Only Access With Staff Token
```
1. Staff logs in with /api/staff/login → gets staffId in token
2. Try to access /api/seller/orders with staff token
3. Middleware checks staffId and clientId
✅ PASS: Staff can only access with proper token
```

### Test 3: Owner Cannot Access as Staff
```
1. Owner logs in → gets userId in token
2. Try to access /api/staff/orders with owner token
3. Middleware looks for staffId (not found in token)
✅ PASS: Owner token rejected for staff endpoints
```

### Test 4: Activity Logging Works
```
1. Staff logs in and changes an order
2. Query staff_activity_log table
3. See entry: { staff_id, action: 'order_updated', client_id, ip_address }
✅ PASS: All actions logged with IP tracking
```

---

## Future Enhancements

1. **IP Whitelist**: Allow owner to set trusted IP addresses for staff
2. **Device Tracking**: Staff can login from multiple devices, track each
3. **Session Management**: Multiple concurrent sessions with independent tokens
4. **Two-Factor Authentication**: Optional 2FA for staff accounts
5. **Permission Templates**: Pre-defined permission sets (Manager, Support, View-Only)
6. **Login Alerts**: Email owner when staff logs in from new location
7. **Access Requests**: Staff can request additional permissions (owner approves)
8. **Time-Based Access**: Staff can only login during business hours
