import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';

/**
 * SHOWCASE PLUS - Multi-image product showcase template.
 * Features: Image carousel, color variants, detailed order form.
 */

function asString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function resolveInt(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = typeof value === 'number' ? value : parseInt(String(value || ''), 10);
  const safe = Number.isFinite(parsed) ? parsed : fallback;
  return Math.max(min, Math.min(max, safe));
}

function productTitle(p: StoreProduct): string {
  return String(p.title || p.name || '').trim() || 'Product';
}

function productImage(p: StoreProduct): string {
  const img = Array.isArray(p.images) ? p.images.find(Boolean) : undefined;
  return typeof img === 'string' && img ? img : '/placeholder.png';
}

export default function ShowcasePlusTemplate(props: TemplateProps) {
  const { settings, formatPrice, navigate } = props;
  const canManage = Boolean(props.canManage);
  const onSelect = (path: string) => {
    if (canManage && typeof (props as any).onSelect === 'function') {
      (props as any).onSelect(path);
    }
  };

  const [isMobile, setIsMobile] = React.useState((props as any).forcedBreakpoint === 'mobile');
  const [currentSlide, setCurrentSlide] = React.useState(0);
  
  React.useEffect(() => {
    const bp = (props as any).forcedBreakpoint;
    if (bp) { setIsMobile(bp === 'mobile'); return; }
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [(props as any).forcedBreakpoint]);

  // Showcase theme - warm neutral
  const bg = asString(settings.template_bg_color) || '#faf9f7';
  const text = asString(settings.template_text_color) || '#1c1917';
  const muted = asString(settings.template_muted_color) || '#78716c';
  const accent = asString(settings.template_accent_color) || '#ea580c';

  const storeName = asString(settings.store_name) || 'Showcase+';
  const heroTitle = asString(settings.template_hero_heading) || 'Featured Product';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Discover the perfect blend of quality and style';
  const cta = asString(settings.template_button_text) || 'Add to Cart';

  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];

  const descText = asString(settings.template_description_text);
  const descColor = asString(settings.template_description_color) || muted;
  const descSize = resolveInt(settings.template_description_size, 15, 10, 32);

  // Layout settings
  const gridColumns = resolveInt(settings.template_grid_columns, 4, 2, 6);
  const gridGap = resolveInt(settings.template_grid_gap, 20, 8, 48);
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 48, 24, 96);
  const animationSpeed = resolveInt(settings.template_animation_speed, 200, 100, 500);
  const hoverScale = asString(settings.template_hover_scale) || '1.02';
  const cardRadius = resolveInt(settings.template_card_border_radius, 16, 0, 32);

  const mainProduct = products[0];

  // Create display images from all products
  const allImages = products.slice(0, 6).map(productImage);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % allImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + allImages.length) % allImages.length);

  return (
    <div
      className="ecopro-storefront"
      style={{
        minHeight: '100vh',
        background: bg,
        color: text,
        fontFamily: '"Outfit", system-ui, sans-serif',
      }}
    >
      {/* Top bar */}
      <div style={{ background: accent, color: '#fff', textAlign: 'center', padding: '10px 16px', fontSize: 13, fontWeight: 500 }}>
        🎉 Limited Time Offer - Get 20% OFF with code SAVE20
      </div>

      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={() => canManage && onSelect('layout.header')}
        style={{
          background: '#fff',
          padding: '14px 24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt="" style={{ height: 36 }} />
            ) : (
              <>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>
                  S
                </div>
                <span style={{ fontSize: 20, fontWeight: 700 }}>{storeName}</span>
              </>
            )}
          </div>
          
          {!isMobile && (
            <nav style={{ display: 'flex', gap: 32, fontSize: 14 }}>
              <button onClick={() => navigate('/')} style={{ background: 'none', border: 0, color: text, cursor: 'pointer', fontWeight: 500 }}>Home</button>
              <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: muted, cursor: 'pointer' }}>Shop</button>
              <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: muted, cursor: 'pointer' }}>About</button>
            </nav>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => navigate('/products')}
              style={{
                background: accent,
                border: 0,
                borderRadius: 8,
                padding: '10px 20px',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Shop Now
            </button>
          </div>
        </div>
      </header>

      {/* Hero - Showcase Layout */}
      <section
        data-edit-path="layout.hero"
        onClick={() => canManage && onSelect('layout.hero')}
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: isMobile ? '32px 24px' : '60px 24px',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.3fr 1fr', gap: isMobile ? 32 : 48, alignItems: 'center' }}>
          {/* Image Carousel */}
          <div style={{ position: 'relative' }}>
            <div style={{ background: '#fff', borderRadius: cardRadius, overflow: 'hidden', aspectRatio: '4/3', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
              <img 
                src={allImages[currentSlide] || '/placeholder.png'} 
                alt="" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>

            {/* Navigation arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    border: 0,
                    background: 'rgba(255,255,255,0.9)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    fontSize: 20,
                  }}
                >
                  ‹
                </button>
                <button
                  onClick={nextSlide}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    border: 0,
                    background: 'rgba(255,255,255,0.9)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    fontSize: 20,
                  }}
                >
                  ›
                </button>
              </>
            )}

            {/* Dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
              {allImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  style={{
                    width: idx === currentSlide ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    border: 0,
                    background: idx === currentSlide ? accent : '#d6d3d1',
                    cursor: 'pointer',
                    transition: 'width 0.2s',
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <span style={{ color: accent, fontSize: 13, fontWeight: 600, letterSpacing: '0.05em' }}>BESTSELLER</span>
            <h1 style={{ fontSize: isMobile ? 28 : 36, fontWeight: 700, lineHeight: 1.2, margin: '12px 0 0' }}>
              {heroTitle}
            </h1>
            <p style={{ marginTop: 16, fontSize: 15, color: muted, lineHeight: 1.8 }}>
              {heroSubtitle}
            </p>

            {/* Rating */}
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#fbbf24', fontSize: 18 }}>★★★★★</span>
              <span style={{ color: muted, fontSize: 13 }}>(127 reviews)</span>
            </div>

            {mainProduct && (
              <div style={{ marginTop: 20 }}>
                <span style={{ fontSize: 32, fontWeight: 800 }}>{formatPrice(Number(mainProduct.price) || 0)}</span>
                <span style={{ marginLeft: 12, color: muted, textDecoration: 'line-through' }}>{formatPrice((Number(mainProduct.price) || 0) * 1.25)}</span>
              </div>
            )}

            {/* Color options */}
            <div style={{ marginTop: 24 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Color</span>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                {['#1c1917', '#991b1b', '#1e40af', '#166534'].map((color, idx) => (
                  <button
                    key={color}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: color,
                      border: idx === 0 ? `2px solid ${accent}` : '2px solid transparent',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Order Form */}
            <div style={{ marginTop: 28, background: '#fff', borderRadius: cardRadius, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input placeholder="Name" style={{ padding: '14px', border: '1px solid #e7e5e4', borderRadius: 10, fontSize: 14 }} />
                <input placeholder="Phone" style={{ padding: '14px', border: '1px solid #e7e5e4', borderRadius: 10, fontSize: 14 }} />
              </div>
              <input placeholder="Address" style={{ width: '100%', padding: '14px', border: '1px solid #e7e5e4', borderRadius: 10, fontSize: 14, marginTop: 12, boxSizing: 'border-box' }} />
              
              <button
                style={{
                  width: '100%',
                  marginTop: 16,
                  background: accent,
                  border: 0,
                  borderRadius: 10,
                  padding: '16px',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: 'pointer',
                }}
              >
                {cta}
              </button>
              <p style={{ marginTop: 12, textAlign: 'center', color: muted, fontSize: 12 }}>
                🔒 Secure checkout • Free shipping
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      {(canManage || descText) && (
        <section
          data-edit-path="layout.categories"
          onClick={() => canManage && onSelect('layout.categories')}
          style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, background: '#fff' }}
        >
          <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ color: descColor, fontSize: descSize, lineHeight: 1.9 }}>
              {descText || (canManage ? 'Add detailed product information here...' : '')}
            </p>
          </div>
        </section>
      )}

      {/* Trust badges */}
      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : `repeat(4, 1fr)`, gap: gridGap }}>
          {[
            { icon: '🚚', text: 'Free Shipping' },
            { icon: '↩️', text: '30-Day Returns' },
            { icon: '🔒', text: 'Secure Payment' },
            { icon: '💬', text: '24/7 Support' },
          ].map((b) => (
            <div key={b.text} style={{ background: '#fff', borderRadius: cardRadius, padding: 20, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{b.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{b.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* More Products */}
      {products.length > 1 && (
        <section
          data-edit-path="layout.grid"
          onClick={() => canManage && onSelect('layout.grid')}
          style={{ maxWidth: 1200, margin: '0 auto', padding: `${baseSpacing}px ${baseSpacing}px ${sectionSpacing * 1.5}px` }}
        >
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>You May Also Like</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : `repeat(${gridColumns}, 1fr)`,
              gap: gridGap,
            }}
          >
            {products.slice(1, 9).map((p) => (
              <div
                key={p.id}
                data-edit-path={`layout.grid.items.${p.id}`}
                onClick={(e) => {
                  if (canManage) { e.stopPropagation(); onSelect(`layout.grid.items.${p.id}`); return; }
                  if ((p as any).slug) navigate((p as any).slug);
                }}
                style={{
                  background: '#fff',
                  borderRadius: cardRadius,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: `transform ${animationSpeed}ms`,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = `translateY(-4px) scale(${hoverScale})`)}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0) scale(1)')}
              >
                <div style={{ aspectRatio: '1', background: bg }}>
                  <img src={productImage(p)} alt={productTitle(p)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: 14 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{productTitle(p)}</h3>
                  <div style={{ marginTop: 8, fontWeight: 700, color: accent }}>{formatPrice(Number(p.price) || 0)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={() => canManage && onSelect('layout.footer')}
        style={{ background: text, color: '#fff', padding: `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{storeName}</div>
            <p style={{ color: '#a8a29e', fontSize: 13 }}>Quality products you can trust</p>
          </div>
          <p style={{ color: '#a8a29e', fontSize: 13 }}>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
