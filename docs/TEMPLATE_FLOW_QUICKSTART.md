# Template Product Flow - Quick Start

## Complete Product Discovery to Purchase Flow

### Step 1: Product Displayed in Storefront
User sees products in their template-specific storefront (electronics, fashion, cafe, etc.)

**Current Behavior:**
- ✅ Product cards are fully clickable
- ✅ Entire card navigates to detail page
- ✅ Buy Now button is full-width
- ✅ Color scheme matches template theme

**File:** `client/components/templates/*.tsx` (12 templates)

---

### Step 2: User Clicks Product Card
Card click navigates to ProductDetail page with template colors

**Route:** `/product/:id`

**What Happens:**
1. ProductDetail page loads
2. Fetches product data from `/api/product/:id`
3. Reads template from `localStorage.getItem('template')`
4. Applies template-specific colors and styling

**File:** `client/pages/storefront/ProductDetail.tsx`

**Features:**
- Product image gallery
- Price (in accent color)
- Wishlist button (heart icon)
- Quantity selector (+/- buttons)
- Full description
- Ratings and reviews
- Related products (coming soon)

**Example Colors by Template:**
```
electronics → Cyan background, cyan accent buttons
fashion → Black background, amber accent buttons
beauty → White background, pink accent buttons
cafe → Amber background, amber accent buttons
... (all 12 templates)
```

---

### Step 3: User Selects Quantity & Clicks "Buy Now"
ProductDetail reads selected quantity and navigates to checkout

**Route:** `/checkout/:productId?quantity=X`

**What Happens:**
1. Quantity is passed as URL parameter
2. Cart is initialized with one product
3. Template styling is preserved
4. Checkout steps displayed

**File:** `client/pages/storefront/Checkout.tsx`

**Checkout Steps:**
1. **Cart Review** - Adjust quantities, remove items
2. **Shipping** - Enter delivery address
3. **Payment** - Card details (not actually charged in demo)
4. **Review** - Final order confirmation

---

## How Colors Are Applied

### Color Flow:
```typescript
// 1. Template is stored in localStorage
localStorage.setItem('template', 'electronics');

// 2. Settings stored separately
localStorage.setItem('storeSettings', JSON.stringify({
  template_accent_color: '#38bdf8',
  store_name: 'Tech Store'
}));

// 3. ProductDetail & Checkout read these
const template = localStorage.getItem('template');
const settings = JSON.parse(localStorage.getItem('storeSettings'));
const accentColor = settings.template_accent_color;

// 4. Apply from TEMPLATE_STYLES mapping
const style = TEMPLATE_STYLES[template];
// Result: All buttons, borders, backgrounds use correct colors
```

### All 12 Color Schemes:

```typescript
TEMPLATE_STYLES = {
  electronics:  { accent: '#38bdf8', bg: 'bg-black' },    // Cyan
  fashion:      { accent: '#f97316', bg: 'bg-black' },    // Amber
  fashion2:     { accent: '#000000', bg: 'bg-white' },    // Black
  fashion3:     { accent: '#facc15', bg: 'bg-gray-900' }, // Yellow
  beauty:       { accent: '#ec4899', bg: 'bg-white' },    // Pink
  beaty:        { accent: '#ec4899', bg: 'bg-white' },    // Pink
  cafe:         { accent: '#d97706', bg: 'bg-amber-50' }, // Amber
  jewelry:      { accent: '#d4af37', bg: 'bg-white' },    // Gold
  bags:         { accent: '#111827', bg: 'bg-white' },    // Gray
  baby:         { accent: '#fbbf24', bg: 'bg-amber-50' }, // Amber
  furniture:    { accent: '#111827', bg: 'bg-gray-50' },  // Gray
  food:         { accent: '#a3c76d', bg: 'bg-white' },    // Green
  perfume:      { accent: '#f59e0b', bg: 'bg-black' },    // Amber
}
```

---

## Flow Diagram

```
┌─────────────────────────────────────┐
│ Storefront (Any Template)            │
│ - Product grid with template colors  │
│ - Clickable cards                    │
│ - Full-width Buy Now buttons         │
└────────────┬──────────────────────────┘
             │ Click product card
             ↓
┌─────────────────────────────────────┐
│ /product/:id (ProductDetail)         │
│ - Reads template from localStorage   │
│ - Applies TEMPLATE_STYLES[template]  │
│ - Shows image, price (accent color)  │
│ - Wishlist, quantity selector        │
│ - "Buy Now" button (accent color)    │
└────────────┬──────────────────────────┘
             │ Click "Buy Now"
             ↓
┌─────────────────────────────────────┐
│ /checkout/:id (Checkout)             │
│ - Reads same template                │
│ - Maintains color consistency        │
│ - Step 1: Cart Review               │
│ - Step 2: Shipping Address          │
│ - Step 3: Payment Info              │
│ - Step 4: Order Review              │
└────────────┬──────────────────────────┘
             │ Click "Place Order"
             ↓
┌─────────────────────────────────────┐
│ Order Confirmation                   │
│ (In template colors)                 │
└─────────────────────────────────────┘
```

