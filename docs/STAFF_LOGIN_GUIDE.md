# Staff Login System - Implementation Guide

## Overview

Store owners can now invite staff members to help manage their store. Staff members have their own login system with granular permission controls.

## How It Works

### 1. **Store Owner Invites Staff** (via Store Settings)
- Go to: **Dashboard → Settings → Staff Management**
- Click: **Invite Staff Member**
- Fill in:
  - Email address of staff member
  - Role: Manager or Staff
  - Permissions: Select which features they can access (Orders, Products, Analytics, etc.)
- Click: **Send Invitation**

### 2. **System Generates Credentials**
- Temporary secure password is generated automatically
- Password is stored in database (hashed with bcrypt)
- Email notification sent to staff member (TODO: implement email service)

### 3. **Staff Member Logs In**
- Go to: **https://ecopro.com/staff/login**
- Enter credentials:
  - **Username**: Email address (the one provided by owner)
  - **Password**: Temporary password from invitation
- Click: **Login**

### 4. **First Login Activation**
- Status changes from "pending" → "active" automatically
- Staff can now access dashboard
- Recommended: Change password on first login (TODO: implement password change flow)

### 5. **Staff Dashboard**
- Location: **https://ecopro.com/staff/dashboard**
- Shows:
  - Greeting with email and store name
  - Current status (Active/Pending)
  - List of available permissions
  - Coming soon: Access to orders, products, analytics based on permissions

## Database Schema

### `store_staff` Table
```sql
CREATE TABLE store_staff (
  id SERIAL PRIMARY KEY,
  store_id INT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'manager' or 'staff'
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'inactive'
  permissions JSONB NOT NULL DEFAULT '{}', -- {permission_name: true/false}
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  invited_at TIMESTAMP,
  activated_at TIMESTAMP,
  last_login TIMESTAMP,
  created_by INT NOT NULL REFERENCES users(id),
  UNIQUE(store_id, email)
);
```

### `staff_activity_log` Table
```sql
CREATE TABLE staff_activity_log (
  id SERIAL PRIMARY KEY,
  store_id INT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  staff_id INT NOT NULL REFERENCES store_staff(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL, -- 'created', 'updated', 'deleted'
  resource_type VARCHAR(100) NOT NULL, -- 'order', 'product', etc
  resource_id INT,
  before_value JSONB,
  after_value JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Staff Login (Unauthenticated)
```
POST /api/staff/login
Content-Type: application/json

{
  "username": "staff@email.com",
  "password": "temporary_password"
}

Response:
{
  "token": "jwt_token",
  "staffId": 123,
  "user": {
    "id": 123,
    "email": "staff@email.com",
    "role": "manager",
    "permissions": { ... },
    "store_name": "My Store",
    "status": "active"
  }
}
```

### Invite Staff (Authenticated Store Owner)
```
POST /api/seller/staff/invite
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "newstaff@email.com",
  "role": "manager",
  "permissions": {
    "view_orders_list": true,
    "edit_order_status": true,
    "delete_orders": false,
    ...
  }
}
```

### Update Staff Permissions (Authenticated Store Owner)
```
PATCH /api/seller/staff/:staffId/permissions
Authorization: Bearer {token}
Content-Type: application/json

{
  "permissions": {
    "view_orders_list": true,
    "edit_order_status": false,
    ...
  }
}
```

### Get Staff List (Authenticated Store Owner)
```
GET /api/seller/staff
Authorization: Bearer {token}

Response:
{
  "data": [
    {
      "id": 123,
      "email": "staff@email.com",
      "role": "manager",
      "status": "active",
      "permissions": { ... },
      "invited_at": "2025-12-20T10:00:00Z",
      "last_login": "2025-12-20T11:30:00Z"
    }
  ]
}
```

### Remove Staff (Authenticated Store Owner)
```
DELETE /api/seller/staff/:staffId
Authorization: Bearer {token}

Response:
{
  "message": "Staff member removed"
}
```

### Get Staff Activity Log (Authenticated Store Owner)
```
GET /api/seller/staff/:staffId/activity
Authorization: Bearer {token}

