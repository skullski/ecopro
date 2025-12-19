import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, Star, ShoppingCart, Heart, TrendingUp, Zap, Plus, Menu, X, ChevronLeft, ChevronRight, LogOut, User } from 'lucide-react';
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
  'Books': '📚',
  'Automotive': '🚗',
  // Extra categories
  'Gaming': '🎮',
};

interface Category {
  category: string;
  count: string;
}

// Predefined list to always show common categories
const PRESET_CATEGORIES: string[] = [
  'Electronics',
  'Sports',
  'Home & Garden',
  'Fashion',
  'Automotive',
  'Beauty',
];

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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [showMyListings, setShowMyListings] = useState(false);

  useEffect(() => {
    loadCategories();
    
    // Debug info for mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log('[Marketplace] Platform:', {
      isMobile,
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    // Detect logged-in user (seller/admin) for header actions
    try {
      const raw = safeStorage.getItem('user') || localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        setCurrentUser(u);
      }
    } catch {}
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
        // Merge server categories with preset list and de-duplicate
        const byName: Record<string, Category> = {};
        for (const c of data as Category[]) {
          if (c?.category) byName[c.category] = { category: c.category, count: c.count };
        }
        for (const name of PRESET_CATEGORIES) {
          if (!byName[name]) byName[name] = { category: name, count: '0' };
        }
        // Stable order based on PRESET_CATEGORIES then any additional server categories
        const merged: Category[] = [
          ...PRESET_CATEGORIES.map((n) => byName[n]).filter(Boolean),
          ...Object.values(byName).filter((c) => !PRESET_CATEGORIES.includes(c.category)),
        ];
        setCategories(merged);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      // Fallback to preset categories if server fails
      setCategories(PRESET_CATEGORIES.map((n) => ({ category: n, count: '0' })));
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
      // If showing my listings and logged in as seller/admin, hit seller products endpoint (no filters/pagination for now)
      if (showMyListings && (currentUser?.user_type === 'seller' || currentUser?.role === 'admin')) {
        const res = await fetch('/api/seller/products', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
          setHasMore(false);
          setSlowConnection(false);
          return;
        } else {
          const txt = await res.text();
          console.error('[Marketplace] My listings fetch failed:', res.status, txt);
        }
      }
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

  const handleLogout = () => {
    try {
      safeStorage.removeItem('authToken');
      safeStorage.removeItem('user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('isAdmin');
    } catch {}
    setCurrentUser(null);
    setShowMyListings(false);
    // Reload products as anonymous
    setPage(1);
    loadProducts(1);
  };

  const handleSearch = () => {
    setPage(1);
    loadProducts(1);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Compact Header - Search Only */}
      <div className="bg-gradient-to-r from-primary to-accent text-white sticky top-0 z-40 shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white hover:bg-white/20"
              title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex-1 max-w-4xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for products, brands and categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 pr-4 h-10 text-sm bg-white text-gray-900 border-0 rounded-lg"
                />
              </div>
              {/* Categories moved below results header */}
            </div>
            <Button 
              size="sm" 
              className="bg-white text-primary hover:bg-gray-100 font-bold px-6 h-10"
              onClick={handleSearch}
            >
              Search
            </Button>
            {/* Auth-aware actions */}
            {currentUser?.user_type === 'seller' || currentUser?.role === 'admin' ? (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white text-primary hover:bg-gray-100 font-bold h-10"
                  onClick={() => setShowMyListings((v) => !v)}
                  title={showMyListings ? 'Show marketplace' : 'Show my listings'}
                >
                  {showMyListings ? 'All Products' : 'My Listings'}
                </Button>
                <Link to={currentUser?.role === 'admin' ? '/platform-admin' : '/seller/dashboard'}>
                  <Button size="sm" variant="outline" className="bg-white text-primary hover:bg-gray-100 font-bold h-10">
                    {currentUser?.role === 'admin' ? 'Admin' : 'Dashboard'}
                  </Button>
                </Link>
                <Button size="sm" variant="outline" className="bg-white text-primary hover:bg-gray-100 font-bold h-10" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-1" /> Logout
                </Button>
              </div>
            ) : (
              <Link to="/seller/login">
                <Button size="sm" variant="outline" className="bg-white text-primary hover:bg-gray-100 font-bold h-10">
                  Seller Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden w-full">
        <div className={`container mx-auto px-4 py-4 flex ${sidebarOpen ? 'gap-3 md:gap-4' : 'gap-0'}`}>
          {/* Sidebar - Always in DOM, slides in/out */}
          <aside className={`
              flex-shrink-0 transition-all duration-300 ease-in-out overflow-y-auto
              ${sidebarOpen ? 'w-64 opacity-100' : 'hidden'}
            `}>
              <div className="sticky top-4 space-y-4"
                style={{ maxHeight: 'calc(100vh - 8rem)' }}
              >
                {/* Categories */}
                <div className="bg-card rounded-lg border p-4">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    Categories
                  </h3>
                  <div className="space-y-1.5">
                    {categories.filter((c) => !['Pets','Toys','Music','Health'].includes(c.category)).map((cat) => (
                      <button
                        key={cat.category}
                        onClick={() => {
                          setSelectedCategory(cat.category === selectedCategory ? null : cat.category);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm
                          ${selectedCategory === cat.category
                            ? 'bg-primary text-primary-foreground font-semibold'
                            : 'hover:bg-muted'}
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <span>{categoryIcons[cat.category] || '📦'}</span>
                            <span>{cat.category || 'Uncategorized'}</span>
                          </span>
                          <span className="text-xs opacity-70">({cat.count})</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="bg-card rounded-lg border p-4">
                  <h3 className="font-bold mb-3">Price Range</h3>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                        className="w-full text-sm"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                        className="w-full text-sm"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Apply
                    </Button>
                  </div>
                </div>

                {/* Sort By */}
                <div className="bg-card rounded-lg border p-4">
                  <h3 className="font-bold mb-3">Sort By</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border bg-background text-sm"
                  >
                    <option value="relevant">Most Relevant</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>
            </aside>

          {/* Main Content - Stretches to fill space */}
          <main className="flex-1 min-w-0">
            {/* Inline categories row when sidebar is hidden (single block above the grid) */}
            {!sidebarOpen && (
              <div className="mb-4 bg-card rounded-lg border px-2 py-2 overflow-x-auto">
                <div className="flex gap-2 min-w-0">
                  {categories.filter((c) => !['Pets','Toys','Music','Health'].includes(c.category)).map((cat) => (
                    <button
                      key={cat.category}
                      onClick={() => {
                        setSelectedCategory(cat.category === selectedCategory ? null : cat.category);
                        setPage(1);
                        loadProducts(1);
                      }}
                      className={`shrink-0 px-3 py-1.5 rounded-full text-sm border transition-colors
                        ${selectedCategory === cat.category ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground hover:bg-muted border-border'}`}
                      title={`${cat.category} (${cat.count})`}
                    >
                      <span className="mr-1">{categoryIcons[cat.category] || '📦'}</span>
                      {cat.category || 'Uncategorized'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Categories strip remains under the search bar in header */}

            {/* Products Grid */}
            <div className={`grid grid-cols-2 md:grid-cols-3 gap-3 transition-all duration-300 ${
              sidebarOpen ? 'lg:grid-cols-4' : 'lg:grid-cols-5'
            }`}>
              {error && (
                <div className="col-span-full text-center py-4 md:py-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
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
                <div className="col-span-full text-center py-6 md:py-4 md:py-6">
                  <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : products.length === 0 ? (
                <div className="col-span-full text-center py-6 md:py-4 md:py-6 text-muted-foreground">
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
              <div className="mt-4 md:mt-6 flex justify-center">
                <Button
                  onClick={loadMore}
                  size="lg"
                  className="bg-gradient-to-r from-primary via-accent to-neon-blue hover:from-primary/90 hover:via-accent/90 hover:to-neon-blue/90 text-white border-0 futuristic-glow px-4 md:px-6"
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
