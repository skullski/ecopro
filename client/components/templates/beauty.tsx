import React, { useState } from 'react';
import { TemplateProps } from '@/pages/storefront/templates/types';

export default function BeautyTemplate(props: TemplateProps) {
  const { navigate, storeSlug } = props;
  const [bagCount, setBagCount] = useState(0);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [routine, setRoutine] = useState('All');
  const [concern, setConcern] = useState('All');

  // Helper functions to save product data and navigate
  const handleProductClick = (product: any) => {
    localStorage.setItem(`product_${product.id}`, JSON.stringify(product));
    navigate(`/product/${product.id}`);
  };

  const handleBuyClick = (product: any, e?: any) => {
    if (e) e.stopPropagation();
    localStorage.setItem(`product_${product.id}`, JSON.stringify(product));
    navigate(`/checkout/${product.id}`);
  };
  const [typeFilter, setTypeFilter] = useState('All');
  const [maxPrice, setMaxPrice] = useState(999999);
  const [selectedShadeId, setSelectedShadeId] = useState('s1');
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);

  const { products = [], settings = {}, formatPrice = (p: number) => `${p}` } = props;

  const concerns = ['Hydration', 'Acne', 'Glow', 'Barrier', 'Anti-aging'];
  const shades = [
    { id: 's1', hex: '#fbe4d5' },
    { id: 's2', hex: '#f4c7a1' },
    { id: 's3', hex: '#e7a76c' },
    { id: 's4', hex: '#c78453' },
    { id: 's5', hex: '#8a5a3d' }
  ];

  const filteredProducts = products.filter((p: any) => {
    const bySearch = search ? p.title?.toLowerCase().includes(search.toLowerCase()) : true;
    const byRoutine = routine === 'All' ? true : p.category === routine;
    const byConcern = concern === 'All' ? true : true;
    const byType = typeFilter === 'All' ? true : true;
    const byPrice = (p.price || 0) <= maxPrice;
    return bySearch && byRoutine && byConcern && byType && byPrice;
  });

  const toggleWishlist = (id: number) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const addToBag = () => {
    setBagCount(c => c + 1);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fff6fb' }}>
      {/* Floating bag */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          style={{ backgroundColor: '#111827', color: '#fef2f2' }}
          className="rounded-full px-3 py-1.5 flex items-center gap-2 shadow-lg text-[11px] font-medium"
        >
          <span>Bag</span>
          <span
            style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}
            className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold"
          >
            {bagCount}
          </span>
        </button>
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-40 backdrop-blur border-b" style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderBottomColor: '#fce7f3' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-semibold tracking-[0.16em]"
              style={{ backgroundColor: '#111827', color: '#fef2f2' }}
            >
              {settings.store_name ? settings.store_name.substring(0, 2).toUpperCase() : 'BS'}
            </div>
            <div>
              <div className="font-serif text-lg font-semibold leading-tight">
                {settings.store_name || 'BloomSkin'}
              </div>
              <div className="text-[11px]" style={{ color: '#9f7a85' }}>
                Skin · Color · Rituals · K‑beauty · Clinical
              </div>
            </div>
          </div>

          <div className="hidden md:flex flex-1 mx-4">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search serums, tints, cleansers..."
              className="w-full text-sm rounded-full px-3 py-1.5 focus:outline-none border"
              style={{
                borderColor: '#fce7f3',
                backgroundColor: '#fff7fb',
                color: '#111827'
              }}
            />
          </div>

          <div className="flex items-center gap-3 text-[11px]" style={{ color: '#7b4351' }}>
            <div className="hidden sm:flex items-center gap-1">
              <span>Wishlist</span>
              <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: '#fee2e2' }}>
                {wishlist.length}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section
        className="border-b"
        style={{
          borderBottomColor: '#fce7f3',
          background: 'radial-gradient(circle at top left, #ffe4ec 0, #fff7fb 40%, #ffffff 100%)'
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-8">
          <div className="text-center max-w-3xl mx-auto mb-6">
            <span
              className="inline-block rounded-full px-3 py-1 text-[11px] font-medium tracking-[0.16em] uppercase"
              style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}
            >
              Beauty store · Full options
            </span>
            <h2 className="font-serif text-xl md:text-2xl sm:text-2xl md:text-xl md:text-2xl font-semibold mt-4 leading-tight">
              {settings.template_hero_heading || 'A clean, modern beauty store built around routines, concerns and shades'}
            </h2>
            <p className="text-sm mt-3" style={{ color: '#6b7280' }}>
              {settings.template_hero_subtitle || 'Filter by skin concern, routine time, product type and price. Wishlist your favorites and explore base shades.'}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <button
                className="rounded-full px-4 py-2 text-xs font-semibold tracking-[0.14em] uppercase"
                style={{ backgroundColor: '#111827', color: '#f9fafb' }}
              >
                Explore products
              </button>
              <button
                className="rounded-full px-4 py-2 text-xs font-semibold tracking-[0.14em] uppercase border"
                style={{ borderColor: '#fecaca', backgroundColor: '#fff7f7', color: '#b91c1c' }}
              >
                Browse routines
              </button>
            </div>
          </div>

          {/* Shade finder */}
          <div className="rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center border" style={{ backgroundColor: '#ffffff', borderColor: '#f3d5dd' }}>
            <div className="flex-1">
              <div className="text-[11px] tracking-[0.16em] uppercase mb-1" style={{ color: '#9f7a85' }}>
                Shade finder
              </div>
              <div className="font-serif text-lg font-semibold">Skin Veil Tint</div>
              <div className="text-[12px] mt-1 mb-2" style={{ color: '#6b7280' }}>
                Tap a shade to preview the tint and details.
              </div>
              <div className="flex gap-2 flex-wrap mb-2">
                {shades.map(sh => (
                  <button
                    key={sh.id}
                    className={`w-4 h-4 rounded-full border ${selectedShadeId === sh.id ? 'outline outline-2 outline-offset-2' : ''}`}
                    style={{
                      backgroundColor: sh.hex,
                      borderColor: 'rgba(0,0,0,0.08)',
                      outlineColor: selectedShadeId === sh.id ? '#111827' : 'transparent'
                    }}
                    onClick={() => setSelectedShadeId(sh.id)}
                  />
                ))}
              </div>
              <div className="text-[12px]" style={{ color: '#4b5563' }}>
                <span className="font-semibold">Skin Veil Tint · Shade 01</span> · Light neutral with soft yellow undertone. · 4200 DZD
              </div>
            </div>
            <div className="w-full sm:w-40 rounded-2xl overflow-hidden border" style={{ borderColor: '#f3d5dd', backgroundColor: '#fff7fb' }}>
              <img
                src={products[0]?.images?.[0] || 'https://images.unsplash.com/photo-1585386959984-a4155223f3f8?auto=format&fit=crop&w=900&q=80'}
                alt="Shade product"
                className="w-full object-cover"
                style={{ height: '128px' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* MAIN LAYOUT */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-7">
        <div className="grid grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)] gap-3 md:gap-4">
          {/* FILTERS */}
          <aside className="rounded-2xl border p-4 h-fit" style={{ backgroundColor: '#ffffff', borderColor: '#fce7f3' }}>
            <div className="text-sm font-semibold mb-3">Filters</div>

            <div className="mb-4">
              <div className="text-[11px] tracking-[0.16em] uppercase mb-1" style={{ color: '#9f7a85' }}>
                Routine
              </div>
              <div className="flex flex-wrap gap-2 text-[11px]">
                {['All', 'Morning', 'Evening'].map(r => (
                  <button
                    key={r}
                    onClick={() => setRoutine(r)}
                    className="rounded-full border px-3 py-1 whitespace-nowrap transition"
                    style={{
                      backgroundColor: routine === r ? '#111827' : '#fff8fb',
                      color: routine === r ? '#fef2f2' : '#7b4351',
                      borderColor: routine === r ? '#111827' : '#f3d5dd'
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-[11px] tracking-[0.16em] uppercase mb-1" style={{ color: '#9f7a85' }}>
                Skin concern
              </div>
              <div className="flex flex-wrap gap-2 text-[11px]">
                {['All', ...concerns].map(c => (
                  <button
                    key={c}
                    onClick={() => setConcern(c)}
                    className="rounded-full border px-3 py-1 whitespace-nowrap transition"
                    style={{
                      backgroundColor: concern === c ? '#111827' : '#fff8fb',
                      color: concern === c ? '#fef2f2' : '#7b4351',
                      borderColor: concern === c ? '#111827' : '#f3d5dd'
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-[11px] tracking-[0.16em] uppercase mb-1" style={{ color: '#9f7a85' }}>
                Product type
              </div>
              <div className="flex flex-wrap gap-2 text-[11px]">
                {['All', 'clinical', 'premium', 'luxury', 'kbeauty'].map(t => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className="rounded-full border px-3 py-1 whitespace-nowrap transition"
                    style={{
                      backgroundColor: typeFilter === t ? '#111827' : '#fff8fb',
                      color: typeFilter === t ? '#fef2f2' : '#7b4351',
                      borderColor: typeFilter === t ? '#111827' : '#f3d5dd'
                    }}
                  >
                    {t === 'All' ? 'All' : t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] tracking-[0.16em] uppercase mb-1" style={{ color: '#9f7a85' }}>
                Price (max)
              </div>
              <select
                className="w-full text-xs rounded-md px-2 py-1.5 border"
                style={{
                  borderColor: '#fce7f3',
                  backgroundColor: '#fff7fb',
                  color: '#111827'
                }}
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
              >
                <option value={999999}>Any</option>
                <option value={4000}>Up to 4,000 DZD</option>
                <option value={8000}>Up to 8,000 DZD</option>
                <option value={12000}>Up to 12,000 DZD</option>
              </select>
            </div>
          </aside>

          {/* PRODUCT AREA */}
          <section>
            {/* Top bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <div className="text-[11px] tracking-[0.16em] uppercase" style={{ color: '#9f7a85' }}>
                  {routine === 'All' && concern === 'All' && typeFilter === 'All' ? 'All products' : 'Filtered selection'}
                </div>
                <h3 className="font-serif text-lg font-semibold mt-1">Catalog</h3>
              </div>
              <div className="text-[11px]" style={{ color: '#9f7a85' }}>
                {filteredProducts.length} items · Wishlist: {wishlist.length}
              </div>
            </div>

            {/* Products grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4 md:mb-6">
              {filteredProducts.map((p: any) => (
                <div
                  key={p.id}
                  className="rounded-2xl border overflow-hidden flex flex-col transition hover:-translate-y-1 cursor-pointer"
                  style={{
                    backgroundColor: '#ffffff',
                    borderColor: '#f3d5dd',
                    boxShadow: 'none'
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 18px 40px rgba(185, 28, 28, 0.18)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                  onClick={() => navigate(p.slug && p.slug.length > 0 ? `/store/${storeSlug}/${p.slug}` : `/product/${p.id}`)}
                >
                  <div className="relative">
                    <img
                      src={p.images?.[0] || 'https://via.placeholder.com/400'}
                      alt={p.title}
                      className="w-full object-cover"
                      style={{ height: '190px' }}
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      <button
                        className="w-6 h-6 rounded-full flex items-center justify-center text-sm border transition"
                        style={{
                          backgroundColor: wishlist.includes(p.id) ? '#111827' : '#ffffff',
                          color: wishlist.includes(p.id) ? '#fef2f2' : '#111827',
                          borderColor: wishlist.includes(p.id) ? '#111827' : '#f3d5dd'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(p.id);
                        }}
                      >
                        ♥
                      </button>
                    </div>
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <div className="font-semibold text-sm line-clamp-2" style={{ color: '#1f2933' }}>
                      {p.title}
                    </div>
                    <div className="text-[11px] mt-1" style={{ color: '#9f7a85' }}>
                      {p.category || 'Product'} · {p.price}
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <div className="text-xs" style={{ color: '#7b4351' }}>
                        {formatPrice(p.price)} DZD
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/checkout/${p.id}`);
                        }}
                        className="text-[11px] px-3 py-1 rounded-full font-semibold text-white"
                        style={{ backgroundColor: '#111827' }}
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Ingredients glossary */}
            <div className="rounded-2xl border p-4" style={{ backgroundColor: '#ffffff', borderColor: '#fce7f3' }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-[11px] tracking-[0.16em] uppercase" style={{ color: '#9f7a85' }}>
                    Ingredients
                  </span>
                  <h4 className="font-serif text-base font-semibold mt-1">Glossary</h4>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px]">
                <div className="rounded-xl border p-3" style={{ backgroundColor: '#fff8fb', borderColor: '#fce7f3' }}>
                  <div className="font-semibold mb-1" style={{ color: '#7b4351' }}>
                    Niacinamide <span className="text-[10px]">(10%)</span>
                  </div>
                  <div style={{ color: '#6b7280' }}>
                    Reduces blemishes, controls oil, refines pores.
                  </div>
                </div>
                <div className="rounded-xl border p-3" style={{ backgroundColor: '#fff8fb', borderColor: '#fce7f3' }}>
                  <div className="font-semibold mb-1" style={{ color: '#7b4351' }}>
                    Hyaluronic Acid <span className="text-[10px]">(2%)</span>
                  </div>
                  <div style={{ color: '#6b7280' }}>
                    Multi-weight hydration for different skin layers.
                  </div>
                </div>
                <div className="rounded-xl border p-3" style={{ backgroundColor: '#fff8fb', borderColor: '#fce7f3' }}>
                  <div className="font-semibold mb-1" style={{ color: '#7b4351' }}>
                    Retinol <span className="text-[10px]">(0.2%)</span>
                  </div>
                  <div style={{ color: '#6b7280' }}>
                    Supports texture, fine lines and cell turnover.
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t" style={{ borderTopColor: '#fce7f3', backgroundColor: '#ffffff' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 text-[11px] flex flex-col sm:flex-row gap-2 sm:justify-between" style={{ color: '#9f7a85' }}>
          <span>
            © {new Date().getFullYear()} {settings.store_name || 'BloomSkin'} · Beauty & skincare store
          </span>
          <div className="flex gap-3">
            <span>Ingredients</span>
            <span>Routines</span>
            <span>Customer care</span>
          </div>
        </div>
      </footer>

      {/* QUICK VIEW DRAWER */}
      {quickViewProduct && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)' }}
          onClick={() => setQuickViewProduct(null)}
        >
          <div
            className="w-96 max-w-full bg-white h-full p-4 shadow-2xl overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">{quickViewProduct.title}</div>
              <button
                className="text-xs text-gray-500"
                onClick={() => setQuickViewProduct(null)}
              >
                Close
              </button>
            </div>
            <div className="rounded-xl overflow-hidden border mb-3" style={{ borderColor: '#fce7f3' }}>
              <img
                src={quickViewProduct.images?.[0] || 'https://via.placeholder.com/400'}
                alt={quickViewProduct.title}
                className="w-full object-cover"
                style={{ height: '176px' }}
              />
            </div>
            <div className="text-[11px] mb-2" style={{ color: '#9f7a85' }}>
              {quickViewProduct.category || 'Product'} · Details
            </div>
            <div className="text-[12px] mb-2" style={{ color: '#111827' }}>
              {formatPrice(quickViewProduct.price)} DZD
            </div>
            <div className="text-[12px] mb-3" style={{ color: '#f59e0b' }}>
              ★★★★★ <span style={{ color: '#9ca3af' }}>(5 reviews)</span>
            </div>
            <p className="text-[11px] mb-3" style={{ color: '#6b7280' }}>
              {quickViewProduct.description || 'Premium beauty product for your skincare routine.'}
            </p>
            <div className="flex gap-2">
              <button
                className="flex-1 py-2 rounded-full text-[11px] font-semibold tracking-[0.14em] uppercase border-2"
                style={{ borderColor: '#111827', color: '#111827', backgroundColor: 'transparent' }}
                onClick={() => {
                  setQuickViewProduct(null);
                  navigate(quickViewProduct.slug && quickViewProduct.slug.length > 0 ? `/store/${storeSlug}/${quickViewProduct.slug}` : `/product/${quickViewProduct.id}`);
                }}
              >
                View Details
              </button>
              <button
                className="flex-1 py-2 rounded-full text-[11px] font-semibold tracking-[0.14em] uppercase"
                style={{ backgroundColor: '#111827', color: '#f9fafb' }}
                onClick={() => {
                  setQuickViewProduct(null);
                  navigate(`/checkout/${quickViewProduct.id}`);
                }}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
