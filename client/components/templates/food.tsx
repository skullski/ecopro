import React, { useState, useEffect, useMemo } from 'react';
import { TemplateProps } from '@/pages/storefront/templates/types';
import { useTemplateUniversalSettings } from '@/hooks/useTemplateUniversalSettings';

export default function FoodTemplate(props: TemplateProps) {
  const universalSettings = useTemplateUniversalSettings();
  const { navigate, storeSlug } = props;
  const [activeCategory, setActiveCategory] = useState('All');
  const [scrollY, setScrollY] = useState(0);

  const { products = [], settings = {}, formatPrice = (p: number) => `${p}` } = props;

  // Extract universal settings with defaults
  const {
    primary_color = '#d97706',
    secondary_color = '#fffbeb',
    accent_color = '#f59e0b',
    text_color = '#111827',
    secondary_text_color = '#6b7280',
    font_family = 'Inter',
    enable_animations = true,
  } = useMemo(() => universalSettings as any || {}, [universalSettings]);

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

  // Add safety check for empty products - render placeholder
  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: secondary_color }}>
        <div className="text-center max-w-md mx-auto p-4 md:p-6">
          <div className="text-6xl mb-4">🍽️</div>
          <h1 className="text-xl md:text-2xl font-serif mb-4" style={{ color: text_color }}>No Products Yet</h1>
          <p className="mb-6" style={{ color: secondary_text_color }}>Add some menu items to your store to see them displayed here.</p>
          <p className="text-sm" style={{ color: secondary_text_color }}>Products will appear automatically once you add them to your store.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY || 0);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const featured = products.slice(0, 3);
  const categories: Record<string, any[]> = {};
  products.forEach((p: any) => {
    const cat = p.category || 'Menu';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(p);
  });

  const allCategoryNames = ['All', ...Object.keys(categories)];
  const filteredHighlights = activeCategory === 'All' ? products : products.filter((p: any) => (p.category || 'Menu') === activeCategory);
  const seasonal = products[3] || products[0];

  const journey = [
    {
      label: (settings as any).template_journey_1_label || 'Start',
      title: (settings as any).template_journey_1_title || 'A quiet opening',
      text:
        (settings as any).template_journey_1_text ||
        'Clean, saline, and light dishes to reset the palate before anything louder appears.',
      image:
        (settings as any).template_journey_1_image ||
        'https://images.unsplash.com/photo-1544022613-8b31f5be2acb?auto=format&fit=crop&w=900&q=80',
    },
    {
      label: (settings as any).template_journey_2_label || 'Middle',
      title: (settings as any).template_journey_2_title || 'Depth & texture',
      text:
        (settings as any).template_journey_2_text ||
        'Warmer bowls, richer cuts, and the moment where the room starts to slow down.',
      image:
        (settings as any).template_journey_2_image ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80',
    },
    {
      label: (settings as any).template_journey_3_label || 'Finish',
      title: (settings as any).template_journey_3_title || 'A small ending',
      text:
        (settings as any).template_journey_3_text ||
        'Soft sweetness, temperature contrast, and citrus notes to clear everything away.',
      image:
        (settings as any).template_journey_3_image ||
        'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?auto=format&fit=crop&w=900&q=80',
    },
  ];

  const parallaxOffset = Math.min(scrollY * 0.06, 18);

  return (
    <div className="min-h-screen text-[15px] antialiased" style={{ backgroundColor: secondary_color }}>
      <style>{`
        :root {
          --bg: ${secondary_color};
          --bg-soft: ${secondary_color};
          --bg-card: ${secondary_color};
          --ink: ${text_color};
          --muted: ${secondary_text_color};
          --accent: ${primary_color};
          --accent-strong: #d34b36;
          --border-soft: #e3e1dd;
          --radius-lg: 18px;
          --shadow-soft: 0 18px 45px rgba(0, 0, 0, 0.08);
          --shadow-subtle: 0 12px 28px rgba(0, 0, 0, 0.05);
        }

        .card {
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-subtle);
          border: 1px solid var(--border-soft);
          background: var(--bg-card);
          transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease, background-color 220ms ease;
        }

        .card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-soft);
          border-color: #d6d3ce;
          background-color: #ffffff;
        }

        .card-image-wrap {
          overflow: hidden;
          position: relative;
        }

        .card-image-wrap img {
          transition: transform 260ms ease;
        }

        .card:hover .card-image-wrap img {
          transform: scale(1.03);
        }

        .fade-in {
          opacity: 0;
          transform: translateY(12px);
          animation: fadeInUp 520ms ease forwards;
        }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .thin-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.13), transparent);
        }

        .menu-tag {
          letter-spacing: 0.18em;
        }

        .hero-grid {
          position: relative;
        }

        .hero-bg-block {
          position: absolute;
          inset: -30px 0 auto 20%;
          background: linear-gradient(135deg, #f8f7f4 0%, #f2f0eb 50%, #f8f7f4 100%);
          border-radius: 40px;
          z-index: 0;
        }

        .hero-image-mask {
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 0 40px 90px rgba(0, 0, 0, 0.22);
          border: 1px solid rgba(255, 255, 255, 0.9);
          position: relative;
          z-index: 1;
          transform: translateY(0);
          transition: transform 400ms ease;
          will-change: transform;
        }

        .hero-seal {
          position: absolute;
          right: 7%;
          bottom: 9%;
          height: 70px;
          width: 70px;
          border-radius: 999px;
          border: 1px solid rgba(211, 75, 54, 0.5);
          background: radial-gradient(circle at 30% 30%, #fffaf7, #f4d0c6);
          box-shadow: 0 14px 30px rgba(211, 75, 54, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #531911;
        }

        .pill {
          border-radius: 999px;
          padding: 2px 10px;
          border: 1px solid rgba(0, 0, 0, 0.16);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.16em;
        }

        .link-underline {
          position: relative;
          overflow: hidden;
        }

        .link-underline::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -1px;
          width: 100%;
          height: 1px;
          background: #111111;
          transform: translateX(-100%);
          transition: transform 220ms ease;
        }

        .link-underline:hover::after {
          transform: translateX(0%);
        }

        .sourcing-strip {
          background: #111111;
          color: #f5f5f5;
        }

        .sourcing-dot {
          height: 4px;
          width: 4px;
          border-radius: 999px;
          background: #f5f5f5;
          margin: 0 10px;
          opacity: 0.55;
        }

        .journey-step {
          border-radius: 22px;
          border: 1px solid #e0ddd6;
          background: #fdfcfb;
          transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
        }

        .journey-step:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 30px rgba(0, 0, 0, 0.05);
          border-color: #d4d0c7;
        }

        .filter-pill {
          border-radius: 999px;
          padding: 6px 14px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          border: 1px solid transparent;
          cursor: pointer;
          transition: background-color 200ms ease, color 200ms ease, border-color 200ms ease;
        }

        .filter-pill-active {
          background: #111111;
          color: #f7f7f7;
          border-color: #111111;
        }

        .filter-pill-inactive {
          background: transparent;
          color: #7a7a7a;
          border-color: rgba(0, 0, 0, 0.12);
        }

        .footer-grad {
          background: linear-gradient(to top, #f0efec, #f7f7f5);
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-0 py-4 md:py-6 lg:py-3 md:py-4 md:py-6">
        {/* HEADER */}
        <header className="flex items-center justify-between mb-10 lg:mb-3 md:mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full border border-black flex items-center justify-center text-[9px] tracking-[0.18em] uppercase">
              {(settings?.store_name || 'SH').slice(0, 2)}
            </div>
            <div>
              <h1 className="font-serif text-xl tracking-[0.06em]">
                {settings?.store_name || 'Shiro Hana'}
              </h1>
              <p className="text-[10px] text-[#7a7a7a] uppercase menu-tag">
                Modern Japanese Kitchen
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="hidden sm:inline-flex items-center gap-2 px-4 py-2 border border-black rounded-full text-[10px] tracking-[0.16em] uppercase hover:bg-black hover:text-white transition-colors">
              Reserve
            </button>
            <button className="inline-flex items-center gap-1 text-[10px] text-[#7a7a7a] uppercase tracking-[0.16em] link-underline">
              Today's menu
            </button>
          </div>
        </header>

        {/* HERO */}
        <section className="hero-grid grid grid-cols-1 lg:grid-cols-[1.15fr_1.25fr] gap-10 lg:gap-3 md:gap-4 md:gap-4 md:gap-6 items-center mb-6 md:mb-4 md:mb-6 lg:mb-16 relative">
          <div className="hero-bg-block hidden lg:block" style={{ transform: `translateY(${parallaxOffset * 0.5}px)` }}></div>

          {/* text side */}
          <div className="fade-in" style={{ animationDelay: '40ms' }}>
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#7a7a7a] mb-3">
              Tokyo-inspired · Since 2024
            </p>
            <h2 className="font-serif text-[1.9rem] sm:text-[2.2rem] lg:text-[2.6rem] leading-tight mb-4">
              {settings.template_hero_heading || 'Crafted with precision, served without urgency.'}
            </h2>
            <p className="text-[13px] text-[#7a7a7a] max-w-md mb-4">
              {settings.template_hero_subtitle || 'A small, deliberate menu built on clean broths, sharp knives, and patient techniques. Every plate is designed to be noticed, not photographed and forgotten.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-4">
              <button className="px-5 py-2.5 border border-black rounded-full text-[10px] tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-colors">
                Book an evening
              </button>
              <button className="px-4 py-2 rounded-full text-[10px] tracking-[0.18em] uppercase text-[#7a7a7a] hover:text-black transition-colors">
                Taste the route
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <span className="pill">Omakase available</span>
              <span className="pill">Seasonal menu</span>
            </div>
          </div>

          {/* image side */}
          <div className="fade-in" style={{ animationDelay: '120ms' }}>
            <div
              className="hero-image-mask"
              style={{ transform: `translateY(${parallaxOffset * -1}px)` }}
            >
              <img
                src={settings.banner_url || 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=80'}
                alt="Hero dish"
                className="w-full h-[300px] sm:h-[340px] lg:h-[380px] object-cover"
              />
              <div className="hero-seal hidden sm:flex">
                <span>SHI · RO · HA · NA</span>
              </div>
            </div>
          </div>
        </section>

        {/* SOURCING STRIP */}
        <section
          className="sourcing-strip rounded-2xl px-3 sm:px-4 lg:px-3 py-2 sm:py-3 flex flex-wrap items-center justify-center sm:justify-between gap-2 sm:gap-3 fade-in mb-4 md:mb-6 md:mb-10"
          style={{ animationDelay: '160ms' }}
        >
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
            <span>Rice from Niigata</span>
            <span className="sourcing-dot" />
            <span>Fish delivered before 11:00</span>
            <span className="sourcing-dot" />
            <span>Broths simmered 12+ hours</span>
          </div>
          <div className="hidden sm:flex text-[10px] uppercase tracking-[0.18em] opacity-70">
            For guests who notice small things.
          </div>
        </section>

        {/* FEATURED + SEASONAL WRAP with overlap layout */}
        <section className="mb-14">
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1.1fr] gap-10 items-start">
            {/* FEATURED */}
            <div>
              <div className="flex items-end justify-between mb-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[#7a7a7a] mb-2">
                    Featured
                  </p>
                  <h3 className="font-serif text-[1.4rem]">
                    Today's selection
                  </h3>
                </div>
                <p className="hidden sm:block text-[11px] text-[#7a7a7a]">
                  Three plates that describe the kitchen in one evening.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {featured.map((product, idx) => (
                  <article
                    key={product.id}
                    className="card overflow-hidden fade-in"
                    style={{ animationDelay: `${80 + idx * 60}ms` }}
                  >
                    <div className="card-image-wrap h-40">
                      <img
                        src={product.images?.[0]}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute top-3 left-3 bg-white/92 text-[10px] uppercase tracking-[0.16em] px-2 py-1 rounded-full">
                          Chef's pick
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="font-serif text-[15px]">
                          {product.title}
                        </h4>
                        <span className="text-[10px] text-[#7a7a7a] uppercase tracking-[0.16em]">
                          {product.category || 'Dish'}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#7a7a7a] mb-2 line-clamp-2">
                        {product.description || 'Clean, focused flavors with a precise balance of texture and aroma.'}
                      </p>
                      <p className="text-[13px] flex items-center justify-between">
                        <span className="font-medium">
                          {product.price} DZD
                        </span>
                        <span className="text-[11px] text-[#a0a0a0]">
                          Best in three bites.
                        </span>
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* SEASONAL FEATURE – overlaps visually on large screens */}
            <div className="relative fade-in" style={{ animationDelay: '140ms' }}>
              <div className="absolute -top-6 -left-6 h-10 w-32 bg-[#f0eee8] rounded-full hidden lg:block" />
              <div className="card overflow-hidden relative z-10">
                <div className="grid grid-cols-[1.25fr_1.1fr] gap-0 items-stretch">
                  <div className="card-image-wrap">
                    <img
                      src={seasonal.images?.[0]}
                      alt={seasonal.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-[#111111]/90 text-[10px] uppercase tracking-[0.16em] px-2 py-1 rounded-full text-white">
                      Seasonal route
                    </span>
                  </div>
                  <div className="p-4 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#a06b6b] mb-1">
                        Limited · Winter
                      </p>
                      <h4 className="font-serif text-[15px] mb-1.5">
                        {seasonal.title}
                      </h4>
                      <p className="text-[12px] text-[#7a7a7a] mb-2">
                        {seasonal.description || 'A focused seasonal plate built around temperature, texture, and restraint.'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-medium">
                        {seasonal.price} DZD
                      </span>
                      <button className="text-[11px] text-[#7a7a7a] hover:text-black transition-colors link-underline">
                        Add to evening →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TASTING JOURNEY */}
        <section className="mb-6 md:mb-4 md:mb-6 lg:mb-14">
          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#7a7a7a] mb-2">
                Tasting route
              </p>
              <h3 className="font-serif text-[1.4rem]">
                How an evening quietly unfolds.
              </h3>
            </div>
            <button className="hidden sm:inline-flex text-[11px] text-[#7a7a7a] hover:text-black transition-colors link-underline">
              Book the route →
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {journey.map((step, idx) => (
              <div
                key={step.label}
                className="journey-step p-4 fade-in"
                style={{ animationDelay: `${120 + idx * 70}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#7a7a7a]">
                    {step.label}
                  </span>
                  <span className="text-[11px] text-[#a0a0a0]">
                    0{idx + 1}
                  </span>
                </div>
                <div className="h-28 rounded-2xl overflow-hidden mb-3">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-serif text-[14px] mb-1">
                  {step.title}
                </h4>
                <p className="text-[12px] text-[#7a7a7a]">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CHEF NOTES / MICRO STORY */}
        <section className="mb-6 md:mb-4 md:mb-6">
          <div className="thin-divider mb-5" />
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.1fr] gap-10 items-start">
            <div className="fade-in" style={{ animationDelay: '80ms' }}>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#7a7a7a] mb-2">
                Chef's notes
              </p>
              <h3 className="font-serif text-[1.4rem] mb-2">
                Food for guests who watch the small things.
              </h3>
              <p className="text-[13px] text-[#7a7a7a] max-w-md mb-2">
                We time rice cooling in seconds, weigh broths down to the gram, and design plates around silence. None of this is loud, but all of it is intentional.
              </p>
              <p className="text-[13px] text-[#7a7a7a]">
                This is not a big menu. It's a narrow one, sharpened over time for people who prefer edges over volume.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-[#7a7a7a] fade-in" style={{ animationDelay: '140ms' }}>
              <div className="bg-[#fbfaf8] border border-[#e0ddd6] rounded-2xl px-3 py-3">
                <p className="uppercase tracking-[0.18em] text-[10px] mb-1">
                  Knife work
                </p>
                <p>Cut at 45°, always in one motion, never twice through the same line.</p>
              </div>
              <div className="bg-[#fbfaf8] border border-[#e0ddd6] rounded-2xl px-3 py-3">
                <p className="uppercase tracking-[0.18em] text-[10px] mb-1">
                  Rice
                </p>
                <p>Steamed, seasoned, then cooled for 90 seconds in a lacquered bowl.</p>
              </div>
              <div className="bg-[#fbfaf8] border border-[#e0ddd6] rounded-2xl px-3 py-3">
                <p className="uppercase tracking-[0.18em] text-[10px] mb-1">
                  Broth
                </p>
                <p>Never boiled. Always kept below the point where it tries to speak.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FILTERS + MENU GRID + IMPRESSIONS */}
        <section className="mb-6 md:mb-4 md:mb-6 lg:mb-14">
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#7a7a7a] mb-2">
                Menu highlights
              </p>
              <h3 className="font-serif text-[1.4rem]">
                A small menu, on purpose.
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {allCategoryNames.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={
                    'filter-pill ' +
                    (activeCategory === cat ? 'filter-pill-active' : 'filter-pill-inactive')
                  }
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
            {filteredHighlights.map((product, idx) => (
              <div
                key={product.id}
                className="bg-[#fbfaf8] border border-[#e0ddd6] rounded-2xl px-4 py-3 flex items-center justify-between gap-4 fade-in"
                style={{ animationDelay: `${100 + idx * 35}ms` }}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-[14px] truncate">
                    {product.title}
                  </p>
                  <p className="text-[11px] text-[#9a9a9a] mt-[2px] line-clamp-1">
                    {product.description || 'Subtle, balanced, and clean.'}
                  </p>
                </div>
                <p className="text-[13px] whitespace-nowrap">
                  {product.price} DZD
                </p>
              </div>
            ))}
          </div>

          {/* Impressions */}
          <div className="flex flex-col sm:flex-row gap-4 text-[11px] text-[#7a7a7a]">
            <div className="flex-1">
              <p className="uppercase tracking-[0.18em] text-[10px] mb-1">
                Guest impressions
              </p>
              <p>
                "It feels like the room slows down once the first dish lands. Nothing dramatic, just very precise."
              </p>
            </div>
            <div className="flex-1">
              <p className="uppercase tracking-[0.18em] text-[10px] mb-1">
                Another night
              </p>
              <p>
                "You leave without feeling heavy. It's not about being full. It's about being finished."
              </p>
            </div>
            <div className="flex-1">
              <p className="uppercase tracking-[0.18em] text-[10px] mb-1">
                Quiet detail
              </p>
              <p>
                "I noticed they never let the broth hit a rolling boil. That says enough."
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER / CLOSING RITUAL */}
        <footer className="footer-grad mt-4 pt-5 border-t border-[#e0ddd6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-[#8a8986]">
          <div>
            <p>
              © {new Date().getFullYear()} {settings?.store_name || 'Shiro Hana'}. All rights reserved.
            </p>
            <p className="mt-1 text-[10px]">
              Thank you for spending an evening where nothing needs to be rushed.
            </p>
          </div>
          <p className="uppercase tracking-[0.2em] text-[#7a7a7a]">
            Algiers · Service · Stillness
          </p>
        </footer>
      </div>
    </div>
  );
}

