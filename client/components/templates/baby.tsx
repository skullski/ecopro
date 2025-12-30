import React, { useState, useMemo } from 'react';
import { TemplateProps } from '@/pages/storefront/templates/types';
import { useTemplateUniversalSettings } from '@/hooks/useTemplateUniversalSettings';
import { coerceSilverImageBlocks } from '@/lib/silverBlocks';

const DEFAULT_CATEGORIES = [
  { label: 'All', icon: '✨' },
  { label: 'Toys', icon: '🧸' },
  { label: 'Clothing', icon: '👕' },
  { label: 'Feeding', icon: '🍼' },
  { label: 'Strollers', icon: '🚼' },
  { label: 'Nursery', icon: '🛏' },
  { label: 'Bath', icon: '🛁' },
  { label: 'Shoes', icon: '🧦' },
  { label: 'Gifts', icon: '🎁' },
];

export default function BabyTemplate(props: TemplateProps) {
  const universalSettings = useTemplateUniversalSettings();
  const { navigate = () => {}, storeSlug = '' } = props;
  const [activeCategory, setActiveCategory] = useState("All");
  
  // Extract universal settings with defaults
  const {
    primary_color = '#ec4899',
    secondary_color = '#fce7f3',
    accent_color = '#f472b6',
    text_color = '#1f2937',
    secondary_text_color = '#6b7280',
    font_family = 'Inter',
    enable_animations = true,
  } = useMemo(() => universalSettings as any || {}, [universalSettings]);
  
  const products = props.products || [];
  const previewMode = Boolean((props as any).previewMode);
  const hideProducts = Boolean((props as any).hideProducts);
  const hasProducts = Array.isArray(products) && products.length > 0;
  const safeProducts = hideProducts ? [] : products;
  const settings = (props.settings || {}) as any;
  const storeName = settings.store_name || 'BabyOS';
  const bannerUrl = settings.banner_url || 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=2000&q=80';
  const heroVideoUrl = settings.hero_video_url || null;

  const silverHeaderBlocks = useMemo(
    () => coerceSilverImageBlocks((settings as any).silver_header_blocks),
    [settings]
  );
  const silverFooterBlocks = useMemo(
    () => coerceSilverImageBlocks((settings as any).silver_footer_blocks),
    [settings]
  );

  const headerSearchLabel = settings.template_header_search_label || 'Search';
  const headerCartLabel = settings.template_header_cart_label || 'Cart (0)';

  const heroBadgeLeft = settings.template_hero_badge_left || 'New season';
  const heroBadgeRight = settings.template_hero_badge_right || 'Soft & Playful';
  const heroHeading = settings.template_hero_heading || 'A soft, modern universe\nfor every little moment.';
  const heroSubtitle =
    settings.template_hero_subtitle ||
    'Toys, outfits, feeding essentials, nursery finds and tiny gifts — curated for newborns and toddlers in one balanced, playful store.';
  const ageChips = settings.template_age_chips
    ? String(settings.template_age_chips)
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)
    : ['0–6 months', '6–12 months', '1–3 years'];
  const primaryCta = settings.template_primary_cta || 'Shop baby essentials';
  const secondaryCta = settings.template_secondary_cta || 'View all toys';
  const heroImageAlt = settings.template_hero_image_alt || 'Baby hero';
  const featuredProductLabel = settings.template_featured_product_label || 'Featured product';

  const browseByCategoryLabel = settings.template_browse_by_category_label || 'Browse by category';

  const featuredKicker = settings.template_featured_kicker || 'Soft & snuggly picks';
  const featuredTitle = settings.template_featured_title || 'Plush friends and warm layers.';
  const featuredText =
    settings.template_featured_text ||
    'A small edit of plush toys, blankets and first outfits designed to feel soft against newborn skin. Gentle colors, cozy textures, and everyday comfort.';

  const gridKicker = settings.template_grid_kicker || 'All baby products';
  const gridTitle = settings.template_grid_title || 'Pieces in this universe';
  const itemsSuffix = settings.template_items_suffix || 'items';
  const emptyCategoryText = settings.template_empty_category_text || 'No items in this category';

  const productBadge1 = settings.template_product_badge_1 || 'Soft';
  const productBadge2 = settings.template_product_badge_2 || '0–6m';
  const buyNowLabel = settings.template_buy_now_label || 'Buy Now';

  const footerSuffix = settings.template_footer_suffix || 'Modern Baby Store';
  const footerLinks = settings.template_footer_links
    ? String(settings.template_footer_links)
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)
    : ['0–6m', '6–12m', '1–3y', 'Care guide'];

  const categories = useMemo(() => {
    const raw = settings.template_categories_json;
    if (!raw) return DEFAULT_CATEGORIES;
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!Array.isArray(parsed)) return DEFAULT_CATEGORIES;
      const cleaned = parsed
        .map((c: any) => ({ label: String(c?.label || ''), icon: String(c?.icon || '') }))
        .filter((c: any) => c.label);
      return cleaned.length ? cleaned : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  }, [settings]);
  
  const filteredProducts = hideProducts
    ? []
    : (activeCategory === "All" 
      ? products 
      : products.filter((p: any) => p.category === activeCategory));

  if (!hasProducts && !previewMode) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: secondary_color, color: text_color, fontFamily: font_family }}>
        <div className="text-center max-w-md mx-auto p-4 md:p-6">
          <div className="text-6xl mb-4">🍼</div>
          <h1 className="text-xl md:text-2xl font-semibold mb-3">No Products Yet</h1>
          <p className="mb-2" style={{ color: secondary_text_color }}>Add baby items to your store to see them displayed here.</p>
          <p className="text-sm" style={{ color: secondary_text_color }}>Products will appear automatically once you add them.</p>
        </div>
      </div>
    );
  }

  const heroHighlight = safeProducts[0];

  const ProductCard = ({ product }: { product: any }) => {
    const handleProductClick = () => {
      localStorage.setItem(`product_${product.id}`, JSON.stringify(product));
      localStorage.setItem('currentStoreSlug', storeSlug || '');
      const slug = product.slug || product.id;
      navigate(storeSlug ? `/store/${storeSlug}/${slug}` : `/product/${product.id}`);
    };

    const handleBuyClick = (e: any) => {
      e.stopPropagation();
      localStorage.setItem(`product_${product.id}`, JSON.stringify(product));
      localStorage.setItem('currentStoreSlug', storeSlug || '');
      const slug = product.slug || product.id;
      navigate(storeSlug ? `/store/${storeSlug}/${slug}` : `/product/${product.id}`);
    };

    return (
      <div 
        className="rounded-xl md:rounded-[22px] p-1.5 md:p-2.5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col"
        style={{ backgroundColor: secondary_color }}
        onClick={handleProductClick}
      >
        <img 
          src={product.images?.[0] || 'https://via.placeholder.com/300x210'} 
          alt={product.title} 
          className="w-full aspect-square md:aspect-[4/3] object-cover rounded-lg md:rounded-[18px]"
        />
        <div className="mt-2 md:mt-3 space-y-1.5 md:space-y-2 flex flex-col flex-grow px-1 md:px-0">
          <div className="flex items-center gap-1 flex-wrap">
            <span
              data-gold-edit-key="template_product_badge_1"
              data-edit-path="layout.categories.productBadge1"
              className="text-[8px] md:text-[10px] font-semibold px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full uppercase tracking-wider"
              style={{ backgroundColor: `${accent_color}20`, color: accent_color }}
            >
              {productBadge1}
            </span>
            <span
              data-gold-edit-key="template_product_badge_2"
              data-edit-path="layout.categories.productBadge2"
              className="text-[8px] md:text-[10px] font-semibold px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full uppercase tracking-wider"
              style={{ backgroundColor: `${primary_color}20`, color: primary_color }}
            >
              {productBadge2}
            </span>
          </div>
          <div className="min-w-0">
            <div className="text-[9px] md:text-[11px] uppercase tracking-widest truncate" style={{ color: secondary_text_color }}>
              {product.category || 'Baby'}
            </div>
            <h3 className="text-xs md:text-sm font-semibold mt-0.5 md:mt-1 line-clamp-2" style={{ color: text_color }}>
              {product.title}
            </h3>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-2 mt-auto">
            <span className="text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 md:py-1.5 rounded-full whitespace-nowrap" style={{ backgroundColor: `${primary_color}20`, color: primary_color }}>
              {props.formatPrice(product.price)}
            </span>
            <button 
              onClick={handleBuyClick}
              data-gold-edit-key="template_buy_now_label"
              data-edit-path="layout.categories.buyNowLabel"
              className="text-[9px] md:text-[11px] uppercase tracking-wider font-semibold px-2 md:px-4 py-1.5 md:py-2 rounded-full transition whitespace-nowrap"
              style={{ backgroundColor: primary_color, color: secondary_color }}
            >
              {buyNowLabel}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen"
      style={{ 
        backgroundColor: secondary_color, 
        fontFamily: font_family,
        backgroundImage: `url('${bannerUrl}')`,
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <style>{`
        .page-shell {
          max-width: 1240px;
          margin: 32px auto 48px;
          padding: 24px 32px 48px;
          background: rgba(255, 253, 249, 0.86);
          backdrop-filter: blur(18px);
          border-radius: 28px;
          box-shadow: 0 32px 80px rgba(15, 23, 42, 0.35), 0 8px 24px rgba(15, 23, 42, 0.45);
        }
        
        .float-shape {
          position: absolute;
          border-radius: 9999px;
          opacity: 0.8;
          filter: blur(2px);
        }
        
        .float-blue { background: #aee1ff; }
        .float-mint { background: #c8f7dc; }
        .float-peach { background: #ffd7c2; }
        .float-lavender { background: #e8d7ff; }
      `}</style>

      <div className="page-shell">
        {/* HEADER */}
        <header className="flex items-center justify-between mb-6">
          <div
            data-gold-edit-key="store_name"
            data-edit-path="__settings.store_name"
            className="text-xl md:text-2xl md:text-2xl md:text-xl md:text-2xl font-black tracking-[0.2em] text-amber-500"
          >
            {storeName}
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <button
              data-gold-edit-key="template_header_search_label"
              data-edit-path="layout.header.searchLabel"
              className="uppercase tracking-[0.18em] hover:text-gray-700"
            >
              {headerSearchLabel}
            </button>
            <button
              data-gold-edit-key="template_header_cart_label"
              data-edit-path="layout.header.cartLabel"
              className="uppercase tracking-[0.18em] hover:text-gray-700"
            >
              {headerCartLabel}
            </button>
          </div>
        </header>

        {/* HERO */}
        <section className="grid md:grid-cols-[1.05fr,0.95fr] gap-10 items-center mb-10 relative">
          {/* floating shapes */}
          <div className="float-shape float-blue" style={{ width: 70, height: 70, top: -30, right: 80 }} />
          <div className="float-shape float-mint" style={{ width: 52, height: 52, top: 40, left: -10 }} />
          <div className="float-shape float-peach" style={{ width: 48, height: 48, bottom: -10, left: 120 }} />
          <div className="float-shape float-lavender" style={{ width: 60, height: 60, bottom: -30, right: 60 }} />

          <div className="space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
              <span data-gold-edit-key="template_hero_badge_left" data-edit-path="layout.hero.badgeLeft">{heroBadgeLeft}</span>
              <span>•</span>
              <span data-gold-edit-key="template_hero_badge_right" data-edit-path="layout.hero.badgeRight">{heroBadgeRight}</span>
            </div>
            <h1
              data-gold-edit-key="template_hero_heading"
              data-edit-path="layout.hero.heading"
              className="text-2xl md:text-xl md:text-2xl leading-tight font-bold text-gray-900"
            >
              {heroHeading.split('\n').map((line: string, idx: number) => (
                <React.Fragment key={idx}>
                  {line}
                  {idx < heroHeading.split('\n').length - 1 ? <br /> : null}
                </React.Fragment>
              ))}
            </h1>
            <p data-gold-edit-key="template_hero_subtitle" data-edit-path="layout.hero.subtitle" className="text-sm text-gray-600 max-w-md">
              {heroSubtitle}
            </p>
            <div data-gold-edit-key="template_age_chips" data-edit-path="layout.hero.ageChips" className="flex flex-wrap gap-2">
              {ageChips.slice(0, 6).map((label: string, idx: number) => (
                <span
                  key={`${label}-${idx}`}
                  data-edit-path={`layout.hero.ageChips.${idx}`}
                  className="bg-yellow-100 text-yellow-900 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider"
                >
                  {label}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                data-gold-edit-key="template_primary_cta"
                data-edit-path="layout.hero.primaryCta"
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-yellow-400 to-pink-400 text-gray-900 text-xs font-semibold uppercase tracking-wider shadow-lg hover:shadow-xl transition-shadow"
              >
                {primaryCta}
              </button>
              <button
                data-gold-edit-key="template_secondary_cta"
                data-edit-path="layout.hero.secondaryCta"
                className="text-xs uppercase tracking-wider text-blue-500 font-semibold hover:text-blue-600"
              >
                {secondaryCta}
              </button>
            </div>
          </div>

          <div className="relative z-10">
            {heroVideoUrl ? (
              <video 
                autoPlay
                muted
                loop
                playsInline
                data-gold-edit-key="banner_url"
                  data-edit-path="__settings.hero_video_url"
                className="w-full aspect-[4/3] md:aspect-auto md:h-96 object-cover rounded-[28px] shadow-2xl"
              >
                <source src={heroVideoUrl} type="video/mp4" />
              </video>
            ) : (
              <img 
                src={bannerUrl} 
                alt={heroImageAlt} 
                data-gold-edit-key="banner_url"
                data-edit-path="__settings.banner_url"
                className="w-full aspect-[4/3] md:aspect-auto md:h-96 object-cover rounded-[28px] shadow-2xl"
              />
            )}
            {heroHighlight && (
              <div className="absolute left-5 bottom-5 bg-white/95 px-4 py-3 rounded-2xl border border-yellow-100 shadow-md">
                <div
                  data-gold-edit-key="template_featured_product_label"
                  data-edit-path="layout.hero.featuredProductLabel"
                  className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold"
                >
                  {featuredProductLabel}
                </div>
                <div className="text-sm font-semibold text-gray-900 mt-1">
                  {heroHighlight.title}
                </div>
                <div className="text-xs text-yellow-700 font-bold mt-1">
                  {props.formatPrice(heroHighlight.price)}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* CATEGORY FILTERS */}
        <section className="mb-4 md:mb-6">
          <div data-gold-edit-key="template_browse_by_category_label" data-edit-path="layout.categories.browseByCategoryLabel" className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">
            {browseByCategoryLabel}
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((c: any, idx: number) => (
              <button
                key={c.label}
                data-edit-path={`layout.categories.categories.${idx}`}
                onClick={() => setActiveCategory(c.label)}
                className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold whitespace-nowrap transition-all ${
                  activeCategory === c.label
                    ? 'bg-gradient-to-r from-blue-200 to-yellow-100 border-yellow-400 text-gray-700 shadow-md'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                } border flex items-center gap-2`}
              >
                <span className="text-base">{c.icon}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* FEATURED SECTION */}
        <section className="bg-gradient-to-br from-blue-100/75 to-yellow-50/85 rounded-xl md:rounded-2xl p-3 md:p-5 mb-6 md:mb-10">
          <div className="grid md:grid-cols-[0.9fr,1.1fr] gap-4 md:gap-4 items-center">
            <div className="space-y-2 md:space-y-3">
              <div data-gold-edit-key="template_featured_kicker" data-edit-path="layout.featured.kicker" className="text-[10px] md:text-xs uppercase tracking-widest text-gray-400 font-semibold">
                {featuredKicker}
              </div>
              <h2 data-gold-edit-key="template_featured_title" data-edit-path="layout.featured.title" className="text-lg md:text-2xl font-semibold text-gray-900">
                {featuredTitle}
              </h2>
              <p data-gold-edit-key="template_featured_text" data-edit-path="layout.featured.text" className="text-xs md:text-sm text-gray-700 max-w-sm">
                {featuredText}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
              {products.slice(0, 3).map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* PRODUCT GRID */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <div data-gold-edit-key="template_grid_kicker" data-edit-path="layout.grid.kicker" className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-1">
                {gridKicker}
              </div>
                <h2 data-gold-edit-key="template_grid_title" data-edit-path="layout.grid.title" className="text-2xl font-semibold text-gray-900">
                {gridTitle}
              </h2>
            </div>
            <div data-gold-edit-key="template_items_suffix" data-edit-path="layout.grid.itemsSuffix" className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
              {filteredProducts.length} {itemsSuffix}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-6 md:py-4 md:py-6">
              <p data-gold-edit-key="template_empty_category_text" data-edit-path="layout.grid.emptyCategoryText" className="text-gray-500">{emptyCategoryText}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filteredProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="text-xs text-gray-500 mt-4 md:mt-6 border-t border-gray-200 pt-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <span data-gold-edit-key="template_footer_suffix" data-edit-path="layout.footer.suffix">
              © {new Date().getFullYear()} {storeName} · {footerSuffix}
            </span>
            <div data-gold-edit-key="template_footer_links" data-edit-path="layout.footer.links" className="flex gap-4">
              {footerLinks.slice(0, 6).map((label: string, idx: number) => (
                <span key={`${label}-${idx}`} data-edit-path={`layout.footer.links.${idx}`}>{label}</span>
              ))}
            </div>
          </div>
        </footer>
      </div>

      {silverFooterBlocks.length > 0 && (
        <div style={{ maxWidth: 1240, margin: '0 auto 32px', padding: '0 16px' }}>
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(${silverFooterBlocks.length}, minmax(0, 1fr))` }}
          >
            {silverFooterBlocks
              .filter((b) => b.url && String(b.url).trim().length > 0)
              .map((b) => (
                <img
                  key={b.id}
                  src={b.url}
                  alt={b.alt || 'Footer image'}
                  className="w-full h-32 object-cover rounded-xl"
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const TEMPLATE_EDITOR_SECTIONS = [
  {
    title: 'Baby: Header',
    fields: [
      { key: 'template_header_search_label', label: 'Header: Search Label', type: 'text', defaultValue: 'Search' },
      { key: 'template_header_cart_label', label: 'Header: Cart Label', type: 'text', defaultValue: 'Cart (0)' },
    ],
  },
  {
    title: 'Baby: Hero',
    fields: [
      { key: 'template_hero_badge_left', label: 'Hero Badge Left', type: 'text', defaultValue: 'New season' },
      { key: 'template_hero_badge_right', label: 'Hero Badge Right', type: 'text', defaultValue: 'Soft & Playful' },
      { key: 'template_hero_heading', label: 'Hero Heading (use \\n for line breaks)', type: 'text', defaultValue: 'A soft, modern universe\nfor every little moment.' },
      {
        key: 'template_hero_subtitle',
        label: 'Hero Subtitle',
        type: 'text',
        defaultValue:
          'Toys, outfits, feeding essentials, nursery finds and tiny gifts — curated for newborns and toddlers in one balanced, playful store.',
      },
      { key: 'template_age_chips', label: 'Age Chips (comma-separated)', type: 'text', defaultValue: '0–6 months, 6–12 months, 1–3 years' },
      { key: 'template_primary_cta', label: 'Primary CTA', type: 'text', defaultValue: 'Shop baby essentials' },
      { key: 'template_secondary_cta', label: 'Secondary CTA', type: 'text', defaultValue: 'View all toys' },
      { key: 'template_featured_product_label', label: 'Featured Product Label', type: 'text', defaultValue: 'Featured product' },
      { key: 'template_hero_image_alt', label: 'Hero Image Alt', type: 'text', defaultValue: 'Baby hero' },
    ],
  },
  {
    title: 'Baby: Categories & Labels',
    fields: [
      { key: 'template_browse_by_category_label', label: 'Browse By Category Label', type: 'text', defaultValue: 'Browse by category' },
      {
        key: 'template_categories_json',
        label: 'Categories (JSON array of {label, icon})',
        type: 'textarea',
        defaultValue: JSON.stringify(DEFAULT_CATEGORIES, null, 2),
      },
      { key: 'template_product_badge_1', label: 'Product Badge 1', type: 'text', defaultValue: 'Soft' },
      { key: 'template_product_badge_2', label: 'Product Badge 2', type: 'text', defaultValue: '0–6m' },
      { key: 'template_buy_now_label', label: 'Buy Now Label', type: 'text', defaultValue: 'Buy Now' },
    ],
  },
  {
    title: 'Baby: Featured & Grid',
    fields: [
      { key: 'template_featured_kicker', label: 'Featured Kicker', type: 'text', defaultValue: 'Soft & snuggly picks' },
      { key: 'template_featured_title', label: 'Featured Title', type: 'text', defaultValue: 'Plush friends and warm layers.' },
      {
        key: 'template_featured_text',
        label: 'Featured Text',
        type: 'text',
        defaultValue:
          'A small edit of plush toys, blankets and first outfits designed to feel soft against newborn skin. Gentle colors, cozy textures, and everyday comfort.',
      },
      { key: 'template_grid_kicker', label: 'Grid Kicker', type: 'text', defaultValue: 'All baby products' },
      { key: 'template_grid_title', label: 'Grid Title', type: 'text', defaultValue: 'Pieces in this universe' },
      { key: 'template_items_suffix', label: 'Items Suffix', type: 'text', defaultValue: 'items' },
      { key: 'template_empty_category_text', label: 'Empty Category Text', type: 'text', defaultValue: 'No items in this category' },
    ],
  },
  {
    title: 'Baby: Footer',
    fields: [
      { key: 'template_footer_suffix', label: 'Footer Suffix', type: 'text', defaultValue: 'Modern Baby Store' },
      { key: 'template_footer_links', label: 'Footer Links (comma-separated)', type: 'text', defaultValue: '0–6m, 6–12m, 1–3y, Care guide' },
    ],
  },
] as const;
