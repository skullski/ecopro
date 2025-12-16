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

## TODO / IN PROGRESS

- [ ] **Store Templates System** (Next Phase)
  - Add `template_name` to `client_store_settings`
  - Create template selector UI in admin
  - Build 3+ templates (Minimalist, Grid, Showcase, Apple)
  - Make storefront load correct template dynamically
  - Products auto-map to new template layout

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
