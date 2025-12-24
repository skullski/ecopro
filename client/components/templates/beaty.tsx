import React, { useState } from 'react';
import { TemplateProps } from '@/pages/storefront/templates/types';

export default function BeautyTemplate(props: TemplateProps) {
  const { navigate, storeSlug } = props;
  const [cartCount, setCartCount] = useState(0);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const { products = [], settings = {}, categories = [] } = props;
  const templateSettings = settings as any;

  const bagLabel = templateSettings.template_bag_label || 'Bag';
  const storeName = templateSettings.store_name || 'GlowStudio';
  const storeDescription = templateSettings.store_description || 'Beauty & Skincare';
  const shadeTitle = templateSettings.template_shade_title || 'Find Your Perfect Shade';
  const buyNowLabel = templateSettings.template_buy_now_label || 'Buy Now';

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

  const filteredProducts = products.filter((p: any) => {
    const search = props.searchQuery?.toLowerCase() || '';
    const matchesSearch = !search || p.title?.toLowerCase().includes(search);
    const matchesCategory = props.categoryFilter === 'all' || p.category === props.categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const shades = ['#F5D5B8', '#E8C4A0', '#D4A574', '#C9915C', '#B8713F'];

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed bottom-6 right-6 z-40">
        <button className="rounded-full bg-pink-400 text-white font-semibold px-5 py-3 flex items-center gap-2 shadow-lg">
          {bagLabel}{' '}
          <span className="w-6 h-6 rounded-full bg-white text-pink-400 text-xs flex items-center justify-center font-bold">{cartCount}</span>
        </button>
      </div>

      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="font-serif text-2xl font-semibold">{storeName}</h1>
          <p className="text-xs text-gray-600">{storeDescription}</p>
        </div>
      </header>

      <section className="bg-gradient-to-br from-pink-100 to-rose-50 py-6 md:py-4 md:py-6">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-serif text-xl md:text-2xl font-semibold mb-6">{shadeTitle}</h2>
          <div className="flex gap-4">
            {shades.map((shade, idx) => (
              <button key={idx} className="w-16 h-16 rounded-full shadow-md transition hover:scale-110 border-2 border-gray-900" style={{ backgroundColor: shade }} />
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-6 md:py-4 md:py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredProducts.map((p: any) => (
            <div 
              key={p.id} 
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition cursor-pointer flex flex-col"
              onClick={() => navigate(p.slug && p.slug.length > 0 ? `/store/${storeSlug}/${p.slug}` : `/product/${p.id}`)}
            >
              <div className="relative h-56 bg-gray-100">
                <img src={p.images?.[0] || 'https://via.placeholder.com/400'} alt={p.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-3 flex flex-col flex-grow">
                <p className="font-semibold text-sm line-clamp-2">{p.title}</p>
                <p className="text-xs text-gray-600 mt-1">{p.category}</p>
                <p className="text-pink-600 font-bold mt-2">{p.price} DZD</p>
                <div className="flex gap-2 mt-2 pt-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setWishlist(w => w.includes(p.id) ? w.filter(x => x !== p.id) : [...w, p.id]);
                    }} 
                    className={`flex-1 py-1 text-xs rounded ${wishlist.includes(p.id) ? 'bg-pink-400 text-white' : 'bg-gray-100'}`}
                  >
                    ♥
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`checkout/${p.id}`);
                    }} 
                    className="flex-1 py-1 bg-pink-400 text-white text-xs rounded font-semibold hover:bg-pink-500"
                  >
                    {buyNowLabel}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export const TEMPLATE_EDITOR_SECTIONS = [
  {
    title: 'Beauty (Lite): Labels',
    fields: [
      { key: 'template_bag_label', label: 'Bag Label', type: 'text', defaultValue: 'Bag' },
      { key: 'store_name', label: 'Store Name', type: 'text', defaultValue: 'GlowStudio' },
      { key: 'store_description', label: 'Store Description', type: 'text', defaultValue: 'Beauty & Skincare' },
      { key: 'template_shade_title', label: 'Shade Title', type: 'text', defaultValue: 'Find Your Perfect Shade' },
      { key: 'template_buy_now_label', label: 'Buy Now Label', type: 'text', defaultValue: 'Buy Now' },
    ],
  },
] as const;
