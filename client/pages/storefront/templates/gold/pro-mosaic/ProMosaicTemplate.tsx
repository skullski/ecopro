import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';

/**
 * PRO MOSAIC - Pinterest-style masonry grid template.
 * Features: Variable height cards, masonry layout, image-first design.
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

export default function ProMosaicTemplate(props: TemplateProps) {
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

  // Mosaic theme - light with pink accent
  const bg = asString(settings.template_bg_color) || '#fefefe';
  const text = asString(settings.template_text_color) || '#18181b';
  const muted = asString(settings.template_muted_color) || '#71717a';
  const accent = asString(settings.template_accent_color) || '#ec4899';

  // Layout settings
  const gridColumns = resolveInt(settings.template_grid_columns, 4, 2, 6);
  const gridGap = resolveInt(settings.template_grid_gap, 16, 0, 48);
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 48, 24, 96);
  const animationSpeed = resolveInt(settings.template_animation_speed, 200, 100, 500);
  const hoverScale = asString(settings.template_hover_scale) || '1.02';
  const cardRadius = resolveInt(settings.template_card_border_radius, 12, 0, 32);

  const storeName = asString(settings.store_name) || 'MOSAIC';
  const heroTitle = asString(settings.template_hero_heading) || 'Discover Your Style';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'A curated collection of unique finds';
  const cta = asString(settings.template_button_text) || 'Start Exploring';

  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 20) || [];

  const descText = asString(settings.template_description_text);
  const descColor = asString(settings.template_description_color) || muted;
  const descSize = resolveInt(settings.template_description_size, 15, 10, 32);

  // Assign random-ish heights to products for masonry effect
  const getAspectRatio = (idx: number) => {
    const ratios = ['3/4', '1/1', '4/5', '2/3', '1/1', '3/4'];
    return ratios[idx % ratios.length];
  };

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
      {/* Header - Clean with search bar */}
      <header
        data-edit-path="layout.header"
        onClick={() => canManage && onSelect('layout.header')}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: bg,
          borderBottom: '1px solid #e4e4e7',
          padding: '16px 24px',
        }}
      >
        <div style={{ maxWidth: 1600, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: accent }}>{storeName}</span>
            {!isMobile && (
              <div style={{ display: 'flex', gap: 20, fontSize: 14, color: muted }}>
                <button onClick={() => navigate('/')} style={{ background: 'none', border: 0, color: 'inherit', cursor: 'pointer' }}>Home</button>
                <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: 'inherit', cursor: 'pointer' }}>Shop</button>
                <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: 'inherit', cursor: 'pointer' }}>Collections</button>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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

      {/* Hero - Compact with featured items */}
      <section
        data-edit-path="layout.hero"
        onClick={() => canManage && onSelect('layout.hero')}
        style={{
          background: `linear-gradient(135deg, ${accent}10, ${accent}05)`,
          padding: isMobile ? '40px 20px' : '60px 40px',
        }}
      >
        <div style={{ maxWidth: 1600, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 40, alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: isMobile ? 36 : 56, fontWeight: 800, lineHeight: 1.1, margin: 0 }}>
                {heroTitle}
              </h1>
              <p style={{ marginTop: 16, fontSize: 17, color: muted, lineHeight: 1.7 }}>
                {heroSubtitle}
              </p>
              <button
                onClick={() => navigate('/products')}
                style={{
                  marginTop: 28,
                  background: accent,
                  border: 0,
                  borderRadius: 8,
                  padding: '14px 32px',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: 'pointer',
                }}
              >
                {cta}
              </button>
            </div>

            {/* Mini masonry preview */}
            {!isMobile && products.length >= 4 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: 12 }}>
                {products.slice(0, 6).map((p, idx) => (
                  <div
                    key={p.id}
                    style={{
                      borderRadius: 12,
                      overflow: 'hidden',
                      aspectRatio: getAspectRatio(idx),
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                  >
                    <img src={productImage(p)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Description */}
      {(canManage || descText) && (
        <section
          data-edit-path="layout.categories"
          onClick={() => canManage && onSelect('layout.categories')}
          style={{ padding: '40px 24px', textAlign: 'center' }}
        >
          <p style={{ maxWidth: 700, margin: '0 auto', color: descColor, fontSize: descSize, lineHeight: 1.8 }}>
            {descText || (canManage ? 'Add description...' : '')}
          </p>
        </section>
      )}

      {/* Products - Masonry grid */}
      <section
        data-edit-path="layout.grid"
        onClick={() => canManage && onSelect('layout.grid')}
        style={{ maxWidth: 1600, margin: '0 auto', padding: `${sectionSpacing}px ${baseSpacing * 1.5}px ${sectionSpacing * 1.6}px` }}
      >
        <div style={{ marginBottom: baseSpacing * 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Browse All</h2>
          <span style={{ color: muted, fontSize: 14 }}>{products.length} items</span>
        </div>

        {/* CSS Columns for masonry effect */}
        <div
          style={{
            columnCount: isMobile ? 2 : gridColumns,
            columnGap: gridGap,
          }}
        >
          {products.map((p, idx) => (
            <div
              key={p.id}
              data-edit-path={`layout.grid.items.${p.id}`}
              onClick={(e) => {
                if (canManage) { e.stopPropagation(); onSelect(`layout.grid.items.${p.id}`); return; }
                if ((p as any).slug) navigate((p as any).slug);
              }}
              style={{
                breakInside: 'avoid',
                marginBottom: gridGap,
                borderRadius: cardRadius,
                overflow: 'hidden',
                background: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                cursor: 'pointer',
                transition: `transform ${animationSpeed}ms ease, box-shadow ${animationSpeed}ms ease`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = `scale(${hoverScale}) translateY(-4px)`;
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
              }}
            >
              <div style={{ aspectRatio: getAspectRatio(idx) }}>
                <img src={productImage(p)} alt={productTitle(p)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {productTitle(p)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: accent, fontWeight: 700 }}>{formatPrice(Number(p.price) || 0)}</span>
                  <button
                    style={{
                      background: '#f4f4f5',
                      border: 0,
                      borderRadius: 6,
                      padding: '6px 12px',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={() => canManage && onSelect('layout.footer')}
        style={{
          borderTop: '1px solid #e4e4e7',
          padding: '40px 24px',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: 18, fontWeight: 800, color: accent }}>{storeName}</span>
        <p style={{ color: muted, fontSize: 13, marginTop: 12 }}>© {new Date().getFullYear()} All rights reserved.</p>
      </footer>
    </div>
  );
}
