import React, { useState, useMemo } from 'react';
import { TemplateProps } from '@/pages/storefront/templates/types';
import { useTemplateUniversalSettings } from '@/hooks/useTemplateUniversalSettings';

export default function Fashion2Template(props: TemplateProps) {
  const { navigate, storeSlug } = props;
  const [bagCount, setBagCount] = useState(0);
  const [wishlist, setWishlist] = useState<number[]>([]);

  // Read universal settings from window
  const universalSettings = useTemplateUniversalSettings() || {};

  // Helper functions to save product data and navigate
  const handleProductClick = (product: any) => {
    localStorage.setItem(`product_${product.id}`, JSON.stringify(product));
    localStorage.setItem('currentStoreSlug', storeSlug || '');
    const slug = product.slug || product.id;
    navigate(storeSlug ? `/store/${storeSlug}/${slug}` : `/product/${product.id}`);
  };

  const handleBuyClick = (product: any, e?: any) => {
    if (e) e.stopPropagation();
    localStorage.setItem(`product_${product.id}`, JSON.stringify(product));
    localStorage.setItem('currentStoreSlug', storeSlug || '');
    const slug = product.slug || product.id;
    navigate(storeSlug ? `/store/${storeSlug}/${slug}` : `/product/${product.id}`);
  };

  const { products = [], settings = {}, categories = [] } = props;
  
  // Extract universal settings with defaults
  const {
    primary_color = '#000000',
    secondary_color = '#f5f5f5',
    text_color = '#1f2937',
    secondary_text_color = '#6b7280',
  } = useMemo(() => universalSettings as any || {}, [universalSettings]);
  
  const storeName = settings.store_name || 'LineaWear';
  const storeInitials = (settings as any).store_initials || String(storeName).slice(0, 2).toUpperCase();
    const logoUrl = (settings as any).store_logo || (settings as any).logo_url || '';
  const heroVideoUrl = settings.hero_video_url || null;

  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: secondary_color, color: text_color }}>
        <div className="text-center max-w-md mx-auto p-4 md:p-6">
          <div className="text-6xl mb-4">👕</div>
          <h1 className="text-xl md:text-2xl font-semibold mb-3">No Products Yet</h1>
          <p className="mb-2" style={{ color: secondary_text_color }}>Add products to your store to see them displayed here.</p>
          <p className="text-sm" style={{ color: secondary_text_color }}>Products will appear automatically once you add them.</p>
        </div>
      </div>
    );
  }

  const city = settings.store_description?.split('·')[0] || 'Algiers';
  const tagline = settings.store_description?.split('·')[1]?.trim() || 'Modern street & clean tailoring';
  const heroHeading = settings.template_hero_heading || 'Build a fashion store that feels like a campaign, but behaves like a clean, modern catalog.';
  const buttonText = settings.template_button_text || 'Shop Now';

  const bagLabel = (settings as any).template_bag_label || 'Bag';
  const headerTagline = (settings as any).template_header_tagline || 'Men · Women · Street · Tailored';
  const searchPlaceholder = (settings as any).template_search_placeholder || 'Search jackets, cargos, sneakers...';
  const wishlistLabel = (settings as any).template_wishlist_label || 'Wishlist';
  const heroBadge = (settings as any).template_hero_badge || 'Season drop · Fashion store';
  const heroSubtitle = (settings as any).template_hero_subtitle || 'Push your key pieces first. Then let filters, sizes and structure do their job in the catalog below.';
  const heroProductCta = (settings as any).template_hero_product_cta || 'Shop now';
  const dropLabel = (settings as any).template_drop_label || 'Drop 01';

  const filtersTitle = (settings as any).template_filters_title || 'Filters';
  const genderTitle = (settings as any).template_gender_title || 'Gender';
  const categoryTitle = (settings as any).template_category_title || 'Category';
  const sizeTitle = (settings as any).template_size_title || 'Size';
  const priceTitle = (settings as any).template_price_title || 'Price (max)';
  const priceAny = (settings as any).template_price_any || 'Any';
  const price6000 = (settings as any).template_price_6000 || 'Up to 6,000 DZD';
  const price12000 = (settings as any).template_price_12000 || 'Up to 12,000 DZD';
  const price20000 = (settings as any).template_price_20000 || 'Up to 20,000 DZD';

  const topKicker = (settings as any).template_top_kicker || 'All items';
  const catalogTitle = (settings as any).template_catalog_title || 'Catalog';
  const itemsSuffix = (settings as any).template_items_suffix || 'items';
  const wishlistSuffix = (settings as any).template_wishlist_suffix || 'Wishlist:';
  const sortFeatured = (settings as any).template_sort_featured || 'Featured';
  const sortLowHigh = (settings as any).template_sort_low_high || 'Price: Low to High';
  const sortHighLow = (settings as any).template_sort_high_low || 'Price: High to Low';
  const sortNewArrivals = (settings as any).template_sort_new_arrivals || 'New arrivals';
  const addToBagLabel = (settings as any).template_add_to_bag_label || 'Add to bag';

  const footerSuffix = (settings as any).template_footer_suffix || 'Fashion store';
  const footerLinks = (settings as any).template_footer_links
    ? String((settings as any).template_footer_links)
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)
    : ['Lookbook', 'Shipping', 'Returns'];

  const genders = (settings.template_genders
    ? String(settings.template_genders)
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)
    : ['All', 'Men', 'Women', 'Unisex']) as string[];
  const sizes = ((settings as any).template_sizes
    ? String((settings as any).template_sizes)
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)
    : ['All', 'XS', 'S', 'M', 'L', 'XL']) as string[];
  const categoryList = ['All', ...categories.filter(c => c).slice(0, 5)];

  const filteredProducts = products.filter((p: any) => {
    const search = props.searchQuery?.toLowerCase() || '';
    const matchesSearch = !search || p.title?.toLowerCase().includes(search);
    const matchesCategory = props.categoryFilter === 'all' || p.category === props.categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const toggleWishlist = (id: number) => {
    setWishlist(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Floating Bag */}
      <div className="fixed bottom-4 right-4 z-40">
        <button style={{ backgroundColor: primary_color, color: secondary_color }} className="rounded-full font-semibold text-xs px-3 py-2 flex items-center gap-2 shadow-lg">
          {bagLabel}
          <span style={{ backgroundColor: secondary_color, color: primary_color }} className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">{bagCount}</span>
        </button>
      </div>

      {/* Header */}
      <header className="bg-white/90 backdrop-blur border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
              <div style={{ backgroundColor: primary_color, color: secondary_color }} className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold overflow-hidden">
                {logoUrl ? (
                  <img src={logoUrl} alt={`${storeName} logo`} className="w-full h-full object-contain" />
                ) : (
                  storeInitials
                )}
              </div>
            <div>
              <div style={{ color: text_color }} className="font-serif text-lg font-semibold leading-tight">{storeName}</div>
              <div className="text-xs text-gray-500">{headerTagline}</div>
            </div>
          </div>

          <div className="hidden md:flex flex-1 mx-4">
            <input
              type="text"
              value={props.searchQuery || ''}
              onChange={(e) => props.setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full text-sm border border-gray-200 rounded-full px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-400 bg-gray-50"
            />
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-600">
            <div className="hidden sm:flex items-center gap-1">
              <span>{wishlistLabel}</span>
              <span style={{ backgroundColor: primary_color, color: secondary_color }} className="px-2 py-0.5 rounded-full">{wishlist.length}</span>
            </div>
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs">{city}</span>
              <span className="text-xs text-gray-400">{tagline}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - 3 Image Grid */}
      <section className="border-b border-gray-200 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-8">
          <div className="mb-5">
            <span className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-3" style={{ backgroundColor: primary_color, color: secondary_color }}>{heroBadge}</span>
            <h2 style={{ color: text_color }} className="font-serif text-2xl sm:text-3xl font-semibold mt-3 leading-tight max-w-xl">{heroHeading}</h2>
            <p className="text-sm text-gray-600 mt-2 max-w-md">{heroSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.9fr] gap-6">
            {/* Left – Main product */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-white h-96">
              {heroVideoUrl ? (
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src={heroVideoUrl} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={settings.banner_url || 'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?auto=format&fit=crop&w=1200&q=80'}
                  alt="Hero"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4">
                <div className="text-sm font-semibold">{products[0]?.title || 'Featured Product'}</div>
                <div className="text-xs text-gray-300">{products[0]?.price || 'Price'} DZD</div>
                <button onClick={() => handleBuyClick(products[0])} className="mt-2 text-xs py-1 px-3 rounded-full bg-white text-black font-semibold">{heroProductCta}</button>
              </div>
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black text-white text-xs uppercase tracking-widest">{dropLabel}</div>
            </div>

            {/* Right – Two smaller products */}
            <div className="flex flex-col gap-4">
              {products.slice(1, 3).map((p: any) => (
                <div key={p.id} className="relative rounded-2xl overflow-hidden border border-gray-200 bg-white h-44">
                  <img src={p.images?.[0] || 'https://via.placeholder.com/400'} alt={p.title} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-3">
                    <div className="text-sm font-semibold line-clamp-1">{p.title}</div>
                    <div className="text-xs text-gray-300">{p.price} DZD</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-7">
        <div className="grid grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)] gap-6">
          {/* Filters Sidebar */}
          <aside className="bg-white rounded-2xl border border-gray-200 p-4 h-fit">
            <div className="text-sm font-semibold mb-3">{filtersTitle}</div>

            <div className="mb-4">
              <div className="text-xs font-bold uppercase text-gray-600 mb-2">{genderTitle}</div>
              <div className="flex flex-wrap gap-2 text-xs">
                {genders.map(g => (
                  <button key={g} className="filter-pill px-3 py-1 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-100">
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs font-bold uppercase text-gray-600 mb-2">{categoryTitle}</div>
              <div className="flex flex-wrap gap-2 text-xs">
                {categoryList.map(cat => (
                  <button key={cat} className="filter-pill px-3 py-1 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-100">
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs font-bold uppercase text-gray-600 mb-2">{sizeTitle}</div>
              <div className="flex flex-wrap gap-2 text-xs">
                {sizes.map(s => (
                  <button key={s} className="filter-pill px-3 py-1 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-100">
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold uppercase text-gray-600 mb-2">{priceTitle}</div>
              <select className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-gray-50">
                <option>{priceAny}</option>
                <option>{price6000}</option>
                <option>{price12000}</option>
                <option>{price20000}</option>
              </select>
            </div>
          </aside>

          {/* Product Area */}
          <section>
            {/* Top bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <div className="text-xs font-bold uppercase text-gray-600">{topKicker}</div>
                <h3 style={{ color: text_color }} className="font-serif text-lg font-semibold mt-1">{catalogTitle}</h3>
              </div>
              <div className="flex items-center gap-3 justify-between sm:justify-end">
                <div className="text-xs text-gray-600">{filteredProducts.length} {itemsSuffix} · {wishlistSuffix} {wishlist.length}</div>
                <select value={props.sortOption} onChange={(e) => props.setSortOption(e.target.value as any)} className="text-xs border border-gray-200 rounded-full px-3 py-1.5 bg-white">
                  <option>{sortFeatured}</option>
                  <option>{sortLowHigh}</option>
                  <option>{sortHighLow}</option>
                  <option>{sortNewArrivals}</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((p: any) => (
                <div key={p.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-400 transition cursor-pointer" onClick={() => handleProductClick(p)}>
                  <div className="relative">
                    <img src={p.images?.[0] || 'https://via.placeholder.com/400'} alt={p.title} className="w-full h-60 object-cover" />
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      <button onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id); }} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${ wishlist.includes(p.id) ? 'bg-black text-white border-0' : 'bg-white border border-gray-200 text-gray-800'}`}>♥</button>
                    </div>
                  </div>
                  <div className="p-3">
                    <div style={{ color: text_color }} className="text-sm font-semibold line-clamp-2">{p.title}</div>
                    <div className="text-xs text-gray-600 mt-1">{p.category}</div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs font-semibold">{p.price} DZD</div>
                    </div>
                    <button onClick={(e) => handleBuyClick(p, e)} className="w-full text-xs py-1.5 rounded-full mt-3" style={{ backgroundColor: primary_color, color: secondary_color, fontWeight: '600' }}>{addToBagLabel}</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 text-xs text-gray-600 flex flex-col sm:flex-row gap-2 sm:justify-between">
          <span>© {new Date().getFullYear()} {storeName} · {footerSuffix}</span>
          <div className="flex gap-3">
            {footerLinks.slice(0, 5).map((label: string) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

export const TEMPLATE_EDITOR_SECTIONS = [
  {
    title: 'Fashion2: Header',
    fields: [
      { key: 'store_initials', label: 'Logo Initials', type: 'text', defaultValue: 'LW' },
      { key: 'template_bag_label', label: 'Bag Label', type: 'text', defaultValue: 'Bag' },
      { key: 'template_header_tagline', label: 'Header Tagline', type: 'text', defaultValue: 'Men · Women · Street · Tailored' },
      { key: 'template_search_placeholder', label: 'Search Placeholder', type: 'text', defaultValue: 'Search jackets, cargos, sneakers...' },
      { key: 'template_wishlist_label', label: 'Wishlist Label', type: 'text', defaultValue: 'Wishlist' },
    ],
  },
  {
    title: 'Fashion2: Hero',
    fields: [
      { key: 'template_hero_badge', label: 'Hero Badge', type: 'text', defaultValue: 'Season drop · Fashion store' },
      {
        key: 'template_hero_heading',
        label: 'Hero Heading',
        type: 'text',
        defaultValue: 'Build a fashion store that feels like a campaign, but behaves like a clean, modern catalog.',
      },
      {
        key: 'template_hero_subtitle',
        label: 'Hero Subtitle',
        type: 'text',
        defaultValue: 'Push your key pieces first. Then let filters, sizes and structure do their job in the catalog below.',
      },
      { key: 'template_hero_product_cta', label: 'Hero Product CTA', type: 'text', defaultValue: 'Shop now' },
      { key: 'template_drop_label', label: 'Drop Label', type: 'text', defaultValue: 'Drop 01' },
      { key: 'template_button_text', label: 'Hero Button Text', type: 'text', defaultValue: 'Shop Now' },
    ],
  },
  {
    title: 'Fashion2: Filters & Labels',
    fields: [
      { key: 'template_filters_title', label: 'Filters Title', type: 'text', defaultValue: 'Filters' },
      { key: 'template_gender_title', label: 'Gender Title', type: 'text', defaultValue: 'Gender' },
      { key: 'template_category_title', label: 'Category Title', type: 'text', defaultValue: 'Category' },
      { key: 'template_size_title', label: 'Size Title', type: 'text', defaultValue: 'Size' },
      { key: 'template_price_title', label: 'Price Title', type: 'text', defaultValue: 'Price (max)' },
      { key: 'template_price_any', label: 'Price Option: Any', type: 'text', defaultValue: 'Any' },
      { key: 'template_price_6000', label: 'Price Option: 6,000', type: 'text', defaultValue: 'Up to 6,000 DZD' },
      { key: 'template_price_12000', label: 'Price Option: 12,000', type: 'text', defaultValue: 'Up to 12,000 DZD' },
      { key: 'template_price_20000', label: 'Price Option: 20,000', type: 'text', defaultValue: 'Up to 20,000 DZD' },
      { key: 'template_top_kicker', label: 'Top Kicker', type: 'text', defaultValue: 'All items' },
      { key: 'template_catalog_title', label: 'Catalog Title', type: 'text', defaultValue: 'Catalog' },
      { key: 'template_items_suffix', label: 'Items Suffix', type: 'text', defaultValue: 'items' },
      { key: 'template_wishlist_suffix', label: 'Wishlist Suffix', type: 'text', defaultValue: 'Wishlist:' },
      { key: 'template_sort_featured', label: 'Sort: Featured', type: 'text', defaultValue: 'Featured' },
      { key: 'template_sort_low_high', label: 'Sort: Low to High', type: 'text', defaultValue: 'Price: Low to High' },
      { key: 'template_sort_high_low', label: 'Sort: High to Low', type: 'text', defaultValue: 'Price: High to Low' },
      { key: 'template_sort_new_arrivals', label: 'Sort: New arrivals', type: 'text', defaultValue: 'New arrivals' },
      { key: 'template_add_to_bag_label', label: 'Add To Bag Label', type: 'text', defaultValue: 'Add to bag' },
      { key: 'template_genders', label: 'Genders (comma-separated)', type: 'text', defaultValue: 'All, Men, Women, Unisex' },
      { key: 'template_sizes', label: 'Sizes (comma-separated)', type: 'text', defaultValue: 'All, XS, S, M, L, XL' },
    ],
  },
  {
    title: 'Fashion2: Footer',
    fields: [
      { key: 'template_footer_suffix', label: 'Footer Suffix', type: 'text', defaultValue: 'Fashion store' },
      { key: 'template_footer_links', label: 'Footer Links (comma-separated)', type: 'text', defaultValue: 'Lookbook, Shipping, Returns' },
    ],
  },
] as const;
