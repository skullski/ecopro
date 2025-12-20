# Staff Permission Guard - Visual Documentation

## User Journey

### Store Owner
```
┌──────────────────────────────────────┐
│  Create Staff Member                 │
│  Settings → Staff Management → Add   │
├──────────────────────────────────────┤
│ Name: John                           │
│ Email: john@store.com               │
│ Password: ••••••••                   │
│ Permissions:                         │
│  ✅ view_orders    ✅ edit_orders   │
│  ❌ view_products  ❌ view_analytics│
│                                      │
│         [Save Staff] [Cancel]        │
└──────────────────────────────────────┘
         ↓ (saves to backend)
    Staff member created with
    specific permissions
```

### Staff Member Login
```
┌──────────────────────────────────────┐
│  Staff Login                         │
├──────────────────────────────────────┤
│ Username: john@store.com            │
│ Password: ••••••••                  │
│                                      │
│           [Login] [Back]             │
└──────────────────────────────────────┘
         ↓ (verify credentials)
┌──────────────────────────────────────┐
│ Backend:                             │
│ 1. Check staff exists               │
│ 2. Verify password                  │
│ 3. Load permissions                 │
│ 4. Generate JWT with permissions   │
│ 5. Return token                     │
└──────────────────────────────────────┘
         ↓ (store token)
┌──────────────────────────────────────┐
│ Frontend:                            │
│ 1. Store JWT in localStorage        │
│ 2. Store permissions in localStorage│
│ 3. Initialize PermissionContext     │
│ 4. Redirect to /staff/dashboard    │
└──────────────────────────────────────┘
```

### Dashboard Access
```
┌──────────────────────────────────────┐
│  Staff Dashboard                     │
├──────────────────────────────────────┤
│                                      │
│  📊 Orders           ← ✅ ENABLED   │
│  📦 Products         ← ❌ DISABLED  │
│  📈 Analytics        ← ❌ DISABLED  │
│  ⚙️ Settings          ← ❌ DISABLED  │
│  👥 Staff Management ← ❌ DISABLED  │
│                                      │
└──────────────────────────────────────┘
           ↓ (click)
    
CLICK "Orders" (Has Permission)        CLICK "Products" (No Permission)
┌────────────────────────────────────┐ ┌────────────────────────────────────┐
│  Orders Page - FULLY FUNCTIONAL    │ │  Products Page - BLURRED + LOCKED  │
│                                    │ │                                    │
│  All Orders                        │ │  [BLURRED CONTENT]             🔒 │
│  ┌────────────────────────────────┐│ │                                    │
│  │ Order #001 - Confirmed         ││ │        ┌──────────────────┐       │
│  │ Customer: Ahmed                ││ │        │      🔒          │       │
│  │ Status: [Change ▼]             ││ │        │                  │       │
│  │                                ││ │        │  Access          │       │
│  │ Order #002 - Pending           ││ │        │  Restricted      │       │
│  │ Customer: Fatima               ││ │        │                  │       │
│  │ Status: [Change ▼]             ││ │        │  You don't have  │       │
│  └────────────────────────────────┘│ │        │  permission to   │       │
│                                    │ │        │  access this     │       │
│  [+ Add Order] [Export]            │ │        │  feature.        │       │
│                                    │ │        │                  │       │
│  Full access, all buttons work ✓   │ │        │  Contact store   │       │
└────────────────────────────────────┘ │        │  owner to        │       │
                                       │        │  request access. │       │
                                       │        └──────────────────┘       │
                                       │                                    │
                                       │  Page shows what's there but       │
                                       │  prevents accidental clicks    ✓   │
                                       └────────────────────────────────────┘
```

---

## Component Hierarchy

```
App
├── PermissionProvider
│   ├── BrowserRouter
│   │   ├── Layout
│   │   │   └── CartProvider
│   │   │       └── Routes
│   │   │           ├── /admin/orders
│   │   │           │   └── OrdersAdmin
│   │   │           │       └── PermissionGuard (hasPermission='view_orders')
│   │   │           │           └── OrdersContent
│   │   │           │
│   │   │           ├── /admin/products
│   │   │           │   └── ProductsAdmin
│   │   │           │       └── PermissionGuard (hasPermission='view_products')
│   │   │           │           └── ProductsContent
│   │   │           │
│   │   │           └── ... other routes
```

