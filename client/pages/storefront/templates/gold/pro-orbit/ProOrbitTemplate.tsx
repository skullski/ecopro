import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';

/**
 * PRO ORBIT - Modern rounded design with floating card elements.
 * Features: Circular shapes, floating cards, soft shadows, playful layout.
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

export default function ProOrbitTemplate(props: TemplateProps) {
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

  // Orbit theme - clean white with green accent
  const bg = asString(settings.template_bg_color) || '#f8fafc';
  const text = asString(settings.template_text_color) || '#0f172a';
  const muted = asString(settings.template_muted_color) || '#64748b';
  const accent = asString(settings.template_accent_color) || '#10b981';

  

  const productTitleColor = asString(settings.template_product_title_color) || text;
  const productPriceColor = asString(settings.template_product_price_color) || accent;

  const cardBg = asString(settings.template_card_bg) || "#ffffff";
// Layout settings
  const gridColumns = resolveInt(settings.template_grid_columns, 4, 2, 6);
  const gridGap = resolveInt(settings.template_grid_gap, 24, 8, 48);
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 48, 24, 96);
  const animationSpeed = resolveInt(settings.template_animation_speed, 200, 100, 500);
  const hoverScale = asString(settings.template_hover_scale) || '1.03';
  const cardRadius = resolveInt(settings.template_card_border_radius, 16, 0, 32);

  const storeName = asString(settings.store_name) || 'ORBIT';
  
  const copyright = asString(settings.template_copyright) || `© ${new Date().getFullYear()} ${storeName}`;
const heroTitle = asString(settings.template_hero_heading) || 'Circle of Excellence';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Products that revolve around your lifestyle';
  const cta = asString(settings.template_button_text) || 'Start Shopping';

  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 16) || [];

  

  const sectionTitle = asString(settings.template_featured_title) || "Featured";
  const sectionSubtitle = asString(settings.template_featured_subtitle) || "";
  const addToCartLabel = asString(settings.template_add_to_cart_label) || "View";
const descText = (asString(settings.template_description_text) || asString(settings.store_description)).trim();
const descColor = asString(settings.template_description_color) || muted;
  const descSize = resolveInt(settings.template_description_size, 15, 10, 32);

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
      {/* Header - Pill shaped */}
      <header
        data-edit-path="layout.header"
        onClick={() => canManage && onSelect('layout.header')}
        style={{
          position: 'sticky',
          top: 16,
          zIndex: 50,
          maxWidth: 1200,
          margin: '16px auto',
          padding: '0 16px',
        }}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: 999,
            padding: '12px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: accent }} />
            )}
            <span style={{ fontSize: 16, fontWeight: 800 }}>{storeName}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {!isMobile && (
              <>
                <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 0, color: text, fontWeight: 500, cursor: 'pointer' }}>Home</button>
                <button onClick={() => navigate('/products')} style={{ background: 'transparent', border: 0, color: text, fontWeight: 500, cursor: 'pointer' }}>Products</button>
              </>
            )}
            <button
              onClick={() => navigate('/products')}
              style={{
                background: accent,
                border: 0,
                borderRadius: 999,
                padding: '10px 20px',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Shop
            </button>
          </div>
        </div>
      </header>

      {/* Hero - Orbital/circular design */}
      <section
        data-edit-path="layout.hero"
        onClick={() => canManage && onSelect('layout.hero')}
        style={{
          padding: isMobile ? '40px 20px' : '80px 40px',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: 40,
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-block',
                background: `${accent}20`,
                color: accent,
                borderRadius: 999,
                padding: '6px 16px',
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 20,
              }}
            >
              ● New Collection
            </div>
            <h1 style={{ fontSize: isMobile ? 36 : 52, fontWeight: 800, lineHeight: 1.1, margin: 0 }}>
              {heroTitle}
            </h1>
            <p style={{ marginTop: 16, fontSize: 16, color: muted, lineHeight: 1.7 }}>
              {heroSubtitle}
            </p>
            <div style={{ marginTop: 28, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/products')}
                style={{
                  background: accent,
                  border: 0,
                  borderRadius: 999,
                  padding: '14px 28px',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: `0 10px 30px ${accent}40`,
                }}
              >
                {cta}
              </button>
              <button
                onClick={() => navigate('/products')}
                style={{
                  background: '#fff',
                  border: `2px solid ${text}`,
                  borderRadius: 999,
                  padding: '14px 28px',
                  color: text,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                View All
              </button>
            </div>
          </div>

          {/* Orbital product showcase */}
          <div style={{ position: 'relative', aspectRatio: '1', maxWidth: 500, margin: '0 auto' }}>
            {/* Central circle */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '60%',
                aspectRatio: '1',
                borderRadius: '50%',
                background: '#fff',
                boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                overflow: 'hidden',
              }}
            >
              {products[0] && (
                <img src={productImage(products[0])} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>
            {/* Orbiting smaller circles */}
            {products.slice(1, 5).map((p, idx) => {
              const angle = (idx / 4) * 360;
              const x = 50 + 42 * Math.cos((angle * Math.PI) / 180);
              const y = 50 + 42 * Math.sin((angle * Math.PI) / 180);
              return (
                <div
                  key={p.id}
                  style={{
                    position: 'absolute',
                    top: `${y}%`,
                    left: `${x}%`,
                    transform: 'translate(-50%, -50%)',
                    width: '22%',
                    aspectRatio: '1',
                    borderRadius: '50%',
                    background: '#fff',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    overflow: 'hidden',
                    border: '3px solid #fff',
                  }}
                >
                  <img src={productImage(p)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Description */}
      {(canManage || descText) && (
        <section
          data-edit-path="layout.categories"
          onClick={() => canManage && onSelect('layout.categories')}
          style={{ padding: '0 24px 60px', textAlign: 'center' }}
        >
          <p style={{ maxWidth: 700, margin: '0 auto', color: descColor, fontSize: descSize, lineHeight: 1.8 }}>
            {descText || (canManage ? 'Add description...' : '')}
          </p>
        </section>
      )}

      {/* Products - Floating card grid */}
      <section
        data-edit-path="layout.grid"
        onClick={() => canManage && onSelect('layout.grid')}
        style={{ maxWidth: 1200, margin: '0 auto', padding: `0 ${baseSpacing}px ${sectionSpacing}px` }}
      >
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 data-edit-path="layout.featured.title" style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>{sectionTitle}</h2>
          <p data-edit-path="layout.featured.subtitle" style={{ color: muted, marginTop: 8 }}>{sectionSubtitle}</p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : `repeat(${gridColumns}, 1fr)`,
            gap: gridGap,
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
                background: '#fff',
                borderRadius: cardRadius,
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                cursor: 'pointer',
                transition: `transform ${animationSpeed}ms, box-shadow ${animationSpeed}ms`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = `translateY(-6px) scale(${hoverScale})`;
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
              }}
            >
              <div style={{ aspectRatio: '1', background: '#f1f5f9' }}>
                <img src={productImage(p)} alt={productTitle(p)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {productTitle(p)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: accent, fontWeight: 800 }}>{formatPrice(Number(p.price) || 0)}</span>
                  <button
                    style={{
                      background: `${accent}15`,
                      border: 0,
                      borderRadius: 999,
                      width: 36,
                      height: 36,
                      color: accent,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    →
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
          background: '#fff',
          padding: '40px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: accent }} />
          <span style={{ fontWeight: 800 }}>{storeName}</span>
        </div>
        <p style={{ color: muted, fontSize: 13 }}>© {new Date().getFullYear()} All rights reserved.</p>
      </footer>
    </div>
  );
}
