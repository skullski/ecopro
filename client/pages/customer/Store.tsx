import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Eye, Copy, ExternalLink, Edit, Trash2, 
  Star, Package, DollarSign, Image as ImageIcon, Settings,
  Link as LinkIcon, Check, Share2, Grid, List, Store as StoreIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TemplatesTab } from '@/components/TemplatesTab';
import { generateStoreUrl } from '@/utils/storeUrl';
import { useTranslation } from '@/lib/i18n';
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
  name?: string; // From inventory API
  description?: string;
  price: number;
  unit_price?: number; // From inventory API
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
  const navigate = useNavigate();
  const { t } = useTranslation();
  // Products Management was duplicated with Overview; keep a single Store page.

  const getStorefrontPath = (settings: any) => {
    const name = settings?.store_name;
    if (name) return generateStoreUrl(name, false);
    const slug = settings?.store_slug;
    if (slug) return `/store/${slug}`;
    return '';
  };

  const getStorefrontFullUrl = (settings: any) => {
    const p = getStorefrontPath(settings);
    if (!p) return '';
    return `${window.location.origin}${p}`;
  };

  // Copy store link to clipboard
  // This must be above all JSX usage
  let storeSettingsRef: any = null;
  let setStoreLinkCopiedRef: any = null;
  const copyStoreLink = () => {
    const storeUrl = getStorefrontFullUrl(storeSettingsRef);
    if (!storeUrl) return;
    navigator.clipboard.writeText(storeUrl);
    setStoreLinkCopiedRef(true);
    setTimeout(() => setStoreLinkCopiedRef(false), 2000);
  };

  // Fetch store settings and products on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data in PARALLEL for faster loading
        const [settingsRes, productsRes, inventoryRes] = await Promise.all([
          fetch('/api/client/store/settings'),
          fetch('/api/client/store/products'),
          fetch('/api/client/stock'),
        ]);
        
        // Process settings
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setStoreSettings(settingsData);
        }
        
        // Process products
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData);
          setFilteredProducts(productsData);
        }
        
        // Process inventory
        if (inventoryRes.ok) {
          const inventoryData = await inventoryRes.json();
          setInventoryProducts(inventoryData);
        }
      } catch (err) {
        console.error('Failed to fetch store data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  // Product action states
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [uploading, setUploading] = useState(false);

          // Product action handlers
          // Helper to reload products
          const reloadProducts = async () => {
            try {
              const productsRes = await fetch('/api/client/store/products');
              if (productsRes.ok) {
                const productsData = await productsRes.json();
                setProducts(productsData);
                setFilteredProducts(productsData);
              }
            } catch (err) {
              console.error('Failed to reload products', err);
            }
          };

          const handleCreateProduct = async () => {
            try {
              const res = await fetch('/api/client/store/products', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
              });
              if (res.ok) {
                // reload products
                await reloadProducts();
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
              const res = await fetch(`/api/client/store/products/${selectedProduct.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
              });
              if (res.ok) {
                // reload products
                await reloadProducts();
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
              const res = await fetch(`/api/client/store/products/${selectedProduct.id}`, {
                method: 'DELETE',
              });
              if (res.ok) {
                // reload products
                await reloadProducts();
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
              const res = await fetch(`/api/client/store/products/${product.id}/share-link`);
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
  // Product form state
  const [formData, setFormData] = useState<Partial<StoreProduct>>({
    status: 'active',
    is_featured: false,
    stock_quantity: 0,
  });
  // Product modal state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  // Product logic
  const [savingSettings, setSavingSettings] = useState(false);
  const [statsServer, setStatsServer] = useState<{total_products:number;active_products:number;draft_products:number;total_views:number}|null>(null);
  // Handler for saving store settings
  const saveStoreSettings = async () => {
          try {
            setSavingSettings(true);
            const res = await fetch('/api/client/store/settings', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
                body: JSON.stringify({
                  store_name: storeSettings.store_name || null,
                  // Prefer explicit owner_name/owner_email fields. These are per-client and scoped to your account.
                  owner_name: storeSettings.owner_name || storeSettings.seller_name || null,
                  owner_email: storeSettings.owner_email || storeSettings.seller_email || null,
                  // Keep seller_* for backward compatibility but server will scope updates to your account only
                  seller_name: storeSettings.seller_name || null,
                  seller_email: storeSettings.seller_email || null,
                  store_description: storeSettings.store_description || null,
                  store_logo: storeSettings.store_logo || null,
                  template: storeSettings.template || 'pro',
                  banner_url: storeSettings.banner_url || null,
                  // hero_main_url removed
                  hero_tile1_url: storeSettings.hero_tile1_url || null,
                  hero_tile2_url: storeSettings.hero_tile2_url || null,
                  currency_code: storeSettings.currency_code || 'DZD',
                  // Template customization settings
                  template_hero_heading: storeSettings.template_hero_heading || null,
                  template_hero_subtitle: storeSettings.template_hero_subtitle || null,
                  template_button_text: storeSettings.template_button_text || null,
                  template_accent_color: storeSettings.template_accent_color || null,
                }),
            });
            if (!res.ok) {
              // try to surface server error message
              const err = await res.json().catch(() => ({}));
              const errorMsg = err.details ? `${err.error}: ${err.details}` : (err.error || 'Save failed');
              throw new Error(errorMsg);
            }
            // Server may return the updated row; still re-fetch to ensure canonical persisted state
            const saved = await res.json().catch(() => null);
            try {
              const settingsRes = await fetch('/api/client/store/settings', {
              });
              if (settingsRes.ok) {
                const fresh = await settingsRes.json();
                setStoreSettings(fresh);
              } else if (saved) {
                setStoreSettings(saved);
              }
            } catch (e) {
              if (saved) setStoreSettings(saved);
            }
          } catch (e) {
            console.error('Failed to save store settings', e);
            alert(`Failed to save settings: ${(e as any)?.message || e}`);
          } finally {
            setSavingSettings(false);
          }
        };
      // Product states
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<StoreProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  // Product modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSelectInventory, setShowSelectInventory] = useState(false);
  // Selected product
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  // Available products from shared inventory for private store
  const [inventoryProducts, setInventoryProducts] = useState<StoreProduct[]>([]);
  const [selectedInventoryProduct, setSelectedInventoryProduct] = useState<StoreProduct | null>(null);
  const [inventoryStockQuantity, setInventoryStockQuantity] = useState<number>(1);
  // Modal and tab states
  const [showStoreSettingsModal, setShowStoreSettingsModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [storeSettings, setStoreSettings] = useState<any>({
    store_slug: '',
    store_name: '',
    seller_name: '',
    seller_email: '',
    store_description: '',
    store_logo: '',
    template: 'pro',
    banner_url: '',
    // hero_main_url removed
    hero_tile1_url: '',
    hero_tile2_url: '',
    currency_code: 'DZD',
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [storeLinkCopied, setStoreLinkCopied] = useState(false);
  // Set refs for copyStoreLink
  storeSettingsRef = storeSettings;
  setStoreLinkCopiedRef = setStoreLinkCopied;
    // Handlers for uploads and removals
    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        setUploadingLogo(true);
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        // Persist the uploaded logo immediately
        setStoreSettings((s: any) => ({ ...s, store_logo: data.url }));
        try {
          const saveRes = await fetch('/api/client/store/settings', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ store_logo: data.url }),
          });
          if (saveRes.ok) {
            const updated = await saveRes.json();
            setStoreSettings(updated);
          }
        } catch (e) {
          console.error('Failed to persist uploaded logo', e);
        }
      } catch (error) {
        console.error('Failed to upload logo:', error);
        alert('Failed to upload image. Please try again.');
      } finally {
        setUploadingLogo(false);
      }
    };
    const removeLogo = async () => {
      // Optimistically remove locally
      setStoreSettings((s: any) => ({ ...s, store_logo: '' }));
      try {
        const res = await fetch('/api/client/store/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ store_logo: null }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error('Failed to persist removeLogo', err);
          alert('Failed to remove logo');
          return;
        }
        const updated = await res.json();
        setStoreSettings(updated);
      } catch (error) {
        console.error('removeLogo error:', error);
        alert('Failed to remove logo');
      }
    };
    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        setUploadingBanner(true);
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        // Persist the uploaded banner immediately
        setStoreSettings((s: any) => ({ ...s, banner_url: data.url }));
        try {
          const saveRes = await fetch('/api/client/store/settings', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ banner_url: data.url }),
          });
          if (saveRes.ok) {
            const updated = await saveRes.json();
            setStoreSettings(updated);
          }
        } catch (e) {
          console.error('Failed to persist uploaded banner', e);
        }
      } catch (error) {
        console.error('Failed to upload banner:', error);
        alert('Failed to upload image. Please try again.');
      } finally {
        setUploadingBanner(false);
      }
    };
    const removeBanner = async () => {
      setStoreSettings((s: any) => ({ ...s, banner_url: '' }));
      try {
        const res = await fetch('/api/client/store/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ banner_url: null }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error('Failed to persist removeBanner', err);
          alert('Failed to remove banner');
          return;
        }
        const updated = await res.json();
        setStoreSettings(updated);
      } catch (error) {
        console.error('removeBanner error:', error);
        alert('Failed to remove banner');
      }
    };
    const handleFieldUpload = async (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        // Persist the uploaded field immediately
        setStoreSettings((s: any) => ({ ...s, [field]: data.url }));
        try {
          const saveRes = await fetch('/api/client/store/settings', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ [field]: data.url }),
          });
          if (saveRes.ok) {
            const updated = await saveRes.json();
            setStoreSettings(updated);
          }
        } catch (e) {
          console.error('Failed to persist uploaded field', e);
        }
      } catch (err) {
        console.error('Field upload error', err);
        alert('Failed to upload image');
      } finally {
        if (e && (e.target as HTMLInputElement)) (e.target as HTMLInputElement).value = '';
      }
    };
    const removeField = async (field: string) => {
      // Clear locally
      setStoreSettings((s: any) => ({ ...s, [field]: '' }));
      try {
        const body: any = {};
        body[field] = null;
        const res = await fetch('/api/client/store/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error('Failed to persist removeField', err);
          alert('Failed to remove image');
          return;
        }
        const updated = await res.json();
        setStoreSettings(updated);
      } catch (error) {
        console.error('removeField error:', error);
        alert('Failed to remove image');
      }
    };
    // store images handlers removed (not used)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('Starting image upload:', file.name, file.size, file.type);

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be less than 2MB');
      e.target.value = '';
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      e.target.value = '';
      return;
    }

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      });

      if (res.ok) {
        const data = await res.json();
        const fullUrl = `${window.location.origin}${data.url}`;
        setFormData(prev => ({ ...prev, images: [fullUrl] }));
        e.target.value = '';
        alert('Image uploaded successfully!');
      } else {
        const error = await res.json();
        console.error('Upload failed:', error);
        alert(`Upload failed: ${error.error || 'Unknown error'}`);
        e.target.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload error: ${error instanceof Error ? error.message : 'Failed to upload image'}`);
      e.target.value = '';
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
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-2 md:space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              {t('store.privateStore')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('store.manageExclusive')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              onClick={() => {
                const url = getStorefrontPath(storeSettings);
                if (url) {
                  window.open(url, '_blank');
                }
              }}
              disabled={!getStorefrontPath(storeSettings)}
              className="h-9 px-3"
            >
              <StoreIcon className="w-4 h-4 mr-2" />
              {t('store.viewStorefront')}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/template-editor')}
              className="h-9 px-3"
            >
              <Settings className="w-4 h-4 mr-2" />
              {t('store.templateEditor')}
            </Button>
            <Button 
              onClick={() => {
                setShowSelectInventory(true);
                setSelectedInventoryProduct(null);
                setInventoryStockQuantity(1);
              }}
              className="bg-gradient-to-r from-primary to-purple-600 h-9 px-3"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('store.addProduct')}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{t('store.totalProducts')}</p>
                <p className="text-xl md:text-2xl font-bold mt-1">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{t('store.active')}</p>
                <p className="text-xl md:text-2xl font-bold mt-1">{stats.active}</p>
              </div>
              <Check className="w-8 h-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-3 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{t('store.drafts')}</p>
                <p className="text-xl md:text-2xl font-bold mt-1">{stats.draft}</p>
              </div>
              <Edit className="w-8 h-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{t('store.totalViews')}</p>
                <p className="text-xl md:text-2xl font-bold mt-1">{stats.totalViews}</p>
              </div>
              <Eye className="w-8 h-8 opacity-80" />
            </div>
          </div>
        </div>

        {/* Store Overview */}
            {/* Store Preview: Store URL, compact badges, and How-to guide (hidden here; rendered at bottom) */}
            {false && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-card rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-semibold">Your Store URL</Label>
                <p className="text-xs text-muted-foreground">Share this with customers to browse your storefront</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const url = getStorefrontPath(storeSettings);
                    if (url) {
                      window.open(url, '_blank');
                    }
                  }}
                  disabled={!getStorefrontPath(storeSettings)}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Store
                </Button>
              </div>
            </div>

            <div className="mt-3 flex gap-2 items-center">
              <Input
                value={getStorefrontFullUrl(storeSettings)}
                readOnly
                className="font-mono text-sm flex-1"
              />
              <Button onClick={copyStoreLink} variant="outline" disabled={!getStorefrontPath(storeSettings)}>
                {storeLinkCopied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            <div className="mt-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 border border-blue-200 flex gap-3">
              <LinkIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">Share Your Store</div>
                <p className="text-blue-700 dark:text-blue-300">Share this link so customers can browse all your products in one place. Use social channels, WhatsApp, or direct messages.</p>
              </div>
            </div>
          </div>

          {/** summary panel moved down below filters */}
        </div>
        )}

        {/* Filters */}
        <div className="bg-card rounded-xl border p-3">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('store.searchProducts')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[170px] h-9">
                <SelectValue placeholder={t('store.filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('store.allStatus')}</SelectItem>
                <SelectItem value="active">{t('store.active')}</SelectItem>
                <SelectItem value="draft">{t('store.drafts')}</SelectItem>
                <SelectItem value="archived">{t('store.archived')}</SelectItem>
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
        {/* Store Summary will render at bottom of page */}
        {filteredProducts.length === 0 ? (
          <div className="bg-card rounded-xl border p-4 md:p-4 text-center">
            <Package className="w-10 md:w-14 h-10 md:h-14 mx-auto text-muted-foreground opacity-20 mb-2" />
            <h3 className="text-base md:text-lg font-semibold mb-2">{t('store.noProductsYet')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('store.createFirstProduct')}
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('store.addFirstProduct')}
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-all"
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
                      <ImageIcon className="w-10 h-10 text-muted-foreground opacity-20" />
                    </div>
                  )}
                  {product.is_featured && (
                    <Badge className="absolute top-1.5 left-1.5 bg-yellow-500 text-[10px] px-1.5 py-0.5">
                      <Star className="w-2.5 h-2.5 mr-0.5" />
                      Featured
                    </Badge>
                  )}
                  <Badge className="absolute top-1.5 right-1.5 text-[10px] px-1.5 py-0.5" variant={
                    product.status === 'active' ? 'default' :
                    product.status === 'draft' ? 'secondary' : 'outline'
                  }>
                    {product.status === 'active' ? t('store.active') : 
                     product.status === 'draft' ? t('store.drafts') : 
                     t('store.archived')}
                  </Badge>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-primary">
                        ${product.price}
                      </span>
                      {product.original_price && (
                        <span className="text-xs text-muted-foreground line-through ml-1">
                          ${product.original_price}
                        </span>
                      )}
                    </div>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                      <Eye className="w-2.5 h-2.5 mr-0.5" />
                      {product.views}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5 pt-1.5 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-xs px-2"
                      onClick={() => handleGetShareLink(product)}
                    >
                      <Share2 className="w-3 h-3 mr-1" />
                      {t('store.share')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 w-7 p-0"
                      onClick={() => openEditModal(product)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 w-7 p-0"
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

      {/* Select Product from Inventory Modal */}
      <Dialog open={showSelectInventory} onOpenChange={(open) => {
        if (!open) {
          setShowSelectInventory(false);
          setSelectedInventoryProduct(null);
          setInventoryStockQuantity(1);
        }
      }}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Product from Stock</DialogTitle>
            <DialogDescription className="text-sm">
              Select an existing product from your inventory to add to your store
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {inventoryProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-3" />
                <p className="text-muted-foreground">No products in your inventory yet</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/dashboard/stock')}>
                  Go to Stock Management
                </Button>
              </div>
            ) : (
              <>
                <div className="grid gap-2 max-h-72 overflow-y-auto pr-1">
                  {inventoryProducts.map((product: any) => {
                    const imageUrl = product.images?.[0] 
                      ? (product.images[0].startsWith('http') ? product.images[0] : product.images[0])
                      : null;
                    const stockQty = product.quantity ?? product.stock_quantity ?? 0;
                    const price = product.unit_price ?? product.price ?? 0;
                    const name = product.name || product.title || 'Unnamed Product';
                    
                    return (
                      <div
                        key={product.id}
                        onClick={() => setSelectedInventoryProduct(product)}
                        className={`p-2.5 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                          selectedInventoryProduct?.id === product.id
                            ? 'border-primary bg-primary/10 shadow'
                            : 'border-border/50 hover:border-primary/50 bg-card'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {imageUrl ? (
                            <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                              <img
                                src={imageUrl}
                                alt={name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-lg">📦</div>';
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-muted/50 flex items-center justify-center text-xl">
                              📦
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {Number(price) > 0 && (
                                <span className="font-semibold text-primary text-sm">{Math.round(Number(price))} DA</span>
                              )}
                              <Badge variant={stockQty > 0 ? 'secondary' : 'destructive'} className="text-xs px-1.5 py-0">
                                {stockQty > 0 ? `${stockQty} in stock` : 'Out of stock'}
                              </Badge>
                            </div>
                          </div>
                          {selectedInventoryProduct?.id === product.id && (
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                              <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedInventoryProduct && (
                  <div className="space-y-3 border-t pt-3 bg-muted/30 rounded-lg p-3 -mx-1">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        {(selectedInventoryProduct as any).images?.[0] ? (
                          <img src={(selectedInventoryProduct as any).images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-base">📦</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{(selectedInventoryProduct as any).name || (selectedInventoryProduct as any).title}</p>
                        <p className="text-xs text-muted-foreground">Selected</p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Quantity to Add</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => setInventoryStockQuantity(Math.max(1, inventoryStockQuantity - 1))}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          max={(selectedInventoryProduct as any).quantity ?? (selectedInventoryProduct as any).stock_quantity ?? 999}
                          value={inventoryStockQuantity}
                          onChange={(e) => setInventoryStockQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-16 h-8 text-center text-sm font-semibold"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => {
                            const maxQty = (selectedInventoryProduct as any).quantity ?? (selectedInventoryProduct as any).stock_quantity ?? 999;
                            setInventoryStockQuantity(Math.min(maxQty, inventoryStockQuantity + 1));
                          }}
                        >
                          +
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          / {(selectedInventoryProduct as any).quantity ?? (selectedInventoryProduct as any).stock_quantity ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSelectInventory(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!selectedInventoryProduct) return;
                const inv = selectedInventoryProduct as any;
                try {
                  const res = await fetch('/api/client/store/products', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      title: inv.name || inv.title,
                      description: inv.description,
                      price: inv.unit_price || inv.price,
                      original_price: inv.original_price,
                      images: inv.images,
                      category: inv.category,
                      stock_quantity: inventoryStockQuantity,
                      status: 'active',
                      is_featured: false
                    })
                  });
                  if (res.ok) {
                    setShowSelectInventory(false);
                    setSelectedInventoryProduct(null);
                    setInventoryStockQuantity(1);
                    // Reload products
                    const productsRes = await fetch('/api/client/store/products', {
                    });
                    if (productsRes.ok) {
                      const productsData = await productsRes.json();
                      setProducts(productsData);
                      setFilteredProducts(productsData);
                    }
                  } else {
                    const error = await res.json();
                    alert(error.error || 'Failed to add product');
                  }
                } catch (error) {
                  console.error('Add product error:', error);
                  alert('Failed to add product');
                }
              }}
              disabled={!selectedInventoryProduct}
            >
              Add Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <DialogTitle>{t('store.shareProduct')}</DialogTitle>
            <DialogDescription>
              {t('store.shareProductDesc')}
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
                {t('store.linkCopied')}
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
            <AlertDialogTitle>{t('store.deleteProduct')}?</AlertDialogTitle>
            <AlertDialogDescription>
              {t('store.deleteWarning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-red-600 hover:bg-red-700">
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>



      {/* Store Summary (moved here) */}
      <div className="max-w-7xl mx-auto mt-4 md:mt-6">
        <div className="bg-card rounded-xl border p-3">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-semibold">{t('store.storeSummary')}</Label>
          </div>
        

          <div>
            <Label className="text-sm font-semibold">{t('store.howToUse')}</Label>
            <ol className="mt-2 text-sm space-y-1.5">
              <li className="flex gap-1.5 items-start"><div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">1</div><div><span className="font-medium">Add Products</span><div className="text-muted-foreground">Create products with images, prices, and descriptions</div></div></li>
              <li className="flex gap-1.5 items-start"><div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">2</div><div><span className="font-medium">Share Your Store Link</span><div className="text-muted-foreground">Copy the store URL above and share it with customers on social media, WhatsApp, email, etc.</div></div></li>
              <li className="flex gap-1.5 items-start"><div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">3</div><div><span className="font-medium">Share Individual Products</span><div className="text-muted-foreground">Click "Share" on any product to get a direct link for targeted advertising</div></div></li>
              <li className="flex gap-1.5 items-start"><div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">4</div><div><span className="font-medium">Track Performance</span><div className="text-muted-foreground">Monitor views and engagement for each product in your dashboard</div></div></li>
            </ol>
          </div>
        </div>
      </div>

      {/* Store Settings Modal with Tabs */}
      <Dialog open={showStoreSettingsModal} onOpenChange={setShowStoreSettingsModal}>
        <DialogContent className="max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <DialogHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
            <DialogTitle className="text-2xl font-bold">Store Settings</DialogTitle>
            <DialogDescription className="text-base">
              Your private store URL and customization options
            </DialogDescription>
          </DialogHeader>

          {/* Tabs Navigation */}
          <div className="flex gap-1 mb-6 border-b-2 border-slate-200 dark:border-slate-700 overflow-x-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            {['Branding', 'Customization', 'Templates', 'Store URL', 'Stats & Help'].map((tab, idx) => (
              <button
                key={tab}
                className={`px-4 py-2.5 rounded-md font-semibold transition-all focus:outline-none whitespace-nowrap text-sm ${
                  selectedTab === idx 
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md ring-2 ring-blue-300 dark:ring-blue-600' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                onClick={() => setSelectedTab(idx)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Panels */}
          <div className="py-4">
            {selectedTab === 0 && (
              <div className="space-y-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 p-6 border border-blue-200 dark:border-slate-700 shadow-sm dark:text-slate-100">
                <h3 className="text-base font-semibold">Store Branding</h3>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Store Name *</Label>
                  <Input
                    placeholder="My Awesome Store"
                    value={storeSettings.store_name || ''}
                    onChange={(e) => setStoreSettings((s: any) => ({ ...s, store_name: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">This will be the main title of your store</p>
                  <p className="text-xs text-muted-foreground mt-1">Store slug: <code className="px-1 py-0.5 bg-gray-100 rounded">{storeSettings.store_slug || '—'}</code></p>
                  <p className="text-xs mt-1 text-amber-600">These settings apply only to this store (slug shown above).</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Seller Name *</Label>
                  <Input
                    placeholder="John Doe"
                    value={storeSettings.seller_name || ''}
                    onChange={(e) => setStoreSettings((s: any) => ({ ...s, seller_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Seller Email (Gmail)</Label>
                  <Input
                    placeholder="you@gmail.com"
                    value={storeSettings.seller_email || ''}
                    onChange={(e) => setStoreSettings((s: any) => ({ ...s, seller_email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Store Description</Label>
                  <Textarea
                    placeholder="Tell customers what makes your store special..."
                    value={storeSettings.store_description || ''}
                    onChange={(e) => setStoreSettings((s: any) => ({ ...s, store_description: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
            )}
            {selectedTab === 1 && (
              <div className="space-y-3 rounded-xl bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-transparent dark:via-transparent dark:to-transparent p-3 shadow-sm dark:bg-slate-900 dark:text-slate-100 overflow-hidden max-w-full">
                <h3 className="text-base font-semibold">Customization</h3>
                {/* Store Logo */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Store Logo</Label>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex-1">
                      <Input
                        placeholder="https://example.com/logo.png"
                        value={storeSettings.store_logo || ''}
                        onChange={(e) => setStoreSettings((s: any) => ({ ...s, store_logo: e.target.value }))}
                        className="max-w-0"
                      />
                    </div>
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
                  {storeSettings.store_logo ? (
                    <div className="mt-2">
                      <div className="relative w-40 h-40 rounded overflow-hidden border bg-white dark:bg-black">
                        <img src={storeSettings.store_logo} alt="logo" className="w-full h-full object-contain" />
                        <button type="button" onClick={removeLogo} className="absolute top-1 right-1 bg-white/80 dark:bg-black/60 text-red-600 rounded-full p-1 text-xs">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : null}
                  <p className="text-xs text-muted-foreground">Upload or paste a direct link to your logo</p>
                </div>
                {/* Banner, Hero Images, Store Images */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Banner Image URL</Label>
                    <div className="flex gap-2 min-w-0">
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
                      <input
                        id="banner-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleBannerUpload}
                        className="hidden"
                      />
                    </div>
                    {storeSettings.banner_url ? (
                        <div className="mt-2">
                        <div className="relative w-full h-28 overflow-hidden rounded bg-muted">
                          <img src={storeSettings.banner_url} alt="banner" className="w-full h-full object-cover" />
                          <button type="button" onClick={removeBanner} className="absolute top-2 right-2 bg-white/80 dark:bg-black/60 rounded-full p-1 text-xs">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ) : null}
                    <p className="text-xs text-muted-foreground">Hero section background image</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Hero Images (main + tiles)</Label>
                    <div className="grid grid-cols-1 gap-3 items-start max-w-full overflow-hidden">
                      {/* Main hero image upload removed */}
                      {/* Store Images upload removed */}
                      <div className="md:col-span-1 grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-xs mb-2">Tile 1</div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <input id="hero-tile1-upload" type="file" accept="image/*" onChange={(e) => handleFieldUpload('hero_tile1_url', e)} className="hidden" />
                            <Button type="button" variant="outline" onClick={() => document.getElementById('hero-tile1-upload')?.click()}>Upload Tile 1</Button>
                            {storeSettings.hero_tile1_url ? (
                              <div className="ml-3 mt-2">
                                <div className="relative w-20 h-12 rounded overflow-hidden">
                                  <img src={storeSettings.hero_tile1_url} alt="hero-t1" className="w-full h-full object-cover" />
                                  <button type="button" onClick={() => removeField('hero_tile1_url')} className="absolute top-1 right-1 bg-white/80 dark:bg-black/60 rounded-full p-1 text-xs">
                                    <Trash2 className="w-3 h-3 text-red-600" />
                                  </button>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs mb-2">Tile 2</div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <input id="hero-tile2-upload" type="file" accept="image/*" onChange={(e) => handleFieldUpload('hero_tile2_url', e)} className="hidden" />
                            <Button type="button" variant="outline" onClick={() => document.getElementById('hero-tile2-upload')?.click()}>Upload Tile 2</Button>
                            {storeSettings.hero_tile2_url ? (
                              <div className="ml-3 mt-2">
                                <div className="relative w-20 h-12 rounded overflow-hidden">
                                  <img src={storeSettings.hero_tile2_url} alt="hero-t2" className="w-full h-full object-cover" />
                                  <button type="button" onClick={() => removeField('hero_tile2_url')} className="absolute top-1 right-1 bg-white/80 dark:bg-black/60 rounded-full p-1 text-xs">
                                    <Trash2 className="w-3 h-3 text-red-600" />
                                  </button>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Main hero and two tiles used on storefront hero sections</p>
                  </div>
                </div>
              </div>
            )}
            {selectedTab === 2 && (
              <TemplatesTab 
                storeSettings={storeSettings}
                setStoreSettings={setStoreSettings}
              />
            )}
            {/* Store URL, product summary badges and 'How to Use Your Store' moved to Store Dashboard */}
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
    </div>
  );
}
