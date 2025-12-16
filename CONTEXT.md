# PROJECT CONTEXT & INSTRUCTIONS

**READ THIS FILE BEFORE EVERY TASK**

---

## ARCHITECTURE & STACK

**Frontend:**
- React 18 + TypeScript + Vite
- Tailwind CSS 3 for styling
- React Router 6 (SPA mode)
- Radix UI + Lucide React icons

**Backend:**
- Express.js + Node.js
- PostgreSQL database (Render)
- Authentication: JWT + bcrypt
- Database URL: `postgresql://eco_db_drrv_user:teCMT25hytwYFgWqpmg2Q0x97TJymRhs@dpg-d4cl4ubipnbc739hbcmg-a.oregon-postgres.render.com/eco_db_drrv`

**Deployment:**
- Render (auto-deploys on git push to main)
- Build command: `pnpm run build`
- Start command: `node dist/server/node-build.cjs`

---

## DATA MODEL

### Key Tables:
- `client_store_settings` - Store settings (name, description, template_name, etc.)
- `client_store_products` - Products for storefront
- `store_orders` - Customer orders from storefront
- `users` - Registered users/sellers

### Store Structure:
- Each user can have ONE storefront with a unique `store_slug`
- Products stored in `client_store_products` with `client_id`
- Orders stored in `store_orders` with `client_id`

---

## API PATTERNS

### Authentication:
- Token stored in localStorage as `authToken`
- Pass token in headers: `Authorization: Bearer {token}`

### Endpoints:
- `/api/storefront/{storeSlug}/settings` - Get store settings
- `/api/storefront/{storeSlug}/products` - Get store products
- `/api/storefront/{storeSlug}/orders` - Create order (POST)
- `/api/client/orders` - Get all orders (admin)
- `/api/dashboard/stats` - Get dashboard stats (5s refresh)
- `/api/store/{slug}/{productSlug}` - Get product by slug

---

## KEY FILES & THEIR PURPOSE

| File | Purpose |
|------|---------|
| `/client/pages/Index.tsx` | Home page (real-time stats) |
| `/client/pages/Checkout.tsx` | Storefront checkout form |
| `/client/pages/admin/Dashboard.tsx` | Admin dashboard (5s auto-refresh) |
| `/client/pages/admin/Orders.tsx` | Orders management (expandable rows) |
| `/client/pages/admin/delivery/DeliveryCompanies.tsx` | Delivery company logos |
| `/server/routes/dashboard.ts` | Dashboard stats endpoint |
| `/server/routes/storefront.ts` | Storefront checkout logic |
| `/server/routes/orders.ts` | Order management API |

---

## CURRENT FEATURES

✅ **Working:**
- User authentication & signup
- Storefront checkout (form submits orders)
- Orders dashboard with auto-refresh (5 seconds)
- Expandable order rows showing full details
- Real-time stats on dashboard (orders, revenue, products)
- Real-time stats on home page (auto-updates every 10s)
- Delivery company logos (local files in `/public/delivery-logos/`)
- Bot settings page with Apple design
- Analytics page with Apple design

✅ **Deployment:**
- Build outputs CommonJS format (`.cjs`)
- Start script uses correct filename: `node dist/server/node-build.cjs`

---

## DESIGN PATTERNS

### Apple Aesthetic (Used):
- Dark background: `dark:bg-black` or `dark:bg-gray-900`
- Soft shadows: `shadow-lg` or `shadow-xl`
- Rounded corners: `rounded-2xl` or `rounded-3xl`
- Gradients: `from-indigo-600 to-cyan-600`
- Minimal borders: `border-subtle` or `border-[#23264a]`

### Real-time Updates:
- Dashboard stats: `setInterval(loadData, 5000)`
- Home page stats: `setInterval(fetchStats, 10000)`
- Auto-refresh on component mount via `useEffect`

---

## DATABASE QUERIES (Common Patterns)

### Get store data:
```typescript
const res = await pool.query(
  `SELECT * FROM client_store_settings WHERE client_id = $1`,
  [clientId]
);
```

### Get orders for store:
```typescript
const res = await pool.query(
  `SELECT * FROM store_orders WHERE client_id = $1 ORDER BY created_at DESC`,
  [clientId]
);
```

### Join with products:
```typescript
const res = await pool.query(
  `SELECT o.*, COALESCE(p.title, cp.title) as product_title
   FROM store_orders o
   LEFT JOIN store_products p ON o.product_id = p.id
   LEFT JOIN client_store_products cp ON o.product_id = cp.id
   WHERE o.client_id = $1`,
  [clientId]
);
```

---

## COMMON FIXES

### Issue: Orders not showing in dashboard
- **Check:** Dashboard endpoint queries `store_orders` NOT `marketplace_orders`
- **Fix:** Use `LEFT JOIN` with both `store_products` and `client_store_products`

### Issue: Checkout button disabled
- **Check:** Button condition should only check `!product`, not `!productId`
- **Reason:** Storefront products come from `product?.id`, not URL params

### Issue: Deployment fails with "Cannot find module"
- **Check:** Start script matches actual output filename
- **Current:** `node dist/server/node-build.cjs` (NOT `production.cjs`)

