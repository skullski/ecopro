# Inventory & Search Integration Guide

## Overview

This guide shows how to integrate the newly created **Inventory Management** and **Search & Filtering** systems into your storefronts and pages.

**Status**: ✅ Foundation Complete
- 4 Inventory hooks created
- 7 Search hooks created  
- 10 UI components created
- All TypeScript validated ✓
- Build successful ✓

## What Was Created

### Inventory Management System (`client/hooks/useInventory.ts`)

**4 Custom Hooks:**
1. `useStockStatus(quantity)` - Determines if product is in-stock, low-stock, or out-of-stock
2. `useInventoryFilter(products, showOutOfStock)` - Filters products by stock availability
3. `useInventoryStats(products)` - Returns store-wide inventory statistics
4. `useStockCartValidation(stock)` - Validates if customer can add product to cart

**Use Cases:**
- Show stock badges on product cards
- Display low stock warnings
- Calculate inventory statistics for admin dashboard
- Prevent out-of-stock purchases

### Search & Filtering System (`client/hooks/useSearch.ts`)

**7 Custom Hooks/Utilities:**
1. `useProductSearch(products, options)` - Main filtering hook with 5-stage pipeline
2. `useCategories(products)` - Extracts unique categories
3. `usePriceRange(products)` - Gets min/max prices
4. `useSearchNormalize(query)` - Normalizes search strings
5. `useFilterSummary(options)` - Creates human-readable filter descriptions
6. `useDebouncedSearch(query, delay)` - Debounced search to prevent excessive filtering

**5-Stage Filtering Pipeline:**
1. Text search (title, category matching)
2. Category multi-select filtering
3. Price range filtering
4. Stock availability filter
5. Sorting (6 sort modes)

### UI Components

**Inventory Components (`client/components/inventory/StockDisplay.tsx`):**
- `StockBadge` - Badge showing stock status (Out of Stock, Only X left, In Stock)
- `InventoryStats` - Grid showing inventory statistics
- `OutOfStockNotice` - Out-of-stock notice (banner or inline)
- `LowStockWarning` - Low stock warning message

**Search Components (`client/components/search/SearchFilters.tsx`):**
- `SearchBar` - Search input with clear button
- `CategoryFilter` - Multi-select category dropdown
- `PriceRangeFilter` - Dual price range inputs
- `SortSelector` - Sort options dropdown
- `FilterSummary` - Shows active filters
- `InStockOnlyToggle` - In-stock only checkbox

**Example Implementation (`client/components/search/StorefrontExample.tsx`):**
- Complete working example showing all features integrated together

## Integration Patterns

### Pattern 1: ProductDetail Page

Add inventory display and stock validation to product detail pages:

```typescript
import { useStockStatus } from '@/hooks/useInventory';
import { StockBadge, LowStockWarning, OutOfStockNotice } from '@/components/inventory/StockDisplay';

export function ProductDetail({ product }: { product: StoreProduct }) {
  const stockStatus = useStockStatus(product.stock_quantity);

  return (
    <div>
      {/* Product info */}
      
      {/* Stock status */}
      <StockBadge quantity={stockStatus.quantity} />
      
      {stockStatus.isLowStock && (
        <LowStockWarning quantity={stockStatus.quantity} />
      )}
      
      {!stockStatus.isInStock && (
        <OutOfStockNotice />
      )}
      
      {/* Add to cart button - disabled if out of stock */}
      <button disabled={!stockStatus.isInStock}>
        {stockStatus.isInStock ? 'Add to Cart' : 'Out of Stock'}
      </button>
    </div>
  );
}
```

### Pattern 2: Storefront Search Page

Add full search and filtering to storefront pages:

