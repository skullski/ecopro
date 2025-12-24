import React, { useState, useMemo } from 'react';
import { TemplateProps } from '@/pages/storefront/templates/types';
import { useTemplateUniversalSettings } from '@/hooks/useTemplateUniversalSettings';

export default function BeautyTemplate(props: TemplateProps) {
  const universalSettings = useTemplateUniversalSettings();
  const { navigate, storeSlug } = props;
  const [bagCount, setBagCount] = useState(0);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [routine, setRoutine] = useState('All');
  const [concern, setConcern] = useState('All');

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
  const [typeFilter, setTypeFilter] = useState('All');
  const [maxPrice, setMaxPrice] = useState(999999);
  const [selectedShadeId, setSelectedShadeId] = useState('s1');
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);

  const { products = [], settings = {}, formatPrice = (p: number) => `${p}` } = props;

  // Extract universal settings with defaults
  const {
    primary_color = '#111827',
    secondary_color = '#fff6fb',
    accent_color = '#111827',
    text_color = '#111827',
    secondary_text_color = '#6b7280',
    font_family = 'Inter',
    heading_size_multiplier = 'Large',
    body_font_size = 15,
    section_padding = 24,
    border_radius = 8,
    enable_dark_mode = false,
    show_product_shadows = true,
    enable_animations = true,
  } = useMemo(() => universalSettings as any || {}, [universalSettings]);

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

  const storeName = settings.store_name || 'BloomSkin';
  const storeInitials = (settings as any).store_initials || String(storeName).substring(0, 2).toUpperCase();
  const logoUrl = (settings as any).store_logo || (settings as any).logo_url || '';
  const headerTagline = (settings as any).template_header_tagline || 'Skin · Color · Rituals · K‑beauty · Clinical';
  const bagLabel = (settings as any).template_bag_label || 'Bag';
  const wishlistLabel = (settings as any).template_wishlist_label || 'Wishlist';
  const searchPlaceholder = (settings as any).template_search_placeholder || 'Search serums, tints, cleansers...';

  const heroBadge = (settings as any).template_hero_badge || 'Beauty store · Full options';
  const heroHeading = settings.template_hero_heading || 'A clean, modern beauty store built around routines, concerns and shades';
  const heroSubtitle = settings.template_hero_subtitle || 'Filter by skin concern, routine time, product type and price. Wishlist your favorites and explore base shades.';
  const heroPrimaryCta = (settings as any).template_hero_primary_cta || 'Explore products';
  const heroSecondaryCta = (settings as any).template_hero_secondary_cta || 'Browse routines';

  const shadeFinderLabel = (settings as any).template_shade_finder_label || 'Shade finder';
  const shadeFinderProductName = (settings as any).template_shade_finder_product_name || 'Skin Veil Tint';
  const shadeFinderInstruction = (settings as any).template_shade_finder_instruction || 'Tap a shade to preview the tint and details.';
  const shadeFinderDetailsLine = (settings as any).template_shade_finder_details_line ||
    'Skin Veil Tint · Shade 01 · Light neutral with soft yellow undertone. · 4200 DZD';
  const shadeProductAlt = (settings as any).template_shade_product_alt || 'Shade product';

  const filtersTitle = (settings as any).template_filters_title || 'Filters';
  const routineTitle = (settings as any).template_routine_title || 'Routine';
  const concernTitle = (settings as any).template_concern_title || 'Skin concern';
  const typeTitle = (settings as any).template_type_title || 'Product type';
  const priceTitle = (settings as any).template_price_title || 'Price (max)';
  const priceAny = (settings as any).template_price_any || 'Any';
  const price4000 = (settings as any).template_price_4000 || 'Up to 4,000 DZD';
  const price8000 = (settings as any).template_price_8000 || 'Up to 8,000 DZD';
  const price12000 = (settings as any).template_price_12000 || 'Up to 12,000 DZD';

  const topKickerAll = (settings as any).template_top_kicker_all || 'All products';
  const topKickerFiltered = (settings as any).template_top_kicker_filtered || 'Filtered selection';
  const catalogTitle = (settings as any).template_catalog_title || 'Catalog';
  const itemsSuffix = (settings as any).template_items_suffix || 'items';
  const wishlistSuffix = (settings as any).template_wishlist_suffix || 'Wishlist:';

  const productFallbackCategory = (settings as any).template_product_fallback_category || 'Product';
  const buyNowLabel = (settings as any).template_buy_now_label || 'Buy Now';

  const ingredientsKicker = (settings as any).template_ingredients_kicker || 'Ingredients';
  const glossaryTitle = (settings as any).template_glossary_title || 'Glossary';

  const footerSuffix = (settings as any).template_footer_suffix || 'Beauty & skincare store';
  const footerLinks = (settings as any).template_footer_links
    ? String((settings as any).template_footer_links)
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)
    : ['Ingredients', 'Routines', 'Customer care'];

  const quickViewCloseLabel = (settings as any).template_quickview_close_label || 'Close';
  const quickViewDetailsSuffix = (settings as any).template_quickview_details_suffix || 'Details';
  const quickViewReviewsText = (settings as any).template_quickview_reviews_text || '(5 reviews)';
  const quickViewDescriptionFallback = (settings as any).template_quickview_description_fallback || 'Premium beauty product for your skincare routine.';
  const quickViewViewDetailsLabel = (settings as any).template_quickview_view_details_label || 'View Details';

  const defaultShades: Array<{ id: string; hex: string }> = [
    { id: 's1', hex: '#fbe4d5' },
    { id: 's2', hex: '#f4c7a1' },
    { id: 's3', hex: '#e7a76c' },
    { id: 's4', hex: '#c78453' },
    { id: 's5', hex: '#8a5a3d' },
  ];
  let shades: Array<{ id: string; hex: string }> = defaultShades;
  const shadesJson = (settings as any).template_shades_json;
  if (shadesJson) {
    try {
      const parsed = JSON.parse(String(shadesJson));
      if (Array.isArray(parsed)) shades = parsed;
    } catch {
      shades = defaultShades;
    }
  }

  const concerns = (settings.template_concerns
    ? String(settings.template_concerns)
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)
    : ['Acne', 'Sensitivity', 'Dryness', 'Oiliness', 'Aging']) as string[];
  const routines = ((settings as any).template_routines
    ? String((settings as any).template_routines)
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)
    : ['Morning', 'Evening']) as string[];
  const productTypes = ((settings as any).template_product_types
    ? String((settings as any).template_product_types)
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)
    : ['All', 'clinical', 'premium', 'luxury', 'kbeauty']) as string[];

  const defaultIngredientCards = [
    { title: 'Niacinamide', meta: '(10%)', description: 'Reduces blemishes, controls oil, refines pores.' },
    { title: 'Hyaluronic Acid', meta: '(2%)', description: 'Multi-weight hydration for different skin layers.' },
    { title: 'Retinol', meta: '(0.2%)', description: 'Supports texture, fine lines and cell turnover.' },
  ];
  let ingredientCards = defaultIngredientCards;
  const ingredientCardsJson = (settings as any).template_ingredients_cards_json;
  if (ingredientCardsJson) {
    try {
      const parsed = JSON.parse(String(ingredientCardsJson));
      if (Array.isArray(parsed)) ingredientCards = parsed;
    } catch {
      ingredientCards = defaultIngredientCards;
    }
  }

  const filteredProducts = products.filter((p: any) => {
    const bySearch = search ? p.title?.toLowerCase().includes(search.toLowerCase()) : true;
    const byRoutine = routine === 'All' ? true : p.category === routine;
    const byConcern = concern === 'All' ? true : true;
    const byType = typeFilter === 'All' ? true : true;
    const byPrice = (p.price || 0) <= maxPrice;
    return bySearch && byRoutine && byConcern && byType && byPrice;
  });

  const toggleWishlist = (id: number) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const addToBag = () => {
    setBagCount(c => c + 1);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: secondary_color }}>
      <style>{dynamicStyles}</style>
      {/* Floating bag */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          style={{ backgroundColor: primary_color, color: secondary_color }}
          className="rounded-full px-3 py-1.5 flex items-center gap-2 shadow-lg text-[11px] font-medium"
        >
          <span>{bagLabel}</span>
          <span
            style={{ backgroundColor: accent_color, color: secondary_color }}
            className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold"
          >
            {bagCount}
          </span>
        </button>
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-40 backdrop-blur border-b" style={{ backgroundColor: `rgba(${secondary_color === '#fff6fb' ? '255,255,255' : '15,23,42'},0.9)`, borderBottomColor: secondary_text_color }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-semibold tracking-[0.16em] overflow-hidden"
              style={{ backgroundColor: primary_color, color: secondary_color }}
            >
              {logoUrl ? (
                <img src={logoUrl} alt={`${storeName} logo`} className="w-full h-full object-contain" />
              ) : (
                storeInitials
              )}
            </div>
            <div>
              <div className="font-serif text-lg font-semibold leading-tight" style={{ color: text_color }}>
                {storeName}
              </div>
              <div className="text-[11px]" style={{ color: secondary_text_color }}>
                {headerTagline}
              </div>
            </div>
          </div>

          <div className="hidden md:flex flex-1 mx-4">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full text-sm rounded-full px-3 py-1.5 focus:outline-none border"
              style={{
                borderColor: secondary_text_color,
                backgroundColor: secondary_color,
                color: text_color
              }}
            />
          </div>

          <div className="flex items-center gap-3 text-[11px]" style={{ color: secondary_text_color }}>
            <div className="hidden sm:flex items-center gap-1">
              <span>{wishlistLabel}</span>
              <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: accent_color, color: secondary_color }}>
                {wishlist.length}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section
        className="border-b"
        style={{
          borderBottomColor: '#fce7f3',
          background: 'radial-gradient(circle at top left, #ffe4ec 0, #fff7fb 40%, #ffffff 100%)'
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-8">
          <div className="text-center max-w-3xl mx-auto mb-6">
            <span
              className="inline-block rounded-full px-3 py-1 text-[11px] font-medium tracking-[0.16em] uppercase"
              style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}
            >
              {heroBadge}
            </span>
            <h2 className="font-serif text-xl md:text-2xl sm:text-2xl md:text-xl md:text-2xl font-semibold mt-4 leading-tight">
              {heroHeading}
            </h2>
            <p className="text-sm mt-3" style={{ color: '#6b7280' }}>
              {heroSubtitle}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <button
                className="rounded-full px-4 py-2 text-xs font-semibold tracking-[0.14em] uppercase"
                style={{ backgroundColor: '#111827', color: '#f9fafb' }}
              >
                {heroPrimaryCta}
              </button>
              <button
                className="rounded-full px-4 py-2 text-xs font-semibold tracking-[0.14em] uppercase border"
                style={{ borderColor: '#fecaca', backgroundColor: '#fff7f7', color: '#b91c1c' }}
              >
                {heroSecondaryCta}
              </button>
            </div>
          </div>

          {/* Shade finder */}
          <div className="rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center border" style={{ backgroundColor: '#ffffff', borderColor: '#f3d5dd' }}>
            <div className="flex-1">
              <div className="text-[11px] tracking-[0.16em] uppercase mb-1" style={{ color: '#9f7a85' }}>
                {shadeFinderLabel}
              </div>
              <div className="font-serif text-lg font-semibold">{shadeFinderProductName}</div>
              <div className="text-[12px] mt-1 mb-2" style={{ color: '#6b7280' }}>
                {shadeFinderInstruction}
              </div>
              <div className="flex gap-2 flex-wrap mb-2">
                {shades.map(sh => (
                  <button
                    key={sh.id}
                    className={`w-4 h-4 rounded-full border ${selectedShadeId === sh.id ? 'outline outline-2 outline-offset-2' : ''}`}
                    style={{
                      backgroundColor: sh.hex,
                      borderColor: 'rgba(0,0,0,0.08)',
                      outlineColor: selectedShadeId === sh.id ? '#111827' : 'transparent'
                    }}
                    onClick={() => setSelectedShadeId(sh.id)}
                  />
                ))}
              </div>
              <div className="text-[12px]" style={{ color: '#4b5563' }}>
                {shadeFinderDetailsLine}
              </div>
            </div>
            <div className="w-full sm:w-40 rounded-2xl overflow-hidden border" style={{ borderColor: '#f3d5dd', backgroundColor: '#fff7fb' }}>
              <img
                src={products[0]?.images?.[0] || 'https://images.unsplash.com/photo-1585386959984-a4155223f3f8?auto=format&fit=crop&w=900&q=80'}
                alt={shadeProductAlt}
                className="w-full object-cover"
                style={{ height: '128px' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* MAIN LAYOUT */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-7">
        <div className="grid grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)] gap-3 md:gap-4">
          {/* FILTERS */}
          <aside className="rounded-2xl border p-4 h-fit" style={{ backgroundColor: '#ffffff', borderColor: '#fce7f3' }}>
            <div className="text-sm font-semibold mb-3">{filtersTitle}</div>

            <div className="mb-4">
              <div className="text-[11px] tracking-[0.16em] uppercase mb-1" style={{ color: '#9f7a85' }}>
                {routineTitle}
              </div>
              <div className="flex flex-wrap gap-2 text-[11px]">
                {['All', ...routines].map(r => (
                  <button
                    key={r}
                    onClick={() => setRoutine(r)}
                    className="rounded-full border px-3 py-1 whitespace-nowrap transition"
                    style={{
                      backgroundColor: routine === r ? '#111827' : '#fff8fb',
                      color: routine === r ? '#fef2f2' : '#7b4351',
                      borderColor: routine === r ? '#111827' : '#f3d5dd'
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-[11px] tracking-[0.16em] uppercase mb-1" style={{ color: '#9f7a85' }}>
                {concernTitle}
              </div>
              <div className="flex flex-wrap gap-2 text-[11px]">
                {['All', ...concerns].map(c => (
                  <button
                    key={c}
                    onClick={() => setConcern(c)}
                    className="rounded-full border px-3 py-1 whitespace-nowrap transition"
                    style={{
                      backgroundColor: concern === c ? '#111827' : '#fff8fb',
                      color: concern === c ? '#fef2f2' : '#7b4351',
                      borderColor: concern === c ? '#111827' : '#f3d5dd'
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-[11px] tracking-[0.16em] uppercase mb-1" style={{ color: '#9f7a85' }}>
                {typeTitle}
              </div>
              <div className="flex flex-wrap gap-2 text-[11px]">
                {productTypes.map(t => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className="rounded-full border px-3 py-1 whitespace-nowrap transition"
                    style={{
                      backgroundColor: typeFilter === t ? '#111827' : '#fff8fb',
                      color: typeFilter === t ? '#fef2f2' : '#7b4351',
                      borderColor: typeFilter === t ? '#111827' : '#f3d5dd'
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] tracking-[0.16em] uppercase mb-1" style={{ color: '#9f7a85' }}>
                {priceTitle}
              </div>
              <select
                className="w-full text-xs rounded-md px-2 py-1.5 border"
                style={{
                  borderColor: '#fce7f3',
                  backgroundColor: '#fff7fb',
                  color: '#111827'
                }}
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
              >
                <option value={999999}>{priceAny}</option>
                <option value={4000}>{price4000}</option>
                <option value={8000}>{price8000}</option>
                <option value={12000}>{price12000}</option>
              </select>
            </div>
          </aside>

          {/* PRODUCT AREA */}
          <section>
            {/* Top bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <div className="text-[11px] tracking-[0.16em] uppercase" style={{ color: '#9f7a85' }}>
                  {routine === 'All' && concern === 'All' && typeFilter === 'All' ? topKickerAll : topKickerFiltered}
                </div>
                <h3 className="font-serif text-lg font-semibold mt-1">{catalogTitle}</h3>
              </div>
              <div className="text-[11px]" style={{ color: '#9f7a85' }}>
                {filteredProducts.length} {itemsSuffix} · {wishlistSuffix} {wishlist.length}
              </div>
            </div>

            {/* Products grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4 md:mb-6">
              {filteredProducts.map((p: any) => (
                <div
                  key={p.id}
                  className="rounded-2xl border overflow-hidden flex flex-col transition hover:-translate-y-1 cursor-pointer"
                  style={{
                    backgroundColor: '#ffffff',
                    borderColor: '#f3d5dd',
                    boxShadow: 'none'
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 18px 40px rgba(185, 28, 28, 0.18)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                  onClick={() => navigate(p.slug && p.slug.length > 0 ? `/store/${storeSlug}/${p.slug}` : `/product/${p.id}`)}
                >
                  <div className="relative">
                    <img
                      src={p.images?.[0] || 'https://via.placeholder.com/400'}
                      alt={p.title}
                      className="w-full object-cover"
                      style={{ height: '190px' }}
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      <button
                        className="w-6 h-6 rounded-full flex items-center justify-center text-sm border transition"
                        style={{
                          backgroundColor: wishlist.includes(p.id) ? '#111827' : '#ffffff',
                          color: wishlist.includes(p.id) ? '#fef2f2' : '#111827',
                          borderColor: wishlist.includes(p.id) ? '#111827' : '#f3d5dd'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(p.id);
                        }}
                      >
                        ♥
                      </button>
                    </div>
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <div className="font-semibold text-sm line-clamp-2" style={{ color: '#1f2933' }}>
                      {p.title}
                    </div>
                    <div className="text-[11px] mt-1" style={{ color: '#9f7a85' }}>
                      {p.category || productFallbackCategory} · {p.price}
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <div className="text-xs" style={{ color: '#7b4351' }}>
                        {formatPrice(p.price)} DZD
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`checkout/${p.id}`);
                        }}
                        className="text-[11px] px-3 py-1 rounded-full font-semibold text-white"
                        style={{ backgroundColor: '#111827' }}
                      >
                        {buyNowLabel}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Ingredients glossary */}
            <div className="rounded-2xl border p-4" style={{ backgroundColor: '#ffffff', borderColor: '#fce7f3' }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-[11px] tracking-[0.16em] uppercase" style={{ color: '#9f7a85' }}>
                    {ingredientsKicker}
                  </span>
                  <h4 className="font-serif text-base font-semibold mt-1">{glossaryTitle}</h4>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px]">
                {ingredientCards.slice(0, 6).map((card: any) => (
                  <div key={String(card?.title || '')} className="rounded-xl border p-3" style={{ backgroundColor: '#fff8fb', borderColor: '#fce7f3' }}>
                    <div className="font-semibold mb-1" style={{ color: '#7b4351' }}>
                      {String(card?.title || '')}{' '}
                      {card?.meta ? <span className="text-[10px]">{String(card.meta)}</span> : null}
                    </div>
                    <div style={{ color: '#6b7280' }}>{String(card?.description || '')}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t" style={{ borderTopColor: '#fce7f3', backgroundColor: '#ffffff' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 text-[11px] flex flex-col sm:flex-row gap-2 sm:justify-between" style={{ color: '#9f7a85' }}>
          <span>
            © {new Date().getFullYear()} {storeName} · {footerSuffix}
          </span>
          <div className="flex gap-3">
            {footerLinks.slice(0, 5).map((label: string) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>
      </footer>

      {/* QUICK VIEW DRAWER */}
      {quickViewProduct && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)' }}
          onClick={() => setQuickViewProduct(null)}
        >
          <div
            className="w-96 max-w-full bg-white h-full p-4 shadow-2xl overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">{quickViewProduct.title}</div>
              <button
                className="text-xs text-gray-500"
                onClick={() => setQuickViewProduct(null)}
              >
                {quickViewCloseLabel}
              </button>
            </div>
            <div className="rounded-xl overflow-hidden border mb-3" style={{ borderColor: '#fce7f3' }}>
              <img
                src={quickViewProduct.images?.[0] || 'https://via.placeholder.com/400'}
                alt={quickViewProduct.title}
                className="w-full object-cover"
                style={{ height: '176px' }}
              />
            </div>
            <div className="text-[11px] mb-2" style={{ color: '#9f7a85' }}>
              {quickViewProduct.category || productFallbackCategory} · {quickViewDetailsSuffix}
            </div>
            <div className="text-[12px] mb-2" style={{ color: '#111827' }}>
              {formatPrice(quickViewProduct.price)} DZD
            </div>
            <div className="text-[12px] mb-3" style={{ color: '#f59e0b' }}>
              ★★★★★ <span style={{ color: '#9ca3af' }}>{quickViewReviewsText}</span>
            </div>
            <p className="text-[11px] mb-3" style={{ color: '#6b7280' }}>
              {quickViewProduct.description || quickViewDescriptionFallback}
            </p>
            <div className="flex gap-2">
              <button
                className="flex-1 py-2 rounded-full text-[11px] font-semibold tracking-[0.14em] uppercase border-2"
                style={{ borderColor: '#111827', color: '#111827', backgroundColor: 'transparent' }}
                onClick={() => {
                  setQuickViewProduct(null);
                  navigate(quickViewProduct.slug && quickViewProduct.slug.length > 0 ? `/store/${storeSlug}/${quickViewProduct.slug}` : `/product/${quickViewProduct.id}`);
                }}
              >
                {quickViewViewDetailsLabel}
              </button>
              <button
                className="flex-1 py-2 rounded-full text-[11px] font-semibold tracking-[0.14em] uppercase"
                style={{ backgroundColor: '#111827', color: '#f9fafb' }}
                onClick={() => {
                  setQuickViewProduct(null);
                  navigate(`checkout/${quickViewProduct.id}`);
                }}
              >
                {buyNowLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const TEMPLATE_EDITOR_SECTIONS = [
  {
    title: 'Beauty: Header',
    fields: [
      { key: 'store_initials', label: 'Logo Initials', type: 'text', defaultValue: 'BS' },
      { key: 'template_header_tagline', label: 'Header Tagline', type: 'text', defaultValue: 'Skin · Color · Rituals · K‑beauty · Clinical' },
      { key: 'template_search_placeholder', label: 'Search Placeholder', type: 'text', defaultValue: 'Search serums, tints, cleansers...' },
      { key: 'template_wishlist_label', label: 'Wishlist Label', type: 'text', defaultValue: 'Wishlist' },
      { key: 'template_bag_label', label: 'Bag Label', type: 'text', defaultValue: 'Bag' },
    ],
  },
  {
    title: 'Beauty: Hero',
    fields: [
      { key: 'template_hero_badge', label: 'Hero Badge', type: 'text', defaultValue: 'Beauty store · Full options' },
      {
        key: 'template_hero_heading',
        label: 'Hero Heading',
        type: 'text',
        defaultValue: 'A clean, modern beauty store built around routines, concerns and shades',
      },
      {
        key: 'template_hero_subtitle',
        label: 'Hero Subtitle',
        type: 'text',
        defaultValue: 'Filter by skin concern, routine time, product type and price. Wishlist your favorites and explore base shades.',
      },
      { key: 'template_hero_primary_cta', label: 'Primary CTA', type: 'text', defaultValue: 'Explore products' },
      { key: 'template_hero_secondary_cta', label: 'Secondary CTA', type: 'text', defaultValue: 'Browse routines' },
    ],
  },
  {
    title: 'Beauty: Shade Finder',
    fields: [
      { key: 'template_shade_finder_label', label: 'Shade Finder Label', type: 'text', defaultValue: 'Shade finder' },
      { key: 'template_shade_finder_product_name', label: 'Shade Product Name', type: 'text', defaultValue: 'Skin Veil Tint' },
      { key: 'template_shade_finder_instruction', label: 'Shade Instruction', type: 'text', defaultValue: 'Tap a shade to preview the tint and details.' },
      {
        key: 'template_shade_finder_details_line',
        label: 'Shade Details Line',
        type: 'text',
        defaultValue: 'Skin Veil Tint · Shade 01 · Light neutral with soft yellow undertone. · 4200 DZD',
      },
      { key: 'template_shade_product_alt', label: 'Shade Image Alt', type: 'text', defaultValue: 'Shade product' },
      {
        key: 'template_shades_json',
        label: 'Shades JSON',
        type: 'textarea',
        defaultValue: JSON.stringify(
          [
            { id: 's1', hex: '#fbe4d5' },
            { id: 's2', hex: '#f4c7a1' },
            { id: 's3', hex: '#e7a76c' },
            { id: 's4', hex: '#c78453' },
            { id: 's5', hex: '#8a5a3d' },
          ],
          null,
          2
        ),
      },
    ],
  },
  {
    title: 'Beauty: Filters & Catalog',
    fields: [
      { key: 'template_filters_title', label: 'Filters Title', type: 'text', defaultValue: 'Filters' },
      { key: 'template_routine_title', label: 'Routine Title', type: 'text', defaultValue: 'Routine' },
      { key: 'template_concern_title', label: 'Concern Title', type: 'text', defaultValue: 'Skin concern' },
      { key: 'template_type_title', label: 'Type Title', type: 'text', defaultValue: 'Product type' },
      { key: 'template_price_title', label: 'Price Title', type: 'text', defaultValue: 'Price (max)' },
      { key: 'template_routines', label: 'Routines (comma-separated)', type: 'text', defaultValue: 'Morning, Evening' },
      { key: 'template_concerns', label: 'Concerns (comma-separated)', type: 'text', defaultValue: 'Acne, Sensitivity, Dryness, Oiliness, Aging' },
      { key: 'template_product_types', label: 'Product Types (comma-separated)', type: 'text', defaultValue: 'All, clinical, premium, luxury, kbeauty' },
      { key: 'template_price_any', label: 'Price Option: Any', type: 'text', defaultValue: 'Any' },
      { key: 'template_price_4000', label: 'Price Option: 4,000', type: 'text', defaultValue: 'Up to 4,000 DZD' },
      { key: 'template_price_8000', label: 'Price Option: 8,000', type: 'text', defaultValue: 'Up to 8,000 DZD' },
      { key: 'template_price_12000', label: 'Price Option: 12,000', type: 'text', defaultValue: 'Up to 12,000 DZD' },
      { key: 'template_top_kicker_all', label: 'Top Kicker (All)', type: 'text', defaultValue: 'All products' },
      { key: 'template_top_kicker_filtered', label: 'Top Kicker (Filtered)', type: 'text', defaultValue: 'Filtered selection' },
      { key: 'template_catalog_title', label: 'Catalog Title', type: 'text', defaultValue: 'Catalog' },
      { key: 'template_items_suffix', label: 'Items Suffix', type: 'text', defaultValue: 'items' },
      { key: 'template_wishlist_suffix', label: 'Wishlist Suffix', type: 'text', defaultValue: 'Wishlist:' },
      { key: 'template_product_fallback_category', label: 'Fallback Category', type: 'text', defaultValue: 'Product' },
      { key: 'template_buy_now_label', label: 'Buy Now Label', type: 'text', defaultValue: 'Buy Now' },
    ],
  },
  {
    title: 'Beauty: Ingredients',
    fields: [
      { key: 'template_ingredients_kicker', label: 'Ingredients Kicker', type: 'text', defaultValue: 'Ingredients' },
      { key: 'template_glossary_title', label: 'Glossary Title', type: 'text', defaultValue: 'Glossary' },
      {
        key: 'template_ingredients_cards_json',
        label: 'Ingredient Cards JSON',
        type: 'textarea',
        defaultValue: JSON.stringify(
          [
            { title: 'Niacinamide', meta: '(10%)', description: 'Reduces blemishes, controls oil, refines pores.' },
            { title: 'Hyaluronic Acid', meta: '(2%)', description: 'Multi-weight hydration for different skin layers.' },
            { title: 'Retinol', meta: '(0.2%)', description: 'Supports texture, fine lines and cell turnover.' },
          ],
          null,
          2
        ),
      },
    ],
  },
  {
    title: 'Beauty: Footer & Quick View',
    fields: [
      { key: 'template_footer_suffix', label: 'Footer Suffix', type: 'text', defaultValue: 'Beauty & skincare store' },
      { key: 'template_footer_links', label: 'Footer Links (comma-separated)', type: 'text', defaultValue: 'Ingredients, Routines, Customer care' },
      { key: 'template_quickview_close_label', label: 'Quick View: Close', type: 'text', defaultValue: 'Close' },
      { key: 'template_quickview_details_suffix', label: 'Quick View: Details Suffix', type: 'text', defaultValue: 'Details' },
      { key: 'template_quickview_reviews_text', label: 'Quick View: Reviews Text', type: 'text', defaultValue: '(5 reviews)' },
      {
        key: 'template_quickview_description_fallback',
        label: 'Quick View: Description Fallback',
        type: 'text',
        defaultValue: 'Premium beauty product for your skincare routine.',
      },
      { key: 'template_quickview_view_details_label', label: 'Quick View: View Details', type: 'text', defaultValue: 'View Details' },
    ],
  },
] as const;
