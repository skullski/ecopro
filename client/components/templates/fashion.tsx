import React, { useState } from 'react';
import { TemplateProps } from '@/pages/storefront/templates/types';

export default function FashionTemplate(props: TemplateProps) {
  const { navigate, storeSlug } = props;
  const [activeGender, setActiveGender] = useState('Women');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [fitFilter, setFitFilter] = useState('All');

  // Helper functions to save product data and navigate
  const handleProductClick = (product: any) => {
    localStorage.setItem(`product_${product.id}`, JSON.stringify(product));
    navigate(`/product/${product.id}`);
  };

  const handleBuyClick = (product: any, e?: any) => {
    if (e) e.stopPropagation();
    localStorage.setItem(`product_${product.id}`, JSON.stringify(product));
    navigate(`/checkout/${product.id}`);
  };

  const products = props.products || [];
  const storeName = props.settings?.store_name || 'WardrobeOS';
  const bannerUrl = props.settings?.banner_url || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1600&q=80';

  const genders = ['Women', 'Men', 'Essentials'];
  const categories = ['All', 'Outerwear', 'Tops', 'Bottoms', 'Footwear'];
  const fits = ['All', 'Oversized', 'Relaxed', 'Regular', 'Boxy'];

  const looks = [
    { id: 'look1', title: 'Late‑night city layers', caption: 'Wool coat · relaxed trouser · canvas sneaker' },
    { id: 'look2', title: 'Studio uniform', caption: 'Boxy tee · tapered trouser · minimal sneaker' },
    { id: 'look3', title: 'Transit‑ready shell', caption: 'Technical shell · hoodie · soft layers' },
  ];

  const filteredProducts = products.filter((p: any) => {
    if (activeGender !== 'All' && p.gender !== activeGender) return false;
    if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
    if (fitFilter !== 'All' && p.fit !== fitFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-black text-zinc-50">
      <style>{`
        .hero {
          min-height: 70vh;
          position: relative;
          background-size: cover;
          background-position: center;
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, rgba(5,5,9,0.9), rgba(5,5,9,0.4));
        }
        .carousel::-webkit-scrollbar {
          display: none;
        }
        .carousel {
          scroll-snap-type: x mandatory;
        }
        .carousel-item {
          scroll-snap-align: start;
        }
        .filter-pill {
          border-radius: 999px;
          border: 1px solid #3f3f46;
          padding: 6px 12px;
          font-size: 11px;
          cursor: pointer;
          background: #09090f;
        }
        .filter-pill.active {
          border-color: #f97316;
          background: rgba(248,148,66,0.16);
          color: #fed7aa;
        }
        .product-card {
          background: #050509;
          border-radius: 18px;
          border: 1px solid #1f2933;
          overflow: hidden;
          transition: 0.22s;
        }
        .product-card:hover {
          transform: translateY(-4px);
          border-color: #f97316;
          box-shadow: 0 18px 40px rgba(0,0,0,0.7);
        }
      `}</style>

      {/* HEADER */}
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-black/85 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="text-xs tracking-[0.2em] uppercase">
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
        className="hero"
        style={{ backgroundImage: `url(${bannerUrl})` }}
      >
        <div className="hero-overlay"></div>
        <div className="max-w-6xl mx-auto px-6 h-full flex items-end pb-14">
          <div className="max-w-lg">
            <div className="text-[11px] tracking-[0.25em] uppercase text-zinc-300 mb-2">
              System wardrobes / 2025
            </div>
            <h1 className="text-xl md:text-2xl md:text-2xl md:text-xl md:text-2xl font-serif font-semibold text-zinc-50 mb-3">
              Build a wardrobe that behaves like software.
            </h1>
            <p className="text-sm text-zinc-300 max-w-md mb-4">
              Fewer pieces, more combinations. Coats, trousers, and layers designed to work in any city, any season.
            </p>
            <button className="text-[11px] uppercase tracking-[0.18em] px-5 py-2 rounded-full border border-zinc-500 text-zinc-100 hover:border-amber-400 hover:text-amber-200 transition">
              Browse collection
            </button>
          </div>
        </div>
      </section>

      {/* CATEGORY TABS */}
      <section className="max-w-6xl mx-auto px-6 py-4 md:py-6 border-b border-zinc-900">
        <div className="flex flex-wrap gap-3 text-[11px]">
          {genders.map((g) => (
            <button
              key={g}
              className={`filter-pill ${activeGender === g ? 'active' : ''}`}
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
        <div className="carousel flex gap-5 overflow-x-auto pb-2">
          {looks.map((look) => (
            <div
              key={look.id}
              className="carousel-item min-w-[260px] max-w-xs bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden"
            >
              <div className="h-40 relative overflow-hidden">
                <img
                  src={bannerUrl}
                  className="w-full h-full object-cover"
                  alt={look.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              </div>
              <div className="p-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-400 mb-1">
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
              className={`filter-pill ${categoryFilter === c ? 'active' : ''}`}
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
              className={`filter-pill ${fitFilter === f ? 'active' : ''}`}
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {filteredProducts.map((p: any) => (
            <div 
              key={p.id} 
              className="product-card cursor-pointer flex flex-col"
              onClick={() => handleProductClick(p)}
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={p.images?.[0] || bannerUrl}
                  alt={p.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.18em] px-3 py-1 rounded-full border border-zinc-700 bg-black/50 text-zinc-200">
                  {p.category || 'Category'}
                </div>
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-zinc-50">
                    {p.title}
                  </h3>
                  <span className="text-xs text-zinc-400">{p.gender || 'All'}</span>
                </div>
                <p className="text-[11px] text-zinc-400 mb-2">
                  {p.fit || 'Regular'} · {p.color || 'Color'}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-amber-300 text-sm font-semibold">
                    {props.formatPrice(p.price)}
                  </span>
                  <button 
                    onClick={(e) => handleBuyClick(p, e)}
                    className="text-[11px] uppercase tracking-[0.16em] px-4 py-2 rounded-full bg-amber-500 border border-amber-500 text-zinc-950 hover:bg-amber-400 hover:border-amber-400 transition font-semibold"
                  >
                    Buy Now
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
