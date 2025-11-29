import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Search, Grid, List, ShoppingCart, Star, Eye, 
  Package, Filter, ArrowLeft, Store as StoreIcon,
  Heart, Share2, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
}

export default function Storefront() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<StoreProduct[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({});
  const [categories, setCategories] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadStore();
  }, [clientId]);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, categoryFilter]);

  const loadStore = async () => {
    try {
      const [productsRes, settingsRes] = await Promise.all([
        fetch(`/api/storefront/${clientId}/products`),
        fetch(`/api/storefront/${clientId}/settings`)
      ]);

      if (!productsRes.ok) {
        throw new Error('Store not found');
      }
      
      const productsData = await productsRes.json();
      const settingsData = settingsRes.ok ? await settingsRes.json() : {};

      setProducts(productsData);
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

    setFilteredProducts(filtered);
  };

  const primaryColor = storeSettings.primary_color || '#3b82f6';
  const secondaryColor = storeSettings.secondary_color || '#8b5cf6';
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
      {/* Store Header */}
      <div 
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
        }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-6 text-white/90 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-start gap-6">
            {storeSettings.store_logo && (
              <div className="w-24 h-24 bg-white rounded-xl shadow-lg overflow-hidden flex-shrink-0">
                <img 
                  src={storeSettings.store_logo} 
                  alt={storeSettings.store_name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">
                {storeSettings.store_name || 'Store'}
              </h1>
              {storeSettings.store_description && (
                <p className="text-white/90 text-lg max-w-2xl">
                  {storeSettings.store_description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-4 text-white/80">
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  <Package className="w-3 h-3 mr-1" />
                  {products.length} Products
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  <Eye className="w-3 h-3 mr-1" />
                  {products.reduce((sum, p) => sum + p.views, 0)} Views
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <div className="bg-muted/30 border-b">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <h2 className="text-2xl font-bold">Featured Products</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => navigate(`/store/${clientId}/${product.slug}`)}
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
                        ${product.price}
                      </span>
                      {product.original_price && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.original_price}
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
      <div className="container mx-auto px-4 py-8">
        {/* Filters - only show if there are products */}
        {products.length > 0 && (
          <div className="bg-card rounded-xl border p-4 mb-6">
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
        )}

        {/* Products Grid/List */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mb-6">
                <Package className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Store Opening Soon!</h3>
              <p className="text-muted-foreground mb-6">
                This store is currently being set up. New products will be available soon. 
                Check back later or explore other stores on our marketplace.
              </p>
              <Button 
                onClick={() => navigate('/marketplace')}
                className="bg-gradient-to-r from-primary to-accent"
              >
                Browse Marketplace
              </Button>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const discount = product.original_price 
                ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
                : 0;

              return (
                <button
                  key={product.id}
                  onClick={() => navigate(`/store/${clientId}/${product.slug}`)}
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
                    {discount > 0 && (
                      <Badge className="absolute top-2 right-2 bg-red-500">
                        -{discount}%
                      </Badge>
                    )}
                    {product.stock_quantity === 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Badge variant="secondary">Out of Stock</Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <div>
                      {product.category && (
                        <Badge variant="secondary" className="text-xs mb-2">
                          {product.category}
                        </Badge>
                      )}
                      <h3 className="font-semibold line-clamp-2">{product.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {product.description || 'No description'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <span className="text-xl font-bold" style={{ color: primaryColor }}>
                          ${product.price}
                        </span>
                        {product.original_price && (
                          <span className="text-sm text-muted-foreground line-through ml-2">
                            ${product.original_price}
                          </span>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        {product.views}
                      </Badge>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => {
              const discount = product.original_price 
                ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
                : 0;

              return (
                <button
                  key={product.id}
                  onClick={() => navigate(`/store/${clientId}/${product.slug}`)}
                  className="w-full group bg-card rounded-xl border p-4 hover:shadow-lg transition-all text-left"
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
                            ${product.price}
                          </div>
                          {product.original_price && (
                            <div className="text-sm text-muted-foreground line-through">
                              ${product.original_price}
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
