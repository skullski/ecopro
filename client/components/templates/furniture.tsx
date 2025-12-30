import React, { useState, useMemo } from 'react';
import { TemplateProps } from '@/pages/storefront/templates/types';
import { useTemplateUniversalSettings } from '@/hooks/useTemplateUniversalSettings';
import { coerceSilverImageBlocks } from '@/lib/silverBlocks';

export default function FurnitureTemplate(props: TemplateProps) {
  const universalSettings = useTemplateUniversalSettings();
  const { navigate, storeSlug } = props;
  const [cartCount, setCartCount] = useState(0);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [compareList, setCompareList] = useState<number[]>([]);
  const [visibleCount, setVisibleCount] = useState(8);
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
  const [filters, setFilters] = useState({ category: 'all', maxPrice: 999999, subcategories: [] });

  const { products = [], settings = {}, categories = [] } = props;

  const silverHeaderBlocks = useMemo(
    () => coerceSilverImageBlocks((settings as any).silver_header_blocks),
    [settings]
  );
  const silverFooterBlocks = useMemo(
    () => coerceSilverImageBlocks((settings as any).silver_footer_blocks),
    [settings]
  );
  const templateSettings = settings as any;
  
  // Extract universal settings with defaults
  const {
    primary_color = '#111827',
    secondary_color = '#f3f4f6',
    accent_color = '#1f2937',
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
  
  const storeName = templateSettings.store_name || 'RoomGrid';
  const storeInitials = templateSettings.store_initials || String(storeName).slice(0, 2).toUpperCase();
  const logoUrl = templateSettings.store_logo || templateSettings.logo_url || '';

  const floatingCartLabel = templateSettings.template_floating_cart_label || 'Cart';
  const headerTagline = templateSettings.template_header_tagline || 'Furniture · Decor · Storage · Lighting';
  const searchPlaceholder = templateSettings.template_search_placeholder || 'Search furniture...';
  const wishlistLabel = templateSettings.template_wishlist_label || 'Wishlist';
  const compareLabel = templateSettings.template_compare_label || 'Compare';
  const cartLabel = templateSettings.template_cart_label || 'Cart';

  const navRoomsLabel = templateSettings.template_nav_rooms_label || 'Shop by Room';
  const roomMenu = templateSettings.template_room_menu
    ? String(templateSettings.template_room_menu)
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)
    : ['Living Room', 'Bedroom', 'Office', 'Dining'];

  const heroHeading = templateSettings.template_hero_heading || 'Furniture Collection';
  const heroSubtitle = templateSettings.template_hero_subtitle || 'Modern, timeless pieces for every room';

  const filtersTitle = templateSettings.template_filters_title || 'Filters';
  const priceLabel = templateSettings.template_price_label || 'Price';
  const priceUpToLabel = templateSettings.template_price_upto_label || 'Up to';
  const categoryLabel = templateSettings.template_category_label || 'Category';
  const categoryOptions = templateSettings.template_category_options
    ? String(templateSettings.template_category_options)
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)
    : ['All', 'Living Room', 'Bedroom', 'Office', 'Dining'];

  const itemsLabel = templateSettings.template_items_label || 'Items';
  const wishlistedLabel = templateSettings.template_wishlisted_label || 'Wishlisted';
  const comparingLabel = templateSettings.template_comparing_label || 'Comparing';

  const sortFeatured = templateSettings.template_sort_featured || 'Featured';
  const sortPriceLowHigh = templateSettings.template_sort_price_low_high || 'Price Low-High';
  const sortPriceHighLow = templateSettings.template_sort_price_high_low || 'Price High-Low';
  const sortNewest = templateSettings.template_sort_newest || 'Newest';

  const buyNowLabel = templateSettings.template_buy_now_label || 'Buy Now';
  const loadMoreLabel = templateSettings.template_load_more_label || 'Load More';

  const footerColumns = templateSettings.template_footer_columns
    ? String(templateSettings.template_footer_columns)
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)
    : ['About', 'Support', 'Legal', 'Social'];
  const footerLink1 = templateSettings.template_footer_link_1 || 'Link 1';
  const footerLink2 = templateSettings.template_footer_link_2 || 'Link 2';
  const footerYear = templateSettings.template_footer_year || String(new Date().getFullYear());

  const filteredProducts = products.slice(0, visibleCount);
  const canLoadMore = visibleCount < products.length;

  const toggleWishlist = (id: number) => {
    setWishlist(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const toggleCompare = (id: number) => {
    setCompareList(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: secondary_color }}>
      {silverHeaderBlocks.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 pt-4">
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
                  className="w-full h-32 object-cover rounded-lg"
                />
              ))}
          </div>
        </div>
      )}
      <style>{dynamicStyles}</style>
      {/* Floating Cart */}
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40">
        <button style={{ backgroundColor: primary_color, color: secondary_color }} className="rounded-full font-semibold px-3 py-2 md:px-5 md:py-3 flex items-center gap-2 shadow-lg text-xs md:text-sm">
          {floatingCartLabel}{' '}
          <span style={{ backgroundColor: secondary_color, color: primary_color }} className="w-5 h-5 md:w-6 md:h-6 rounded-full text-[10px] md:text-xs flex items-center justify-center font-bold">{cartCount}</span>
        </button>
      </div>

      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40" style={{ borderBottomColor: secondary_text_color }}>
        <div className="max-w-6xl mx-auto px-3 md:px-6 py-2 md:py-3">
          <div className="flex items-center justify-between gap-2 md:gap-4 mb-2 md:mb-3">
            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-shrink-0">
              <div style={{ backgroundColor: primary_color, color: secondary_color }} className="w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center text-[10px] md:text-xs font-bold overflow-hidden flex-shrink-0">
                {logoUrl ? (
                  <img src={logoUrl} alt={`${storeName} logo`} className="w-full h-full object-contain" />
                ) : (
                  storeInitials
                )}
              </div>
              <div className="min-w-0">
                <h1 data-edit-path="__settings.store_name" className="text-xs md:text-sm font-semibold truncate" style={{ color: text_color }}>{storeName}</h1>
                <p data-edit-path="__settings.template_header_tagline" className="text-[10px] md:text-xs truncate hidden sm:block" style={{ color: secondary_text_color }}>{headerTagline}</p>
              </div>
            </div>
            <input type="text" placeholder={searchPlaceholder} className="hidden lg:block flex-1 mx-4 text-sm border rounded-full px-4 py-2" style={{ borderColor: secondary_text_color, backgroundColor: secondary_color, color: text_color }} />
            <div className="flex items-center gap-2 md:gap-4 text-[10px] md:text-xs whitespace-nowrap flex-shrink-0" style={{ color: secondary_text_color }}>
              <span className="hidden sm:inline">{wishlistLabel} {wishlist.length}</span>
              <span className="hidden md:inline">{compareLabel} {compareList.length}</span>
              <span>{cartLabel} {cartCount}</span>
            </div>
          </div>

          {/* Navigation + Mega Menu */}
          <div className="flex items-center gap-4 text-xs md:text-sm py-1.5 md:py-2 border-t" style={{ borderTopColor: secondary_text_color }}>
            <div className="relative group">
              <button className="flex items-center gap-1" style={{ color: text_color }}>
                <span className="truncate">{navRoomsLabel}</span>
                <span>▾</span>
              </button>
              <div className="absolute left-0 hidden group-hover:block w-48 md:w-80 bg-white border rounded-lg shadow-lg p-2 md:p-4 z-50" style={{ borderColor: secondary_text_color, backgroundColor: secondary_color }}>
                {roomMenu.map((cat: string) => (
                  <div key={cat} onClick={() => setActiveCategory(cat.toLowerCase())} className="px-2 md:px-3 py-1.5 md:py-2 hover:bg-gray-100 rounded cursor-pointer text-xs md:text-sm" style={{ color: text_color }}>
                    {cat}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="py-4 md:py-6" style={{ backgroundColor: secondary_text_color, color: secondary_color }}>
        <div className="max-w-6xl mx-auto px-3 md:px-6">
          <h2 data-edit-path="__settings.template_hero_heading" className="font-serif text-lg md:text-xl lg:text-2xl font-semibold mb-2 md:mb-3" style={{ color: text_color }}>{heroHeading}</h2>
          <p data-edit-path="__settings.template_hero_subtitle" className="text-xs md:text-sm" style={{ color: secondary_text_color }}>{heroSubtitle}</p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-3 md:px-6 py-4 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4 md:gap-6">
          {/* Filters Sidebar - Hidden on mobile by default */}
          <aside className="hidden lg:block bg-white rounded-lg border border-gray-200 p-4 h-fit sticky top-20">
            <h3 className="text-sm font-semibold mb-4 text-gray-900">{filtersTitle}</h3>

            {/* Price Filter */}
            <div className="mb-6">
              <label className="text-xs font-bold text-gray-700 uppercase block mb-2">{priceLabel}</label>
              <input
                type="range"
                min="0"
                max="100000"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                className="w-full"
              />
              <div className="text-xs text-gray-600 mt-2">{priceUpToLabel} {filters.maxPrice} DZD</div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase block mb-2">{categoryLabel}</label>
              <div className="space-y-2">
                {categoryOptions.map((cat: string) => (
                  <label key={cat} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" className="w-4 h-4" />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 md:mb-6 pb-3 md:pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 whitespace-nowrap">{filteredProducts.length} {itemsLabel}</h3>
                <p className="text-[10px] md:text-xs text-gray-600 whitespace-nowrap">{wishlist.length} {wishlistedLabel} · {compareList.length} {comparingLabel}</p>
              </div>
              <select className="text-[10px] md:text-xs border border-gray-300 rounded-full px-2 md:px-3 py-1.5 md:py-2 bg-white self-start sm:self-auto">
                <option>{sortFeatured}</option>
                <option>{sortPriceLowHigh}</option>
                <option>{sortPriceHighLow}</option>
                <option>{sortNewest}</option>
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-4">
              {filteredProducts.map((p: any) => (
                <div 
                  key={p.id} 
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition group cursor-pointer flex flex-col"
                  onClick={() => navigate(p.slug && p.slug.length > 0 ? `/store/${storeSlug}/${p.slug}` : `/product/${p.id}`)}
                >
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    <img src={p.images?.[0] || 'https://via.placeholder.com/400'} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  </div>
                  <div className="p-2 md:p-3 lg:p-4 flex flex-col flex-grow">
                    <p className="font-semibold text-[11px] md:text-xs lg:text-sm text-gray-900 line-clamp-2 leading-tight">{p.title}</p>
                    <p className="text-[9px] md:text-[10px] lg:text-xs text-gray-500 mt-0.5">{p.category}</p>
                    <p className="font-bold text-xs md:text-sm lg:text-base text-gray-900 mt-1 md:mt-2">{p.price} DZD</p>
                    <div className="flex gap-1 mt-2 md:mt-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(p.id);
                        }} 
                        className={`w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-[10px] md:text-xs rounded flex-shrink-0 ${wishlist.includes(p.id) ? 'bg-gray-900 text-white' : 'border border-gray-300 text-gray-600'}`}
                      >
                        ♥
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCompare(p.id);
                        }} 
                        className={`w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-[10px] md:text-xs rounded flex-shrink-0 ${compareList.includes(p.id) ? 'bg-gray-900 text-white' : 'border border-gray-300 text-gray-600'}`}
                      >
                        ⚖
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          const slug = p.slug || p.id;
                          navigate(storeSlug ? `/store/${storeSlug}/${slug}` : `/product/${p.id}`);
                        }} 
                        className="flex-1 h-7 md:h-8 bg-gray-900 text-white text-[9px] md:text-[10px] lg:text-xs rounded font-semibold hover:bg-gray-800 whitespace-nowrap px-1"
                      >
                        {buyNowLabel}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {canLoadMore && (
              <div className="mt-4 md:mt-6 text-center">
                <button onClick={() => setVisibleCount(c => c + 8)} className="px-4 md:px-6 py-2 md:py-3 border border-gray-300 rounded-full text-gray-700 hover:border-gray-900 font-semibold text-xs md:text-sm">
                  {loadMoreLabel}
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-4 md:mt-6 py-4 md:py-6 bg-white">
        <div className="max-w-6xl mx-auto px-3 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-4 md:mb-6">
            {footerColumns.slice(0, 4).map((col: string) => (
              <div key={col}>
                <h4 className="font-semibold text-gray-900 text-sm mb-2 md:mb-3">{col}</h4>
                <ul className="text-xs md:text-sm text-gray-600 space-y-1.5 md:space-y-2">
                  <li><a href="#" className="hover:text-gray-900">{footerLink1}</a></li>
                  <li><a href="#" className="hover:text-gray-900">{footerLink2}</a></li>
                </ul>
              </div>
            ))}
          </div>
          <p className="text-[10px] md:text-xs text-gray-600 text-center">&copy; {footerYear} {storeName}</p>
        </div>
      </footer>

      {silverFooterBlocks.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 py-4">
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
                  className="w-full h-32 object-cover rounded-lg"
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
    title: 'Furniture: Header',
    fields: [
      { key: 'store_initials', label: 'Logo Initials', type: 'text', defaultValue: 'RG' },
      { key: 'template_floating_cart_label', label: 'Floating Cart Label', type: 'text', defaultValue: 'Cart' },
      { key: 'template_header_tagline', label: 'Header Tagline', type: 'text', defaultValue: 'Furniture · Decor · Storage · Lighting' },
      { key: 'template_search_placeholder', label: 'Search Placeholder', type: 'text', defaultValue: 'Search furniture...' },
      { key: 'template_wishlist_label', label: 'Wishlist Label', type: 'text', defaultValue: 'Wishlist' },
      { key: 'template_compare_label', label: 'Compare Label', type: 'text', defaultValue: 'Compare' },
      { key: 'template_cart_label', label: 'Cart Label', type: 'text', defaultValue: 'Cart' },
      { key: 'template_nav_rooms_label', label: 'Rooms Menu Label', type: 'text', defaultValue: 'Shop by Room' },
      { key: 'template_room_menu', label: 'Rooms Menu Items (comma-separated)', type: 'text', defaultValue: 'Living Room, Bedroom, Office, Dining' },
    ],
  },
  {
    title: 'Furniture: Hero',
    fields: [
      { key: 'template_hero_heading', label: 'Hero Heading', type: 'text', defaultValue: 'Furniture Collection' },
      { key: 'template_hero_subtitle', label: 'Hero Subtitle', type: 'text', defaultValue: 'Modern, timeless pieces for every room' },
    ],
  },
  {
    title: 'Furniture: Filters & Labels',
    fields: [
      { key: 'template_filters_title', label: 'Filters Title', type: 'text', defaultValue: 'Filters' },
      { key: 'template_price_label', label: 'Price Label', type: 'text', defaultValue: 'Price' },
      { key: 'template_price_upto_label', label: 'Price Up To Label', type: 'text', defaultValue: 'Up to' },
      { key: 'template_category_label', label: 'Category Label', type: 'text', defaultValue: 'Category' },
      { key: 'template_category_options', label: 'Category Options (comma-separated)', type: 'text', defaultValue: 'All, Living Room, Bedroom, Office, Dining' },
      { key: 'template_items_label', label: 'Items Label', type: 'text', defaultValue: 'Items' },
      { key: 'template_wishlisted_label', label: 'Wishlisted Label', type: 'text', defaultValue: 'Wishlisted' },
      { key: 'template_comparing_label', label: 'Comparing Label', type: 'text', defaultValue: 'Comparing' },
      { key: 'template_sort_featured', label: 'Sort: Featured', type: 'text', defaultValue: 'Featured' },
      { key: 'template_sort_price_low_high', label: 'Sort: Price Low-High', type: 'text', defaultValue: 'Price Low-High' },
      { key: 'template_sort_price_high_low', label: 'Sort: Price High-Low', type: 'text', defaultValue: 'Price High-Low' },
      { key: 'template_sort_newest', label: 'Sort: Newest', type: 'text', defaultValue: 'Newest' },
      { key: 'template_buy_now_label', label: 'Buy Now Label', type: 'text', defaultValue: 'Buy Now' },
      { key: 'template_load_more_label', label: 'Load More Label', type: 'text', defaultValue: 'Load More' },
    ],
  },
  {
    title: 'Furniture: Footer',
    fields: [
      { key: 'template_footer_columns', label: 'Footer Columns (comma-separated)', type: 'text', defaultValue: 'About, Support, Legal, Social' },
      { key: 'template_footer_link_1', label: 'Footer Link 1 Label', type: 'text', defaultValue: 'Link 1' },
      { key: 'template_footer_link_2', label: 'Footer Link 2 Label', type: 'text', defaultValue: 'Link 2' },
      { key: 'template_footer_year', label: 'Footer Year', type: 'text', defaultValue: String(new Date().getFullYear()) },
    ],
  },
] as const;