---

## Permission Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PERMISSION CHECKING FLOW                         │
└─────────────────────────────────────────────────────────────────────┘

                          Page Component Renders
                                  ↓
                    usePagePermission('view_orders')
                                  ↓
                      PermissionContext.usePermissions()
                                  ↓
        ┌─────────────────────────────────────────────────────┐
        │ Check isStaff flag                                  │
        └─────────────────────────────────────────────────────┘
                    ↓                           ↓
              isStaff=true                isStaff=false
                    ↓                           ↓
         Look up permissions           Return all permissions=true
         in localStorage                  (owner has all)
                    ↓
        ┌─────────────────────────────────────────────────────┐
        │ Check permission['view_orders'] in localStorage     │
        └─────────────────────────────────────────────────────┘
                    ↓                           ↓
            Permission=true            Permission=false
                    ↓                           ↓
        Return hasAccess=true          Return hasAccess=false
                    ↓                           ↓
        ┌─────────────────────────────────────────────────────┐
        │              PermissionGuard Component              │
        └─────────────────────────────────────────────────────┘
                    ↓                           ↓
        <PermissionGuard           <PermissionGuard
         hasPermission={true}>      hasPermission={false}>
                    ↓                           ↓
        Render children                  Blur content
        (OrdersContent)           + Show lock overlay
                    ↓                           ↓
        ✅ Full page visible        🔒 Locked page visible
```

---

## Code Flow Example

### When Staff Accesses Orders Page (Has Permission)

```typescript
// File: /client/pages/admin/Orders.tsx

export default function OrdersAdmin() {
  // 1. Check permission
  const { hasAccess, permissionName } = usePagePermission('view_orders');
  // → hasAccess = true (staff has view_orders permission)
  // → permissionName = "view orders"

  // 2. Wrap content with PermissionGuard
  return (
    <PermissionGuard 
      hasPermission={true}           // ← permission check passed
      permissionName="view orders"
    >
      <OrdersContent />
    </PermissionGuard>
  );
}

// Inside PermissionGuard component:
if (hasPermission) {
  return <>{children}</>;  // ← Just render OrdersContent
}

// Result: Staff sees full Orders page
```

### When Staff Accesses Products Page (No Permission)

```typescript
// File: /client/pages/admin/Products.tsx

export default function ProductsAdmin() {
  // 1. Check permission
  const { hasAccess, permissionName } = usePagePermission('view_products');
  // → hasAccess = false (staff does NOT have view_products permission)
  // → permissionName = "view products"

  // 2. Wrap content with PermissionGuard
  return (
    <PermissionGuard 
      hasPermission={false}          // ← permission check FAILED
      permissionName="view products"
    >
      <ProductsContent />
    </PermissionGuard>
  );
}

// Inside PermissionGuard component:
if (!hasPermission) {
  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="blur-sm opacity-50">
        <ProductsContent />  {/* ← gets blurred */}
      </div>
      
      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div>
          <Lock icon />
          <h3>Access Restricted</h3>
          <p>You don't have permission to access view products</p>
          <p>Please contact the store owner to request access.</p>
        </div>
      </div>
    </div>
  );
}

// Result: Staff sees blurred Products page with lock icon
```

---

## State Management

```
┌─────────────────────────────────────────────────────────┐
│           localStorage (Client Browser)                 │
├─────────────────────────────────────────────────────────┤
│ authToken: "eyJ0eXAiOiJKV1QiLCJhbGc..."               │
│                                                         │
│ user: {                                                │
│   id: 5,                                              │
│   email: "john@store.com",                           │
│   role: "manager",                                    │
│   permissions: {                                      │
│     view_orders: true,                               │
│     edit_orders: true,                               │
│     view_products: false,                            │
│     view_analytics: false,                           │
│     manage_staff: false,                             │
│     ... more permissions                             │
│   }                                                   │
│ }                                                      │
│                                                         │
│ isStaff: "true"                                       │
│ staffClientId: "1"                                    │
└─────────────────────────────────────────────────────────┘
         ↓ (loaded on app start)
