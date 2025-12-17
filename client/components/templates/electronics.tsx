import React, { useState } from 'react';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  short_spec: string;
  specs?: { display?: string; storage?: string; battery?: string };
  use_case?: string;
  images: string[];
}

interface Store {
  name: string;
  city: string;
  hero_badge: string;
  categories: string[];
  hero_product?: number;
  split_hero_product?: number;
  best_sellers?: number[];
  deals?: number[];
}

interface TemplateProps {
  products?: Product[];
  store?: Store;
}

export default function ElectronicsTemplate(props: any) {
  const { products = PRODUCTS, store = STORE, navigate, storeSlug } = props;
  const [activeCategory, setActiveCategory] = useState('all');
  const [cartCount, setCartCount] = useState(0);

  const categories = ['all', ...store.categories];
  const filteredProducts = activeCategory === 'all' ? products : products.filter(p => p.category === activeCategory);
  const heroProduct = products.find(p => p.id === store.hero_product);
  const splitHeroProduct = products.find(p => p.id === store.split_hero_product);
  const bestSellers = products.filter(p => store.best_sellers?.includes(p.id));
  const deals = products.filter(p => store.deals?.includes(p.id));

  const handleQuickAdd = () => setCartCount(c => c + 1);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative" style={{ background: 'radial-gradient(circle at top, #0f172a 0, #020617 45%, #000 100%)' }}>
      <div className="fixed bottom-4 right-4 z-40">
        <button className="flex items-center gap-2 px-4 py-2 rounded-full text-xs backdrop-blur-sm border border-slate-700 bg-slate-900/80">
          <span className="text-gray-200">Cart</span>
          <span className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-[11px] flex items-center justify-center text-slate-950 font-semibold">
            {cartCount}
          </span>
        </button>
      </div>

      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-slate-950 text-xs font-bold tracking-widest">EV</div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-gray-200">{store.name}</h1>
            <p className="text-[11px] text-slate-400">Phones · Audio · Gaming · Accessories</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400">
          <span>{store.city}</span>
          <span>·</span>
          <span>24/7 online</span>
        </div>
      </header>

      <section className="mb-10 sm:mb-14 space-y-6">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 to-slate-900 border border-slate-700">
          <div className="absolute inset-0 opacity-50">
            <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 10% 0%, rgba(56, 189, 248, 0.18) 0, transparent 55%), radial-gradient(circle at 90% 20%, rgba(14, 165, 233, 0.18) 0, transparent 55%)' }} />
          </div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] items-center gap-6 px-6 sm:px-10 py-7 sm:py-9">
            <div>
              <span className="inline-flex items-center gap-2 text-xs text-slate-200 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
                New · {store.hero_badge}
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold leading-tight text-gray-100">
                Flagship <span className="text-cyan-400">performance</span> for your entire tech store.
              </h2>
              <p className="mt-3 text-sm text-slate-200 max-w-md">
                Showcase phones, headphones, gaming gear and accessories in a layout that feels engineered — not cozy, not boutique.
              </p>
              {heroProduct && (
                <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-slate-100">
                  <div className="px-3 py-1 rounded-full bg-slate-900/60 border border-slate-700">{heroProduct.name}</div>
                  <div className="px-3 py-1 rounded-full bg-slate-900/60 border border-slate-700">{heroProduct.short_spec}</div>
                  <div className="px-3 py-1 rounded-full bg-slate-900/60 border border-slate-700">{heroProduct.price} DZD</div>
                </div>
              )}
              <div className="mt-5 flex gap-2">
                <button className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 text-xs font-semibold uppercase tracking-wider hover:shadow-lg hover:shadow-cyan-500/50 transition">
                  Shop flagship
                </button>
                <button className="px-6 py-2.5 rounded-full border border-slate-600 text-slate-200 text-xs font-semibold uppercase tracking-wider hover:bg-slate-800 transition">
                  View full catalog
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-6 bg-cyan-500/20 blur-3xl opacity-50" />
              <div className="relative rounded-2xl p-4 flex flex-col gap-3 bg-slate-900/80 border border-slate-700">
                {heroProduct && (
                  <>
                    <div className="overflow-hidden rounded-xl">
                      <img src={heroProduct.images[0]} alt={heroProduct.name} className="w-full h-[160px] sm:h-[190px] object-cover hover:scale-105 transition" />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>{heroProduct.name}</span>
                      <span className="text-cyan-400">{heroProduct.price} DZD</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-300">
                      <div className="border border-slate-700 rounded-md px-2 py-1 bg-slate-800/50">
                        <div className="text-slate-500">Display</div>
                        <div>{heroProduct.specs?.display}</div>
                      </div>
                      <div className="border border-slate-700 rounded-md px-2 py-1 bg-slate-800/50">
                        <div className="text-slate-500">Storage</div>
                        <div>{heroProduct.specs?.storage}</div>
                      </div>
                      <div className="border border-slate-700 rounded-md px-2 py-1 bg-slate-800/50">
                        <div className="text-slate-500">Battery</div>
                        <div>{heroProduct.specs?.battery}</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="rounded-2xl p-5 sm:p-6 bg-slate-900/80 border border-slate-700">
            <span className="text-xs uppercase tracking-widest text-slate-400">Catalog engine</span>
            <h3 className="mt-2 text-xl sm:text-2xl font-semibold text-gray-100">
              Split hero built for <span className="text-cyan-400">spec-driven</span> decisions.
            </h3>
            <p className="mt-2 text-sm text-slate-300 max-w-md">
              Show customers exactly why this headset, keyboard or monitor is the right choice — with specs, use cases and pricing visible up front.
            </p>
            <ul className="mt-3 text-xs text-slate-400 space-y-1.5">
              <li>• Tech-first copy — no cozy storytelling.</li>
              <li>• Clear hierarchy for specs, not emotions.</li>
              <li>• Layout tuned for comparison thinking.</li>
            </ul>
          </div>

          <div className="rounded-2xl p-4 sm:p-5 bg-slate-900/80 border border-slate-700 flex flex-col gap-3">
            {splitHeroProduct && (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{splitHeroProduct.name}</span>
                  <span className="text-cyan-400">{splitHeroProduct.price} DZD</span>
                </div>
                <div className="grid grid-cols-[1.2fr_0.8fr] gap-3 items-center">
                  <div className="overflow-hidden rounded-xl">
                    <img src={splitHeroProduct.images[0]} alt={splitHeroProduct.name} className="w-full h-[130px] sm:h-[150px] object-cover" />
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-1.5">
                    <div>
                      <div className="text-slate-500">Use case</div>
                      <div>{splitHeroProduct.use_case}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Key spec</div>
                      <div>{splitHeroProduct.short_spec}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Category</div>
                      <div>{splitHeroProduct.category}</div>
                    </div>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 text-[11px] font-semibold uppercase tracking-wider">
                  View full specs
                </button>
              </>
            )}
          </div>
        </div>

        {deals.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-widest text-slate-400">Live deals</span>
              <span className="text-[11px] text-slate-400">Horizontal scroll — promo items only</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {deals.map(p => (
                <div key={p.id} className="p-3 rounded-xl min-w-[220px] flex-shrink-0 bg-slate-900/80 border border-slate-700 group cursor-pointer hover:border-cyan-400 transition">
                  <div className="overflow-hidden rounded-md mb-2">
                    <img src={p.images[0]} alt={p.name} className="w-full h-[110px] object-cover group-hover:scale-105 transition" />
                  </div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="line-clamp-1 text-slate-200">{p.name}</span>
                    <span className="text-cyan-400">{p.price} DZD</span>
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-1 mb-2">{p.short_spec}</div>
                  <div className="flex gap-1">
                    <button className="flex-1 px-2 py-1 rounded-full bg-slate-900 text-[10px] border border-slate-600 text-slate-300 hover:border-cyan-400 hover:text-cyan-400 transition" onClick={() => navigate(p.slug && p.slug.length > 0 ? `/store/${storeSlug}/${p.slug}` : `/product/${p.id}`)}>
                      View
                    </button>
                    <button className="flex-1 px-2 py-1 rounded-full bg-cyan-600 text-[10px] border border-cyan-500 text-slate-900 hover:bg-cyan-500 transition" onClick={() => navigate(p.slug && p.slug.length > 0 ? `/store/${storeSlug}/checkout/${p.slug}` : `/checkout/${p.id}`)}>
                      Buy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-widest text-slate-400">Categories</span>
          <span className="text-[11px] text-slate-400">Click to filter the ranking & grid</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-md px-4 py-2 text-xs font-medium uppercase tracking-wider transition ${
                activeCategory === cat ? 'bg-cyan-400 text-slate-950' : 'bg-slate-900/80 border border-slate-700 text-slate-300 hover:border-cyan-400'
              }`}
            >
              {cat === 'all' ? 'All products' : cat}
            </button>
          ))}
        </div>
      </section>

      {bestSellers.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-slate-400">Performance ranking</span>
              <h3 className="mt-1 text-xl font-semibold text-gray-100">Best sellers</h3>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline">Sorted by sales & demand, not story</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {bestSellers.map((p, idx) => (
              <div key={p.id} className="rounded-xl p-3 bg-slate-900/80 border border-slate-700 group hover:border-cyan-400 transition relative">
                <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 text-[10px] uppercase tracking-wider font-semibold">
                  #{idx + 1} <span className="text-cyan-400">TOP</span>
                </div>
                <div className="overflow-hidden rounded-md mb-2">
                  <img src={p.images[0]} alt={p.name} className="w-full h-[130px] sm:h-[140px] object-cover group-hover:scale-105 transition" />
                </div>
                <h4 className="text-sm font-semibold line-clamp-2 text-gray-200">{p.name}</h4>
                <p className="text-xs text-slate-400 mt-1">{p.price} DZD</p>
                <p className="text-[11px] text-slate-500 mt-1">{p.short_spec}</p>
                <div className="flex gap-1 mt-2">
                  <button className="flex-1 px-2 py-1 rounded-full bg-slate-900 text-[10px] border border-slate-600 text-slate-300 hover:border-cyan-400 transition" onClick={() => navigate(p.slug && p.slug.length > 0 ? `/store/${storeSlug}/${p.slug}` : `/product/${p.id}`)}>
                    View
                  </button>
                  <button className="flex-1 px-2 py-1 rounded-full bg-cyan-600 text-[10px] border border-cyan-500 text-slate-900 hover:bg-cyan-500 transition" onClick={() => navigate(p.slug && p.slug.length > 0 ? `/store/${storeSlug}/checkout/${p.slug}` : `/checkout/${p.id}`)}>
                    Buy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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
              className={`rounded-xl p-3 bg-slate-900/80 border border-slate-700 group hover:border-cyan-400 transition flex flex-col ${
                idx % 7 === 0 ? 'lg:col-span-2' : ''
              }`}
            >
              <div className="overflow-hidden rounded-md mb-2">
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className={`w-full object-cover group-hover:scale-105 transition ${
                    idx % 7 === 0 ? 'h-[150px] sm:h-[170px]' : 'h-[120px] sm:h-[130px]'
                  }`}
                />
              </div>
              <h4 className="text-sm font-semibold line-clamp-2 text-gray-200">{p.name}</h4>
              <p className="text-xs text-slate-400 mt-1">{p.price} DZD</p>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{p.short_spec}</p>
              <div className="flex gap-1 mt-2">
                <button className="flex-1 px-2 py-1 rounded-full bg-slate-900 text-[10px] border border-slate-600 text-slate-300 hover:border-cyan-400 transition" onClick={() => navigate(p.slug && p.slug.length > 0 ? `/store/${storeSlug}/${p.slug}` : `/product/${p.id}`)}>
                  View
                </button>
                <button className="flex-1 px-2 py-1 rounded-full bg-cyan-600 text-[10px] border border-cyan-500 text-slate-900 hover:bg-cyan-500 transition" onClick={() => navigate(p.slug && p.slug.length > 0 ? `/store/${storeSlug}/checkout/${p.slug}` : `/checkout/${p.id}`)}>
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-800 pt-4 pb-6 text-[11px] text-slate-500 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <div>
          <span>© {new Date().getFullYear()} {store.name}</span>
          <span className="hidden sm:inline"> · </span>
          <span className="block sm:inline">{store.city} · Online electronics & gaming</span>
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

const STORE: Store = {
  name: 'ElectroVerse',
  city: 'Algiers',
  hero_badge: '2025 line-up',
  categories: ['Phones', 'Audio', 'Gaming', 'Accessories'],
  hero_product: 1,
  split_hero_product: 2,
  best_sellers: [1, 3, 4, 5],
  deals: [6, 7, 8],
};

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'X-Pro Max 5G',
    category: 'Phones',
    price: 115000,
    short_spec: '6.7" OLED · 256GB · 5G',
    specs: { display: '6.7" OLED 120Hz', storage: '256GB', battery: '4700 mAh' },
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80'],
  },
  {
    id: 2,
    name: 'Aurora ANC Headphones',
    category: 'Audio',
    price: 38000,
    short_spec: 'ANC · 35h · BT 5.3',
    use_case: 'Deep focus, flights, night gaming',
    specs: { display: '-', storage: '-', battery: '35h playback' },
    images: ['https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80'],
  },
  {
    id: 3,
    name: 'Nebula Gaming Controller',
    category: 'Gaming',
    price: 18500,
    short_spec: 'Low latency · PC/Console',
    images: ['https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80'],
  },
  {
    id: 4,
    name: 'Nova True Wireless Earbuds',
    category: 'Audio',
    price: 15500,
    short_spec: 'IPX4 · 24h total',
    images: ['https://images.unsplash.com/photo-1583391733956-6c78202c414a?auto=format&fit=crop&w=900&q=80'],
  },
  {
    id: 5,
    name: 'Orbit 4K Smart TV 55"',
    category: 'Accessories',
    price: 125000,
    short_spec: '4K HDR · 120Hz · Smart OS',
    images: ['https://images.unsplash.com/photo-1511452885600-a3d2c9148a31?auto=format&fit=crop&w=900&q=80'],
  },
  {
    id: 6,
    name: 'Flux Mechanical Keyboard RGB',
    category: 'Accessories',
    price: 9500,
    short_spec: 'Hot-swap · Tactile switches',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80'],
  },
  {
    id: 7,
    name: 'Pulse Power Bank 20,000mAh',
    category: 'Accessories',
    price: 6500,
    short_spec: 'USB-C PD · Fast charge',
    images: ['https://images.unsplash.com/photo-1612178685532-194a10fb893f?auto=format&fit=crop&w=900&q=80'],
  },
  {
    id: 8,
    name: 'Vortex Gaming Headset 7.1',
    category: 'Gaming',
    price: 14500,
    short_spec: 'Virtual 7.1 · Mic · RGB',
    images: ['https://images.unsplash.com/photo-1604587876573-99597fd9d822?auto=format&fit=crop&w=900&q=80'],
  },
];
