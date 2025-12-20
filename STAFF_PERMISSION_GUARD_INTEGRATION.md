# Staff Permission Guard - UI Integration Guide

## Overview

Staff members now see the same dashboard as store owners, but when clicking on pages they don't have permission for, they see:
- Blurred content behind
- Lock icon overlay
- "Access Restricted" message
- "Contact store owner" note

This provides better UX than complete route blocking - staff can see what features exist but can't access them.

## Components Created

### 1. PermissionGuard Component
**File:** `/client/components/PermissionGuard.tsx`

Renders blurred overlay with lock icon when permission is denied.

**Props:**
```typescript
interface PermissionGuardProps {
  hasPermission: boolean;           // Whether staff has permission
  permissionName?: string;          // "view orders", "edit products", etc
  children: React.ReactNode;        // The page content (gets blurred)
  onRequestAccess?: () => void;     // Optional callback for "Request Access" button
}
```

**Usage:**
```tsx
<PermissionGuard hasPermission={hasAccess} permissionName="view orders">
  <OrdersPage />
</PermissionGuard>
```

---

### 2. PermissionContext
**File:** `/client/context/PermissionContext.tsx`

Provides permissions throughout the app via React Context.

**Features:**
- Loads permissions from localStorage (staff) or sets defaults (owners)
- Provides `usePermissions()` hook to access permissions
- Methods: `hasPermission()`, `hasAnyPermission()`, `hasAllPermissions()`

**Usage:**
```tsx
const { permissions, hasPermission, isStaff } = usePermissions();

if (isStaff) {
  console.log('Staff permissions:', permissions);
} else {
  console.log('Owner - has all permissions');
}
```

---

### 3. usePagePermission Hook
**File:** `/client/hooks/usePagePermission.ts`

Convenience hook to check page-level permissions.

**Usage:**
```tsx
const { hasAccess, permissionName, isStaff } = usePagePermission('view_orders');
```

---

## Integration Steps

### Step 1: Wrap App with PermissionProvider
**File:** `/client/App.tsx`

Already done! App is wrapped with:
```tsx
<PermissionProvider>
  <BrowserRouter>
    {/* All routes inside */}
  </BrowserRouter>
</PermissionProvider>
```

---

### Step 2: Update Dashboard Pages

For each admin dashboard page (Orders, Products, Analytics, etc), follow this pattern:

**Before:**
```tsx
export default function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  
  useEffect(() => {
    fetchOrders();
  }, []);
  
  return (
    <div>
      {/* UI content */}
    </div>
  );
}
```

**After:**
```tsx
import { usePagePermission } from '@/hooks/usePagePermission';
import PermissionGuard from '@/components/PermissionGuard';

export default function OrdersAdmin() {
  const { hasAccess, permissionName } = usePagePermission('view_orders');
  
  return (
    <PermissionGuard 
      hasPermission={hasAccess}
      permissionName={permissionName}
    >
      <OrdersContent />
    </PermissionGuard>
  );
}

function OrdersContent() {
  const [orders, setOrders] = useState([]);
  
  useEffect(() => {
    fetchOrders();
  }, []);
  
  return (
    <div>
      {/* All existing UI content */}
    </div>
  );
}
```

---

## Permission Names Reference

These are the permission names that should be used:

| Permission | Usage | Used By |
|---|---|---|
| `view_orders` | View orders page | `/admin/orders` |
| `edit_orders` | Update order status, notes | `/admin/orders` actions |
| `delete_orders` | Delete orders | Bulk actions |
| `view_products` | View products page | `/admin/products` |
| `add_products` | Create new products | `/admin/products/add` |
| `edit_products` | Edit product details, stock | `/admin/products/edit` |
| `delete_products` | Delete products | Bulk actions |
| `view_analytics` | View analytics page | `/admin/analytics` |
| `export_data` | Export to CSV/PDF | Analytics actions |
| `manage_staff` | Manage staff members | `/admin/settings/staff` |
| `view_settings` | View store settings | `/admin/settings` |
| `edit_settings` | Modify store settings | `/admin/settings` pages |

---

## Pages to Update

Create wrapped versions for these pages:

1. **Orders Page** (`/admin/orders`)
   - Permission: `view_orders`
   - Content: OrdersContent component

2. **Products Page** (`/admin/products`)
   - Permission: `view_products`
   - Content: ProductsContent component

3. **Analytics Page** (`/admin/analytics`)
   - Permission: `view_analytics`
   - Content: AnalyticsContent component

4. **Settings Pages** (`/admin/settings/*`)
   - Permission: `view_settings` (view) / `edit_settings` (edit)
   - Content: SettingsContent component

5. **Staff Management** (`/admin/settings/staff`)
   - Permission: `manage_staff`
   - Content: StaffManagementContent component

---

## Example Implementation for Orders Page

### File: `/client/pages/admin/Orders.tsx`

```tsx
import React, { useEffect, useState } from "react";
import { MoreHorizontal, Download, Filter, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { usePagePermission } from "@/hooks/usePagePermission";
import PermissionGuard from "@/components/PermissionGuard";

export default function OrdersAdmin() {
  const { hasAccess, permissionName } = usePagePermission('view_orders');
  
  return (
    <PermissionGuard 
      hasPermission={hasAccess}
      permissionName={permissionName}
    >
      <OrdersContent />
    </PermissionGuard>
  );
}

function OrdersContent() {
  const { t, locale } = useTranslation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // ... rest of existing OrdersAdmin component code ...
  
  return (
    <div>
      {/* All existing Orders UI */}
    </div>
  );
}
```

