import React, { useState, useMemo } from 'react';
import { TemplateProps } from '@/pages/storefront/templates/types';
import { useTemplateUniversalSettings } from '@/hooks/useTemplateUniversalSettings';

export default function Fashion3Template(props: TemplateProps) {
  const universalSettings = useTemplateUniversalSettings();
  const { navigate, storeSlug } = props;
  const [bagCount, setBagCount] = useState(0);
  const [wishlist, setWishlist] = useState<number[]>([]);

  // Helper functions to save product data and navigate
  const handleProductClick = (product: any) => {
    localStorage.setItem(`product_${product.id}`, JSON.stringify(product));
    navigate(`/product/${product.id}`);
  };

  const handleBuyClick = (product: any, e?: any) => {
    if (e) e.stopPropagation();
    localStorage.setItem(`product_${product.id}`, JSON.stringify(product));
    navigate(`checkout/${product.id}`);
  };

  const { products = [], settings = {}, categories = [] } = props;
  
  // Extract universal settings with defaults
  const {
    primary_color = '#000000',
    secondary_color = '#ffffff',
    accent_color = '#FFD700',
    text_color = '#ffffff',
    secondary_text_color = '#999999',
    font_family = 'Inter',
    heading_size_multiplier = 'Large',
    enable_animations = true,
  } = useMemo(() => universalSettings as any || {}, [universalSettings]);
  
  const storeName = settings.store_name || 'LineaWear';
  const city = settings.store_description?.split('·')[0] || 'Algiers';
  const heroHeading = settings.template_hero_heading || 'Premium Essentials';

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
    <div className="min-h-screen bg-black">
      {/* Floating Bag Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button style={{ backgroundColor: accent_color, color: '#000' }} className="rounded-full font-semibold px-5 py-3 flex items-center gap-2 shadow-lg hover:shadow-xl transition">
          Bag <span style={{ backgroundColor: '#000', color: accent_color }} className="w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold">{bagCount}</span>
        </button>
      </div>

      {/* Banner */}
      <div className="text-xs px-4 py-2 flex items-center justify-center gap-3 font-semibold" style={{ backgroundColor: accent_color, color: '#000' }}>
        <span className="uppercase tracking-widest">Limited Drop · Night Shift</span>
        <button className="rounded-full px-3 py-1 uppercase text-xs font-semibold border border-black bg-black text-yellow-400 hover:bg-gray-900 transition">Shop</button>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div style={{ backgroundColor: accent_color, color: '#000' }} className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold">LW</div>
              <div>
                <h1 className="font-semibold text-lg text-white">{storeName}</h1>
                <p className="text-xs text-gray-500">Curated Essentials</p>
              </div>
            </div>
            <div className="hidden md:flex flex-1 mx-8">
              <input
                type="text"
                placeholder="Search collection..."
                value={props.searchQuery || ''}
                onChange={(e) => props.setSearchQuery(e.target.value)}
                className="w-full text-sm border border-gray-700 rounded-full px-4 py-2 bg-gray-950 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-yellow-400"
              />
            </div>
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <div>Wishlist {wishlist.length}</div>
              <div>{city}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-gray-800 bg-gradient-to-b from-gray-950 to-black">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="relative rounded-xl overflow-hidden h-80 border border-gray-800">
              <img
                src={settings.banner_url || 'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?auto=format&fit=crop&w=600&q=80'}
                alt="Hero"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-xs text-yellow-400 font-bold uppercase tracking-wider mb-2">Featured Collection</p>
                <h2 className="text-2xl font-light text-white">{settings.template_hero_heading || 'Minimalist Pieces for the Modern Wardrobe'}</h2>
              </div>
            </div>
            <div>
              <p className="text-xs text-yellow-400 font-bold uppercase tracking-wider mb-4">New Arrival</p>
              <h2 className="text-4xl font-light text-white mb-6">{heroHeading || 'Premium Essentials'}</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">{settings.template_hero_subtitle || 'Timeless pieces designed with intention and built to last.'}</p>
              <button onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })} className="px-8 py-3 bg-yellow-400 text-black text-sm font-semibold rounded-lg hover:bg-yellow-500 transition">
                {settings.template_button_text || 'Explore'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="border-b border-gray-800 bg-black">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {products.slice(0, 2).map((p: any) => (
              <div 
                key={p.id}
                className="group cursor-pointer rounded-lg overflow-hidden border border-gray-800 hover:border-yellow-400 transition"
                onClick={() => handleProductClick(p)}
              >
                <div className="relative h-72 bg-gray-900 overflow-hidden">
                  <img src={p.images?.[0] || 'https://via.placeholder.com/400'} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-40"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-xs text-yellow-400 font-bold uppercase mb-2">Featured</p>
                    <h3 className="text-xl font-light text-white line-clamp-2 mb-2">{p.title}</h3>
                    <p className="text-yellow-400 font-semibold">{p.price} DZD</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Catalog */}
      <main className="bg-black">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-12">
            {/* Filters Sidebar */}
            <aside className="h-fit">
              <div className="text-sm font-semibold text-white mb-8">Filter</div>
              
              <div className="mb-8">
                <label className="text-xs font-semibold uppercase text-gray-500 block mb-4">Gender</label>
                <div className="space-y-3">
                  {['All', 'Men', 'Women', 'Unisex'].map(g => (
                    <button key={g} className="block text-sm text-gray-400 hover:text-white transition font-light">
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <label className="text-xs font-semibold uppercase text-gray-500 block mb-4">Category</label>
                <div className="space-y-3">
                  {categories.slice(0, 5).map((cat: any) => (
                    <button key={cat} className="block text-sm text-gray-400 hover:text-white transition font-light">
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-gray-500 block mb-4">Size</label>
                <div className="flex flex-wrap gap-2">
                  {['All', 'XS', 'S', 'M', 'L', 'XL'].map(s => (
                    <button key={s} className="text-xs px-3 py-2 rounded-lg border border-gray-700 text-gray-400 hover:border-yellow-400 hover:text-white transition">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <section>
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-800">
                <div>
                  <h3 className="text-xl font-light text-white">{filteredProducts.length} Items</h3>
                  <p className="text-xs text-gray-500 mt-1">{wishlist.length} Saved</p>
                </div>
                <select value={props.sortOption} onChange={(e) => props.setSortOption(e.target.value as any)} className="text-sm px-4 py-2 rounded-lg border border-gray-700 bg-gray-950 text-white font-light">
                  <option>Featured</option>
                  <option>Price Low-High</option>
                  <option>Price High-Low</option>
                  <option>Newest</option>
                </select>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {filteredProducts.map((p: any) => (
                  <div 
                    key={p.id}
                    className="group cursor-pointer rounded-lg overflow-hidden border border-gray-800 hover:border-yellow-400 transition flex flex-col"
                    onClick={() => handleProductClick(p)}
                  >
                    <div className="relative h-80 bg-gray-900 overflow-hidden flex-grow">
                      <img src={p.images?.[0] || 'https://via.placeholder.com/400'} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation();
                          toggleWishlist(p.id);
                        }} 
                        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-lg transition"
                        style={{ 
                          backgroundColor: wishlist.includes(p.id) ? accent_color : 'rgba(0,0,0,0.5)',
                          color: wishlist.includes(p.id) ? '#000' : accent_color,
                          border: wishlist.includes(p.id) ? 'none' : `1px solid ${accent_color}`
                        }}
                      >
                        ♥
                      </button>
                    </div>
                    <div className="p-5 flex flex-col flex-grow bg-gray-950">
                      <p className="font-light text-sm text-white line-clamp-2">{p.title}</p>
                      <p className="text-xs text-gray-500 mt-2 font-light">{p.category}</p>
                      <p className="font-semibold text-sm mt-4 text-yellow-400">{p.price} DZD</p>
                      <button 
                        onClick={(e) => handleBuyClick(p, e)}
                        className="w-full mt-4 py-2 text-xs font-semibold rounded-lg bg-yellow-400 text-black hover:bg-yellow-500 transition"
                      >
                        Add to Bag
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black mt-16 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <h4 className="font-semibold text-sm text-white mb-4">About</h4>
              <ul className="text-xs space-y-3">
                <li><a href="#" className="text-gray-500 hover:text-white transition font-light">About Us</a></li>
                <li><a href="#" className="text-gray-500 hover:text-white transition font-light">Stories</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-white mb-4">Support</h4>
              <ul className="text-xs space-y-3">
                <li><a href="#" className="text-gray-500 hover:text-white transition font-light">Contact</a></li>
                <li><a href="#" className="text-gray-500 hover:text-white transition font-light">Shipping</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-white mb-4">Legal</h4>
              <ul className="text-xs space-y-3">
                <li><a href="#" className="text-gray-500 hover:text-white transition font-light">Privacy</a></li>
                <li><a href="#" className="text-gray-500 hover:text-white transition font-light">Terms</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-white mb-4">Connect</h4>
              <ul className="text-xs space-y-3">
                <li><a href="#" className="text-gray-500 hover:text-white transition font-light">Instagram</a></li>
                <li><a href="#" className="text-gray-500 hover:text-white transition font-light">Email</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6">
            <p className="text-xs text-center text-gray-600 font-light">&copy; 2024 {storeName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
