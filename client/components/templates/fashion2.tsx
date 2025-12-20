import React, { useState, useMemo } from 'react';
import { TemplateProps } from '@/pages/storefront/templates/types';
import { useTemplateUniversalSettings } from '@/hooks/useTemplateUniversalSettings';

export default function Fashion2Template(props: TemplateProps) {
  const { navigate, storeSlug } = props;
  const [bagCount, setBagCount] = useState(0);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);

  // Read universal settings from window
  const universalSettings = useTemplateUniversalSettings() || {};

  // Helper functions to save product data and navigate
  const handleProductClick = (product: any) => {
    localStorage.setItem(`product_${product.id}`, JSON.stringify(product));
    navigate(`/product/${product.id}`);
  };

  const handleBuyClick = (product: any, e?: any) => {
    if (e) e.stopPropagation();
    localStorage.setItem(`product_${product.id}`, JSON.stringify(product));
    navigate(`/checkout/${product.id}`);
  };

  const { products = [], settings = {}, categories = [] } = props;
  
  // Extract universal settings with defaults
  const {
    primary_color = '#000000',
    secondary_color = '#f5f5f5',
    accent_color = '#1f2937',
    text_color = '#1f2937',
    secondary_text_color = '#6b7280',
    font_family = 'Inter',
    heading_size_multiplier = 'Large',
    body_font_size = 15,
    section_padding = 24,
    border_radius = 8,
    enable_dark_mode = false,
    default_theme = 'Light',
    show_product_shadows = true,
    enable_animations = true,
  } = useMemo(() => universalSettings as any || {}, [universalSettings]);
  
  const storeName = settings.store_name || 'LineaWear';
  const city = settings.store_description?.split('·')[0] || 'Algiers';
  const tagline = settings.template_hero_subtitle || 'Modern Fashion';
  const heroHeading = settings.template_hero_heading || 'Build a fashion store that feels like a campaign';
  const buttonText = settings.template_button_text || 'Shop Now';

  const genders = ['All', 'Men', 'Women', 'Unisex'];
  const sizes = ['All', 'XS', 'S', 'M', 'L', 'XL'];
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
    <div className="min-h-screen" style={{ backgroundColor: secondary_color }}>
      <div className="fixed bottom-6 right-6 z-40">
        <button style={{ backgroundColor: primary_color, color: secondary_color }} className="rounded-full font-semibold px-5 py-3 flex items-center gap-2 shadow-lg">
          Bag <span style={{ backgroundColor: secondary_color, color: primary_color }} className="w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold">{bagCount}</span>
        </button>
      </div>

      <header className="bg-white/90 backdrop-blur border-b sticky top-0 z-40" style={{ borderBottomColor: secondary_text_color }}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div style={{ backgroundColor: primary_color, color: secondary_color }} className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold">LW</div>
              <div>
                <h1 className="font-serif text-xl font-semibold" style={{ color: text_color }}>{storeName}</h1>
                <p className="text-xs" style={{ color: secondary_text_color }}>Men · Women · Street · Tailored</p>
              </div>
            </div>
            <div className="hidden md:flex flex-1 mx-6">
              <input
                type="text"
                placeholder="Search jackets, cargos, sneakers..."
                value={props.searchQuery || ''}
                onChange={(e) => props.setSearchQuery(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <div><span className="font-semibold">Wishlist</span> {wishlist.length}</div>
              <div className="text-xs text-gray-500">{city}</div>
            </div>
          </div>
        </div>
      </header>

      <section className="border-b" style={{ borderColor: secondary_text_color, backgroundColor: secondary_color }}>
        <div className="max-w-6xl mx-auto px-6 py-4 md:py-6">
          <div className="mb-6">
            <span className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-3" style={{ backgroundColor: accent_color, color: secondary_color }}>Season Drop · Fashion Store</span>
            <h2 className="font-serif text-xl md:text-2xl font-semibold mb-3 max-w-2xl" style={{ color: text_color }}>{settings.template_hero_heading || 'Build a fashion store that feels like a campaign'}</h2>
            <p className="text-sm max-w-xl" style={{ color: secondary_text_color }}>{settings.template_hero_subtitle || 'Push your key pieces first'}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.9fr] gap-3 md:gap-4">
            <div className="relative rounded-2xl overflow-hidden" style={{ border: `1px solid ${secondary_text_color}30`, backgroundColor: secondary_color, borderRadius: `${border_radius}px` }}>
              <img
                src={settings.banner_url || 'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?auto=format&fit=crop&w=1200&q=80'}
                alt="Hero"
                className="w-full h-96 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4" style={{ backgroundColor: `${primary_color}B3`, color: secondary_color }}>
                <div className="text-sm font-semibold">{settings.template_hero_heading || 'Featured Collection'}</div>
                <div className="text-xs text-gray-300">{settings.template_button_text || 'Shop Now'}</div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {products.slice(0, 2).map((p: any) => (
                <div key={p.id} className="relative rounded-2xl overflow-hidden" style={{ border: `1px solid ${secondary_text_color}30`, backgroundColor: secondary_color, borderRadius: `${border_radius}px` }}>
                  <img
                    src={p.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80'}
                    alt={p.title}
                    className="w-full h-44 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-3" style={{ backgroundColor: `${primary_color}B3`, color: secondary_color }}>
                    <div className="text-sm font-semibold line-clamp-1">{p.title}</div>
                    <div className="text-xs text-gray-300">{p.price} DZD</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 py-4 md:py-6">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 md:gap-3 md:gap-4">
          <aside className="rounded-2xl p-4 h-fit" style={{ backgroundColor: secondary_color, border: `1px solid ${secondary_text_color}30`, borderRadius: `${border_radius}px` }}>
            <div className="text-sm font-semibold mb-4" style={{ color: text_color }}>Filters</div>
            <div className="mb-5">
              <label className="text-xs font-bold uppercase block mb-2" style={{ color: secondary_text_color }}>Gender</label>
              <div className="space-y-2">
                {genders.map(g => (
                  <button key={g} className="block text-sm w-full text-left px-3 py-2 rounded hover:bg-gray-100">
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-5">
              <label className="text-xs font-bold uppercase block mb-2" style={{ color: secondary_text_color }}>Category</label>
              <div className="space-y-2">
                {categoryList.map(cat => (
                  <button key={cat} className="block text-sm w-full text-left px-3 py-2 rounded hover:bg-gray-100">
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-5">
              <label className="text-xs font-bold uppercase block mb-2" style={{ color: secondary_text_color }}>Size</label>
              <div className="flex flex-wrap gap-2">
                {sizes.map(s => (
                  <button key={s} className="text-xs px-3 py-1 rounded-full border border-gray-200 hover:bg-gray-100">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section>
            <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: `1px solid ${secondary_text_color}30` }}>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: text_color }}>{filteredProducts.length} Items</h3>
                <p className="text-xs" style={{ color: secondary_text_color }}>{wishlist.length} Wishlisted</p>
              </div>
              <select value={props.sortOption} onChange={(e) => props.setSortOption(e.target.value as any)} className="text-xs rounded-full px-3 py-2" style={{ border: `1px solid ${secondary_text_color}40`, color: text_color, backgroundColor: secondary_color, borderRadius: `${border_radius}px` }}>
                <option>Featured</option>
                <option>Price Low-High</option>
                <option>Price High-Low</option>
                <option>Newest</option>
              </select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map((p: any) => (
                <div 
                  key={p.id} 
                  className="rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer group flex flex-col"
                  style={{ backgroundColor: secondary_color, border: `1px solid ${secondary_text_color}30`, borderRadius: `${border_radius}px` }}
                  onClick={() => navigate(p.slug && p.slug.length > 0 ? `/store/${storeSlug}/${p.slug}` : `/product/${p.id}`)}
                >
                  <div className="relative h-64 bg-gray-100 overflow-hidden flex-grow">
                    <img src={p.images?.[0] || 'https://via.placeholder.com/400'} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id); }} className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition" style={{ backgroundColor: wishlist.includes(p.id) ? primary_color : secondary_color, color: wishlist.includes(p.id) ? secondary_color : primary_color, border: wishlist.includes(p.id) ? 'none' : `1px solid ${secondary_text_color}30`, borderRadius: '50%' }}>
                        ♥
                      </button>
                    </div>
                  </div>
                  <div className="p-3 flex flex-col">
                    <p className="font-semibold text-sm line-clamp-2" style={{ color: text_color }}>{p.title}</p>
                    <p className="text-xs mt-1" style={{ color: secondary_text_color }}>{p.category}</p>
                    <p className="font-bold text-sm mt-2" style={{ color: primary_color }}>{p.price} DZD</p>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        navigate(`/checkout/${p.id}`);
                      }} 
                      className="w-full mt-3 py-2 text-xs font-semibold transition"
                      style={{ backgroundColor: primary_color, color: secondary_color, borderRadius: `${border_radius}px` }}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="mt-6 md:mt-4 md:mt-6 py-4 md:py-6" style={{ borderTop: `1px solid ${secondary_text_color}30`, backgroundColor: secondary_color }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-3 md:gap-4 md:gap-4 md:gap-3 md:gap-4 mb-6 md:mb-4 md:mb-6">
            <div>
              <h4 className="font-semibold mb-3" style={{ color: text_color }}>About</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="transition" style={{ color: secondary_text_color }} onMouseEnter={(e) => e.currentTarget.style.color = text_color} onMouseLeave={(e) => e.currentTarget.style.color = secondary_text_color}>About Us</a></li>
                <li><a href="#" className="transition" style={{ color: secondary_text_color }} onMouseEnter={(e) => e.currentTarget.style.color = text_color} onMouseLeave={(e) => e.currentTarget.style.color = secondary_text_color}>Stories</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3" style={{ color: text_color }}>Support</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="transition" style={{ color: secondary_text_color }} onMouseEnter={(e) => e.currentTarget.style.color = text_color} onMouseLeave={(e) => e.currentTarget.style.color = secondary_text_color}>Contact</a></li>
                <li><a href="#" className="transition" style={{ color: secondary_text_color }} onMouseEnter={(e) => e.currentTarget.style.color = text_color} onMouseLeave={(e) => e.currentTarget.style.color = secondary_text_color}>Shipping</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3" style={{ color: text_color }}>Legal</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="transition" style={{ color: secondary_text_color }} onMouseEnter={(e) => e.currentTarget.style.color = text_color} onMouseLeave={(e) => e.currentTarget.style.color = secondary_text_color}>Privacy</a></li>
                <li><a href="#" className="transition" style={{ color: secondary_text_color }} onMouseEnter={(e) => e.currentTarget.style.color = text_color} onMouseLeave={(e) => e.currentTarget.style.color = secondary_text_color}>Terms</a></li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-center" style={{ color: secondary_text_color }}>&copy; 2024 {storeName}</p>
        </div>
      </footer>
    </div>
  );
}
