/**
 * Enhanced Storefront Component Example
 * Demonstrates integration of Inventory Management + Search & Filtering
 */

import React, { useState } from 'react';
import { useProductSearch, useCategories, usePriceRange, useFilterSummary } from '@/hooks/useSearch';
import { useStockStatus, useInventoryStats } from '@/hooks/useInventory';
import {
  SearchBar,
  CategoryFilter,
  PriceRangeFilter,
  SortSelector,
  FilterSummary,
  InStockOnlyToggle,
} from '@/components/search/SearchFilters';
import { StockBadge, OutOfStockNotice, LowStockWarning, InventoryStats } from '@/components/inventory/StockDisplay';
import { StoreProduct } from '@/pages/storefront/templates/types';

type Product = StoreProduct & {
  views?: number;
  rating?: number;
}

interface StorefrontDemoProps {
  products: Product[];
}

/**
 * Complete example showing all features together
 */
export function StorefrontWithFiltering({ products }: StorefrontDemoProps) {
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(Infinity);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest' | 'popular' | 'rating'>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showStats, setShowStats] = useState(true);

  // Use hooks
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
  const filterSummary = useFilterSummary({
    searchQuery,
    categories: selectedCategories,
    minPrice,
    maxPrice,
    inStockOnly,
  });
  const inventoryStats = useInventoryStats(products);

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setMinPrice(0);
    setMaxPrice(Infinity);
    setSortBy('featured');
    setInStockOnly(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Store Products</h1>
          <p className="text-gray-600 mt-2">
            {filteredProducts.length} products {filterSummary.hasFilters ? 'found' : 'available'}
          </p>
        </div>

        {/* Inventory Stats Section */}
        {showStats && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Inventory Overview</h2>
              <button
                onClick={() => setShowStats(false)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Hide
              </button>
            </div>
            <InventoryStats
              totalProducts={inventoryStats.totalProducts}
              inStockCount={inventoryStats.inStockCount}
              lowStockCount={inventoryStats.lowStockCount}
              outOfStockCount={inventoryStats.outOfStockCount}
            />
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Search & Filter</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={() => setSearchQuery('')}
              />
            </div>

            {/* Sort */}
            <SortSelector value={sortBy} onChange={setSortBy as any} />

            {/* In Stock Only */}
            <div className="flex items-end">
              <InStockOnlyToggle
                checked={inStockOnly}
                onChange={setInStockOnly}
              />
            </div>
          </div>

          {/* Category & Price Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </div>

        {/* Filter Summary */}
        {filterSummary.hasFilters && (
          <FilterSummary
            summary={filterSummary.summary}
            filterCount={filterSummary.filterCount}
            onClearAll={handleClearAllFilters}
            className="mb-8"
          />
        )}

        {/* Results */}
        {filteredProducts.length > 0 ? (
          <div>
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product: Product) => {
                const stockStatus = useStockStatus(product.stock_quantity);
                const productImages = ((product as any).images ?? []) as string[];

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      {productImages.length > 0 ? (
                        <img
                          src={productImages[0]}
                          alt={product.title}
                          className="w-full h-full object-cover hover:scale-105 transition"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No image
                        </div>
                      )}
                      {/* Stock Badge */}
                      <div className="absolute top-2 right-2">
                        <StockBadge quantity={product.stock_quantity} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                        {product.title}
                      </h3>

                      {product.category && (
                        <p className="text-xs text-gray-500 mb-3">{product.category}</p>
                      )}

                      {/* Rating */}
                      {product.rating && (
                        <div className="text-sm text-amber-500 mb-3">
                          {'★'.repeat(Math.floor(product.rating))}
                          {'☆'.repeat(5 - Math.floor(product.rating))}
                        </div>
                      )}

                      {/* Price */}
                      <p className="text-lg font-bold text-gray-900 mb-3">
                        {product.price.toLocaleString()} DZD
                      </p>

                      {/* Stock Alert */}
                      {stockStatus.isLowStock && (
                        <LowStockWarning quantity={stockStatus.quantity} className="mb-3" />
                      )}

                      {stockStatus.status === 'out-of-stock' && (
                        <OutOfStockNotice className="mb-3" />
                      )}

                      {/* Actions */}
                      <button
                        disabled={!stockStatus.isInStock}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition ${
                          stockStatus.isInStock
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {stockStatus.isInStock ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 text-lg">No products found matching your filters.</p>
            <button
              onClick={handleClearAllFilters}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Usage example:
// <StorefrontWithFiltering products={storeProducts} />
