import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';

/**
 * PRO ZEN - Ultra minimal template with maximum whitespace.
 * Features: Extreme simplicity, lots of breathing room, typography focused.
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

export default function ProZenTemplate(props: TemplateProps) {
  const { settings, formatPrice, navigate } = props;
  const canManage = Boolean(props.canManage);
  const onSelect = (path: string) => {
    if (canManage && typeof (props as any).onSelect === 'function') {
      (props as any).onSelect(path);
    }
  };
  const select = (e: React.MouseEvent, path: string) => {
    if (!canManage) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect(path);
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

  // Zen theme - pure white with subtle blue accent
  const bg = asString(settings.template_bg_color) || '#ffffff';
  const text = asString(settings.template_text_color) || '#111827';
  const muted = asString(settings.template_muted_color) || '#9ca3af';
  const accent = asString(settings.template_accent_color) || '#3b82f6';

  

  const productTitleColor = asString(settings.template_product_title_color) || text;
  const productPriceColor = asString(settings.template_product_price_color) || accent;

  const cardBg = asString(settings.template_card_bg) || "#ffffff";
const logoUrl = asString(settings.store_logo) || asString((settings as any).logo_url);
  const storeName = asString(settings.store_name) || 'ZEN';
  
  const copyright = asString(settings.template_copyright) || `© ${new Date().getFullYear()} ${storeName}`;
const storeDescription = asString(settings.store_description);
  const heroTitle = asString(settings.template_hero_heading) || 'Less is More';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Curated essentials for mindful living';
  const cta = asString(settings.template_button_text) || 'Explore';

  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 9) || [];

  

  const sectionTitle = asString(settings.template_featured_title) || "Featured";
  const sectionSubtitle = asString(settings.template_featured_subtitle) || "";
  const addToCartLabel = asString(settings.template_add_to_cart_label) || "View";
const descText = asString(settings.template_description_text);
  const descColor = asString(settings.template_description_color) || muted;
  const descSize = resolveInt(settings.template_description_size, 16, 10, 32);

  // Layout settings
  const gridColumns = resolveInt(settings.template_grid_columns, 3, 2, 6);
  const gridGap = resolveInt(settings.template_grid_gap, 80, 24, 120);
  const baseSpacing = resolveInt(settings.template_spacing, 24, 8, 48);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 100, 40, 160);
  const animationSpeed = resolveInt(settings.template_animation_speed, 600, 100, 1000);
  const hoverScale = asString(settings.template_hover_scale) || '1.03';
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
      {/* Header - Invisible almost */}
      <header
        data-edit-path="layout.header"
        onClick={() => canManage && onSelect('layout.header')}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          padding: isMobile ? '20px' : '32px 48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          data-edit-path="layout.header.logo"
          onClick={(e) => select(e, 'layout.header.logo')}
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: canManage ? 'pointer' : 'default' }}
        >
          {logoUrl && (
            <img
              src={logoUrl}
              alt={storeName}
              style={{ width: 40, height: 40, borderRadius: 9999, objectFit: 'cover' }}
            />
          )}
          <span style={{ fontSize: 18, fontWeight: 300, letterSpacing: '0.3em' }}>{storeName}</span>
        </div>
        <button
          onClick={() => navigate('/products')}
          style={{
            background: 'transparent',
            border: 0,
            color: text,
            fontSize: 14,
            fontWeight: 400,
            cursor: 'pointer',
            textDecoration: 'underline',
            textUnderlineOffset: 4,
          }}
        >
          Shop
        </button>
      </header>

      {/* Hero - Maximum breathing room */}
      <section
        data-edit-path="layout.hero"
        onClick={() => canManage && onSelect('layout.hero')}
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: isMobile ? '100px 24px' : '0 48px',
        }}
      >
        <h1 style={{ fontSize: isMobile ? 42 : 72, fontWeight: 200, lineHeight: 1.1, margin: 0, letterSpacing: '-0.02em' }}>
          {heroTitle}
        </h1>
        <p style={{ marginTop: 24, fontSize: 18, color: muted, fontWeight: 300, maxWidth: 500 }}>
          {heroSubtitle}
        </p>
        <button
          onClick={() => navigate('/products')}
          style={{
            marginTop: 48,
            background: 'transparent',
            border: `1px solid ${text}`,
            padding: '16px 48px',
            color: text,
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: '0.15em',
            cursor: 'pointer',
          }}
        >
          {cta.toUpperCase()}
        </button>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 48, left: '50%', transform: 'translateX(-50%)' }}>
          <div style={{ width: 1, height: 48, background: muted, opacity: 0.3 }} />
        </div>
      </section>

      {/* Description */}
      {(canManage || descText) && (
        <section
          data-edit-path="layout.categories"
          onClick={() => canManage && onSelect('layout.categories')}
          style={{ padding: isMobile ? '60px 24px' : '120px 48px', textAlign: 'center' }}
        >
          <p style={{ maxWidth: 600, margin: '0 auto', color: descColor, fontSize: descSize, lineHeight: 2, fontWeight: 300 }}>
            {descText || (canManage ? 'Add description...' : '')}
          </p>
          {(canManage || storeDescription) && (
            <p style={{ maxWidth: 600, margin: '26px auto 0', color: muted, fontSize: 12, lineHeight: 1.9, fontWeight: 300 }}>
              {storeDescription || (canManage ? 'Add store description...' : '')}
            </p>
          )}
        </section>
      )}

      {/* Products - Sparse grid with huge gaps */}
      <section
        data-edit-path="layout.grid"
        onClick={() => canManage && onSelect('layout.grid')}
        style={{ maxWidth: 1400, margin: '0 auto', padding: isMobile ? `0 ${baseSpacing}px ${sectionSpacing}px` : `0 ${baseSpacing * 2}px ${sectionSpacing + 60}px` }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : `repeat(${gridColumns}, 1fr)`,
            gap: isMobile ? 48 : gridGap,
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
              style={{ cursor: 'pointer' }}
            >
              <div style={{ aspectRatio: '1', overflow: 'hidden', marginBottom: 24 }}>
                <img
                  src={productImage(p)}
                  alt={productTitle(p)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: `transform ${animationSpeed}ms` }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = `scale(${hoverScale})`)}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 11, color: muted, letterSpacing: '0.1em', marginBottom: 6 }}>
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 400 }}>{productTitle(p)}</div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{formatPrice(Number(p.price) || 0)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* View all link */}
        <div style={{ textAlign: 'center', marginTop: isMobile ? 60 : 100 }}>
          <button
            onClick={() => navigate('/products')}
            style={{
              background: 'transparent',
              border: 0,
              color: text,
              fontSize: 14,
              fontWeight: 400,
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: 4,
            }}
          >
            View all products →
          </button>
        </div>
      </section>

      {/* Footer - Almost nothing */}
      <footer
        data-edit-path="layout.footer"
        onClick={() => canManage && onSelect('layout.footer')}
        style={{
          padding: isMobile ? '40px 24px' : '60px 48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #f3f4f6',
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 300, letterSpacing: '0.2em' }}>{storeName}</span>
        <span style={{ color: muted, fontSize: 12 }}>© {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
