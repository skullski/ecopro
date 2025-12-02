import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, Grid, List
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { RenderStorefront } from './storefront/templates';

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
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18"/></svg>
          </div>
          <h2 className="text-2xl font-bold">Store Not Available</h2>
          <p className="text-muted-foreground">This store could not be loaded. Please check the URL and try again.</p>
          <a href="/marketplace" className="px-4 py-2 border rounded-md">Browse Marketplace</a>
        </div>
      </div>
    );
  }

  return RenderStorefront(template as any, {
    storeSlug: storeSlug!,
    products,
    filtered: filteredProducts,
    settings: storeSettings,
    categories,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    sortOption,
    setSortOption,
    viewMode,
    setViewMode,
    formatPrice: (n: number) => formatPrice(n),
    primaryColor,
    secondaryColor,
    bannerUrl: bannerUrl || null,
    navigate: (to: any) => navigate(to),
  });
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
