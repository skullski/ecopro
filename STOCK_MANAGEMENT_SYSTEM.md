# Stock Management System

A comprehensive inventory tracking system for client users to manage their stock/products.

## Features

### 📊 Dashboard Overview
- **Total Items**: Real-time count of all stock items
- **Low Stock Alerts**: Automatic alerts when quantity ≤ reorder level
- **Total Value**: Calculated inventory value (quantity × unit price)
- **Out of Stock**: Count of items with `out_of_stock` status

### 🔍 Advanced Filtering
- **Search**: By name, SKU, or description
- **Category Filter**: Filter by product category
- **Status Filter**: Active, Discontinued, Out of Stock
- **Low Stock Toggle**: Quick view of items needing reorder

### 📦 Product Management
- **Add Products**: Create new stock items with full details
- **Edit Products**: Update any product information
- **Delete Products**: Remove items (with confirmation)
- **Bulk Export**: Export inventory to CSV

### 📈 Quantity Tracking
- **Quick Adjust**: Fast quantity adjustments with reason tracking
- **Audit History**: Complete history of all quantity changes
- **Adjustment Reasons**:
  - Sale
  - Purchase
  - Return
  - Damage/Loss
  - Stocktake
  - Manual Adjustment

### 📋 Product Details
Each stock item includes:
- Name (required)
- SKU (unique identifier)
- Description
- Category
- Quantity (with reorder level indicator)
- Unit Price
- Location (storage location)
- Supplier Name
- Supplier Contact
- Status (Active/Discontinued/Out of Stock)
- Notes

## Technical Stack

### Backend API
**File**: `server/routes/stock.ts`

**Endpoints**:
- `GET /api/client/stock` - List all stock with filters
- `GET /api/client/stock/:id` - Get single stock item
- `POST /api/client/stock` - Create new stock item
- `PUT /api/client/stock/:id` - Update stock item
- `DELETE /api/client/stock/:id` - Delete stock item
- `POST /api/client/stock/:id/adjust` - Adjust quantity with history
- `GET /api/client/stock/:id/history` - Get adjustment history
- `GET /api/client/stock/alerts/low-stock` - Get low stock alerts
- `GET /api/client/stock/categories` - Get all categories

**Authentication**: All routes require JWT authentication + `requireClient` middleware

### Database Schema
**File**: `server/migrations/20251129_create_client_stock.sql`