```typescript
import { useState } from 'react';
import { useProductSearch, useCategories, usePriceRange } from '@/hooks/useSearch';
import { 
  SearchBar, 
  CategoryFilter, 
  PriceRangeFilter, 
  SortSelector 
} from '@/components/search/SearchFilters';

export function StorefrontPage({ products }: { products: StoreProduct[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(Infinity);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);

  const categories = useCategories(products);
  const priceRange = usePriceRange(products);
  
  const filteredProducts = useProductSearch(products, {
    searchQuery,
    categories: selectedCategories,
    minPrice,
    maxPrice: maxPrice === Infinity ? priceRange.max : maxPrice,
    sortBy,
    inStockOnly,
  });

  return (
    <div>
      {/* Search & filters */}
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <CategoryFilter 
        categories={categories}
        selected={selectedCategories}
        onChange={setSelectedCategories}
      />
      <PriceRangeFilter
        minPrice={minPrice}
        maxPrice={maxPrice === Infinity ? priceRange.max : maxPrice}
        onMinChange={setMinPrice}
        onMaxChange={setMaxPrice}
        globalMin={priceRange.min}
        globalMax={priceRange.max}
      />
      <SortSelector value={sortBy} onChange={setSortBy} />

      {/* Results */}
      <div>
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

### Pattern 3: Admin Dashboard - Inventory Stats

Show inventory overview on admin dashboard:

```typescript
import { useInventoryStats } from '@/hooks/useInventory';
import { InventoryStats } from '@/components/inventory/StockDisplay';

