import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';

/**
 * EXHIBIT STORE - Museum-style product exhibition template.
 * Features: Large hero image, floating info card, grid showcase.
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

export default function ExhibitStoreTemplate(props: TemplateProps) {
  const { settings, formatPrice, navigate } = props;
  const canManage = Boolean(props.canManage);
  const onSelect = (path: string) => {
    if (canManage && typeof (props as any).onSelect === 'function') {
      (props as any).onSelect(path);
    }
  };

  const [isMobile, setIsMobile] = React.useState((props as any).forcedBreakpoint === 'mobile');
  
  React.useEffect(() => {
    const bp = (props as any).forcedBreakpoint;
    if (bp) { setIsMobile(bp === 'mobile'); return; }
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [(props as any).forcedBreakpoint]);

  // Exhibit theme - elegant dark/light
  const bg = asString(settings.template_bg_color) || '#f5f5f4';
  const text = asString(settings.template_text_color) || '#1c1917';
  const muted = asString(settings.template_muted_color) || '#78716c';
  const accent = asString(settings.template_accent_color) || '#0d9488';

  const storeName = asString(settings.store_name) || 'EXHIBIT';
  const heroTitle = asString(settings.template_hero_heading) || 'Curated Excellence';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Handpicked products for the discerning buyer';
  const cta = asString(settings.template_button_text) || 'Shop Now';

  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];

  const descText = asString(settings.template_description_text);
  const descColor = asString(settings.template_description_color) || muted;
  const descSize = resolveInt(settings.template_description_size, 15, 10, 32);

  // Layout settings
  const gridColumns = resolveInt(settings.template_grid_columns, 3, 2, 6);
  const gridGap = resolveInt(settings.template_grid_gap, 24, 8, 48);
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 60, 24, 96);
  const animationSpeed = resolveInt(settings.template_animation_speed, 500, 100, 500);
  const hoverScale = asString(settings.template_hover_scale) || '1.05';
  const cardRadius = resolveInt(settings.template_card_border_radius, 0, 0, 32);

  const mainProduct = products[0];

  return (
    <div
      className="ecopro-storefront"
      style={{
        minHeight: '100vh',
        background: bg,
        color: text,
        fontFamily: '"Cormorant Garamond", Georgia, serif',
      }}
    >
      {/* Elegant Header */}
      <header
        data-edit-path="layout.header"
        onClick={() => canManage && onSelect('layout.header')}
        style={{
          padding: '20px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: 1400,
          margin: '0 auto',
        }}
      >
        <span style={{ fontSize: 28, fontWeight: 600, letterSpacing: '0.2em' }}>{storeName}</span>
        
        {!isMobile && (
          <nav style={{ display: 'flex', gap: 40, fontSize: 14, fontFamily: '"Inter", sans-serif', letterSpacing: '0.1em' }}>
            <button onClick={() => navigate('/')} style={{ background: 'none', border: 0, color: text, cursor: 'pointer' }}>HOME</button>
            <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: muted, cursor: 'pointer' }}>COLLECTION</button>
            <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: muted, cursor: 'pointer' }}>ABOUT</button>
          </nav>
        )}

        <button
          onClick={() => navigate('/products')}
          style={{
            background: 'transparent',
            border: `1px solid ${text}`,
            padding: '12px 28px',
            color: text,
            fontFamily: '"Inter", sans-serif',
            fontSize: 12,
            letterSpacing: '0.15em',
            cursor: 'pointer',
          }}
        >
          SHOP
        </button>
      </header>

      {/* Hero - Exhibition style */}
      <section
        data-edit-path="layout.hero"
        onClick={() => canManage && onSelect('layout.hero')}
        style={{
          position: 'relative',
          minHeight: isMobile ? 'auto' : '80vh',
        }}
      >
        {/* Large background image */}
        {mainProduct && !isMobile && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <img 
              src={productImage(mainProduct)} 
              alt="" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.9)' }} 
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.4), transparent)' }} />
          </div>
        )}

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1400, margin: '0 auto', padding: isMobile ? '48px 24px' : '100px 48px' }}>
          {isMobile && mainProduct && (
            <div style={{ marginBottom: 32, borderRadius: 16, overflow: 'hidden' }}>
              <img src={productImage(mainProduct)} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover' }} />
            </div>
          )}

          <div style={{ maxWidth: 500, color: isMobile ? text : '#fff' }}>
            <h1 style={{ fontSize: isMobile ? 42 : 64, fontWeight: 500, lineHeight: 1.1, margin: 0 }}>
              {heroTitle}
            </h1>
            <p style={{ marginTop: 24, fontSize: 18, lineHeight: 1.8, fontFamily: '"Inter", sans-serif', opacity: 0.9 }}>
              {heroSubtitle}
            </p>

            {mainProduct && (
              <div style={{ marginTop: 32 }}>
                <span style={{ fontSize: 36, fontWeight: 500 }}>{formatPrice(Number(mainProduct.price) || 0)}</span>
              </div>
            )}

            <button
              onClick={() => navigate('/products')}
              style={{
                marginTop: 32,
                background: accent,
                border: 0,
                padding: '18px 48px',
                color: '#fff',
                fontFamily: '"Inter", sans-serif',
                fontSize: 13,
                letterSpacing: '0.15em',
                cursor: 'pointer',
              }}
            >
              {cta.toUpperCase()}
            </button>
          </div>
        </div>
      </section>

      {/* Description */}
      {(canManage || descText) && (
        <section
          data-edit-path="layout.categories"
          onClick={() => canManage && onSelect('layout.categories')}
          style={{ padding: '80px 24px', background: '#fff' }}
        >
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ color: descColor, fontSize: descSize, lineHeight: 2, fontStyle: 'italic' }}>
              {descText || (canManage ? 'Add your brand story here...' : '')}
            </p>
          </div>
        </section>
      )}

      {/* Exhibition Grid */}
      <section
        data-edit-path="layout.grid"
        onClick={() => canManage && onSelect('layout.grid')}
        style={{ maxWidth: 1400, margin: '0 auto', padding: `${sectionSpacing}px 24px 100px` }}
      >
        <h2 style={{ fontSize: 36, fontWeight: 500, textAlign: 'center', marginBottom: sectionSpacing, letterSpacing: '0.1em' }}>THE COLLECTION</h2>
        
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : `repeat(${gridColumns}, 1fr)`,
            gap: isMobile ? 32 : gridGap,
          }}
        >
          {products.slice(0, 6).map((p, idx) => (
            <div
              key={p.id}
              data-edit-path={`layout.grid.items.${p.id}`}
              onClick={(e) => {
                if (canManage) { e.stopPropagation(); onSelect(`layout.grid.items.${p.id}`); return; }
                if ((p as any).slug) navigate((p as any).slug);
              }}
              style={{
                cursor: 'pointer',
                gridRow: !isMobile && idx === 0 ? 'span 2' : 'span 1',
              }}
            >
              <div style={{ overflow: 'hidden', background: '#fff', borderRadius: cardRadius }}>
                <img 
                  src={productImage(p)} 
                  alt={productTitle(p)} 
                  style={{ 
                    width: '100%', 
                    aspectRatio: !isMobile && idx === 0 ? '3/4' : '1', 
                    objectFit: 'cover',
                    transition: `transform ${animationSpeed}ms`,
                  }} 
                  onMouseEnter={(e) => (e.currentTarget.style.transform = `scale(${hoverScale})`)}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
              </div>
              <div style={{ padding: '20px 0' }}>
                <h3 style={{ fontSize: 18, fontWeight: 500, margin: 0 }}>{productTitle(p)}</h3>
                <p style={{ marginTop: 8, fontFamily: '"Inter", sans-serif', fontSize: 15, fontWeight: 600 }}>
                  {formatPrice(Number(p.price) || 0)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <button
            onClick={() => navigate('/products')}
            style={{
              background: 'transparent',
              border: `1px solid ${text}`,
              padding: '16px 48px',
              color: text,
              fontFamily: '"Inter", sans-serif',
              fontSize: 12,
              letterSpacing: '0.15em',
              cursor: 'pointer',
            }}
          >
            VIEW ALL
          </button>
        </div>
      </section>

      {/* Features */}
      <section style={{ background: text, color: '#fff', padding: '60px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 40, textAlign: 'center' }}>
          {[
            { title: 'Curated Selection', desc: 'Every item handpicked for quality' },
            { title: 'Global Shipping', desc: 'Delivered worldwide with care' },
            { title: 'Premium Quality', desc: 'Only the finest materials' },
          ].map((f) => (
            <div key={f.title}>
              <h4 style={{ fontSize: 20, fontWeight: 500, margin: 0, letterSpacing: '0.05em' }}>{f.title}</h4>
              <p style={{ marginTop: 12, fontFamily: '"Inter", sans-serif', fontSize: 14, opacity: 0.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact / Order */}
      <section style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: 32, fontWeight: 500, margin: 0, letterSpacing: '0.1em' }}>INQUIRE</h3>
          <p style={{ marginTop: 16, fontFamily: '"Inter", sans-serif', color: muted, fontSize: 15, lineHeight: 1.7 }}>
            Interested in a piece? Fill out the form and we'll get back to you.
          </p>
          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input 
              placeholder="Your Name" 
              style={{ 
                padding: '18px 20px', 
                border: `1px solid #e5e5e5`, 
                fontSize: 14, 
                fontFamily: '"Inter", sans-serif',
                textAlign: 'center',
              }} 
            />
            <input 
              placeholder="Phone Number" 
              style={{ 
                padding: '18px 20px', 
                border: `1px solid #e5e5e5`, 
                fontSize: 14, 
                fontFamily: '"Inter", sans-serif',
                textAlign: 'center',
              }} 
            />
            <input 
              placeholder="Delivery Address" 
              style={{ 
                padding: '18px 20px', 
                border: `1px solid #e5e5e5`, 
                fontSize: 14, 
                fontFamily: '"Inter", sans-serif',
                textAlign: 'center',
              }} 
            />
            <button
              style={{
                marginTop: 8,
                background: accent,
                border: 0,
                padding: '18px',
                color: '#fff',
                fontFamily: '"Inter", sans-serif',
                fontSize: 13,
                letterSpacing: '0.15em',
                cursor: 'pointer',
              }}
            >
              SUBMIT ORDER
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={() => canManage && onSelect('layout.footer')}
        style={{ padding: '48px 24px', borderTop: '1px solid #e5e5e5' }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          <span style={{ fontSize: 20, fontWeight: 600, letterSpacing: '0.2em' }}>{storeName}</span>
          <span style={{ fontFamily: '"Inter", sans-serif', color: muted, fontSize: 13 }}>
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