---

## Key Integration Points

### 1. Storefront to ProductDetail
**File:** `client/pages/Storefront.tsx`

Templates (in `client/components/templates/`) already have:
- ✅ Clickable product cards with `onClick={() => navigate(...)}`
- ✅ Full-width Buy Now buttons
- ✅ Event stopPropagation on buttons

When clicked → navigates to `/product/{id}`

### 2. ProductDetail to Checkout
**File:** `client/pages/storefront/ProductDetail.tsx`

```typescript
<button
  onClick={() => navigate(`/checkout/${id}?quantity=${quantity}`)}
  className={`w-full py-4 ${style.button}`}
>
  Buy Now
</button>
```

Passes quantity as URL parameter for initialization

### 3. Checkout Cart Initialization
**File:** `client/pages/storefront/Checkout.tsx`

```typescript
const quantity = parseInt(searchParams.get('quantity') || '1');
setCart([{
  id: product.id,
  title: product.title,
  price: product.price,
  quantity,
  image: product.images?.[0],
}]);
```

Initializes cart with single product at specified quantity

### 4. Theme Persistence
Both ProductDetail and Checkout read from localStorage:

```typescript
const template = localStorage.getItem('template') || 'fashion';
const settings = JSON.parse(localStorage.getItem('storeSettings') || '{}');
const style = TEMPLATE_STYLES[template];
const accentColor = settings.template_accent_color || style.accent;
```

This ensures consistent theming throughout the entire flow.

---

## API Integration Points

### Product Fetch (ProductDetail)
```typescript
const { data: product } = useQuery({
  queryKey: ['product', id],
  queryFn: async () => {
    const response = await fetch(`/api/product/${id}`);
    return response.json();
  },
});
```

### Order Submission (Checkout)
```typescript
// Ready for integration with:
// POST /api/orders
// POST /api/payment/process
// POST /api/orders/confirm
```

---

## Testing the Complete Flow

### Test Scenario: Electronics Store

1. **Setup:**
   ```javascript
   localStorage.setItem('template', 'electronics');
   localStorage.setItem('storeSettings', JSON.stringify({
     template_accent_color: '#38bdf8',
     store_name: 'Tech Store'
   }));
   ```

2. **Navigate to Storefront:** `/store/techstore`
   - See products with cyan accents
   - Black background theme
   - Cyan "Buy Now" buttons

3. **Click any product card**
   - Navigate to `/product/123`
   - ProductDetail shows with cyan elements
   - Price in cyan
   - Buy Now button cyan

4. **Select quantity (e.g., 2) and click "Buy Now"**
   - Navigate to `/checkout/123?quantity=2`
   - Checkout steps maintain cyan theme
   - Sidebar shows order summary
   - All buttons are cyan

5. **Complete checkout steps**
   - Cart shows 2 items in cyan
   - Forms styled with cyan borders
   - "Place Order" button cyan
   - Success message in cyan theme

### Expected Results:
- ✅ Consistent cyan color throughout
- ✅ Black background on all pages
- ✅ Proper quantity calculation
- ✅ Order total correctly calculated
- ✅ All navigation works smoothly
- ✅ Mobile responsive on all steps

---

## Troubleshooting

### Issue: Colors not applying
**Solution:** Check localStorage values are set correctly:
```javascript
console.log(localStorage.getItem('template'));
console.log(localStorage.getItem('storeSettings'));
```

### Issue: Product not loading
**Solution:** Verify API endpoint `/api/product/:id` returns:
```json
{
  "id": 123,
  "title": "Product Name",
  "price": 1500,
  "images": ["url1", "url2"],
  "description": "...",
  "category": "..."
}
```

### Issue: Quantity not carrying over
**Solution:** Check URL parameter is being read:
```typescript
const quantity = parseInt(searchParams.get('quantity') || '1');
console.log('Quantity:', quantity);
```

### Issue: Mobile layout broken
**Solution:** Check responsive classes are applied:
- ProductDetail: `grid grid-cols-1 md:grid-cols-2`
- Checkout: `lg:col-span-2` for main, sidebar moves below on mobile

---

## Files Reference

| File | Purpose |
|------|---------|
| `client/pages/storefront/ProductDetail.tsx` | Product preview page with template colors |
| `client/pages/storefront/Checkout.tsx` | Multi-step checkout with template styling |
| `client/App.tsx` | Routes configuration for /product/:id and /checkout/:id |
| `client/components/templates/*.tsx` | 12 store templates with clickable cards |
| `TEMPLATE_CHECKOUT_GUIDE.md` | Comprehensive documentation |

---

## Summary

The complete flow now works as:

1. **Storefront** shows products with template-specific design
2. **ProductDetail** loads with template accent color applied
3. **Checkout** maintains theme through all 4 steps
4. **Colors** persist from localStorage throughout entire journey
5. **Mobile** responsive on all breakpoints
6. **Data** flows correctly with quantity tracking

Everything is ready for payment integration and real order processing! 🚀
