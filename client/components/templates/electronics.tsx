import React, { useState, useMemo } from 'react';
import { TemplateProps } from '@/pages/storefront/templates/types';
import { useTemplateUniversalSettings } from '@/hooks/useTemplateUniversalSettings';
import { useUniversalTemplateData } from '@/hooks/useUniversalTemplateData';
import { coerceSilverImageBlocks } from '@/lib/silverBlocks';

export default function ElectronicsTemplate(props: TemplateProps) {
  const universalSettings = useTemplateUniversalSettings();
  const { navigate, storeSlug } = props;
  const [activeCategory, setActiveCategory] = useState('all');

  // Helper functions to save product data and navigate
  const handleProductClick = (product: any) => {
    localStorage.setItem(`product_${product.id}`, JSON.stringify(product));
    const slug = product.slug || product.id;
    navigate(storeSlug ? `/store/${storeSlug}/${slug}` : `/product/${product.id}`);
  };

  const handleBuyClick = (product: any, e?: any) => {
    if (e) e.stopPropagation();
    localStorage.setItem(`product_${product.id}`, JSON.stringify(product));
    const slug = product.slug || product.id;
    navigate(storeSlug ? `/store/${storeSlug}/${slug}` : `/product/${product.id}`);
  };

  const products = props.products || [];
  const settings = props.settings || {};
  
  // ═══════════════════════════════════════════════════════════════════════════
  // UNIVERSAL TEMPLATE DATA - All editable fields come from here
  // Adding a new field to useUniversalTemplateData → ALL templates get it
  // ═══════════════════════════════════════════════════════════════════════════
  const universalData = useUniversalTemplateData(settings);

  const silverHeaderBlocks = useMemo(
    () => coerceSilverImageBlocks((settings as any).silver_header_blocks),
    [settings]
  );
  const silverFooterBlocks = useMemo(
    () => coerceSilverImageBlocks((settings as any).silver_footer_blocks),
    [settings]
  );

  const previewMode = Boolean((props as any).previewMode);
  const hideProducts = Boolean((props as any).hideProducts);
  const hasProducts = Array.isArray(products) && products.length > 0;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // UNIVERSAL SETTINGS - These work the SAME across ALL templates
  // The visual STYLE is different per template, but the DATA comes from here
  // ═══════════════════════════════════════════════════════════════════════════
  const {
    // Colors - same for all templates
    primaryColor: primary_color = '#22d3ee',
    secondaryColor: secondary_color = '#0f172a',
    accentColor: accent_color = '#22d3ee',
    textColor: text_color = '#e2e8f0',
    secondaryTextColor: secondary_text_color = '#94a3b8',
    
    // Typography - same for all templates
    fontFamily: font_family = 'Inter',
    
    // Layout - same for all templates
    borderRadius: border_radius = 8,
    
    // Effects - same for all templates  
    enableDarkMode: enable_dark_mode = true,
    enableShadows: show_product_shadows = true,
    enableAnimations: enable_animations = true,
    
    // Hero - same fields, different visual placement per template
    heroTitle,
    heroSubtitle,
    heroCtaText,
    heroSecondaryCtaText,
    
    // Store info - same for all templates
    storeName,
    storeLogo: logoUrl = '',
    
    // Buttons - same for all templates
    buyButtonText,
  } = universalData;
  
  // Map to legacy variable names for backward compatibility
  const accentColor = accent_color;
  const storeCity = (settings as any).store_city || 'Algiers';
  const heroBadge = (settings as any).template_hero_badge || '2025 line-up';
  const storeInitials = (settings as any).store_initials || String(storeName).slice(0, 2).toUpperCase();
  
  // Heading size multiplier from legacy settings
  const heading_size_multiplier = (settings as any).heading_size_multiplier || 'Large';

  const headerTagline = (settings as any).template_header_tagline || 'Phones · Audio · Gaming · Accessories';
  const headerStatus = (settings as any).template_header_status || '24/7 online';

  const emptyTitle = (settings as any).template_empty_title || 'No Products Yet';
  const emptySubtitle = (settings as any).template_empty_subtitle || 'Add some electronics to your store to see them displayed here.';
  const emptyHint = (settings as any).template_empty_hint || 'Products will appear automatically once you add them to your store.';

  // ═══════════════════════════════════════════════════════════════════════════
  // HERO SETTINGS - Use universal data, fallback to template-specific
  // ═══════════════════════════════════════════════════════════════════════════
  const heroKickerLabel = (settings as any).template_hero_kicker_label || 'New';
  const heroHeadingPrefix = (settings as any).template_hero_heading_prefix || 'Flagship';
  const heroHeadingAccent = (settings as any).template_hero_heading_accent || 'performance';
  const heroHeadingSuffix = (settings as any).template_hero_heading_suffix || 'for your entire tech store.';
  // Use universal heroSubtitle (can be edited in any template editor!)
  const heroSubtitleText = heroSubtitle || (settings as any).template_hero_subtitle || 'Showcase phones, headphones, gaming gear and accessories in a layout that feels engineered.';
  // Use universal CTA text (can be edited in any template editor!)
  const heroPrimaryCta = heroCtaText || (settings as any).template_hero_primary_cta || 'Shop flagship';
  const heroSecondaryCta = heroSecondaryCtaText || (settings as any).template_hero_secondary_cta || 'View full catalog';

  const splitKicker = (settings as any).template_split_kicker || 'Catalog engine';
  const splitHeadingPrefix = (settings as any).template_split_heading_prefix || 'Split hero built for';
  const splitHeadingAccent = (settings as any).template_split_heading_accent || 'spec-driven';
  const splitHeadingSuffix = (settings as any).template_split_heading_suffix || 'decisions.';
  const splitSubtitle = (settings as any).template_split_subtitle || 'Show customers exactly why this product is the right choice — with specs, use cases and pricing visible up front.';
  const splitBullet1 = (settings as any).template_split_bullet_1 || 'Tech-first copy — no unnecessary storytelling.';
  const splitBullet2 = (settings as any).template_split_bullet_2 || 'Clear hierarchy for specs, not emotions.';
  const splitBullet3 = (settings as any).template_split_bullet_3 || 'Layout tuned for comparison thinking.';
  const splitProductCta = (settings as any).template_split_product_cta || 'View full specs';

  const featuredKicker = (settings as any).template_featured_kicker || 'Featured products';
  const featuredHint = (settings as any).template_featured_hint || 'Horizontal scroll';

  const categoriesTitle = (settings as any).template_categories_title || 'Categories';
  const categoriesHint = (settings as any).template_categories_hint || 'Click to filter products';
  const categoriesAllLabel = (settings as any).template_categories_all_label || 'All products';

  const bestSellersKicker = (settings as any).template_bestsellers_kicker || 'Performance ranking';
  const bestSellersTitle = (settings as any).template_bestsellers_title || 'Best sellers';
  const bestSellersHint = (settings as any).template_bestsellers_hint || 'Top products';
  const topTagLabel = (settings as any).template_top_tag_label || 'TOP';
  const viewButtonLabel = (settings as any).template_view_button_label || 'View';
  const buyButtonLabel = (settings as any).template_buy_button_label || 'Buy';
  // Use universal buyButtonText (can be edited from any template editor!)
  const buyNowLabel = buyButtonText || (settings as any).template_buy_now_label || 'Buy Now';

  const allItemsKicker = (settings as any).template_all_items_kicker || 'All items';
  const categoryPrefix = (settings as any).template_category_prefix || 'Category:';
  const allProductsTitle = (settings as any).template_all_products_title || 'All products';

  const footerSuffix = (settings as any).template_footer_suffix || 'Online electronics & gaming';
  const footerLinks = (settings as any).template_footer_links
    ? String((settings as any).template_footer_links)
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)
    : ['Support', 'Warranty', 'Contact'];
  
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

  // Public storefront: show empty state when there are no products.
  // Template Settings preview: keep rendering the full layout (footer included).
  if (!hasProducts && !previewMode) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: enable_dark_mode ? 'radial-gradient(circle at top, #0f172a 0, #020617 45%, #000 100%)' : secondary_color }}>
        <div className="text-center max-w-md mx-auto p-4 md:p-6">
          <div className="text-6xl mb-4">🔌</div>
          <h1 className="text-xl md:text-2xl font-bold mb-4" style={{ color: text_color }}>{emptyTitle}</h1>
          <p className="mb-6" style={{ color: secondary_text_color }}>{emptySubtitle}</p>
          <p className="text-sm" style={{ color: secondary_text_color }}>{emptyHint}</p>
        </div>
      </div>
    );
  }

  // Extract categories from products
  const safeProducts = hideProducts ? [] : products;
  const categories = ['all', ...new Set(safeProducts.map((p: any) => p.category))];
  const filteredProducts = activeCategory === 'all' ? safeProducts : safeProducts.filter((p: any) => p.category === activeCategory);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-4 md:py-6 relative" style={{ background: enable_dark_mode ? 'radial-gradient(circle at top, #0f172a 0, #020617 45%, #000 100%)' : secondary_color }}>
      {silverHeaderBlocks.length > 0 && (
        <div
          className="grid gap-3 mb-4"
          style={{ gridTemplateColumns: `repeat(${silverHeaderBlocks.length}, minmax(0, 1fr))` }}
        >
          {silverHeaderBlocks
            .filter((b) => b.url && String(b.url).trim().length > 0)
            .map((b) => (
              <img
                key={b.id}
                src={b.url}
                alt={b.alt || 'Header image'}
                className="w-full h-32 object-cover rounded-lg"
              />
            ))}
        </div>
      )}
      <style>{dynamicStyles}</style>
      <header className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-slate-950 text-xs font-bold tracking-widest overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt={`${storeName} logo`} className="w-full h-full object-contain" />
            ) : (
              storeInitials
            )}
          </div>
          <div>
            <h1 data-edit-path="__settings.store_name" className="text-lg sm:text-xl font-semibold tracking-tight text-gray-200">{storeName}</h1>
            <p data-edit-path="__settings.template_header_tagline" className="text-[11px] text-slate-400">{headerTagline}</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400">
          <span>{storeCity}</span>
          <span>·</span>
          <span>{headerStatus}</span>
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
                {heroKickerLabel} · {heroBadge}
              </span>
              <h2 data-edit-path="__settings.template_hero_heading" className="mt-4 text-xl md:text-2xl sm:text-2xl md:text-xl md:text-2xl font-bold leading-tight text-gray-100">
                {heroHeadingPrefix} <span style={{ color: accent_color }}>{heroHeadingAccent}</span> {heroHeadingSuffix}
              </h2>
              <p data-edit-path="__settings.template_hero_subtitle" className="mt-3 text-sm text-slate-200 max-w-md">
                {heroSubtitleText}
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
                  {heroPrimaryCta}
                </button>
                <button className="px-6 py-2.5 rounded-full border border-slate-600 text-slate-200 text-xs font-semibold uppercase tracking-wider hover:bg-slate-800 transition">
                  {heroSecondaryCta}
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
            <span className="text-xs uppercase tracking-widest text-slate-400">{splitKicker}</span>
            <h3 className="mt-2 text-xl sm:text-2xl font-semibold text-gray-100">
              {splitHeadingPrefix} <span style={{ color: accentColor }}>{splitHeadingAccent}</span> {splitHeadingSuffix}
            </h3>
            <p className="mt-2 text-sm text-slate-300 max-w-md">
              {splitSubtitle}
            </p>
            <ul className="mt-3 text-xs text-slate-400 space-y-1.5">
              <li>• {splitBullet1}</li>
              <li>• {splitBullet2}</li>
              <li>• {splitBullet3}</li>
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
                  {splitProductCta}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Featured Products Carousel */}
        {products.length > 2 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] md:text-xs uppercase tracking-widest text-slate-400">{featuredKicker}</span>
              <span className="text-[10px] md:text-[11px] text-slate-400 hidden sm:inline">{featuredHint}</span>
            </div>
            <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2">
              {products.slice(2, 5).map(p => (
                <div 
                  key={p.id} 
                  onClick={() => handleProductClick(p)}
                  className="p-2 md:p-3 rounded-xl min-w-[160px] md:min-w-[220px] flex-shrink-0 bg-slate-900/80 border border-slate-700 group cursor-pointer hover:border-cyan-400 transition flex flex-col"
                >
                  <div className="overflow-hidden rounded-md mb-2">
                    <img src={p.images[0]} alt={p.title} className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition" />
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between text-[10px] md:text-xs mb-1 gap-0.5">
                    <span className="line-clamp-1 text-slate-200">{p.title}</span>
                    <span style={{ color: accentColor }} className="whitespace-nowrap">{p.price} DZD</span>
                  </div>
                  <div className="text-[9px] md:text-[11px] text-slate-400 line-clamp-1 mb-2">{String((p as any).category || 'General')}</div>
                  <button 
                    style={{ backgroundColor: accentColor, borderColor: accentColor, color: '#0f172a' }} 
                    className="w-full px-2 py-1.5 md:py-2 rounded-full bg-slate-900 text-[9px] md:text-[11px] border font-semibold transition hover:opacity-90" 
                    onClick={(e) => handleBuyClick(p, e)}
                  >
                    {buyNowLabel}
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
          <span className="text-xs uppercase tracking-widest text-slate-400">{categoriesTitle}</span>
          <span className="text-[11px] text-slate-400">{categoriesHint}</span>
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
              {cat === 'all' ? categoriesAllLabel : cat}
            </button>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      {products.length > 0 && (
        <section className="mb-6 md:mb-10">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div>
              <span className="text-[10px] md:text-xs uppercase tracking-widest text-slate-400">{bestSellersKicker}</span>
              <h3 className="mt-0.5 md:mt-1 text-base md:text-xl font-semibold text-gray-100">{bestSellersTitle}</h3>
            </div>
            <span className="text-[10px] md:text-[11px] text-slate-400 hidden sm:inline">{bestSellersHint}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-4">
            {products.slice(0, 4).map((p, idx) => (
              <div key={p.id} className="rounded-xl p-2 md:p-3 bg-slate-900/80 border border-slate-700 group hover:border-cyan-400 transition relative">
                <div className="absolute top-1.5 left-1.5 md:top-2 md:left-2 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 text-[8px] md:text-[10px] uppercase tracking-wider font-semibold">
                  #{idx + 1} <span style={{ color: accentColor }}>{topTagLabel}</span>
                </div>
                <div className="overflow-hidden rounded-md mb-2 mt-5 md:mt-6">
                  <img src={p.images[0]} alt={p.title} className="w-full aspect-square md:aspect-[4/3] object-cover group-hover:scale-105 transition" />
                </div>
                <h4 className="text-[11px] md:text-sm font-semibold line-clamp-2 text-gray-200">{p.title}</h4>
                <p className="text-[10px] md:text-xs text-slate-400 mt-0.5 md:mt-1">{p.price} DZD</p>
                <p className="text-[9px] md:text-[11px] text-slate-500 mt-0.5 md:mt-1 hidden sm:block">{String((p as any).category || 'General')}</p>
                <div className="flex gap-1 mt-1.5 md:mt-2">
                  <button className="flex-1 px-1.5 md:px-2 py-1 rounded-full bg-slate-900 text-[8px] md:text-[10px] border border-slate-600 text-slate-300 hover:border-cyan-400 transition whitespace-nowrap" onClick={() => handleProductClick(p)}>
                    {viewButtonLabel}
                  </button>
                  <button style={{ backgroundColor: accentColor, borderColor: accentColor, color: '#0f172a' }} className="flex-1 px-1.5 md:px-2 py-1 rounded-full text-[8px] md:text-[10px] border transition whitespace-nowrap" onClick={(e) => handleBuyClick(p, e)}>
                    {buyButtonLabel}
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
              {activeCategory === 'all' ? allItemsKicker : `${categoryPrefix} ${activeCategory}`}
            </span>
            <h3 className="mt-1 text-xl font-semibold text-gray-100">{activeCategory === 'all' ? allProductsTitle : activeCategory}</h3>
          </div>
          <span className="text-[11px] text-slate-400">{filteredProducts.length} items</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
          {filteredProducts.map((p, idx) => (
            <div
              key={p.id}
              onClick={() => handleProductClick(p)}
              className={`rounded-xl p-2 md:p-3 bg-slate-900/80 border border-slate-700 group hover:border-cyan-400 transition flex flex-col cursor-pointer ${
                idx % 7 === 0 ? 'lg:col-span-2' : ''
              }`}
            >
              <div className="overflow-hidden rounded-md mb-2">
                <img
                  src={p.images[0]}
                  alt={p.title}
                  className={`w-full object-cover group-hover:scale-105 transition ${
                    idx % 7 === 0 ? 'aspect-[4/3] md:h-[170px] md:aspect-auto' : 'aspect-square md:h-[130px] md:aspect-auto'
                  }`}
                />
              </div>
              <h4 className="text-xs md:text-sm font-semibold line-clamp-2 text-gray-200">{p.title}</h4>
              <p className="text-[10px] md:text-xs text-slate-400 mt-0.5 md:mt-1">{p.price} DZD</p>
              <p className="text-[9px] md:text-[11px] text-slate-500 mt-0.5 md:mt-1 line-clamp-1">{String((p as any).category || 'General')}</p>
              <div className="flex gap-1 mt-1.5 md:mt-2">
                <button style={{ backgroundColor: accentColor, borderColor: accentColor, color: '#0f172a' }} className="w-full px-2 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-semibold border transition hover:opacity-90 whitespace-nowrap" onClick={(e) => handleBuyClick(p, e)}>
                  {buyNowLabel}
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
          <span className="block sm:inline">{storeCity} · {footerSuffix}</span>
        </div>
        <div className="flex gap-3">
          {footerLinks.slice(0, 3).map((label: string) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </footer>

      {silverFooterBlocks.length > 0 && (
        <div
          className="grid gap-3 mt-4"
          style={{ gridTemplateColumns: `repeat(${silverFooterBlocks.length}, minmax(0, 1fr))` }}
        >
          {silverFooterBlocks
            .filter((b) => b.url && String(b.url).trim().length > 0)
            .map((b) => (
              <img
                key={b.id}
                src={b.url}
                alt={b.alt || 'Footer image'}
                className="w-full h-32 object-cover rounded-lg"
              />
            ))}
        </div>
      )}
    </div>
  );
}

export const TEMPLATE_EDITOR_SECTIONS = [
  {
    title: 'Electronics: Header',
    fields: [
      { key: 'store_initials', label: 'Logo Initials', type: 'text', defaultValue: 'EV' },
      { key: 'template_header_tagline', label: 'Header Tagline', type: 'text', defaultValue: 'Phones · Audio · Gaming · Accessories' },
      { key: 'template_header_status', label: 'Header Status', type: 'text', defaultValue: '24/7 online' },
    ],
  },
  {
    title: 'Electronics: Empty State',
    fields: [
      { key: 'template_empty_title', label: 'Empty Title', type: 'text', defaultValue: 'No Products Yet' },
      { key: 'template_empty_subtitle', label: 'Empty Subtitle', type: 'text', defaultValue: 'Add some electronics to your store to see them displayed here.' },
      { key: 'template_empty_hint', label: 'Empty Hint', type: 'text', defaultValue: 'Products will appear automatically once you add them to your store.' },
    ],
  },
  {
    title: 'Electronics: Hero',
    fields: [
      { key: 'template_hero_kicker_label', label: 'Hero Kicker Label', type: 'text', defaultValue: 'New' },
      { key: 'template_hero_badge', label: 'Hero Badge', type: 'text', defaultValue: '2025 line-up' },
      { key: 'template_hero_heading_prefix', label: 'Hero Heading (Prefix)', type: 'text', defaultValue: 'Flagship' },
      { key: 'template_hero_heading_accent', label: 'Hero Heading (Accent)', type: 'text', defaultValue: 'performance' },
      { key: 'template_hero_heading_suffix', label: 'Hero Heading (Suffix)', type: 'text', defaultValue: 'for your entire tech store.' },
      { key: 'template_hero_subtitle', label: 'Hero Subtitle', type: 'text', defaultValue: 'Showcase phones, headphones, gaming gear and accessories in a layout that feels engineered.' },
      { key: 'template_hero_primary_cta', label: 'Hero Primary CTA', type: 'text', defaultValue: 'Shop flagship' },
      { key: 'template_hero_secondary_cta', label: 'Hero Secondary CTA', type: 'text', defaultValue: 'View full catalog' },
    ],
  },
  {
    title: 'Electronics: Split Hero',
    fields: [
      { key: 'template_split_kicker', label: 'Split Kicker', type: 'text', defaultValue: 'Catalog engine' },
      { key: 'template_split_heading_prefix', label: 'Split Heading (Prefix)', type: 'text', defaultValue: 'Split hero built for' },
      { key: 'template_split_heading_accent', label: 'Split Heading (Accent)', type: 'text', defaultValue: 'spec-driven' },
      { key: 'template_split_heading_suffix', label: 'Split Heading (Suffix)', type: 'text', defaultValue: 'decisions.' },
      { key: 'template_split_subtitle', label: 'Split Subtitle', type: 'text', defaultValue: 'Show customers exactly why this product is the right choice — with specs, use cases and pricing visible up front.' },
      { key: 'template_split_bullet_1', label: 'Split Bullet 1', type: 'text', defaultValue: 'Tech-first copy — no unnecessary storytelling.' },
      { key: 'template_split_bullet_2', label: 'Split Bullet 2', type: 'text', defaultValue: 'Clear hierarchy for specs, not emotions.' },
      { key: 'template_split_bullet_3', label: 'Split Bullet 3', type: 'text', defaultValue: 'Layout tuned for comparison thinking.' },
      { key: 'template_split_product_cta', label: 'Split Product CTA', type: 'text', defaultValue: 'View full specs' },
    ],
  },
  {
    title: 'Electronics: Labels',
    fields: [
      { key: 'template_featured_kicker', label: 'Featured Kicker', type: 'text', defaultValue: 'Featured products' },
      { key: 'template_featured_hint', label: 'Featured Hint', type: 'text', defaultValue: 'Horizontal scroll' },
      { key: 'template_categories_title', label: 'Categories Title', type: 'text', defaultValue: 'Categories' },
      { key: 'template_categories_hint', label: 'Categories Hint', type: 'text', defaultValue: 'Click to filter products' },
      { key: 'template_categories_all_label', label: 'All Category Label', type: 'text', defaultValue: 'All products' },
      { key: 'template_bestsellers_kicker', label: 'Best Sellers Kicker', type: 'text', defaultValue: 'Performance ranking' },
      { key: 'template_bestsellers_title', label: 'Best Sellers Title', type: 'text', defaultValue: 'Best sellers' },
      { key: 'template_bestsellers_hint', label: 'Best Sellers Hint', type: 'text', defaultValue: 'Top products' },
      { key: 'template_top_tag_label', label: 'Top Tag Label', type: 'text', defaultValue: 'TOP' },
      { key: 'template_view_button_label', label: 'View Button Label', type: 'text', defaultValue: 'View' },
      { key: 'template_buy_button_label', label: 'Buy Button Label', type: 'text', defaultValue: 'Buy' },
      { key: 'template_buy_now_label', label: 'Buy Now Label', type: 'text', defaultValue: 'Buy Now' },
      { key: 'template_all_items_kicker', label: 'All Items Kicker', type: 'text', defaultValue: 'All items' },
      { key: 'template_category_prefix', label: 'Category Prefix', type: 'text', defaultValue: 'Category:' },
      { key: 'template_all_products_title', label: 'All Products Title', type: 'text', defaultValue: 'All products' },
      { key: 'template_footer_suffix', label: 'Footer Suffix', type: 'text', defaultValue: 'Online electronics & gaming' },
      { key: 'template_footer_links', label: 'Footer Links (comma-separated)', type: 'text', defaultValue: 'Support, Warranty, Contact' },
    ],
  },
] as const;
