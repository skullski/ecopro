import React, { useState } from 'react';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  unit: string;
  type: 'single' | 'bundle';
  images: string[];
  description?: string;
}

interface Store {
  name: string;
  city: string;
  since: number;
  hero_images: string[];
  categories: Array<{ name: string; image: string }>;
  best_sellers: number[];
}

const store: Store = {
  name: 'Sweet Home Dz',
  city: 'Algiers',
  since: 2021,
  hero_images: [
    'https://images.unsplash.com/photo-1504382311256-6f8cfc696228?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1604908177522-4025a14fb3cd?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1454942901704-3c44c11b2ad1?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=900&q=80'
  ],
  categories: [
    { name: 'Makroud', image: 'https://images.unsplash.com/photo-1604908177522-4025a14fb3cd?auto=format&fit=crop&w=300&q=80' },
    { name: 'Kalb el louz', image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=300&q=80' },
    { name: 'Zlabia', image: 'https://images.unsplash.com/photo-1557300106-45575d8682f9?auto=format&fit=crop&w=300&q=80' },
    { name: 'Tcharek', image: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4856?auto=format&fit=crop&w=300&q=80' },
    { name: 'Ghribia', image: 'https://images.unsplash.com/photo-1454942901704-3c44c11b2ad1?auto=format&fit=crop&w=300&q=80' },
    { name: 'Mixed trays', image: 'https://images.unsplash.com/photo-1504382311256-6f8cfc696228?auto=format&fit=crop&w=300&q=80' }
  ],
  best_sellers: [1, 2, 3, 4]
};

const products: Product[] = [
  { id: 1, name: 'Makroud au miel', category: 'Makroud', price: 120, unit: 'kg', type: 'single', images: ['https://images.unsplash.com/photo-1604908177522-4025a14fb3cd?auto=format&fit=crop&w=900&q=80'] },
  { id: 2, name: 'Kalb el louz classique', category: 'Kalb el louz', price: 150, unit: 'kg', type: 'single', images: ['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=900&q=80'] },
  { id: 3, name: 'Zlabia Constantine', category: 'Zlabia', price: 130, unit: 'kg', type: 'single', images: ['https://images.unsplash.com/photo-1557300106-45575d8682f9?auto=format&fit=crop&w=900&q=80'] },
  { id: 4, name: 'Tcharek msaker', category: 'Tcharek', price: 180, unit: 'kg', type: 'single', images: ['https://images.unsplash.com/photo-1548943487-a2e4e43b4856?auto=format&fit=crop&w=900&q=80'] },
  { id: 5, name: 'Ghribia aux amandes', category: 'Ghribia', price: 110, unit: 'kg', type: 'single', images: ['https://images.unsplash.com/photo-1454942901704-3c44c11b2ad1?auto=format&fit=crop&w=900&q=80'] },
  { id: 6, name: 'Plateau mixte (Eid)', category: 'Mixed trays', price: 450, unit: 'tray', type: 'bundle', description: 'Selection of house classics for 8–10 people.', images: ['https://images.unsplash.com/photo-1504382311256-6f8cfc696228?auto=format&fit=crop&w=900&q=80'] },
  { id: 7, name: 'Plateau mariage', category: 'Mixed trays', price: 780, unit: 'tray', type: 'bundle', description: 'Premium selection for events and weddings.', images: ['https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=900&q=80'] },
  { id: 8, name: 'Kalb el louz pistache', category: 'Kalb el louz', price: 190, unit: 'kg', type: 'single', images: ['https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=900&q=80'] }
];

export default function CafeTemplate(props: any) {
  const { navigate = () => {}, storeSlug = '' } = props;
  const [activeCategory, setActiveCategory] = useState('all');
  const [cartCount, setCartCount] = useState(0);

  const categories = ['all', ...store.categories.map(c => c.name)];
  const filteredProducts = activeCategory === 'all' ? products : products.filter(p => p.category === activeCategory);
  const bestSellers = products.filter(p => store.best_sellers.includes(p.id));
  const bundles = products.filter(p => p.type === 'bundle');

  const categoryMap = store.categories.reduce((acc, c) => {
    acc[c.name] = c;
    return acc;
  }, {} as Record<string, { name: string; image: string }>);

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'radial-gradient(circle at top, #fff7ec 0, #f8f1e8 40%, #f5ede4 100%)',
        color: '#3b2b22'
      }}
    >
      {/* Sticky Cart */}
      <button
        className="fixed bottom-4 right-4 z-30 flex items-center gap-2 px-4 py-2 rounded-full shadow-lg text-xs"
        style={{ backgroundColor: '#3b2b22', color: '#f8f1e8' }}
      >
        <span>Cart</span>
        <span className="w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-semibold" style={{ backgroundColor: '#e2c48e', color: '#3b2b22' }}>
          {cartCount}
        </span>
      </button>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8 relative">
        {/* HEADER */}
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
              {store.name}
            </h1>
            <p className="text-xs mt-1 max-w-xs" style={{ color: '#7c6958' }}>
              Homemade Algerian sweets · prepared fresh in {store.city}
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end text-[11px]" style={{ color: '#8f7a67' }}>
            <span>Since {store.since}</span>
            <span>Orders via website · Delivery & pickup</span>
          </div>
        </header>

        {/* HERO */}
        <section className="mb-12 sm:mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-7 items-center">
            {/* Text */}
            <div style={{ opacity: 0, animation: 'fadeIn 0.6s ease forwards' }}>
              <span
                className="inline-block rounded-full px-[10px] py-[4px] text-[11px] uppercase tracking-widest border"
                style={{
                  background: 'rgba(226, 196, 142, 0.18)',
                  color: '#6e5745',
                  borderColor: 'rgba(226, 196, 142, 0.5)',
                  letterSpacing: '0.12em'
                }}
              >
                Algerian home sweets · Online
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-4 leading-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
                All your <span style={{ color: '#d19c54' }}>makroud, kalb el louz</span> and more — in one organized store.
              </h2>
              <p className="text-sm mt-3 max-w-md" style={{ color: '#7c6958' }}>
                Built for 40+ different sweets, this layout keeps your trays, pieces and boxes cleanly organized so customers never feel lost.
              </p>
              <div className="flex gap-2 mt-5">
                <button className="rounded-full px-[18px] py-[8px] text-[12px] uppercase tracking-widest font-semibold transition" style={{ background: 'linear-gradient(135deg, #e2c48e, #d19c54)', color: '#3b2b22', boxShadow: '0 10px 25px rgba(174, 139, 78, 0.45)', border: 'none', cursor: 'pointer', letterSpacing: '0.16em' }}>
                  Shop all sweets
                </button>
                <button className="rounded-full px-[18px] py-[8px] text-[12px] uppercase tracking-widest font-medium transition border" style={{ borderColor: 'rgba(59, 43, 34, 0.25)', background: 'rgba(255, 255, 255, 0.7)', color: '#3b2b22', cursor: 'pointer', letterSpacing: '0.16em' }}>
                  View trays & bundles
                </button>
              </div>
            </div>

            {/* 6-image collage */}
            <div className="grid grid-cols-3 gap-3" style={{ opacity: 0, animation: 'fadeIn 0.6s ease forwards' }}>
              {store.hero_images.map((src, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl overflow-hidden shadow-md"
                  style={{
                    backgroundColor: '#fdf7ee',
                    transform: idx === 1 || idx === 4 ? 'translateY(8px)' : 'none'
                  }}
                >
                  <img src={src} alt={`Sweet ${idx + 1}`} className="w-full h-[90px] sm:h-[110px] md:h-[120px] object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORY CHIPS */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase tracking-widest" style={{ color: '#a0866f', letterSpacing: '0.16em' }}>
              Browse by category
            </span>
            <span className="text-[11px]" style={{ color: '#a0866f' }}>
              Click to filter the grid below
            </span>
          </div>
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            {categories.map(cat => {
              const meta = categoryMap[cat];
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  className="rounded-full px-[14px] py-[6px] text-[12px] uppercase inline-flex items-center gap-[6px] transition"
                  style={{
                    background: isActive ? '#e2c48e' : 'rgba(255, 255, 255, 0.85)',
                    borderColor: isActive ? '#e2c48e' : '#e6d9c9',
                    color: isActive ? '#3b2b22' : '#3b2b22',
                    boxShadow: isActive ? '0 10px 25px rgba(174, 139, 78, 0.45)' : 'none',
                    transform: isActive ? 'translateY(-1px)' : 'none',
                    border: '1px solid',
                    cursor: 'pointer',
                    letterSpacing: '0.14em'
                  }}
                  onClick={() => setActiveCategory(cat)}
                >
                  {meta?.image && (
                    <img src={meta.image} alt={cat} style={{ width: '20px', height: '20px', borderRadius: '999px', objectFit: 'cover' }} />
                  )}
                  <span>{cat === 'all' ? 'All sweets' : cat}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* BEST SELLERS */}
        {bestSellers.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] uppercase tracking-widest" style={{ color: '#a0866f', letterSpacing: '0.16em' }}>
                  Top choices
                </span>
                <h3 className="font-serif text-xl font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>
                  Best sellers
                </h3>
              </div>
              <span className="text-xs hidden sm:inline" style={{ color: '#a0866f' }}>
                The sweets people reorder again and again
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {bestSellers.map(p => (
                <div
                  key={p.id}
                  className="relative p-3 rounded-[18px] transition hover:-translate-y-[3px]"
                  style={{
                    background: '#ffffff',
                    boxShadow: '0 10px 28px rgba(0, 0, 0, 0.07)'
                  }}
                  onMouseEnter={(e) => {
                    const btn = e.currentTarget.querySelector('div:last-child') as HTMLElement;
                    if (btn) {
                      btn.style.opacity = '1';
                      btn.style.transform = 'translateY(0)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    const btn = e.currentTarget.querySelector('div:last-child') as HTMLElement;
                    if (btn) {
                      btn.style.opacity = '0';
                      btn.style.transform = 'translateY(8px)';
                    }
                  }}
                >
                  <div className="overflow-hidden rounded-xl relative">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-full h-[120px] sm:h-[140px] object-cover transition"
                      style={{ transform: 'scale(1)' }}
                    />
                  </div>
                  <h4 className="text-sm font-semibold mt-2" style={{ color: '#3b2b22' }}>
                    {p.name}
                  </h4>
                  <p className="text-xs mt-1" style={{ color: '#7c6958' }}>
                    {p.price} DZD / {p.unit}
                  </p>

                  <div
                    className="absolute rounded-full text-[11px] py-[6px] w-[calc(100%-24px)] left-[12px] bottom-[12px] text-center transition"
                    style={{
                      background: '#3b2b22',
                      color: '#f8f1e8',
                      cursor: 'pointer',
                      opacity: 0,
                      transform: 'translateY(8px)'
                    }}
                    onClick={() => navigate(p.slug && p.slug.length > 0 ? `/store/${storeSlug}/${p.slug}` : `/product/${p.id}`)}
                  >
                    View
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* BUNDLES / TRAYS */}
        {bundles.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] uppercase tracking-widest" style={{ color: '#a0866f', letterSpacing: '0.16em' }}>
                  High value
                </span>
                <h3 className="font-serif text-xl font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>
                  Trays & bundles
                </h3>
              </div>
              <span className="text-xs hidden sm:inline" style={{ color: '#a0866f' }}>
                Perfect for Eid, weddings, visits and gifts
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {bundles.map((b, idx) => (
                <div
                  key={b.id}
                  className="relative p-3 rounded-[18px] transition hover:-translate-y-[3px]"
                  style={{
                    background: '#ffffff',
                    boxShadow: '0 10px 28px rgba(0, 0, 0, 0.07)'
                  }}
                  onMouseEnter={(e) => {
                    const btn = e.currentTarget.querySelector('div:last-child') as HTMLElement;
                    if (btn) {
                      btn.style.opacity = '1';
                      btn.style.transform = 'translateY(0)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    const btn = e.currentTarget.querySelector('div:last-child') as HTMLElement;
                    if (btn) {
                      btn.style.opacity = '0';
                      btn.style.transform = 'translateY(8px)';
                    }
                  }}
                >
                  {idx === 0 && (
                    <span
                      className="absolute top-[10px] left-[10px] text-[10px] uppercase px-[9px] py-[3px] rounded-full"
                      style={{
                        background: '#d19c54',
                        color: '#3b2b22',
                        letterSpacing: '0.14em'
                      }}
                    >
                      Most popular
                    </span>
                  )}
                  {idx === 1 && (
                    <span
                      className="absolute top-[10px] left-[10px] text-[10px] uppercase px-[9px] py-[3px] rounded-full"
                      style={{
                        background: '#c4863a',
                        color: '#3b2b22',
                        letterSpacing: '0.14em'
                      }}
                    >
                      Eid special
                    </span>
                  )}
                  <div className="overflow-hidden rounded-xl">
                    <img
                      src={b.images[0]}
                      alt={b.name}
                      className="w-full h-[160px] object-cover transition"
                    />
                  </div>
                  <h4 className="text-sm font-semibold mt-2" style={{ color: '#3b2b22' }}>
                    {b.name}
                  </h4>
                  <p className="text-xs mt-1" style={{ color: '#7c6958' }}>
                    {b.price} DZD / {b.unit}
                  </p>
                  <p className="text-[11px] mt-1" style={{ color: '#a0866f' }}>
                    {b.description}
                  </p>

                  <div
                    className="absolute rounded-full text-[11px] py-[6px] w-[calc(100%-24px)] left-[12px] bottom-[12px] text-center transition"
                    style={{
                      background: '#3b2b22',
                      color: '#f8f1e8',
                      cursor: 'pointer',
                      opacity: 0,
                      transform: 'translateY(8px)'
                    }}
                    onClick={() => navigate(b.slug && b.slug.length > 0 ? `/store/${storeSlug}/checkout/${b.slug}` : `/checkout/${b.id}`)}
                  >
                    Order now
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FULL PRODUCT GRID */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] uppercase tracking-widest" style={{ color: '#a0866f', letterSpacing: '0.16em' }}>
                {activeCategory === 'all' ? 'All items' : `Category: ${activeCategory}`}
              </span>
              <h3 className="font-serif text-xl font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>
                {activeCategory === 'all' ? 'All sweets' : activeCategory}
              </h3>
            </div>
            <span className="text-xs" style={{ color: '#a0866f' }}>
              {filteredProducts.length} items
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {filteredProducts.map(p => (
              <div
                key={p.id}
                className="relative p-3 rounded-[18px] transition hover:-translate-y-[3px]"
                style={{
                  background: '#ffffff',
                  boxShadow: '0 10px 28px rgba(0, 0, 0, 0.07)'
                }}
                onMouseEnter={(e) => {
                  const btn = e.currentTarget.querySelector('div:last-child') as HTMLElement;
                  if (btn) {
                    btn.style.opacity = '1';
                    btn.style.transform = 'translateY(0)';
                  }
                }}
                onMouseLeave={(e) => {
                  const btn = e.currentTarget.querySelector('div:last-child') as HTMLElement;
                  if (btn) {
                    btn.style.opacity = '0';
                    btn.style.transform = 'translateY(8px)';
                  }
                }}
              >
                <div className="overflow-hidden rounded-xl">
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-full h-[120px] sm:h-[140px] object-cover transition"
                  />
                </div>
                <h4 className="text-sm font-semibold mt-2 line-clamp-2" style={{ color: '#3b2b22' }}>
                  {p.name}
                </h4>
                <p className="text-xs mt-1" style={{ color: '#7c6958' }}>
                  {p.price} DZD / {p.unit}
                </p>

                <div
                  className="absolute rounded-full text-[11px] py-[6px] w-[calc(100%-24px)] left-[12px] bottom-[12px] text-center transition"
                  style={{
                    background: '#3b2b22',
                    color: '#f8f1e8',
                    cursor: 'pointer',
                    opacity: 0,
                    transform: 'translateY(8px)'
                  }}
                  onClick={() => navigate(p.slug && p.slug.length > 0 ? `/store/${storeSlug}/checkout/${p.slug}` : `/checkout/${p.id}`)}
                >
                  Order now
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer
          className="border-t pt-4 pb-6 text-[11px] flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between"
          style={{ borderColor: '#e4d6c6', color: '#8f7a67' }}
        >
          <div>
            <span>© {new Date().getFullYear()} {store.name}</span>
            <span className="hidden sm:inline"> · </span>
            <span className="block sm:inline">
              {store.city} · Homemade Algerian sweets
            </span>
          </div>
          <div className="flex gap-3">
            <span>Instagram</span>
            <span>Facebook</span>
            <span>WhatsApp</span>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