Response:
{
  "data": [
    {
      "id": 1,
      "action": "updated",
      "resource_type": "order",
      "resource_id": 456,
      "before_value": { ... },
      "after_value": { ... },
      "timestamp": "2025-12-20T11:00:00Z"
    }
  ]
}
```

## Permission System

### Permission Categories

1. **Dashboard & Views**
   - `view_dashboard`
   - `view_orders_list`
   - `view_products_list`
   - `view_analytics`
   - `view_settings`
   - `view_staff_and_logs`

2. **Order Management**
   - `edit_order_status`
   - `edit_order_notes`
   - `delete_orders`
   - `bulk_order_actions`
   - `block_customers`

3. **Product Management**
   - `add_products`
   - `edit_products`
   - `delete_products`
   - `manage_variants`
   - `manage_stock`

4. **Store Management**
   - `view_settings`
   - `edit_store_info`
   - `edit_branding`
   - `edit_templates`
   - `edit_delivery_settings`

5. **Advanced**
   - `view_analytics_reports`
   - `export_data`
   - `manage_bot_settings`
   - `manage_broadcasting`
   - `manage_staff`
   - `view_activity_logs`

## Frontend Components

### StaffLogin.tsx
- Location: `/client/pages/StaffLogin.tsx`
- Purpose: Staff login form
- Features:
  - Username and password fields
  - Error handling
  - Loading state
  - Redirect to staff dashboard on success

### StaffDashboard.tsx
- Location: `/client/pages/StaffDashboard.tsx`
- Purpose: Staff member dashboard
- Features:
  - Welcome greeting
  - Display permissions
  - Logout button
  - Coming soon notice for feature access

### StaffManagement.tsx
- Location: `/client/pages/seller/StaffManagement.tsx`
- Purpose: Store owner staff management interface
- Features:
  - Tab 1: Staff members list with status, permissions count, activity logs
  - Tab 2: Activity log timeline with action history
  - Invite dialog
  - Permission editor (granular toggles by category)
  - Remove staff confirmation

## Implementation Status

### ✅ Completed
- [x] Database schema (store_staff, staff_activity_log tables)
- [x] Permission system (40+ permissions, 7 categories)
- [x] Staff login endpoint (`/api/staff/login`)
- [x] Backend API endpoints (5 endpoints)
- [x] Frontend staff login page
- [x] Frontend staff dashboard
- [x] Frontend staff management interface
- [x] Permission editor component
- [x] Activity log viewer
- [x] Routes and navigation integration
- [x] Multi-language support

### 🔄 In Progress
- [ ] Email notifications for staff invitations
- [ ] Password change flow for staff
- [ ] Permission enforcement on routes (middleware)

### ⏸️ TODO (Phase 2)
- [ ] WebSocket integration for real-time permission updates
- [ ] Staff-specific API endpoints for accessing orders/products
- [ ] Staff access control based on permissions
- [ ] Scheduled reports for staff members
- [ ] Two-factor authentication for staff

## Testing

### Test Scenario 1: Invite Staff
1. Go to Dashboard → Settings → Staff Management
2. Click "Invite Staff Member"
3. Enter email, role, and select some permissions
4. Click "Send Invitation"
5. Verify staff appears in the staff list with "pending" status

### Test Scenario 2: Staff Login
1. Go to `/staff/login`
2. Enter the email used in invitation
3. Enter the temporary password (from database or check logs)
4. Click "Login"
5. Should redirect to `/staff/dashboard`
6. Verify status changed from "pending" → "active"

### Test Scenario 3: Update Permissions
1. Go to Dashboard → Settings → Staff Management
2. Click a staff member to edit permissions
3. Toggle some permissions ON/OFF
4. Permissions should save instantly (PATCH request)
5. Verify staff can see updated permissions in their dashboard

### Test Scenario 4: Activity Log
1. Go to Dashboard → Settings → Staff Management
2. Switch to "Activity Logs" tab
3. Should see timeline of all staff actions
4. Click "View changes" to see before/after values

## Security Considerations

1. **Password Storage**: All passwords hashed with bcrypt
2. **JWT Tokens**: Signed with secret, 7-day expiration
3. **Permission Middleware**: TODO - add `requirePermission()` middleware to all routes
4. **Activity Logging**: All staff actions logged for audit trail
5. **Session Management**: Staff logged out if permissions revoked
6. **Email Verification**: TODO - verify email before sending invitation

## Future Enhancements

1. **Email Notifications**
   - Send invitation email with login link and credentials
   - Send activity digest emails
   - Send alerts for important events

2. **Permission Enforcement**
   - Add middleware to check permissions before route execution
   - Return 403 Forbidden if staff lacks permission
   - Show disabled UI elements for features they don't have access to

3. **Advanced Features**
   - Staff can only see customers from their assigned region/area
   - Delegation: Staff can assign tasks to other staff
   - Salary/commission tracking for staff (phase 2)
   - Performance metrics dashboard for store owner

4. **Mobile Staff App**
   - Mobile-optimized interface for staff
   - Offline mode for taking orders
   - Push notifications for order updates
