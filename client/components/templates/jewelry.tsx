import React, { useState, useMemo } from 'react';
import { TemplateProps } from '@/pages/storefront/templates/types';
import { useTemplateUniversalSettings } from '@/hooks/useTemplateUniversalSettings';

export default function JewelryTemplate(props: TemplateProps) {
  const universalSettings = useTemplateUniversalSettings();
  const { navigate, storeSlug } = props;
  const [activeCollection, setActiveCollection] = useState('All');

  const products = props.products || [];
  const settings = props.settings || {};

  // Extract universal settings with defaults
  const {
    primary_color = '#b45309',
    secondary_color = '#fef3c7',
    accent_color = '#d97706',
    text_color = '#1f2937',
    secondary_text_color = '#6b7280',
    font_family = 'Inter',
    heading_size_multiplier = 'Large',
    border_radius = 8,
    enable_animations = true,
    show_product_shadows = true,
  } = useMemo(() => universalSettings as any || {}, [universalSettings]);

  const storeName = settings.store_name || 'JewelryOS';

  // Parse custom categories from template settings if available
  const customCategories = useMemo(() => {
    try {
      const cats = (settings as any).template_categories;
      if (typeof cats === 'string') {
        return JSON.parse(cats);
      }
      return Array.isArray(cats) ? cats : null;
    } catch {
      return null;
    }
  }, [settings]);

  // Filter products
  const filteredProducts = products.filter((p: any) => {
    if (activeCollection === 'All') return true;
    return p.collection === activeCollection;
  });

  // Get unique collections from products or use custom categories
  let collections: any[] = [];
  if (customCategories && customCategories.length > 0) {
    collections = ['All', ...customCategories.map((c: any) => c.name || c)];
  } else {
    collections = ['All', ...new Set(products.map((p: any) => p.collection || 'Uncategorized'))];
  }

  const handleProductClick = (product: any) => {
    localStorage.setItem(`product_${product.id}`, JSON.stringify(product));
    navigate(`/product/${product.id}`);
  };

  const handleBuyClick = (product: any, e?: any) => {
    if (e) e.stopPropagation();
    localStorage.setItem(`product_${product.id}`, JSON.stringify(product));
    navigate(`/checkout/${product.id}`);
  };

  const SHADOW_CLASS: Record<string, string> = {
    gold: 'shadow-gold',
    silver: 'shadow-silver',
    pearl: 'shadow-pearl',
    diamond: 'shadow-diamond',
    mixed: 'shadow-mixed',
  };

  const PRICE_CLASS: Record<string, string> = {
    gold: 'price-gold',
    silver: 'price-silver',
    pearl: 'price-pearl',
    diamond: 'price-diamond',
    mixed: 'price-mixed',
  };

  const dynamicStyles = `
    :root {
      --primary-color: ${primary_color};
      --secondary-color: ${secondary_color};
      --accent-color: ${accent_color};
      --text-color: ${text_color};
      --secondary-text-color: ${secondary_text_color};
      --font-family: ${font_family};
      --border-radius: ${border_radius}px;
    }
    
    body {
      font-family: var(--font-family);
      color: var(--text-color);
      background: white;
    }

    .category-pill {
      border-radius: 999px;
      border: 1px solid #d1d5db;
      padding: 8px 16px;
      font-size: 11px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      cursor: pointer;
      background: white;
      transition: ${enable_animations ? '0.18s' : 'none'};
    }

    .category-pill.active {
      border-color: var(--accent-color);
      color: var(--primary-color);
      box-shadow:
        0 0 12px rgba(212, 175, 55, 0.45),
        0 0 4px rgba(212, 175, 55, 0.9);
    }

    .product-card {
      background: white;
      border-radius: 18px;
      border: 1px solid #e5e7eb;
      overflow: hidden;
      transition: ${enable_animations ? '0.25s' : 'none'};
    }

    .product-img {
      width: 100%;
      height: 260px;
      object-fit: cover;
      display: block;
    }

    .shadow-gold {
      box-shadow:
        0 0 22px rgba(212, 175, 55, 0.55),
        0 0 6px rgba(212, 175, 55, 0.95);
    }

    .shadow-silver {
      box-shadow:
        0 0 22px rgba(170, 180, 190, 0.55),
        0 0 6px rgba(170, 180, 190, 0.95);
    }

    .shadow-pearl {
      box-shadow:
        0 0 22px rgba(240, 230, 220, 0.55),
        0 0 6px rgba(240, 230, 220, 0.95);
    }

    .shadow-diamond {
      box-shadow:
        0 0 22px rgba(200, 215, 240, 0.55),
        0 0 6px rgba(200, 215, 240, 0.95);
    }

    .shadow-mixed {
      box-shadow:
        0 0 22px rgba(212, 175, 55, 0.55),
        0 0 22px rgba(170, 180, 190, 0.55),
        0 0 6px rgba(212, 175, 55, 0.95),
        0 0 6px rgba(170, 180, 190, 0.95);
    }

    .price-gold { color: #b68b2e; }
    .price-silver { color: #8f9aa3; }
    .price-pearl { color: #b9a99a; }
    .price-diamond { color: #9aa7c2; }
    .price-mixed {
      background: linear-gradient(to right, #b68b2e, #8f9aa3);
      -webkit-background-clip: text;
      color: transparent;
    }

    .hero-img {
      width: 100%;
      height: 420px;
      object-fit: cover;
      display: block;
      border-radius: 24px;
    }

    .hero-frame {
      border: 1px solid rgba(212, 175, 55, 0.4);
      box-shadow:
        0 0 22px rgba(212, 175, 55, 0.55),
        0 0 6px rgba(212, 175, 55, 0.95);
    }

    .section-title {
      font-family: Georgia, serif;
      font-size: 24px;
      font-weight: 600;
      position: relative;
      display: inline-block;
    }

    .section-title::after {
      content: "";
      position: absolute;
      left: 0;
      bottom: -6px;
      width: 42%;
      height: 3px;
      background: linear-gradient(to right, #d4af37, #cfd3d6);
      box-shadow:
        0 0 12px rgba(212, 175, 55, 0.55),
        0 0 12px rgba(170, 180, 190, 0.55);
    }
  `;

  const heroImage = products[0]?.images?.[0] || 'https://images.unsplash.com/photo-1603561596112-0a132b757133?auto=format&fit=crop&w=1600&q=80';
  const heroProduct = products[0];

  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: secondary_color }}>
        <div className="text-center max-w-md mx-auto p-4 md:p-6">
          <div className="text-6xl mb-4">💎</div>
          <h1 className="text-xl md:text-2xl font-serif font-bold mb-4" style={{ color: text_color }}>No Products Yet</h1>
          <p className="mb-6" style={{ color: secondary_text_color }}>Add your jewelry pieces to see them displayed here.</p>
          <p className="text-sm" style={{ color: secondary_text_color }}>Products will appear automatically once you add them to your store.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={{ color: text_color }}>
      <style>{dynamicStyles}</style>

      {/* HEADER */}
      <header className="border-b border-gray-200 bg-white/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xs tracking-[0.3em] uppercase" style={{ color: text_color }}>
            {storeName}
          </div>
          <nav className="hidden md:flex gap-6 text-[11px] uppercase tracking-[0.16em]" style={{ color: secondary_text_color }}>
            <button className="hover:text-gray-900">Collections</button>
            <button className="hover:text-gray-900">Gold</button>
            <button className="hover:text-gray-900">Engagement</button>
          </nav>
          <div className="flex gap-4 text-[11px]" style={{ color: secondary_text_color }}>
            <button className="hover:text-gray-900">Search</button>
            <button className="hover:text-gray-900">Bag (0)</button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-14">
        <div className="grid md:grid-cols-[1.3fr,1.1fr] gap-10 items-center">
          <div>
            <div className="text-[11px] tracking-[0.28em] uppercase" style={{ color: secondary_text_color }} className="mb-3">
              Gold & silver jewelry / 2025
            </div>
            <h1 className="text-3xl md:text-4xl font-serif mb-4 leading-tight" style={{ color: text_color }}>
              Timeless jewelry, designed in gold and light.
            </h1>
            <p className="text-sm mb-5 max-w-md" style={{ color: secondary_text_color }}>
              A focused collection of rings, bracelets, necklaces and earrings in 18K gold, silver and diamonds. Built for quiet luxury, worn every day.
            </p>
            <div className="flex flex-wrap gap-3 mb-4 text-[11px]" style={{ color: secondary_text_color }}>
              <span className="px-3 py-1 rounded-full border" style={{ borderColor: accent_color, color: accent_color }}>
                18K Gold
              </span>
              <span className="px-3 py-1 rounded-full border border-slate-200 text-slate-600">
                Sterling Silver
              </span>
              <span className="px-3 py-1 rounded-full border border-sky-100 text-sky-700">
                Diamonds & Pearls
              </span>
            </div>
            <button 
              className="text-[11px] uppercase tracking-[0.22em] px-5 py-2 rounded-full border transition"
              style={{ borderColor: accent_color, color: accent_color }}
            >
              Explore the collection
            </button>
          </div>

          <div className="relative">
            <img
              src={heroImage}
              alt="Hero jewelry"
              className="hero-img hero-frame"
            />
            {heroProduct && (
              <div className="absolute bottom-4 left-4 px-4 py-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-gold" style={{ borderColor: accent_color }}>
                <div className="text-[10px] uppercase tracking-[0.18em] mb-1" style={{ color: primary_color }}>
                  Highlight piece
                </div>
                <div className="text-xs font-serif" style={{ color: text_color }}>
                  {heroProduct.title || 'Jewelry Piece'}
                </div>
                <div className="text-[11px] font-semibold mt-1 price-gold">
                  {heroProduct.price?.toLocaleString()} DZD
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* COLLECTION FILTERS */}
      <section className="max-w-6xl mx-auto px-6 pb-6">
        <div className="flex flex-wrap gap-3">
          {collections.map((c: string) => (
            <button
              key={c}
              className={`category-pill ${activeCollection === c ? 'active' : ''}`}
              onClick={() => setActiveCollection(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* FEATURED ROW */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="section-title">The Gold Edit</h2>
            <p className="text-sm" style={{ color: secondary_text_color }}>
              Sculpted rings and chains in warm 18K gold. Soft light, precise edges and a focus on proportion.
            </p>
            <p className="text-xs" style={{ color: secondary_text_color }}>
              Each piece is designed to stack quietly or stand alone.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1617038688874-ef666027625a?auto=format&fit=crop&w=900&q=80"
              className="h-44 w-full object-cover rounded-2xl shadow-gold border"
              style={{ borderColor: accent_color + '33' }}
              alt="Gold detail 1"
            />
            <img
              src="https://images.unsplash.com/photo-1611003228941-98852ba62227?auto=format&fit=crop&w=900&q=80"
              className="h-44 w-full object-cover rounded-2xl shadow-gold border"
              style={{ borderColor: accent_color + '33' }}
              alt="Gold detail 2"
            />
          </div>
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title">Pieces in this collection</h2>
          <span className="text-xs" style={{ color: secondary_text_color }}>
            {filteredProducts.length} pieces
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {filteredProducts.map((p: any) => (
            <div
              key={p.id}
              className={`product-card ${SHADOW_CLASS[p.material || 'gold']}`}
              onClick={() => handleProductClick(p)}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={p.images?.[0] || 'https://via.placeholder.com/400x300'}
                alt={p.title}
                className="product-img"
              />
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-serif font-semibold" style={{ color: text_color }}>
                    {p.title}
                  </h3>
                  <span className="text-[10px] uppercase tracking-[0.18em]" style={{ color: secondary_text_color }}>
                    {p.collection || 'Jewelry'}
                  </span>
                </div>
                <p className="text-xs" style={{ color: secondary_text_color }}>
                  {p.material || 'Premium'}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className={`font-semibold text-sm ${PRICE_CLASS[p.material || 'gold']}`}>
                    {p.price?.toLocaleString() || '0'} DZD
                  </span>
                  <button
                    onClick={(e) => handleBuyClick(p, e)}
                    className="text-[10px] uppercase tracking-[0.18em] px-3 py-1.5 rounded-full border transition"
                    style={{
                      borderColor: accent_color,
                      color: accent_color,
                    }}
                  >
                    View piece
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-6 text-[11px]" style={{ color: secondary_text_color }}>
          <div className="flex flex-col sm:flex-row gap-2 sm:justify-between">
            <span>
              © {new Date().getFullYear()} {storeName} · Minimal Luxury Jewelry
            </span>
            <div className="flex gap-4">
              <span>Materials</span>
              <span>Care</span>
              <span>Warranty</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
