import React, { useState } from 'react';
import { TemplateProps } from '@/pages/storefront/templates/types';

export default function PerfumeTemplate(props: TemplateProps) {
  const { navigate, storeSlug } = props;
  const [realmFilter, setRealmFilter] = useState('All');
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);

  const products = props.products || [];
  const settings = props.settings || {};

  // Extract settings with defaults
  const storeName = settings.store_name || 'Olfactory';
  const accentColor = settings.template_accent_color || '#b45309'; // amber-600

  // Render empty state
  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">🧴</div>
          <h1 className="text-3xl font-serif font-bold mb-4 text-gray-200">No Products Yet</h1>
          <p className="text-gray-400 mb-6">Add fragrances to your store to see them displayed here.</p>
          <p className="text-sm text-gray-500">Products will appear automatically once you add them to your store.</p>
        </div>
      </div>
    );
  }

  // Normalize products
  const normalizedProducts = products.map((p: any) => ({
    ...p,
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ['https://via.placeholder.com/400x300?text=No+Image'],
    rating: typeof p.rating === 'number' ? p.rating : 4.5,
    notes: Array.isArray(p.notes) ? p.notes : ['Notes unavailable'],
    realm: p.realm || p.category || 'Premium',
  }));

  // Extract realms from products
  const realms = ['All', ...new Set(normalizedProducts.map((p: any) => p.realm))];
  const filtered = realmFilter === 'All' ? normalizedProducts : normalizedProducts.filter((p: any) => p.realm === realmFilter);

  return (
    <div style={{ backgroundColor: '#0a0a0a' }} className="min-h-screen text-white">
      <header className="border-b sticky top-0 z-40 backdrop-blur" style={{ borderColor: `${accentColor}33`, backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="font-serif text-3xl font-semibold" style={{ color: accentColor }}>{storeName}</h1>
          <p className="text-xs text-gray-400 mt-1">Premium fragrance collections</p>
        </div>
      </header>

      <section className="relative h-80 overflow-hidden bg-gradient-to-b" style={{ backgroundImage: `linear-gradient(to bottom, ${accentColor}20, #000)` }}>
        <img src={settings.banner_url || 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=1600&q=80'} alt="Hero" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black flex items-end justify-center pb-12">
          <div className="text-center">
            <p className="font-serif text-4xl font-semibold mb-2" style={{ color: accentColor }}>The Realms of Scent</p>
            <p className="text-sm text-gray-400">Discover scents that tell your story</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12">
        {/* Filter Section */}
        <div className="mb-8">
          <label className="text-xs text-gray-500 uppercase tracking-widest font-semibold block mb-4">Filter by Category</label>
          <div className="flex gap-3 flex-wrap">
            {realms.map((realm) => (
              <button
                key={realm}
                onClick={() => setRealmFilter(realm)}
                className="px-5 py-2 rounded-full text-sm font-medium transition border"
                style={{
                  backgroundColor: realmFilter === realm ? accentColor : 'transparent',
                  color: realmFilter === realm ? '#000' : accentColor,
                  borderColor: realmFilter === realm ? accentColor : `${accentColor}50`,
                }}
              >
                {realm}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="mb-8">
          <h2 className="font-serif text-2xl font-semibold mb-6" style={{ color: accentColor }}>Featured Fragrances</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <div
                key={p.id}
                onClick={() => setQuickViewProduct(p)}
                className="rounded-lg overflow-hidden hover:border-amber-600 transition group cursor-pointer border"
                style={{ backgroundColor: '#1a1a1a', borderColor: `${accentColor}30` }}
              >
                <div className="relative h-56 bg-black overflow-hidden">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition opacity-80" />
                  <div className="absolute top-3 left-3 rounded text-xs font-semibold px-2 py-1" style={{ backgroundColor: 'rgba(0,0,0,0.8)', color: accentColor }}>
                    {p.realm}
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-semibold text-sm text-white line-clamp-1">{p.name}</p>
                  <p className="text-xs text-gray-500 mt-1">Fragrance</p>
                  <div className="flex gap-1 mt-2">
                    {'★'.repeat(Math.floor(p.rating))}
                    <span className="text-xs text-gray-600">({p.rating})</span>
                  </div>
                  <p className="font-semibold text-sm mt-3" style={{ color: accentColor }}>{p.price} DZD</p>
                  <button
                    className="w-full mt-3 py-2 text-black rounded font-semibold text-xs hover:opacity-90 transition"
                    style={{ backgroundColor: accentColor }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(p.slug && p.slug.length > 0 ? `/store/${storeSlug}/checkout/${p.slug}` : `/checkout/${p.id}`);
                    }}
                  >
                    Add to Bag
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur">
          <div className="rounded-lg w-96 p-6 space-y-4 max-h-[90vh] overflow-y-auto border" style={{ backgroundColor: '#000', borderColor: `${accentColor}50` }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold" style={{ color: accentColor }}>Fragrance Details</h2>
              <button onClick={() => setQuickViewProduct(null)} className="text-2xl text-gray-600 hover:text-white">✕</button>
            </div>
            <img src={quickViewProduct.images[0]} alt={quickViewProduct.name} className="w-full h-64 object-cover rounded" />
            <div>
              <p className="font-semibold text-lg text-white">{quickViewProduct.name}</p>
              <div className="inline-block rounded text-xs font-semibold px-2 py-1 mt-2" style={{ backgroundColor: `${accentColor}30`, color: accentColor }}>
                {quickViewProduct.realm}
              </div>
              <div className="flex gap-1 mt-2">
                {'★'.repeat(Math.floor(quickViewProduct.rating))}
                <span className="text-xs text-gray-600">({quickViewProduct.rating})</span>
              </div>
              <p className="font-semibold text-2xl mt-3" style={{ color: accentColor }}>{quickViewProduct.price} DZD</p>
            </div>
            {quickViewProduct.description && <p className="text-sm text-gray-400">{quickViewProduct.description}</p>}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-widest font-semibold block mb-3">Scent Notes</label>
              <div className="flex flex-wrap gap-2">
                {quickViewProduct.notes.map((note: string, i: number) => (
                  <span key={i} className="text-xs px-3 py-1 rounded-full border" style={{ backgroundColor: `${accentColor}20`, color: accentColor, borderColor: `${accentColor}50` }}>
                    {note}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigate(quickViewProduct.slug && quickViewProduct.slug.length > 0 ? `/store/${storeSlug}/${quickViewProduct.slug}` : `/product/${quickViewProduct.id}`);
                  setQuickViewProduct(null);
                }}
                className="flex-1 py-3 rounded font-semibold hover:opacity-80 transition border"
                style={{ borderColor: accentColor, color: accentColor }}
              >
                View Details
              </button>
              <button
                onClick={() => {
                  navigate(quickViewProduct.slug && quickViewProduct.slug.length > 0 ? `/store/${storeSlug}/checkout/${quickViewProduct.slug}` : `/checkout/${quickViewProduct.id}`);
                  setQuickViewProduct(null);
                }}
                className="flex-1 py-3 text-black rounded font-semibold hover:opacity-90 transition"
                style={{ backgroundColor: accentColor }}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t mt-12 py-8 bg-black/50" style={{ borderColor: `${accentColor}30` }}>
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} {storeName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
