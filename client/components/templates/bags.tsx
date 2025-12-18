import React, { useState } from 'react';
import { TemplateProps } from '@/pages/storefront/templates/types';

export default function BagsTemplate(props: TemplateProps) {
  const [activeType, setActiveType] = useState('All');
  const { products = [], settings = {}, formatPrice = (p: number) => `${p}`, navigate, storeSlug } = props;

  // Get types from products or use defaults
  const types = ['All', ...new Set(products.map((p: any) => p.category).filter(Boolean))];
  
  const filteredProducts = activeType === 'All' 
    ? products 
    : products.filter((p: any) => p.category === activeType);

  const heroBag = products[0];

  // Settings
  const bgImage = (settings as any).template_bg_image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=2000&q=80';
  const bgBlur = (settings as any).template_hero_bg_blur || 12;

  return (
    <div 
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        padding: '32px'
      }}
    >
      <div className="max-w-7xl mx-auto px-8 pb-16" style={{ background: `rgba(255, 255, 255, 0.72)`, backdropFilter: `blur(${bgBlur}px)` }}>
        {/* HEADER */}
        <header className="flex items-center justify-between py-6">
          <div className="text-xs tracking-[0.3em] uppercase text-gray-700">
            {settings.store_name || 'BAGSOS'}
          </div>
          <nav className="hidden md:flex gap-7 text-[11px] uppercase tracking-[0.2em] text-gray-500">
            <button className="hover:text-gray-900">Editorial</button>
            <button className="hover:text-gray-900">Leather</button>
            <button className="hover:text-gray-900">Materials</button>
          </nav>
          <div className="flex gap-5 text-[11px] text-gray-500 uppercase tracking-[0.18em]">
            <button className="hover:text-gray-900">Search</button>
            <button className="hover:text-gray-900">Bag (0)</button>
          </div>
        </header>

        {/* HERO */}
        <section className="grid md:grid-cols-[0.9fr,1.1fr] gap-10 items-end py-10">
          <div>
            <div className="text-[11px] tracking-[0.24em] uppercase text-gray-600 mb-3">
              {settings.template_hero_heading ? 'Bags / Editorial' : 'Bags / Leather · Canvas · Nylon'}
            </div>
            <h1 className="font-serif text-[32px] md:text-[40px] text-gray-900 leading-tight mb-4 font-medium">
              {settings.template_hero_heading || 'Cold silhouettes,\ncut in leather and light.'}
            </h1>
            <p className="text-sm text-gray-600 max-w-md mb-6">
              {settings.template_hero_subtitle || 'A focused edit of structured totes, city crossbody bags and evening silhouettes. Built in neutral materials for everyday precision.'}
            </p>
          </div>
          <div className="relative">
            <div className="bg-white" style={{ boxShadow: '0 40px 70px rgba(15, 23, 42, 0.32), 0 6px 18px rgba(15, 23, 42, 0.55)' }}>
              <img 
                src={heroBag?.images?.[0] || settings.banner_url} 
                alt="Hero bag" 
                className="w-full object-cover"
                style={{ height: '460px' }}
              />
            </div>
            {heroBag && (
              <div className="absolute left-6 bottom-6 bg-white/95 px-4 py-3 border border-gray-300">
                <div className="text-[10px] tracking-[0.22em] uppercase text-gray-600 mb-1">
                  HIGHLIGHT PIECE
                </div>
                <div className="font-serif text-sm text-gray-900 font-medium">
                  {heroBag.title || 'Featured Bag'}
                </div>
                <div className="text-[11px] text-gray-700 mt-1">
                  {heroBag.price ? formatPrice(heroBag.price) : '—'} DZD
                </div>
              </div>
            )}
          </div>
        </section>

        {/* FILTERS */}
        <section className="py-4 border-y border-gray-200 mb-10">
          <div className="flex flex-wrap gap-3">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`rounded-full border px-[14px] py-[6px] font-medium text-[10px] tracking-[0.22em] uppercase transition ${
                  activeType === type
                    ? 'bg-gray-900 text-gray-50 border-gray-900'
                    : 'border-gray-300 text-gray-600 bg-white/70 hover:bg-white'
                }`}
                style={{ backdropFilter: 'blur(6px)' }}
              >
                {type}
              </button>
            ))}
          </div>
        </section>

        {/* CHAPTER */}
        <section className="py-10 border-b border-gray-200 mb-10">
          <div className="grid md:grid-cols-[0.35fr,1.65fr] gap-10 items-start">
            <div className="flex gap-4">
              <div className="w-px bg-gradient-to-b from-gray-400 to-gray-300" />
              <div>
                <div className="text-[11px] tracking-[0.24em] uppercase text-gray-600 mb-2">
                  CHAPTER I
                </div>
                <h2 className="font-serif text-[26px] font-medium text-gray-900 mb-3">
                  Leather silhouettes
                </h2>
                <p className="text-sm text-gray-600">
                  Structured lines in cold leather tones. Clean forms with enough volume for the city.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-5">
              {products.slice(0, 3).map((bag: any, idx: number) => (
                <div key={bag.id} className="space-y-2">
                  <div className="bg-white" style={{ boxShadow: '0 32px 60px rgba(80, 60, 40, 0.36), 0 6px 16px rgba(55, 41, 30, 0.8)' }}>
                    <img
                      src={bag.images?.[0] || 'https://via.placeholder.com/400'}
                      alt={bag.title}
                      className="w-full object-cover"
                      style={{ height: idx === 0 ? '320px' : '260px' }}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-serif text-sm text-gray-900 font-medium">
                        {bag.title}
                      </div>
                      <div className="text-[11px] mt-1 tracking-[0.18em] uppercase text-gray-400">
                        {bag.category || 'Bag'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[13px] text-gray-900 mb-1">
                        {formatPrice(bag.price)} <span className="text-gray-500">DZD</span>
                      </div>
                      <button 
                        onClick={() => navigate(bag.slug && bag.slug.length > 0 ? `/store/${storeSlug}/checkout/${bag.slug}` : `/checkout/${bag.id}`)}
                        className="text-[10px] px-3 py-1 rounded bg-gray-900 text-white hover:bg-gray-800 transition font-medium"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GRID */}
        <section className="pb-20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-[11px] tracking-[0.24em] uppercase text-gray-500 mb-1">
                PIECES
              </div>
              <h2 className="font-serif text-xl text-gray-900 font-medium">
                Bags in this collection
              </h2>
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-[0.18em]">
              {filteredProducts.length} pieces
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {filteredProducts.map((bag: any, index: number) => (
              <div 
                key={bag.id} 
                className="space-y-2 cursor-pointer"
                onClick={() => navigate(bag.slug && bag.slug.length > 0 ? `/store/${storeSlug}/${bag.slug}` : `/product/${bag.id}`)}
              >
                <div className="bg-white" style={{ boxShadow: '0 32px 60px rgba(80, 60, 40, 0.36), 0 6px 16px rgba(55, 41, 30, 0.8)' }}>
                  <img
                    src={bag.images?.[0] || 'https://via.placeholder.com/400'}
                    alt={bag.title}
                    className="w-full object-cover"
                    style={{ height: index % 3 === 0 ? '320px' : '260px' }}
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-serif text-sm text-gray-900 font-medium">
                      {bag.title}
                    </div>
                    <div className="text-[11px] mt-1 tracking-[0.18em] uppercase text-gray-400">
                      {bag.category || 'Bag'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] text-gray-900 mb-1">
                      {formatPrice(bag.price)} <span className="text-gray-500">DZD</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(bag.slug && bag.slug.length > 0 ? `/store/${storeSlug}/checkout/${bag.slug}` : `/checkout/${bag.id}`);
                      }}
                      className="text-[10px] px-3 py-1 rounded bg-gray-900 text-white hover:bg-gray-800 transition font-medium"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-gray-200 pt-5 mt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-gray-500 uppercase tracking-[0.18em]">
            <span>© {new Date().getFullYear()} BagsOS · Editorial Bags</span>
            <div className="flex gap-4">
              <span>Materials</span>
              <span>Care</span>
              <span>Warranty</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
