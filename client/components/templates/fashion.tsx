import React, { useState, useMemo } from 'react';
import { useTemplateData, useTemplateSettings } from '../../hooks/useTemplateData';

interface Product {
  id: number;
  name: string;
  gender: string;
  category: string;
  fit: string;
  color: string;
  price: number;
  image?: string;
}

interface Look {
  id: string;
  title: string;
  caption: string;
  image?: string;
}

interface TemplateDataFashion {
  storeImage: string;
  storeName: string;
  products: Product[];
  looks: Look[];
  genders?: string[];
  categories?: string[];
  fits?: string[];
}

interface TemplateSettingsFashion {
  heroHeading: string;
  heroSubtitle: string;
  ctaButtonText: string;
  brandName: string;
  currencySymbol: string;
  accentColor: string;
}

function ProductCard({ p, accentColor, currencySymbol }: { p: Product; accentColor: string; currencySymbol: string }) {
  const productImage = p.image || (window as any).TEMPLATE_DATA?.storeImage || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1600&q=80';
  
  return (
    <div className="bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden transition-all duration-200 hover:translate-y-[-4px] hover:border-opacity-50" style={{ '--hover-color': accentColor } as any}>
      <div className="relative h-64 overflow-hidden">
        <img
          src={productImage}
          alt={p.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        <div className="absolute top-3 left-3 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border border-zinc-700 bg-black/50 text-zinc-200">
          {p.category}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-zinc-50">
            {p.name}
          </h3>
          <span className="text-xs text-zinc-400">{p.gender}</span>
        </div>
        <p className="text-[11px] text-zinc-400 mb-2">
          {p.fit} · {p.color}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="font-semibold text-sm" style={{ color: accentColor }}>
            {p.price} {currencySymbol}
          </span>
          <button className="text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-full border border-zinc-600 text-zinc-200 hover:border-opacity-70 transition">
            View
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FashionTemplate() {
  const data = useTemplateData<TemplateDataFashion>();
  const settings = useTemplateSettings<TemplateSettingsFashion>();

  // Default values
  const storeImage = data?.storeImage || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1600&q=80';
  const storeName = data?.storeName || 'WardrobeOS';
  const products = data?.products || [];
  const looks = data?.looks || [];
  const genders = data?.genders || ['Women', 'Men', 'Essentials'];
  const categories = data?.categories || ['All', 'Outerwear', 'Tops', 'Bottoms', 'Footwear'];
  const fits = data?.fits || ['All', 'Oversized', 'Relaxed', 'Regular', 'Boxy'];

  const heroHeading = settings?.heroHeading || 'Build a wardrobe that behaves like software.';
  const heroSubtitle = settings?.heroSubtitle || 'Fewer pieces, more combinations. Coats, trousers, and layers designed to work in any city, any season.';
  const ctaButtonText = settings?.ctaButtonText || 'Browse collection';
  const accentColor = settings?.accentColor || '#f97316';
  const currencySymbol = settings?.currencySymbol || 'DZD';

  const [activeGender, setActiveGender] = useState('Women');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [fitFilter, setFitFilter] = useState('All');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (activeGender !== 'All' && p.gender !== activeGender) return false;
      if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
      if (fitFilter !== 'All' && p.fit !== fitFilter) return false;
      return true;
    });
  }, [products, activeGender, categoryFilter, fitFilter]);

  return (
    <div className="min-h-screen bg-black text-zinc-50">
      {/* HEADER */}
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-black/85 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="text-xs tracking-widest uppercase">
            {storeName}
          </div>
          <nav className="hidden md:flex gap-5 text-[11px] text-zinc-400">
            <button className="hover:text-zinc-100">New</button>
            <button className="hover:text-zinc-100">Collections</button>
            <button className="hover:text-zinc-100">Wardrobe builder</button>
          </nav>
          <div className="flex gap-3 text-[11px] text-zinc-400">
            <span>Account</span>
            <span>Bag (0)</span>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section
        className="hero relative min-h-[70vh] bg-cover bg-center"
        style={{ backgroundImage: `url(${storeImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/40"></div>
        <div className="relative max-w-6xl mx-auto px-6 h-full flex items-end pb-14 min-h-[70vh]">
          <div className="max-w-lg">
            <div className="text-[11px] tracking-widest uppercase text-zinc-300 mb-2">
              System wardrobes / 2025
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-semibold text-zinc-50 mb-3">
              {heroHeading}
            </h1>
            <p className="text-sm text-zinc-300 max-w-md mb-4">
              {heroSubtitle}
            </p>
            <button 
              className="text-[11px] uppercase tracking-wide px-5 py-2 rounded-full border transition"
              style={{
                borderColor: accentColor,
                color: accentColor,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${accentColor}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {ctaButtonText}
            </button>
          </div>
        </div>
      </section>

      {/* GENDER TABS */}
      <section className="max-w-6xl mx-auto px-6 py-8 border-b border-zinc-900">
        <div className="flex flex-wrap gap-3 text-[11px]">
          {genders.map((g) => (
            <button
              key={g}
              className="px-3 py-1.5 rounded-full border transition-all"
              style={{
                borderColor: activeGender === g ? accentColor : '#3f3f46',
                backgroundColor: activeGender === g ? `${accentColor}26` : '#09090f',
                color: activeGender === g ? accentColor : '#e5e5e5',
              }}
              onClick={() => setActiveGender(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </section>

      {/* LOOKS CAROUSEL */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-serif">Looks from this drop</h2>
          <p className="text-[11px] text-zinc-500">
            Scroll horizontally to browse outfits
          </p>
        </div>
        <div className="carousel flex gap-5 overflow-x-auto pb-2 scrollbar-hide">
          {looks.map((look) => (
            <div
              key={look.id}
              className="carousel-item min-w-[260px] max-w-xs bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex-shrink-0"
            >
              <div className="h-40 relative overflow-hidden">
                <img
                  src={look.image || storeImage}
                  className="w-full h-full object-cover"
                  alt={look.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              </div>
              <div className="p-4">
                <div className="text-[11px] uppercase tracking-widest text-zinc-400 mb-1">
                  Lookbook
                </div>
                <div className="text-sm font-semibold text-zinc-50">
                  {look.title}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  {look.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FILTER BAR */}
      <section className="max-w-6xl mx-auto px-6 pb-4">
        <div className="flex flex-wrap gap-3 text-[11px] mb-3">
          {categories.map((c) => (
            <button
              key={c}
              className="px-3 py-1.5 rounded-full border transition-all"
              style={{
                borderColor: categoryFilter === c ? accentColor : '#3f3f46',
                backgroundColor: categoryFilter === c ? `${accentColor}26` : '#09090f',
                color: categoryFilter === c ? accentColor : '#e5e5e5',
              }}
              onClick={() => setCategoryFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 text-[11px]">
          {fits.map((f) => (
            <button
              key={f}
              className="px-3 py-1.5 rounded-full border transition-all"
              style={{
                borderColor: fitFilter === f ? accentColor : '#3f3f46',
                backgroundColor: fitFilter === f ? `${accentColor}26` : '#09090f',
                color: fitFilter === f ? accentColor : '#e5e5e5',
              }}
              onClick={() => setFitFilter(f)}
            >
              {f} fit
            </button>
          ))}
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif">
            Pieces for {activeGender.toLowerCase()}.
          </h2>
          <span className="text-[11px] text-zinc-500">
            {filteredProducts.length} items
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} p={p} accentColor={accentColor} currencySymbol={currencySymbol} />
          ))}
        </div>
      </section>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
