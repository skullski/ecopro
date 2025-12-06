import { useState, useEffect } from 'react';
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
  // Copy store link to clipboard
  // This must be above all JSX usage
  let storeSettingsRef: any = null;
  let setStoreLinkCopiedRef: any = null;
  const copyStoreLink = () => {
    if (!storeSettingsRef?.store_slug) return;
    const storeUrl = `${window.location.origin}/store/${storeSettingsRef.store_slug}`;
    navigator.clipboard.writeText(storeUrl);
    setStoreLinkCopiedRef(true);
    setTimeout(() => setStoreLinkCopiedRef(false), 2000);
  };

  // Fetch store settings and products on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        // Fetch store settings
        const settingsRes = await fetch('/api/client/store/settings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setStoreSettings(settingsData);
        }
        // Fetch products
        const productsRes = await fetch('/api/client/store/products', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData);
          setFilteredProducts(productsData);
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
                // reload products
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
                // reload products
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
                // reload products
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
            const token = localStorage.getItem('authToken');
            const res = await fetch('/api/client/store/settings', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                store_name: storeSettings.store_name || null,
                owner_name: storeSettings.seller_name || storeSettings.owner_name || null,
                owner_email: storeSettings.seller_email || storeSettings.owner_email || null,
                seller_name: storeSettings.seller_name || null,
                seller_email: storeSettings.seller_email || null,
                store_description: storeSettings.store_description || null,
                store_logo: storeSettings.store_logo || null,
                store_images: storeSettings.store_images || [],
                template: storeSettings.template || 'classic',
                banner_url: storeSettings.banner_url || null,
                hero_main_url: storeSettings.hero_main_url || null,
                hero_tile1_url: storeSettings.hero_tile1_url || null,
                hero_tile2_url: storeSettings.hero_tile2_url || null,
                currency_code: storeSettings.currency_code || 'DZD',
              }),
            });
            if (!res.ok) throw new Error('Save failed');
            const data = await res.json();
            setStoreSettings(data);
          } catch (e) {
            console.error('Failed to save store settings', e);
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
  // Selected product
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
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
    store_images: [],
    template: 'classic',
    banner_url: '',
    hero_main_url: '',
    hero_tile1_url: '',
    hero_tile2_url: '',
    currency_code: 'DZD',
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingStoreImages, setUploadingStoreImages] = useState(false);
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
        const token = localStorage.getItem('authToken');
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        setStoreSettings((s: any) => ({ ...s, store_logo: data.url }));
      } catch (error) {
        console.error('Failed to upload logo:', error);
        alert('Failed to upload image. Please try again.');
      } finally {
        setUploadingLogo(false);
      }
    };
    const removeLogo = () => {
      setStoreSettings((s: any) => ({ ...s, store_logo: '' }));
    };
    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        setUploadingBanner(true);
        const formData = new FormData();
        formData.append('image', file);
        const token = localStorage.getItem('authToken');
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        setStoreSettings((s: any) => ({ ...s, banner_url: data.url }));
      } catch (error) {
        console.error('Failed to upload banner:', error);
        alert('Failed to upload image. Please try again.');
      } finally {
        setUploadingBanner(false);
      }
    };
    const removeBanner = () => {
      setStoreSettings((s: any) => ({ ...s, banner_url: '' }));
    };
    const handleFieldUpload = async (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const formData = new FormData();
        formData.append('image', file);
        const token = localStorage.getItem('authToken');
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        setStoreSettings((s: any) => ({ ...s, [field]: data.url }));
      } catch (err) {
        console.error('Field upload error', err);
        alert('Failed to upload image');
      } finally {
        if (e && (e.target as HTMLInputElement)) (e.target as HTMLInputElement).value = '';
      }
    };
    const removeField = (field: string) => {
      setStoreSettings((s: any) => ({ ...s, [field]: '' }));
    };
    const handleStoreImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      setUploadingStoreImages(true);
      try {
        const token = localStorage.getItem('authToken');
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (!file.type.startsWith('image/')) continue;
          const form = new FormData();
          form.append('image', file);
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: form,
          });
          if (!res.ok) continue;
          const data = await res.json();
          setStoreSettings((s: any) => {
            const prev: string[] = Array.isArray(s?.store_images) ? s.store_images : [];
            const next = [...prev, data.url].slice(0, 3);
            return { ...s, store_images: next };
          });
        }
      } catch (err) {
        console.error('store images upload error', err);
        alert('Failed to upload one or more images');
      } finally {
        setUploadingStoreImages(false);
        if (e && (e.target as HTMLInputElement)) (e.target as HTMLInputElement).value = '';
      }
    };
    const removeStoreImage = (index: number) => {
      setStoreSettings((s: any) => {
        const prev: string[] = Array.isArray(s?.store_images) ? s.store_images : [];
        const next = prev.filter((_, i) => i !== index);
        return { ...s, store_images: next };
      });
    };
  // Remove duplicate state declarations (already declared above)
      {/* Store Settings Modal with Tabs */}
      <Dialog open={showStoreSettingsModal} onOpenChange={setShowStoreSettingsModal}>
        <DialogContent className="max-w-[950px] w-full p-4 max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Store Settings</DialogTitle>
            <DialogDescription>
              Your private store URL and customization options
            </DialogDescription>
          </DialogHeader>

          {/* Tabs Navigation */}
          <div className="flex gap-2 mb-4 border-b pb-2">
            {['Branding', 'Customization', 'Store URL', 'Stats & Help'].map((tab, idx) => (
              <button
                key={tab}
                className={`px-4 py-2 rounded-t font-medium transition-colors focus:outline-none ${selectedTab === idx ? 'bg-primary text-white dark:bg-primary dark:text-white' : 'bg-muted text-muted-foreground dark:bg-slate-800 dark:text-slate-300'}`}
                onClick={() => setSelectedTab(idx)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Panels */}
          <div className="py-2">
            {selectedTab === 0 && (
              <div className="space-y-3 rounded-xl bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-transparent dark:via-transparent dark:to-transparent p-4 shadow-sm dark:bg-slate-800 dark:text-slate-100">
                <h3 className="text-base font-semibold">Store Branding</h3>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Store Name *</Label>
                  <Input
                    placeholder="My Awesome Store"
                    value={storeSettings.store_name || ''}
                    onChange={(e) => setStoreSettings((s: any) => ({ ...s, store_name: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">This will be the main title of your store</p>
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
              <div className="space-y-3 rounded-xl bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-transparent dark:via-transparent dark:to-transparent p-4 shadow-sm dark:bg-slate-900 dark:text-slate-100 overflow-hidden max-w-full">
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
                        className="min-w-0"
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
                      <div className="relative w-20 h-20 rounded overflow-hidden border bg-white dark:bg-black">
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
                <div className="grid grid-cols-1 gap-4">
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
                      <div className="md:col-span-1">
                        <div className="text-xs mb-2">Main hero image</div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <input id="hero-main-upload" type="file" accept="image/*" onChange={(e) => handleFieldUpload('hero_main_url', e)} className="hidden" />
                          <Button type="button" variant="outline" onClick={() => document.getElementById('hero-main-upload')?.click()}>Upload Main</Button>
                          {storeSettings.hero_main_url ? (
                            <div className="ml-3 mt-2">
                              <div className="relative w-28 h-16 rounded overflow-hidden">
                                <img src={storeSettings.hero_main_url} alt="hero-main" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => removeField('hero_main_url')} className="absolute top-1 right-1 bg-white/80 dark:bg-black/60 rounded-full p-1 text-xs">
                                  <Trash2 className="w-3 h-3 text-red-600" />
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <div className="md:col-span-1">
                        <Label className="text-sm font-medium">Store Images (up to 3)</Label>
                        <div className="flex gap-2 flex-wrap mt-2">
                          {(storeSettings.store_images || []).map((img: string, idx: number) => (
                            <div key={idx} className="relative rounded overflow-hidden bg-muted w-20 h-20 flex-shrink-0">
                              <img src={img} alt={`store-${idx}`} className="w-full h-full object-cover" />
                              <button type="button" onClick={() => removeStoreImage(idx)} className="absolute top-1 right-1 bg-white/80 dark:bg-black/60 rounded-full p-1 text-xs">
                                <Trash2 className="w-3 h-3 text-red-600" />
                              </button>
                            </div>
                          ))}
                          {((storeSettings.store_images || []).length < 3) && (
                            <div className="flex items-center justify-center w-20 h-20 rounded border border-dashed text-sm text-muted-foreground">Empty</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <input id="store-images-upload" type="file" accept="image/*" multiple onChange={handleStoreImagesUpload} className="hidden" />
                          <Button type="button" variant="outline" onClick={() => document.getElementById('store-images-upload')?.click()} disabled={uploadingStoreImages}>
                            {uploadingStoreImages ? 'Uploading...' : 'Upload Images'}
                          </Button>
                          <p className="text-xs text-muted-foreground">Max 3 images, 2MB each</p>
                        </div>
                      </div>
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
              <div className="space-y-3 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Your Store URL</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (storeSettings.store_slug) {
                        window.open(`/store/${storeSettings.store_slug}`, '_blank');
                      }
                    }}
                    disabled={!storeSettings.store_slug}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Store
                  </Button>
                </div>
                <div className="flex gap-2 min-w-0">
                  <Input
                    value={storeSettings.store_slug ? `${window.location.origin}/store/${storeSettings.store_slug}` : 'Loading...'}
                    readOnly
                    className="font-mono text-sm min-w-0"
                  />
                  <Button onClick={copyStoreLink} variant="outline" disabled={!storeSettings.store_slug}>
                    {storeLinkCopied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {storeLinkCopied && (
                  <p className="text-sm text-green-600 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Store link copied!
                  </p>
                )}
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex gap-3">
                    <LinkIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                        Share Your Store
                      </div>
                      <p className="text-blue-700 dark:text-blue-300">
                        Share this link with your customers so they can browse all your products in one place.
                        They can search, filter by category, and view featured items.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {selectedTab === 3 && (
              <>
                <div className="border-t pt-4 lg:col-span-2">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="px-3 py-2 bg-muted rounded-md">
                      <div className="text-sm font-semibold text-primary">{products.length}</div>
                      <div className="text-xs">Products</div>
                    </div>
                    <div className="px-3 py-2 bg-muted rounded-md">
                      <div className="text-sm font-semibold text-green-600">{products.filter(p => p.status === 'active').length}</div>
                      <div className="text-xs">Active</div>
                    </div>
                    <div className="px-3 py-2 bg-muted rounded-md">
                      <div className="text-sm font-semibold text-purple-600">{products.reduce((sum, p) => sum + p.views, 0)}</div>
                      <div className="text-xs">Views</div>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-6 lg:col-span-2">
                  <Label className="text-base font-semibold mb-3 block">How to Use Your Store</Label>
                  <div className="space-y-3">
                    <div className="flex gap-3 text-sm">
                      <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        1
                      </div>
                      <div>
                        <div className="font-medium mb-1">Add Products</div>
                        <p className="text-muted-foreground">
                          Create products with images, prices, and descriptions
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 text-sm">
                      <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        2
                      </div>
                      <div>
                        <div className="font-medium mb-1">Share Your Store Link</div>
                        <p className="text-muted-foreground">
                          Copy the store URL above and share it with your customers on social media, WhatsApp, email, etc.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 text-sm">
                      <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        3
                      </div>
                      <div>
                        <div className="font-medium mb-1">Share Individual Products</div>
                        <p className="text-muted-foreground">
                          Click "Share" on any product to get a direct link for targeted advertising
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 text-sm">
                      <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        4
                      </div>
                      <div>
                        <div className="font-medium mb-1">Track Performance</div>
                        <p className="text-muted-foreground">
                          Monitor views and engagement for each product in your dashboard
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
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
                if (storeSettings.store_slug) {
                  window.open(`/store/${storeSettings.store_slug}`, '_blank');
                }
              }}
              disabled={!storeSettings.store_slug}
            >
              <StoreIcon className="w-4 h-4 mr-2" />
              View Storefront
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowStoreSettingsModal(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Store Settings
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
          </div>
        </div>

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
                      // Remove duplicate states and handlers (already defined above)

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

      {/* Store Settings Modal */}
      <Dialog open={showStoreSettingsModal} onOpenChange={setShowStoreSettingsModal}>
        <DialogContent className="max-w-[950px] w-full p-4 max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Store Settings</DialogTitle>
            <DialogDescription>
              Your private store URL and customization options
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 py-2">
            {/* Store Branding */}
            <div className="space-y-3 rounded-xl bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-transparent dark:via-transparent dark:to-transparent p-4 shadow-sm dark:bg-slate-800 dark:text-slate-100">
              <h3 className="text-base font-semibold">Store Branding</h3>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Store Name *</Label>
                <Input
                  placeholder="My Awesome Store"
                  value={storeSettings.store_name || ''}
                  onChange={(e) => setStoreSettings((s: any) => ({ ...s, store_name: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">This will be the main title of your store</p>
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

              {/* logo moved to Customization column to keep branding compact */}

            
            </div>

            {/* Template selection removed */}

            {/* Customization */}
              <div className="space-y-3 rounded-xl bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-transparent dark:via-transparent dark:to-transparent p-4 shadow-sm dark:bg-slate-900 dark:text-slate-100 overflow-hidden max-w-full">
              <h3 className="text-base font-semibold">Customization</h3>
              {/* Store Logo (moved from Branding) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Store Logo</Label>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex-1">
                    <Input
                      placeholder="https://example.com/logo.png"
                      value={storeSettings.store_logo || ''}
                      onChange={(e) => setStoreSettings((s: any) => ({ ...s, store_logo: e.target.value }))}
                      className="min-w-0"
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
                    <div className="relative w-20 h-20 rounded overflow-hidden border bg-white dark:bg-black">
                      <img src={storeSettings.store_logo} alt="logo" className="w-full h-full object-contain" />
                      <button type="button" onClick={removeLogo} className="absolute top-1 right-1 bg-white/80 dark:bg-black/60 text-red-600 rounded-full p-1 text-xs">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : null}
                <p className="text-xs text-muted-foreground">Upload or paste a direct link to your logo</p>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
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
                    <div className="md:col-span-1">
                      <div className="text-xs mb-2">Main hero image</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <input id="hero-main-upload" type="file" accept="image/*" onChange={(e) => handleFieldUpload('hero_main_url', e)} className="hidden" />
                        <Button type="button" variant="outline" onClick={() => document.getElementById('hero-main-upload')?.click()}>Upload Main</Button>
                        {storeSettings.hero_main_url ? (
                          <div className="ml-3 mt-2">
                            <div className="relative w-28 h-16 rounded overflow-hidden">
                              <img src={storeSettings.hero_main_url} alt="hero-main" className="w-full h-full object-cover" />
                              <button type="button" onClick={() => removeField('hero_main_url')} className="absolute top-1 right-1 bg-white/80 dark:bg-black/60 rounded-full p-1 text-xs">
                                <Trash2 className="w-3 h-3 text-red-600" />
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="md:col-span-1">
                      <Label className="text-sm font-medium">Store Images (up to 3)</Label>
                      <div className="flex gap-2 flex-wrap mt-2">
                        {(storeSettings.store_images || []).map((img: string, idx: number) => (
                          <div key={idx} className="relative rounded overflow-hidden bg-muted w-20 h-20 flex-shrink-0">
                            <img src={img} alt={`store-${idx}`} className="w-full h-full object-cover" />
                            <button type="button" onClick={() => removeStoreImage(idx)} className="absolute top-1 right-1 bg-white/80 dark:bg-black/60 rounded-full p-1 text-xs">
                              <Trash2 className="w-3 h-3 text-red-600" />
                            </button>
                          </div>
                        ))}
                        {((storeSettings.store_images || []).length < 3) && (
                          <div className="flex items-center justify-center w-20 h-20 rounded border border-dashed text-sm text-muted-foreground">Empty</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <input id="store-images-upload" type="file" accept="image/*" multiple onChange={handleStoreImagesUpload} className="hidden" />
                        <Button type="button" variant="outline" onClick={() => document.getElementById('store-images-upload')?.click()} disabled={uploadingStoreImages}>
                          {uploadingStoreImages ? 'Uploading...' : 'Upload Images'}
                        </Button>
                        <p className="text-xs text-muted-foreground">Max 3 images, 2MB each</p>
                      </div>
                    </div>

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
                {/* Currency code removed per design request */}
              </div>
            </div>

            {/* Store URL Section */}
            <div className="space-y-3 lg:col-span-2">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Your Store URL</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (storeSettings.store_slug) {
                      window.open(`/store/${storeSettings.store_slug}`, '_blank');
                    }
                  }}
                  disabled={!storeSettings.store_slug}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Store
                </Button>
              </div>
              <div className="flex gap-2 min-w-0">
                <Input
                  value={storeSettings.store_slug ? `${window.location.origin}/store/${storeSettings.store_slug}` : 'Loading...'}
                  readOnly
                  className="font-mono text-sm min-w-0"
                />
                <Button onClick={copyStoreLink} variant="outline" disabled={!storeSettings.store_slug}>
                  {storeLinkCopied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {storeLinkCopied && (
                <p className="text-sm text-green-600 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Store link copied!
                </p>
              )}
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex gap-3">
                  <LinkIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Share Your Store
                    </div>
                    <p className="text-blue-700 dark:text-blue-300">
                      Share this link with your customers so they can browse all your products in one place.
                      They can search, filter by category, and view featured items.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Compact stats summary (kept small inside settings) */}
            <div className="border-t pt-4 lg:col-span-2">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="px-3 py-2 bg-muted rounded-md">
                  <div className="text-sm font-semibold text-primary">{products.length}</div>
                  <div className="text-xs">Products</div>
                </div>
                <div className="px-3 py-2 bg-muted rounded-md">
                  <div className="text-sm font-semibold text-green-600">{products.filter(p => p.status === 'active').length}</div>
                  <div className="text-xs">Active</div>
                </div>
                <div className="px-3 py-2 bg-muted rounded-md">
                  <div className="text-sm font-semibold text-purple-600">{products.reduce((sum, p) => sum + p.views, 0)}</div>
                  <div className="text-xs">Views</div>
                </div>
              </div>
            </div>

            {/* How to Use */}
            <div className="border-t pt-6 lg:col-span-2">
              <Label className="text-base font-semibold mb-3 block">How to Use Your Store</Label>
              <div className="space-y-3">
                <div className="flex gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    1
                  </div>
                  <div>
                    <div className="font-medium mb-1">Add Products</div>
                    <p className="text-muted-foreground">
                      Create products with images, prices, and descriptions
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    2
                  </div>
                  <div>
                    <div className="font-medium mb-1">Share Your Store Link</div>
                    <p className="text-muted-foreground">
                      Copy the store URL above and share it with your customers on social media, WhatsApp, email, etc.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    3
                  </div>
                  <div>
                    <div className="font-medium mb-1">Share Individual Products</div>
                    <p className="text-muted-foreground">
                      Click "Share" on any product to get a direct link for targeted advertising
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    4
                  </div>
                  <div>
                    <div className="font-medium mb-1">Track Performance</div>
                    <p className="text-muted-foreground">
                      Monitor views and engagement for each product in your dashboard
                    </p>
                  </div>
                </div>
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

      {/* Template gallery removed */}
    </div>
  );
}
