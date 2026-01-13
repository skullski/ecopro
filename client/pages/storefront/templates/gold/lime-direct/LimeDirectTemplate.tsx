import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';

/**
 * LIME DIRECT - Bright lime green direct sales template.
 * Features: Vivid green, product showcase with multiple images, direct order.
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

export default function LimeDirectTemplate(props: TemplateProps) {
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

  // Lime theme
  const bg = asString(settings.template_bg_color) || '#f0fdf4';
  const text = asString(settings.template_text_color) || '#14532d';
  const muted = asString(settings.template_muted_color) || '#166534';
  const accent = asString(settings.template_accent_color) || '#22c55e';

  

  const productTitleColor = asString(settings.template_product_title_color) || text;
  const productPriceColor = asString(settings.template_product_price_color) || accent;

  const cardBg = asString(settings.template_card_bg) || "#ffffff";
const storeName = asString(settings.store_name) || 'Lime Direct';
  
  const copyright = asString(settings.template_copyright) || `© ${new Date().getFullYear()} ${storeName}`;
const heroTitle = asString(settings.template_hero_heading) || 'Premium Quality Products';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Direct from manufacturer to your doorstep';
  const cta = asString(settings.template_button_text) || 'Order Now';

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
  const baseSpacing = resolveInt(settings.template_spacing, 12, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 48, 24, 96);
  const animationSpeed = resolveInt(settings.template_animation_speed, 200, 100, 500);
  const hoverScale = asString(settings.template_hover_scale) || '1.02';
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
      {/* Top announcement */}
      <div style={{ background: accent, color: '#fff', textAlign: 'center', padding: '10px 16px', fontSize: 13, fontWeight: 600 }}>
        🎁 Special Offer: Free shipping on all orders today!
      </div>

      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={() => canManage && onSelect('layout.header')}
        style={{
          background: '#fff',
          padding: '14px 24px',
          borderBottom: `3px solid ${accent}`,
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt="" style={{ width: 44, height: 44 }} />
            ) : (
              <div style={{ width: 44, height: 44, borderRadius: 8, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 20 }}>
                L
              </div>
            )}
            <span style={{ fontSize: 22, fontWeight: 800, color: accent }}>{storeName}</span>
          </div>
          
          {!isMobile && (
            <nav style={{ display: 'flex', gap: 28, fontSize: 14, fontWeight: 500 }}>
              <button onClick={() => navigate('/')} style={{ background: 'none', border: 0, color: text, cursor: 'pointer' }}>Home</button>
              <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: text, cursor: 'pointer' }}>Products</button>
              <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: text, cursor: 'pointer' }}>Contact</button>
            </nav>
          )}

          <button
            onClick={() => navigate('/products')}
            style={{
              background: accent,
              border: 0,
              borderRadius: 8,
              padding: '12px 24px',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {cta}
          </button>
        </div>
      </header>

      {/* Hero - Product focus */}
      <section
        data-edit-path="layout.hero"
        onClick={() => canManage && onSelect('layout.hero')}
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: isMobile ? '32px 24px' : '48px 24px',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 40, alignItems: 'center' }}>
          {/* Product images */}
          <div>
            <div style={{ background: '#fff', borderRadius: 16, padding: 16, border: `2px solid ${accent}30` }}>
              {products.length > 0 && (
                <div style={{ aspectRatio: '1', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
                  <img src={productImage(products[0])} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              {products.length > 1 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {products.slice(0, 4).map((p, idx) => (
                    <div key={p.id} style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: idx === 0 ? `2px solid ${accent}` : '2px solid transparent' }}>
                      <img src={productImage(p)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product info & order */}
          <div>
            <h1 style={{ fontSize: isMobile ? 28 : 36, fontWeight: 800, lineHeight: 1.2, margin: 0 }}>
              {heroTitle}
            </h1>
            <p style={{ marginTop: 16, fontSize: 16, color: muted, lineHeight: 1.8 }}>
              {heroSubtitle}
            </p>

            {products.length > 0 && (
              <div style={{ marginTop: 24, background: '#fff', borderRadius: 12, padding: 20, border: `2px solid ${accent}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: accent }}>{formatPrice(Number(products[0].price) || 0)}</span>
                  <span style={{ background: '#dcfce7', color: accent, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>In Stock</span>
                </div>

                {/* Quick order form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input placeholder="Full Name" style={{ padding: '14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }} />
                  <input placeholder="Phone Number" style={{ padding: '14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }} />
                  <input placeholder="Address" style={{ padding: '14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }} />
                  <button
                    style={{
                      background: accent,
                      border: 0,
                      borderRadius: 8,
                      padding: '16px',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: 16,
                      cursor: 'pointer',
                    }}
                  >
                    🛒 {cta} - {formatPrice(Number(products[0].price) || 0)}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ background: accent, padding: '32px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 24, textAlign: 'center' }}>
          {[
            { icon: '✅', text: 'Original Product' },
            { icon: '🚚', text: 'Fast Delivery' },
            { icon: '💰', text: 'Cash on Delivery' },
            { icon: '🔄', text: 'Easy Returns' },
          ].map((f) => (
            <div key={f.text} style={{ color: '#fff' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{f.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Description */}
      {(canManage || descText) && (
        <section
          data-edit-path="layout.categories"
          onClick={() => canManage && onSelect('layout.categories')}
          style={{ padding: '48px 24px', background: '#fff' }}
        >
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ color: descColor, fontSize: descSize, lineHeight: 1.9 }}>
              {descText || (canManage ? 'Add product description and features here...' : '')}
            </p>
          </div>
        </section>
      )}

      {/* More products */}
      <section
        data-edit-path="layout.grid"
        onClick={() => canManage && onSelect('layout.grid')}
        style={{ maxWidth: 1200, margin: '0 auto', padding: `${sectionSpacing}px 24px 60px` }}
      >
        <h2 data-edit-path="layout.featured.title" style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, textAlign: 'center' }}>{sectionTitle}</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : `repeat(${gridColumns}, 1fr)`,
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
                border: `2px solid ${accent}30`,
                borderRadius: cardRadius,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: `border-color ${animationSpeed}ms, transform ${animationSpeed}ms`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = accent;
                e.currentTarget.style.transform = `scale(${hoverScale})`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${accent}30`;
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <div style={{ aspectRatio: '1' }}>
                <img src={productImage(p)} alt={productTitle(p)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: baseSpacing }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' , color: productTitleColor}}>
                  {productTitle(p)}
                </h3>
                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: accent, fontWeight: 800 }}>{formatPrice(Number(p.price) || 0)}</span>
                  <button style={{ background: accent, border: 0, borderRadius: 6, padding: '8px 12px', color: '#fff', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>
                    Order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section style={{ background: text, color: '#fff', padding: `${sectionSpacing}px 24px`, textAlign: 'center' }}>
        <h3 style={{ fontSize: 24, fontWeight: 800, margin: 0 , color: productTitleColor}}>Need Help?</h3>
        <p data-edit-path="layout.featured.subtitle" style={{ marginTop: 12, opacity: 0.8 }}>{sectionSubtitle}</p>
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
          <span>📞 +1 234 567 8900</span>
          <span>📧 support@{storeName.toLowerCase().replace(/\s/g, '')}.com</span>
        </div>
      </section>

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={() => canManage && onSelect('layout.footer')}
        style={{ background: '#fff', padding: '32px 24px', borderTop: `3px solid ${accent}` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: accent, marginBottom: 12 }}>{storeName}</div>
          <p style={{ color: muted, fontSize: 13 }}>{copyright}</p>
        </div>
      </footer>
    </div>
  );
}
