import React, { useState } from 'react';
import { TemplateProps } from '@/pages/storefront/templates/types';

export default function JewelryTemplate(props: TemplateProps) {
  const { navigate, storeSlug } = props;
  const [activeCollection, setActiveCollection] = useState('All');
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);

  const products = props.products || [];
  const settings = props.settings || {};

  // Extract settings with defaults
  const storeName = settings.store_name || 'JewelryOS';
  const accentColor = settings.template_accent_color || '#b45309'; // amber-600

  // Render empty state
  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">💎</div>
          <h1 className="text-3xl font-serif font-bold mb-4 text-gray-900">No Products Yet</h1>
          <p className="text-gray-600 mb-6">Add your jewelry pieces to see them displayed here.</p>
          <p className="text-sm text-gray-500">Products will appear automatically once you add them to your store.</p>
        </div>
      </div>
    );
  }

  // Extract materials/collections from products
  const collections = ['All', ...new Set(products.map((p: any) => p.material || p.category || 'Collection'))];
  const filtered = activeCollection === 'All' ? products : products.filter((p: any) => (p.material || p.category || 'Collection') === activeCollection);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="font-serif text-4xl font-light tracking-wider text-gray-900">{storeName}</h1>
          <p className="text-xs text-gray-600 mt-2">Luxury jewelry for every occasion</p>
        </div>
      </header>

      {/* Featured Section */}
      <section className="border-b border-gray-200 bg-gradient-to-br from-gray-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-serif text-3xl font-semibold mb-4 text-gray-900">Featured Collection</h2>
          <p className="text-gray-600 mb-6 text-sm">Curated selection of our finest pieces.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.slice(0, 4).map(p => (
              <div key={p.id} className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition group cursor-pointer" onClick={() => setQuickViewProduct(p)}>
                <img src={p.images?.[0]} alt={p.name} className="w-full h-40 object-cover rounded mb-3 group-hover:scale-105 transition" />
                <p className="text-sm font-medium text-gray-900">{p.name}</p>
                <p className="text-gray-600 text-xs mt-1">{p.material || p.category || 'Premium'}</p>
                <p className="font-semibold mt-2" style={{ color: accentColor }}>{p.price} DZD</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collections */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <label className="text-xs text-gray-600 uppercase tracking-widest font-semibold block mb-3">Filter by Collection</label>
          <div className="flex gap-2 flex-wrap">
            {collections.map(col => (
              <button
                key={col}
                onClick={() => setActiveCollection(col)}
                className="px-4 py-2 rounded text-sm font-medium transition border"
                style={{
                  backgroundColor: activeCollection === col ? accentColor : 'transparent',
                  color: activeCollection === col ? '#fff' : accentColor,
                  borderColor: activeCollection === col ? accentColor : `${accentColor}40`,
                }}
              >
                {col}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div>
          <h3 className="font-serif text-2xl font-semibold mb-6 text-gray-900">
            {activeCollection === 'All' ? 'All Pieces' : `The ${activeCollection} Collection`}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map(p => (
              <div 
                key={p.id} 
                onClick={() => navigate(p.slug && p.slug.length > 0 ? `/store/${storeSlug}/${p.slug}` : `/product/${p.id}`)}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition group cursor-pointer flex flex-col"
              >
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  <img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition" />
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <p className="text-sm font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-600 mt-1">{p.material || p.category || 'Premium'}</p>
                  <p className="font-semibold text-lg mt-3" style={{ color: accentColor }}>{p.price} DZD</p>
                  <button 
                    className="w-full py-2 rounded text-sm font-medium text-white transition mt-auto"
                    style={{ backgroundColor: accentColor }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(p.slug && p.slug.length > 0 ? `/store/${storeSlug}/checkout/${p.slug}` : `/checkout/${p.id}`);
                    }}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur">
          <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Piece Details</h2>
              <button onClick={() => setQuickViewProduct(null)} className="text-2xl text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <img src={quickViewProduct.images?.[0]} alt={quickViewProduct.name} className="w-full h-64 object-cover rounded" />
            <div>
              <p className="font-semibold text-lg text-gray-900">{quickViewProduct.name}</p>
              <p className="text-sm text-gray-600 mt-1">{quickViewProduct.material || quickViewProduct.category || 'Premium'}</p>
              <p className="font-semibold text-2xl mt-3" style={{ color: accentColor }}>{quickViewProduct.price} DZD</p>
            </div>
            {quickViewProduct.description && <p className="text-sm text-gray-600">{quickViewProduct.description}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigate(quickViewProduct.slug && quickViewProduct.slug.length > 0 ? `/store/${storeSlug}/${quickViewProduct.slug}` : `/product/${quickViewProduct.id}`);
                  setQuickViewProduct(null);
                }}
                className="flex-1 py-3 rounded font-semibold border transition"
                style={{ borderColor: accentColor, color: accentColor }}
              >
                View Full Details
              </button>
              <button
                onClick={() => {
                  navigate(quickViewProduct.slug && quickViewProduct.slug.length > 0 ? `/store/${storeSlug}/checkout/${quickViewProduct.slug}` : `/checkout/${quickViewProduct.id}`);
                  setQuickViewProduct(null);
                }}
                className="flex-1 py-3 text-white rounded font-semibold transition"
                style={{ backgroundColor: accentColor }}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12 py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} {storeName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
