import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, Grid, List, ShoppingCart, Star, Eye, 
  Package, Filter, ArrowLeft, Store as StoreIcon,
  Heart, Share2, ExternalLink, Truck, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StoreProduct {
  id: number;
  title: string;
  description?: string;
  price: number;
  original_price?: number;
  images?: string[];
  category?: string;
  stock_quantity: number;
  is_featured: boolean;
  slug: string;
  views: number;
}

interface StoreSettings {
  store_name?: string;
  store_description?: string;
  store_logo?: string;
  primary_color?: string;
  secondary_color?: string;
  template?: string;
  banner_url?: string;
  currency_code?: string;
}

export default function Storefront() {
  // Support both new (:storeSlug) and legacy (:clientId) route params
  const params = useParams();
  const storeSlug = (params as any).storeSlug || (params as any).clientId;
  const navigate = useNavigate();
  const location = useLocation();
  
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<StoreProduct[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({});
  const [categories, setCategories] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortOption, setSortOption] = useState<'featured' | 'price-asc' | 'price-desc' | 'views-desc' | 'newest'>('featured');

  useEffect(() => {
    loadStore();
  }, [storeSlug]);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, categoryFilter, sortOption]);

  const loadStore = async () => {
    try {
      // Validate storeSlug exists
      if (!storeSlug) {
        throw new Error('Store ID is missing');
      }

      const [productsRes, settingsRes] = await Promise.all([
        fetch(`/api/storefront/${storeSlug}/products`),
        fetch(`/api/storefront/${storeSlug}/settings`)
      ]);

      // Only error if both requests fail (store doesn't exist)
      if (!productsRes.ok && !settingsRes.ok) {
        throw new Error('Store not found');
      }
      
      const productsData = productsRes.ok ? await productsRes.json() : [];
      const settingsData = settingsRes.ok ? await settingsRes.json() : {};

      setProducts(Array.isArray(productsData) ? productsData : []);
      setStoreSettings(settingsData);

      // Extract unique categories
      const cats = [...new Set(productsData.map((p: StoreProduct) => p.category).filter(Boolean))];
      setCategories(cats as string[]);
      
    } catch (err: any) {
      console.error('Load store error:', err);
      setError(err.message || 'Failed to load store');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'price-asc':
          return Number(a.price) - Number(b.price);
        case 'price-desc':
          return Number(b.price) - Number(a.price);
        case 'views-desc':
          return Number(b.views) - Number(a.views);
        case 'newest':
          return Number(b.id) - Number(a.id);
        case 'featured':
        default:
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return Number(b.views) - Number(a.views);
      }
    });

    setFilteredProducts(filtered);
  };

  const primaryColor = storeSettings.primary_color || '#3b82f6';
  const secondaryColor = storeSettings.secondary_color || '#8b5cf6';
  const bannerUrl = (storeSettings as any)['banner_url'] || (storeSettings as any)['cover_image'];
  const urlTemplate = new URLSearchParams(location.search).get('template') as string | null;
  const template = ((storeSettings as any)['template'] || urlTemplate || 'classic') as 'classic' | 'supreme' | 'maximize' | 'fullframe' | 'stockist' | 'walidstore';

  // Currency/locale formatting
  const currencyCode = (storeSettings as any)['currency_code'] || 'DZD';
  const locale = typeof navigator !== 'undefined' ? (navigator.language || 'en-US') : 'en-US';
  const numberFmt = new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode, maximumFractionDigits: 0 });
  const formatPrice = (value: number) => numberFmt.format(value);
  const featuredProducts = products.filter(p => p.is_featured).slice(0, 4);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading store...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4 p-6 max-w-md">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <StoreIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold">Store Not Available</h2>
          <p className="text-muted-foreground">
            This store could not be loaded. Please check the URL and try again.
          </p>
          <Button onClick={() => navigate('/marketplace')}>
            Browse Marketplace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Store Header - template driven */}
      {template === 'supreme' || template === 'fullframe' ? (
        <div
          className="relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
        >
          {bannerUrl && (
            <div className="absolute inset-0">
              <img src={bannerUrl} alt="Store banner" className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          )}
          <div className={`relative container max-w-7xl mx-auto px-4 ${template==='fullframe'?'py-20':'py-14'}`}>
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6 text-white/90 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <div className={`${template==='fullframe'?'max-w-5xl':'max-w-3xl'}`}>
              <h1 className={`${template==='fullframe'?'text-6xl md:text-7xl':'text-4xl md:text-6xl'} font-bold tracking-tight text-white`}>
                {storeSettings.store_name || 'Store'}
              </h1>
              {storeSettings.store_description && (
                <p className={`${template==='fullframe'?'text-2xl md:text-3xl':'text-lg md:text-xl'} text-white/90 mt-3`}>{storeSettings.store_description}</p>
              )}
              <div className="flex gap-2 mt-5 text-white/90">
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  <Package className="w-3 h-3 mr-1" /> {products.length} Products
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  <Eye className="w-3 h-3 mr-1" /> {products.reduce((s, p) => s + p.views, 0)} Views
                </Badge>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
        >
          {bannerUrl && (
            <div className="absolute inset-0 opacity-30">
              <img src={bannerUrl} alt="Store banner" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-black/10 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.08),_transparent_60%)]" />
          </div>
          <div className="relative container max-w-7xl mx-auto px-4 py-12">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6 text-white/90 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <div className="flex items-start gap-6">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/20 text-white shadow-lg">
                <div className="w-16 h-16 bg-white/20 rounded-xl overflow-hidden flex items-center justify-center">
                  {storeSettings.store_logo ? (
                    <img src={storeSettings.store_logo} alt={storeSettings.store_name} className="w-full h-full object-cover" />
                  ) : (
                    <StoreIcon className="w-8 h-8 text-white/80" />
                  )}
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{storeSettings.store_name || 'Store'}</h1>
                  {storeSettings.store_description && (
                    <p className="text-white/85 text-sm md:text-base max-w-2xl mt-1">{storeSettings.store_description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-3 text-white/90">
                    <Badge variant="secondary" className="bg-white/20 text-white border-0">
                      <Package className="w-3 h-3 mr-1" /> {products.length} Products
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white border-0">
                      <Eye className="w-3 h-3 mr-1" /> {products.reduce((sum, p) => sum + p.views, 0)} Views
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="ml-auto flex gap-2">
                <Button variant="secondary" className="bg-white/15 text-white border-white/20 hover:bg-white/25">
                  <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
                <Button variant="secondary" className="bg-white/15 text-white border-white/20 hover:bg-white/25" onClick={() => navigate('/contact')}>
                  <ExternalLink className="w-4 h-4 mr-2" /> Contact
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && template !== 'maximize' && (
        <div className="bg-muted/30 border-b">
          <div className="container max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <h2 className="text-2xl font-bold">Featured Products</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => navigate(`/store/${storeSlug}/${product.slug}`)}
                  className="group bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-all text-left"
                >
                  <div className="relative aspect-square bg-muted">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-muted-foreground opacity-20" />
                      </div>
                    )}
                    <Badge className="absolute top-2 left-2 bg-yellow-500">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Featured
                    </Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold line-clamp-2 mb-2">{product.title}</h3>
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-bold" style={{ color: primaryColor }}>
                          {formatPrice(product.price)}
                        </span>
                        {product.original_price && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.original_price)}
                          </span>
                        )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Products Section */}
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Filters / Layout */}
        {products.length > 0 && template === 'maximize' ? (
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 mb-6">
            <div className="bg-card rounded-xl border p-4 h-max sticky top-20">
              <div className="space-y-4">
                <div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Categories</p>
                  <div className="space-y-2 max-h-64 overflow-auto pr-1">
                    <button onClick={() => setCategoryFilter('all')} className={`w-full text-left px-3 py-1.5 rounded-md border ${categoryFilter==='all'?'bg-primary text-primary-foreground border-primary':'hover:bg-muted'}`}>All</button>
                    {categories.map((cat) => (
                      <button key={cat} onClick={() => setCategoryFilter(cat)} className={`w-full text-left px-3 py-1.5 rounded-md border ${categoryFilter===cat?'bg-primary text-primary-foreground border-primary':'hover:bg-muted'}`}>{cat}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Sort</p>
                  <Select value={sortOption} onValueChange={(v: any) => setSortOption(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                      <SelectItem value="views-desc">Popularity</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm text-muted-foreground">{filteredProducts.length} results</h3>
              </div>
              <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`}>
                {filteredProducts.map((product) => {
                  const discount = product.original_price 
                    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
                    : 0;
                  return (
                    <Card key={product.id} className="group overflow-hidden rounded-lg border bg-card">
                      <div className={`relative aspect-square bg-muted`}>
                        <img
                          src={product.image_url || '/placeholder.png'}
                          alt={product.name}
                          className="absolute inset-0 w-full h-full object-cover"
                          loading="lazy"
                        />
                        {product.stock <= 0 && (
                          <span className="absolute left-2 top-2 z-10 text-[11px] px-2 py-0.5 rounded bg-black/70 text-white">Sold out</span>
                        )}
                        {discount > 0 && (
                          <span className="absolute right-2 top-2 z-10 text-[11px] px-2 py-0.5 rounded bg-rose-600 text-white">-{discount}%</span>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <div className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">{product.name}</div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="font-semibold">{formatPrice(product.price)}</span>
                          {product.original_price && (
                            <span className="text-muted-foreground line-through text-xs">{formatPrice(product.original_price)}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        ) : products.length > 0 ? (
          <div className="sticky top-16 z-10 mb-6">
            <div className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 rounded-xl border p-4 shadow-sm">
              <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {categories.length > 0 && (
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={sortOption} onValueChange={(v: any) => setSortOption(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="views-desc">Popularity</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
              </div>
            </div>
            {/* Category chips row */}
            {categories.length > 0 && (
              <div className="mt-3 overflow-x-auto">
                <div className="flex items-center gap-2 min-w-max">
                  <button
                    className={`px-3 py-1.5 rounded-full text-sm border transition ${categoryFilter === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}
                    onClick={() => setCategoryFilter('all')}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      className={`px-3 py-1.5 rounded-full text-sm border transition ${categoryFilter === cat ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}
                      onClick={() => setCategoryFilter(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Products Grid/List */}
        {products.length === 0 ? (
          <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-b from-muted/60 to-transparent py-20">
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative text-center">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="w-28 h-28 mx-auto bg-background/70 backdrop-blur rounded-2xl flex items-center justify-center border">
                  <Package className="w-12 h-12 text-muted-foreground" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-bold tracking-tight">No Products Yet</h3>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    This store is being stocked with amazing products. Check back soon or explore our marketplace!
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                  <Button 
                    onClick={() => navigate('/marketplace')}
                    size="lg"
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    <Package className="mr-2 h-5 w-5" />
                    Browse Marketplace
                  </Button>
                  <Button 
                    onClick={() => navigate('/contact')}
                    variant="outline"
                    size="lg"
                  >
                    Contact Store Owner
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-8">
                  <div className="p-4 bg-background/70 backdrop-blur rounded-xl border">
                    <div className="w-10 h-10 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-1">Quality Products</h4>
                    <p className="text-sm text-muted-foreground">Carefully selected items</p>
                  </div>
                  <div className="p-4 bg-background/70 backdrop-blur rounded-xl border">
                    <div className="w-10 h-10 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
                      <Truck className="w-5 h-5 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-1">Fast Delivery</h4>
                    <p className="text-sm text-muted-foreground">Quick shipping across Algeria</p>
                  </div>
                  <div className="p-4 bg-background/70 backdrop-blur rounded-xl border">
                    <div className="w-10 h-10 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-1">Secure Shopping</h4>
                    <p className="text-sm text-muted-foreground">Safe and protected transactions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-muted-foreground opacity-20 mb-4" />
            <p className="text-muted-foreground">No products found matching your criteria</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          template !== 'maximize' && (
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`}>
              {filteredProducts.map((product) => {
                const discount = product.original_price 
                  ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
                  : 0;

                return (
                  <button
                    key={product.id}
                    onClick={() => navigate(`/store/${storeSlug}/${product.slug}`)}
                    className="group bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60 rounded-2xl border overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all text-left ring-1 ring-transparent hover:ring-primary/10"
                  >
                    <div className={`relative aspect-[4/5] bg-muted`}>
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-muted-foreground opacity-20" />
                        </div>
                      )}
                      {/* Hover Quick View overlay */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-x-0 bottom-3 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="secondary" className="pointer-events-auto bg-white/90 text-foreground hover:bg-white">
                          View
                        </Button>
                      </div>
                      {discount > 0 && (
                        <Badge className="absolute top-2 right-2 bg-red-500">
                          -{discount}%
                        </Badge>
                      )}
                      {product.stock_quantity === 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Badge variant="secondary">Sold Out</Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <div>
                        <h3 className="font-semibold tracking-tight line-clamp-2">{product.title}</h3>
                        {product.category && (
                          <p className="text-xs text-muted-foreground mt-1">{product.category}</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <span className="text-xl font-bold" style={{ color: primaryColor }}>
                            {formatPrice(Number(product.price))}
                          </span>
                          {product.original_price && (
                            <span className="text-sm text-muted-foreground line-through ml-2">
                              {formatPrice(Number(product.original_price))}
                            </span>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                          View
                        </Button>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => {
              const discount = product.original_price 
                ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
                : 0;

              return (
                <button
                  key={product.id}
                  onClick={() => navigate(`/store/${storeSlug}/${product.slug}`)}
                  className="w-full group bg-card rounded-2xl border p-4 hover:shadow-xl transition-all text-left ring-1 ring-transparent hover:ring-primary/10"
                >
                  <div className="flex gap-4">
                    <div className="w-32 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-muted-foreground opacity-20" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-1">{product.title}</h3>
                          {product.category && (
                            <Badge variant="secondary" className="text-xs">
                              {product.category}
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold" style={{ color: primaryColor }}>
                            {formatPrice(Number(product.price))}
                          </div>
                          {product.original_price && (
                            <div className="text-sm text-muted-foreground line-through">
                              {formatPrice(Number(product.original_price))}
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-muted-foreground line-clamp-2 mb-3">
                        {product.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          {product.views} views
                        </Badge>
                        {discount > 0 && (
                          <Badge className="bg-red-500 text-xs">
                            Save {discount}%
                          </Badge>
                        )}
                        {product.stock_quantity === 0 && (
                          <Badge variant="secondary">Out of Stock</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Store Footer */}
      <div className="border-t bg-muted/30 mt-12">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Powered by {storeSettings.store_name || 'EcoPro'}
          </p>
          <Button variant="outline" size="sm" onClick={() => navigate('/marketplace')}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Explore More Stores
          </Button>
        </div>
      </div>
    </div>
  );
}
