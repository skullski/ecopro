import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, Star, ShoppingCart, Heart, TrendingUp, Zap, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Product } from '@shared/api';
import { safeStorage } from '@/lib/storage';

// Category icons mapping
const categoryIcons: Record<string, string> = {
  'Electronics': '📱',
  'Fashion': '👕',
  'Home & Garden': '🏡',
  'Sports': '⚽',
  'Beauty': '💄',
  'Toys': '🧸',
  'Books': '📚',
  'Automotive': '🚗',
};

interface Category {
  category: string;
  count: string;
}

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState('relevant');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [slowConnection, setSlowConnection] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
    
    // Debug info for mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log('[Marketplace] Platform:', {
      isMobile,
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }, []);

  // Parallel initial fetch with optimistic cache
  useEffect(() => {
    const cached = safeStorage.getItem('mp_first_page', true);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed.products) && Date.now() - parsed.timestamp < 30000) {
          setProducts(parsed.products);
          setLoading(false);
          // Refresh in background
          loadProducts(1, true);
        } else {
          loadProducts(1);
        }
      } catch {
        loadProducts(1);
      }
    } else {
      // Fetch categories and products in parallel
      Promise.all([loadCategories(), loadProducts(1)]).catch(() => {});
    }
  }, []);

  // Refetch when filters change (no cache reuse)
  useEffect(() => {
    setPage(1);
    loadProducts(1);
  }, [selectedCategory, sortBy]);

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/products/categories/counts');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadProducts = async (pageNum: number = 1, background = false) => {
    if (pageNum === 1) {
      setLoading(true);
      setSlowConnection(false);
      setError(null);
    }
    
    // Show warning if loading takes more than 800ms
    const slowTimer = setTimeout(() => {
      setSlowConnection(true);
    }, 800);

    try {
      const params = new URLSearchParams();
      if (selectedCategory) {
        params.append('category', selectedCategory);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      if (sortBy !== 'relevant') {
        const sortMap: Record<string, string> = {
          'price-low': 'price',
          'price-high': 'price',
          'rating': 'views',
          'popular': 'views',
        };
        params.append('sort', sortMap[sortBy] || 'created_at');
        params.append('order', sortBy === 'price-high' ? 'DESC' : 'ASC');
      }
      params.append('limit', '8');
      params.append('offset', String((pageNum - 1) * 8));

      const apiUrl = `/api/products?${params}`;
      console.log('[Marketplace] Fetching products:', apiUrl);
      
      // Use keepalive and timeout for faster requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch(apiUrl, {
        signal: controller.signal,
        keepalive: true
      });
      clearTimeout(timeoutId);
      
      console.log('[Marketplace] Response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('[Marketplace] Products loaded:', data.length);
        if (pageNum === 1) {
          setProducts(data);
          if (!background) {
            safeStorage.setItem('mp_first_page', JSON.stringify({ products: data, timestamp: Date.now() }), true);
          }
        } else {
          setProducts(prev => [...prev, ...data]);
        }
        setHasMore(data.length === 8);
        setSlowConnection(false);
      } else {
        const errorText = await res.text();
        console.error('[Marketplace] Failed to fetch products:', res.status, errorText);
        setError(`Failed to load products: ${res.status}`);
      }
    } catch (error) {
      console.error('[Marketplace] Failed to load products:', error);
      setError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Show products array is empty on error for debugging
      if (pageNum === 1) setProducts([]);
    } finally {
      clearTimeout(slowTimer);
      if (pageNum === 1) setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadProducts(nextPage);
  };

  const handleSearch = () => {
    setPage(1);
    loadProducts(1);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary via-accent to-neon-blue text-white futuristic-glow">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 max-w-3xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for products, brands and categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 h-12 text-base bg-white text-gray-900 border-0 rounded-lg shadow-lg"
                />
              </div>
            </div>
            <Button size="lg" className="bg-white text-primary hover:bg-neon-blue/10 font-bold px-8 h-12 shadow-lg futuristic-glow" onClick={handleSearch}>
              Search
            </Button>
          </div>
          
          {/* Flash Deals Banner */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg futuristic-glow">
              <Zap className="w-4 h-4" />
              <span className="font-bold">Flash Deals</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg futuristic-glow">
              <TrendingUp className="w-4 h-4" />
              <span className="font-bold">Trending Now</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg futuristic-glow">
              <span className="font-bold">Free Shipping on Orders $50+</span>
            </div>
            <Link to="/seller/signup" className="ml-auto">
              <Button size="sm" className="bg-white text-primary hover:bg-neon-blue/10 font-bold shadow-lg futuristic-glow">
                <Plus className="w-4 h-4 mr-2" />
                Start Selling
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-20 space-y-6 p-0">
              {/* Categories */}
              <div className="bg-gradient-to-b from-primary via-accent to-neon-blue text-white rounded-xl border-0 p-4 shadow-lg">
                <h3 className="font-extrabold mb-4 flex items-center gap-2 text-white drop-shadow-lg">
                  <SlidersHorizontal className="w-4 h-4" />
                  Categories
                </h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.category}
                      onClick={() => setSelectedCategory(cat.category === selectedCategory ? null : cat.category)}
                      className={`w-full text-left px-3 py-2 rounded-xl border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/80 dark:focus:ring-black/80 transition-all shadow-sm
                        ${selectedCategory === cat.category
                          ? 'bg-white text-primary font-extrabold border-white shadow-lg'
                          : 'bg-black/40 text-white font-bold hover:bg-black/60 hover:text-accent'}
                      `}
                      style={{ textShadow: '0 2px 8px rgba(0,0,0,0.45), 0 1px 2px rgba(0,0,0,0.22)' }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span>{categoryIcons[cat.category] || '📦'}</span>
                          <span className="text-sm font-extrabold drop-shadow-lg">{cat.category || 'Uncategorized'}</span>
                        </span>
                        <span className="text-xs font-extrabold opacity-95 drop-shadow-lg">({cat.count})</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="bg-gradient-to-b from-primary via-accent to-neon-blue text-white rounded-xl border-0 p-4 shadow-lg">
                <h3 className="font-extrabold mb-4 text-white drop-shadow-lg">Price Range</h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                      className="w-full text-black placeholder:text-gray-500"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                      className="w-full text-black placeholder:text-gray-500"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-xl border-2 border-white dark:border-black bg-white/80 dark:bg-black/80 text-primary dark:text-white font-bold shadow-sm hover:bg-white hover:dark:bg-black hover:shadow-lg transition-all"
                    style={{ textShadow: '0 1px 4px rgba(0,0,0,0.18), 0 0px 1px rgba(0,0,0,0.12)' }}
                  >
                    Apply
                  </Button>
                </div>
              </div>

              {/* Quick Filters */}
              <div className="bg-gradient-to-b from-primary via-accent to-neon-blue text-white rounded-xl border-0 p-4 shadow-lg">
                <h3 className="font-extrabold mb-4 text.white drop-shadow-lg">Quick Filters</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary">
                    <input type="checkbox" className="rounded text-black" />
                    <span className="text-black">Free Shipping</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary">
                    <input type="checkbox" className="rounded text-black" />
                    <span className="text-black">On Sale</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary">
                    <input type="checkbox" className="rounded text-black" />
                    <span className="text-black">4+ Stars</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6 bg-card rounded-xl border p-4 shadow-sm futuristic-glow">
              <p className="text-sm text-muted-foreground">
                {loading ? (
                  'Loading products...'
                ) : (
                  <>
                    Showing <span className="font-bold text-foreground">{products.length}</span> results
                  </>
                )}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border bg-background text-sm font-medium"
                >
                  <option value="relevant">Most Relevant</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Best Rating</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {error && (
                <div className="col-span-full text-center py-8 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-red-800 dark:text-red-200 font-medium">❌ {error}</p>
                  <button 
                    onClick={() => loadProducts(1)}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Try Again
                  </button>
                </div>
              )}
              {loading && products.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : products.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No products found. Be the first to{' '}
                  <Link to="/seller/signup" className="text-primary hover:underline">
                    sell on our marketplace
                  </Link>
                  !
                </div>
              ) : (
                products.map((product) => {
                  const discount = product.original_price
                    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
                    : 0;
                  // Deterministic pseudo rating based on id
                  const base = ((Number(product.id) * 9301 + 49297) % 233280) / 233280;
                  const rating = (3 + base * 2).toFixed(1);
                  const reviews = Math.floor(base * 500) + 10;

                  return (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className="group bg-card rounded-xl border overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer futuristic-glow block"
                    >
                      {/* Image */}
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <ShoppingCart className="w-16 h-16 text-muted-foreground opacity-20" />
                          </div>
                        )}
                        {product.condition === 'new' && (
                          <Badge className="absolute top-1.5 left-1.5 text-xs bg-red-500 text-white border-0 px-1.5 py-0">
                            New
                          </Badge>
                        )}
                        {discount > 0 && (
                          <Badge className="absolute top-1.5 right-1.5 text-xs bg-primary text-white border-0 px-1.5 py-0">
                            -{discount}%
                          </Badge>
                        )}
                        {/* Buy Button in bottom corner */}
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            window.location.href = `/guest-checkout/${product.id}`;
                          }}
                          className="absolute bottom-2 right-2 px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity font-medium shadow-lg"
                        >
                          Buy
                        </button>
                      </div>

                      {/* Compact Content */}
                      <div className="p-2 space-y-1">
                        <h3 className="text-xs font-medium line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                          {product.title}
                        </h3>
                        
                        {/* Price */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-primary">
                            ${product.price}
                          </span>
                          {product.original_price && (
                            <span className="text-[10px] text-muted-foreground line-through">
                              ${product.original_price}
                            </span>
                          )}
                        </div>

                        {/* Compact Rating */}
                        <div className="flex items-center gap-1">
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-2.5 h-2.5 ${
                                  i < Math.floor(+rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            ({reviews})
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <Button
                  onClick={loadMore}
                  size="lg"
                  className="bg-gradient-to-r from-primary via-accent to-neon-blue hover:from-primary/90 hover:via-accent/90 hover:to-neon-blue/90 text-white border-0 futuristic-glow px-8"
                >
                  Load More Products
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
