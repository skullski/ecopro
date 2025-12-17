import React, { useState, useMemo } from 'react';
import { useTemplateData, useTemplateSettings } from '../../hooks/useTemplateData';

interface Product {
  id: number;
  name: string;
  realm: string;
  family: string;
  intensity: string;
  notes: string[];
  price: number;
}

export default function PerfumeTemplate() {
  const data = useTemplateData<any>();
  const settings = useTemplateSettings<any>();

  const storeName = data?.storeName || 'Perfume';
  const products = data?.products || [];
  const storeImage = data?.storeImage || 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1600&q=80';

  const accentColor = settings?.accentColor || '#f59e0b';
  const currencySymbol = settings?.currencySymbol || 'USD';
  const heroHeading = settings?.heroHeading || 'A New Way to Experience Scent';

  const [realmFilter, setRealmFilter] = useState('all');

  const realms = ['all', 'dark', 'gold', 'art'];

  const filtered = useMemo(() => {
    if (realmFilter === 'all') return products;
    return products.filter((p: any) => p.realm === realmFilter);
  }, [products, realmFilter]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HERO */}
      <section className="relative h-96 overflow-hidden" style={{ backgroundImage: `url(${storeImage})`, backgroundSize: 'cover' }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/90"></div>
        <div className="relative max-w-6xl mx-auto px-6 h-full flex items-center">
          <div className="max-w-xl">
            <h1 className="text-4xl font-serif font-semibold mb-3">{heroHeading}</h1>
            <p className="text-gray-300 text-sm max-w-md mb-6">
              Three realms. One universe. Discover fragrances crafted for those who dare to be different.
            </p>
            <button className="px-5 py-2 text-sm uppercase tracking-wide border" style={{ borderColor: accentColor, color: accentColor }}>
              Explore
            </button>
          </div>
        </div>
      </section>

      {/* FILTER */}
      <section className="max-w-6xl mx-auto px-6 py-8 border-b border-zinc-800">
        <div className="flex gap-3">
          {realms.map((realm) => (
            <button
              key={realm}
              onClick={() => setRealmFilter(realm)}
              className="px-4 py-2 text-xs uppercase rounded-full border transition"
              style={{
                borderColor: realmFilter === realm ? accentColor : '#3f3f46',
                backgroundColor: realmFilter === realm ? `${accentColor}26` : 'transparent',
                color: realmFilter === realm ? accentColor : '#e5e5e5',
              }}
            >
              {realm === 'all' ? 'All Realms' : `Realm ${realm}`}
            </button>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-serif mb-8">Fragrances</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((product: any) => (
            <div key={product.id} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:-translate-y-1 transition">
              <div className="h-64 bg-zinc-800 flex items-center justify-center">
                <div className="text-gray-600">Fragrance</div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-white mb-1">{product.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{product.family}</p>
                <p className="text-xs text-gray-400 mb-3">{product.intensity}</p>
                <div className="flex justify-between items-center">
                  <span style={{ color: accentColor }} className="font-bold">
                    {product.price} {currencySymbol}
                  </span>
                  <button className="text-xs border px-3 py-1 rounded" style={{ borderColor: accentColor, color: accentColor }}>
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