---

## How It Works for Staff

### Staff Permission Setup Flow:

1. **Store Owner Creates Staff Member**
   ```
   Owner goes to: Settings → Staff Management
   Creates: "John" with permissions:
     ✅ view_orders: true
     ✅ edit_orders: true
     ❌ view_products: false
     ❌ add_products: false
     ❌ manage_staff: false
   ```

2. **Staff Logs In**
   ```
   URL: /staff/login
   Username: john@store.com
   Password: ****
   
   Backend returns JWT with:
   {
     staffId: 5,
     clientId: 2,
     permissions: {
       view_orders: true,
       edit_orders: true,
       view_products: false,
       add_products: false,
       manage_staff: false
     }
   }
   ```

3. **Staff Sees Dashboard**
   ```
   StaffDashboard shows all menu items:
   - Orders ✓ (has permission)
   - Products ✗ (no permission, will be blurred)
   - Analytics ✗ (no permission)
   - Settings ✗ (no permission)
   ```

4. **Staff Clicks on Products (No Permission)**
   ```
   Navigate to: /admin/products
   
   Component renders ProductGuard:
   <PermissionGuard hasPermission={false} permissionName="view products">
     <ProductsContent /> {/* Gets blurred */}
   </PermissionGuard>
   
   Result:
   - Page content is blurred (opacity 50%)
   - Lock icon overlay appears
   - "Access Restricted" message shows
   - "Contact store owner to request access" note
   ```

5. **Staff Clicks on Orders (Has Permission)**
   ```
   Navigate to: /admin/orders
   
   Component renders OrderGuard:
   <PermissionGuard hasPermission={true} permissionName="view orders">
     <OrdersContent /> {/* NOT blurred */}
   </PermissionGuard>
   
   Result:
   - Full access to Orders page
   - No lock overlay
   - Can view and edit orders
   ```

---

## Testing the Implementation

### Test 1: Owner Access
```
1. Login as store owner
2. Navigate to all admin pages
3. Verify NO lock overlays appear
4. All pages fully accessible
```

### Test 2: Staff with All Permissions
```
1. Create staff with all permissions enabled
2. Login as staff
3. Navigate to all admin pages
4. Verify NO lock overlays appear
```

### Test 3: Staff with Limited Permissions
```
1. Create staff with only view_orders + edit_orders
2. Login as staff
3. Navigate to /admin/orders
   ✓ Should see orders page normally
4. Navigate to /admin/products
   ✓ Should see blurred page + lock icon
5. Navigate to /admin/analytics
   ✓ Should see blurred page + lock icon
6. Navigate to /admin/settings
   ✓ Should see blurred page + lock icon
```

### Test 4: Permission Removal
```
1. Staff is viewing orders (has permission)
2. Owner removes view_orders permission
3. Staff refreshes page
4. Page should now show lock overlay
```

---

## Styling Notes

The PermissionGuard uses:
- **Blur:** `blur-sm opacity-50` for content
- **Colors:** Red-600 for lock icon, matches error states
- **Text:** "Access Restricted" header with explanation
- **Dark Mode:** Full support with `dark:` Tailwind classes

### Customization Options

To change appearance, edit `/client/components/PermissionGuard.tsx`:

```tsx
// Change blur amount
<div className="blur-lg opacity-40 pointer-events-none"> {/* blur-lg, opacity-40 */}

// Change lock icon color
<Lock className="w-8 h-8 text-yellow-600" /> {/* Change to yellow, blue, etc */}

// Change background
<div className="bg-gradient-to-br from-red-50 to-red-100"> {/* Add gradient */}
```

---

## Edge Cases Handled

1. **Owner (non-staff)**
   - `isStaff = false` → All permissions return `true`
   - PermissionGuard always shows content (no overlay)

2. **Staff with no permissions set**
   - All permission checks return `false`
   - All pages show lock overlay

3. **Staff logs out and back in**
   - Permissions reload from localStorage
   - JWT re-validated by backend

4. **Permission changed while staff is browsing**
   - Staff won't see update until page refresh
   - (Can add real-time updates later)

---

## Files to Update (Checklist)

- [ ] `/client/pages/admin/Orders.tsx` - Wrap with view_orders permission
- [ ] `/client/pages/admin/Products.tsx` - Wrap with view_products permission
- [ ] `/client/pages/admin/Analytics.tsx` - Wrap with view_analytics permission
- [ ] `/client/pages/admin/Settings.tsx` - Wrap with view_settings permission
- [ ] `/client/pages/seller/StaffManagement.tsx` - Wrap with manage_staff permission
- [ ] `/client/pages/admin/Dashboard.tsx` - Add permission checks to action buttons
- [ ] Update navigation menu to show permission status

---

## Next Steps

1. Test the current implementation with a staff member
2. Wrap each dashboard page with PermissionGuard
3. Add permission checks to action buttons (add product, delete order, etc)
4. Update dashboard navigation to show locked sections
5. Add real-time permission updates (WebSocket or polling)
