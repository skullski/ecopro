import React, { useState, useMemo } from 'react';
import { useTemplateData, useTemplateSettings } from '../../hooks/useTemplateData';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
}

export default function FoodTemplate() {
  const data = useTemplateData<any>();
  const settings = useTemplateSettings<any>();

  const storeName = data?.storeName || 'Food Market';
  const products = data?.products || [];
  const storeImage = data?.storeImage || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1600&q=80';

  const accentColor = settings?.accentColor || '#a3c76d';
  const currencySymbol = settings?.currencySymbol || 'USD';
  const heroHeading = settings?.heroHeading || 'Premium Food Selection';

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
    <div className="min-h-screen" style={{ background: 'radial-gradient(circle at top left, #f0eee8 0, #f7f6f4 40%, #f5f4f2 100%)' }}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12">
          <img src={storeImage} alt="Hero" className="w-full h-80 object-cover rounded-2xl mb-8" />
          <h1 className="text-4xl font-semibold mb-4 text-gray-900">{heroHeading}</h1>
          <p className="text-lg text-gray-700 max-w-2xl">Discover authentic flavors and premium ingredients.</p>
        </div>

        <div className="flex gap-3 mb-8 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className="px-4 py-2 rounded-full text-sm uppercase font-semibold border transition"
              style={{
                borderColor: categoryFilter === cat ? accentColor : '#e3e1dd',
                backgroundColor: categoryFilter === cat ? accentColor : '#ffffff',
                color: categoryFilter === cat ? '#ffffff' : '#7a7a7a',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((product: any) => (
            <div key={product.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <div className="text-gray-600">Product Image</div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{product.category}</p>
                <div className="flex justify-between items-center">
                  <span style={{ color: accentColor }} className="font-bold">
                    {product.price} {currencySymbol}
                  </span>
                  <button className="px-3 py-1 text-xs rounded-full border" style={{ borderColor: accentColor, color: accentColor }}>
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
