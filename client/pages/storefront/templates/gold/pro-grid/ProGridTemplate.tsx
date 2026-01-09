import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';

/**
 * PRO GRID - Dense catalog grid template for large inventories.
 * Features: Compact cards, high density, filter-ready sidebar, catalog focus.
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

export default function ProGridTemplate(props: TemplateProps) {
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

  // Grid theme - clean white with blue accent
  const bg = asString(settings.template_bg_color) || '#ffffff';
  const text = asString(settings.template_text_color) || '#111827';
  const muted = asString(settings.template_muted_color) || '#6b7280';
  const accent = asString(settings.template_accent_color) || '#2563eb';

  const storeName = asString(settings.store_name) || 'GRID';
  const heroTitle = asString(settings.template_hero_heading) || 'Shop the Catalog';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Everything you need, organized and ready';
  const cta = asString(settings.template_button_text) || 'Browse All';

  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 30) || [];

  const descText = asString(settings.template_description_text);
  const descColor = asString(settings.template_description_color) || muted;
  const descSize = resolveInt(settings.template_description_size, 14, 10, 32);

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
      {/* Header - Functional with search */}
      <header
        data-edit-path="layout.header"
        onClick={() => canManage && onSelect('layout.header')}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: bg,
          borderBottom: '1px solid #e5e7eb',
          padding: '12px 20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt="" style={{ width: 32, height: 32, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 32, height: 32, background: accent, borderRadius: 6 }} />
            )}
            <span style={{ fontSize: 17, fontWeight: 800 }}>{storeName}</span>
          </div>

          {!isMobile && (
            <div style={{ flex: 1, maxWidth: 400 }}>
              <input
                type="text"
                placeholder="Search products..."
                value={props.searchQuery || ''}
                onChange={(e) => props.setSearchQuery?.(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>
          )}

          <button
            onClick={() => navigate('/products')}
            style={{
              background: accent,
              border: 0,
              borderRadius: 6,
              padding: '10px 18px',
              color: '#fff',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Shop
          </button>
        </div>
      </header>

      {/* Hero - Compact banner */}
      <section
        data-edit-path="layout.hero"
        onClick={() => canManage && onSelect('layout.hero')}
        style={{
          background: `linear-gradient(135deg, ${accent}, ${accent}dd)`,
          padding: isMobile ? '32px 20px' : '48px 40px',
          color: '#fff',
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <h1 style={{ fontSize: isMobile ? 28 : 40, fontWeight: 800, margin: 0 }}>{heroTitle}</h1>
          <p style={{ marginTop: 8, fontSize: 15, opacity: 0.9 }}>{heroSubtitle}</p>
          <button
            onClick={() => navigate('/products')}
            style={{
              marginTop: 20,
              background: '#fff',
              border: 0,
              borderRadius: 6,
              padding: '12px 24px',
              color: accent,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {cta}
          </button>
        </div>
      </section>

      {/* Description */}
      {(canManage || descText) && (
        <section
          data-edit-path="layout.categories"
          onClick={() => canManage && onSelect('layout.categories')}
          style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}
        >
          <p style={{ maxWidth: 800, color: descColor, fontSize: descSize, lineHeight: 1.7, margin: 0 }}>
            {descText || (canManage ? 'Add description...' : '')}
          </p>
        </section>
      )}

      {/* Main content with sidebar */}
      <div style={{ display: 'flex', maxWidth: 1600, margin: '0 auto' }}>
        {/* Sidebar - desktop only */}
        {!isMobile && (
          <aside style={{ width: 240, padding: '24px', borderRight: '1px solid #e5e7eb', flexShrink: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: muted, marginBottom: 16 }}>QUICK LINKS</div>
            {['All Products', 'New Arrivals', 'Best Sellers', 'On Sale'].map((item) => (
              <button
                key={item}
                onClick={() => navigate('/products')}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 0,
                  padding: '10px 0',
                  fontSize: 14,
                  color: text,
                  cursor: 'pointer',
                  borderBottom: '1px solid #f3f4f6',
                }}
              >
                {item}
              </button>
            ))}

            <div style={{ fontSize: 13, fontWeight: 700, color: muted, marginTop: 32, marginBottom: 16 }}>PRICE RANGE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Under $25', '$25 - $50', '$50 - $100', 'Over $100'].map((range) => (
                <label key={range} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                  <input type="checkbox" style={{ accentColor: accent }} />
                  {range}
                </label>
              ))}
            </div>
          </aside>
        )}

        {/* Products grid */}
        <section
          data-edit-path="layout.grid"
          onClick={() => canManage && onSelect('layout.grid')}
          style={{ flex: 1, padding: '24px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 14, color: muted }}>{products.length} products</span>
            <select style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13 }}>
              <option>Sort by: Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest</option>
            </select>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 12,
            }}
          >
            {products.map((p) => (
              <div
                key={p.id}
                data-edit-path={`layout.grid.items.${p.id}`}
                onClick={(e) => {
                  if (canManage) { e.stopPropagation(); onSelect(`layout.grid.items.${p.id}`); return; }
                  if ((p as any).slug) navigate((p as any).slug);
                }}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = accent)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
              >
                <div style={{ aspectRatio: '1', background: '#f9fafb' }}>
                  <img src={productImage(p)} alt={productTitle(p)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {productTitle(p)}
                  </div>
                  <div style={{ fontSize: 14, color: accent, fontWeight: 700, marginTop: 4 }}>
                    {formatPrice(Number(p.price) || 0)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load more */}
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <button
              onClick={() => navigate('/products')}
              style={{
                background: 'transparent',
                border: `1px solid ${accent}`,
                borderRadius: 6,
                padding: '12px 32px',
                color: accent,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Load More
            </button>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={() => canManage && onSelect('layout.footer')}
        style={{
          borderTop: '1px solid #e5e7eb',
          padding: '32px 24px',
          marginTop: 40,
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, background: accent, borderRadius: 4 }} />
            <span style={{ fontWeight: 700 }}>{storeName}</span>
          </div>
          <span style={{ color: muted, fontSize: 13 }}>© {new Date().getFullYear()} All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
