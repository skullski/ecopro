import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';

/**
 * MAGENTA MALL - Bold magenta marketplace with sidebar and dense grid.
 * Features: Magenta theme, sidebar categories, promotional banners, dense layout.
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

export default function MagentaMallTemplate(props: TemplateProps) {
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
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [(props as any).forcedBreakpoint]);

  // Magenta theme
  const bg = asString(settings.template_bg_color) || '#fdf2f8';
  const text = asString(settings.template_text_color) || '#1f2937';
  const muted = asString(settings.template_muted_color) || '#6b7280';
  const accent = asString(settings.template_accent_color) || '#db2777';

  const storeName = asString(settings.store_name) || 'Magenta Mall';
  const heroTitle = asString(settings.template_hero_heading) || 'Mega Sale Event';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Up to 70% off on thousands of items';
  const cta = asString(settings.template_button_text) || 'Shop Deals';

  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 24) || [];

  const descText = asString(settings.template_description_text);
  const descColor = asString(settings.template_description_color) || muted;
  const descSize = resolveInt(settings.template_description_size, 14, 10, 32);

  const categories = ['All', 'Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Toys'];

  return (
    <div
      className="ecopro-storefront"
      style={{
        minHeight: '100vh',
        background: '#f3f4f6',
        color: text,
        fontFamily: '"Inter", system-ui, sans-serif',
      }}
    >
      {/* Top bar */}
      <div style={{ background: accent, color: '#fff', padding: '8px 16px', fontSize: 12, display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
        <span>📞 Support: +1 234 567 8900</span>
        <span>🚚 Free shipping on orders over $50</span>
        <span>💳 Buy now, pay later available</span>
      </div>

      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={() => canManage && onSelect('layout.header')}
        style={{
          background: '#fff',
          padding: '12px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt="" style={{ height: 36 }} />
            ) : (
              <span style={{ fontSize: 24, fontWeight: 800, color: accent }}>{storeName}</span>
            )}
          </div>
          
          <div style={{ flex: 1, maxWidth: 500 }}>
            <div style={{ display: 'flex', border: `2px solid ${accent}`, borderRadius: 8, overflow: 'hidden' }}>
              <input
                type="text"
                placeholder="Search products..."
                style={{ flex: 1, padding: '12px 16px', border: 0, fontSize: 14, outline: 'none' }}
              />
              <button style={{ background: accent, border: 0, padding: '0 20px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                Search
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <button style={{ background: 'none', border: 0, color: text, cursor: 'pointer', fontSize: 13 }}>👤 Account</button>
            <button style={{ background: accent, border: 0, borderRadius: 8, padding: '10px 18px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
              🛒 Cart
            </button>
          </div>
        </div>
      </header>

      {/* Category nav */}
      <nav style={{ background: accent, padding: '10px 20px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', gap: 24, overflowX: 'auto' }}>
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => navigate('/products')}
              style={{ 
                background: 'none', 
                border: 0, 
                color: '#fff', 
                cursor: 'pointer', 
                whiteSpace: 'nowrap',
                fontWeight: 500,
                fontSize: 14,
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      {/* Main content */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '20px', display: 'flex', gap: 20 }}>
        {/* Sidebar - Desktop */}
        {!isMobile && (
          <aside style={{ width: 220, flexShrink: 0 }}>
            <div style={{ background: '#fff', borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: accent }}>Categories</h4>
              {categories.slice(1).map((cat) => (
                <button
                  key={cat}
                  onClick={() => navigate('/products')}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    background: 'none',
                    border: 0,
                    padding: '10px 0',
                    borderBottom: '1px solid #f3f4f6',
                    color: text,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Promo banner */}
            <div style={{ background: `linear-gradient(135deg, ${accent}, #f472b6)`, borderRadius: 8, padding: 20, color: '#fff', textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 800 }}>50%</div>
              <div style={{ fontSize: 14, marginTop: 4 }}>OFF SALE</div>
              <button style={{ marginTop: 12, background: '#fff', border: 0, borderRadius: 6, padding: '10px 20px', color: accent, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
                Shop Now
              </button>
            </div>
          </aside>
        )}

        {/* Main grid */}
        <main style={{ flex: 1 }}>
          {/* Hero banner */}
          <section
            data-edit-path="layout.hero"
            onClick={() => canManage && onSelect('layout.hero')}
            style={{
              background: `linear-gradient(135deg, ${accent}, #9333ea)`,
              borderRadius: 12,
              padding: isMobile ? '32px 20px' : '40px 32px',
              color: '#fff',
              marginBottom: 20,
            }}
          >
            <h1 style={{ fontSize: isMobile ? 28 : 36, fontWeight: 800, margin: 0 }}>{heroTitle}</h1>
            <p style={{ marginTop: 8, opacity: 0.9 }}>{heroSubtitle}</p>
            <button
              onClick={() => navigate('/products')}
              style={{
                marginTop: 20,
                background: '#fff',
                border: 0,
                borderRadius: 8,
                padding: '12px 28px',
                color: accent,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {cta}
            </button>
          </section>

          {/* Description */}
          {(canManage || descText) && (
            <section
              data-edit-path="layout.categories"
              onClick={() => canManage && onSelect('layout.categories')}
              style={{ background: '#fff', borderRadius: 8, padding: 16, marginBottom: 20 }}
            >
              <p style={{ color: descColor, fontSize: descSize, lineHeight: 1.7, margin: 0 }}>
                {descText || (canManage ? 'Add store description...' : '')}
              </p>
            </section>
          )}

          {/* Products header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Products ({products.length})</h2>
            <select style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13 }}>
              <option>Sort: Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>

          {/* Products grid */}
          <section
            data-edit-path="layout.grid"
            onClick={() => canManage && onSelect('layout.grid')}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                gap: 12,
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
                    borderRadius: 8,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
                >
                  <div style={{ aspectRatio: '1', position: 'relative', background: '#f9fafb' }}>
                    <img src={productImage(p)} alt={productTitle(p)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {idx < 3 && (
                      <span style={{ position: 'absolute', top: 8, left: 8, background: '#ef4444', color: '#fff', padding: '4px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                        -30%
                      </span>
                    )}
                  </div>
                  <div style={{ padding: 10 }}>
                    <h3 style={{ fontSize: 12, fontWeight: 500, margin: 0, height: 32, overflow: 'hidden', lineHeight: 1.3 }}>
                      {productTitle(p)}
                    </h3>
                    <div style={{ marginTop: 8 }}>
                      <span style={{ color: accent, fontWeight: 800, fontSize: 14 }}>{formatPrice(Number(p.price) || 0)}</span>
                      <span style={{ color: muted, fontSize: 11, textDecoration: 'line-through', marginLeft: 6 }}>{formatPrice((Number(p.price) || 0) * 1.3)}</span>
                    </div>
                    <button style={{ marginTop: 8, width: '100%', background: accent, border: 0, borderRadius: 6, padding: '8px', color: '#fff', fontWeight: 600, fontSize: 11, cursor: 'pointer' }}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                style={{
                  width: 36,
                  height: 36,
                  background: page === 1 ? accent : '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  color: page === 1 ? '#fff' : text,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {page}
              </button>
            ))}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={() => canManage && onSelect('layout.footer')}
        style={{ background: '#1f2937', color: '#fff', padding: '48px 24px', marginTop: 40 }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 32 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: accent, marginBottom: 16 }}>{storeName}</div>
            <p style={{ opacity: 0.6, fontSize: 13, lineHeight: 1.7 }}>
              Your one-stop shop for everything.
            </p>
          </div>
          {['Shop', 'Support', 'Company'].map((section) => (
            <div key={section}>
              <h5 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>{section}</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, opacity: 0.6 }}>
                <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>Link</a>
                <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>Link</a>
              </div>
            </div>
          ))}
        </div>
        <div style={{ maxWidth: 1400, margin: '24px auto 0', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', fontSize: 12, opacity: 0.5 }}>
          © {new Date().getFullYear()} {storeName}
        </div>
      </footer>
    </div>
  );
}
