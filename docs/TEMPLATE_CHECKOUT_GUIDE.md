# Template-Aware Product & Checkout System

## Overview
The product discovery, preview, and checkout flow now automatically adapts to each store's template theme. All 12 templates have their own custom color schemes and styling applied consistently across the product detail and checkout pages.

## Architecture

### Three-Page Flow
1. **Storefront** → Product Grid (template-specific design)
2. **ProductDetail** → Product preview with wishlist & quantity selector
3. **Checkout** → Multi-step checkout with order summary

### Color Scheme Mapping

| Template | Theme | Accent Color | Background |
|----------|-------|--------------|-----------|
| **electronics** | Dark Tech | Cyan (#38bdf8) | Black |
| **fashion** | Dark Luxury | Amber (#f97316) | Black |
| **fashion2** | Clean Minimal | Black (#000000) | White |
| **fashion3** | Dark Modern | Yellow (#facc15) | Gray-900 |
| **beauty** | Modern Pink | Pink (#ec4899) | White |
| **beaty** | Beauty Shop | Pink (#ec4899) | White |
| **cafe** | Warm Coffee | Amber (#d97706) | Amber-50 |
| **jewelry** | Luxury Gold | Gold (#d4af37) | White |
| **bags** | Editorial | Gray (#111827) | White |
| **baby** | Warm Soft | Amber (#fbbf24) | Amber-50 |
| **furniture** | Modern Clean | Gray (#111827) | Gray-50 |
| **food** | Minimal JP | Green (#a3c76d) | White |
| **perfume** | Dark Premium | Amber (#f59e0b) | Black |

## Navigation Flow

```
Storefront
    ↓ (click product card or Buy Now)
ProductDetail /product/:id
    ↓ (click Buy Now)
Checkout /checkout/:productId
    ↓ (complete order)
Order Confirmation
```

## Key Features

### ProductDetail Page
- **Auto-Theme**: Applies template colors automatically
- **Gallery**: Product image with hover effects
- **Wishlist**: Heart icon to save favorites
- **Quantity Selector**: Plus/minus buttons
- **Price Display**: Highlighted in accent color
- **Ratings**: Star display with review count
- **Add to Bag**: Secondary action button
- **Share**: Social sharing button

### Checkout Page
- **Multi-Step Process**:
  1. Cart Review - Adjust quantities, remove items
  2. Shipping Address - Collect delivery details
  3. Payment Information - Card details
  4. Order Review - Final confirmation

- **Order Summary Sidebar**:
  - Subtotal calculation
  - Shipping cost
  - Tax estimation
  - Total with currency

- **Form Validation**: All required fields
- **Responsive Design**: Mobile & desktop optimized

## Implementation Details

### Theme Detection
The system reads template settings from localStorage:
```typescript
const template = localStorage.getItem('template') || 'fashion';
const settings = JSON.parse(localStorage.getItem('storeSettings') || '{}');
const accentColor = settings.template_accent_color || TEMPLATE_STYLES[template].accent;
```

### Styling Strategy
Each template has predefined CSS classes and colors:
```typescript
const TEMPLATE_STYLES = {
  electronics: {
    bg: 'bg-black',
    accent: '#38bdf8',
    text: 'text-gray-100',
    border: 'border-gray-700',
    button: 'bg-cyan-500 hover:bg-cyan-600 text-black',
    inputBg: 'bg-gray-800 border-gray-700',
  },
  // ... other templates
};
```

### Route Configuration
In `App.tsx`:
```typescript
<Route path="/product/:id" element={<ProductDetail />} />
<Route path="/checkout/:productId" element={<StorefrontCheckout />} />
```

These routes work for:
- Product details: `/product/123`
- Template product: `/store/mystore/product-slug`
- Quick checkout: `/checkout/123?quantity=2`

## How Templates Work Together

### From Storefront to Checkout

1. **User clicks product card** in storefront (any template)
   - Card is fully clickable (no separate View button)
   - Buy Now button has stopPropagation to prevent double navigation

2. **ProductDetail page loads** with template colors
   - Reads template from localStorage
   - Applies theme-specific styling
   - Shows product with template accent color
   - User selects quantity and clicks "Buy Now"

3. **Checkout page loads** matching the theme
   - Template colors carry through all 4 steps
   - Form inputs styled per template
   - Order summary sidebar matches theme
   - Buttons use template accent colors

4. **Order completion**
   - User sees success confirmation in template colors
   - Redirects to home or order tracking page

### Data Flow

```
localStorage
    ├── template: "electronics"
    ├── storeSettings: {
    │   template_accent_color: "#38bdf8",
    │   store_name: "Tech Store",
    │   ...
    │ }
    └── cart: [...items]

ProductDetail
    ↓ reads template/settings
    ↓ applies TEMPLATE_STYLES[template]
    ↓ uses accentColor for highlights
    ↓ passes quantity to checkout

Checkout
    ↓ reads same template/settings
    ↓ maintains theme consistency
    ↓ shows order total with accent color
    ↓ validates and submits order
```

## Customization

### Adding New Template Color
To add a new template:

```typescript
// In ProductDetail.tsx and Checkout.tsx
const TEMPLATE_STYLES: Record<string, Record<string, string>> = {
  newtemplate: {
    bg: 'bg-white',           // Background class
    accent: '#your-color',    // Accent color hex
    text: 'text-gray-900',    // Text color class
    border: 'border-gray-200', // Border class
    button: 'bg-blue-500 hover:bg-blue-600 text-white', // Button classes
    inputBg: 'bg-gray-50 border-gray-200', // Input background
  },
};
```

### Overriding Template Colors
Users can customize accent colors in Template Settings, which override defaults:

```typescript
const accentColor = settings.template_accent_color || style.accent;
```

## Mobile Responsiveness

- **ProductDetail**: Grid columns adjust (1 col mobile, 2 col desktop)
- **Checkout**: Sidebar moves below main content on mobile
- **Forms**: Full-width inputs on mobile, 2-column on desktop
- **Buttons**: Full-width for easy mobile tapping

## Performance Optimizations

1. **localStorage Caching**: Template settings cached locally
2. **Lazy Loading**: ProductDetail uses React Query for product fetching
3. **Event Delegation**: Button clicks properly scoped with stopPropagation
4. **CSS Classes**: Tailwind utility classes - no custom CSS needed

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- ES2020+ JavaScript (uses optional chaining, nullish coalescing)

## Testing Checklist

- [ ] Each template loads with correct colors
- [ ] Accent color changes when user updates in settings
- [ ] Product quantity updates correctly
- [ ] Checkout form validation works
- [ ] Order total calculates correctly with tax/shipping
- [ ] Mobile responsive on all steps
- [ ] Back button navigates correctly
- [ ] Wishlist toggle works smoothly

## Future Enhancements

1. **Payment Integration**: Connect to Stripe/PayPal APIs
2. **Order Tracking**: Show order status with theme colors
3. **Email Confirmations**: Template-themed order emails
4. **Wishlist Page**: Template-styled favorites collection
5. **Reviews & Ratings**: Product review system with ratings
6. **Inventory Sync**: Real-time stock level updates
7. **Analytics**: Track template performance metrics
