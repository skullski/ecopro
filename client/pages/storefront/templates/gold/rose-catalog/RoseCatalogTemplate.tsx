import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';

/**
 * ROSE CATALOG - Soft rose pink with elegant catalog display.
 * Features: Rose pink accents, clean catalog layout, filter options.
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

export default function RoseCatalogTemplate(props: TemplateProps) {
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

  // Rose theme
  const bg = asString(settings.template_bg_color) || '#fff1f2';
  const text = asString(settings.template_text_color) || '#1c1917';
  const muted = asString(settings.template_muted_color) || '#78716c';
  const accent = asString(settings.template_accent_color) || '#e11d48';

  const storeName = asString(settings.store_name) || 'Rose Catalog';
  const heroTitle = asString(settings.template_hero_heading) || 'Curated With Love';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Discover our handpicked collection of beautiful products';
  const cta = asString(settings.template_button_text) || 'Browse Catalog';

  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 16) || [];

  const descText = asString(settings.template_description_text);
  const descColor = asString(settings.template_description_color) || muted;
  const descSize = resolveInt(settings.template_description_size, 15, 10, 32);

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
      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={() => canManage && onSelect('layout.header')}
        style={{
          background: '#fff',
          padding: '16px 24px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt="" style={{ width: 36, height: 36, borderRadius: '50%' }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                R
              </div>
            )}
            <span style={{ fontSize: 20, fontWeight: 700 }}>{storeName}</span>
          </div>
          
          {!isMobile && (
            <nav style={{ display: 'flex', gap: 28, fontSize: 14 }}>
              <button onClick={() => navigate('/')} style={{ background: 'none', border: 0, color: text, cursor: 'pointer' }}>Home</button>
              <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: text, cursor: 'pointer' }}>Catalog</button>
              <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: text, cursor: 'pointer' }}>New Arrivals</button>
              <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: text, cursor: 'pointer' }}>Sale</button>
            </nav>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button style={{ background: 'none', border: 0, fontSize: 18, cursor: 'pointer' }}>🔍</button>
            <button style={{ background: accent, border: 0, borderRadius: 20, padding: '10px 20px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
              Cart (0)
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        data-edit-path="layout.hero"
        onClick={() => canManage && onSelect('layout.hero')}
        style={{
          padding: isMobile ? '60px 24px' : '80px 40px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: `${accent}15`, color: accent, padding: '8px 20px', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
            🌹 New Season
          </div>
          <h1 style={{ fontSize: isMobile ? 36 : 52, fontWeight: 700, lineHeight: 1.15, margin: 0 }}>
            {heroTitle}
          </h1>
          <p style={{ marginTop: 20, fontSize: 17, color: muted, lineHeight: 1.8 }}>
            {heroSubtitle}
          </p>
          <button
            onClick={() => navigate('/products')}
            style={{
              marginTop: 32,
              background: accent,
              border: 0,
              borderRadius: 24,
              padding: '16px 36px',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {cta}
          </button>
        </div>
      </section>

      {/* Featured row */}
      {products.length >= 4 && (
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 16 }}>
            {products.slice(0, 4).map((p) => (
              <div
                key={p.id}
                onClick={() => (p as any).slug && navigate((p as any).slug)}
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
              >
                <div style={{ aspectRatio: '4/3' }}>
                  <img src={productImage(p)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Description */}
      {(canManage || descText) && (
        <section
          data-edit-path="layout.categories"
          onClick={() => canManage && onSelect('layout.categories')}
          style={{ padding: '40px 24px', background: '#fff' }}
        >
          <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ color: descColor, fontSize: descSize, lineHeight: 1.9 }}>
              {descText || (canManage ? 'Add your catalog description...' : '')}
            </p>
          </div>
        </section>
      )}

      {/* Catalog filters */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Our Catalog</h2>
          <div style={{ display: 'flex', gap: 12 }}>
            <select style={{ padding: '10px 16px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14, background: '#fff' }}>
              <option>All Categories</option>
              <option>Fashion</option>
              <option>Beauty</option>
              <option>Home</option>
            </select>
            <select style={{ padding: '10px 16px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14, background: '#fff' }}>
              <option>Sort: Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>
      </section>

      {/* Products grid */}
      <section
        data-edit-path="layout.grid"
        onClick={() => canManage && onSelect('layout.grid')}
        style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px 60px' }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: 20,
          }}
        >
          {products.slice(0, 12).map((p, idx) => (
            <div
              key={p.id}
              data-edit-path={`layout.grid.items.${p.id}`}
              onClick={(e) => {
                if (canManage) { e.stopPropagation(); onSelect(`layout.grid.items.${p.id}`); return; }
                if ((p as any).slug) navigate((p as any).slug);
              }}
              style={{
                background: '#fff',
                borderRadius: 16,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ aspectRatio: '1', position: 'relative' }}>
                <img src={productImage(p)} alt={productTitle(p)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button style={{ position: 'absolute', top: 12, right: 12, background: '#fff', border: 0, borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  ♡
                </button>
                {idx < 2 && (
                  <span style={{ position: 'absolute', bottom: 12, left: 12, background: accent, color: '#fff', padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
                    NEW
                  </span>
                )}
              </div>
              <div style={{ padding: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {productTitle(p)}
                </h3>
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: accent, fontWeight: 700, fontSize: 16 }}>{formatPrice(Number(p.price) || 0)}</span>
                  <button style={{ background: accent, border: 0, borderRadius: 8, padding: '8px 14px', color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button
            onClick={() => navigate('/products')}
            style={{
              background: 'transparent',
              border: `2px solid ${accent}`,
              borderRadius: 24,
              padding: '14px 40px',
              color: accent,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Load More Products
          </button>
        </div>
      </section>

      {/* Newsletter */}
      <section style={{ background: accent, padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
          <h3 style={{ color: '#fff', fontSize: 28, fontWeight: 700, margin: 0 }}>Stay Updated</h3>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: 12 }}>Subscribe to our newsletter for new arrivals and exclusive offers</p>
          <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
            <input type="email" placeholder="Your email" style={{ flex: 1, padding: '14px 20px', border: 0, borderRadius: 24, fontSize: 14 }} />
            <button style={{ background: text, border: 0, borderRadius: 24, padding: '14px 24px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
              Subscribe
            </button>
          </div>
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
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>{storeName}</div>
            <p style={{ color: muted, fontSize: 14, lineHeight: 1.7 }}>
              Curated products with love and care.
            </p>
          </div>
          {['Shop', 'Help', 'Connect'].map((section) => (
            <div key={section}>
              <h5 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>{section}</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: muted }}>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Link</a>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Link</a>
              </div>
            </div>
          ))}
        </div>
        <div style={{ maxWidth: 1200, margin: '32px auto 0', paddingTop: 24, borderTop: '1px solid #f3f4f6', textAlign: 'center', fontSize: 13, color: muted }}>
          © {new Date().getFullYear()} {storeName}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
