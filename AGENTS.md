# EcoPro Platform - Agent Questions Checklist

**Read PLATFORM_OVERVIEW.md first before coding.**

When you start coding or a new chat session begins, ask yourself these questions:

## Understanding the Problem

1. **What feature are we building/fixing?** Be specific.
2. **Who does it affect?** (store owner, customer, both?)
3. **What's the current behavior vs desired behavior?**
4. **Is this on the frontend, backend, or database?**
5. **Does this affect orders, products, or stores?**

## Database Questions

1. **Which table(s) are involved?** (store_orders, client_store_products, client_store_settings, etc)
2. **Do we need to add/modify columns?**
3. **What client_id should records have?**
4. **Are we filtering by the right WHERE clause?**
5. **Do we need new indexes for performance?**

## Authentication & Authorization

1. **Who needs to be authenticated?** (store owner, customer, admin, public?)
2. **Is this a public endpoint or protected?**
3. **How do we verify the user's permission?** (their client_id, role, etc)
4. **Should the response expose sensitive data?**

## API Endpoints

1. **Does this need a new endpoint or modify existing?**
2. **Is it GET, POST, PATCH, DELETE?**
3. **What parameters does it need?**
4. **What does it return?**
5. **Should it be in `/api/client/*`, `/api/seller/*`, or `/api/storefront/*`?**

## Frontend Questions

1. **What page/component needs this?** (Orders.tsx, ProductDetail.tsx, Checkout.tsx, etc)
2. **Do we need new state? (useState, useQuery, useEffect)**
3. **Are we calling the right API endpoint?**
4. **Do we handle loading, error, and empty states?**
5. **Should we store anything in localStorage?** (try not to - use database instead)

## Data Flow Questions

1. **How does data flow from user action → API → database → back to UI?**
2. **Where do we validate data?** (frontend for UX, backend for security)
3. **What happens if the API fails?** (show error to user, retry, etc)
4. **Is this a public action (anyone can do it) or authenticated (owner only)?**

## Before Deploying

1. **Does TypeScript compile?** (`pnpm typecheck`)
2. **Do tests pass?** (`pnpm test`)
3. **Is the database change safe?** (backup before migrations)
4. **Does the feature work end-to-end?** (test full flow locally)
5. **Did we break anything else?** (test related features)

---

# Platform Specifics - Answer These Once

These answers define how the platform works. Read them before building anything.

## Store & Ownership

1. **Store Owners vs Customers**
   - **Storefront** = a unique store page with products (like mystore.ecopro.com/store/store-slug)
   - **Store owner** signs up → automatically gets ONE storefront with a unique store_slug
   - **Customers** find stores via links shared by store owners on social media (Instagram, WhatsApp, etc)
   - Customers are completely anonymous - no accounts, no tracking
   - Store owners are regular users (user_type = "client" or "seller")
   - **Admin** is separate - admin@ecopro.com - sees platform statistics only, has NO store

2. **Multi-Store per Owner**
   - One store owner = ONE storefront (one store_slug)
   - Not multi-store for now

3. **Product Management**
   - Only store owners can upload products to their store
   - Customers can only browse and order

## Ordering & Payments

4. **Payment Handling - Customer Orders**
   - NO online customer payments yet (phase 2)
   - Customers pay CASH ON DELIVERY (COD) - pay when they receive the product
   - Order flow: pending → confirmed → shipped → delivered
   - Store owner manually marks orders as they fulfill them

5. **Store Owner Billing (Phase 2)**
   - Store owners will pay monthly subscription to use the platform
   - If subscription expires/unpaid → account locks until they pay
   - Current phase: No billing, all store owners are free

6. **Inventory** ✅ IMPLEMENTED
   - Track stock per product (`stock_quantity` in client_store_products table)
   - Store owner sets quantity when uploading product
   - Each order decreases stock automatically
   - When stock hits 0 → product is "out of stock"
   - Customers can't order out-of-stock products (error on checkout)
   - ProductDetail page shows: "✓ In Stock (N available)" or "✗ Out of Stock"
   - Out-of-stock products show disabled "Buy Now" button

