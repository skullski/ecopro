import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';

/**
 * EMERALD SHOP - Rich emerald green with product showcase.
 * Features: Deep emerald theme, feature highlights, testimonials.
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

export default function EmeraldShopTemplate(props: TemplateProps) {
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

  // Emerald theme
  const bg = asString(settings.template_bg_color) || '#ecfdf5';
  const text = asString(settings.template_text_color) || '#064e3b';
  const muted = asString(settings.template_muted_color) || '#047857';
  const accent = asString(settings.template_accent_color) || '#059669';

  const storeName = asString(settings.store_name) || 'Emerald Shop';
  const heroTitle = asString(settings.template_hero_heading) || 'Discover Excellence';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Premium products crafted for quality-conscious buyers';
  const cta = asString(settings.template_button_text) || 'Shop Now';

  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];

  const descText = asString(settings.template_description_text);
  const descColor = asString(settings.template_description_color) || muted;
  const descSize = resolveInt(settings.template_description_size, 15, 10, 32);

  // Layout settings
  const gridColumns = resolveInt(settings.template_grid_columns, 4, 2, 6);
  const gridGap = resolveInt(settings.template_grid_gap, 20, 8, 48);
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 48, 24, 96);
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
        fontFamily: '"DM Sans", system-ui, sans-serif',
      }}
    >
      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={() => canManage && onSelect('layout.header')}
        style={{
          background: text,
          padding: '16px 24px',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt="" style={{ width: 40, height: 40, borderRadius: 8 }} />
            ) : (
              <div style={{ fontSize: 24 }}>💎</div>
            )}
            <span style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{storeName}</span>
          </div>
          
          {!isMobile && (
            <nav style={{ display: 'flex', gap: 28, fontSize: 14 }}>
              <button onClick={() => navigate('/')} style={{ background: 'none', border: 0, color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>Home</button>
              <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>Shop</button>
              <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>About</button>
            </nav>
          )}

          <button
            onClick={() => navigate('/products')}
            style={{
              background: accent,
              border: 0,
              borderRadius: 8,
              padding: '12px 24px',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {cta}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section
        data-edit-path="layout.hero"
        onClick={() => canManage && onSelect('layout.hero')}
        style={{
          background: `linear-gradient(135deg, ${text} 0%, ${accent} 100%)`,
          padding: isMobile ? '60px 24px' : '100px 40px',
          color: '#fff',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 48, alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: isMobile ? 36 : 52, fontWeight: 800, lineHeight: 1.1, margin: 0 }}>
              {heroTitle}
            </h1>
            <p style={{ marginTop: 24, fontSize: 18, opacity: 0.9, lineHeight: 1.8 }}>
              {heroSubtitle}
            </p>
            <div style={{ marginTop: 36, display: 'flex', gap: 16 }}>
              <button
                onClick={() => navigate('/products')}
                style={{
                  background: '#fff',
                  border: 0,
                  borderRadius: 8,
                  padding: '16px 32px',
                  color: text,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {cta} →
              </button>
            </div>

            {/* Stats */}
            <div style={{ marginTop: 48, display: 'flex', gap: 40 }}>
              {[
                { num: '5K+', label: 'Happy Customers' },
                { num: '100%', label: 'Authentic' },
                { num: '24/7', label: 'Support' },
              ].map((s) => (
                <div key={s.label}>
                  <div style={{ fontSize: 28, fontWeight: 800 }}>{s.num}</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {!isMobile && products.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ background: '#fff', borderRadius: 20, padding: 12, boxShadow: '0 30px 60px rgba(0,0,0,0.3)' }}>
                <div style={{ width: 300, aspectRatio: '4/5', borderRadius: 12, overflow: 'hidden' }}>
                  <img src={productImage(products[0])} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '12px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: text }}>{productTitle(products[0])}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: accent, marginTop: 4 }}>{formatPrice(Number(products[0].price) || 0)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Description */}
      {(canManage || descText) && (
        <section
          data-edit-path="layout.categories"
          onClick={() => canManage && onSelect('layout.categories')}
          style={{ padding: '60px 24px', background: '#fff' }}
        >
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ color: descColor, fontSize: descSize, lineHeight: 1.9 }}>
              {descText || (canManage ? 'Add your brand story here...' : '')}
            </p>
          </div>
        </section>
      )}

      {/* Features */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', marginBottom: 40 }}>Why Choose Us</h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 24 }}>
          {[
            { icon: '✨', title: 'Premium Quality', desc: 'Only the finest materials and craftsmanship' },
            { icon: '🚀', title: 'Fast Shipping', desc: 'Express delivery to your doorstep' },
            { icon: '🛡️', title: 'Warranty', desc: 'Full warranty on all products' },
          ].map((f) => (
            <div key={f.title} style={{ background: '#fff', borderRadius: 16, padding: 28, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: muted, fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section
        data-edit-path="layout.grid"
        onClick={() => canManage && onSelect('layout.grid')}
        style={{ maxWidth: 1200, margin: '0 auto', padding: `${baseSpacing}px 24px ${sectionSpacing}px` }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Our Products</h2>
          <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: accent, fontWeight: 700, cursor: 'pointer' }}>
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
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ aspectRatio: '1' }}>
                <img src={productImage(p)} alt={productTitle(p)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {productTitle(p)}
                </h3>
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: accent, fontWeight: 800, fontSize: 16 }}>{formatPrice(Number(p.price) || 0)}</span>
                  <button style={{ background: accent, border: 0, borderRadius: 8, padding: '10px 16px', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                    Buy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section style={{ background: text, padding: '60px 24px', color: '#fff', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>⭐⭐⭐⭐⭐</div>
          <p style={{ fontSize: 20, fontStyle: 'italic', lineHeight: 1.7, opacity: 0.9 }}>
            "Best purchase I've ever made. The quality is outstanding and delivery was super fast. Highly recommend!"
          </p>
          <p style={{ marginTop: 20, fontWeight: 700 }}>— Verified Customer</p>
        </div>
      </section>

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={() => canManage && onSelect('layout.footer')}
        style={{ background: '#fff', padding: '48px 24px' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 24 }}>💎</span>
              <span style={{ fontSize: 20, fontWeight: 800 }}>{storeName}</span>
            </div>
            <p style={{ color: muted, fontSize: 14, lineHeight: 1.7 }}>
              Your trusted source for premium products.
            </p>
          </div>
          {['Shop', 'Support', 'Legal'].map((section) => (
            <div key={section}>
              <h5 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>{section}</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: muted }}>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Link</a>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Link</a>
              </div>
            </div>
          ))}
        </div>
        <div style={{ maxWidth: 1200, margin: '32px auto 0', paddingTop: 24, borderTop: '1px solid #e5e7eb', textAlign: 'center', fontSize: 13, color: muted }}>
          © {new Date().getFullYear()} {storeName}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
