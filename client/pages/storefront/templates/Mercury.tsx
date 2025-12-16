import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TemplateProps } from './types';
import { Search, Package, Star } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export default function MercuryTemplate(props: TemplateProps & { canManage?: boolean }) {
  const { storeSlug, products, filtered, settings, categories, searchQuery, setSearchQuery, categoryFilter, setCategoryFilter, formatPrice, navigate } = props;
  const canManage = (props as any).canManage ?? false;
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const apiBase = `/api/storefront/${storeSlug}`;

  // Fallback images to keep the page visually rich even when settings are empty
  // Accept comma-separated URLs in settings fields to enable simple slideshows without schema changes
  const parseList = (val?: string, fallback?: string[]) => {
    const urls = (val || '').split(',').map(s => s.trim()).filter(Boolean);
    return urls.length ? urls : (fallback || []);
  };

  // When store settings are empty we should avoid pulling third-party images
  // (Unsplash) automatically; prefer a local placeholder to avoid showing
  // unexpected images on the storefront.
  const heroMainList = useMemo(() => parseList(
    settings?.banner_url,
    [settings?.hero_main_url || '/placeholder.png']
  ), [settings?.banner_url, settings?.hero_main_url]);

  const heroTile1List = useMemo(() => parseList(
    settings?.hero_tile1_url,
    ['/placeholder.png']
  ), [settings?.hero_tile1_url]);

  const heroTile2List = useMemo(() => parseList(
    settings?.hero_tile2_url,
    ['/placeholder.png']
  ), [settings?.hero_tile2_url]);

  const DEFAULTS = {
    product: '/placeholder.png',
  } as const;

  // Slideshow state and timers (2s) with hover/touch pause
  const [mainIdx, setMainIdx] = useState(0);
  const [t1Idx, setT1Idx] = useState(0);
  const [t2Idx, setT2Idx] = useState(0);
  const pausedRef = useRef({ main: false, t1: false, t2: false });

  useEffect(() => {
    const timers: number[] = [];
    timers.push(window.setInterval(() => {
      if (!pausedRef.current.main && heroMainList.length > 1) {
        setMainIdx(i => (i + 1) % heroMainList.length);
      }
    }, 5000));
    timers.push(window.setInterval(() => {
      if (!pausedRef.current.t1 && heroTile1List.length > 1) {
        setT1Idx(i => (i + 1) % heroTile1List.length);
      }
    }, 5000));
    timers.push(window.setInterval(() => {
      if (!pausedRef.current.t2 && heroTile2List.length > 1) {
        setT2Idx(i => (i + 1) % heroTile2List.length);
      }
    }, 5000));
    return () => { timers.forEach(t => clearInterval(t)); };
  }, [heroMainList.length, heroTile1List.length, heroTile2List.length]);

  async function handleDelete(productId: number) {
    if (!confirm('Delete this product?')) return;
    try {
      const res = await fetch(`${apiBase}/products/${productId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        // naive reload
        window.location.reload();
      } else {
        alert(await res.text());
      }
    } catch (e) {
      alert('Failed to delete product');
    }
  }

  async function handleImageUpload(productId: number, files: FileList | null) {
    if (!files || files.length === 0) return;
    const form = new FormData();
    Array.from(files).forEach((f) => form.append('files', f));
    try {
      const res = await fetch(`${apiBase}/products/${productId}/images`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
      if (res.ok) {
        window.location.reload();
      } else {
        alert(await res.text());
      }
    } catch {
      alert('Upload failed');
    }
  }
  // Show all featured products (no hard limit). If none are explicitly featured, fall back to showing all products.
  const featured = products.filter(p => p.is_featured);

  // If there are no featured flags, show all products as featured (no limits)
  const featuredToShow = (featured && featured.length > 0) ? featured : products;
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<{ title: string; description: string; price: string; category: string }>({ title: '', description: '', price: '', category: '' });

  async function handleAddProduct() {
    try {
      const res = await fetch(`${apiBase}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          price: form.price,
          category: form.category,
        })
      });
      if (res.ok) {
        setShowAdd(false);
        window.location.reload();
      } else {
        alert(await res.text());
      }
    } catch (e) {
      alert('Failed to add product');
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>
          {/* Header is rendered by `StoreLayout` so templates should not duplicate it. */}

      {/* Main layout */}
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-10">
        {/* Content */}
        <div className="space-y-6">
          {canManage && (
            <div className="flex justify-end">
              <Button onClick={()=>setShowAdd(true)}>Add Product</Button>
            </div>
          )}
          {canManage && showAdd && (
            <div className="border rounded p-4 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Title</label>
                  <Input value={form.title} onChange={(e)=>setForm({...form, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Category</label>
                  <Input value={form.category} onChange={(e)=>setForm({...form, category: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm mb-1">Description</label>
                  <Input value={form.description} onChange={(e)=>setForm({...form, description: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Price</label>
                  <Input type="number" value={form.price} onChange={(e)=>setForm({...form, price: e.target.value})} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button onClick={handleAddProduct}>Save</Button>
                <Button variant="outline" onClick={()=>setShowAdd(false)}>Cancel</Button>
              </div>
            </div>
          )}
          {/* Mosaic hero: left large banner (banner_url) + right two stacked tiles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[0.3rem] rounded-2xl">
            {/* Left: Main banner */}
            <div
              className="md:col-span-2 h-[280px] md:h-[420px] rounded-2xl overflow-hidden"
              onMouseEnter={() => { pausedRef.current.main = true; }}
              onMouseLeave={() => { pausedRef.current.main = false; }}
              onTouchStart={() => { pausedRef.current.main = true; }}
              onTouchEnd={() => { pausedRef.current.main = false; }}
            >
              <img
                src={heroMainList[mainIdx] || heroMainList[0]}
                alt="Hero"
                className="w-full h-full"
                decoding="async"
                fetchPriority="high"
              />
            </div>

            {/* Right: Two tiles stacked */}
            <div className="grid grid-rows-2 gap-[0.3rem] h-[280px] md:h-[420px]">
              <div
                className="rounded-2xl overflow-hidden"
                onMouseEnter={() => { pausedRef.current.t1 = true; }}
                onMouseLeave={() => { pausedRef.current.t1 = false; }}
                onTouchStart={() => { pausedRef.current.t1 = true; }}
                onTouchEnd={() => { pausedRef.current.t1 = false; }}
              >
                <img
                  src={heroTile1List[t1Idx] || heroTile1List[0]}
                  alt="Tile 1"
                  className="w-full h-full"
                  decoding="async"
                />
              </div>
              <div
                className="rounded-2xl overflow-hidden"
                onMouseEnter={() => { pausedRef.current.t2 = true; }}
                onMouseLeave={() => { pausedRef.current.t2 = false; }}
                onTouchStart={() => { pausedRef.current.t2 = true; }}
                onTouchEnd={() => { pausedRef.current.t2 = false; }}
              >
                <img
                  src={heroTile2List[t2Idx] || heroTile2List[0]}
                  alt="Tile 2"
                  className="w-full h-full"
                  decoding="async"
                />
              </div>
            </div>
          </div>

          {/* Featured products */}
          <div>
            <div className="pb-2 mb-4 font-semibold tracking-wide" style={{ borderBottom: '1px solid hsl(var(--border))' }}>FEATURED PRODUCTS</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredToShow.map((product) => (
                <div
                  key={product.id}
                  className="rounded-2xl p-4 transition cursor-pointer futuristic-neon flex flex-col"
                  style={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                  }}
                  onClick={()=>{
                    const slug = product.slug;
                    if (slug && slug.length > 0) {
                      navigate(`/store/${storeSlug}/${slug}`);
                    } else {
                      navigate(`/product/${product.id}`);
                    }
                  }}
                >
                  {/* Larger image area, ~90% fill, object-cover */}
                  <img
                    src={product.images?.[0] || (product as any)?.imageUrls?.[0] || DEFAULTS.product}
                    alt={product.title}
                    className="rounded-2xl w-full h-[338px]"
                    decoding="async"
                    loading="lazy"
                  />
                  {/* Minimal info: title + price only, tight spacing */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-base font-medium truncate" style={{ color: 'hsl(var(--foreground))' }}>{product.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{product.seller_name || settings?.owner_name || settings?.store_name}</div>
                    </div>
                    <span className="text-base font-bold" style={{ color: 'hsl(var(--foreground))' }}>{formatPrice(Number(product.price))}</span>
                  </div>
                  {canManage && (
                    <div className="mt-3 flex items-center gap-2">
                      <Button variant="outline" size="sm" className="border-neutral-700" onClick={(e)=>{
                        e.stopPropagation();
                        const slug = product.slug;
                        if (slug && slug.length > 0) {
                          navigate(`/store/${storeSlug}/${slug}/edit`);
                        } else {
                          navigate(`/product/${product.id}`);
                        }
                      }}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={(e)=>{e.stopPropagation(); handleDelete(product.id);}}>Delete</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* All Products (no limit) */}
          <div className="container max-w-7xl mx-auto px-4 py-8">
            <div className="pb-2 mb-4 font-semibold tracking-wide" style={{ borderBottom: '1px solid hsl(var(--border))' }}>ALL PRODUCTS</div>
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">No products found</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filtered.map((product) => (
                  <button
                    key={product.id}
                    className="group rounded-2xl p-4 transition cursor-pointer futuristic-neon flex flex-col"
                    onClick={() => {
                      const slug = product.slug;
                      if (slug && slug.length > 0) {
                        navigate(`/store/${storeSlug}/${slug}`);
                      } else {
                        navigate(`/product/${product.id}`);
                      }
                    }}
                  >
                    <img src={product.images?.[0] || DEFAULTS.product} alt={product.title} className="rounded-2xl w-full h-[220px] object-cover" />
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-base font-medium truncate" style={{ color: 'hsl(var(--foreground))' }}>{product.title}</span>
                      <span className="text-base font-bold" style={{ color: 'hsl(var(--foreground))' }}>{formatPrice(Number(product.price))}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16" style={{ borderTop: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}>
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-xs font-bold uppercase text-neutral-400 mb-2 tracking-widest">MAILING LIST</div>
              <div className="flex gap-2">
                <Input placeholder="Enter your email address" style={{ backgroundColor: 'hsl(var(--input))', borderColor: 'hsl(var(--border))' }} />
                <Button variant="outline" style={{ borderColor: 'hsl(var(--border))' }}>Subscribe</Button>
              </div>
            </div>
            <div className="text-neutral-400 text-sm">Blog<br/>Product Index<br/>Category Index</div>
            <div className="text-neutral-400 text-sm">Terms and Conditions<br/>Become an Affiliate</div>
          </div>
          <div className="text-neutral-500 text-xs mt-6">© {new Date().getFullYear()} Sample Store. All Rights Reserved.</div>
        </div>
      </div>
    </div>
  );
}

function ThemeToggleButton() {
  const { theme, toggle } = useTheme();
  return (
    <Button variant="outline" className="h-9 px-3 text-sm" onClick={toggle} style={{ borderColor: 'hsl(var(--border))' }}>
      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
    </Button>
  );
}
