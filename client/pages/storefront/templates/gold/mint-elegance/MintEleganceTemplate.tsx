import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';

/**
 * MINT ELEGANCE - Fresh mint green with elegant card design.
 * Features: Soft mint palette, card hover effects, testimonials section.
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

export default function MintEleganceTemplate(props: TemplateProps) {
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

  // Mint elegance theme
  const bg = asString(settings.template_bg_color) || '#f0f7f4';
  const text = asString(settings.template_text_color) || '#1a332a';
  const muted = asString(settings.template_muted_color) || '#5c7a6e';
  const accent = asString(settings.template_accent_color) || '#3d9970';

  const storeName = asString(settings.store_name) || 'Mint & Co';
  const heroTitle = asString(settings.template_hero_heading) || 'Fresh Perspectives';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Where modern design meets natural beauty';
  const cta = asString(settings.template_button_text) || 'Explore Now';

  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];

  const descText = asString(settings.template_description_text);
  const descColor = asString(settings.template_description_color) || muted;
  const descSize = resolveInt(settings.template_description_size, 15, 10, 32);

  // Layout settings
  const gridColumns = resolveInt(settings.template_grid_columns, 4, 2, 6);
  const gridGap = resolveInt(settings.template_grid_gap, 20, 8, 48);
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 80, 24, 96);
  const animationSpeed = resolveInt(settings.template_animation_speed, 300, 100, 500);
  const hoverScale = asString(settings.template_hover_scale) || '1.02';
  const cardRadius = resolveInt(settings.template_card_border_radius, 16, 0, 32);

  return (
    <div
      className="ecopro-storefront"
      style={{
        minHeight: '100vh',
        background: bg,
        color: text,
        fontFamily: '"Nunito Sans", system-ui, sans-serif',
      }}
    >
      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={() => canManage && onSelect('layout.header')}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(240, 247, 244, 0.95)',
          backdropFilter: 'blur(10px)',
          padding: '16px 24px',
          borderBottom: '1px solid rgba(61, 153, 112, 0.1)',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt="" style={{ width: 44, height: 44, borderRadius: 12 }} />
            ) : (
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${accent}, ${accent}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18 }}>
                M
              </div>
            )}
            <span style={{ fontSize: 22, fontWeight: 700 }}>{storeName}</span>
          </div>
          
          {!isMobile && (
            <nav style={{ display: 'flex', gap: 28, fontSize: 15 }}>
              <button onClick={() => navigate('/')} style={{ background: 'none', border: 0, color: muted, cursor: 'pointer', fontWeight: 500 }}>Home</button>
              <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: muted, cursor: 'pointer', fontWeight: 500 }}>Products</button>
              <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: muted, cursor: 'pointer', fontWeight: 500 }}>Collections</button>
              <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: muted, cursor: 'pointer', fontWeight: 500 }}>Contact</button>
            </nav>
          )}

          <button
            onClick={() => navigate('/products')}
            style={{
              background: accent,
              border: 0,
              borderRadius: 10,
              padding: '12px 24px',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Shop
          </button>
        </div>
      </header>

      {/* Hero - Two column */}
      <section
        data-edit-path="layout.hero"
        onClick={() => canManage && onSelect('layout.hero')}
        style={{ maxWidth: 1280, margin: '0 auto', padding: isMobile ? '40px 24px' : '80px 24px' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-block', background: `${accent}20`, color: accent, padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
              ✨ New Arrivals
            </div>
            <h1 style={{ fontSize: isMobile ? 36 : 52, fontWeight: 800, lineHeight: 1.15, margin: 0 }}>
              {heroTitle}
            </h1>
            <p style={{ marginTop: 20, fontSize: 17, color: muted, lineHeight: 1.8 }}>
              {heroSubtitle}
            </p>
            <div style={{ marginTop: 32, display: 'flex', gap: 16 }}>
              <button
                onClick={() => navigate('/products')}
                style={{
                  background: accent,
                  border: 0,
                  borderRadius: 12,
                  padding: '16px 32px',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {cta}
              </button>
              <button
                onClick={() => navigate('/products')}
                style={{
                  background: 'transparent',
                  border: `2px solid ${accent}`,
                  borderRadius: 12,
                  padding: '14px 28px',
                  color: accent,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Learn More
              </button>
            </div>
          </div>

          {!isMobile && products.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {products.slice(0, 4).map((p, idx) => (
                <div
                  key={p.id}
                  style={{
                    background: '#fff',
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                    transform: idx % 2 === 1 ? 'translateY(24px)' : 'none',
                  }}
                >
                  <div style={{ aspectRatio: '1' }}>
                    <img src={productImage(p)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Description */}
      {(canManage || descText) && (
        <section
          data-edit-path="layout.categories"
          onClick={() => canManage && onSelect('layout.categories')}
          style={{ padding: '48px 24px', background: '#fff' }}
        >
          <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ color: descColor, fontSize: descSize, lineHeight: 1.9 }}>
              {descText || (canManage ? 'Add your store description here...' : '')}
            </p>
          </div>
        </section>
      )}

      {/* Stats bar */}
      <section style={{ background: accent, padding: '32px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 24 }}>
          {[
            { num: '500+', label: 'Products' },
            { num: '10K+', label: 'Happy Customers' },
            { num: '4.9', label: 'Rating' },
            { num: '24/7', label: 'Support' },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center', color: '#fff' }}>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{s.num}</div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section
        data-edit-path="layout.grid"
        onClick={() => canManage && onSelect('layout.grid')}
        style={{ maxWidth: 1280, margin: '0 auto', padding: `${sectionSpacing}px 24px` }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Popular Products</h2>
            <p style={{ color: muted, marginTop: 8 }}>Our most loved items this season</p>
          </div>
          <button
            onClick={() => navigate('/products')}
            style={{ background: 'none', border: 0, color: accent, fontWeight: 700, cursor: 'pointer', fontSize: 15 }}
          >
            View All →
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : `repeat(${gridColumns}, 1fr)`,
            gap: gridGap,
          }}
        >
          {products.slice(0, 8).map((p) => (
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
                transition: `transform ${animationSpeed}ms, box-shadow ${animationSpeed}ms`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = `translateY(-8px) scale(${hoverScale})`;
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ aspectRatio: '1', background: '#f8faf9' }}>
                <img src={productImage(p)} alt={productTitle(p)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: baseSpacing }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {productTitle(p)}
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                  <span style={{ color: accent, fontWeight: 800, fontSize: 16 }}>{formatPrice(Number(p.price) || 0)}</span>
                  <button style={{ background: `${accent}15`, border: 0, borderRadius: 8, padding: '8px 14px', color: accent, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section style={{ background: '#fff', padding: `${sectionSpacing}px 24px` }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 48, color: accent }}>❝</div>
          <p style={{ fontSize: 22, fontStyle: 'italic', lineHeight: 1.7, color: text }}>
            "Absolutely love the quality and attention to detail. Every piece feels special and unique. Will definitely be ordering again!"
          </p>
          <div style={{ marginTop: 24 }}>
            <div style={{ fontWeight: 700 }}>Sarah M.</div>
            <div style={{ color: muted, fontSize: 14 }}>Verified Buyer</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={() => canManage && onSelect('layout.footer')}
        style={{ background: text, color: '#fff', padding: `${sectionSpacing - 20}px 24px` }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 40 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>{storeName}</div>
              <p style={{ opacity: 0.7, fontSize: 14, lineHeight: 1.7 }}>
                Bringing fresh designs and quality products to your doorstep.
              </p>
            </div>
            {['Shop', 'Support', 'Company'].map((section) => (
              <div key={section}>
                <h5 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, opacity: 0.5 }}>{section}</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {['Link 1', 'Link 2', 'Link 3'].map((link, i) => (
                    <a key={i} href="#" style={{ color: '#fff', opacity: 0.8, textDecoration: 'none', fontSize: 14 }}>{link}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 48, paddingTop: 24, textAlign: 'center', opacity: 0.6, fontSize: 13 }}>
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