6. **Customer Accounts**
   - Customers are fully anonymous - no accounts, no tracking
   - Guest checkout only - order info collected: name, email, phone, address
   - WhatsApp notification gives order updates (no account needed)
   - Future: Can add customer tracking links via WhatsApp if needed

## Order & Store Management

7. **Order Fulfillment**
   - Orders marked as "pending" by default (waiting for customer confirmation via bot)
   - Bot sends WhatsApp/SMS with confirmation link → customer approves/declines
   - Order status AUTOMATICALLY becomes confirmed/declined based on customer action
   - Store owner then manually changes status from confirmed → shipped → delivered

8. **Stores Visibility - Multi-Vendor Platform**
   - Each store owner is completely isolated - only sees their own store's data
   - Store owner sees ONLY their own orders, products, customers
   - Store owner cannot see other stores' data
   - Admin sees ALL orders, ALL stores, ALL store owners (platform overview)
   - Customers never see other customers' orders
   - Orders page has tabs to filter by: All, Pending (awaiting confirmation), Confirmed, Archived

9. **Public vs Private**
   - All storefronts are PUBLIC by default
   - Anyone with the store link can order
   - Private stores = future feature

## Communication & Status

10. **Notifications - Automated Bot System** ✅ IMPLEMENTED
    - Platform has a BOT that sends WhatsApp + SMS messages to customers
    - Store owner configures delays in bot settings (e.g., WhatsApp after 1 hour, SMS after 4 hours)
    - Store owner provides WhatsApp credentials (Twilio WhatsApp API)
    - Store owner can CUSTOMIZE message templates (with variables: {customerName}, {storeName}, {productName}, {price}, etc)
    - Bot is optional - store owner enables/disables it
    - Messages contain confirmation links: `https://storename-ecopro.com/store/store-slug/order/ABC123/confirm`
    - Message includes: customer name, store name, product name, price, and confirmation link
    - Confirmation page shows: all product info + buttons (Approve, Decline, Change Details)
    - Customer can EDIT ANY order details from "Change Details" before approving
    - Confirmation link expires after 48 hours
    - After customer responds to both messages (WhatsApp + SMS) → order status auto-updates to confirmed/declined
    - If customer declines → order moves to "archived/cancelled" after 24 hours in Orders page
    - If customer doesn't respond within 24 hours → order moves to "pending orders" place (awaiting response)
    - Store owner sees orders in dashboard in real-time (Orders page)
    - SMS integration: Structure ready, server under development
    
    **Implementation Files:**
    - `server/utils/bot-messaging.ts` - Twilio integration, message scheduling, template variables
    - `server/routes/order-confirmation.ts` - Confirmation page endpoints
    - `client/pages/storefront/OrderConfirmation.tsx` - Confirmation UI (Approve/Decline/Change)
    - `server/migrations/20251219_bot_message_tracking.sql` - Database tables for messages and confirmations
    - Background jobs:
      - Bot message sender runs every 5 minutes
      - Order cleanup runs every 1 hour (archives declined orders, cleans up expired links)

11. **Product Templates**
    - Templates (jewelry, electronics, etc) are just UI/styling
    - No different workflows - all products work the same way
    - Add new template = new component file

12. **Order Statuses**
    - pending (default when order created, waiting for customer confirmation via bot)
    - confirmed (customer approved via bot confirmation link)
    - declined (customer declined via bot confirmation link)
    - shipped (store owner marks it)
    - delivered (store owner marks it)
    - cancelled (customer or store owner can do this)

13. **Customer Info Collected**
    - name (required)
    - email (optional)
    - phone (required for WhatsApp/SMS)
    - shipping_address (optional)

## Business Model