┌─────────────────────────────────────────────────────────┐
│           PermissionContext (React State)              │
├─────────────────────────────────────────────────────────┤
│ permissions: {                                         │
│   view_orders: true,                                  │
│   edit_orders: true,                                  │
│   view_products: false,                               │
│   ...                                                  │
│ }                                                       │
│                                                         │
│ isStaff: true                                         │
│ isLoading: false                                      │
│                                                         │
│ Methods:                                              │
│ - hasPermission('view_orders') → true               │
│ - hasPermission('view_products') → false            │
│ - hasAnyPermission([...]) → ...                      │
│ - hasAllPermissions([...]) → ...                     │
└─────────────────────────────────────────────────────────┘
         ↓ (used throughout app)
┌─────────────────────────────────────────────────────────┐
│     Components (usePermissions() Hook)                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Any component can call:                               │
│ const { hasPermission } = usePermissions();           │
│                                                         │
│ Then check:                                            │
│ if (hasPermission('view_orders')) { ... }            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Integration Checklist Visualization

```
Phase 1: INFRASTRUCTURE ✅
  ├─ PermissionGuard.tsx              ✅ Created
  ├─ PermissionContext.tsx            ✅ Created
  ├─ usePagePermission.ts             ✅ Created
  └─ App.tsx integration              ✅ Done

Phase 2: APPLY TO PAGES (IN PROGRESS)
  ├─ /admin/orders                    ⏳ Next
  ├─ /admin/products                  ⏳ Todo
  ├─ /admin/analytics                 ⏳ Todo
  ├─ /admin/settings                  ⏳ Todo
  └─ /admin/settings/staff            ⏳ Todo

Phase 3: TESTING (TODO)
  ├─ Test owner full access           ⏳ Todo
  ├─ Test staff all permissions       ⏳ Todo
  ├─ Test staff limited permissions   ⏳ Todo
  └─ Test mobile responsive           ⏳ Todo

Phase 4: ENHANCEMENTS (OPTIONAL)
  ├─ Real-time permission updates     ⏳ Future
  ├─ Request access feature           ⏳ Future
  └─ Permission analytics             ⏳ Future
```

---

## Files Map

```
/client/
├── components/
│   ├── PermissionGuard.tsx          ← Lock overlay component
│   └── ... (other components)
│
├── context/
│   ├── PermissionContext.tsx        ← Permission state (NEW)
│   └── ... (other contexts)
│
├── hooks/
│   ├── usePagePermission.ts         ← Permission checking (NEW)
│   └── ... (other hooks)
│
└── pages/
    ├── admin/
    │   ├── Orders.tsx               ← Needs PermissionGuard wrapping
    │   ├── Products.tsx             ← Needs PermissionGuard wrapping
    │   ├── Analytics.tsx            ← Needs PermissionGuard wrapping
    │   └── Settings.tsx             ← Needs PermissionGuard wrapping
    │
    └── seller/
        └── StaffManagement.tsx      ← Needs PermissionGuard wrapping
```

---

## Key Takeaways

```
✅ What Staff Sees:
  - Complete dashboard layout
  - All menu items visible
  - Can click any menu item
  - Locked pages show professional overlay
  - Cannot accidentally access restricted features

✅ What Owner Controls:
  - Per-staff permission toggles
  - Can disable individual features
  - Changes take effect immediately
  - Activity logged for security

✅ What You Get:
  - Better UX than route blocking
  - Professional appearance
  - Type-safe permission checking
  - Scalable permission system
  - Easy to add new permissions
```

---

## Next: Quick Implementation

1. **Copy the pattern** from integration guide
2. **Wrap 5 dashboard pages** with PermissionGuard
3. **Test with staff member** having different permissions
4. **Deploy** and celebrate! 🎉

See STAFF_PERMISSION_QUICK_START.md for step-by-step instructions.
