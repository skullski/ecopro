import React, { useState, useMemo } from 'react';
import { useTemplateData, useTemplateSettings } from '../../hooks/useTemplateData';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
}

export default function ElectronicsTemplate() {
  const data = useTemplateData<any>();
  const settings = useTemplateSettings<any>();

  const storeName = data?.storeName || 'ElectroVerse';
  const products = data?.products || [];
  const storeImage = data?.storeImage || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1600&q=80';

  const accentColor = settings?.accentColor || '#38bdf8';
  const currencySymbol = settings?.currencySymbol || 'USD';
  const heroHeading = settings?.heroHeading || 'Next Generation Tech';

  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = useMemo(() => {
    const cats = new Set(products.map((p: any) => p.category));
    return ['All', ...Array.from(cats)];
  }, [products]);

  const filtered = useMemo(() => {
    if (categoryFilter === 'All') return products;
    return products.filter((p: any) => p.category === categoryFilter);
  }, [products, categoryFilter]);

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(circle at top, #0f172a 0, #020617 45%, #000 100%)' }}>
      <div className="relative rounded-2xl overflow-hidden m-6 p-12 text-white" style={{ background: 'radial-gradient(circle at top left, #0ea5e9 0, #020617 52%)' }}>
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold mb-4">{heroHeading}</h1>
          <p className="text-lg text-blue-100 mb-6">Explore cutting-edge technology and innovation.</p>
          <button className="px-6 py-3 rounded-lg text-white font-semibold border-2" style={{ borderColor: accentColor, color: accentColor }}>
            Shop Now
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-3 mb-8 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className="px-4 py-2 rounded text-xs uppercase font-semibold border transition"
              style={{
                borderColor: categoryFilter === cat ? accentColor : '#1f2937',
                backgroundColor: categoryFilter === cat ? accentColor : '#020617',
                color: categoryFilter === cat ? '#020617' : '#9ca3af',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((product: any) => (
            <div key={product.id} className="rounded-lg p-4 border transition-all" style={{ borderColor: '#1f2937', backgroundColor: '#020617' }}>
              <div className="h-48 bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
                <div style={{ color: accentColor }}>Product Image</div>
              </div>
              <h3 className="font-semibold text-white mb-2">{product.name}</h3>
              <p className="text-gray-400 text-sm mb-3">{product.category}</p>
              <div className="flex justify-between items-center">
                <span style={{ color: accentColor }} className="font-bold">
                  {product.price} {currencySymbol}
                </span>
                <button className="px-3 py-1 text-xs rounded border" style={{ borderColor: accentColor, color: accentColor }}>
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
