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

  const heroMainList = useMemo(() => parseList(
    settings?.banner_url,
    [
      settings?.hero_main_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1600&auto=format&fit=crop'
    ]
  ), [settings?.banner_url, settings?.hero_main_url]);

  const heroTile1List = useMemo(() => parseList(
    settings?.hero_tile1_url,
    ['https://images.unsplash.com/photo-1519741497674-611b54f68947?q=80&w=1200&auto=format&fit=crop']
  ), [settings?.hero_tile1_url]);

  const heroTile2List = useMemo(() => parseList(
    settings?.hero_tile2_url,
    ['https://images.unsplash.com/photo-1520975922203-c0d7a3b5c7a9?q=80&w=1200&auto=format&fit=crop']
  ), [settings?.hero_tile2_url]);

  const DEFAULTS = {
    product: 'https://images.unsplash.com/photo-1519744346361-7fa1c1b421c9?q=80&w=800&auto=format&fit=crop',
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
  const featured = products.slice(0, 6);
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
      {/* Header */}
      <div
        className="border-b futuristic-neon"
        style={{
          borderColor: 'hsl(var(--border))',
          backgroundImage: 'linear-gradient(90deg, hsl(var(--header-bg-from)), hsl(var(--header-bg-via)), hsl(var(--header-bg-to)))',
        }}
      >
        <div className="mx-auto max-w-7xl px-4 py-3 grid grid-cols-3 items-center">
          <div className="col-span-1">
            <div className="flex items-center gap-3">
              {settings?.store_logo && (
                <img
                  src={settings.store_logo}
                  alt={settings?.store_name || 'Store logo'}
                  className="w-9 h-9 rounded-full object-cover"
                  style={{ boxShadow: '0 0 0 1px hsl(var(--border))' }}
                />
              )}
              <div className="text-3xl md:text-4xl font-calligraphic tracking-normal">
                <span className="header-gradient-text">
                  {(settings?.store_name || 'MERCURY').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          <div className="col-span-1">
            <div className="relative mx-auto max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search the future"
                className="pl-10 h-9 text-sm rounded-full"
                style={{
                  backgroundColor: 'hsl(var(--input))',
                  borderColor: 'hsl(var(--border))',
                }}
              />
            </div>
          </div>
          <div className="col-span-1 flex justify-end items-center gap-2">
            <Button variant="outline" className="h-9 px-3 text-sm" onClick={() => navigate(`/cart`)}
              style={{ borderColor: 'hsl(var(--border))' }}
            >My Cart</Button>
            {/* Theme toggle */}
            <ThemeToggleButton />
          </div>
        </div>
      </div>

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
                fetchpriority="high"
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
              {featured.map((product) => (
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
                    <span className="text-base font-medium truncate" style={{ color: 'hsl(var(--foreground))' }}>{product.title}</span>
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
