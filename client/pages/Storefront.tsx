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
}
