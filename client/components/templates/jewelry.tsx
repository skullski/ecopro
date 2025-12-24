import React, { useState, useMemo } from 'react';
import { TemplateProps } from '@/pages/storefront/templates/types';
import { useTemplateUniversalSettings } from '@/hooks/useTemplateUniversalSettings';

export default function JewelryTemplate(props: TemplateProps) {
  const universalSettings = useTemplateUniversalSettings();
  const { navigate, storeSlug } = props;
  const [activeCollection, setActiveCollection] = useState('All');

  const products = props.products || [];
  const settings = (props.settings || {}) as any;

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

  const emptyTitle = settings.template_empty_title || 'No Products Yet';
  const emptySubtitle = settings.template_empty_subtitle || 'Add your jewelry pieces to see them displayed here.';
  const emptyHint = settings.template_empty_hint || 'Products will appear automatically once you add them to your store.';

  const navCollections = settings.template_nav_collections || 'Collections';
  const navGold = settings.template_nav_gold || 'Gold';
  const navEngagement = settings.template_nav_engagement || 'Engagement';
  const navSearch = settings.template_nav_search || 'Search';
  const navBag = settings.template_nav_bag || 'Bag (0)';

  const heroKicker = settings.template_hero_kicker || 'Gold & silver jewelry / 2025';
  const heroHeading = settings.template_hero_heading || 'Timeless jewelry, designed in gold and light.';
  const heroSubtitle =
    settings.template_hero_subtitle ||
    'A focused collection of rings, bracelets, necklaces and earrings in 18K gold, silver and diamonds. Built for quiet luxury, worn every day.';
  const heroTags = (settings.template_hero_tags
    ? String(settings.template_hero_tags)
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)
    : ['18K Gold', 'Sterling Silver', 'Diamonds & Pearls']) as string[];
  const heroCta = settings.template_hero_cta || 'Explore the collection';
  const heroImageAlt = settings.template_hero_image_alt || 'Hero jewelry';
  const highlightLabel = settings.template_highlight_label || 'Highlight piece';

  const editTitle = settings.template_edit_title || 'The Gold Edit';
  const editSubtitle1 =
    settings.template_edit_subtitle_1 ||
    'Sculpted rings and chains in warm 18K gold. Soft light, precise edges and a focus on proportion.';
  const editSubtitle2 = settings.template_edit_subtitle_2 || 'Each piece is designed to stack quietly or stand alone.';
  const editImage1 =
    settings.template_edit_image_1 ||
    'https://images.unsplash.com/photo-1617038688874-ef666027625a?auto=format&fit=crop&w=900&q=80';
  const editImage2 =
    settings.template_edit_image_2 ||
    'https://images.unsplash.com/photo-1611003228941-98852ba62227?auto=format&fit=crop&w=900&q=80';
  const editImage1Alt = settings.template_edit_image_1_alt || 'Gold detail 1';
  const editImage2Alt = settings.template_edit_image_2_alt || 'Gold detail 2';

  const gridTitle = settings.template_grid_title || 'Pieces in this collection';
  const gridCountSuffix = settings.template_grid_count_suffix || 'pieces';
  const viewPieceLabel = settings.template_view_piece_label || 'View piece';

  const footerSuffix = settings.template_footer_suffix || 'Minimal Luxury Jewelry';
  const footerLinks = (settings.template_footer_links
    ? String(settings.template_footer_links)
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)
    : ['Materials', 'Care', 'Warranty']) as string[];

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
    navigate(`checkout/${product.id}`);
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

  const heroImage = settings.banner_url || 'https://images.unsplash.com/photo-1603561596112-0a132b757133?auto=format&fit=crop&w=1600&q=80';
  const heroProduct = products[0];

  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: secondary_color }}>
        <div className="text-center max-w-md mx-auto p-4 md:p-6">
          <div className="text-6xl mb-4">💎</div>
          <h1 className="text-xl md:text-2xl font-serif font-bold mb-4" style={{ color: text_color }}>{emptyTitle}</h1>
          <p className="mb-6" style={{ color: secondary_text_color }}>{emptySubtitle}</p>
          <p className="text-sm" style={{ color: secondary_text_color }}>{emptyHint}</p>
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
            <button className="hover:text-gray-900">{navCollections}</button>
            <button className="hover:text-gray-900">{navGold}</button>
            <button className="hover:text-gray-900">{navEngagement}</button>
          </nav>
          <div className="flex gap-4 text-[11px]" style={{ color: secondary_text_color }}>
            <button className="hover:text-gray-900">{navSearch}</button>
            <button className="hover:text-gray-900">{navBag}</button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-14">
        <div className="grid md:grid-cols-[1.3fr,1.1fr] gap-10 items-center">
          <div>
            <div className="mb-3 text-[11px] tracking-[0.28em] uppercase" style={{ color: secondary_text_color }}>
              {heroKicker}
            </div>
            <h1 className="text-3xl md:text-4xl font-serif mb-4 leading-tight" style={{ color: text_color }}>
              {heroHeading}
            </h1>
            <p className="text-sm mb-5 max-w-md" style={{ color: secondary_text_color }}>
              {heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-3 mb-4 text-[11px]" style={{ color: secondary_text_color }}>
              {heroTags.slice(0, 3).map((label: string, idx: number) => (
                <span
                  key={label}
                  className="px-3 py-1 rounded-full border"
                  style={
                    idx === 0
                      ? { borderColor: accent_color, color: accent_color }
                      : idx === 1
                        ? { borderColor: '#e2e8f0', color: '#475569' }
                        : { borderColor: '#e0f2fe', color: '#0369a1' }
                  }
                >
                  {label}
                </span>
              ))}
            </div>
            <button 
              className="text-[11px] uppercase tracking-[0.22em] px-5 py-2 rounded-full border transition"
              style={{ borderColor: accent_color, color: accent_color }}
            >
              {heroCta}
            </button>
          </div>

          <div className="relative">
            <img
              src={heroImage}
              alt={heroImageAlt}
              className="hero-img hero-frame"
            />
            {heroProduct && (
              <div className="absolute bottom-4 left-4 px-4 py-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-gold" style={{ borderColor: accent_color }}>
                <div className="text-[10px] uppercase tracking-[0.18em] mb-1" style={{ color: primary_color }}>
                  {highlightLabel}
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
            <h2 className="section-title">{editTitle}</h2>
            <p className="text-sm" style={{ color: secondary_text_color }}>
              {editSubtitle1}
            </p>
            <p className="text-xs" style={{ color: secondary_text_color }}>
              {editSubtitle2}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img
              src={editImage1}
              className="h-44 w-full object-cover rounded-2xl shadow-gold border"
              style={{ borderColor: accent_color + '33' }}
              alt={editImage1Alt}
            />
            <img
              src={editImage2}
              className="h-44 w-full object-cover rounded-2xl shadow-gold border"
              style={{ borderColor: accent_color + '33' }}
              alt={editImage2Alt}
            />
          </div>
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title">{gridTitle}</h2>
          <span className="text-xs" style={{ color: secondary_text_color }}>
            {filteredProducts.length} {gridCountSuffix}
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
                    {viewPieceLabel}
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
              © {new Date().getFullYear()} {storeName} · {footerSuffix}
            </span>
            <div className="flex gap-4">
              {footerLinks.slice(0, 3).map((label: string) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export const TEMPLATE_EDITOR_SECTIONS = [
  {
    title: 'Jewelry: Empty State',
    fields: [
      { key: 'template_empty_title', label: 'Empty Title', type: 'text', defaultValue: 'No Products Yet' },
      { key: 'template_empty_subtitle', label: 'Empty Subtitle', type: 'text', defaultValue: 'Add your jewelry pieces to see them displayed here.' },
      { key: 'template_empty_hint', label: 'Empty Hint', type: 'text', defaultValue: 'Products will appear automatically once you add them to your store.' },
    ],
  },
  {
    title: 'Jewelry: Header',
    fields: [
      { key: 'template_nav_collections', label: 'Nav: Collections', type: 'text', defaultValue: 'Collections' },
      { key: 'template_nav_gold', label: 'Nav: Gold', type: 'text', defaultValue: 'Gold' },
      { key: 'template_nav_engagement', label: 'Nav: Engagement', type: 'text', defaultValue: 'Engagement' },
      { key: 'template_nav_search', label: 'Nav: Search', type: 'text', defaultValue: 'Search' },
      { key: 'template_nav_bag', label: 'Nav: Bag', type: 'text', defaultValue: 'Bag (0)' },
    ],
  },
  {
    title: 'Jewelry: Hero',
    fields: [
      { key: 'template_hero_kicker', label: 'Hero Kicker', type: 'text', defaultValue: 'Gold & silver jewelry / 2025' },
      { key: 'template_hero_heading', label: 'Hero Heading', type: 'text', defaultValue: 'Timeless jewelry, designed in gold and light.' },
      {
        key: 'template_hero_subtitle',
        label: 'Hero Subtitle',
        type: 'text',
        defaultValue:
          'A focused collection of rings, bracelets, necklaces and earrings in 18K gold, silver and diamonds. Built for quiet luxury, worn every day.',
      },
      { key: 'template_hero_tags', label: 'Hero Tags (comma-separated)', type: 'text', defaultValue: '18K Gold, Sterling Silver, Diamonds & Pearls' },
      { key: 'template_hero_cta', label: 'Hero CTA', type: 'text', defaultValue: 'Explore the collection' },
      { key: 'template_highlight_label', label: 'Highlight Label', type: 'text', defaultValue: 'Highlight piece' },
      { key: 'template_hero_image_alt', label: 'Hero Image Alt', type: 'text', defaultValue: 'Hero jewelry' },
    ],
  },
  {
    title: 'Jewelry: Editorial',
    fields: [
      { key: 'template_edit_title', label: 'Editorial Title', type: 'text', defaultValue: 'The Gold Edit' },
      {
        key: 'template_edit_subtitle_1',
        label: 'Editorial Text 1',
        type: 'text',
        defaultValue: 'Sculpted rings and chains in warm 18K gold. Soft light, precise edges and a focus on proportion.',
      },
      { key: 'template_edit_subtitle_2', label: 'Editorial Text 2', type: 'text', defaultValue: 'Each piece is designed to stack quietly or stand alone.' },
      { key: 'template_edit_image_1', label: 'Editorial Image 1 URL', type: 'text', defaultValue: 'https://images.unsplash.com/photo-1617038688874-ef666027625a?auto=format&fit=crop&w=900&q=80' },
      { key: 'template_edit_image_1_alt', label: 'Editorial Image 1 Alt', type: 'text', defaultValue: 'Gold detail 1' },
      { key: 'template_edit_image_2', label: 'Editorial Image 2 URL', type: 'text', defaultValue: 'https://images.unsplash.com/photo-1611003228941-98852ba62227?auto=format&fit=crop&w=900&q=80' },
      { key: 'template_edit_image_2_alt', label: 'Editorial Image 2 Alt', type: 'text', defaultValue: 'Gold detail 2' },
    ],
  },
  {
    title: 'Jewelry: Grid & Footer',
    fields: [
      { key: 'template_grid_title', label: 'Grid Title', type: 'text', defaultValue: 'Pieces in this collection' },
      { key: 'template_grid_count_suffix', label: 'Grid Count Suffix', type: 'text', defaultValue: 'pieces' },
      { key: 'template_view_piece_label', label: 'View Piece Label', type: 'text', defaultValue: 'View piece' },
      { key: 'template_footer_suffix', label: 'Footer Suffix', type: 'text', defaultValue: 'Minimal Luxury Jewelry' },
      { key: 'template_footer_links', label: 'Footer Links (comma-separated)', type: 'text', defaultValue: 'Materials, Care, Warranty' },
    ],
  },
] as const;
