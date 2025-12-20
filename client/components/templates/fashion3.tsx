import React, { useState, useMemo } from 'react';
import { TemplateProps } from '@/pages/storefront/templates/types';
import { useTemplateUniversalSettings } from '@/hooks/useTemplateUniversalSettings';

export default function Fashion3Template(props: TemplateProps) {
  const universalSettings = useTemplateUniversalSettings();
  const { navigate, storeSlug } = props;
  const [bagCount, setBagCount] = useState(0);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('All');
  const [category, setCategory] = useState('All');

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
  const [size, setSize] = useState('All');
  const [maxPrice, setMaxPrice] = useState(999999);
  const [sortBy, setSortBy] = useState('featured');
  const [lookIndex, setLookIndex] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);

  const { products = [], settings = {}, categories = [] } = props;
  
  // Extract universal settings with defaults
  const {
    primary_color = '#1f2937',
    secondary_color = '#ffffff',
    accent_color = '#3b82f6',
    text_color = '#1f2937',
    secondary_text_color = '#6b7280',
    font_family = 'Inter',
    heading_size_multiplier = 'Large',
    enable_animations = true,
  } = useMemo(() => universalSettings as any || {}, [universalSettings]);
  
  const storeName = settings.store_name || 'LineaWear';
  const city = 'Algiers';

  const filteredProducts = products
    .filter((p: any) => {
      const bySearch = search ? p.title?.toLowerCase().includes(search.toLowerCase()) : true;
      const byGender = gender === 'All' ? true : p.category === gender;
      const byCategory = category === 'All' ? true : p.category === category;
      const bySize = size === 'All' ? true : true;
      const byPrice = p.price <= maxPrice;
      return bySearch && byGender && byCategory && bySize && byPrice;
    })
    .sort((a: any, b: any) => {
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      if (sortBy === 'new') return b.id - a.id;
      return 0;
    });

  const toggleWishlist = (id: number) => {
    setWishlist(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const lookbook = [
    { name: 'Urban Nomad', description: 'City exploration edit', images: [products[0]?.images?.[0] || 'https://via.placeholder.com/400'], items: [] },
    { name: 'Night Shift', description: 'Evening essentials', images: [products[1]?.images?.[0] || 'https://via.placeholder.com/400'], items: [] },
  ];

  const currentLook = lookbook[lookIndex] || lookbook[0];

  const hotspotPoints = [
    { id: 1, x: '30%', y: '40%', label: 'Oversized Coat', price: 16000, productKey: 'coat' },
    { id: 2, x: '60%', y: '65%', label: 'Tapered Trousers', price: 7800, productKey: 'trousers' },
    { id: 3, x: '80%', y: '70%', label: 'Minimal Sneakers', price: 9500, productKey: 'sneakers' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: primary_color }}>
      {/* Floating Bag */}
      <div className="fixed bottom-6 right-6 z-40">
        <button className="rounded-full font-semibold px-5 py-3 flex items-center gap-2 shadow-lg transition" style={{ backgroundColor: accent_color, color: secondary_color, border: `1px solid ${accent_color}` }}>
          Bag <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: primary_color, color: accent_color }}>{bagCount}</span>
        </button>
      </div>

      {/* Seasonal Drop Banner */}
      <div className="text-xs px-4 py-2 flex items-center justify-center gap-3 font-semibold" style={{ backgroundImage: `linear-gradient(to right, ${accent_color}, ${accent_color}cc)`, color: secondary_color }}>
        <span className="uppercase tracking-widest">Drop 01 · Night Shift</span>
        <span className="hidden sm:inline text-xs">Oversized coat, cargos and sneakers — limited run.</span>
        <button className="rounded-full px-3 py-0.5 uppercase text-xs font-semibold transition" style={{ border: `1px solid ${secondary_color}`, backgroundColor: primary_color, color: accent_color }}>Shop</button>
      </div>

      {/* Header */}
      <header className="backdrop-blur sticky top-0 z-40" style={{ backgroundColor: `${primary_color}E6`, borderBottom: `1px solid ${secondary_text_color}30` }}>
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: accent_color, color: secondary_color }}>LW</div>
              <div>
                <h1 className="font-serif text-lg font-semibold" style={{ color: secondary_color }}>{storeName}</h1>
                <p className="text-xs" style={{ color: secondary_text_color }}>Men · Women · Street · Tailored</p>
              </div>
            </div>
            <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="hidden md:block text-sm rounded-full px-4 py-2" style={{ border: `1px solid ${secondary_text_color}40`, backgroundColor: `${secondary_color}20`, color: text_color }} />
            <div className="flex items-center gap-4 text-xs" style={{ color: secondary_text_color }}>
              <div>Wishlist {wishlist.length}</div>
              <div>{city}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero + Hotspot + Lookbook Section */}
      <section className="border-b border-gray-700 bg-gray-900">
        <div className="max-w-6xl mx-auto px-6 py-4 md:py-6 space-y-3 md:space-y-4">
          {/* Video Hero + Hotspot Split */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.95fr] gap-3 md:gap-4">
            {/* Video Hero */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-700 bg-black h-80">
              <video autoPlay muted loop className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex items-end justify-between p-6">
                <div>
                  <p className="text-yellow-400 text-xs font-bold uppercase mb-2">Night Shift · Video Hero</p>
                  <h2 className="font-serif text-2xl font-semibold text-white">A fashion store that opens on a scene, not a grid.</h2>
                </div>
                <div className="flex gap-2">
                  <button className="text-xs px-4 py-2 rounded-full bg-yellow-400 text-gray-900 font-bold uppercase">Shop</button>
                  <button className="text-xs px-4 py-2 rounded-full border border-gray-500 text-white uppercase">View Looks</button>
                </div>
              </div>
            </div>

            {/* Hotspot Outfit */}
            <div className="flex flex-col gap-4">
              <div className="relative rounded-2xl overflow-hidden h-56" style={{ border: `1px solid ${secondary_text_color}30`, backgroundColor: primary_color }}>
                <img src={products[0]?.images?.[0] || 'https://via.placeholder.com/400'} alt="Outfit" className="w-full h-full object-cover" />
                {hotspotPoints.map((point) => (
                  <div key={point.id} className="absolute" style={{ top: point.y, left: point.x }} onMouseEnter={() => setActiveHotspot(point.id)} onMouseLeave={() => setActiveHotspot(null)}>
                    <div className="w-4 h-4 rounded-full flex items-center justify-center text-xs cursor-pointer transition" style={{ border: `2px solid ${accent_color}`, backgroundColor: `${primary_color}80`, color: accent_color }}>+</div>
                    {activeHotspot === point.id && (
                      <div className="absolute top-0 left-6 rounded-lg p-2 text-xs whitespace-nowrap z-10" style={{ backgroundColor: primary_color, border: `1px solid ${secondary_text_color}30` }}>
                        <div className="font-semibold" style={{ color: secondary_color }}>{point.label}</div>
                        <div style={{ color: accent_color }}>{point.price} DZD</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="rounded-2xl p-4 flex flex-col justify-between h-40" style={{ border: `1px solid ${secondary_text_color}30`, backgroundImage: `linear-gradient(to right, ${primary_color}66, ${primary_color}33)` }}>
                <div>
                  <p className="text-xs font-bold uppercase mb-1" style={{ color: accent_color }}>Shop the outfit</p>
                  <h3 className="font-serif text-xl font-semibold" style={{ color: secondary_color }}>One side is energy, the other is structure.</h3>
                  <p className="text-xs mt-2" style={{ color: secondary_text_color }}>Campaign video, hotspot outfit and lookbook slider above a clean catalog.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lookbook Slider */}
          <div className="rounded-2xl p-6" style={{ border: `1px solid ${secondary_text_color}30`, backgroundColor: primary_color }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold uppercase" style={{ color: accent_color }}>Lookbook</p>
                <h3 className="font-serif text-2xl font-semibold mt-1" style={{ color: secondary_color }}>{currentLook.name}</h3>
                <p className="text-xs" style={{ color: secondary_text_color }}>{currentLook.description}</p>
              </div>
              <div className="hidden sm:flex gap-2">
                <button onClick={() => setLookIndex(i => i === 0 ? lookbook.length - 1 : i - 1)} className="px-3 py-1 border border-gray-600 rounded-full text-gray-300 hover:border-yellow-400">←</button>
                <button onClick={() => setLookIndex(i => i === lookbook.length - 1 ? 0 : i + 1)} className="px-3 py-1 border border-gray-600 rounded-full text-gray-300 hover:border-yellow-400">→</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.9fr] gap-4">
              <div className="relative rounded-2xl overflow-hidden border border-gray-700 h-64">
                <img src={currentLook.images[0]} alt="Look" className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-black/70 text-yellow-400 text-xs uppercase font-bold">Look {lookIndex + 1}/{lookbook.length}</div>
              </div>
              <div className="flex flex-col justify-between">
                <div className="flex gap-1">
                  {lookbook.map((_, idx) => (
                    <button key={idx} onClick={() => setLookIndex(idx)} className={`w-2 h-2 rounded-full ${idx === lookIndex ? 'bg-yellow-400' : 'border border-yellow-400'}`} />
                  ))}
                </div>
                <div className="sm:hidden flex gap-2">
                  <button onClick={() => setLookIndex(i => i === 0 ? lookbook.length - 1 : i - 1)} className="px-2 py-1 border border-gray-600 rounded-full text-xs">←</button>
                  <button onClick={() => setLookIndex(i => i === lookbook.length - 1 ? 0 : i + 1)} className="px-2 py-1 border border-gray-600 rounded-full text-xs">→</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog */}
      <main className="max-w-6xl mx-auto px-6 py-4 md:py-6">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 md:gap-3 md:gap-4">
          {/* Filters */}
          <aside className="bg-gray-800 rounded-2xl border border-gray-700 p-4 h-fit">
            <div className="text-sm font-semibold mb-4 text-white">Filters</div>
            {[{ label: 'Gender', items: ['All', 'Men', 'Women', 'Unisex'], current: gender, set: setGender }, { label: 'Size', items: ['All', 'XS', 'S', 'M', 'L', 'XL'], current: size, set: setSize }].map((filter) => (
              <div key={filter.label} className="mb-4">
                <label className="text-xs font-bold text-gray-400 uppercase block mb-2">{filter.label}</label>
                <div className="flex flex-wrap gap-2">
                  {filter.items.map((item) => (
                    <button key={item} onClick={() => filter.set(item)} className={`text-xs px-3 py-1 rounded-full border ${filter.current === item ? 'bg-white text-gray-900 border-white' : 'bg-gray-900 text-gray-300 border-gray-700'}`}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </aside>

          {/* Products */}
          <section>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-white">{filteredProducts.length} Items</h3>
                <p className="text-xs text-gray-400">{wishlist.length} Wishlisted</p>
              </div>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-xs border border-gray-700 rounded-full px-3 py-2 bg-gray-800 text-white">
                <option>featured</option>
                <option value="price_low">Price Low-High</option>
                <option value="price_high">Price High-Low</option>
                <option value="new">Newest</option>
              </select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map((p: any) => (
                <div 
                  key={p.id} 
                  className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-yellow-400 transition group cursor-pointer flex flex-col"
                  onClick={() => navigate(p.slug && p.slug.length > 0 ? `/store/${storeSlug}/${p.slug}` : `/product/${p.id}`)}
                >
                  <div className="relative h-56 bg-gray-900 overflow-hidden">
                    <img src={p.images?.[0] || 'https://via.placeholder.com/400'} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(p.id);
                        }} 
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${wishlist.includes(p.id) ? 'bg-yellow-400 text-gray-900' : 'bg-gray-900/50 border border-yellow-400 text-yellow-400'}`}
                      >
                        ♥
                      </button>
                    </div>
                  </div>
                  <div className="p-3 flex flex-col flex-grow">
                    <p className="font-semibold text-sm text-white line-clamp-2">{p.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{p.category}</p>
                    <p className="font-bold text-yellow-400 mt-2">{p.price} DZD</p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/checkout/${p.id}`);
                      }} 
                      className="w-full mt-3 py-2 bg-yellow-400 text-gray-900 rounded font-semibold text-xs hover:bg-yellow-500"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-700 mt-6 md:mt-4 md:mt-6 py-4 md:py-6 bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-4 md:gap-3 md:gap-4 mb-4 md:mb-6">
            {['About', 'Support', 'Legal'].map((section) => (
              <div key={section}>
                <h4 className="font-semibold text-white mb-3">{section}</h4>
                <ul className="text-sm text-gray-400 space-y-2">
                  <li><a href="#" className="hover:text-white">Link 1</a></li>
                  <li><a href="#" className="hover:text-white">Link 2</a></li>
                </ul>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 text-center">&copy; 2024 {storeName}</p>
        </div>
      </footer>
    </div>
  );
}
