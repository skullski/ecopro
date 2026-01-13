import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';

/**
 * FOREST STORE - Deep forest green with nature-inspired design.
 * Features: Rich forest palette, organic shapes, eco-friendly aesthetic.
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

export default function ForestStoreTemplate(props: TemplateProps) {
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

  // Forest theme - deep greens
  const bg = asString(settings.template_bg_color) || '#1a2e1a';
  const text = asString(settings.template_text_color) || '#f4f7f4';
  const muted = asString(settings.template_muted_color) || '#a3b8a3';
  const accent = asString(settings.template_accent_color) || '#7cb87c';

  

  const productTitleColor = asString(settings.template_product_title_color) || text;
  const productPriceColor = asString(settings.template_product_price_color) || accent;

  const cardBg = asString(settings.template_card_bg) || "#ffffff";
const storeName = asString(settings.store_name) || 'Forest';
  
  const copyright = asString(settings.template_copyright) || `© ${new Date().getFullYear()} ${storeName}`;
const heroTitle = asString(settings.template_hero_heading) || 'Nature\'s Finest';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Sustainable products inspired by nature';
  const cta = asString(settings.template_button_text) || 'Shop Sustainably';

  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];

  

  const sectionTitle = asString(settings.template_featured_title) || "Featured";
  const sectionSubtitle = asString(settings.template_featured_subtitle) || "";
  const addToCartLabel = asString(settings.template_add_to_cart_label) || "View";
const descText = (asString(settings.template_description_text) || asString(settings.store_description)).trim();
const descColor = asString(settings.template_description_color) || muted;
  const descSize = resolveInt(settings.template_description_size, 15, 10, 32);

  // Layout settings
  const gridColumns = resolveInt(settings.template_grid_columns, 3, 2, 6);
  const gridGap = resolveInt(settings.template_grid_gap, 24, 8, 48);
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 80, 24, 96);
  const animationSpeed = resolveInt(settings.template_animation_speed, 300, 100, 500);
  const hoverScale = asString(settings.template_hover_scale) || '1.02';
  const cardRadius = resolveInt(settings.template_card_border_radius, 20, 0, 32);

  return (
    <div
      data-edit-path="__root"
      onClick={() => canManage && onSelect("__root")}
      className="ecopro-storefront"
      style={{
        minHeight: '100vh',
        background: bg,
        color: text,
        fontFamily: '"DM Sans", system-ui, sans-serif',
      }}
    >
      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={() => canManage && onSelect('layout.header')}
        style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${accent}30`,
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt="" style={{ width: 42, height: 42, borderRadius: 8 }} />
            ) : (
              <div style={{ fontSize: 28 }}>🌿</div>
            )}
            <span style={{ fontSize: 24, fontWeight: 700, color: accent }}>{storeName}</span>
          </div>
          
          {!isMobile && (
            <nav style={{ display: 'flex', gap: 32, fontSize: 14 }}>
              <button onClick={() => navigate('/')} style={{ background: 'none', border: 0, color: text, cursor: 'pointer' }}>Home</button>
              <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: text, cursor: 'pointer' }}>Shop</button>
              <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: text, cursor: 'pointer' }}>Our Story</button>
              <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: text, cursor: 'pointer' }}>Sustainability</button>
            </nav>
          )}

          <button
            style={{
              background: accent,
              border: 0,
              borderRadius: 24,
              padding: '12px 24px',
              color: bg,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            🛒 Cart
          </button>
        </div>
      </header>

      {/* Hero - Full width with overlay */}
      <section
        data-edit-path="layout.hero"
        onClick={() => canManage && onSelect('layout.hero')}
        style={{
          position: 'relative',
          padding: isMobile ? '80px 24px' : '140px 40px',
          background: `linear-gradient(135deg, ${bg} 0%, #0d1a0d 100%)`,
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', border: `1px solid ${accent}20` }} />
        <div style={{ position: 'absolute', bottom: -150, left: -150, width: 500, height: 500, borderRadius: '50%', border: `1px solid ${accent}15` }} />
        
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${accent}20`, padding: '8px 20px', borderRadius: 20, marginBottom: 24 }}>
            <span>🌱</span>
            <span style={{ fontSize: 13, color: accent }}>Eco-Friendly Collection</span>
          </div>
          <h1 style={{ fontSize: isMobile ? 40 : 64, fontWeight: 800, lineHeight: 1.1, margin: 0 }}>
            {heroTitle}
          </h1>
          <p style={{ marginTop: 24, fontSize: 18, color: muted, lineHeight: 1.8, maxWidth: 600, margin: '24px auto 0' }}>
            {heroSubtitle}
          </p>
          <button
            onClick={() => navigate('/products')}
            style={{
              marginTop: 36,
              background: accent,
              border: 0,
              borderRadius: 28,
              padding: '18px 40px',
              color: bg,
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
            }}
          >
            {cta} →
          </button>
        </div>
      </section>

      {/* Description */}
      {(canManage || descText) && (
        <section
          data-edit-path="layout.categories"
          onClick={() => canManage && onSelect('layout.categories')}
          style={{ padding: '60px 24px', background: '#0d1a0d' }}
        >
          <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ color: descColor, fontSize: descSize, lineHeight: 1.9 }}>
              {descText || (canManage ? 'Add your eco-friendly mission statement...' : '')}
            </p>
          </div>
        </section>
      )}

      {/* Features */}
      <section style={{ padding: '60px 24px', background: '#0d1a0d' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 32 }}>
          {[
            { icon: '🌿', title: 'Sustainable', desc: 'All products made with eco-friendly materials' },
            { icon: '📦', title: 'Zero Waste', desc: 'Plastic-free packaging and shipping' },
            { icon: '💚', title: 'Give Back', desc: '1% of sales go to reforestation' },
          ].map((f) => (
            <div key={f.title} style={{ textAlign: 'center', padding: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 , color: productTitleColor}}>{f.title}</h3>
              <p style={{ color: muted, fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section
        data-edit-path="layout.grid"
        onClick={() => canManage && onSelect('layout.grid')}
        style={{ maxWidth: 1200, margin: '0 auto', padding: `${sectionSpacing}px 24px` }}
      >
        <div style={{ textAlign: 'center', marginBottom: sectionSpacing }}>
          <h2 data-edit-path="layout.featured.title" style={{ fontSize: 32, fontWeight: 800, margin: 0 }}>{sectionTitle}</h2>
          <p data-edit-path="layout.featured.subtitle" style={{ color: muted, marginTop: 12 }}>{sectionSubtitle}</p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : `repeat(${gridColumns}, 1fr)`,
            gap: gridGap,
          }}
        >
          {products.slice(0, 6).map((p) => (
            <div
              key={p.id}
              data-edit-path={`layout.grid.items.${p.id}`}
              onClick={(e) => {
                if (canManage) { e.stopPropagation(); onSelect(`layout.grid.items.${p.id}`); return; }
                if ((p as any).slug) navigate((p as any).slug);
              }}
              style={{
                background: '#243424',
                borderRadius: cardRadius,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: `transform ${animationSpeed}ms`,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = `scale(${hoverScale})`)}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <div style={{ aspectRatio: '4/5', position: 'relative' }}>
                <img src={productImage(p)} alt={productTitle(p)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 12, left: 12, background: accent, color: bg, padding: '6px 12px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                  ECO
                </div>
              </div>
              <div style={{ padding: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 , color: productTitleColor}}>{productTitle(p)}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  <span style={{ color: accent, fontWeight: 800, fontSize: 18 }}>{formatPrice(Number(p.price) || 0)}</span>
                  <button style={{ background: accent, border: 0, borderRadius: 8, padding: '10px 18px', color: bg, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <button
            onClick={() => navigate('/products')}
            style={{
              background: 'transparent',
              border: `2px solid ${accent}`,
              borderRadius: 28,
              padding: '16px 40px',
              color: accent,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            View All Products
          </button>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ background: accent, padding: '60px 24px', textAlign: 'center' }}>
        <h3 style={{ color: bg, fontSize: 28, fontWeight: 800, margin: 0 }}>Join the Green Movement</h3>
        <p style={{ color: bg, opacity: 0.8, marginTop: 12 }}>Subscribe for eco-tips and exclusive offers</p>
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <input
            type="email"
            placeholder="your@email.com"
            style={{ padding: '14px 20px', border: 0, borderRadius: 24, width: 280, fontSize: 14 }}
          />
          <button style={{ background: bg, color: accent, border: 0, borderRadius: 24, padding: '14px 28px', fontWeight: 700, cursor: 'pointer' }}>
            Subscribe
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={() => canManage && onSelect('layout.footer')}
        style={{ background: '#0d1a0d', padding: '60px 24px' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 24 }}>🌿</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: accent }}>{storeName}</span>
              </div>
              <p style={{ color: muted, fontSize: 14, lineHeight: 1.7 }}>
                Making sustainable living accessible and beautiful.
              </p>
            </div>
            {['Shop', 'Company', 'Support'].map((section) => (
              <div key={section}>
                <h5 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: accent }}>{section}</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {['Link One', 'Link Two', 'Link Three'].map((link, i) => (
                    <a key={i} href="#" style={{ color: muted, textDecoration: 'none', fontSize: 14 }}>{link}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${accent}20`, marginTop: 48, paddingTop: 24, textAlign: 'center', color: muted, fontSize: 13 }}>
            {copyright} 🌍
          </div>
        </div>
      </footer>
    </div>
  );
}
