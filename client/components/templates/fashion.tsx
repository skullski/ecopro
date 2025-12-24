import React, { useState, useMemo } from 'react';
import { TemplateProps } from '@/pages/storefront/templates/types';
import { useTemplateSettings } from '@/hooks/useTemplateData';

export default function FashionTemplate(props: TemplateProps) {
  const { navigate, storeSlug } = props;
  const [activeGender, setActiveGender] = useState('Women');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [fitFilter, setFitFilter] = useState('All');

  // Read universal settings from window
  const universalSettings = useTemplateSettings() || {};

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

  const products = props.products || [];
  const settings = props.settings || {};
  
  // Extract universal settings with defaults
  const {
    primary_color = '#f97316',
    secondary_color = '#09090f',
    accent_color = '#fed7aa',
    text_color = '#f0f0f0',
    secondary_text_color = '#a1a1a1',
    font_family = 'Inter',
    heading_size_multiplier = 'Large',
    body_font_size = 15,
    section_padding = 24,
    border_radius = 8,
    enable_dark_mode = true,
    default_theme = 'Dark',
    show_product_shadows = true,
    enable_animations = true,
  } = useMemo(() => universalSettings as any || {}, [universalSettings]);

  const storeName = settings.store_name || 'WardrobeOS';
  const bannerUrl = settings.banner_url || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1600&q=80';
  const heroVideoUrl = settings.hero_video_url || null;

  // Template-specific settings
  const heroHeading = settings.template_hero_heading || 'Build a wardrobe that behaves like software.';
  const heroSubtitle = settings.template_hero_subtitle || 'Fewer pieces, more combinations. Coats, trousers, and layers designed to work in any city, any season.';
  const buttonText = settings.template_button_text || 'Browse collection';
  const heroKicker = (settings as any).template_hero_kicker || 'System wardrobes / 2025';

  const navNew = (settings as any).template_nav_new || 'New';
  const navCollections = (settings as any).template_nav_collections || 'Collections';
  const navBuilder = (settings as any).template_nav_builder || 'Wardrobe builder';
  const accountLabel = (settings as any).template_account_label || 'Account';
  const navBag = (settings as any).template_nav_bag || 'Bag (0)';
  const buyNowLabel = (settings as any).template_buy_now_label || 'Buy Now';
  const gendersList = settings.template_genders ? settings.template_genders.split(',').map((g: string) => g.trim()) : ['Women', 'Men', 'Essentials'];
  const categoryTabs = (settings as any).template_category_tabs
    ? String((settings as any).template_category_tabs)
        .split(',')
        .map((c: string) => c.trim())
        .filter(Boolean)
    : ['All', 'Outerwear', 'Tops', 'Bottoms', 'Footwear'];
  const fitTabs = (settings as any).template_fit_tabs
    ? String((settings as any).template_fit_tabs)
        .split(',')
        .map((f: string) => f.trim())
        .filter(Boolean)
    : ['All', 'Oversized', 'Relaxed', 'Regular', 'Boxy'];
  
  const genders = gendersList;
  const categories = categoryTabs;
  const fits = fitTabs;
  
  // Calculate heading sizes based on multiplier
  const headingSizeMap: Record<string, { h1: string; h2: string }> = {
    Small: { h1: '20px', h2: '16px' },
    Medium: { h1: '28px', h2: '20px' },
    Large: { h1: '32px', h2: '24px' },
  };
  const headingSizes = headingSizeMap[heading_size_multiplier] || headingSizeMap['Large'];

  const looks = useMemo(() => {
    const fallback = [
      { id: 'look1', title: 'Late‑night city layers', caption: 'Wool coat · relaxed trouser · canvas sneaker' },
      { id: 'look2', title: 'Studio uniform', caption: 'Boxy tee · tapered trouser · minimal sneaker' },
      { id: 'look3', title: 'Transit‑ready shell', caption: 'Technical shell · hoodie · soft layers' },
    ];

    const raw = (settings as any).template_looks_json;
    if (!raw) return fallback;
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!Array.isArray(parsed)) return fallback;
      return parsed
        .map((item: any, idx: number) => ({
          id: item?.id || `look${idx + 1}`,
          title: item?.title || fallback[idx]?.title || `Look ${idx + 1}`,
          caption: item?.caption || fallback[idx]?.caption || '',
        }))
        .slice(0, 6);
    } catch {
      return fallback;
    }
  }, [settings]);

  const filteredProducts = products.filter((p: any) => {
    if (activeGender !== 'All' && p.gender !== activeGender) return false;
    if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
    if (fitFilter !== 'All' && p.fit !== fitFilter) return false;
    return true;
  });

  // Compute dynamic styles
  const dynamicStyles = `
    :root {
      --primary-color: ${primary_color};
      --secondary-color: ${secondary_color};
      --accent-color: ${accent_color};
      --text-color: ${text_color};
      --secondary-text-color: ${secondary_text_color};
      --font-family: ${font_family}, system-ui, sans-serif;
      --section-padding: ${section_padding}px;
      --border-radius: ${border_radius}px;
    }
    
    * {
      font-family: var(--font-family);
    }
    
    h1, h2, h3, h4, h5, h6 {
      font-size: ${headingSizes.h1};
    }
    
    button {
      ${enable_animations ? 'transition: all 0.3s ease;' : ''}
      ${show_product_shadows ? '' : 'box-shadow: none !important;'}
    }
  `;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: enable_dark_mode ? '#09090f' : '#f5f5f5',
      color: text_color,
    }}>
      <style>{`
        .hero {
          min-height: 70vh;
          position: relative;
          background-size: cover;
          background-position: center;
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, rgba(5,5,9,0.9), rgba(5,5,9,0.4));
        }
        .carousel::-webkit-scrollbar {
          display: none;
        }
        .carousel {
          scroll-snap-type: x mandatory;
        }
        .carousel-item {
          scroll-snap-align: start;
        }
        .filter-pill {
          border-radius: 999px;
          border: 1px solid ${secondary_text_color};
          padding: 6px 12px;
          font-size: 11px;
          cursor: pointer;
          background: ${secondary_color};
          color: ${secondary_text_color};
          ${enable_animations ? 'transition: all 0.22s ease;' : ''}
        }
        .filter-pill.active {
          border-color: ${primary_color};
          background: rgba(${parseInt(primary_color.slice(1,3), 16)}, ${parseInt(primary_color.slice(3,5), 16)}, ${parseInt(primary_color.slice(5,7), 16)}, 0.16);
          color: ${accent_color};
        }
        .product-card {
          background: ${secondary_color};
          border-radius: ${border_radius}px;
          border: 1px solid ${secondary_text_color};
          overflow: hidden;
          ${enable_animations ? 'transition: 0.22s;' : ''}
        }
        .product-card:hover {
          ${enable_animations ? `transform: translateY(-4px);` : ''}
          border-color: ${primary_color};
          ${show_product_shadows ? `box-shadow: 0 18px 40px rgba(0,0,0,0.7);` : ''}
        }
      `}</style>
      <style>{dynamicStyles}</style>

      {/* HEADER */}
      <header className="sticky top-0 z-20" style={{
        borderBottom: `1px solid ${secondary_text_color}`,
        background: enable_dark_mode ? 'rgba(9, 9, 15, 0.85)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(10px)',
      }}>
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="text-xs tracking-[0.2em] uppercase" style={{ color: text_color }}>
            {storeName}
          </div>
          <nav className="hidden md:flex gap-5 text-[11px]" style={{ color: secondary_text_color }}>
            <button className={`${enable_animations ? 'hover:text-' : ''}`} style={{ color: 'inherit' }}>{navNew}</button>
            <button className={`${enable_animations ? 'hover:text-' : ''}`} style={{ color: 'inherit' }}>{navCollections}</button>
            <button className={`${enable_animations ? 'hover:text-' : ''}`} style={{ color: 'inherit' }}>{navBuilder}</button>
          </nav>
          <div className="flex gap-3 text-[11px]" style={{ color: secondary_text_color }}>
            <span>{accountLabel}</span>
            <span>{navBag}</span>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section
        className="hero"
        style={{ backgroundImage: heroVideoUrl ? 'none' : `url(${bannerUrl})` }}
      >
        {heroVideoUrl && (
          <video
            autoPlay
            muted
            loop
            playsInline
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 0,
            }}
          >
            <source src={heroVideoUrl} type="video/mp4" />
          </video>
        )}
        <div className="hero-overlay"></div>
        <div className="max-w-6xl mx-auto px-6 h-full flex items-end pb-14">
          <div className="max-w-lg">
            <div className="text-[11px] tracking-[0.25em] uppercase mb-2" style={{ color: secondary_text_color }}>
              {heroKicker}
            </div>
            <h1 className="md:text-2xl font-serif font-semibold mb-3" style={{ 
              fontSize: headingSizes.h1,
              color: text_color,
            }}>
              {heroHeading}
            </h1>
            <p className="text-sm max-w-md mb-4" style={{ color: secondary_text_color }}>
              {heroSubtitle}
            </p>
            <button className="text-[11px] uppercase tracking-[0.18em] px-5 py-2 rounded-full font-semibold transition" style={{
              border: `1px solid ${secondary_text_color}`,
              color: primary_color,
              backgroundColor: 'transparent',
            }} 
            onMouseEnter={(e) => enable_animations && Object.assign(e.currentTarget.style, { 
              borderColor: primary_color, 
              backgroundColor: `${primary_color}20` 
            })}
            onMouseLeave={(e) => enable_animations && Object.assign(e.currentTarget.style, { 
              borderColor: secondary_text_color, 
              backgroundColor: 'transparent' 
            })}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </section>

      {/* CATEGORY TABS */}
      <section className="max-w-6xl mx-auto px-6 py-4 md:py-6" style={{ 
        borderBottom: `1px solid ${secondary_text_color}`,
      }}>
        <div className="flex flex-wrap gap-3 text-[11px]">
          {genders.map((g) => (
            <button
              key={g}
              className={`filter-pill ${activeGender === g ? 'active' : ''}`}
              onClick={() => setActiveGender(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </section>

      {/* LOOKS CAROUSEL */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-serif" style={{ color: text_color }}>Looks from this drop</h2>
          <p className="text-[11px]" style={{ color: secondary_text_color }}>
            Scroll horizontally to browse outfits
          </p>
        </div>
        <div className="carousel flex gap-5 overflow-x-auto pb-2">
          {looks.map((look) => (
            <div
              key={look.id}
              className="carousel-item min-w-[260px] max-w-xs rounded-2xl overflow-hidden"
              style={{
                background: secondary_color,
                border: `1px solid ${secondary_text_color}`,
              }}
            >
              <div className="h-40 relative overflow-hidden">
                <img
                  src={bannerUrl}
                  className="w-full h-full object-cover"
                  alt={look.title}
                  style={{ transition: enable_animations ? 'transform 0.3s ease' : 'none' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              </div>
              <div className="p-4">
                <div className="text-[11px] uppercase tracking-[0.18em] mb-1" style={{ color: secondary_text_color }}>
                  Lookbook
                </div>
                <div className="text-sm font-semibold" style={{ color: text_color }}>
                  {look.title}
                </div>
                <p className="text-[11px] mt-1" style={{ color: secondary_text_color }}>
                  {look.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FILTER BAR */}
      <section className="max-w-6xl mx-auto px-6 pb-4">
        <div className="flex flex-wrap gap-3 text-[11px] mb-3">
          {categories.map((c) => (
            <button
              key={c}
              className={`filter-pill ${categoryFilter === c ? 'active' : ''}`}
              onClick={() => setCategoryFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 text-[11px]">
          {fits.map((f) => (
            <button
              key={f}
              className={`filter-pill ${fitFilter === f ? 'active' : ''}`}
              onClick={() => setFitFilter(f)}
            >
              {f} fit
            </button>
          ))}
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif" style={{ color: text_color }}>
            Pieces for {activeGender.toLowerCase()}.
          </h2>
          <span className="text-[11px]" style={{ color: secondary_text_color }}>
            {filteredProducts.length} items
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {filteredProducts.map((p: any) => (
            <div 
              key={p.id} 
              className="product-card cursor-pointer flex flex-col"
              onClick={() => handleProductClick(p)}
              style={{ 
                cursor: 'pointer',
                transform: enable_animations ? 'translateZ(0)' : 'none',
              }}
            >
              <div className="relative h-64 overflow-hidden" style={{ borderRadius: `${border_radius}px` }}>
                <img
                  src={p.images?.[0] || bannerUrl}
                  alt={p.title}
                  className="w-full h-full object-cover"
                  style={{ 
                    transition: enable_animations ? 'transform 0.3s ease' : 'none',
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.18em] px-3 py-1 rounded-full" style={{
                  border: `1px solid ${secondary_text_color}`,
                  background: enable_dark_mode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)',
                  color: text_color,
                }}>
                  {p.category || 'Category'}
                </div>
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold" style={{ color: text_color }}>
                    {p.title}
                  </h3>
                  <span className="text-xs" style={{ color: secondary_text_color }}>{p.gender || 'All'}</span>
                </div>
                <p className="text-[11px] mb-2" style={{ color: secondary_text_color }}>
                  {p.fit || 'Regular'} · {p.color || 'Color'}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-sm font-semibold" style={{ color: primary_color }}>
                    {props.formatPrice(p.price)}
                  </span>
                  <button 
                    onClick={(e) => handleBuyClick(p, e)}
                    className="text-[11px] uppercase tracking-[0.16em] px-4 py-2 rounded-full font-semibold transition"
                    style={{
                      border: `1px solid ${primary_color}`,
                      background: primary_color,
                      color: secondary_color,
                    }}
                    onMouseEnter={(e) => enable_animations && Object.assign(e.currentTarget.style, {
                      opacity: '0.8',
                      transform: 'scale(1.05)',
                    })}
                    onMouseLeave={(e) => enable_animations && Object.assign(e.currentTarget.style, {
                      opacity: '1',
                      transform: 'scale(1)',
                    })}
                  >
                    {buyNowLabel}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export const TEMPLATE_EDITOR_SECTIONS = [
  {
    title: 'Fashion: Header & Labels',
    fields: [
      { key: 'template_nav_new', label: 'Nav: New', type: 'text', defaultValue: 'New' },
      { key: 'template_nav_collections', label: 'Nav: Collections', type: 'text', defaultValue: 'Collections' },
      { key: 'template_nav_builder', label: 'Nav: Builder', type: 'text', defaultValue: 'Wardrobe builder' },
      { key: 'template_account_label', label: 'Account Label', type: 'text', defaultValue: 'Account' },
      { key: 'template_nav_bag', label: 'Nav: Bag', type: 'text', defaultValue: 'Bag (0)' },
      { key: 'template_hero_kicker', label: 'Hero Kicker', type: 'text', defaultValue: 'System wardrobes / 2025' },
      { key: 'template_buy_now_label', label: 'Buy Now Label', type: 'text', defaultValue: 'Buy Now' },
    ],
  },
  {
    title: 'Fashion: Filters',
    fields: [
      {
        key: 'template_genders',
        label: 'Gender Tabs (comma-separated)',
        type: 'text',
        placeholder: 'Women,Men,Essentials',
        defaultValue: 'Women, Men, Essentials',
      },
      {
        key: 'template_category_tabs',
        label: 'Category Tabs (comma-separated)',
        type: 'text',
        defaultValue: 'All, Outerwear, Tops, Bottoms, Footwear',
      },
      {
        key: 'template_fit_tabs',
        label: 'Fit Tabs (comma-separated)',
        type: 'text',
        defaultValue: 'All, Oversized, Relaxed, Regular, Boxy',
      },
    ],
  },
  {
    title: 'Fashion: Looks',
    fields: [
      {
        key: 'template_looks_json',
        label: 'Looks (JSON array)',
        type: 'textarea',
        defaultValue: JSON.stringify(
          [
            { id: 'look1', title: 'Late‑night city layers', caption: 'Wool coat · relaxed trouser · canvas sneaker' },
            { id: 'look2', title: 'Studio uniform', caption: 'Boxy tee · tapered trouser · minimal sneaker' },
            { id: 'look3', title: 'Transit‑ready shell', caption: 'Technical shell · hoodie · soft layers' },
          ],
          null,
          2
        ),
      },
    ],
  },
] as const;