14. **Pricing & Commission**
    - This is a SAAS platform for store owners to use
    - Store owners manage their own pricing
    - No commission/fees charged by EcoPro (yet)

## Discovery

15. **Search & Discovery**
    - NO marketplace view
    - Customers access stores directly via unique store link (e.g., /store/store-8hbhov9w)
    - Store owner shares their link however they want (social media, email, etc)

### Add new colors to the theme

Open `client/global.css` and `tailwind.config.ts` and add new tailwind colors.

### New API Route
1. **Optional**: Create a shared interface in `shared/api.ts`:
```typescript
export interface MyRouteResponse {
  message: string;
  // Add other response properties here
}
```

2. Create a new route handler in `server/routes/my-route.ts`:
```typescript
import { RequestHandler } from "express";
import { MyRouteResponse } from "@shared/api"; // Optional: for type safety

export const handleMyRoute: RequestHandler = (req, res) => {
  const response: MyRouteResponse = {
    message: 'Hello from my endpoint!'
  };
  res.json(response);
};
```

3. Register the route in `server/index.ts`:
```typescript
import { handleMyRoute } from "./routes/my-route";

// Add to the createServer function:
app.get("/api/my-endpoint", handleMyRoute);
```

4. Use in React components with type safety:
```typescript
import { MyRouteResponse } from '@shared/api'; // Optional: for type safety

const response = await fetch('/api/my-endpoint');
const data: MyRouteResponse = await response.json();
```

### New Page Route
1. Create component in `client/pages/MyPage.tsx`
2. Add route in `client/App.tsx`:
```typescript
<Route path="/my-page" element={<MyPage />} />
```

## Production Deployment

- **Standard**: `pnpm build`
- **Binary**: Self-contained executables (Linux, macOS, Windows)
- **Cloud Deployment**: Use either Netlify or Vercel via their MCP integrations for easy deployment. Both providers work well with this starter template.

## Architecture Notes

- Single-port development with Vite + Express integration
- TypeScript throughout (client, server, shared)
- Full hot reload for rapid development
- Production-ready with multiple deployment options
- Comprehensive UI component library included
- Type-safe API communication via shared interfaces

---

# 🎯 **PLATFORM REQUIREMENTS - USER ANSWERS**

## Store Customization & Configuration

**Q1: Store Description & Contact Info**
- Store owners can **fully customize their stores**
- This includes: description/bio, contact information, policies, owner info, etc.
- ✅ TODO: Add store customization fields to `client_store_settings` table

**Q2: Product Variants (Size/Color)**
- ✅ **YES - Products NEED size/color variants**
- Each variant has: different size/color, different price, different stock level
- Customer selects variant at checkout
- ✅ TODO: Create `product_variants` table with: id, product_id, variant_name (e.g., "Red-L"), price, stock_quantity, images

**Q3: Product Discounts & Promotions**
- ✅ **KEEP IT SIMPLE - No discounts for now**
- Store owners set price, that's what customers pay
- No bulk discounts, seasonal sales, or promo codes (future feature)

**Q4: Order Notes & Descriptions**
- ✅ **YES - Both internal notes AND customer descriptions**
- **Internal Notes** (owner only): Private notes visible only to store owner (e.g., "VIP customer", "Expedite shipping")
- **Customer Description** (visible to customer): Store owner adds text that customer sees in order status (e.g., "Shipping on Dec 20", "Using Express delivery")
- ✅ TODO: Add `internal_notes` and `customer_description` fields to `store_orders` table
- ✅ TODO: Show notes in dashboard (orders page), show description in bot messages and order confirmation page

**Q5: Bulk Order Actions**
- ✅ **YES - Bulk actions needed**
- Store owners can select multiple orders and:
  - Bulk status update (mark 10 orders as shipped at once)
  - Bulk delete orders
  - Bulk export to CSV
- ✅ TODO: Add checkboxes to orders table, bulk action toolbar, batch API endpoint

