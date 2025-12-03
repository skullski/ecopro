import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, Grid, List
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/i18n';
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
  const { t } = useTranslation();
  // Support both new (:storeSlug) and legacy (:clientId) route params
  const params = useParams();
  const storeSlug = (params as any).storeSlug || (params as any).clientId;
  const navigate = useNavigate();
  const location = useLocation();
  
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<StoreProduct[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    template: 'classic',
    primary_color: '#16a34a',
    secondary_color: '#0ea5e9',
    currency_code: 'USD',
    store_name: '',
    store_description: '',
    store_logo: '',
    banner_url: ''
  });
  const [categories, setCategories] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sorting option for templates that support sorting
  const [sortOption, setSortOption] = useState<'newest' | 'price-asc' | 'price-desc' | 'featured' | 'views-desc'>('newest');

  // Derived visual tokens from store settings
  const template = storeSettings.template || 'classic';
  const primaryColor = storeSettings.primary_color || '#16a34a';
  const secondaryColor = storeSettings.secondary_color || '#0ea5e9';
  const bannerUrl = storeSettings.banner_url || '';

  // Price formatter based on store currency
  const formatPrice = (n: number) => {
    const code = storeSettings.currency_code || 'USD';
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: code }).format(n);
    } catch {
      return `$${n.toFixed(2)}`;
    }
  };

  // Recompute filtered products when query/category/sort changes
  useEffect(() => {
    let next = [...products];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      next = next.filter(p => (
        p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
      ));
    }
    if (categoryFilter && categoryFilter !== 'all') {
      next = next.filter(p => p.category === categoryFilter);
    }
    switch (sortOption) {
      case 'price-asc':
        next.sort((a,b) => Number(a.price) - Number(b.price));
        break;
      case 'price-desc':
        next.sort((a,b) => Number(b.price) - Number(a.price));
        break;
      case 'featured':
        next.sort((a,b) => Number(b.is_featured) - Number(a.is_featured));
        break;
      case 'views-desc':
        next.sort((a,b) => Number(b.views) - Number(a.views));
        break;
      case 'newest':
      default:
        // Assume server returns newest first; keep order
        break;
    }
    setFilteredProducts(next);
  }, [products, searchQuery, categoryFilter, sortOption]);

  // Fetch store settings and products by slug (with timeout guard)
  useEffect(() => {
    let isMounted = true;
    async function fetchAll() {
      if (!storeSlug) {
        if (isMounted) {
          setError('Missing store slug');
          setLoading(false);
        }
        return;
      }
      try {
        setLoading(true);
        setError('');
        // Race with a timeout to avoid infinite spinner
        const timeout = new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('Request timed out')), 9000));
        const [settingsRes, productsRes] = await Promise.all([
          Promise.race([fetch(`/api/storefront/${storeSlug}/settings`), timeout]) as Promise<Response>,
          Promise.race([fetch(`/api/storefront/${storeSlug}/products`), timeout]) as Promise<Response>,
        ]);
        if (!settingsRes.ok || !productsRes.ok) {
          throw new Error('Failed to load store');
        }
        const settingsData = await settingsRes.json();
        const productsData = await productsRes.json();
        if (!isMounted) return;
        const incomingSettings = settingsData?.settings || settingsData || {};
        setStoreSettings((prev) => ({
          primary_color: '#16a34a',
          secondary_color: '#0ea5e9',
          currency_code: 'USD',
          store_name: '',
          store_description: '',
          store_logo: '',
          banner_url: '',
          ...prev,
          ...incomingSettings,
          // Force private stores to Mercury theme regardless of incoming template
          template: 'mercury',
        }));
        const items = productsData?.products || productsData || [];
        setProducts(items);
        const cats = Array.from(new Set(items.map((p: any) => p.category).filter(Boolean))) as string[];
        setCategories(cats.length ? ['all', ...cats] : ['all']);
        setLoading(false);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message || 'Store Not Available');
        setLoading(false);
      }
    }
    fetchAll();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeSlug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('storefront.loading')}</p>
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
          <h2 className="text-2xl font-bold">{t('storefront.notAvailable')}</h2>
          <p className="text-muted-foreground">{t('storefront.notAvailableDesc')}</p>
          <a href="/marketplace" className="px-4 py-2 border rounded-md">{t('storefront.browseMarketplace')}</a>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Active template badge for quick visibility */}
      <div className="fixed top-20 right-4 z-40">
        <div className="inline-flex items-center gap-2 rounded-full border bg-card/80 backdrop-blur px-3 py-1 text-xs shadow-sm">
          <span className="font-semibold">{t('storefront.template')}:</span>
          <span className="font-mono">{template}</span>
        </div>
        {/* Removed Roles box per request */}
      </div>
      {RenderStorefront(template as any, {
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
        // Public storefront: do not show management controls
        canManage: false,
      })}
    </>
  );
}