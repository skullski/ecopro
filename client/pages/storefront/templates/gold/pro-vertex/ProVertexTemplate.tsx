import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';

/**
 * PRO VERTEX - Sharp geometric design with sidebar navigation.
 * Features: Left sidebar, sharp corners, high contrast, dense layout.
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

export default function ProVertexTemplate(props: TemplateProps) {
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

  // Vertex theme - dark with purple accent, sharp aesthetic
  const bg = asString(settings.template_bg_color) || '#09090b';
  const text = asString(settings.template_text_color) || '#fafafa';
  const muted = asString(settings.template_muted_color) || '#71717a';
  const accent = asString(settings.template_accent_color) || '#a855f7';

  

  const productTitleColor = asString(settings.template_product_title_color) || text;
  const productPriceColor = asString(settings.template_product_price_color) || accent;

  const cardBg = asString(settings.template_card_bg) || "#ffffff";
// Layout settings
  const gridColumns = resolveInt(settings.template_grid_columns, 4, 2, 6);
  const gridGap = resolveInt(settings.template_grid_gap, 1, 0, 48);
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 48, 24, 96);
  const animationSpeed = resolveInt(settings.template_animation_speed, 200, 100, 500);
  const hoverScale = asString(settings.template_hover_scale) || '1.02';
  const cardRadius = resolveInt(settings.template_card_border_radius, 0, 0, 32);

  const storeName = asString(settings.store_name) || 'VERTEX';
  
  const copyright = asString(settings.template_copyright) || `© ${new Date().getFullYear()} ${storeName}`;
const heroTitle = asString(settings.template_hero_heading) || 'Precision Design';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Sharp aesthetics for modern taste';
  const cta = asString(settings.template_button_text) || 'Browse';

  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 24) || [];

  

  const sectionTitle = asString(settings.template_featured_title) || "Featured";
  const sectionSubtitle = asString(settings.template_featured_subtitle) || "";
  const addToCartLabel = asString(settings.template_add_to_cart_label) || "View";
const descText = (asString(settings.template_description_text) || asString(settings.store_description)).trim();
const descColor = asString(settings.template_description_color) || muted;
  const descSize = resolveInt(settings.template_description_size, 14, 10, 32);

  const sidebarWidth = 240;

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
        display: 'flex',
      }}
    >
      {/* Sidebar - desktop only */}
      {!isMobile && (
        <aside
          data-edit-path="layout.header"
          onClick={() => canManage && onSelect('layout.header')}
          style={{
            width: sidebarWidth,
            minHeight: '100vh',
            borderRight: '1px solid #27272a',
            padding: 24,
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt="" style={{ width: 36, height: 36, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 36, height: 36, background: accent }} />
            )}
            <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '0.08em' }}>{storeName}</span>
          </div>

          <nav style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: muted, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 12 }}>MENU</div>
            {['Home', 'Products', 'Collections', 'About'].map((item) => (
              <button
                key={item}
                onClick={() => navigate(item === 'Home' ? '/' : `/${item.toLowerCase()}`)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 0,
                  color: text,
                  padding: '12px 0',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  borderBottom: '1px solid #27272a',
                }}
              >
                {item}
              </button>
            ))}
          </nav>

          <button
            onClick={() => navigate('/products')}
            style={{
              width: '100%',
              background: accent,
              border: 0,
              padding: '14px',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {cta}
          </button>
        </aside>
      )}

      {/* Mobile header */}
      {isMobile && (
        <header
          data-edit-path="layout.header"
          onClick={() => canManage && onSelect('layout.header')}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            background: bg,
            borderBottom: '1px solid #27272a',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt="" style={{ width: 32, height: 32, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 32, height: 32, background: accent }} />
            )}
            <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: '0.08em' }}>{storeName}</span>
          </div>
          <button
            onClick={() => navigate('/products')}
            style={{ background: accent, border: 0, padding: '10px 20px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
          >
            Shop
          </button>
        </header>
      )}

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: isMobile ? 0 : sidebarWidth, paddingTop: isMobile ? 70 : 0 }}>
        {/* Hero - Split with large image */}
        <section
          data-edit-path="layout.hero"
          onClick={() => canManage && onSelect('layout.hero')}
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            minHeight: isMobile ? 'auto' : '70vh',
          }}
        >
          <div style={{ padding: isMobile ? '40px 20px' : '60px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: 11, color: accent, fontWeight: 700, letterSpacing: '0.2em', marginBottom: 16 }}>
              NEW ARRIVALS
            </div>
            <h1 style={{ fontSize: isMobile ? 32 : 48, fontWeight: 900, lineHeight: 1.1, margin: 0 }}>
              {heroTitle}
            </h1>
            <p style={{ marginTop: 16, fontSize: 15, color: muted, lineHeight: 1.7 }}>
              {heroSubtitle}
            </p>
            <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
              <button
                onClick={() => navigate('/products')}
                style={{ background: accent, border: 0, padding: '14px 28px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
              >
                {cta}
              </button>
              <button
                onClick={() => navigate('/products')}
                style={{ background: 'transparent', border: `1px solid ${muted}`, padding: '14px 28px', color: text, fontWeight: 700, cursor: 'pointer' }}
              >
                Learn More
              </button>
            </div>
          </div>
          {products[0] && (
            <div style={{ background: '#18181b', position: 'relative', minHeight: isMobile ? 300 : 'auto' }}>
              <img
                src={productImage(products[0])}
                alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, background: 'rgba(0,0,0,0.8)', padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{productTitle(products[0])}</div>
                <div style={{ fontSize: 14, color: accent, fontWeight: 800, marginTop: 4 }}>{formatPrice(Number(products[0].price) || 0)}</div>
              </div>
            </div>
          )}
        </section>

        {/* Description */}
        {(canManage || descText) && (
          <section
            data-edit-path="layout.categories"
            onClick={() => canManage && onSelect('layout.categories')}
            style={{ padding: `${sectionSpacing * 0.8}px ${baseSpacing * 1.5}px`, borderTop: '1px solid #27272a', borderBottom: '1px solid #27272a' }}
          >
            <p style={{ maxWidth: 600, color: descColor, fontSize: descSize, lineHeight: 1.7 }}>
              {descText || (canManage ? 'Add description...' : '')}
            </p>
          </section>
        )}

        {/* Products - Dense grid with sharp cards */}
        <section
          data-edit-path="layout.grid"
          onClick={() => canManage && onSelect('layout.grid')}
          style={{ padding: isMobile ? `${sectionSpacing * 0.8}px ${baseSpacing}px` : `${sectionSpacing}px ${baseSpacing * 2.5}px` }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: baseSpacing * 2 }}>
            <div>
              <h2 data-edit-path="layout.featured.title" style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{sectionTitle}</h2>
              <p data-edit-path="layout.featured.subtitle" style={{ color: muted, fontSize: 13, marginTop: 4 }}>{sectionSubtitle}</p>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : `repeat(${gridColumns}, 1fr)`,
              gap: gridGap,
              background: gridGap < 2 ? '#27272a' : 'transparent',
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
                  background: bg,
                  cursor: 'pointer',
                  borderRadius: cardRadius,
                  overflow: 'hidden',
                  transition: `transform ${animationSpeed}ms ease`,
                }}
                onMouseEnter={(e) => { if (!isMobile) e.currentTarget.style.transform = `scale(${hoverScale})`; }}
                onMouseLeave={(e) => { if (!isMobile) e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <div style={{ aspectRatio: '1', background: '#18181b', position: 'relative' }}>
                  <img src={productImage(p)} alt={productTitle(p)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: baseSpacing * 0.75 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {productTitle(p)}
                  </div>
                  <div style={{ fontSize: 14, color: accent, fontWeight: 800, marginTop: 4 }}>
                    {formatPrice(Number(p.price) || 0)}
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
          style={{ borderTop: '1px solid #27272a', padding: `${sectionSpacing * 0.8}px ${baseSpacing * 1.5}px` }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <span style={{ color: muted, fontSize: 13 }}>© {new Date().getFullYear()} {storeName}</span>
            <div style={{ display: 'flex', gap: 20, fontSize: 13, color: muted }}>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</a>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</a>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Contact</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
