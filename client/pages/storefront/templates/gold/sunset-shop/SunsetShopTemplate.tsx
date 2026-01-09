import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';

/**
 * SUNSET SHOP - Warm orange/white theme with clean order forms.
 * Features: Orange accents, product gallery, inline order form, breadcrumbs.
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

export default function SunsetShopTemplate(props: TemplateProps) {
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

  // Sunset theme - warm orange
  const bg = asString(settings.template_bg_color) || '#ffffff';
  const text = asString(settings.template_text_color) || '#1f2937';
  const muted = asString(settings.template_muted_color) || '#6b7280';
  const accent = asString(settings.template_accent_color) || '#f97316';

  const storeName = asString(settings.store_name) || 'Sunset Shop';
  const heroTitle = asString(settings.template_hero_heading) || 'Discover Unique Styles';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Handcrafted pieces for every occasion';
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
  const animationSpeed = resolveInt(settings.template_animation_speed, 200, 100, 500);
  const hoverScale = asString(settings.template_hover_scale) || '1.02';
  const cardRadius = resolveInt(settings.template_card_border_radius, 12, 0, 32);

  const cols = isMobile ? 2 : gridColumns;

  return (
    <div
      className="ecopro-storefront"
      style={{
        minHeight: '100vh',
        background: bg,
        color: text,
        fontFamily: '"Inter", system-ui, sans-serif',
      }}
    >
      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={() => canManage && onSelect('layout.header')}
        style={{
          background: bg,
          padding: '16px 24px',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt="" style={{ width: 40, height: 40, borderRadius: 8 }} />
            ) : (
              <div style={{ width: 40, height: 40, borderRadius: 8, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                {storeName.charAt(0)}
              </div>
            )}
            <span style={{ fontSize: 20, fontWeight: 700 }}>{storeName}</span>
          </div>
          
          {!isMobile && (
            <nav style={{ display: 'flex', gap: 28, fontSize: 14 }}>
              <button onClick={() => navigate('/')} style={{ background: 'none', border: 0, color: text, cursor: 'pointer' }}>Home</button>
              <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: text, cursor: 'pointer' }}>Products</button>
              <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: text, cursor: 'pointer' }}>Categories</button>
              <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: text, cursor: 'pointer' }}>Contact</button>
            </nav>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button style={{ background: 'none', border: 0, fontSize: 20, cursor: 'pointer' }}>🔍</button>
            <button style={{ background: 'none', border: 0, fontSize: 20, cursor: 'pointer' }}>👤</button>
            <button style={{ background: 'none', border: 0, fontSize: 20, cursor: 'pointer' }}>🛒</button>
          </div>
        </div>
      </header>

      {/* Hero - Simple banner */}
      <section
        data-edit-path="layout.hero"
        onClick={() => canManage && onSelect('layout.hero')}
        style={{
          background: `linear-gradient(135deg, ${accent} 0%, #fb923c 100%)`,
          padding: isMobile ? '48px 24px' : '80px 40px',
          color: '#fff',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 40, alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: isMobile ? 32 : 48, fontWeight: 800, lineHeight: 1.15, margin: 0 }}>
              {heroTitle}
            </h1>
            <p style={{ marginTop: 16, fontSize: 17, opacity: 0.9, lineHeight: 1.7 }}>
              {heroSubtitle}
            </p>
            <button
              onClick={() => navigate('/products')}
              style={{
                marginTop: 28,
                background: '#fff',
                border: 0,
                borderRadius: 8,
                padding: '14px 32px',
                color: accent,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {cta}
            </button>
          </div>
          
          {!isMobile && products.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ background: '#fff', borderRadius: 16, padding: 8, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
                <img src={productImage(products[0])} alt="" style={{ width: 280, height: 320, objectFit: 'cover', borderRadius: 12 }} />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Breadcrumb style categories */}
      <section style={{ background: '#f9fafb', padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 16, overflowX: 'auto', fontSize: 14 }}>
          <button style={{ background: accent, color: '#fff', border: 0, borderRadius: 20, padding: '8px 20px', fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer' }}>All</button>
          {['Fashion', 'Accessories', 'Home', 'Beauty', 'Sale'].map((cat) => (
            <button key={cat} onClick={() => navigate('/products')} style={{ background: '#fff', color: text, border: '1px solid #e5e7eb', borderRadius: 20, padding: '8px 20px', whiteSpace: 'nowrap', cursor: 'pointer' }}>
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Description */}
      {(canManage || descText) && (
        <section
          data-edit-path="layout.categories"
          onClick={() => canManage && onSelect('layout.categories')}
          style={{ padding: '40px 24px' }}
        >
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ color: descColor, fontSize: descSize, lineHeight: 1.8 }}>
              {descText || (canManage ? 'Add your store description here...' : '')}
            </p>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section
        data-edit-path="layout.grid"
        onClick={() => canManage && onSelect('layout.grid')}
        style={{ maxWidth: 1200, margin: '0 auto', padding: `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Featured Products</h2>
          <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: accent, fontWeight: 600, cursor: 'pointer' }}>
            View All →
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
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
                border: '1px solid #e5e7eb',
                borderRadius: cardRadius,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: `transform ${animationSpeed}ms, box-shadow ${animationSpeed}ms`,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = `scale(${hoverScale})`; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ aspectRatio: '1', background: '#f9fafb' }}>
                <img src={productImage(p)} alt={productTitle(p)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: 14 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {productTitle(p)}
                </h3>
                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: accent, fontWeight: 700, fontSize: 16 }}>{formatPrice(Number(p.price) || 0)}</span>
                  <button style={{ background: accent, border: 0, borderRadius: 6, padding: '8px 14px', color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                    Order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust badges */}
      <section style={{ background: '#f9fafb', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 24, textAlign: 'center' }}>
          {[
            { icon: '🚚', text: 'Free Shipping' },
            { icon: '🔒', text: 'Secure Payment' },
            { icon: '↩️', text: 'Easy Returns' },
            { icon: '💬', text: '24/7 Support' },
          ].map((badge) => (
            <div key={badge.text} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 28 }}>{badge.icon}</span>
              <span style={{ fontSize: 13, color: muted }}>{badge.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={() => canManage && onSelect('layout.footer')}
        style={{ background: text, color: '#fff', padding: '48px 24px' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 32 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>{storeName}</div>
            <p style={{ opacity: 0.7, fontSize: 14, lineHeight: 1.7 }}>
              Your trusted destination for quality products.
            </p>
          </div>
          {['Shop', 'Help', 'Company'].map((section) => (
            <div key={section}>
              <h5 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>{section}</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, opacity: 0.7 }}>
                <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>Link 1</a>
                <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>Link 2</a>
                <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>Link 3</a>
              </div>
            </div>
          ))}
        </div>
        <div style={{ maxWidth: 1200, margin: '32px auto 0', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', fontSize: 13, opacity: 0.6 }}>
          © {new Date().getFullYear()} {storeName}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
