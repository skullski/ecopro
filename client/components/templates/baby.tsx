import React, { useState } from 'react';
import { TemplateProps } from '@/pages/storefront/templates/types';

const CATEGORIES = [
  { label: "All", icon: "✨" },
  { label: "Toys", icon: "🧸" },
  { label: "Clothing", icon: "👕" },
  { label: "Feeding", icon: "🍼" },
  { label: "Strollers", icon: "🚼" },
  { label: "Nursery", icon: "🛏" },
  { label: "Bath", icon: "🛁" },
  { label: "Shoes", icon: "🧦" },
  { label: "Gifts", icon: "🎁" },
];

export default function BabyTemplate(props: TemplateProps) {
  const { navigate = () => {}, storeSlug = '' } = props;
  const [activeCategory, setActiveCategory] = useState("All");
  
  const products = props.products || [];
  const storeName = props.settings?.store_name || 'BabyOS';
  const bannerUrl = props.settings?.banner_url || 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=2000&q=80';
  
  const filteredProducts = activeCategory === "All" 
    ? products 
    : products.filter((p: any) => p.category === activeCategory);

  const heroHighlight = products[0];

  const ProductCard = ({ product }: { product: any }) => {
    const handleProductClick = () => {
      localStorage.setItem(`product_${product.id}`, JSON.stringify(product));
      navigate(`/product/${product.id}`);
    };

    const handleBuyClick = (e: any) => {
      e.stopPropagation();
      localStorage.setItem(`product_${product.id}`, JSON.stringify(product));
      navigate(`/checkout/${product.id}`);
    };

    return (
      <div 
        className="bg-white rounded-[22px] p-2.5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col"
        onClick={handleProductClick}
      >
        <img 
          src={product.images?.[0] || 'https://via.placeholder.com/300x210'} 
          alt={product.title} 
          className="w-full h-[210px] object-cover rounded-[18px]"
        />
        <div className="mt-3 space-y-2 flex flex-col flex-grow">
          <div className="flex items-center justify-between">
            <span className="bg-red-100 text-red-700 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Soft
            </span>
            <span className="bg-blue-100 text-blue-700 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
              0–6m
            </span>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-gray-400">
              {product.category || 'Baby'}
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mt-1">
              {product.title}
            </h3>
          </div>
          <div className="flex items-center justify-between mt-auto">
            <span className="bg-yellow-100 text-yellow-900 text-xs font-bold px-3 py-1.5 rounded-full">
              {props.formatPrice(product.price)}
            </span>
            <button 
              onClick={handleBuyClick}
              className="text-[11px] uppercase tracking-wider text-white font-semibold px-4 py-2 rounded-full bg-green-600 hover:bg-green-700"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `url('${bannerUrl}')`,
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <style>{`
        .page-shell {
          max-width: 1240px;
          margin: 32px auto 48px;
          padding: 24px 32px 48px;
          background: rgba(255, 253, 249, 0.86);
          backdrop-filter: blur(18px);
          border-radius: 28px;
          box-shadow: 0 32px 80px rgba(15, 23, 42, 0.35), 0 8px 24px rgba(15, 23, 42, 0.45);
        }
        
        .float-shape {
          position: absolute;
          border-radius: 9999px;
          opacity: 0.8;
          filter: blur(2px);
        }
        
        .float-blue { background: #aee1ff; }
        .float-mint { background: #c8f7dc; }
        .float-peach { background: #ffd7c2; }
        .float-lavender { background: #e8d7ff; }
      `}</style>

      <div className="page-shell">
        {/* HEADER */}
        <header className="flex items-center justify-between mb-6">
          <div className="text-xl md:text-2xl md:text-2xl md:text-xl md:text-2xl font-black tracking-[0.2em] text-amber-500">
            {storeName}
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <button className="uppercase tracking-[0.18em] hover:text-gray-700">
              Search
            </button>
            <button className="uppercase tracking-[0.18em] hover:text-gray-700">
              Cart (0)
            </button>
          </div>
        </header>

        {/* HERO */}
        <section className="grid md:grid-cols-[1.05fr,0.95fr] gap-10 items-center mb-10 relative">
          {/* floating shapes */}
          <div className="float-shape float-blue" style={{ width: 70, height: 70, top: -30, right: 80 }} />
          <div className="float-shape float-mint" style={{ width: 52, height: 52, top: 40, left: -10 }} />
          <div className="float-shape float-peach" style={{ width: 48, height: 48, bottom: -10, left: 120 }} />
          <div className="float-shape float-lavender" style={{ width: 60, height: 60, bottom: -30, right: 60 }} />

          <div className="space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
              <span>New season</span>
              <span>•</span>
              <span>Soft & Playful</span>
            </div>
            <h1 className="text-2xl md:text-xl md:text-2xl leading-tight font-bold text-gray-900">
              A soft, modern universe<br />for every little moment.
            </h1>
            <p className="text-sm text-gray-600 max-w-md">
              Toys, outfits, feeding essentials, nursery finds and tiny gifts — curated for newborns and toddlers in one balanced, playful store.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-yellow-100 text-yellow-900 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider">0–6 months</span>
              <span className="bg-yellow-100 text-yellow-900 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider">6–12 months</span>
              <span className="bg-yellow-100 text-yellow-900 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider">1–3 years</span>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <button className="px-5 py-2.5 rounded-full bg-gradient-to-r from-yellow-400 to-pink-400 text-gray-900 text-xs font-semibold uppercase tracking-wider shadow-lg hover:shadow-xl transition-shadow">
                Shop baby essentials
              </button>
              <button className="text-xs uppercase tracking-wider text-blue-500 font-semibold hover:text-blue-600">
                View all toys
              </button>
            </div>
          </div>

          <div className="relative z-10">
            <img 
              src={bannerUrl} 
              alt="Baby hero" 
              className="w-full h-96 object-cover rounded-[28px] shadow-2xl"
            />
            {heroHighlight && (
              <div className="absolute left-5 bottom-5 bg-white/95 px-4 py-3 rounded-2xl border border-yellow-100 shadow-md">
                <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                  Featured product
                </div>
                <div className="text-sm font-semibold text-gray-900 mt-1">
                  {heroHighlight.title}
                </div>
                <div className="text-xs text-yellow-700 font-bold mt-1">
                  {props.formatPrice(heroHighlight.price)}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* CATEGORY FILTERS */}
        <section className="mb-4 md:mb-6">
          <div className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">
            Browse by category
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.label}
                onClick={() => setActiveCategory(c.label)}
                className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold whitespace-nowrap transition-all ${
                  activeCategory === c.label
                    ? 'bg-gradient-to-r from-blue-200 to-yellow-100 border-yellow-400 text-gray-700 shadow-md'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                } border flex items-center gap-2`}
              >
                <span className="text-base">{c.icon}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* FEATURED SECTION */}
        <section className="bg-gradient-to-br from-blue-100/75 to-yellow-50/85 rounded-2xl p-5 mb-10">
          <div className="grid md:grid-cols-[0.9fr,1.1fr] gap-3 md:gap-4 items-center">
            <div className="space-y-3">
              <div className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
                Soft & snuggly picks
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Plush friends and warm layers.
              </h2>
              <p className="text-sm text-gray-700 max-w-sm">
                A small edit of plush toys, blankets and first outfits designed to feel soft against newborn skin. Gentle colors, cozy textures, and everyday comfort.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {products.slice(0, 3).map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* PRODUCT GRID */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-1">
                All baby products
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Pieces in this universe
              </h2>
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
              {filteredProducts.length} items
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-6 md:py-4 md:py-6">
              <p className="text-gray-500">No items in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filteredProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="text-xs text-gray-500 mt-4 md:mt-6 border-t border-gray-200 pt-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <span>
              © {new Date().getFullYear()} {storeName} · Modern Baby Store
            </span>
            <div className="flex gap-4">
              <span>0–6m</span>
              <span>6–12m</span>
              <span>1–3y</span>
              <span>Care guide</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