### Issue: Real-time stats not updating
- **Check:** Auto-refresh interval is set in `useEffect`
- **Check:** Endpoint returns correct data
- **Check:** State is properly updated with `setStats()`

---

## BOT & MESSAGING SYSTEM

### Current Status:
- ✅ UI exists: `/client/pages/admin/WasselniSettings.tsx` (Apple design)
- ✅ Backend endpoints: `/api/bot/settings` (GET/POST)
- ✅ Database table: `bot_settings` (stores config)
- ✅ Provider options in UI: WhatsApp Cloud API + Twilio SMS
- ❌ **NOT IMPLEMENTED**: Actual message sending logic

### Architecture:
```
Order Created → Check if bot enabled → Get provider config → Send message
```

### Planned Integration: Ubuntu Home Server SMS Gateway
**User has a local Ubuntu server for SMS messages (not Twilio)**

**Requirements to implement:**
1. New provider option: `'local_ubuntu_sms'`
2. Backend integration to POST to Ubuntu server API
3. Fields needed in bot_settings:
   - `ubuntu_server_url` - Server IP/hostname
   - `ubuntu_api_key` - API authentication
   - `ubuntu_phone_number` - SMS sender number
4. Message templates (already exist, reuse):
   - Order confirmation
   - Payment confirmation
   - Shipping notification

**Expected Flow:**
1. User configures bot settings: selects "Ubuntu SMS" provider
2. User enters: server URL, API key, sender phone number
3. When order is placed → Bot checks if enabled
4. POST to `http://ubuntu-server:port/api/send-sms`
5. Ubuntu server processes and sends SMS via local gateway

### Message Template Variables:
- `{customerName}` - Order customer name
- `{productName}` - Product title
- `{totalPrice}` - Order total
- `{address}` - Shipping address
- `{orderId}` - Order ID
- `{trackingNumber}` - Tracking info

### Default Arabic Templates (Already defined):
- Order Confirmation: "السلام عليكم {customerName}! شكراً لطلبك..."
- Payment: "تم تأكيد طلبك #{orderId}. يرجى الدفع بـ {totalPrice} دج."
- Shipping: "تم شحن طلبك #{orderId}. رقم التتبع: {trackingNumber}."

### TO IMPLEMENT (End of project):
1. Create `/server/utils/messaging.ts` - Message sending logic
2. Add `/server/routes/messaging.ts` - Webhook for message events
3. Add message sending trigger in `/server/routes/orders.ts` when order status changes
4. Add Ubuntu SMS provider option to bot settings UI
5. Add Ubuntu server configuration fields to WasselniSettings.tsx
6. Test end-to-end: Create order → Auto-send SMS to customer

### Ubuntu Server API Contract (TO CONFIRM):
```typescript
POST http://ubuntu-server/api/send-sms
Headers: { 'Authorization': 'Bearer {apiKey}' }
Body: {
  to: '+213XXXXXXXXX',
  message: 'Order message here...'
}
Response: {
  success: boolean,
  messageId: string
}
```

---

## TODO / IN PROGRESS

- [ ] **Store Templates System** (Next Phase)
  - Add `template_name` to `client_store_settings`
  - Create template selector UI in admin
  - Build 3+ templates (Minimalist, Grid, Showcase, Apple)
  - Make storefront load correct template dynamically
  - Products auto-map to new template layout

- [ ] **SMS/Bot Messaging** (End of project, waiting for Ubuntu server details)
  - Implement local Ubuntu SMS gateway provider
  - Add message sending logic when orders change status
  - Add Ubuntu server configuration to bot settings UI
  - Test end-to-end message flow
  - Handle errors and retries

- [ ] Improve chunk size warnings (consider code splitting)
- [ ] Add real visitor tracking (currently placeholder: 0)
- [ ] Consider WebSocket for faster order updates (currently 5s polling)

---

## IMPORTANT NOTES

1. **Always commit after changes:** `git add -A && git commit -m "..."` && git push`
2. **Test locally first:** `pnpm dev` (localhost:5173)
3. **Check console errors:** Browser DevTools (F12) shows API errors
4. **Database connection:** Verify with test query before assuming it's broken
5. **Timestamps:** All dates in database are in UTC
6. **Orders status:** Default is `pending`, can be `completed` or `cancelled`

---

## USEFUL COMMANDS

```bash
# Development
pnpm dev              # Start local dev (both client + server)
pnpm build           # Production build
pnpm start           # Run production build locally
pnpm test            # Run tests

# Database
psql $DATABASE_URL   # Connect to Render database

# Git
git status           # Check changes
git diff             # See what changed
git log --oneline    # Recent commits
```

---

## FOR AGENTS: HOW TO USE THIS FILE

**Before starting ANY task:**
1. Read through this entire file (takes 2 min)
2. Note relevant sections for your specific task
3. Reference specific line numbers if you need clarification
4. When editing files, verify your changes match patterns documented here
5. After completing task, update this file if something changed

**This file is TRUTH. If code differs from CONTEXT.md, CONTEXT.md is correct.**
