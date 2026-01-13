import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';

/**
 * SNOW SHOP - Crisp white with gray accents template.
 * Features: Snow white theme, card-based layout, clean navigation.
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

export default function SnowShopTemplate(props: TemplateProps) {
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

  // Snow theme
  const bg = asString(settings.template_bg_color) || '#f8fafc';
  const text = asString(settings.template_text_color) || '#0f172a';
  const muted = asString(settings.template_muted_color) || '#64748b';
  const accent = asString(settings.template_accent_color) || '#6366f1';

  

  const productTitleColor = asString(settings.template_product_title_color) || text;
  const productPriceColor = asString(settings.template_product_price_color) || accent;

  const cardBg = asString(settings.template_card_bg) || "#ffffff";
const storeName = asString(settings.store_name) || 'Snow Shop';
  
  const copyright = asString(settings.template_copyright) || `© ${new Date().getFullYear()} ${storeName}`;
const heroTitle = asString(settings.template_hero_heading) || 'Discover Amazing Products';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Quality items delivered to your door';
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
  const gridGap = resolveInt(settings.template_grid_gap, 24, 8, 48);
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 48, 24, 96);
  const animationSpeed = resolveInt(settings.template_animation_speed, 200, 100, 500);
  const hoverScale = asString(settings.template_hover_scale) || '1.02';
  const cardRadius = resolveInt(settings.template_card_border_radius, 12, 0, 32);

  const cols = isMobile ? 2 : gridColumns;

  return (
    <div
      data-edit-path="__root"
      onClick={() => canManage && onSelect("__root")}
      className="ecopro-storefront"
      style={{
        minHeight: '100vh',
        background: bg,
        color: text,
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      }}
    >
      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={() => canManage && onSelect('layout.header')}
        style={{
          background: '#fff',
          padding: '16px 24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt="" style={{ height: 36 }} />
            ) : (
              <>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${accent}, ${accent}aa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>
                  S
                </div>
                <span style={{ fontSize: 18, fontWeight: 700 }}>{storeName}</span>
              </>
            )}
          </div>
          
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
              <nav style={{ display: 'flex', gap: 24, fontSize: 14 }}>
                <button onClick={() => navigate('/')} style={{ background: 'none', border: 0, color: text, cursor: 'pointer', fontWeight: 500 }}>Home</button>
                <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: muted, cursor: 'pointer' }}>Products</button>
                <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: muted, cursor: 'pointer' }}>About</button>
              </nav>
              <button
                onClick={() => navigate('/products')}
                style={{
                  background: accent,
                  border: 0,
                  borderRadius: 10,
                  padding: '12px 24px',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {cta}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <section
        data-edit-path="layout.hero"
        onClick={() => canManage && onSelect('layout.hero')}
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: isMobile ? '48px 24px' : '80px 24px',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 48, alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: isMobile ? 36 : 48, fontWeight: 800, lineHeight: 1.15, margin: 0 }}>
              {heroTitle}
            </h1>
            <p style={{ marginTop: 20, fontSize: 17, color: muted, lineHeight: 1.8 }}>
              {heroSubtitle}
            </p>
            <div style={{ marginTop: 32, display: 'flex', gap: 16 }}>
              <button
                onClick={() => navigate('/products')}
                style={{
                  background: accent,
                  border: 0,
                  borderRadius: 12,
                  padding: '16px 32px',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {cta}
              </button>
              <button
                onClick={() => navigate('/products')}
                style={{
                  background: '#fff',
                  border: '2px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '16px 24px',
                  color: text,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Learn More
              </button>
            </div>
          </div>

          {!isMobile && products.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {products.slice(0, 4).map((p, idx) => (
                <div 
                  key={p.id} 
                  style={{ 
                    background: '#fff', 
                    borderRadius: 16, 
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                    transform: idx % 2 === 1 ? 'translateY(24px)' : 'translateY(0)',
                  }}
                >
                  <div style={{ aspectRatio: '1' }}>
                    <img src={productImage(p)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Description */}
      {(canManage || descText) && (
        <section
          data-edit-path="layout.categories"
          onClick={() => canManage && onSelect('layout.categories')}
          style={{ padding: '48px 24px', background: '#fff' }}
        >
          <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ color: descColor, fontSize: descSize, lineHeight: 1.9 }}>
              {descText || (canManage ? 'Add your store description...' : '')}
            </p>
          </div>
        </section>
      )}

      {/* Features */}
      <section style={{ padding: '48px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 20 }}>
          {[
            { icon: '📦', title: 'Free Shipping', desc: 'On orders over $50' },
            { icon: '⏰', title: 'Fast Delivery', desc: '2-3 business days' },
            { icon: '💰', title: 'Best Prices', desc: 'Guaranteed value' },
            { icon: '🔒', title: 'Secure', desc: 'Safe checkout' },
          ].map((f) => (
            <div key={f.title} style={{ background: '#fff', borderRadius: 16, padding: 20, textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: muted, marginTop: 4 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section
        data-edit-path="layout.grid"
        onClick={() => canManage && onSelect('layout.grid')}
        style={{ maxWidth: 1200, margin: '0 auto', padding: `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 data-edit-path="layout.featured.title" style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{sectionTitle}</h2>
          <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: accent, fontWeight: 600, cursor: 'pointer' }}>
            View All →
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
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
                borderRadius: cardRadius,
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                transition: `box-shadow ${animationSpeed}ms, transform ${animationSpeed}ms`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = `scale(${hoverScale})`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.04)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <div style={{ aspectRatio: '1', background: bg }}>
                <img src={productImage(p)} alt={productTitle(p)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' , color: productTitleColor}}>
                  {productTitle(p)}
                </h3>
                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700 }}>{formatPrice(Number(p.price) || 0)}</span>
                  <button style={{ background: accent, border: 0, borderRadius: 8, width: 32, height: 32, color: '#fff', cursor: 'pointer', fontSize: 16 }}>
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section style={{ background: '#fff', padding: '60px 24px' }}>
        <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: 24, fontWeight: 700, margin: 0 , color: productTitleColor}}>Stay Updated</h3>
          <p data-edit-path="layout.featured.subtitle" style={{ color: muted, marginTop: 12, fontSize: 15 }}>{sectionSubtitle}</p>
          <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
            <input 
              type="email" 
              placeholder="Enter your email" 
              style={{ flex: 1, padding: '14px 18px', border: '2px solid #e2e8f0', borderRadius: 10, fontSize: 14 }} 
            />
            <button style={{ background: accent, border: 0, borderRadius: 10, padding: '14px 24px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={() => canManage && onSelect('layout.footer')}
        style={{ background: text, color: '#fff', padding: '48px 24px' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 32 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>{storeName}</div>
              <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7 }}>
                Your trusted destination for quality products.
              </p>
            </div>
            {['Shop', 'Support', 'Company'].map((section) => (
              <div key={section}>
                <h5 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>{section}</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: '#94a3b8' }}>
                  <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Link 1</a>
                  <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Link 2</a>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid #334155', textAlign: 'center', fontSize: 13, color: '#64748b' }}>
            {copyright}
          </div>
        </div>
      </footer>
    </div>
  );
}
