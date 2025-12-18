import React, { useState } from 'react';
import { TemplateProps } from '@/pages/storefront/templates/types';

export default function CafeTemplate(props: TemplateProps) {
  const { navigate, storeSlug } = props;
  const [activeCategory, setActiveCategory] = useState('All');

  const products = props.products || [];
  const settings = props.settings || {};

  // Extract settings with defaults
  const storeName = settings.store_name || 'Sweet Home Dz';
  const storeCity = settings.store_city || 'Algiers';
  const accentColor = settings.template_accent_color || '#92400e'; // amber-800

  // Render empty state
  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">☕</div>
          <h1 className="text-3xl font-bold mb-4 text-gray-900">No Products Yet</h1>
          <p className="text-gray-600 mb-6">Add your bakery items to your store to see them displayed here.</p>
          <p className="text-sm text-gray-500">Products will appear automatically once you add them to your store.</p>
        </div>
      </div>
    );
  }

  // Extract categories from products
  const categories = ['All', ...new Set(products.map((p: any) => p.category || 'Menu'))];
  const filtered = activeCategory === 'All' ? products : products.filter((p: any) => (p.category || 'Menu') === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <header className="border-b border-amber-200 bg-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="font-serif text-3xl font-semibold text-gray-900">{storeName}</h1>
          <p className="text-sm text-gray-600 mt-1">{storeCity} · Artisan bakery</p>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-amber-200 py-12 bg-gradient-to-br" style={{ backgroundImage: `linear-gradient(135deg, ${accentColor}20 0%, ${accentColor}10 100%)` }}>
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-serif text-4xl font-semibold mb-4 text-gray-900">Fresh Pastries</h2>
          <p className="text-gray-700 mb-8 text-sm max-w-2xl">Handcrafted bakery items made fresh daily. Order now for delivery.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.slice(0, 6).map(p => (
              <div key={p.id} className="bg-white border border-amber-100 rounded-lg p-4 hover:shadow-lg transition group cursor-pointer">
                <img src={p.images?.[0]} alt={p.name} className="w-full h-40 object-cover rounded mb-3 group-hover:scale-105 transition" />
                <p className="text-sm font-medium text-gray-900">{p.name}</p>
                <p className="font-semibold mt-2" style={{ color: accentColor }}>{p.price} DZD</p>
                <button 
                  className="w-full mt-3 py-2 rounded text-sm font-medium text-white transition"
                  style={{ backgroundColor: accentColor }}
                  onClick={() => navigate(p.slug && p.slug.length > 0 ? `/store/${storeSlug}/checkout/${p.slug}` : `/checkout/${p.id}`)}
                >
                  Order Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <label className="text-xs text-gray-600 uppercase tracking-widest font-semibold block mb-3">Browse by Category</label>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-2 rounded-full text-sm font-medium transition border"
                style={{
                  backgroundColor: activeCategory === cat ? accentColor : 'transparent',
                  color: activeCategory === cat ? '#fff' : accentColor,
                  borderColor: activeCategory === cat ? accentColor : `${accentColor}40`,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div>
          <h3 className="font-serif text-2xl font-semibold mb-6 text-gray-900">
            {activeCategory === 'All' ? 'All Products' : activeCategory}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(p => (
              <div 
                key={p.id} 
                onClick={() => navigate(p.slug && p.slug.length > 0 ? `/store/${storeSlug}/${p.slug}` : `/product/${p.id}`)}
                className="bg-white border border-amber-100 rounded-lg p-4 hover:shadow-lg transition group cursor-pointer flex flex-col"
              >
                <img src={p.images?.[0]} alt={p.name} className="w-full h-40 object-cover rounded mb-3 group-hover:scale-105 transition" />
                <p className="text-sm font-medium text-gray-900 line-clamp-2 flex-grow">{p.name}</p>
                <p className="text-xs text-gray-600 mt-1">{p.short_spec || p.category}</p>
                <p className="font-semibold mt-2" style={{ color: accentColor }}>{p.price} DZD</p>
                <button 
                  className="w-full px-2 py-2 rounded text-sm font-medium text-white transition mt-3"
                  style={{ backgroundColor: accentColor }}
                  onClick={(e) => { e.stopPropagation(); navigate(p.slug && p.slug.length > 0 ? `/store/${storeSlug}/checkout/${p.slug}` : `/checkout/${p.id}`); }}
                >
                  Order Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-amber-200 mt-12 py-8 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} {storeName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
