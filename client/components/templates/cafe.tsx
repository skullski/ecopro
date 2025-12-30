import React, { useState, useMemo } from 'react';
import { TemplateProps } from '@/pages/storefront/templates/types';
import { useTemplateUniversalSettings } from '@/hooks/useTemplateUniversalSettings';
import { coerceSilverImageBlocks } from '@/lib/silverBlocks';

export default function CafeTemplate(props: TemplateProps) {
  const universalSettings = useTemplateUniversalSettings();
  const { navigate, storeSlug } = props;
  const [activeCategory, setActiveCategory] = useState('all');
  const [cartCount, setCartCount] = useState(0);

  const products = props.products || [];
  const settings = props.settings || {};

  const silverHeaderBlocks = useMemo(
    () => coerceSilverImageBlocks((settings as any).silver_header_blocks),
    [settings]
  );
  const silverFooterBlocks = useMemo(
    () => coerceSilverImageBlocks((settings as any).silver_footer_blocks),
    [settings]
  );

  // Extract universal settings with defaults
  const {
    primary_color = '#e2c48e',
    secondary_color = '#f8f1e8',
    accent_color = '#d19c54',
    text_color = '#3b2b22',
    secondary_text_color = '#7c6958',
    font_family = 'Inter',
    border_radius = 18,
    enable_animations = true,
  } = useMemo(() => universalSettings as any || {}, [universalSettings]);

  const storeName = settings.store_name || 'Sweet Home Dz';
  const templateStoreCity = (settings as any).template_store_city || 'Algiers';
  const storeCity = settings.store_city || templateStoreCity;
  const templateSinceYear = (settings as any).template_since_year || (new Date().getFullYear() - 2);
  const sincYear = (settings as any).since_year || templateSinceYear;
  const heroVideoUrl = settings.hero_video_url || null;

  const heroHeading = (settings as any).template_hero_heading || 'All your makroud, kalb el louz and more — in one organized store.';
  const heroSubtitle = (settings as any).template_hero_subtitle || 'Built for 40+ different sweets, this layout keeps your trays, pieces and boxes cleanly organized so customers never feel lost.';
  const heroBadge = (settings as any).template_hero_badge || 'Algerian home sweets · Online';
  const heroPrimaryCtaText = (settings as any).template_hero_primary_cta_text || 'Shop all sweets';
  const heroSecondaryCtaText = (settings as any).template_hero_secondary_cta_text || 'View trays & bundles';
  const headerTagline = (settings as any).template_header_tagline || 'Homemade Algerian sweets · prepared fresh in {city}';
  const headerSinceLabel = (settings as any).template_header_since_label || 'Since {year}';
  const headerDeliveryLabel = (settings as any).template_header_delivery_label || 'Orders via website · Delivery & pickup';

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

  // Extract categories from products
  let categoryList: any[] = [];
  if (customCategories && customCategories.length > 0) {
    // Use custom categories from settings
    categoryList = ['all', ...customCategories.map((c: any) => c.name || c)];
  } else {
    // Fall back to product categories
    categoryList = ['all', ...new Set(products.map((p: any) => p.category || 'Menu'))];
  }

  const previewMode = Boolean((props as any).previewMode);
  const hideProducts = Boolean((props as any).hideProducts);
  const hasProducts = Array.isArray(products) && products.length > 0;

  const filtered = hideProducts ? [] : (activeCategory === 'all' ? products : products.filter((p: any) => (p.category || 'Menu') === activeCategory));

  // Get best sellers (first 4 products by default)
  const bestSellers = hideProducts ? [] : products.slice(0, 4);
  
  // Get bundle products (products with type = 'bundle' or marked as bundles)
  const bundles = hideProducts ? [] : products.filter((p: any) => p.product_type === 'bundle' || p.type === 'bundle').slice(0, 3);

  const handleQuickAdd = () => {
    setCartCount(c => c + 1);
  };

  // Public storefront: show empty state when there are no products.
  // Template Settings preview: keep rendering the full layout (footer included).
  if (!hasProducts && !previewMode) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: secondary_color }}>
        <div className="text-center max-w-md mx-auto p-4 md:p-6">
          <div className="text-6xl mb-4">☕</div>
          <h1 className="text-xl md:text-2xl font-serif font-bold mb-4" style={{ color: text_color }}>No Products Yet</h1>
          <p className="mb-6" style={{ color: secondary_text_color }}>Add your bakery items to your store to see them displayed here.</p>
          <p className="text-sm" style={{ color: secondary_text_color }}>Products will appear automatically once you add them to your store.</p>
        </div>
      </div>
    );
  }

  // Product Card Component
  const ProductCard = ({ product, isBundleType }: any) => (
    <div 
      className="rounded-lg overflow-hidden group cursor-pointer transition shadow-md hover:shadow-lg hover:-translate-y-0.5"
      style={{ backgroundColor: '#ffffff', borderRadius: `${border_radius}px` }}
      onClick={() => navigate(product.slug && product.slug.length > 0 ? `/store/${storeSlug}/${product.slug}` : `/product/${product.id}`)}
    >
      <div className="relative aspect-[4/3] overflow-hidden" style={{ backgroundColor: `${secondary_text_color}20` }}>
        <img 
          src={product.images?.[0]} 
          alt={product.name || product.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-2 md:p-3">
        <h4 className="text-xs md:text-sm font-semibold line-clamp-2" style={{ color: text_color }}>
          {product.name || product.title}
        </h4>
        <p className="text-[10px] md:text-xs mt-0.5 md:mt-1" style={{ color: secondary_text_color }}>
          {product.price} DZD {product.unit ? `/ ${product.unit}` : ''}
        </p>
        
        {product.description && (
          <p className="text-[10px] md:text-[11px] mt-0.5 md:mt-1 line-clamp-1 hidden sm:block" style={{ color: secondary_text_color }}>
            {product.description}
          </p>
        )}

        <div className="mt-2 md:mt-3">
          <button
            className="w-full text-[10px] md:text-[11px] py-1 md:py-1.5 rounded-full font-semibold transition"
            style={{ backgroundColor: text_color, color: secondary_color }}
            onClick={(e) => {
              e.stopPropagation();
              handleQuickAdd();
              const slug = product.slug || product.id;
              navigate(storeSlug ? `/store/${storeSlug}/${slug}` : `/product/${product.id}`);
            }}
          >
            {isBundleType ? 'Add tray' : 'Quick add'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ background: `radial-gradient(circle at top, ${secondary_color} 0, #f8f1e8 40%, #f5ede4 100%)`, color: text_color }} className="min-h-screen">
      {silverHeaderBlocks.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 pt-6">
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(${silverHeaderBlocks.length}, minmax(0, 1fr))` }}
          >
            {silverHeaderBlocks
              .filter((b) => b.url && String(b.url).trim().length > 0)
              .map((b) => (
                <img
                  key={b.id}
                  src={b.url}
                  alt={b.alt || 'Header image'}
                  className="w-full h-32 object-cover"
                  style={{ borderRadius: border_radius }}
                />
              ))}
          </div>
        </div>
      )}
      {/* Sticky Cart Icon */}
      <button
        className="fixed bottom-4 right-4 z-30 flex items-center gap-2 px-4 py-2 rounded-full shadow-lg text-xs transition hover:shadow-xl"
        style={{ backgroundColor: text_color, color: secondary_color }}
      >
        <span>Cart</span>
        <span 
          className="w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-semibold"
          style={{ backgroundColor: primary_color, color: text_color }}
        >
          {cartCount}
        </span>
      </button>

      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-8 max-w-6xl mx-auto">
        <div>
          <h1 data-edit-path="__settings.store_name" className="font-serif text-3xl md:text-4xl font-bold tracking-tight" style={{ color: text_color }}>
            {storeName}
          </h1>
          <p data-edit-path="__settings.template_header_tagline" className="text-xs mt-1 max-w-xs" style={{ color: secondary_text_color }}>
            {String(headerTagline).replace('{city}', String(storeCity))}
          </p>
        </div>
        <div className="hidden sm:flex flex-col items-end text-[11px]" style={{ color: secondary_text_color }}>
          <span>{String(headerSinceLabel).replace('{year}', String(sincYear))}</span>
          <span>{headerDeliveryLabel}</span>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="px-6 pb-12 md:pb-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-7 items-center">
          {/* Hero Text */}
          <div>
            <div 
              data-edit-path="__settings.template_hero_kicker"
              className="inline-block rounded-full px-3 py-1.5 text-[11px] text-transform uppercase tracking-widest font-semibold mb-4"
              style={{ backgroundColor: `${primary_color}30`, color: secondary_text_color, borderRadius: '999px', border: `1px solid ${primary_color}50` }}
            >
              {heroBadge}
            </div>
            
            <h2 data-edit-path="__settings.template_hero_heading" className="font-serif text-4xl md:text-5xl font-bold mt-4 leading-tight" style={{ color: text_color }}>
              {heroHeading}
            </h2>
            
            <p data-edit-path="__settings.template_hero_subtitle" className="text-sm mt-3 max-w-md" style={{ color: secondary_text_color }}>
              {heroSubtitle}
            </p>
            
            <div className="flex gap-2 mt-5 flex-wrap">
              <button 
                className="text-xs text-transform uppercase tracking-widest font-semibold py-2 px-4 rounded-full transition hover:-translate-y-0.5"
                style={{ background: `linear-gradient(135deg, ${primary_color}, ${accent_color})`, color: text_color, borderRadius: '999px' }}
                onClick={() => document.getElementById('all-products')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {heroPrimaryCtaText}
              </button>
              
              <button 
                className="text-xs text-transform uppercase tracking-widest font-semibold py-2 px-4 rounded-full transition border"
                style={{ borderColor: secondary_text_color, color: secondary_text_color, borderRadius: '999px', background: `rgba(255, 255, 255, 0.7)` }}
              >
                {heroSecondaryCtaText}
              </button>
            </div>
          </div>

          {/* Hero Image/Video or Product Collage */}
          {heroVideoUrl ? (
            <div className="rounded-2xl overflow-hidden shadow-lg" data-edit-path="__settings.hero_video_url">
              <video 
                autoPlay
                muted
                loop
                playsInline
                className="w-full aspect-[16/10] md:aspect-auto md:h-[360px] object-cover"
              >
                <source src={heroVideoUrl} type="video/mp4" />
              </video>
            </div>
          ) : settings.banner_url ? (
            <div className="rounded-2xl overflow-hidden shadow-lg" data-edit-path="__settings.banner_url">
              <img 
                src={settings.banner_url} 
                alt="Hero" 
                className="w-full aspect-[16/10] md:aspect-auto md:h-[360px] object-cover"
              />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              {products.slice(0, 6).map((p, idx) => (
                <div
                  key={idx}
                  className="rounded-xl md:rounded-2xl overflow-hidden shadow-md"
                  style={{ 
                    backgroundColor: `${secondary_text_color}20`,
                    transform: (idx === 1 || idx === 4) ? 'translateY(0.5rem)' : 'none'
                  }}
                >
                  <img
                    src={p.images?.[0]}
                    alt={p.name || p.title}
                    className="w-full aspect-square md:aspect-auto md:h-[120px] object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CATEGORY CHIPS */}
      <section className="px-6 pb-10 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: secondary_text_color }}>Browse by category</span>
          <span className="text-[11px]" style={{ color: secondary_text_color }}>Click to filter the grid below</span>
        </div>
        
        <div className="flex gap-2 md:gap-3 flex-wrap">
          {categoryList.map((cat) => {
            // Find custom category color if available
            const customCat = customCategories?.find((c: any) => (c.name || c) === cat);
            const catColor = customCat?.color || primary_color;
            
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="text-xs font-semibold uppercase tracking-widest py-1.5 px-4 rounded-full transition border"
                style={{
                  backgroundColor: activeCategory === cat ? catColor : 'rgba(255, 255, 255, 0.85)',
                  color: activeCategory === cat ? text_color : secondary_text_color,
                  borderColor: activeCategory === cat ? catColor : '#e6d9c9',
                  borderRadius: '999px',
                }}
              >
                {cat === 'all' ? 'All sweets' : cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* BEST SELLERS */}
      {bestSellers.length > 0 && (
        <section className="px-6 pb-12 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: secondary_text_color }}>Top choices</p>
              <h3 className="font-serif text-xl font-bold" style={{ color: text_color }}>Best sellers</h3>
            </div>
            <span className="text-xs hidden md:inline" style={{ color: secondary_text_color }}>
              The sweets people reorder again and again
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bestSellers.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* BUNDLES / TRAYS */}
      {bundles.length > 0 && (
        <section className="px-6 pb-12 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: secondary_text_color }}>High value</p>
              <h3 className="font-serif text-xl font-bold" style={{ color: text_color }}>Trays & bundles</h3>
            </div>
            <span className="text-xs hidden md:inline" style={{ color: secondary_text_color }}>
              Perfect for Eid, weddings, visits and gifts
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bundles.map((bundle, idx) => (
              <div key={bundle.id} className="relative">
                {idx === 0 && (
                  <span 
                    className="absolute top-3 left-3 text-[10px] uppercase tracking-widest font-semibold px-2 py-1 rounded-full z-10"
                    style={{ backgroundColor: accent_color, color: text_color, borderRadius: '999px' }}
                  >
                    Most popular
                  </span>
                )}
                {idx === 1 && (
                  <span 
                    className="absolute top-3 left-3 text-[10px] uppercase tracking-widest font-semibold px-2 py-1 rounded-full z-10"
                    style={{ backgroundColor: '#c4863a', color: '#f8f1e8', borderRadius: '999px' }}
                  >
                    Eid special
                  </span>
                )}
                <ProductCard product={bundle} isBundleType={true} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FULL PRODUCT GRID */}
      <section className="px-6 pb-14 max-w-6xl mx-auto" id="all-products">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: secondary_text_color }}>
              {activeCategory === 'all' ? 'All items' : `Category: ${activeCategory}`}
            </p>
            <h3 className="font-serif text-xl font-bold" style={{ color: text_color }}>
              {activeCategory === 'all' ? 'All sweets' : activeCategory}
            </h3>
          </div>
          <span className="text-xs" style={{ color: secondary_text_color }}>
            {filtered.length} items
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filtered.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t px-6 py-6 text-[11px]" style={{ borderColor: `${secondary_text_color}30` }}>
        <div className="max-w-6xl mx-auto text-center flex flex-col md:flex-row gap-2 md:items-center md:justify-between" style={{ color: secondary_text_color }}>
          <div>
            <span>© {new Date().getFullYear()} {storeName}</span>
            <span className="hidden md:inline"> · </span>
            <span className="block md:inline">{storeCity} · Homemade Algerian sweets</span>
          </div>
          <div className="flex gap-3 justify-center md:justify-end">
            <span>Instagram</span>
            <span>Facebook</span>
            <span>WhatsApp</span>
          </div>
        </div>
      </footer>

      {silverFooterBlocks.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 pb-6">
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
                  className="w-full h-32 object-cover"
                  style={{ borderRadius: border_radius }}
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
    title: 'Cafe: Header + Hero Copy',
    description: 'Edit visible header/hero text without digging into code.',
    fields: [
      { key: 'template_store_city', label: 'City (template default)', type: 'text', placeholder: 'Algiers' },
      { key: 'template_since_year', label: 'Since Year', type: 'number', placeholder: '2023', min: 1900, max: 2100 },

      { key: 'template_header_tagline', label: 'Header Tagline', type: 'text', placeholder: 'Homemade Algerian sweets · prepared fresh in {city}' },
      { key: 'template_header_since_label', label: 'Header Since Label', type: 'text', placeholder: 'Since {year}' },
      { key: 'template_header_delivery_label', label: 'Header Delivery Label', type: 'text', placeholder: 'Orders via website · Delivery & pickup' },

      { key: 'template_hero_badge', label: 'Hero Badge', type: 'text', placeholder: 'Algerian home sweets · Online' },
      { key: 'template_hero_heading', label: 'Hero Heading', type: 'text' },
      { key: 'template_hero_subtitle', label: 'Hero Subtitle', type: 'textarea' },
      { key: 'template_hero_primary_cta_text', label: 'Hero Primary CTA', type: 'text', placeholder: 'Shop all sweets' },
      { key: 'template_hero_secondary_cta_text', label: 'Hero Secondary CTA', type: 'text', placeholder: 'View trays & bundles' },
    ],
  },
] as const;
