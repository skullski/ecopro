import React, { useState } from 'react';
import { TemplateProps } from '@/pages/storefront/templates/types';

export default function Fashion2Template(props: TemplateProps) {
  const { navigate, storeSlug } = props;
  const [bagCount, setBagCount] = useState(0);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);

  const { products = [], settings = {}, categories = [] } = props;
  const storeName = settings.store_name || 'LineaWear';
  const city = settings.store_description?.split('·')[0] || 'Algiers';
  const tagline = settings.template_hero_subtitle || 'Modern Fashion';

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
      <div className="fixed bottom-6 right-6 z-40">
        <button className="rounded-full bg-black text-white font-semibold px-5 py-3 flex items-center gap-2 shadow-lg hover:shadow-xl transition">
          Bag <span className="w-6 h-6 rounded-full bg-white text-black text-xs flex items-center justify-center font-bold">{bagCount}</span>
        </button>
      </div>

      <header className="bg-white/90 backdrop-blur border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center text-xs font-bold">LW</div>
              <div>
                <h1 className="font-serif text-xl font-semibold">{storeName}</h1>
                <p className="text-xs text-gray-600">Men · Women · Street · Tailored</p>
              </div>
            </div>
            <div className="hidden md:flex flex-1 mx-6">
              <input
                type="text"
                placeholder="Search jackets, cargos, sneakers..."
                value={props.searchQuery || ''}
                onChange={(e) => props.setSearchQuery(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <div><span className="font-semibold">Wishlist</span> {wishlist.length}</div>
              <div className="text-xs text-gray-500">{city}</div>
            </div>
          </div>
        </div>
      </header>

      <section className="border-b border-gray-200 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="mb-6">
            <span className="inline-block text-xs font-bold bg-gray-200 text-gray-900 px-3 py-1 rounded-full mb-3">Season Drop · Fashion Store</span>
            <h2 className="font-serif text-3xl font-semibold mb-3 max-w-2xl">{settings.template_hero_heading || 'Build a fashion store that feels like a campaign'}</h2>
            <p className="text-sm text-gray-600 max-w-xl">{settings.template_hero_subtitle || 'Push your key pieces first'}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.9fr] gap-6">
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-white">
              <img
                src={settings.banner_url || 'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?auto=format&fit=crop&w=1200&q=80'}
                alt="Hero"
                className="w-full h-96 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4">
                <div className="text-sm font-semibold">{settings.template_hero_heading || 'Featured Collection'}</div>
                <div className="text-xs text-gray-300">{settings.template_button_text || 'Shop Now'}</div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {products.slice(0, 2).map((p: any) => (
                <div key={p.id} className="relative rounded-2xl overflow-hidden border border-gray-200 bg-white">
                  <img
                    src={p.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80'}
                    alt={p.title}
                    className="w-full h-44 object-cover"
                  />
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

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
          <aside className="bg-white rounded-2xl border border-gray-200 p-4 h-fit">
            <div className="text-sm font-semibold mb-4">Filters</div>
            <div className="mb-5">
              <label className="text-xs font-bold text-gray-600 uppercase block mb-2">Gender</label>
              <div className="space-y-2">
                {genders.map(g => (
                  <button key={g} className="block text-sm w-full text-left px-3 py-2 rounded hover:bg-gray-100">
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-5">
              <label className="text-xs font-bold text-gray-600 uppercase block mb-2">Category</label>
              <div className="space-y-2">
                {categoryList.map(cat => (
                  <button key={cat} className="block text-sm w-full text-left px-3 py-2 rounded hover:bg-gray-100">
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-5">
              <label className="text-xs font-bold text-gray-600 uppercase block mb-2">Size</label>
              <div className="flex flex-wrap gap-2">
                {sizes.map(s => (
                  <button key={s} className="text-xs px-3 py-1 rounded-full border border-gray-200 hover:bg-gray-100">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold">{filteredProducts.length} Items</h3>
                <p className="text-xs text-gray-600">{wishlist.length} Wishlisted</p>
              </div>
              <select value={props.sortOption} onChange={(e) => props.setSortOption(e.target.value as any)} className="text-xs border border-gray-200 rounded-full px-3 py-2">
                <option>Featured</option>
                <option>Price Low-High</option>
                <option>Price High-Low</option>
                <option>Newest</option>
              </select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map((p: any) => (
                <div 
                  key={p.id} 
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition cursor-pointer group flex flex-col"
                  onClick={() => navigate(p.slug && p.slug.length > 0 ? `/store/${storeSlug}/${p.slug}` : `/product/${p.id}`)}
                >
                  <div className="relative h-64 bg-gray-100 overflow-hidden flex-grow">
                    <img src={p.images?.[0] || 'https://via.placeholder.com/400'} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id); }} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${wishlist.includes(p.id) ? 'bg-black text-white' : 'bg-white text-black border border-gray-200'}`}>
                        ♥
                      </button>
                    </div>
                  </div>
                  <div className="p-3 flex flex-col">
                    <p className="font-semibold text-sm line-clamp-2">{p.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{p.category}</p>
                    <p className="font-bold text-sm mt-2">{p.price} DZD</p>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        navigate(p.slug && p.slug.length > 0 ? `/store/${storeSlug}/checkout/${p.slug}` : `/checkout/${p.id}`);
                      }} 
                      className="w-full mt-3 py-2 bg-black text-white text-xs font-semibold rounded hover:bg-gray-900"
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

      <footer className="border-t border-gray-200 mt-12 py-8 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-3">About</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li><a href="#" className="hover:text-black">About Us</a></li>
                <li><a href="#" className="hover:text-black">Stories</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li><a href="#" className="hover:text-black">Contact</a></li>
                <li><a href="#" className="hover:text-black">Shipping</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li><a href="#" className="hover:text-black">Privacy</a></li>
                <li><a href="#" className="hover:text-black">Terms</a></li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-gray-600 text-center">&copy; 2024 {storeName}</p>
        </div>
      </footer>
    </div>
  );
}
