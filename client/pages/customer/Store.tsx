import { useState, useEffect } from 'react';
import { 
  Plus, Search, Eye, Copy, ExternalLink, Edit, Trash2, 
  Star, Package, DollarSign, Image as ImageIcon, Settings,
  Link as LinkIcon, Check, Share2, Grid, List, Store as StoreIcon, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface StoreProduct {
  id: number;
  title: string;
  description?: string;
  price: number;
  original_price?: number;
  images?: string[];
  category?: string;
  stock_quantity: number;
  status: 'active' | 'draft' | 'archived';
  is_featured: boolean;
  slug: string;
  views: number;
  created_at: string;
}

export default function Store() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<StoreProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [storeSettings, setStoreSettings] = useState<any>({});
  const [savingSettings, setSavingSettings] = useState(false);
  const [showSavedOverlay, setShowSavedOverlay] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingHeroTile1, setUploadingHeroTile1] = useState(false);
  const [uploadingHeroTile2, setUploadingHeroTile2] = useState(false);
  const [statsServer, setStatsServer] = useState<{total_products:number;active_products:number;draft_products:number;total_views:number}|null>(null);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  // Store settings (simplified) for logo & banner image uploads and currency
  const [showStoreSettingsModal, setShowStoreSettingsModal] = useState(false);
  
  // Selected product
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [shareLink, setShareLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [storeLinkCopied, setStoreLinkCopied] = useState(false);

  // Public-facing slug used for storefront URLs
  const storeSlug = storeSettings.store_slug;

  const [formData, setFormData] = useState<Partial<StoreProduct>>({
    status: 'active',
    is_featured: false,
    stock_quantity: 0,
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProducts();
    loadStoreSettings();
    loadStats();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, statusFilter]);

  // Fallback: if settings loaded without slug but we have products,
  // derive store_slug via a product share-link response (which includes store_slug)
  useEffect(() => {
    const deriveSlug = async () => {
      if (storeSettings?.store_slug || products.length === 0) return;
      try {
        const token = localStorage.getItem('authToken');
        const first = products[0];
        const res = await fetch(`/api/client/store/products/${first.id}/share-link`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.store_slug) {
            setStoreSettings((s: any) => ({ ...s, store_slug: data.store_slug }));
          }
        }
      } catch (e) {
        // Non-fatal
        console.error('Fallback derive store slug failed', e);
      }
    };
    deriveSlug();
  }, [products, storeSettings?.store_slug]);

  const loadProducts = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      const res = await fetch('/api/client/store/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        console.error('Failed to fetch products:', res.status);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStoreSettings = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/client/store/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStoreSettings(data || {});
      }
    } catch (e) {
      console.error('Failed to load store settings', e);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/client/store/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStatsServer(data);
      }
    } catch (e) {
      // Non-fatal
      console.error('Failed to load stats', e);
    }
  };

  const saveStoreSettings = async () => {
    try {
      setSavingSettings(true);
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/client/store/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          store_name: storeSettings.store_name || null,
          store_description: storeSettings.store_description || null,
          store_logo: storeSettings.store_logo || null,
          banner_url: storeSettings.banner_url || null,
          hero_tile1_url: storeSettings.hero_tile1_url || null,
          hero_tile2_url: storeSettings.hero_tile2_url || null,
          // Keep payload minimal: only name, logo, banner
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      const data = await res.json();
      setStoreSettings(data);
      setShowSavedOverlay(true);
      setTimeout(() => setShowSavedOverlay(false), 1600);
    } catch (e) {
      console.error('Failed to save store settings', e);
    } finally {
      setSavingSettings(false);
    }
  };

  // Save only provided updates, merging with existing minimal fields
  const saveSettingsPartial = async (updates: Record<string, any>) => {
    try {
      const token = localStorage.getItem('authToken');
      const payload = {
        store_name: storeSettings.store_name || null,
        store_description: storeSettings.store_description || null,
        store_logo: storeSettings.store_logo || null,
        banner_url: storeSettings.banner_url || null,
        hero_tile1_url: storeSettings.hero_tile1_url || null,
        hero_tile2_url: storeSettings.hero_tile2_url || null,
        ...updates,
      };
      const res = await fetch('/api/client/store/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Save failed');
      const data = await res.json();
      setStoreSettings(data);
      setShowSavedOverlay(true);
      setTimeout(() => setShowSavedOverlay(false), 1600);
    } catch (e) {
      console.error('Failed to save store settings (partial)', e);
    }
  };

  // Helpers to manage comma-separated slideshow lists
  const splitList = (val?: string) => {
    const arr = (val || '').split(',').map(s=>s.trim()).filter(Boolean);
    const seen = new Set<string>();
    return arr.filter(u => {
      const key = u.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };
  const joinList = (arr: string[]) => arr.join(',');
  const removeFromList = async (field: 'banner_url'|'hero_tile1_url'|'hero_tile2_url', url: string) => {
    const current = splitList(storeSettings[field]);
    const next = current.filter(u => u !== url);
    const payload: any = {};
    payload[field] = joinList(next);
    await saveSettingsPartial(payload);
  };

  const handleHeroTile1Upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setUploadingHeroTile1(true);
      const token = localStorage.getItem('authToken');
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch('/api/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        urls.push(data.url);
      }
      const prev = (storeSettings.hero_tile1_url || '').split(',').map((s:string)=>s.trim()).filter(Boolean);
      const combined = [...prev, ...urls].join(',');
      setStoreSettings((s: any) => ({ ...s, hero_tile1_url: combined }));
      await saveSettingsPartial({ hero_tile1_url: combined });
    } catch (error) {
      console.error('Failed to upload hero tile 1:', error);
      alert('Failed to upload image(s). Please try again.');
    } finally {
      setUploadingHeroTile1(false);
      e.target.value = '';
    }
  };

  const handleHeroTile2Upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setUploadingHeroTile2(true);
      const token = localStorage.getItem('authToken');
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch('/api/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        urls.push(data.url);
      }
      const prev = (storeSettings.hero_tile2_url || '').split(',').map((s:string)=>s.trim()).filter(Boolean);
      const combined = [...prev, ...urls].join(',');
      setStoreSettings((s: any) => ({ ...s, hero_tile2_url: combined }));
      await saveSettingsPartial({ hero_tile2_url: combined });
    } catch (error) {
      console.error('Failed to upload hero tile 2:', error);
      alert('Failed to upload image(s). Please try again.');
    } finally {
      setUploadingHeroTile2(false);
      e.target.value = '';
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setStoreSettings((s: any) => ({ ...s, store_logo: data.url }));
      await saveSettingsPartial({ store_logo: data.url });
    } catch (error) {
      console.error('Failed to upload logo:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingBanner(true);
      const token = localStorage.getItem('authToken');
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch('/api/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        urls.push(data.url);
      }
      const prev = (storeSettings.banner_url || '').split(',').map((s:string)=>s.trim()).filter(Boolean);
      const combined = [...prev, ...urls].join(',');
      setStoreSettings((s: any) => ({ ...s, banner_url: combined }));
      await saveSettingsPartial({ banner_url: combined });
    } catch (error) {
      console.error('Failed to upload banner:', error);
      alert('Failed to upload image(s). Please try again.');
    } finally {
      setUploadingBanner(false);
      e.target.value = '';
    }
  };

  // Removed hero image uploads for a simpler settings experience

  // Removed template gallery; keeping settings minimal per request

  const filterProducts = () => {
    let filtered = [...products];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    setFilteredProducts(filtered);
  };

  const handleCreateProduct = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/client/store/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        await loadProducts();
        setShowAddModal(false);
        setFormData({ status: 'active', is_featured: false, stock_quantity: 0 });
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create product');
      }
    } catch (error) {
      console.error('Create product error:', error);
      alert('Failed to create product');
    }
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/client/store/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        await loadProducts();
        setShowEditModal(false);
        setSelectedProduct(null);
        setFormData({ status: 'active', is_featured: false, stock_quantity: 0 });
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to update product');
      }
    } catch (error) {
      console.error('Update product error:', error);
      alert('Failed to update product');
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/client/store/products/${selectedProduct.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        await loadProducts();
        setShowDeleteDialog(false);
        setSelectedProduct(null);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Delete product error:', error);
      alert('Failed to delete product');
    }
  };

  const handleGetShareLink = async (product: StoreProduct) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/client/store/products/${product.id}/share-link`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setShareLink(data.shareLink);
        setSelectedProduct(product);
        setShowShareModal(true);
        setLinkCopied(false);
      }
    } catch (error) {
      console.error('Get share link error:', error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const copyStoreLink = () => {
    const storeUrl = `${window.location.origin}/store/${storeSlug}`;
    navigator.clipboard.writeText(storeUrl);
    setStoreLinkCopied(true);
    setTimeout(() => setStoreLinkCopied(false), 2000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be less than 2MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        const fullUrl = `${window.location.origin}${data.url}`;
        setFormData(prev => ({ ...prev, images: [fullUrl] }));
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const openEditModal = (product: StoreProduct) => {
    setSelectedProduct(product);
    setFormData(product);
    setShowEditModal(true);
  };

  const openDeleteDialog = (product: StoreProduct) => {
    setSelectedProduct(product);
    setShowDeleteDialog(true);
  };

  const stats = statsServer ? {
    total: statsServer.total_products,
    active: statsServer.active_products,
    draft: statsServer.draft_products,
    totalViews: statsServer.total_views,
  } : {
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    draft: products.filter(p => p.status === 'draft').length,
    totalViews: products.reduce((sum, p) => sum + p.views, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Private Store
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your exclusive products and share individual links
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={() => {
                if (storeSlug) {
                  window.open(`/store/${storeSlug}`, '_blank');
                }
              }}
              disabled={!storeSlug}
            >
              <StoreIcon className="w-4 h-4 mr-2" />
              View Storefront
            </Button>
            <Button 
              onClick={() => {
                setFormData({ status: 'active', is_featured: false, stock_quantity: 0 });
                setShowAddModal(true);
              }}
              className="bg-gradient-to-r from-primary to-purple-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowStoreSettingsModal(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Store Images
            </Button>
          </div>
        </div>

        {/* Store Link Quick Access */}
        {storeSettings.store_slug && (
          <div className="bg-card border rounded-xl p-4 flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[240px]">
              <p className="text-sm font-medium mb-1">Public Storefront URL</p>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={`${window.location.origin}/store/${storeSettings.store_slug}`}
                  className="font-mono text-xs"
                />
                <Button size="sm" variant="outline" onClick={copyStoreLink}>
                  {storeLinkCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button size="sm" variant="outline" onClick={() => window.open(`/store/${storeSettings.store_slug}`, '_blank')}>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
              {storeLinkCopied && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><Check className="w-3 h-3" />Copied!</p>}
            </div>
            <div className="text-xs text-muted-foreground max-w-md">
              Share this link with customers to let them browse all your products. Individual product share links remain private.
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Products</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <Package className="w-10 h-10 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Active</p>
                <p className="text-3xl font-bold mt-1">{stats.active}</p>
              </div>
              <Check className="w-10 h-10 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Drafts</p>
                <p className="text-3xl font-bold mt-1">{stats.draft}</p>
              </div>
              <Edit className="w-10 h-10 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Views</p>
                <p className="text-3xl font-bold mt-1">{stats.totalViews}</p>
              </div>
              <Eye className="w-10 h-10 opacity-80" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl border p-4">
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
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

        {/* Products Grid/List */}
        {filteredProducts.length === 0 ? (
          <div className="bg-card rounded-xl border p-12 text-center">
            <Package className="w-16 h-16 mx-auto text-muted-foreground opacity-20 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first product to start building your private store
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Product
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-all"
              >
                {/* Image */}
                <div className="relative aspect-square bg-muted">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-muted-foreground opacity-20" />
                    </div>
                  )}
                  {product.is_featured && (
                    <Badge className="absolute top-2 left-2 bg-yellow-500">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  <Badge className="absolute top-2 right-2" variant={
                    product.status === 'active' ? 'default' :
                    product.status === 'draft' ? 'secondary' : 'outline'
                  }>
                    {product.status}
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold line-clamp-2 mb-1">{product.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description || 'No description'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-primary">
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

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleGetShareLink(product)}
                    >
                      <Share2 className="w-3 h-3 mr-1" />
                      Share
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(product)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDeleteDialog(product)}
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-xl border divide-y">
            {filteredProducts.map((product) => (
              <div key={product.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-muted-foreground opacity-20" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{product.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {product.description || 'No description'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          product.status === 'active' ? 'default' :
                          product.status === 'draft' ? 'secondary' : 'outline'
                        }>
                          {product.status}
                        </Badge>
                        {product.is_featured && (
                          <Badge className="bg-yellow-500">
                            <Star className="w-3 h-3" />
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-lg font-bold text-primary">
                        ${product.price}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        {product.views} views
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Stock: {product.stock_quantity}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleGetShareLink(product)}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(product)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDeleteDialog(product)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      <Dialog open={showAddModal || showEditModal} onOpenChange={(open) => {
        if (!open) {
          setShowAddModal(false);
          setShowEditModal(false);
          setFormData({ status: 'active', is_featured: false, stock_quantity: 0 });
          setSelectedProduct(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{showAddModal ? 'Add New Product' : 'Edit Product'}</DialogTitle>
            <DialogDescription>
              {showAddModal ? 'Create a new product for your private store' : 'Update product information'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Product Title *</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter product name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product description"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="original_price">Original Price</Label>
                <Input
                  id="original_price"
                  type="number"
                  step="0.01"
                  value={formData.original_price || ''}
                  onChange={(e) => setFormData({ ...formData, original_price: parseFloat(e.target.value) || undefined })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Electronics"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Stock Quantity</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  value={formData.stock_quantity || 0}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status || 'active'}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Featured Product</Label>
                <div className="flex items-center space-x-2 h-10">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured || false}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="is_featured" className="text-sm">
                    Mark as featured
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Product Image</Label>
              <div className="space-y-3">
                {formData.images?.[0] && (
                  <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                    <img
                      src={formData.images[0]}
                      alt="Product preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => setFormData({ ...formData, images: [] })}
                    >
                      Remove
                    </Button>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="cursor-pointer"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploading}
                      onClick={() => document.getElementById('image-upload')?.click()}
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Or paste image URL below (2MB max)
                  </p>
                  <Input
                    id="images"
                    value={formData.images?.[0] || ''}
                    onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddModal(false);
              setShowEditModal(false);
              setFormData({ status: 'active', is_featured: false, stock_quantity: 0 });
            }}>
              Cancel
            </Button>
            <Button onClick={showAddModal ? handleCreateProduct : handleUpdateProduct}>
              {showAddModal ? 'Create Product' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Link Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Product Link</DialogTitle>
            <DialogDescription>
              Copy this link to share {selectedProduct?.title} anywhere
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Input
                value={shareLink}
                readOnly
                className="font-mono text-sm"
              />
              <Button onClick={copyToClipboard} variant="outline">
                {linkCopied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            {linkCopied && (
              <p className="text-sm text-green-600 flex items-center gap-2">
                <Check className="w-4 h-4" />
                Link copied to clipboard!
              </p>
            )}

            <div className="bg-muted rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">💡 Tip:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Share this link on social media, email, or messaging apps</li>
                <li>The product remains private - only people with this link can view it</li>
                <li>Track views in your dashboard</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareModal(false)}>
              Close
            </Button>
            <Button onClick={() => window.open(shareLink, '_blank')}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedProduct?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Store Settings Modal (simplified for images & currency) */}
      <Dialog open={showStoreSettingsModal} onOpenChange={setShowStoreSettingsModal}>
        <DialogContent className="max-w-2xl bg-muted">
          <DialogHeader>
            <DialogTitle>Store Settings</DialogTitle>
            <DialogDescription>
              Set your store name and upload logo/banner.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Store Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Store Name</Label>
              <Input
                placeholder="Your Store Name"
                value={storeSettings.store_name || ''}
                onChange={(e) => setStoreSettings((s: any) => ({ ...s, store_name: e.target.value }))}
              />
            </div>

            {/* Store Logo */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Store Logo URL</Label>
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="https://example.com/logo.png"
                  value={storeSettings.store_logo || ''}
                  onChange={(e) => setStoreSettings((s: any) => ({ ...s, store_logo: e.target.value }))}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploadingLogo}
                  onClick={() => document.getElementById('logo-upload')?.click()}
                >
                  {uploadingLogo ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-muted-foreground">Paste a URL or upload an image.</p>
            </div>

            {/* Banner Image */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Banner Image URL</Label>
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="https://example.com/banner.jpg"
                  value={storeSettings.banner_url || ''}
                  onChange={(e) => setStoreSettings((s: any) => ({ ...s, banner_url: e.target.value }))}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploadingBanner}
                  onClick={() => document.getElementById('banner-upload')?.click()}
                >
                  {uploadingBanner ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => saveSettingsPartial({ banner_url: '' })}
                >
                  Clear
                </Button>
                <input
                  id="banner-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleBannerUpload}
                  className="hidden"
                />
              </div>
              {/* Existing banner slideshow items */}
              {splitList(storeSettings.banner_url).length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {splitList(storeSettings.banner_url).map((u: string, idx: number) => (
                    <div key={idx} className="relative rounded-md overflow-hidden border">
                      <img src={u} alt={`Banner ${idx+1}`} className="w-full h-20 object-cover" />
                      <Button size="xs" variant="destructive" className="absolute top-1 right-1" onClick={() => removeFromList('banner_url', u)}>Remove</Button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">Displayed behind the hero section.</p>
            </div>

            {/* Hero Tiles (optional) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Right Tile 1 URL</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="https://example.com/tile-1.jpg"
                    value={storeSettings.hero_tile1_url || ''}
                    onChange={(e) => setStoreSettings((s: any) => ({ ...s, hero_tile1_url: e.target.value }))}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" disabled={uploadingHeroTile1} onClick={() => document.getElementById('hero-tile1-upload')?.click()}>
                    {uploadingHeroTile1 ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Upload
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="destructive" onClick={() => saveSettingsPartial({ hero_tile1_url: '' })}>Clear</Button>
                  <input id="hero-tile1-upload" type="file" accept="image/*" multiple onChange={handleHeroTile1Upload} className="hidden" />
                </div>
                {/* Existing Tile 1 slideshow items */}
                {splitList(storeSettings.hero_tile1_url).length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {splitList(storeSettings.hero_tile1_url).map((u: string, idx: number) => (
                      <div key={idx} className="relative rounded-md overflow-hidden border">
                        <img src={u} alt={`Tile 1 - ${idx+1}`} className="w-full h-20 object-cover" />
                        <Button size="xs" variant="destructive" className="absolute top-1 right-1" onClick={() => removeFromList('hero_tile1_url', u)}>Remove</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Right Tile 2 URL</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="https://example.com/tile-2.jpg"
                    value={storeSettings.hero_tile2_url || ''}
                    onChange={(e) => setStoreSettings((s: any) => ({ ...s, hero_tile2_url: e.target.value }))}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" disabled={uploadingHeroTile2} onClick={() => document.getElementById('hero-tile2-upload')?.click()}>
                    {uploadingHeroTile2 ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Upload
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="destructive" onClick={() => saveSettingsPartial({ hero_tile2_url: '' })}>Clear</Button>
                  <input id="hero-tile2-upload" type="file" accept="image/*" multiple onChange={handleHeroTile2Upload} className="hidden" />
                </div>
                {/* Existing Tile 2 slideshow items */}
                {splitList(storeSettings.hero_tile2_url).length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {splitList(storeSettings.hero_tile2_url).map((u: string, idx: number) => (
                      <div key={idx} className="relative rounded-md overflow-hidden border">
                        <img src={u} alt={`Tile 2 - ${idx+1}`} className="w-full h-20 object-cover" />
                        <Button size="xs" variant="destructive" className="absolute top-1 right-1" onClick={() => removeFromList('hero_tile2_url', u)}>Remove</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStoreSettingsModal(false)}>
              Close
            </Button>
            <Button onClick={saveStoreSettings} disabled={savingSettings}>
              {savingSettings ? 'Saving...' : 'Save Settings'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Center-screen success overlay */}
      {showSavedOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-card border rounded-xl shadow-lg px-6 py-4 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <span className="font-medium">Settings saved</span>
          </div>
        </div>
      )}
    </div>
  );
}
