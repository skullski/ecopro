import React, { useState, useMemo } from 'react';
import { TemplateProps } from '@/pages/storefront/templates/types';
import { useTemplateUniversalSettings } from '@/hooks/useTemplateUniversalSettings';

export default function BagsTemplate(props: TemplateProps) {
  const [activeType, setActiveType] = useState('All');
  const { products = [], settings = {}, formatPrice = (p: number) => `${p}`, navigate, storeSlug } = props;
  const templateSettings = settings as any;
  
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

  // Get types from products or use defaults
  const types = ['All', ...new Set(products.map((p: any) => p.category).filter(Boolean))];
  
  const filteredProducts = activeType === 'All' 
    ? products 
    : products.filter((p: any) => p.category === activeType);

  const heroBag = products[0];

  // Extract universal settings with defaults
  const {
    primary_color = '#1F2937',
    secondary_color = '#F3F4F6',
    accent_color = '#000000',
    text_color = '#1F2937',
    secondary_text_color = '#6B7280',
    font_family = 'Inter',
    heading_size_multiplier = 'Large',
    body_font_size = 16,
    grid_columns = 4,
    section_padding = 40,
    border_radius = 8,
    enable_dark_mode = false,
    show_product_shadows = true,
    enable_animations = true,
    store_logo = '',
    logo_url = '',
    logo_width = 120,
    show_featured_section = false,
    featured_product_ids = '',
    show_testimonials = false,
    testimonials = '[]',
    show_faq = false,
    faq_items = '[]',
    footer_about = '',
    social_links = '[]',
    footer_contact = '',
  } = useMemo(() => universalSettings as any || {}, [universalSettings]);

  const resolvedLogoUrl = (settings as any).store_logo || store_logo || logo_url || '';

  // Template-specific settings
  const bgImage = templateSettings.template_bg_image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=2000&q=80';
  const bgBlur = templateSettings.template_hero_bg_blur || 12;
  const heroVideoUrl = templateSettings.hero_video_url || null;
  const heroHeading = templateSettings.template_hero_heading || 'Cold silhouettes,\ncut in leather and light.';
  const heroSubtitle = templateSettings.template_hero_subtitle || 'A focused edit of structured totes, city crossbody bags and evening silhouettes. Built in neutral materials for everyday precision.';

  const navEditorial = templateSettings.template_nav_editorial || 'Editorial';
  const navLeather = templateSettings.template_nav_leather || 'Leather';
  const navMaterials = templateSettings.template_nav_materials || 'Materials';
  const navSearch = templateSettings.template_nav_search || 'Search';
  const navBag = templateSettings.template_nav_bag || 'Bag (0)';

  const heroKicker = templateSettings.template_hero_kicker || 'Bags / Editorial';
  const highlightLabel = templateSettings.template_highlight_label || 'HIGHLIGHT PIECE';

  const chapterLabel = templateSettings.template_chapter_label || 'CHAPTER I';
  const chapterTitle = templateSettings.template_chapter_title || 'Leather silhouettes';
  const chapterText = templateSettings.template_chapter_text || 'Structured lines in cold leather tones. Clean forms with enough volume for the city.';

  const gridKicker = templateSettings.template_grid_kicker || 'PIECES';
  const gridTitle = templateSettings.template_grid_title || 'Bags in this collection';
  const gridCountSuffix = templateSettings.template_grid_count_suffix || 'pieces';

  const buyNowLabel = templateSettings.template_buy_now_label || 'Buy Now';
  const testimonialsTitle = templateSettings.template_testimonials_title || 'What Our Customers Say';
  const faqTitle = templateSettings.template_faq_title || 'Frequently Asked Questions';
  const footerAboutTitle = templateSettings.template_footer_about_title || 'About';
  const footerContactTitle = templateSettings.template_footer_contact_title || 'Contact';
  const footerFollowTitle = templateSettings.template_footer_follow_title || 'Follow';
  const footerRights = templateSettings.template_footer_rights || 'All rights reserved';

  // Calculate heading sizes based on multiplier
  const headingSizeMap: Record<string, { h1: string; h2: string; text: string }> = {
    Small: { h1: '28px', h2: '18px', text: '13px' },
    Medium: { h1: '36px', h2: '22px', text: '15px' },
    Large: { h1: '42px', h2: '26px', text: '16px' },
  };
  const headingSizes = headingSizeMap[heading_size_multiplier] || headingSizeMap['Large'];

  // Parse featured products and testimonials
  const featuredIds = featured_product_ids ? featured_product_ids.split(',').map(id => id.trim()) : [];
  const testimonialsList = useMemo(() => {
    try {
      return show_testimonials ? JSON.parse(testimonials) : [];
    } catch {
      return [];
    }
  }, [show_testimonials, testimonials]);

  const faqList = useMemo(() => {
    try {
      return show_faq ? JSON.parse(faq_items) : [];
    } catch {
      return [];
    }
  }, [show_faq, faq_items]);

  const socialLinksList = useMemo(() => {
    try {
      return JSON.parse(social_links) || [];
    } catch {
      return [];
    }
  }, [social_links]);

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
      ${enable_dark_mode ? 'color-scheme: dark;' : ''}
    }
    
    h1, h2, h3, h4, h5, h6 {
      font-size: ${headingSizes.h1};
    }
    
    body {
      background-color: ${enable_dark_mode ? '#1a1a1a' : secondary_color};
      color: ${enable_dark_mode ? '#f0f0f0' : text_color};
    }
    
    button {
      ${enable_animations ? 'transition: all 0.3s ease;' : ''}
      ${show_product_shadows ? '' : 'box-shadow: none !important;'}
    }
  `;

  return (
    <div 
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        padding: `${section_padding}px`,
        background: enable_dark_mode ? '#1a1a1a' : secondary_color,
      }}
    >
      <style>{dynamicStyles}</style>
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-16" style={{ 
        background: enable_dark_mode ? 'rgba(10, 10, 10, 0.92)' : `rgba(255, 255, 255, 0.92)`, 
        backdropFilter: `blur(${bgBlur}px)`,
        color: text_color,
        borderRadius: `${border_radius}px`,
      }}>
        {/* HEADER */}
        <header className="flex items-center justify-between py-6">
          {resolvedLogoUrl ? (
            <img 
              src={resolvedLogoUrl} 
              alt="Store Logo" 
              style={{ height: '40px', width: 'auto', maxWidth: `${logo_width}px` }}
              className={`${enable_animations ? 'hover:opacity-80 transition-opacity' : ''}`}
            />
          ) : (
            <div className="text-xs tracking-[0.3em] uppercase" style={{ color: secondary_text_color }}>
              {settings.store_name || 'BAGSOS'}
            </div>
          )}
          <nav className="hidden md:flex gap-7 text-xs uppercase tracking-[0.2em]" style={{ color: secondary_text_color }}>
            <button className={`${enable_animations ? 'hover:opacity-100' : ''} transition-opacity`}>{navEditorial}</button>
            <button className={`${enable_animations ? 'hover:opacity-100' : ''} transition-opacity`}>{navLeather}</button>
            <button className={`${enable_animations ? 'hover:opacity-100' : ''} transition-opacity`}>{navMaterials}</button>
          </nav>
          <div className="flex gap-5 text-xs uppercase tracking-[0.18em]" style={{ color: secondary_text_color }}>
            <button className={`${enable_animations ? 'hover:opacity-100' : ''} transition-opacity`}>{navSearch}</button>
            <button className={`${enable_animations ? 'hover:opacity-100' : ''} transition-opacity`}>{navBag}</button>
          </div>
        </header>

        {/* HERO */}
        <section className="grid md:grid-cols-[0.9fr,1.1fr] gap-10 items-end py-10" style={{ paddingLeft: `${section_padding / 2}px`, paddingRight: `${section_padding / 2}px` }}>
          <div>
            <div className="text-xs tracking-[0.24em] uppercase mb-3" style={{ color: secondary_text_color }}>
              {heroKicker}
            </div>
            <h1 className="leading-tight mb-4 font-medium" style={{ fontSize: headingSizes.h1, color: primary_color }}>
              {heroHeading}
            </h1>
            <p className="text-sm max-w-md mb-6" style={{ color: secondary_text_color }}>
              {heroSubtitle}
            </p>
          </div>
          <div className="relative">
            <div style={{ 
              background: secondary_color,
              boxShadow: show_product_shadows ? '0 40px 70px rgba(15, 23, 42, 0.32), 0 6px 18px rgba(15, 23, 42, 0.55)' : 'none',
              borderRadius: `${border_radius}px`,
            }}>
              {heroVideoUrl ? (
                <video 
                  autoPlay
                  muted
                  loop
                  playsInline
                  className={`w-full object-cover ${enable_animations ? 'hover:scale-105 transition-transform' : ''}`}
                  style={{ height: '460px', borderRadius: `${border_radius}px` }}
                >
                  <source src={heroVideoUrl} type="video/mp4" />
                </video>
              ) : (
                <img 
                  src={settings.banner_url || bgImage} 
                  alt="Hero bag" 
                  className={`w-full object-cover ${enable_animations ? 'hover:scale-105 transition-transform' : ''}`}
                  style={{ height: '460px', borderRadius: `${border_radius}px` }}
                />
              )}
            </div>
            {heroBag && (
              <div className="absolute left-6 bottom-6 px-4 py-3" style={{ 
                background: enable_dark_mode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.95)',
                borderRadius: `${border_radius}px`,
                border: `1px solid ${secondary_color}`,
              }}>
                <div className="text-xs tracking-[0.22em] uppercase mb-1" style={{ color: secondary_text_color }}>
                  {highlightLabel}
                </div>
                <div className="text-sm font-medium" style={{ color: primary_color }}>
                  {heroBag.title || 'Featured Bag'}
                </div>
                <div className="text-xs mt-1" style={{ color: secondary_text_color }}>
                  {heroBag.price ? formatPrice(heroBag.price) : '—'} DZD
                </div>
              </div>
            )}
          </div>
        </section>

        {/* FILTERS */}
        <section className="py-4 mb-10" style={{ 
          borderTop: `1px solid ${secondary_text_color}`,
          borderBottom: `1px solid ${secondary_text_color}`,
          paddingLeft: `${section_padding / 2}px`,
          paddingRight: `${section_padding / 2}px`,
        }}>
          <div className="flex flex-wrap gap-3">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-4 py-2 font-medium text-xs tracking-[0.22em] uppercase transition ${enable_animations ? 'hover:scale-105' : ''}`}
                style={{
                  borderRadius: `${border_radius}px`,
                  border: `1px solid ${activeType === type ? primary_color : secondary_text_color}`,
                  background: activeType === type ? primary_color : enable_dark_mode ? '#1a1a1a' : 'rgba(255, 255, 255, 0.7)',
                  color: activeType === type ? secondary_color : secondary_text_color,
                  backdropFilter: 'blur(6px)',
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </section>

        {/* CHAPTER */}
        <section className="py-10 mb-10" style={{ 
          borderBottom: `1px solid ${secondary_text_color}`,
          paddingLeft: `${section_padding / 2}px`,
          paddingRight: `${section_padding / 2}px`,
        }}>
          <div className="grid md:grid-cols-[0.35fr,1.65fr] gap-10 items-start">
            <div className="flex gap-4">
              <div className="w-px bg-gradient-to-b from-gray-400 to-gray-300" style={{ background: `linear-gradient(to bottom, ${primary_color}, ${secondary_text_color})` }} />
              <div>
                <div className="text-xs tracking-[0.24em] uppercase mb-2" style={{ color: secondary_text_color }}>
                  {chapterLabel}
                </div>
                <h2 className="font-medium mb-3" style={{ fontSize: headingSizes.h2, color: primary_color }}>
                  {chapterTitle}
                </h2>
                <p className="text-sm" style={{ color: secondary_text_color }}>
                  {chapterText}
                </p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(3, 1fr)`, gap: `${section_padding / 8}px` }}>
              {products.slice(0, 3).map((bag: any, idx: number) => (
                <div key={bag.id} className="space-y-2 cursor-pointer" onClick={() => handleProductClick(bag)}>
                  <div style={{ 
                    background: secondary_color,
                    boxShadow: show_product_shadows ? '0 32px 60px rgba(80, 60, 40, 0.36), 0 6px 16px rgba(55, 41, 30, 0.8)' : 'none',
                    borderRadius: `${border_radius}px`,
                    overflow: 'hidden',
                    transition: enable_animations ? 'transform 0.3s ease' : 'none',
                  }}>
                    <img
                      src={bag.images?.[0] || 'https://via.placeholder.com/400'}
                      alt={bag.title}
                      className={`w-full object-cover ${enable_animations ? 'hover:scale-110' : ''} transition-transform`}
                      style={{ height: idx === 0 ? '320px' : '260px' }}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium" style={{ color: primary_color }}>
                        {bag.title}
                      </div>
                      <div className="text-xs mt-1 tracking-[0.18em] uppercase" style={{ color: secondary_text_color }}>
                        {bag.category || 'Bag'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm mb-1" style={{ color: primary_color }}>
                        {formatPrice(bag.price)} <span style={{ color: secondary_text_color }}>DZD</span>
                      </div>
                      <button 
                        onClick={(e) => handleBuyClick(bag, e)}
                        className="text-xs px-3 py-1 text-white font-medium transition"
                        style={{
                          background: primary_color,
                          borderRadius: `${border_radius}px`,
                          ...(enable_animations ? { opacity: 1 } : {}),
                        }}
                      >
                        {buyNowLabel}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GRID */}
        <section className="pb-20" style={{ paddingLeft: `${section_padding / 2}px`, paddingRight: `${section_padding / 2}px` }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs tracking-[0.24em] uppercase mb-1" style={{ color: secondary_text_color }}>
                {gridKicker}
              </div>
              <h2 className="text-xl font-medium" style={{ color: primary_color, fontSize: headingSizes.h2 }}>
                {gridTitle}
              </h2>
            </div>
            <div className="text-xs uppercase tracking-[0.18em]" style={{ color: secondary_text_color }}>
              {filteredProducts.length} {gridCountSuffix}
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(auto-fill, minmax(200px, 1fr))`,
            gap: `${section_padding / 10}px`,
          }}>
            {filteredProducts.map((bag: any, index: number) => (
              <div 
                key={bag.id} 
                className={`space-y-2 cursor-pointer ${enable_animations ? 'hover:opacity-80 transition-opacity' : ''}`}
                onClick={() => navigate(bag.slug && bag.slug.length > 0 ? `/store/${storeSlug}/${bag.slug}` : `/product/${bag.id}`)}
              >
                <div style={{ 
                  background: secondary_color,
                  boxShadow: show_product_shadows ? '0 32px 60px rgba(80, 60, 40, 0.36), 0 6px 16px rgba(55, 41, 30, 0.8)' : 'none',
                  borderRadius: `${border_radius}px`,
                  overflow: 'hidden',
                }}>
                  <img
                    src={bag.images?.[0] || 'https://via.placeholder.com/400'}
                    alt={bag.title}
                    className={`w-full object-cover ${enable_animations ? 'hover:scale-110' : ''} transition-transform`}
                    style={{ height: index % 3 === 0 ? '320px' : '260px' }}
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium" style={{ color: primary_color }}>
                      {bag.title}
                    </div>
                    <div className="text-xs mt-1 tracking-[0.18em] uppercase" style={{ color: secondary_text_color }}>
                      {bag.category || 'Bag'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm mb-1" style={{ color: primary_color }}>
                      {formatPrice(bag.price)} <span style={{ color: secondary_text_color }}>DZD</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const slug = bag.slug || bag.id;
                        navigate(storeSlug ? `/store/${storeSlug}/${slug}` : `/product/${bag.id}`);
                      }}
                      className="text-xs px-3 py-1 text-white font-medium transition"
                      style={{
                        background: primary_color,
                        borderRadius: `${border_radius}px`,
                      }}
                    >
                      {buyNowLabel}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        {show_testimonials && testimonialsList.length > 0 && (
          <section className="py-16 mb-10" style={{ 
            paddingLeft: `${section_padding / 2}px`,
            paddingRight: `${section_padding / 2}px`,
            borderTop: `1px solid ${secondary_text_color}`,
            borderBottom: `1px solid ${secondary_text_color}`,
          }}>
            <h2 className="text-center font-medium mb-8" style={{ fontSize: headingSizes.h2, color: primary_color }}>
              {testimonialsTitle}
            </h2>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fit, minmax(300px, 1fr))`,
              gap: `${section_padding}px`,
            }}>
              {testimonialsList.slice(0, 3).map((testimonial: any, idx: number) => (
                <div 
                  key={idx}
                  style={{
                    padding: `${section_padding}px`,
                    background: enable_dark_mode ? '#1a1a1a' : secondary_color,
                    borderRadius: `${border_radius}px`,
                    border: `1px solid ${secondary_text_color}`,
                  }}
                >
                  <div className="text-xs mb-3" style={{ color: accent_color }}>
                    {'★'.repeat(testimonial.rating || 5)}
                  </div>
                  <p className="text-sm mb-4" style={{ color: text_color }}>
                    "{testimonial.text}"
                  </p>
                  <p style={{ color: secondary_text_color }}>
                    — {testimonial.author}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        {show_faq && faqList.length > 0 && (
          <section className="py-16 mb-10" style={{ 
            paddingLeft: `${section_padding / 2}px`,
            paddingRight: `${section_padding / 2}px`,
          }}>
            <h2 className="font-medium mb-8" style={{ fontSize: headingSizes.h2, color: primary_color }}>
              {faqTitle}
            </h2>
            <div style={{ maxWidth: '600px' }}>
              {faqList.slice(0, 5).map((faq: any, idx: number) => (
                <details
                  key={idx}
                  style={{
                    marginBottom: `${section_padding / 2}px`,
                    borderBottom: `1px solid ${secondary_text_color}`,
                    paddingBottom: `${section_padding / 4}px`,
                  }}
                  className={enable_animations ? 'cursor-pointer' : ''}
                >
                  <summary style={{ color: primary_color, fontWeight: 600 }}>
                    {faq.question}
                  </summary>
                  <p style={{ color: secondary_text_color, marginTop: `${section_padding / 4}px` }}>
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* NEWSLETTER */}
        {/* Newsletter section can be added here if needed */}

        {/* FOOTER */}
        <footer style={{ 
          borderTop: `1px solid ${secondary_text_color}`,
          paddingTop: `${section_padding}px`,
          marginTop: `${section_padding}px`,
          paddingLeft: `${section_padding / 2}px`,
          paddingRight: `${section_padding / 2}px`,
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: `${section_padding}px`,
            marginBottom: `${section_padding}px`,
          }}>
            {/* About */}
            {footer_about && (
              <div>
                <h3 className="font-medium mb-3" style={{ color: primary_color }}>{footerAboutTitle}</h3>
                <p style={{ color: secondary_text_color }}>{footer_about}</p>
              </div>
            )}
            
            {/* Contact */}
            {footer_contact && (
              <div>
                <h3 className="font-medium mb-3" style={{ color: primary_color }}>{footerContactTitle}</h3>
                <p style={{ color: secondary_text_color }}>{footer_contact}</p>
              </div>
            )}
            
            {/* Social Links */}
            {socialLinksList.length > 0 && (
              <div>
                <h3 className="font-medium mb-3" style={{ color: primary_color }}>{footerFollowTitle}</h3>
                <div className="flex gap-4">
                  {socialLinksList.map((link: any, idx: number) => (
                    <a 
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: primary_color }}
                      className={enable_animations ? 'hover:opacity-70 transition-opacity' : ''}
                    >
                      {link.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Copyright */}
          <div style={{ 
            borderTop: `1px solid ${secondary_text_color}`,
            paddingTop: `${section_padding / 2}px`,
            textAlign: 'center',
            fontSize: '12px',
            color: secondary_text_color,
          }}>
            <p>© {new Date().getFullYear()} {settings.store_name || 'BAGSOS'} · {footerRights}</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export const TEMPLATE_EDITOR_SECTIONS = [
  {
    title: 'Bags: Header',
    fields: [
      { key: 'template_nav_editorial', label: 'Nav: Editorial', type: 'text', defaultValue: 'Editorial' },
      { key: 'template_nav_leather', label: 'Nav: Leather', type: 'text', defaultValue: 'Leather' },
      { key: 'template_nav_materials', label: 'Nav: Materials', type: 'text', defaultValue: 'Materials' },
      { key: 'template_nav_search', label: 'Nav: Search', type: 'text', defaultValue: 'Search' },
      { key: 'template_nav_bag', label: 'Nav: Bag', type: 'text', defaultValue: 'Bag (0)' },
    ],
  },
  {
    title: 'Bags: Hero & Chapter',
    fields: [
      { key: 'template_hero_kicker', label: 'Hero Kicker', type: 'text', defaultValue: 'Bags / Editorial' },
      { key: 'template_highlight_label', label: 'Highlight Label', type: 'text', defaultValue: 'HIGHLIGHT PIECE' },
      { key: 'template_chapter_label', label: 'Chapter Label', type: 'text', defaultValue: 'CHAPTER I' },
      { key: 'template_chapter_title', label: 'Chapter Title', type: 'text', defaultValue: 'Leather silhouettes' },
      { key: 'template_chapter_text', label: 'Chapter Text', type: 'text', defaultValue: 'Structured lines in cold leather tones. Clean forms with enough volume for the city.' },
    ],
  },
  {
    title: 'Bags: Grid & Labels',
    fields: [
      { key: 'template_grid_kicker', label: 'Grid Kicker', type: 'text', defaultValue: 'PIECES' },
      { key: 'template_grid_title', label: 'Grid Title', type: 'text', defaultValue: 'Bags in this collection' },
      { key: 'template_grid_count_suffix', label: 'Grid Count Suffix', type: 'text', defaultValue: 'pieces' },
      { key: 'template_buy_now_label', label: 'Buy Now Label', type: 'text', defaultValue: 'Buy Now' },
      { key: 'template_testimonials_title', label: 'Testimonials Title', type: 'text', defaultValue: 'What Our Customers Say' },
      { key: 'template_faq_title', label: 'FAQ Title', type: 'text', defaultValue: 'Frequently Asked Questions' },
    ],
  },
  {
    title: 'Bags: Footer',
    fields: [
      { key: 'template_footer_about_title', label: 'Footer About Title', type: 'text', defaultValue: 'About' },
      { key: 'template_footer_contact_title', label: 'Footer Contact Title', type: 'text', defaultValue: 'Contact' },
      { key: 'template_footer_follow_title', label: 'Footer Follow Title', type: 'text', defaultValue: 'Follow' },
      { key: 'template_footer_rights', label: 'Footer Rights Text', type: 'text', defaultValue: 'All rights reserved' },
    ],
  },
] as const;