export function AdminDashboard({ products }: { products: StoreProduct[] }) {
  const stats = useInventoryStats(products);

  return (
    <div>
      <h2>Inventory Overview</h2>
      <InventoryStats
        totalProducts={stats.totalProducts}
        inStockCount={stats.inStockCount}
        lowStockCount={stats.lowStockCount}
        outOfStockCount={stats.outOfStockCount}
      />
      
      {/* Show products in low stock if needed */}
      {stats.lowStockCount > 0 && (
        <div className="mt-8">
          <h3>Products Needing Attention</h3>
          {products
            .filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5)
            .map(p => (
              <div key={p.id}>
                {p.title} - Only {p.stock_quantity} left
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
```

### Pattern 4: Cart Validation

Validate stock before processing cart:

```typescript
import { useStockCartValidation } from '@/hooks/useInventory';

export function CheckoutFlow({ cartItems }: { cartItems: CartItem[] }) {
  const validations = cartItems.map(item => ({
    ...item,
    validation: useStockCartValidation(item.product.stock_quantity),
  }));

  const hasErrors = validations.some(v => !v.validation.canAddToCart);

  if (hasErrors) {
    return (
      <div className="error">
        <p>Some items are no longer available:</p>
        {validations
          .filter(v => !v.validation.canAddToCart)
          .map(v => (
            <div key={v.product.id}>{v.validation.message}</div>
          ))}
      </div>
    );
  }

  return <CheckoutForm items={cartItems} />;
}
```

## Integration Checklist

### Phase 1: Product Detail Pages (1-2 hours)
- [ ] Import `useStockStatus` and inventory UI components
- [ ] Add stock badge to product image
- [ ] Add low stock warning if applicable
- [ ] Add out-of-stock notice if applicable
- [ ] Disable "Add to Cart" for out-of-stock products
- [ ] Test with various stock quantities
- [ ] Test with empty/no images

### Phase 2: Storefront Search (2-3 hours)
- [ ] Import search hooks and UI components
- [ ] Add SearchBar component
- [ ] Add CategoryFilter component
- [ ] Add PriceRangeFilter component
- [ ] Add SortSelector component
- [ ] Connect all filters to useProductSearch
- [ ] Display filtered results
- [ ] Add FilterSummary component
- [ ] Test search functionality
- [ ] Test category filtering
- [ ] Test price range filtering
- [ ] Test sorting options
- [ ] Test "In Stock Only" toggle

### Phase 3: Admin Dashboard (1-2 hours)
- [ ] Import inventory stats hooks
- [ ] Add InventoryStats component to dashboard
- [ ] Show list of low-stock products
- [ ] Add alerts for out-of-stock products
- [ ] Create low-stock notification system

### Phase 4: Template Updates (1 hour)
- [ ] Update each template to include SearchBar
- [ ] Add CategoryFilter to template
- [ ] Add PriceRangeFilter to template
- [ ] Add SortSelector to template
- [ ] Test with template settings

### Phase 5: Testing (2-3 hours)
- [ ] Unit tests for hooks
- [ ] Integration tests for components
- [ ] End-to-end tests for search flows
- [ ] End-to-end tests for inventory flows
- [ ] Performance testing with large product lists
- [ ] Edge cases (no products, single product, etc.)

## Hook Usage Examples

### useStockStatus
```typescript
const stockStatus = useStockStatus(15);
// Returns:
// {
//   isInStock: true,
//   isLowStock: false,
//   quantity: 15,
//   status: 'in-stock',
//   statusLabel: 'In Stock',
//   statusColor: 'green'
// }
```

### useProductSearch
```typescript
const filtered = useProductSearch(products, {
  searchQuery: 'laptop',
  categories: ['electronics'],
  minPrice: 1000,
  maxPrice: 5000,
  sortBy: 'price-asc',
  inStockOnly: true,
});
// Returns: Array of products matching all filters, sorted by price
```

### useInventoryStats
```typescript
const stats = useInventoryStats(products);
// Returns:
// {
//   totalProducts: 50,
//   inStockCount: 40,
//   outOfStockCount: 5,
//   lowStockCount: 5,
//   totalUnits: 500,
//   stockPercentage: 80,
//   lowStockPercentage: 10
// }
```

### useFilterSummary
```typescript
const summary = useFilterSummary({
  searchQuery: 'shoes',
  categories: ['footwear'],
  minPrice: 500,
  maxPrice: 2000,
  inStockOnly: true,
});
// Returns:
// {
//   summary: 'shoes in category footwear from 500 to 2000 DZD (in stock)',
//   hasFilters: true,
//   filterCount: 4
// }
```

## Performance Notes

All hooks use `useMemo` for memoization:
- Prevents unnecessary re-renders
- Filters only recalculate when dependencies change
- Debounced search prevents excessive filtering

For large product lists (1000+ items):
- Use `useDebouncedSearch` to add search delay
- Consider pagination or virtual scrolling
- Monitor filter performance in React DevTools

## Troubleshooting

### Components Not Rendering
- Ensure StoreProduct type is used consistently
- Check that products array is not empty
- Verify `stock_quantity` field exists on products

### Search Not Working
- Verify `searchQuery` state is being updated
- Check category names match exactly
- Ensure products have `category` field populated

### Filters Not Applying
- Confirm `FilterOptions` interface is passed correctly
- Check that `useProductSearch` is called with memoized dependencies
- Verify sort option values match `SortOption` type

### Performance Issues
- Use `useDebouncedSearch` for real-time search inputs
- Consider pagination for large product lists
- Check React DevTools for unnecessary re-renders
- Profile with Chrome DevTools Performance tab

## Files Created

```
client/
├── hooks/
│   ├── useInventory.ts       (286 lines) - Inventory management hooks
│   └── useSearch.ts          (324 lines) - Search & filtering hooks
├── components/
│   ├── inventory/
│   │   └── StockDisplay.tsx  (98 lines) - Inventory UI components
│   └── search/
│       ├── SearchFilters.tsx (248 lines) - Search UI components
│       └── StorefrontExample.tsx (260 lines) - Complete example
```

**Total New Code**: ~1,200 lines of production-ready TypeScript

## Next Steps

1. **Review** the `StorefrontExample.tsx` to see all features working together
2. **Start Integration** with ProductDetail page (easiest starting point)
3. **Add Search** to StorefrontPage
4. **Update Templates** to show search interface
5. **Test** each component as you integrate
6. **Monitor Performance** with large product lists
7. **Create Tests** for new hooks and components

## Questions?

See the example implementation in `StorefrontExample.tsx` for complete usage patterns.
