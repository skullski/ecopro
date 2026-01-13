import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';

/**
 * PRO CATALOG - List-view focused template with horizontal product rows.
 * Features: List view, horizontal cards, detailed info, catalog style.
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

export default function ProCatalogTemplate(props: TemplateProps) {
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

  // Catalog theme - light gray with purple accent
  const bg = asString(settings.template_bg_color) || '#f9fafb';
  const text = asString(settings.template_text_color) || '#111827';
  const muted = asString(settings.template_muted_color) || '#6b7280';
  const accent = asString(settings.template_accent_color) || '#7c3aed';

  

  const productTitleColor = asString(settings.template_product_title_color) || text;
  const productPriceColor = asString(settings.template_product_price_color) || accent;

  const cardBg = asString(settings.template_card_bg) || "#ffffff";
const storeName = asString(settings.store_name) || 'CATALOG';
  
  const copyright = asString(settings.template_copyright) || `© ${new Date().getFullYear()} ${storeName}`;
const heroTitle = asString(settings.template_hero_heading) || 'The Complete Collection';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Browse our full inventory with detailed specifications';
  const cta = asString(settings.template_button_text) || 'View All';

  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 20) || [];

  

  const sectionTitle = asString(settings.template_featured_title) || "Featured";
  const sectionSubtitle = asString(settings.template_featured_subtitle) || "";
  const addToCartLabel = asString(settings.template_add_to_cart_label) || "View";
const descText = (asString(settings.template_description_text) || asString(settings.store_description)).trim();
const descColor = asString(settings.template_description_color) || muted;
  const descSize = resolveInt(settings.template_description_size, 14, 10, 32);

  // Layout settings
  const gridColumns = resolveInt(settings.template_grid_columns, 4, 2, 6);
  const gridGap = resolveInt(settings.template_grid_gap, 12, 8, 48);
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 40, 24, 96);
  const animationSpeed = resolveInt(settings.template_animation_speed, 200, 100, 500);
  const hoverScale = asString(settings.template_hover_scale) || '1.01';
  const cardRadius = resolveInt(settings.template_card_border_radius, 12, 0, 32);

  return (
    <div
      data-edit-path="__root"
      onClick={() => canManage && onSelect("__root")}
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
          background: '#fff',
          borderBottom: '1px solid #e5e7eb',
          padding: '16px 24px',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: 8, background: accent }} />
            )}
            <span style={{ fontSize: 18, fontWeight: 800 }}>{storeName}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {!isMobile && (
              <>
                <button onClick={() => navigate('/')} style={{ background: 'none', border: 0, color: muted, cursor: 'pointer', fontSize: 14 }}>Home</button>
                <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: muted, cursor: 'pointer', fontSize: 14 }}>Products</button>
              </>
            )}
            <button
              onClick={() => navigate('/products')}
              style={{
                background: accent,
                border: 0,
                borderRadius: 8,
                padding: '10px 20px',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Shop Now
            </button>
          </div>
        </div>
      </header>

      {/* Hero - Split with stats */}
      <section
        data-edit-path="layout.hero"
        onClick={() => canManage && onSelect('layout.hero')}
        style={{
          background: '#fff',
          padding: isMobile ? '40px 24px' : '60px 40px',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 40, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, color: accent, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 12 }}>
                FULL CATALOG
              </div>
              <h1 style={{ fontSize: isMobile ? 32 : 48, fontWeight: 800, lineHeight: 1.1, margin: 0 }}>
                {heroTitle}
              </h1>
              <p style={{ marginTop: 16, fontSize: 16, color: muted, lineHeight: 1.7 }}>
                {heroSubtitle}
              </p>
              <button
                onClick={() => navigate('/products')}
                style={{
                  marginTop: 24,
                  background: accent,
                  border: 0,
                  borderRadius: 8,
                  padding: '14px 28px',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {cta}
              </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {[
                { label: 'Products', value: products.length + '+' },
                { label: 'Categories', value: '12' },
                { label: 'In Stock', value: '98%' },
                { label: 'Shipping', value: 'Free' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: bg,
                    borderRadius: 12,
                    padding: 20,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 28, fontWeight: 800, color: accent }}>{stat.value}</div>
                  <div style={{ fontSize: 13, color: muted, marginTop: 4 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      {(canManage || descText) && (
        <section
          data-edit-path="layout.categories"
          onClick={() => canManage && onSelect('layout.categories')}
          style={{ background: '#fff', padding: '24px 24px 40px', borderBottom: '1px solid #e5e7eb' }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <p style={{ color: descColor, fontSize: descSize, lineHeight: 1.7, margin: 0 }}>
              {descText || (canManage ? 'Add description...' : '')}
            </p>
          </div>
        </section>
      )}

      {/* Products - List view */}
      <section
        data-edit-path="layout.grid"
        onClick={() => canManage && onSelect('layout.grid')}
        style={{ maxWidth: 1200, margin: '0 auto', padding: `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 data-edit-path="layout.featured.title" style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{sectionTitle}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ background: accent, border: 0, borderRadius: 6, padding: '8px 12px', color: '#fff', fontSize: 12, cursor: 'pointer' }}>List</button>
            <button style={{ background: '#e5e7eb', border: 0, borderRadius: 6, padding: '8px 12px', color: text, fontSize: 12, cursor: 'pointer' }}>Grid</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: gridGap }}>
          {products.map((p, idx) => (
            <div
              key={p.id}
              data-edit-path={`layout.grid.items.${p.id}`}
              onClick={(e) => {
                if (canManage) { e.stopPropagation(); onSelect(`layout.grid.items.${p.id}`); return; }
                if ((p as any).slug) navigate((p as any).slug);
              }}
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '100px 1fr' : '140px 1fr 160px',
                gap: isMobile ? 16 : baseSpacing,
                alignItems: 'center',
                background: '#fff',
                borderRadius: cardRadius,
                padding: baseSpacing,
                cursor: 'pointer',
                transition: `box-shadow ${animationSpeed}ms, transform ${animationSpeed}ms`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                e.currentTarget.style.transform = `scale(${hoverScale})`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {/* Image */}
              <div style={{ width: isMobile ? 100 : 140, height: isMobile ? 100 : 140, borderRadius: 8, overflow: 'hidden', background: '#f3f4f6' }}>
                <img src={productImage(p)} alt={productTitle(p)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              {/* Info */}
              <div>
                <div style={{ fontSize: 11, color: muted, marginBottom: 4 }}>#{String(idx + 1).padStart(3, '0')}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{productTitle(p)}</div>
                <p data-edit-path="layout.featured.subtitle" style={{ fontSize: 13, color: muted, lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>{sectionSubtitle}</p>
                {isMobile && (
                  <div style={{ marginTop: 8, fontSize: 18, fontWeight: 800, color: accent }}>
                    {formatPrice(Number(p.price) || 0)}
                  </div>
                )}
              </div>

              {/* Price & action - desktop */}
              {!isMobile && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: accent }}>{formatPrice(Number(p.price) || 0)}</div>
                  <button
                    style={{
                      marginTop: 12,
                      background: accent,
                      border: 0,
                      borderRadius: 6,
                      padding: '10px 20px',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    View Details
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
          {[1, 2, 3, '...', 10].map((page, i) => (
            <button
              key={i}
              style={{
                width: 40,
                height: 40,
                background: page === 1 ? accent : '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                color: page === 1 ? '#fff' : text,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {page}
            </button>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={() => canManage && onSelect('layout.footer')}
        style={{
          background: '#fff',
          borderTop: '1px solid #e5e7eb',
          padding: '40px 24px',
          marginTop: 40,
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, background: accent, borderRadius: 6 }} />
            <span style={{ fontWeight: 800 }}>{storeName}</span>
          </div>
          <div style={{ display: 'flex', gap: 20, fontSize: 13, color: muted }}>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Contact</a>
          </div>
          <span style={{ color: muted, fontSize: 13 }}>© {new Date().getFullYear()} {storeName}</span>
        </div>
      </footer>
    </div>
  );
}
