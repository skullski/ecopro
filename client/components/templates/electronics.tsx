import React, { useState, useMemo } from 'react';
import { TemplateProps } from '@/pages/storefront/templates/types';
import { useTemplateUniversalSettings } from '@/hooks/useTemplateUniversalSettings';

export default function ElectronicsTemplate(props: TemplateProps) {
  const universalSettings = useTemplateUniversalSettings();
  const { navigate, storeSlug } = props;
  const [activeCategory, setActiveCategory] = useState('all');

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

  const products = props.products || [];
  const settings = props.settings || {};
  
  // Extract universal settings with defaults
  const {
    primary_color = '#22d3ee',
    secondary_color = '#0f172a',
    accent_color = '#22d3ee',
    text_color = '#e2e8f0',
    secondary_text_color = '#94a3b8',
    font_family = 'Inter',
    heading_size_multiplier = 'Large',
    body_font_size = 14,
    section_padding = 24,
    border_radius = 8,
    enable_dark_mode = true,
    show_product_shadows = true,
    enable_animations = true,
  } = useMemo(() => universalSettings as any || {}, [universalSettings]);
  
  const accentColor = accent_color;
  
  const storeName = settings.store_name || 'ElectroVerse';
  const storeCity = (settings as any).store_city || 'Algiers';
  const heroBadge = (settings as any).template_hero_badge || '2025 line-up';
  
  const headingSizeMap: Record<string, { h1: string; h2: string }> = {
    Small: { h1: '20px', h2: '16px' },
    Medium: { h1: '28px', h2: '20px' },
    Large: { h1: '32px', h2: '24px' },
  };
  const headingSizes = headingSizeMap[heading_size_multiplier] || headingSizeMap['Large'];
  
  const dynamicStyles = `
    :root {
      --primary: ${primary_color};
      --secondary: ${secondary_color};
      --accent: ${accent_color};
      --text: ${text_color};
      --text-secondary: ${secondary_text_color};
      --font-family: ${font_family}, system-ui, sans-serif;
      --border-radius: ${border_radius}px;
    }
    h1, h2, h3 { font-family: var(--font-family); }
    h1 { font-size: ${headingSizes.h1}; }
    h2 { font-size: ${headingSizes.h2}; }
    button { ${enable_animations ? 'transition: all 0.3s ease;' : ''} border-radius: var(--border-radius); }
  `;

  // Render empty state if no products
  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: enable_dark_mode ? 'radial-gradient(circle at top, #0f172a 0, #020617 45%, #000 100%)' : secondary_color }}>
        <div className="text-center max-w-md mx-auto p-4 md:p-6">
          <div className="text-6xl mb-4">🔌</div>
          <h1 className="text-xl md:text-2xl font-bold mb-4" style={{ color: text_color }}>No Products Yet</h1>
          <p className="mb-6" style={{ color: secondary_text_color }}>Add some electronics to your store to see them displayed here.</p>
          <p className="text-sm" style={{ color: secondary_text_color }}>Products will appear automatically once you add them to your store.</p>
        </div>
      </div>
    );
  }

  // Extract categories from products
  const categories = ['all', ...new Set(products.map((p: any) => p.category))];
  const filteredProducts = activeCategory === 'all' ? products : products.filter((p: any) => p.category === activeCategory);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-4 md:py-6 relative" style={{ background: enable_dark_mode ? 'radial-gradient(circle at top, #0f172a 0, #020617 45%, #000 100%)' : secondary_color }}>
      <style>{dynamicStyles}</style>
      <header className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-slate-950 text-xs font-bold tracking-widest">EV</div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-gray-200">{storeName}</h1>
            <p className="text-[11px] text-slate-400">Phones · Audio · Gaming · Accessories</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400">
          <span>{storeCity}</span>
          <span>·</span>
          <span>24/7 online</span>
        </div>
      </header>

      <section className="mb-10 sm:mb-14 space-y-3 md:space-y-4">
        {/* Hero Section */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-slate-900 border border-slate-700">
          <div className="absolute inset-0 opacity-50">
            <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 10% 0%, rgba(56, 189, 248, 0.18) 0, transparent 55%), radial-gradient(circle at 90% 20%, rgba(14, 165, 233, 0.18) 0, transparent 55%)' }} />
          </div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] items-center gap-3 md:gap-4 px-6 sm:px-10 py-7 sm:py-9">
            <div>
              <span className="inline-flex items-center gap-2 text-xs text-slate-200 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
                New · {heroBadge}
              </span>
              <h2 className="mt-4 text-xl md:text-2xl sm:text-2xl md:text-xl md:text-2xl font-bold leading-tight text-gray-100">
                Flagship <span style={{ color: accent_color }}>performance</span> for your entire tech store.
              </h2>
              <p className="mt-3 text-sm text-slate-200 max-w-md">
                Showcase phones, headphones, gaming gear and accessories in a layout that feels engineered.
              </p>
              {products.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-slate-100">
                  <div className="px-3 py-1 rounded-full bg-slate-900/60 border border-slate-700">{String((products[0] as any).title || 'Product')}</div>
                  <div className="px-3 py-1 rounded-full bg-slate-900/60 border border-slate-700">{String((products[0] as any).short_spec || 'Premium specs')}</div>
                  <div className="px-3 py-1 rounded-full bg-slate-900/60 border border-slate-700">{String((products[0] as any).price || 0)} DZD</div>
                </div>
              )}
              <div className="mt-5 flex gap-2">
                <button style={{ backgroundColor: accentColor, color: '#0f172a' }} className="px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider hover:shadow-lg transition">
                  Shop flagship
                </button>
                <button className="px-6 py-2.5 rounded-full border border-slate-600 text-slate-200 text-xs font-semibold uppercase tracking-wider hover:bg-slate-800 transition">
                  View full catalog
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-6 blur-3xl opacity-50" style={{ backgroundColor: `${accentColor}33` }} />
              <div className="relative rounded-2xl p-4 flex flex-col gap-3 bg-slate-900/80 border border-slate-700">
                {products[0]?.images && (
                  <>
                    <div className="overflow-hidden rounded-xl">
                      <img src={products[0].images[0]} alt={products[0].title} className="w-full h-[160px] sm:h-[190px] object-cover hover:scale-105 transition" />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>{products[0].title}</span>
                      <span style={{ color: accentColor }}>{products[0].price} DZD</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-300">
                      <div className="border border-slate-700 rounded-md px-2 py-1 bg-slate-800/50">
                        <div className="text-slate-500">Display</div>
                        <div>{String((products[0] as any).display || 'Premium')}</div>
                      </div>
                      <div className="border border-slate-700 rounded-md px-2 py-1 bg-slate-800/50">
                        <div className="text-slate-500">Storage</div>
                        <div>{String((products[0] as any).storage || 'Premium')}</div>
                      </div>
                      <div className="border border-slate-700 rounded-md px-2 py-1 bg-slate-800/50">
                        <div className="text-slate-500">Battery</div>
                        <div>{String((products[0] as any).battery || 'Premium')}</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Split Hero with Second Product */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-3 md:gap-4">
          <div className="rounded-2xl p-5 sm:p-6 bg-slate-900/80 border border-slate-700">
            <span className="text-xs uppercase tracking-widest text-slate-400">Catalog engine</span>
            <h3 className="mt-2 text-xl sm:text-2xl font-semibold text-gray-100">
              Split hero built for <span style={{ color: accentColor }}>spec-driven</span> decisions.
            </h3>
            <p className="mt-2 text-sm text-slate-300 max-w-md">
              Show customers exactly why this product is the right choice — with specs, use cases and pricing visible up front.
            </p>
            <ul className="mt-3 text-xs text-slate-400 space-y-1.5">
              <li>• Tech-first copy — no unnecessary storytelling.</li>
              <li>• Clear hierarchy for specs, not emotions.</li>
              <li>• Layout tuned for comparison thinking.</li>
            </ul>
          </div>

          <div className="rounded-2xl p-4 sm:p-5 bg-slate-900/80 border border-slate-700 flex flex-col gap-3">
            {products.length > 1 && products[1]?.images && (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{products[1].title}</span>
                  <span style={{ color: accentColor }}>{products[1].price} DZD</span>
                </div>
                <div className="grid grid-cols-[1.2fr_0.8fr] gap-3 items-center">
                  <div className="overflow-hidden rounded-xl">
                    <img src={products[1].images[0]} alt={products[1].title} className="w-full h-[130px] sm:h-[150px] object-cover" />
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-1.5">
                    <div>
                      <div className="text-slate-500">Use case</div>
                      <div>{String((products[1] as any).use_case || 'Premium grade')}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Key spec</div>
                      <div>{String((products[1] as any).key_spec || 'Premium')}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Category</div>
                      <div>{products[1].category}</div>
                    </div>
                  </div>
                </div>
                <button style={{ backgroundColor: accentColor, color: '#0f172a' }} className="px-4 py-2 rounded-full text-[11px] font-semibold uppercase tracking-wider">
                  View full specs
                </button>
              </>
            )}
          </div>
        </div>

        {/* Featured Products Carousel */}
        {products.length > 2 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-widest text-slate-400">Featured products</span>
              <span className="text-[11px] text-slate-400">Horizontal scroll</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {products.slice(2, 5).map(p => (
                <div 
                  key={p.id} 
                  onClick={() => handleProductClick(p)}
                  className="p-3 rounded-xl min-w-[220px] flex-shrink-0 bg-slate-900/80 border border-slate-700 group cursor-pointer hover:border-cyan-400 transition flex flex-col"
                >
                  <div className="overflow-hidden rounded-md mb-2">
                    <img src={p.images[0]} alt={p.title} className="w-full h-[110px] object-cover group-hover:scale-105 transition" />
                  </div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="line-clamp-1 text-slate-200">{p.title}</span>
                    <span style={{ color: accentColor }}>{p.price} DZD</span>
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-1 mb-2">{String((p as any).category || 'General')}</div>
                  <button 
                    style={{ backgroundColor: accentColor, borderColor: accentColor, color: '#0f172a' }} 
                    className="w-full px-2 py-2 rounded-full bg-slate-900 text-[11px] border font-semibold transition hover:opacity-90" 
                    onClick={(e) => handleBuyClick(p, e)}
                  >
                    Buy Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Category Filter */}
      <section className="mb-4 md:mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-widest text-slate-400">Categories</span>
          <span className="text-[11px] text-slate-400">Click to filter products</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="rounded-md px-4 py-2 text-xs font-medium uppercase tracking-wider transition flex-shrink-0"
              style={{
                backgroundColor: activeCategory === cat ? accentColor : 'rgba(15, 23, 42, 0.8)',
                color: activeCategory === cat ? '#0f172a' : '#cbd5e1',
                border: activeCategory === cat ? 'none' : '1px solid #1e293b',
              }}
            >
              {cat === 'all' ? 'All products' : cat}
            </button>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      {products.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-slate-400">Performance ranking</span>
              <h3 className="mt-1 text-xl font-semibold text-gray-100">Best sellers</h3>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline">Top products</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {products.slice(0, 4).map((p, idx) => (
              <div key={p.id} className="rounded-xl p-3 bg-slate-900/80 border border-slate-700 group hover:border-cyan-400 transition relative">
                <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 text-[10px] uppercase tracking-wider font-semibold">
                  #{idx + 1} <span style={{ color: accentColor }}>TOP</span>
                </div>
                <div className="overflow-hidden rounded-md mb-2">
                  <img src={p.images[0]} alt={p.title} className="w-full h-[130px] sm:h-[140px] object-cover group-hover:scale-105 transition" />
                </div>
                <h4 className="text-sm font-semibold line-clamp-2 text-gray-200">{p.title}</h4>
                <p className="text-xs text-slate-400 mt-1">{p.price} DZD</p>
                <p className="text-[11px] text-slate-500 mt-1">{String((p as any).category || 'General')}</p>
                <div className="flex gap-1 mt-2">
                  <button className="flex-1 px-2 py-1 rounded-full bg-slate-900 text-[10px] border border-slate-600 text-slate-300 hover:border-cyan-400 transition" onClick={() => handleProductClick(p)}>
                    View
                  </button>
                  <button style={{ backgroundColor: accentColor, borderColor: accentColor, color: '#0f172a' }} className="flex-1 px-2 py-1 rounded-full text-[10px] border transition" onClick={(e) => handleBuyClick(p, e)}>
                    Buy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Products Grid */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-slate-400">
              {activeCategory === 'all' ? 'All items' : `Category: ${activeCategory}`}
            </span>
            <h3 className="mt-1 text-xl font-semibold text-gray-100">{activeCategory === 'all' ? 'All products' : activeCategory}</h3>
          </div>
          <span className="text-[11px] text-slate-400">{filteredProducts.length} items</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredProducts.map((p, idx) => (
            <div
              key={p.id}
              onClick={() => handleProductClick(p)}
              className={`rounded-xl p-3 bg-slate-900/80 border border-slate-700 group hover:border-cyan-400 transition flex flex-col cursor-pointer ${
                idx % 7 === 0 ? 'lg:col-span-2' : ''
              }`}
            >
              <div className="overflow-hidden rounded-md mb-2">
                <img
                  src={p.images[0]}
                  alt={p.title}
                  className={`w-full object-cover group-hover:scale-105 transition ${
                    idx % 7 === 0 ? 'h-[150px] sm:h-[170px]' : 'h-[120px] sm:h-[130px]'
                  }`}
                />
              </div>
              <h4 className="text-sm font-semibold line-clamp-2 text-gray-200">{p.title}</h4>
              <p className="text-xs text-slate-400 mt-1">{p.price} DZD</p>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{String((p as any).category || 'General')}</p>
              <div className="flex gap-1 mt-2">
                <button style={{ backgroundColor: accentColor, borderColor: accentColor, color: '#0f172a' }} className="w-full px-2 py-2 rounded-full text-xs font-semibold border transition hover:opacity-90" onClick={(e) => handleBuyClick(p, e)}>
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-800 pt-4 pb-6 text-[11px] text-slate-500 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <div>
          <span>© {new Date().getFullYear()} {storeName}</span>
          <span className="hidden sm:inline"> · </span>
          <span className="block sm:inline">{storeCity} · Online electronics & gaming</span>
        </div>
        <div className="flex gap-3">
          <span>Support</span>
          <span>Warranty</span>
          <span>Contact</span>
        </div>
      </footer>
    </div>
  );
}
