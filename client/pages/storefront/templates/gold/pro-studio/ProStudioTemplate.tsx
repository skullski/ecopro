import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';

/**
 * PRO STUDIO - Bold creative agency style with asymmetric layouts.
 * Features: Bold typography, asymmetric grid, vibrant accents, creative feel.
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

export default function ProStudioTemplate(props: TemplateProps) {
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

  // Studio theme - dark with pink/coral accent
  const bg = asString(settings.template_bg_color) || '#0a0a0a';
  const text = asString(settings.template_text_color) || '#ffffff';
  const muted = asString(settings.template_muted_color) || '#737373';
  const accent = asString(settings.template_accent_color) || '#f43f5e';

  

  const productTitleColor = asString(settings.template_product_title_color) || text;
  const productPriceColor = asString(settings.template_product_price_color) || accent;

  const cardBg = asString(settings.template_card_bg) || "#ffffff";
const storeName = asString(settings.store_name) || 'STUDIO';
  
  const copyright = asString(settings.template_copyright) || `© ${new Date().getFullYear()} ${storeName}`;
const heroTitle = asString(settings.template_hero_heading) || 'Make a Statement';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Bold designs for bold people';
  const cta = asString(settings.template_button_text) || 'Shop Now';

  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];

  

  const sectionTitle = asString(settings.template_featured_title) || "Featured";
  const sectionSubtitle = asString(settings.template_featured_subtitle) || "";
  const addToCartLabel = asString(settings.template_add_to_cart_label) || "View";
const descText = (asString(settings.template_description_text) || asString(settings.store_description)).trim();
const descColor = asString(settings.template_description_color) || muted;
  const descSize = resolveInt(settings.template_description_size, 15, 10, 32);

  // Layout settings
  const gridColumns = resolveInt(settings.template_grid_columns, 4, 2, 6);
  const gridGap = resolveInt(settings.template_grid_gap, 16, 8, 48);
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 80, 24, 120);
  const animationSpeed = resolveInt(settings.template_animation_speed, 400, 100, 800);
  const hoverScale = asString(settings.template_hover_scale) || '1.05';
  const cardRadius = resolveInt(settings.template_card_border_radius, 0, 0, 32);

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
      {/* Header - Bold and visible */}
      <header
        data-edit-path="layout.header"
        onClick={() => canManage && onSelect('layout.header')}
        style={{
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #262626',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {asString(settings.store_logo) ? (
            <img src={asString(settings.store_logo)} alt="" style={{ width: 40, height: 40, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 40, height: 40, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18 }}>
              S
            </div>
          )}
          <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em' }}>{storeName}</span>
        </div>
        <button
          onClick={() => navigate('/products')}
          style={{
            background: accent,
            border: 0,
            padding: '12px 28px',
            color: '#fff',
            fontWeight: 800,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          {cta}
        </button>
      </header>

      {/* Hero - Giant typography with overlapping elements */}
      <section
        data-edit-path="layout.hero"
        onClick={() => canManage && onSelect('layout.hero')}
        style={{
          position: 'relative',
          padding: isMobile ? '60px 24px' : '100px 40px',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto', position: 'relative' }}>
          <h1
            style={{
              fontSize: isMobile ? 48 : 120,
              fontWeight: 900,
              lineHeight: 0.9,
              margin: 0,
              letterSpacing: '-0.04em',
              textTransform: 'uppercase',
            }}
          >
            {heroTitle.split(' ').map((word, i) => (
              <span key={i} style={{ display: 'block', color: i % 2 === 1 ? accent : text }}>
                {word}
              </span>
            ))}
          </h1>

          {/* Floating product preview */}
          {!isMobile && products[0] && (
            <div
              style={{
                position: 'absolute',
                right: 40,
                top: '50%',
                transform: 'translateY(-50%) rotate(5deg)',
                width: 300,
                background: '#171717',
                padding: 16,
              }}
            >
              <div style={{ aspectRatio: '1', overflow: 'hidden' }}>
                <img src={productImage(products[0])} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ marginTop: 12, fontSize: 14, fontWeight: 700 }}>{productTitle(products[0])}</div>
              <div style={{ color: accent, fontWeight: 800, marginTop: 4 }}>{formatPrice(Number(products[0].price) || 0)}</div>
            </div>
          )}

          <p style={{ marginTop: 32, fontSize: 16, color: muted, maxWidth: 500, lineHeight: 1.7 }}>
            {heroSubtitle}
          </p>

          <div style={{ marginTop: 32, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/products')}
              style={{
                background: '#fff',
                border: 0,
                padding: '16px 32px',
                color: '#000',
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              BROWSE COLLECTION
            </button>
            <button
              onClick={() => navigate('/products')}
              style={{
                background: 'transparent',
                border: `2px solid ${accent}`,
                padding: '16px 32px',
                color: accent,
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              FEATURED →
            </button>
          </div>
        </div>
      </section>

      {/* Description */}
      {(canManage || descText) && (
        <section
          data-edit-path="layout.categories"
          onClick={() => canManage && onSelect('layout.categories')}
          style={{ padding: '40px 24px', borderTop: '1px solid #262626', borderBottom: '1px solid #262626' }}
        >
          <p style={{ maxWidth: 800, color: descColor, fontSize: descSize, lineHeight: 1.8 }}>
            {descText || (canManage ? 'Add description...' : '')}
          </p>
        </section>
      )}

      {/* Products - Asymmetric bento grid */}
      <section
        data-edit-path="layout.grid"
        onClick={() => canManage && onSelect('layout.grid')}
        style={{ padding: isMobile ? `${sectionSpacing / 2}px ${baseSpacing}px` : `${sectionSpacing}px ${baseSpacing * 2}px` }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
            <div>
              <div style={{ fontSize: 12, color: accent, fontWeight: 800, letterSpacing: '0.2em', marginBottom: 8 }}>PRODUCTS</div>
              <h2 data-edit-path="layout.featured.title" style={{ fontSize: isMobile ? 28 : 42, fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>{sectionTitle}</h2>
            </div>
            <button
              onClick={() => navigate('/products')}
              style={{ background: 'transparent', border: 0, color: text, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
            >
              View All
            </button>
          </div>

          {/* Bento grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : `repeat(${gridColumns}, 1fr)`,
              gridAutoRows: isMobile ? 'auto' : '200px',
              gap: gridGap,
            }}
          >
            {products.map((p, idx) => {
              // First item spans 2x2, some items span 2 cols
              const isLarge = idx === 0;
              const isWide = idx === 3 || idx === 6;

              return (
                <div
                  key={p.id}
                  data-edit-path={`layout.grid.items.${p.id}`}
                  onClick={(e) => {
                    if (canManage) { e.stopPropagation(); onSelect(`layout.grid.items.${p.id}`); return; }
                    if ((p as any).slug) navigate((p as any).slug);
                  }}
                  style={{
                    gridColumn: isMobile ? 'span 1' : isLarge ? 'span 2' : isWide ? 'span 2' : 'span 1',
                    gridRow: isMobile ? 'span 1' : isLarge ? 'span 2' : 'span 1',
                    background: '#171717',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    minHeight: isMobile ? 280 : 'auto',
                  }}
                >
                  <img
                    src={productImage(p)}
                    alt={productTitle(p)}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: `transform ${animationSpeed}ms`,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = `scale(${hoverScale})`)}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)',
                    }}
                  />
                  <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
                    <div style={{ fontSize: isLarge ? 18 : 14, fontWeight: 800 }}>{productTitle(p)}</div>
                    <div style={{ color: accent, fontWeight: 800, marginTop: 4, fontSize: isLarge ? 16 : 14 }}>
                      {formatPrice(Number(p.price) || 0)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={() => canManage && onSelect('layout.footer')}
        style={{
          borderTop: '1px solid #262626',
          padding: '40px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>S</div>
          <span style={{ fontWeight: 800 }}>{storeName}</span>
        </div>
        <span style={{ color: muted, fontSize: 13 }}>© {new Date().getFullYear()} All rights reserved.</span>
      </footer>
    </div>
  );
}