export const TEMPLATE_EDITOR_SECTIONS = [
  {
    title: 'Food: Journey Section',
    description: 'Edit the 3-step journey content (label/title/text/image).',
    fields: [
      { key: 'template_journey_1_label', label: 'Step 1 Label', type: 'text', placeholder: 'Start' },
      { key: 'template_journey_1_title', label: 'Step 1 Title', type: 'text', placeholder: 'A quiet opening' },
      { key: 'template_journey_1_text', label: 'Step 1 Text', type: 'textarea' },
      { key: 'template_journey_1_image', label: 'Step 1 Image', type: 'url', placeholder: 'https://...' },

      { key: 'template_journey_2_label', label: 'Step 2 Label', type: 'text', placeholder: 'Middle' },
      { key: 'template_journey_2_title', label: 'Step 2 Title', type: 'text', placeholder: 'Depth & texture' },
      { key: 'template_journey_2_text', label: 'Step 2 Text', type: 'textarea' },
      { key: 'template_journey_2_image', label: 'Step 2 Image', type: 'url', placeholder: 'https://...' },

      { key: 'template_journey_3_label', label: 'Step 3 Label', type: 'text', placeholder: 'Finish' },
      { key: 'template_journey_3_title', label: 'Step 3 Title', type: 'text', placeholder: 'A small ending' },
      { key: 'template_journey_3_text', label: 'Step 3 Text', type: 'textarea' },
      { key: 'template_journey_3_image', label: 'Step 3 Image', type: 'url', placeholder: 'https://...' },
    ],
  },
] as const;
