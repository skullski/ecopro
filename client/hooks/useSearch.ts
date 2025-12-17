/**
 * Search & Filtering Hook
 * Handles product search, category filtering, price range, and sorting
 */

import { useMemo, useCallback, useState, useEffect } from 'react';

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'popular' | 'rating';

export interface FilterOptions {
  searchQuery: string;
  categories: string[];
  minPrice: number;
  maxPrice: number;
  sortBy: SortOption;
  inStockOnly: boolean;
}

export interface Product {
  id: number;
  title: string;
  name?: string;
  price: number;
  original_price?: number;
  category?: string;
  stock_quantity?: number;
  views?: number;
  rating?: number;
  createdAt?: string;
  created_at?: string;
}

/**
 * Hook: Advanced product search with multiple filters
 * @param products - Array of products to filter
 * @param options - Filter options
 * @returns Filtered products array
 */
export function useProductSearch(
  products: Product[] = [],
  options: Partial<FilterOptions> = {}
) {
  const {
    searchQuery = '',
    categories = [],
    minPrice = 0,
    maxPrice = Infinity,
    sortBy = 'featured',
    inStockOnly = false,
  } = options;

  return useMemo(() => {
    let filtered = [...products];

    // 1. Text search (searches title, name, category)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => {
        const title = (p.title || p.name || '').toLowerCase();
        const category = (p.category || '').toLowerCase();
        return title.includes(query) || category.includes(query);
      });
    }

    // 2. Category filter
    if (categories.length > 0) {
      filtered = filtered.filter((p) =>
        categories.includes(p.category || '')
      );
    }

    // 3. Price range filter
    filtered = filtered.filter((p) => {
      const price = p.price || 0;
      return price >= minPrice && price <= maxPrice;
    });

    // 4. Stock filter
    if (inStockOnly) {
      filtered = filtered.filter((p) => (p.stock_quantity ?? 0) > 0);
    }

    // 5. Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return (a.price || 0) - (b.price || 0);
        case 'price-desc':
          return (b.price || 0) - (a.price || 0);
        case 'newest': {
          const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
          const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
          return dateB - dateA;
        }
        case 'popular':
          return (b.views || 0) - (a.views || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'featured':
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchQuery, categories, minPrice, maxPrice, sortBy, inStockOnly]);
}

/**
 * Hook: Extract unique categories from products
 * @param products - Array of products
 * @returns Sorted array of unique categories
 */
export function useCategories(products: Product[] = []) {
  return useMemo(() => {
    const categories = new Set<string>();
    products.forEach((p) => {
      if (p.category) {
        categories.add(p.category);
      }
    });
    return Array.from(categories).sort();
  }, [products]);
}

/**
 * Hook: Get price range from products
 * @param products - Array of products
 * @returns Min and max prices
 */
export function usePriceRange(products: Product[] = []) {
  return useMemo(() => {
    if (products.length === 0) {
      return { min: 0, max: 0, display: { min: '0', max: '0' } };
    }

    const prices = products
      .map((p) => p.price || 0)
      .filter((p) => p > 0)
      .sort((a, b) => a - b);

    const min = prices[0] || 0;
    const max = prices[prices.length - 1] || 0;

    return {
      min,
      max,
      display: {
        min: min.toLocaleString(),
        max: max.toLocaleString(),
      },
    };
  }, [products]);
}

/**
 * Hook: Format and validate search parameters
 * @param query - Raw search query
 * @returns Normalized search parameters
 */
export function useSearchNormalize(query: string = '') {
  return useMemo(() => {
    const normalized = query
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .substring(0, 100); // Max 100 chars

    return {
      query: normalized,
      isEmpty: normalized.length === 0,
      length: normalized.length,
      words: normalized.split(' ').filter((w) => w.length > 0),
    };
  }, [query]);
}

/**
 * Hook: Get filter summary for display
 * @param options - Current filter options
 * @returns Human-readable filter summary
 */
export function useFilterSummary(options: Partial<FilterOptions> = {}) {
  return useMemo(() => {
    const parts: string[] = [];

    if (options.searchQuery?.trim()) {
      parts.push(`"${options.searchQuery}"`);
    }

    if (options.categories && options.categories.length > 0) {
      const catDisplay = options.categories.length === 1
        ? options.categories[0]
        : `${options.categories.length} categories`;
      parts.push(`in ${catDisplay}`);
    }

    if (
      options.minPrice !== undefined &&
      options.minPrice > 0
    ) {
      parts.push(`from ${options.minPrice} DZD`);
    }

    if (
      options.maxPrice !== undefined &&
      options.maxPrice !== Infinity
    ) {
      parts.push(`to ${options.maxPrice} DZD`);
    }

    if (options.inStockOnly) {
      parts.push('(in stock only)');
    }

    return {
      summary: parts.length > 0 ? parts.join(' ') : 'All products',
      filterCount: parts.length,
      hasFilters: parts.length > 0,
    };
  }, [options]);
}

/**
 * Hook: Debounced search (prevents excessive filtering)
 * @param query - Search query
 * @param delay - Debounce delay in ms
 * @returns Debounced query
 */
export function useDebouncedSearch(query: string = '', delay: number = 300) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => clearTimeout(timer);
  }, [query, delay]);

  return debouncedQuery;
}
