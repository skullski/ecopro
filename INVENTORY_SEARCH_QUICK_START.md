# Inventory & Search Quick Start

## TL;DR

✅ **Foundation Complete** - All hooks and UI components ready to use

### What You Can Do Right Now

#### 1. Add Stock Display to Product Card (5 min)
```tsx
import { useStockStatus } from '@/hooks/useInventory';
import { StockBadge } from '@/components/inventory/StockDisplay';

export function ProductCard({ product }: { product: StoreProduct }) {
  const stockStatus = useStockStatus(product.stock_quantity);
  
  return (
    <div>
      <img src={product.images?.[0]} />
      <h3>{product.title}</h3>
      <p className="text-lg font-bold">{product.price}</p>
      
      {/* Add this */}
      <div className="mt-2">
        <StockBadge quantity={product.stock_quantity} />
      </div>
      
      <button disabled={!stockStatus.isInStock}>
        {stockStatus.isInStock ? 'Add to Cart' : 'Out of Stock'}
      </button>
    </div>
  );
}
```

#### 2. Add Search to Storefront (10 min)
```tsx
import { useState } from 'react';
import { useProductSearch } from '@/hooks/useSearch';
import { SearchBar, CategoryFilter } from '@/components/search/SearchFilters';

export function StorefrontPage({ products }: { products: StoreProduct[] }) {
  const [query, setQuery] = useState('');
  
  const filtered = useProductSearch(products, {
    searchQuery: query,
    categories: [],
    minPrice: 0,
    maxPrice: Infinity,
    sortBy: 'featured',
    inStockOnly: false,
  });
  
  return (
    <div>
      <SearchBar value={query} onChange={setQuery} />
      <div className="grid">
        {filtered.map(product => <ProductCard key={product.id} product={product} />)}
      </div>
    </div>
  );
}
```

#### 3. Show Inventory Stats in Admin (5 min)
```tsx
import { useInventoryStats } from '@/hooks/useInventory';
import { InventoryStats } from '@/components/inventory/StockDisplay';

export function Dashboard({ products }: { products: StoreProduct[] }) {
  const stats = useInventoryStats(products);
  
  return <InventoryStats {...stats} />;
}
```

## File Locations

**Hooks** (copy imports from here):
- `client/hooks/useInventory.ts` - Stock status, filtering, validation
- `client/hooks/useSearch.ts` - Search, filtering, sorting

**Components** (use in your pages):
- `client/components/inventory/StockDisplay.tsx` - Stock badges, stats, warnings
- `client/components/search/SearchFilters.tsx` - Search bar, filters, sort

**Examples**:
- `client/components/search/StorefrontExample.tsx` - See everything working together

## Common Patterns

### Pattern: Filter by Stock + Price + Category
```tsx
const filtered = useProductSearch(products, {
  searchQuery: '',
  categories: ['electronics'],
  minPrice: 1000,
  maxPrice: 5000,
  sortBy: 'price-asc',
  inStockOnly: true,
});
```

### Pattern: Show Low Stock Alert
```tsx
const stockStatus = useStockStatus(quantity);

{stockStatus.isLowStock && (
  <LowStockWarning quantity={quantity} />
)}
```

### Pattern: Validate Before Checkout
```tsx
const validation = useStockCartValidation(product.stock_quantity);

if (!validation.canAddToCart) {
  alert(validation.message);
}
```

### Pattern: Full Search Interface
```tsx
<div className="space-y-4">
  <SearchBar value={query} onChange={setQuery} />
  <CategoryFilter categories={categories} selected={selected} onChange={setSelected} />
  <PriceRangeFilter minPrice={min} maxPrice={max} onMinChange={setMin} onMaxChange={setMax} globalMin={0} globalMax={10000} />
  <SortSelector value={sort} onChange={setSort} />
  <FilterSummary summary={summary} filterCount={count} onClearAll={clear} />
</div>
```

## Hook API Quick Reference

### useStockStatus(quantity)
```tsx
const { isInStock, isLowStock, status, statusLabel, statusColor } = useStockStatus(15);
// status: 'in-stock' | 'low-stock' | 'out-of-stock'
// statusLabel: 'In Stock' | 'Low Stock' | 'Out of Stock'
// statusColor: 'green' | 'amber' | 'red'
```

### useProductSearch(products, options)
```tsx
const filtered = useProductSearch(products, {
  searchQuery: 'laptop',
  categories: ['electronics', 'computers'],
  minPrice: 1000,
  maxPrice: 5000,
  sortBy: 'price-asc',
  inStockOnly: true,
});
// Returns: StoreProduct[]
```

### useInventoryStats(products)
```tsx
const { totalProducts, inStockCount, lowStockCount, outOfStockCount, stockPercentage } = useInventoryStats(products);
```

### useCategories(products)
```tsx
const categories = useCategories(products);
// Returns: string[] of unique category names
```

### usePriceRange(products)
```tsx
const { min, max, minFormatted, maxFormatted } = usePriceRange(products);
```

## Component Props Quick Reference

### StockBadge
```tsx
<StockBadge quantity={15} />
// Shows: "In Stock", "Only 3 left", or "Out of Stock"
```

### InventoryStats
```tsx
<InventoryStats
  totalProducts={50}
  inStockCount={40}
  lowStockCount={5}
  outOfStockCount={5}
/>
```

### SearchBar
```tsx
<SearchBar 
  value={query} 
  onChange={setQuery}
  onClear={() => setQuery('')}
/>
```

### CategoryFilter
```tsx
<CategoryFilter
  categories={['Electronics', 'Furniture', 'Clothing']}
  selected={['Electronics']}
  onChange={setSelected}
/>
```

### PriceRangeFilter
```tsx
<PriceRangeFilter
  minPrice={1000}
  maxPrice={5000}
  onMinChange={setMin}
  onMaxChange={setMax}
  globalMin={0}
  globalMax={10000}
/>
```

### SortSelector
```tsx
<SortSelector 
  value="price-asc"
  onChange={setSortBy}
/>
// Options: 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'popular' | 'rating'
```

## Next Steps

1. **Review** `StorefrontExample.tsx` to see complete integration
2. **Copy** patterns to your pages
3. **Test** with real data
4. **Customize** colors/styling in Tailwind config
5. **Add** backend integration if needed

## Performance Tips

- Use `useDebouncedSearch` for real-time search inputs
- All hooks are memoized - no performance worries
- Filters recalculate only when dependencies change
- Safe for 1000+ product lists

## Troubleshooting

**Search not working?**
- Check `product.category` field exists
- Verify `SearchBar` value changes trigger hook

**Stock badge not showing?**
- Ensure `stock_quantity` field exists on product
- Check Tailwind CSS is loaded

**Filters not applying?**
- Confirm `FilterOptions` interface matches hook call
- Verify `useProductSearch` result is used for rendering

## Files Created

```
✅ client/hooks/useInventory.ts           (4 hooks, 286 lines)
✅ client/hooks/useSearch.ts              (7 hooks, 324 lines)
✅ client/components/inventory/StockDisplay.tsx    (4 components, 98 lines)
✅ client/components/search/SearchFilters.tsx      (6 components, 248 lines)
✅ client/components/search/StorefrontExample.tsx  (example, 260 lines)
✅ INVENTORY_SEARCH_INTEGRATION_GUIDE.md
✅ INVENTORY_SEARCH_COMPLETE_SUMMARY.md
```

**Total**: ~1,200 lines of production code + documentation

---

**Status**: ✅ Ready for integration into your pages
**Quality**: ✅ 0 TypeScript errors, build verified
**Support**: See `StorefrontExample.tsx` for complete patterns
