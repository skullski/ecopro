import React, { useState } from 'react';
import { TemplateProps } from '@/pages/storefront/templates/types';

export default function FurnitureTemplate(props: TemplateProps) {
  const { navigate, storeSlug } = props;
  const [cartCount, setCartCount] = useState(0);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [compareList, setCompareList] = useState<number[]>([]);
  const [visibleCount, setVisibleCount] = useState(8);
  const [activeCategory, setActiveCategory] = useState('all');
  const [filters, setFilters] = useState({ category: 'all', maxPrice: 999999, subcategories: [] });

  const { products = [], settings = {}, categories = [] } = props;
  const storeName = settings.store_name || 'RoomGrid';

  const filteredProducts = products.slice(0, visibleCount);
  const canLoadMore = visibleCount < products.length;

  const toggleWishlist = (id: number) => {
    setWishlist(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const toggleCompare = (id: number) => {
    setCompareList(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Floating Cart */}
      <div className="fixed bottom-6 right-6 z-40">
        <button className="rounded-full bg-gray-900 text-white font-semibold px-5 py-3 flex items-center gap-2 shadow-lg">
          Cart <span className="w-6 h-6 rounded-full bg-white text-gray-900 text-xs flex items-center justify-center font-bold">{cartCount}</span>
        </button>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-900 text-white flex items-center justify-center text-xs font-bold">RG</div>
              <div>
                <h1 className="text-sm font-semibold text-gray-900">{storeName}</h1>
                <p className="text-xs text-gray-600">Furniture · Decor · Storage · Lighting</p>
              </div>
            </div>
            <input type="text" placeholder="Search furniture..." className="hidden md:block flex-1 mx-6 text-sm border border-gray-200 rounded-full px-4 py-2" />
            <div className="flex items-center gap-6 text-xs text-gray-700">
              <div>Wishlist {wishlist.length}</div>
              <div>Compare {compareList.length}</div>
              <div>Cart {cartCount}</div>
            </div>
          </div>

          {/* Navigation + Mega Menu */}
          <div className="flex items-center gap-4 text-sm py-2 border-t border-gray-200">
            <div className="relative group">
              <button className="text-gray-700 hover:text-gray-900">Shop by Room ▾</button>
              <div className="absolute left-0 hidden group-hover:block w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
                {['Living Room', 'Bedroom', 'Office', 'Dining'].map((cat) => (
                  <div key={cat} onClick={() => setActiveCategory(cat.toLowerCase())} className="px-3 py-2 hover:bg-gray-100 rounded cursor-pointer text-sm">
                    {cat}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-gray-200 to-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-serif text-3xl font-semibold text-gray-900 mb-3">{settings.template_hero_heading || 'Furniture Collection'}</h2>
          <p className="text-gray-700">Modern, timeless pieces for every room</p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
          {/* Filters Sidebar */}
          <aside className="bg-white rounded-lg border border-gray-200 p-4 h-fit">
            <h3 className="text-sm font-semibold mb-4 text-gray-900">Filters</h3>

            {/* Price Filter */}
            <div className="mb-6">
              <label className="text-xs font-bold text-gray-700 uppercase block mb-2">Price</label>
              <input
                type="range"
                min="0"
                max="100000"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                className="w-full"
              />
              <div className="text-xs text-gray-600 mt-2">Up to {filters.maxPrice} DZD</div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase block mb-2">Category</label>
              <div className="space-y-2">
                {['All', 'Living Room', 'Bedroom', 'Office', 'Dining'].map((cat) => (
                  <label key={cat} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" className="w-4 h-4" />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <section>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{filteredProducts.length} Items</h3>
                <p className="text-xs text-gray-600">{wishlist.length} Wishlisted · {compareList.length} Comparing</p>
              </div>
              <select className="text-xs border border-gray-300 rounded-full px-3 py-2 bg-white">
                <option>Featured</option>
                <option>Price Low-High</option>
                <option>Price High-Low</option>
                <option>Newest</option>
              </select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((p: any) => (
                <div 
                  key={p.id} 
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition group cursor-pointer flex flex-col"
                  onClick={() => navigate(p.slug && p.slug.length > 0 ? `/store/${storeSlug}/${p.slug}` : `/product/${p.id}`)}
                >
                  <div className="relative h-56 bg-gray-100 overflow-hidden">
                    <img src={p.images?.[0] || 'https://via.placeholder.com/400'} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <p className="font-semibold text-sm text-gray-900 line-clamp-2">{p.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{p.category}</p>
                    <p className="font-bold text-lg text-gray-900 mt-2">{p.price} DZD</p>
                    <div className="flex gap-2 mt-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(p.id);
                        }} 
                        className={`flex-1 py-2 text-xs rounded ${wishlist.includes(p.id) ? 'bg-gray-900 text-white' : 'border border-gray-300'}`}
                      >
                        ♥
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCompare(p.id);
                        }} 
                        className={`flex-1 py-2 text-xs rounded ${compareList.includes(p.id) ? 'bg-gray-900 text-white' : 'border border-gray-300'}`}
                      >
                        ⚖
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(p.slug && p.slug.length > 0 ? `/store/${storeSlug}/checkout/${p.slug}` : `/checkout/${p.id}`);
                        }} 
                        className="flex-1 py-2 bg-gray-900 text-white text-xs rounded font-semibold hover:bg-gray-800"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {canLoadMore && (
              <div className="mt-8 text-center">
                <button onClick={() => setVisibleCount(c => c + 8)} className="px-6 py-3 border border-gray-300 rounded-full text-gray-700 hover:border-gray-900 font-semibold text-sm">
                  Load More
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12 py-8 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {['About', 'Support', 'Legal', 'Social'].map((col) => (
              <div key={col}>
                <h4 className="font-semibold text-gray-900 mb-3">{col}</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li><a href="#" className="hover:text-gray-900">Link 1</a></li>
                  <li><a href="#" className="hover:text-gray-900">Link 2</a></li>
                </ul>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600 text-center">&copy; 2024 {storeName}</p>
        </div>
      </footer>
    </div>
  );
}