**Table 1: client_stock_products**
```sql
- id (SERIAL PRIMARY KEY)
- client_id (FK to users.id)
- name (VARCHAR 255)
- sku (VARCHAR 100 UNIQUE)
- description (TEXT)
- category (VARCHAR 100)
- quantity (INTEGER)
- unit_price (DECIMAL 10,2)
- reorder_level (INTEGER DEFAULT 10)
- location (VARCHAR 255)
- supplier_name (VARCHAR 255)
- supplier_contact (VARCHAR 255)
- status (VARCHAR 32 DEFAULT 'active')
- notes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**Table 2: client_stock_history**
```sql
- id (SERIAL PRIMARY KEY)
- stock_id (FK to client_stock_products.id)
- client_id (FK to users.id)
- quantity_before (INTEGER)
- quantity_after (INTEGER)
- adjustment (INTEGER)
- reason (VARCHAR 32)
- notes (TEXT)
- created_by (FK to users.id)
- created_at (TIMESTAMP)
```

**Indexes**:
- `idx_client_stock_client_id` on client_id
- `idx_client_stock_status` on status
- `idx_client_stock_category` on category
- `idx_client_stock_sku` on sku
- `idx_client_stock_quantity` on quantity
- `idx_stock_history_stock_id` on stock_id
- `idx_stock_history_client_id` on client_id

### Frontend Component
**File**: `client/pages/customer/StockManagement.tsx`

**Features**:
- React 18 with TypeScript
- Shadcn UI components (Dialog, AlertDialog, Select, Badge, etc.)
- Real-time stats calculation
- Advanced filtering and search
- Modal-based forms (Add/Edit/Adjust)
- History viewer with timeline
- CSV export functionality
- Responsive design (mobile + desktop)

### Routing
**File**: `client/App.tsx`

**Route**: `/dashboard/stock`
- Protected by `RequirePaidClient` guard
- Only accessible to authenticated client users
- Integrated in admin dashboard layout

### Navigation
**File**: `client/components/admin/EnhancedSidebar.tsx`

**Menu Item**: "Stock Management" / "إدارة المخزون" / "Gestion du Stock"
- Icon: Package icon from Lucide React
- Position: Third item in sidebar (after Home and Preview)
- Translations: English, Arabic, French

## Usage

### Accessing Stock Management
1. Login as a **client** user (not seller or admin)
2. Navigate to dashboard at `/dashboard`
3. Click "Stock Management" in the sidebar
4. Access route: `/dashboard/stock`

### Adding a Product
1. Click "Add Product" button (top right)
2. Fill in product details:
   - Name (required)
   - SKU (optional, must be unique)
   - Description, category, location
   - Initial quantity and reorder level
   - Unit price
   - Supplier information
3. Click "Add Product" to save

### Adjusting Quantity
1. Find product in table
2. Click quantity adjust icon (trending up arrow)
3. Enter adjustment amount:
   - Positive number to add stock
   - Negative number to remove stock
4. Select reason (sale, purchase, return, etc.)
5. Add notes (optional)
6. Click "Adjust Quantity"

### Viewing History
1. Find product in table
2. Click history icon
3. View complete audit trail:
   - All quantity changes
   - Before/after values
   - Adjustment amount
   - Reason and notes
   - Date/time and user

### Exporting Data
1. Apply filters as needed (category, status, search)
2. Click "Export CSV" button
3. CSV downloads with all filtered data

## Low Stock Alerts

Products automatically show low stock badge when:
```
quantity <= reorder_level
```

**Visual Indicators**:
- Orange "Low Stock" badge on product card
- Quantity highlighted in orange color
- Separate stat card showing alert count
- Filter toggle to show only low stock items

## Database Initialization

The stock tables are automatically created on server startup via `server/utils/database.ts`:

```typescript
// Tables are created in initializeDatabase() function
// Called on server start in server/index.ts
```

If you need to manually run the migration:
```bash
psql $DATABASE_URL -f server/migrations/20251129_create_client_stock.sql
```

## Security

- All routes require valid JWT authentication
- Client role check via `requireClient` middleware
- SQL injection protection via parameterized queries
- Rate limiting applied to all routes
- Client ID automatically extracted from JWT token
- Cross-client data isolation enforced at database level

## Translations

**Languages Supported**:
- English: "Stock Management"
- Arabic: "إدارة المخزون"
- French: "Gestion du Stock"

**Translation Key**: `sidebar.stock`
**File**: `client/lib/translations.ts`

## Future Enhancements (Optional)

- **Notifications**: Email/push alerts for low stock
- **Barcode Scanner**: Mobile barcode/QR scanning for quick updates
- **Bulk Import**: Import stock from CSV
- **Multi-location**: Track stock across multiple warehouses
- **Category Analytics**: Charts and graphs by category
- **Supplier Management**: Dedicated supplier profiles
- **Purchase Orders**: Create POs directly from low stock alerts
- **Automatic Status**: Auto-change status to `out_of_stock` when quantity = 0

## Development

### Local Testing
```bash
# Start dev server
pnpm dev

# Access at http://localhost:8080/dashboard/stock
# Login as client user (user_type='client' in JWT)
```

### API Testing
```bash
# Get all stock
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8080/api/client/stock

# Create stock item
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","quantity":100,"reorder_level":10}' \
  http://localhost:8080/api/client/stock

# Adjust quantity
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"adjustment":-5,"reason":"sale","notes":"Sold 5 units"}' \
  http://localhost:8080/api/client/stock/1/adjust
```

## Deployment

System is deployed on Render at: https://ecopro-1lbl.onrender.com

**Deployment Process**:
1. Push to GitHub main branch
2. Render auto-deploys from GitHub
3. Database migrations run on server start
4. Tables created automatically if they don't exist

**Environment Variables**:
- `DATABASE_URL`: PostgreSQL connection string (Render PostgreSQL)
- `JWT_SECRET`: For token generation/verification

## Files Changed

**New Files**:
- `client/pages/customer/StockManagement.tsx` (754 lines)
- `server/routes/stock.ts` (299 lines)
- `server/migrations/20251129_create_client_stock.sql` (67 lines)

**Modified Files**:
- `client/App.tsx`: Added stock route
- `client/components/admin/EnhancedSidebar.tsx`: Added menu item
- `client/lib/translations.ts`: Added translations (3 languages)
- `server/index.ts`: Registered stock routes
- `server/utils/database.ts`: Added table initialization

**Total Lines Added**: ~1,522 lines

## Git Commit

```
commit 976a190
Author: Walid Walid
Date: 2024-11-29

Add comprehensive stock management system for clients

- Complete CRUD API with 9 endpoints
- Database schema with audit history
- Full-featured React UI with stats dashboard
- Advanced filtering and search
- Quantity adjustment with reason tracking
- CSV export functionality
- Multi-language support (EN/AR/FR)
- Low stock alerts and monitoring
```

## Support

For issues or questions:
- Check console logs: Browser DevTools and server logs
- Verify JWT token includes `user_type: 'client'`
- Ensure database tables exist (check server startup logs)
- Test API endpoints directly before UI
