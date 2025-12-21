import React, { useState, useMemo } from 'react';
import { TemplateProps } from '@/pages/storefront/templates/types';
import { useTemplateUniversalSettings } from '@/hooks/useTemplateUniversalSettings';

export default function Fashion2Template(props: TemplateProps) {
  const { navigate, storeSlug } = props;
  const [bagCount, setBagCount] = useState(0);
  const [wishlist, setWishlist] = useState<number[]>([]);

  // Read universal settings from window
  const universalSettings = useTemplateUniversalSettings() || {};

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

  const { products = [], settings = {}, categories = [] } = props;
  
  // Extract universal settings with defaults
  const {
    primary_color = '#000000',
    secondary_color = '#f5f5f5',
    text_color = '#1f2937',
    secondary_text_color = '#6b7280',
  } = useMemo(() => universalSettings as any || {}, [universalSettings]);
  
  const storeName = settings.store_name || 'LineaWear';
  const city = settings.store_description?.split('·')[0] || 'Algiers';
  const tagline = settings.store_description?.split('·')[1]?.trim() || 'Modern street & clean tailoring';
  const heroHeading = settings.template_hero_heading || 'Build a fashion store that feels like a campaign, but behaves like a clean, modern catalog.';
  const buttonText = settings.template_button_text || 'Shop Now';

  const genders = ['All', 'Men', 'Women', 'Unisex'];
  const sizes = ['All', 'XS', 'S', 'M', 'L', 'XL'];
  const categoryList = ['All', ...categories.filter(c => c).slice(0, 5)];

  const filteredProducts = products.filter((p: any) => {
    const search = props.searchQuery?.toLowerCase() || '';
    const matchesSearch = !search || p.title?.toLowerCase().includes(search);
    const matchesCategory = props.categoryFilter === 'all' || p.category === props.categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const toggleWishlist = (id: number) => {
    setWishlist(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Floating Bag */}
      <div className="fixed bottom-4 right-4 z-40">
        <button style={{ backgroundColor: primary_color, color: secondary_color }} className="rounded-full font-semibold text-xs px-3 py-2 flex items-center gap-2 shadow-lg">
          Bag
          <span style={{ backgroundColor: secondary_color, color: primary_color }} className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">{bagCount}</span>
        </button>
      </div>

      {/* Header */}
      <header className="bg-white/90 backdrop-blur border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div style={{ backgroundColor: primary_color, color: secondary_color }} className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold">LW</div>
            <div>
              <div style={{ color: text_color }} className="font-serif text-lg font-semibold leading-tight">{storeName}</div>
              <div className="text-xs text-gray-500">Men · Women · Street · Tailored</div>
            </div>
          </div>

          <div className="hidden md:flex flex-1 mx-4">
            <input
              type="text"
              value={props.searchQuery || ''}
              onChange={(e) => props.setSearchQuery(e.target.value)}
              placeholder="Search jackets, cargos, sneakers..."
              className="w-full text-sm border border-gray-200 rounded-full px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-400 bg-gray-50"
            />
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-600">
            <div className="hidden sm:flex items-center gap-1">
              <span>Wishlist</span>
              <span style={{ backgroundColor: primary_color, color: secondary_color }} className="px-2 py-0.5 rounded-full">{wishlist.length}</span>
            </div>
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs">{city}</span>
              <span className="text-xs text-gray-400">{tagline}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - 3 Image Grid */}
      <section className="border-b border-gray-200 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-8">
          <div className="mb-5">
            <span className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-3" style={{ backgroundColor: primary_color, color: secondary_color }}>Season drop · Fashion store</span>
            <h2 style={{ color: text_color }} className="font-serif text-2xl sm:text-3xl font-semibold mt-3 leading-tight max-w-xl">{heroHeading}</h2>
            <p className="text-sm text-gray-600 mt-2 max-w-md">{settings.template_hero_subtitle || 'Push your key pieces first. Then let filters, sizes and structure do their job in the catalog below.'}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.9fr] gap-6">
            {/* Left – Main product */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-white h-96">
              <img
                src={settings.banner_url || products[0]?.images?.[0] || 'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?auto=format&fit=crop&w=1200&q=80'}
                alt="Hero"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4">
                <div className="text-sm font-semibold">{products[0]?.title || 'Featured Product'}</div>
                <div className="text-xs text-gray-300">{products[0]?.price || 'Price'} DZD</div>
                <button onClick={() => handleBuyClick(products[0])} className="mt-2 text-xs py-1 px-3 rounded-full bg-white text-black font-semibold">Shop now</button>
              </div>
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black text-white text-xs uppercase tracking-widest">Drop 01</div>
            </div>

            {/* Right – Two smaller products */}
            <div className="flex flex-col gap-4">
              {products.slice(1, 3).map((p: any) => (
                <div key={p.id} className="relative rounded-2xl overflow-hidden border border-gray-200 bg-white h-44">
                  <img src={p.images?.[0] || 'https://via.placeholder.com/400'} alt={p.title} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-3">
                    <div className="text-sm font-semibold line-clamp-1">{p.title}</div>
                    <div className="text-xs text-gray-300">{p.price} DZD</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-7">
        <div className="grid grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)] gap-6">
          {/* Filters Sidebar */}
          <aside className="bg-white rounded-2xl border border-gray-200 p-4 h-fit">
            <div className="text-sm font-semibold mb-3">Filters</div>

            <div className="mb-4">
              <div className="text-xs font-bold uppercase text-gray-600 mb-2">Gender</div>
              <div className="flex flex-wrap gap-2 text-xs">
                {genders.map(g => (
                  <button key={g} className="filter-pill px-3 py-1 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-100">
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs font-bold uppercase text-gray-600 mb-2">Category</div>
              <div className="flex flex-wrap gap-2 text-xs">
                {categoryList.map(cat => (
                  <button key={cat} className="filter-pill px-3 py-1 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-100">
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs font-bold uppercase text-gray-600 mb-2">Size</div>
              <div className="flex flex-wrap gap-2 text-xs">
                {sizes.map(s => (
                  <button key={s} className="filter-pill px-3 py-1 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-100">
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold uppercase text-gray-600 mb-2">Price (max)</div>
              <select className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-gray-50">
                <option>Any</option>
                <option>Up to 6,000 DZD</option>
                <option>Up to 12,000 DZD</option>
                <option>Up to 20,000 DZD</option>
              </select>
            </div>
          </aside>

          {/* Product Area */}
          <section>
            {/* Top bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <div className="text-xs font-bold uppercase text-gray-600">All items</div>
                <h3 style={{ color: text_color }} className="font-serif text-lg font-semibold mt-1">Catalog</h3>
              </div>
              <div className="flex items-center gap-3 justify-between sm:justify-end">
                <div className="text-xs text-gray-600">{filteredProducts.length} items · Wishlist: {wishlist.length}</div>
                <select value={props.sortOption} onChange={(e) => props.setSortOption(e.target.value as any)} className="text-xs border border-gray-200 rounded-full px-3 py-1.5 bg-white">
                  <option>Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>New arrivals</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((p: any) => (
                <div key={p.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-400 transition cursor-pointer" onClick={() => handleProductClick(p)}>
                  <div className="relative">
                    <img src={p.images?.[0] || 'https://via.placeholder.com/400'} alt={p.title} className="w-full h-60 object-cover" />
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      <button onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id); }} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${ wishlist.includes(p.id) ? 'bg-black text-white border-0' : 'bg-white border border-gray-200 text-gray-800'}`}>♥</button>
                    </div>
                  </div>
                  <div className="p-3">
                    <div style={{ color: text_color }} className="text-sm font-semibold line-clamp-2">{p.title}</div>
                    <div className="text-xs text-gray-600 mt-1">{p.category}</div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs font-semibold">{p.price} DZD</div>
                    </div>
                    <button onClick={(e) => handleBuyClick(p, e)} className="w-full text-xs py-1.5 rounded-full mt-3" style={{ backgroundColor: primary_color, color: secondary_color, fontWeight: '600' }}>Add to bag</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 text-xs text-gray-600 flex flex-col sm:flex-row gap-2 sm:justify-between">
          <span>© {new Date().getFullYear()} {storeName} · Fashion store</span>
          <div className="flex gap-3">
            <span>Lookbook</span>
            <span>Shipping</span>
            <span>Returns</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
