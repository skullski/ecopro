import React, { useEffect, useRef, useState, useMemo } from "react";
import { type TemplateProps } from "@/pages/storefront/templates/types";
import { useTemplateUniversalSettings } from "@/hooks/useTemplateUniversalSettings";

/**
 * Store.tsx
 * - React + Tailwind CSS component
 * - Futuristic store template: hero carousel, neon theme,
 *   light/dark persistence, product grid, filters, cart counter.
 */

export default function Store(props: TemplateProps): JSX.Element {
  const { navigate, storeSlug } = props;
  
  // Read universal settings from hook
  const universalSettings = useTemplateUniversalSettings() || {};
  
  // Get products and settings from props
  const products = props.products || [];
  const settings = props.settings || {};

  // Extract settings with defaults
  const {
    primary_color = '#6c5ce7',
    secondary_color = '#0b1220',
    accent_color = '#00f0ff',
    text_color = '#e6eef8',
    font_family = 'Inter',
  } = useMemo(() => universalSettings as any || {}, [universalSettings]);

  const storeName = settings.store_name || 'ElectroStore DZ';
  const bannerUrl = settings.banner_url || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1400&auto=format&fit=crop';
  const heroHeading = settings.template_hero_heading || 'Your Trusted Electronics Store';
  const heroSubtitle = settings.template_hero_subtitle || 'Shop smartphones, laptops, monitors, and configure your dream PC with expert-curated parts and local support.';
  const buttonText = settings.template_button_text || 'Build Your PC';
  const neonColor = settings.template_neon_color || '#00f0ff';
  const currencyCode = settings.currency_code || 'DZD';

  // Helper functions for navigation
  const handleProductClick = (product: any) => {
    localStorage.setItem(`product_${product.id}`, JSON.stringify(product));
    navigate(`/product/${product.id}`);
  };

  const handleBuyClick = (product: any, e?: any) => {
    if (e) e.stopPropagation();
    localStorage.setItem(`product_${product.id}`, JSON.stringify(product));
    // Navigate to store checkout with proper path
    navigate(`checkout/${product.id}`);
  };

  // Theme
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "dark" || saved === "light") return saved;
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    } catch {}
    return settings.template_default_dark ? "dark" : "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Carousel - first slide is Build CTA
  const slides = [
    { id: 0, type: "build", title: heroHeading, subtitle: heroSubtitle, cta: { label: buttonText, href: "build" }, visual: bannerUrl },
    { id: 1, type: "image", title: "Featured Collection", subtitle: "High performance products for every need.", cta: { label: "Shop Now", href: "#electronics" }, bg: bannerUrl },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const slideTimer = useRef<number | null>(null);
  const paused = useRef(false);

  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
  }, []);

  function startAutoplay() {
    stopAutoplay();
    slideTimer.current = window.setInterval(() => {
      if (!paused.current) setCurrentSlide((s) => (s + 1) % slides.length);
    }, 3000);
  }
  function stopAutoplay() {
    if (slideTimer.current) {
      clearInterval(slideTimer.current);
      slideTimer.current = null;
    }
  }

  // Cart
  const [cartCount, setCartCount] = useState(0);
  function addToCart(product: any) {
    setCartCount((c) => c + 1);
    handleBuyClick(product);
  }

  // Filters
  const [categoryFilter, setCategoryFilter] = useState("");
  
  // Get unique categories from products
  const categories = useMemo(() => {
    const cats = new Set(products.map((p: any) => p.category).filter(Boolean));
    return ['', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = products.filter((p: any) => 
    categoryFilter ? p.category === categoryFilter : true
  );

  // Keyboard navigation for carousel
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") setCurrentSlide((s) => (s + 1) % slides.length);
      if (e.key === "ArrowLeft") setCurrentSlide((s) => (s - 1 + slides.length) % slides.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length]);

  return (
    <div className="min-h-screen antialiased">
      {/* Inline styles for the component (keeps TSX single-file) */}
      <style>{`
        :root {
          --bg: #0b1220;
          --surface: rgba(255,255,255,0.03);
          --muted: #9aa7bf;
          --text: #e6eef8;
          --neon-cyan: #00f0ff;
          --neon-indigo: #6c5ce7;
          --neon-magenta: #ff4db4;
          --accent-grad: linear-gradient(90deg,var(--neon-cyan),var(--neon-indigo));
          --glass: rgba(255,255,255,0.04);
          --card-shadow: 0 12px 40px rgba(2,6,23,0.6);
          --glow: 0 8px 40px rgba(0,240,255,0.08);
        }
        [data-theme="light"] {
          --bg: linear-gradient(180deg,#f6f9fc,#eef6ff);
          --surface: rgba(255,255,255,0.85);
          --muted: #475569;
          --text: #071033;
          --card-shadow: 0 10px 30px rgba(2,6,23,0.06);
          --glass: rgba(255,255,255,0.6);
          --glow: 0 8px 40px rgba(108,92,231,0.06);
        }
        body { background: var(--bg); color: var(--text); transition: background .22s ease, color .22s ease; }
        .header-glass { background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); backdrop-filter: blur(8px); border-bottom: 1px solid rgba(255,255,255,0.04); }
        [data-theme="light"] .header-glass { background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.85)); border-bottom: 1px solid rgba(15,23,42,0.04); }
        .logo-badge { width:44px;height:44px;border-radius:10px;background:linear-gradient(135deg,var(--neon-indigo),var(--neon-cyan)); box-shadow: 0 6px 30px rgba(108,92,231,0.18), 0 0 30px rgba(0,240,255,0.06) inset; display:flex;align-items:center;justify-content:center;color:white;font-weight:700; }
        .hero-wrap { position: relative; overflow: hidden; border-radius:16px; box-shadow: var(--card-shadow); }
        .hero-slide { position:absolute; inset:0; background-position:center; background-size:cover; background-repeat:no-repeat; transition: opacity .7s cubic-bezier(.2,.9,.2,1), transform .7s cubic-bezier(.2,.9,.2,1); opacity:0; transform:scale(1.02); display:flex; align-items:center; padding:2.5rem; }
        .hero-slide.active { opacity:1; transform:scale(1); z-index:2; }
        .hero-overlay { position:absolute; inset:0; background: linear-gradient(90deg, rgba(2,6,23,0.6) 0%, rgba(2,6,23,0.12) 60%); z-index:1; }
        .hero-content { position:relative; z-index:3; max-width:720px; color:white; }
        .hero-badge { display:inline-block; padding:6px 12px; border-radius:999px; background:var(--neon-cyan); color:#021; font-weight:700; font-size:.85rem; box-shadow:0 6px 30px rgba(0,240,255,0.08); }
        .hero-cta { display:inline-flex; align-items:center; gap:.6rem; padding:.75rem 1.1rem; border-radius:12px; background:var(--surface); color:var(--text); font-weight:800; box-shadow:var(--glow); transition: transform .16s ease, box-shadow .16s ease; }
        .hero-cta:hover { transform: translateY(-4px); box-shadow: 0 18px 60px rgba(108,92,231,0.18); }
        .hero-visual { position:absolute; right:0; bottom:0; top:0; width:48%; background-position:center; background-size:cover; z-index:2; border-left:1px solid rgba(255,255,255,0.02); }
        @media (max-width:1024px) { .hero-visual { display:none; } }
        .hero-controls { position:absolute; right:18px; bottom:18px; z-index:4; display:flex; gap:8px; }
        .hero-dot { width:10px; height:10px; border-radius:999px; background:rgba(255,255,255,0.18); cursor:pointer; border:1px solid rgba(255,255,255,0.06); }
        .hero-dot.active { background:var(--neon-cyan); box-shadow:0 8px 30px rgba(0,240,255,0.12); }
        .card { background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border-radius:12px; padding:12px; box-shadow:var(--card-shadow); transition: transform .18s ease; }
        .card:hover { transform: translateY(-8px); }
        .price { color: var(--neon-cyan); font-weight:800; }
        .floating-accent { position:absolute; right:-8%; top:-10%; width:420px; height:420px; border-radius:50%; background: radial-gradient(circle at 30% 30%, rgba(0,240,255,0.12), transparent 20%), radial-gradient(circle at 70% 70%, rgba(108,92,231,0.08), transparent 30%); filter:blur(40px); transform:translateZ(0); pointer-events:none; z-index:0; animation: float 8s ease-in-out infinite; }
        @keyframes float { 0%{transform:translateY(0)} 50%{transform:translateY(12px)} 100%{transform:translateY(0)} }
        @media (prefers-reduced-motion:reduce) { .floating-accent { animation:none } }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-40 header-glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6">
          <a href="#" className="flex items-center gap-3">
            <div className="logo-badge">{storeName.charAt(0).toUpperCase()}</div>
            <div>
              <div className="font-semibold">{storeName}</div>
              <div className="text-xs muted">Algeria • {currencyCode}</div>
            </div>
          </a>

          <nav className="ml-8 hidden lg:flex gap-6 items-center text-sm muted">
            <a className="hover:text-white" href="#home">Home</a>
            <a className="hover:text-white" href="#electronics">Electronics</a>
            <a className="hover:text-white" href="#components">Components</a>
            <button onClick={() => navigate('/build')} className="text-white font-semibold hover:text-cyan-400 transition">Build Your PC</button>
            <a className="hover:text-white" href="#support">Support</a>
          </nav>

          <div className="ml-auto flex items-center gap-4">
            <div className="hidden md:flex items-center bg-white/6 border border-white/6 rounded-lg px-3 py-2 shadow-sm">
              <svg className="w-5 h-5 text-white/60 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"/></svg>
              <input type="search" autoComplete="off" className="bg-transparent outline-none text-sm w-64" placeholder="Search phones, GPUs, accessories..." />
            </div>

            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle theme" className="p-2 rounded-md hover:bg-white/6">
              <svg className="w-5 h-5 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1M12 20v1M4.2 4.2l.7.7M18.1 18.1l.7.7M1 12h1M22 12h1M4.2 19.8l.7-.7M18.1 5.9l.7-.7M12 5a7 7 0 100 14 7 7 0 000-14z"/></svg>
            </button>

            <button id="cartBtn" className="relative p-2 rounded-md hover:bg-white/6">
              <svg className="w-6 h-6 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 7h14l-2-7M10 21a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z"/></svg>
              <span id="cartCount" className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full px-1.5">{cartCount}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-10 relative">
        <div className="floating-accent" aria-hidden="true" />

        {/* Hero carousel */}
        <section className="hero-wrap h-[520px] mb-10" aria-roledescription="carousel" aria-label="Featured promotions">
          {slides.map((s, idx) => {
            const isActive = idx === currentSlide;
            const style: React.CSSProperties = s.type === "build"
              ? { backgroundImage: "linear-gradient(90deg, rgba(2,6,23,0.45), rgba(2,6,23,0.12))" }
              : { backgroundImage: `url('${s.bg}')` };
            return (
              <div
                key={s.id}
                className={`hero-slide ${isActive ? "active" : ""}`}
                style={style}
                role="group"
                aria-roledescription="slide"
                aria-label={s.title}
                onMouseEnter={() => { paused.current = true; }}
                onMouseLeave={() => { paused.current = false; }}
              >
                <div className="hero-overlay" aria-hidden="true" />
                <div className="hero-content">
                  {s.type === "build" && <span className="hero-badge">Featured</span>}
                  <h1 className="mt-6 text-4xl md:text-5xl font-extrabold leading-tight">{s.title}</h1>
                  <p className="mt-4 text-lg max-w-xl muted">{s.subtitle}</p>

                  <div className="mt-8 flex gap-4">
                    {s.type === "build" ? (
                      <button 
                        onClick={() => navigate('/build')} 
                        className="hero-cta cursor-pointer"
                        aria-label={s.cta.label}
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/></svg>
                        {s.cta.label}
                      </button>
                    ) : (
                      <a className="hero-cta" href={s.cta.href} aria-label={s.cta.label}>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18"/></svg>
                        {s.cta.label}
                      </a>
                    )}
                    <a className="inline-flex items-center gap-2 border border-white/12 text-white px-4 py-3 rounded-lg hover:bg-white/6" href="#electronics">Shop Electronics</a>
                  </div>

                  {s.type === "build" && (
                    <div className="mt-8 grid grid-cols-3 gap-3 max-w-md">
                      <div className="text-sm">
                        <div className="font-semibold">Local Warranty</div>
                        <div className="opacity-90 text-xs muted">Trusted partners across Algeria</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-semibold">Fast Delivery</div>
                        <div className="opacity-90 text-xs muted">Express shipping to major cities</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-semibold">Expert Support</div>
                        <div className="opacity-90 text-xs muted">Guides & live help</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* decorative visual for build slide or fallback */}
                {s.type === "build" ? (
                  <div className="hero-visual" style={{ backgroundImage: `url('${s.visual}')` }} />
                ) : null}
              </div>
            );
          })}

          {/* Controls */}
          <div className="hero-controls" aria-hidden="false">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`hero-dot ${i === currentSlide ? "active" : ""}`}
                aria-label={`Slide ${i + 1}`}
                onClick={() => setCurrentSlide(i)}
              />
            ))}
          </div>
        </section>

        {/* Products & filters */}
        <section id="electronics" className="grid lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="card sticky top-28 p-4">
              <h4 className="font-semibold">Filters</h4>
              <div className="mt-3">
                <label className="block text-sm muted">Category</label>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="mt-2 w-full border rounded px-3 py-2 bg-transparent">
                  <option value="">All</option>
                  {categories.filter(Boolean).map((cat: string) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">All Products ({filteredProducts.length})</h3>
              <div className="text-sm muted">
                <select id="sortBy" className="border rounded px-2 py-1 bg-transparent">
                  <option value="popular">Most Popular</option>
                  <option value="new">New Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold mb-2">No Products Yet</h3>
                <p className="text-gray-400">This store hasn't added any products yet. Check back later!</p>
              </div>
            ) : (
              <div id="productGrid" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredProducts.map((p: any) => {
                  const productImage = Array.isArray(p.images) && p.images.length > 0 
                    ? p.images[0] 
                    : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';
                  return (
                    <article 
                      key={p.id} 
                      className="card cursor-pointer" 
                      onClick={() => handleProductClick(p)}
                    >
                      <div className="relative">
                        <img src={productImage} alt={p.title || p.name} className="w-full h-40 object-cover rounded-lg" loading="lazy" />
                        {p.is_featured && (
                          <div className="absolute top-3 left-3">
                            <span style={{ background: "linear-gradient(90deg,var(--neon-magenta),var(--neon-cyan))", color: "white", padding: "6px 8px", borderRadius: 999, fontWeight: 700, fontSize: 12 }}>Featured</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-3">
                        <div className="font-medium line-clamp-1">{p.title || p.name}</div>
                        <div className="text-xs muted">{p.category || 'Uncategorized'}</div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="price">{Number(p.price).toLocaleString()} {currencyCode}</div>
                          <button 
                            className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-cyan-400 text-white rounded text-sm"
                            onClick={(e) => addToCart(p)}
                          >
                            Buy
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4 muted">
          <div>© {new Date().getFullYear()} {storeName} — Algeria</div>
          <div className="flex gap-4 text-sm">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