**Q6: Order Timeline/History**
- ✅ **YES - Show detailed timeline in order info**
- Display timestamps for each status change (created, approved, shipped, delivered)
- Store owner and customer both see timeline
- ✅ TODO: Add `status_history` tracking or update `updated_at` timestamps for each status change
- ✅ TODO: Display timeline in order details page

**Q7: Customer Repeat Purchases & Fraud Prevention**
- ✅ **YES - Track repeat customers for fraud/abuse detection**
- Purpose: Identify and block bad actors (fake orders, spam, fraud)
- Store owner can see:
  - How many orders this customer (phone/email) has placed
  - Pattern recognition: 1000 orders from same phone = suspicious
  - Block/blacklist customers by phone number or email
- ✅ TODO: Add customer_phone and customer_email to orders index
- ✅ TODO: Create blocklist table (blocked_customers: id, client_id, phone, email, reason, blocked_at)
- ✅ TODO: Add "Block Customer" button in order details
- ✅ TODO: Prevent orders from blocked customers at checkout

**Q8: Customer Communication & Broadcasting**
- ✅ **YES - Send messages/updates/promotions to customers anytime**
- Store owner can send targeted messages by order status:
  - **Approved customers** (confirmed orders)
  - **Cancelled customers** (declined/cancelled orders)
  - **Non-responders** (pending - didn't respond to bot yet)
  - **All customers**
- Messages sent via WhatsApp/SMS (using existing bot infrastructure)
- ✅ TODO: Create messaging campaign page
- ✅ TODO: Add message templates and scheduling
- ✅ TODO: Track message delivery/read status
- ✅ TODO: Segment customers by order status for targeting

**Q9: Analytics & Metrics Dashboard**
- ✅ **ADVANCED+ Analytics needed**
- Show all metrics:
  - **Basic**: Total orders, total revenue, current month revenue
  - **Detailed**: Conversion rate, top products, average order value, 7-day trends
  - **Advanced**: Customer acquisition cost, repeat customer rate, product performance
  - **Plus**: Revenue trends, order status breakdown, customer segments, product variants performance
- ✅ TODO: Expand analytics page with all metrics
- ✅ TODO: Add time range filters (today, week, month, year, custom)
- ✅ TODO: Create product-level analytics
- ✅ TODO: Show repeat customer metrics

**Q10: Export & Reports**
- ✅ **ALL above - CSV, PDF, and Scheduled Reports**
- Store owners can export:
  - CSV/Excel format (orders, customers, revenue)
  - PDF professional reports
  - Scheduled reports (auto-email weekly/monthly digest)
- ✅ TODO: Add export buttons to analytics and orders pages
- ✅ TODO: Create scheduled report settings
- ✅ TODO: Email digest with key metrics

**Q11: Shipping & Delivery Integration**
- ✅ **NEED to integrate with API + store owner credentials**
- Each store owner can integrate their own shipping provider credentials
- Platform provides integration script/setup form for each provider
- Store owner fills in API keys/credentials → auto-integrates with their account
- Supports: DHL, FedEx, local couriers (configurable per provider)
- Shipping cost calculated automatically from provider APIs
- ✅ TODO: Create delivery integration settings page
- ✅ TODO: Build credential encryption/storage system
- ✅ TODO: Create integration scripts for each provider

**Q12: Product Search & Filtering**
- ✅ **ALL above - full search with all filters**
- **Customer Search**: product name, category, price range, size/color variants, in-stock only option
- **Store Owner Search**: advanced inventory search with all above + stock levels, sales count, date added
- Results show: in-stock by default, toggle to include out-of-stock
- Full-text search enabled (not just exact matching)
- ✅ TODO: Add full-text search index to products table
- ✅ TODO: Create filter UI for customers (price range slider, checkbox filters)
- ✅ TODO: Create advanced filter UI for store owners (stock levels, date range, sales)
- ✅ TODO: Implement search API endpoint with filtering

**Q13: Social Media & Discovery Integration**
- ✅ **ALL above - full social integration**
- Store owners can:
  - Share products directly to Instagram/WhatsApp with pre-filled captions (with product link, image, price)
  - Sync store with Instagram Shop (auto-list products on Instagram)
  - Create shareable product links with custom text
- Customers can:
  - Share orders/products they bought with friends (WhatsApp, Telegram, social media)
  - Share with social preview (product image, price, store name)
- Platform tracks:
  - Which social platform customer came from (attribution)
  - Share count per product (viral metrics)
  - Click-through rate from social links
- ✅ TODO: Add social share buttons to product detail page
- ✅ TODO: Create Instagram Shop sync integration
- ✅ TODO: Build share tracking system (utm parameters, referral links)
- ✅ TODO: Add product sharing modal with pre-filled captions
- ✅ TODO: Track social attribution in orders table

**Q14: Regional & Multi-Currency Support**
- ✅ **ALGERIA ONLY - with Algerian delivery companies + heatmap analytics**
- Single region: Algeria only
- Currency: DZD (Algerian Dinar) only
- Shipping: Integration with Algerian delivery companies only
- Analytics Requirement: **HEATMAP in statistics dashboard**
  - Algerian map showing where orders come from by state/wilaya
  - Pin markers on each wilaya (state) in Algeria
  - Display percentage of total orders from each wilaya
  - Example: "Algiers: 35% | Constantine: 18% | Oran: 12%" etc
  - Color intensity based on order volume (heatmap visualization)
  - Hover to see order count + percentage
- ✅ TODO: Add Algerian wilaya/state data to database
- ✅ TODO: Create heatmap component using map library (Leaflet or Mapbox with Algeria GeoJSON)
- ✅ TODO: Collect wilaya info from customers (shipping address)
- ✅ TODO: Build heatmap analytics API endpoint
- ✅ TODO: Add heatmap to analytics dashboard

**Q15: Content Moderation & Store Verification**
- ✅ **NO verification required - YES content moderation + reviews + flagging**
- New store owners: Go live IMMEDIATELY (no approval process)
- Content moderation:
  - Flag inappropriate products/descriptions/images (auto-moderation + manual review)
  - Remove stores/products that violate terms
  - Store owner can appeal if flagged
- Rating/Review System:
  - Customers can rate stores (1-5 stars)
  - Customers can leave reviews with text/images
  - Average store rating displayed on storefront
  - Store owners can respond to reviews
- Flagging System:
  - Customers can report inappropriate content
  - Admin reviews flagged items and takes action (warn/remove store)
  - Track repeat offenders
- ✅ TODO: Create reviews/ratings table (reviews: id, store_id, customer_name, rating, text, images, created_at)
- ✅ TODO: Create flagging/moderation table (flags: id, store_id/product_id, reason, status, admin_notes)
- ✅ TODO: Build review UI on storefront and store dashboard
- ✅ TODO: Create moderation admin panel
- ✅ TODO: Add review notifications to store owners

**Q16: Store Owner Identity Verification**
- ✅ **PHONE VERIFICATION ONLY**
- Phone verification required (SMS OTP)
- No ID/business license verification needed
- No tax ID verification needed
- No bank details required for phase 1 (will be added in phase 2 billing)
- Email verification: Optional (for notifications)
- ✅ TODO: Implement phone verification (SMS OTP) during signup
- ✅ TODO: Store verified_phone flag in users table
- ✅ TODO: Add phone verification status to store owner profile

**Q17: Mobile App or Web-Only?**
- ✅ **WEB-ONLY with mobile-optimized progressive web app (PWA)**
- No native mobile app needed
- Mobile browser experience: Optimized to feel like a native app
- PWA features: Home screen shortcut, offline support, app-like fullscreen mode
- Responsive design scales to all device sizes (phones, tablets, desktops)
- ✅ TODO: Add PWA manifest and service worker
- ✅ TODO: Optimize mobile responsiveness (already in progress for 1366×768)
- ✅ TODO: Test on various mobile devices and screen sizes
- ✅ TODO: Add "Add to Home Screen" prompts on mobile

**Q18: Payment Processing - Future Phase**
- ⏸️ **DEFER TO PHASE 2 - Address later**
- Not needed for phase 1 (all store owners currently free)
- Phase 2 will implement subscription billing for store owners
- Details to define later: pricing model, payment methods, failure handling, grace periods

**Q19: Customer Payments - Future Phase**
- ✅ **CASH ON DELIVERY ONLY - NO online payments**
- Customers pay when they receive the product (COD model)
- No credit card, e-wallet, or online payment integration needed
- No installment/buy-now-pay-later options
- Order flow: pending → confirmed → shipped → delivered → paid (on delivery)

**Q20: Store Templates - Settings Architecture** ✅ COMPREHENSIVE EXPANSION COMPLETED
- ✅ **EACH TEMPLATE HAS DIFFERENT SETTINGS**
- Templates are not just UI styling - they have template-specific configuration fields
- 12 Templates with unique settings:
  - **Fashion**: Hero heading/subtitle, banner, accent color, gender filters
  - **Fashion 2**: Campaign-style hero with heading/subtitle/button text
  - **Fashion 3 (Dark)**: Video hero, hotspot image overlays (JSON config), lookbook images, seasonal drops
  - **Electronics**: Featured product IDs, best sellers IDs, deals IDs, hero badge
  - **Food/Cafe**: Banner, products per row layout setting
  - **Furniture**: Mega menu categories (JSON), price range min/max
  - **Jewelry**: Materials filter list, featured product IDs
  - **Perfume**: Scent realms for filtering (Noir, Gold, Dream, etc)
  - **Baby**: Grid columns layout setting, banner
  - **Bags**: Hero banner, background image + blur effect, materials, bag types
  - **Beauty**: Banner, shade colors (JSON), products per row layout
  - **Cafe/Bakery**: Banner, since year, city/location

- **UNIVERSAL SETTINGS (Applied to ALL Templates)**:
  - **Branding**: Logo, primary/secondary/accent colors, text colors
  - **Typography**: Font family, heading size, body font size
  - **Layout & Spacing**: Grid columns, section padding, border radius, sidebar toggle
  - **Theme & Appearance**: Dark mode, default theme, shadows, animations
  - **SEO & Meta**: Page title, meta description, keywords
  - **Featured Products**: Featured section toggle, title, product IDs
  - **Testimonials**: Customer reviews showcase
  - **Newsletter**: Email subscription signup
  - **Trust Badges**: Security and trust indicators
  - **FAQ Section**: Frequently asked questions
  - **Footer**: About text, custom links, social media, contact info
  - **Header & Navigation**: Sticky header, search bar, cart icon, custom menu items

- All templates stored in same DB with `template_*` prefixed fields in client_store_settings
- Settings saved per store, different stores can use same template with different configs
- ✅ Database migration created: `/server/migrations/20251219_expand_template_settings.sql`
- ✅ Comprehensive guide created: `/PROFESSIONAL_TEMPLATE_SETTINGS_GUIDE.md`
- ✅ TemplateSettings.tsx updated with 12 universal sections + template-specific fields
- ✅ TODO: When adding new templates, define template-specific settings in templateConfigs object
- ✅ TODO: When modifying templates, update both template component AND templateConfigs settings structure

---

# 🔍 **ADDITIONAL CLARIFICATION QUESTIONS**

**Q21: Product Images & Media** ✅ ANSWERED
- **HOW MANY IMAGES per product:** Maximum 20 images per product
- **REQUIRED or OPTIONAL:** Images are REQUIRED - cannot create product without at least 1 image
- **IMAGE FORMATS & SIZE LIMITS:** JPG and PNG only, auto-resize to optimized dimensions
- **PRODUCT VIDEOS:** YES - Support both MP4 uploads and YouTube embed links inside store templates
- **GALLERY UI:** Professional gallery with thumbnail strip + main carousel view
- **Implementation Notes:**
  - First image = primary product image (shown on listing cards)
  - Additional images = carousel on product detail page
  - Thumbnail strip below main image for quick navigation
  - Support drag-to-reorder images
  - Auto-optimize/compress images on upload
  - Videos embeddable within templates (not part of product gallery)

**Q22: Store Branding & Customization** ✅ ANSWERED
- **STORE LOGO:** YES - Display logo professionally in header and footer across all pages, use as favicon
- **CUSTOM COLORS:** YES - Store owners can pick their own brand colors to override template theme
- **CUSTOM DOMAIN:** YES - Support custom domains with pattern: mystore-ecopro.com (not just slug-based)
- **CUSTOM FOOTER:** YES - Store owners can add custom text, links, and social media icons to footer
- **CUSTOM NAVIGATION:** YES - Store owners can add custom menu items beyond default (Products, About, Contact)
- **Implementation Notes:**
  - Logo upload required in store settings
  - Color picker for primary, secondary, accent colors
  - Domain management in store settings (DNS configuration guide for store owners)
  - Footer builder UI with drag-to-reorder sections
  - Custom menu builder for header navigation

**Q23: Product Categories & Organization** ✅ ANSWERED
- **CATEGORIES REQUIRED:** Optional - store owners don't have to assign categories to products
- **SUBCATEGORIES:** YES - Support nested categories (e.g., Men's → Shirts → T-Shirts)
- **CATEGORY FILTERING:** YES - Customers see category menu/filter on storefront to browse by category
- **WHO CREATES CATEGORIES:** Platform provides default categories per template + store owners can create custom categories
- **SMART ORGANIZATION:** Manual only - store owners manually assign products to categories
- **Implementation Notes:**
  - Default categories come from template (e.g., Fashion template has: Men, Women, Accessories, etc)
  - Store owners can add custom categories anytime
  - Support 2-3 levels of nesting (category → subcategory → sub-subcategory)
  - Category filter sidebar on storefront
  - Products can be in multiple categories

**Q24: Checkout & Cart Experience** ✅ ANSWERED
- **CART PERSISTENCE:** Professional store experience - persist in localStorage with session-based server backup
- **GUEST CHECKOUT ONLY:** Customers always anonymous - no account creation feature
- **MULTIPLE PRODUCTS:** YES - Customers can buy multiple different products in one order
- **ADDRESS VALIDATION:** YES - Validate delivery address format + check if location/wilaya exists in Algeria
- **DELIVERY COST:** Variable by location/wilaya - store owner customizes costs per wilaya (e.g., Algiers: 500DA, others: 600-800DA)
- **ORDER MINIMUM:** NO - No minimum order value required
- **ANTI-FRAUD PROTECTION:** CRITICAL - Prevent automated fake order scripts
  - Rate limiting: Max X orders per phone/email per day
  - Duplicate detection: Flag multiple identical orders from same customer within short timeframe
  - Captcha on checkout: Human verification for suspicious patterns
  - Store owner blocklist: Block customer phone/email after suspicious activity
  - IP-based detection: Track and flag suspicious IPs
  - Order review threshold: Flag orders > certain quantity value for manual review
- **Implementation Notes:**
  - Cart data synced to database after user creates order
  - Delivery cost calculation by wilaya lookup table
  - Validation API for Algerian addresses/locations
  - Anti-bot middleware on checkout endpoint

**Q25: Store Owner Roles & Permissions** ✅ ANSWERED
- **MULTI-STAFF ACCESS:** YES - Store owner can invite employees/staff with limited access
- **PERMISSION LEVELS:** Full access for all staff members (can manage orders, products, settings, everything)
- **ACTIVITY LOGS:** YES - Track who changed what and when for audit purposes
- **ADMIN VISIBILITY:** Activity logs visible in admin platform page (needs significant redesign)
- **Implementation Notes:**
  - Staff invitation via email with role assignment
  - All staff have same permission level (full access to store)
  - Activity log tracks: user, action, resource, timestamp, before/after values
  - Admin dashboard shows logs for all stores and staff activities
  - Filter/search logs by date, user, action type, store

**Q26: Returns & Refunds** ✅ ANSWERED
- **RETURN PROCESS:** NO - Customers cannot request returns (no return system needed)
- **AUTO-REFUND:** NO - No refund system in place
- **PARTIAL REFUNDS:** NO - No partial refunds
- **RETURN SHIPPING:** Not applicable - no return process
- **Implementation Notes:**
  - Keep this simple for now - all sales are final
  - Customers pay on delivery, so disputes are minimal
  - Can implement in phase 2 if needed

**Q27: Data Privacy & GDPR** ✅ ANSWERED
- **DATA RETENTION:** Keep active orders for 48 hours, then move to archive. Archived orders stay until store owner manually deletes them. Customers cannot request automatic deletion.
- **CUSTOMER DATA EXPORT:** YES - Customers can request export of their orders/data (available via link in confirmation emails)
- **PRIVACY POLICY:** Platform-wide privacy policy displayed on all storefronts (not per-store customizable)
- **Implementation Notes:**
  - Archive system: Orders moved after 48 hours to keep dashboard clean
  - Export format: JSON or CSV with order details
  - Privacy policy link in footer of all stores
  - Comply with basic data protection (store data securely, encrypt sensitive fields)

**Q28: Store Suspension & Account Management** ✅ ANSWERED
- **ACCOUNT DEACTIVATION:** YES - Store owner can temporarily pause/disable their store
- **AUTO-DELETION:** NO - No automatic deletion, but admin can see all accounts in admin page and manually delete stores
- **ADMIN ENFORCEMENT:** YES - Admin can suspend or ban stores for policy violations
- **GRACEFUL SHUTDOWN:** Orders remain intact - nothing happens to existing orders when store is deleted
- **Implementation Notes:**
  - Store deactivation hides storefront but keeps all data
  - Admin dashboard shows all user accounts and stores
  - Admin can delete user accounts and stores manually
  - Activity audit trail maintained for deletions
  - Archived orders preserved even after store deletion

**Q29: Seasonal/Limited-Time Features** ✅ ANSWERED
- **PRODUCT EXPIRY:** NO - Products don't have expiration dates and won't auto-hide
- **FLASH SALES:** YES - Store owners can schedule products as "flash sales" for limited time periods
- **SEASONAL SWITCHING:** NO - Templates/config stay the same, only manual changes by store owner
- **Implementation Notes:**
  - Flash sale feature: Date/time picker for start and end of sale period
  - Flash sale badge displays on product listings during active sale period
  - Flash sale pricing override available during sale period
  - No automatic template switching - store owner manually updates as needed

**Q30: Platform Fees & Monetization (Future)** ✅ ANSWERED
- **COMMISSION MODEL?** Monthly subscription model - store owners pay monthly to use the platform
- **PAYMENT METHOD FOR OWNERS?** Store owners manage their own payments (considering RedotPay integration for payments)
- **DISPUTE RESOLUTION?** Platform is neutral - EcoPro only provides the marketplace infrastructure for a subscription fee, disputes are between customer and store owner
- **FRAUD DETECTION?** Defer to phase 2 - address later as platform scales
- **Implementation Notes:**
  - Phase 2 will implement subscription billing system
  - Define subscription tiers and pricing later
  - Payment processing via RedotPay or similar provider
  - Store owner responsibility for customer satisfaction
  - Platform focuses on providing stable infrastructure

