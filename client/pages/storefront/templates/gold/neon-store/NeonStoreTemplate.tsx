import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';

/**
 * NEON STORE - Electric neon green with dark background.
 * Features: Neon green on dark, glowing effects, tech-style layout.
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

export default function NeonStoreTemplate(props: TemplateProps) {
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

  // Neon theme - dark with bright green
  const bg = asString(settings.template_bg_color) || '#0a0a0a';
  const text = asString(settings.template_text_color) || '#ffffff';
  const muted = asString(settings.template_muted_color) || '#a3a3a3';
  const accent = asString(settings.template_accent_color) || '#00ff88';

  const storeName = asString(settings.store_name) || 'NEON';
  const heroTitle = asString(settings.template_hero_heading) || 'Next Level Products';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Experience the future of shopping';
  const cta = asString(settings.template_button_text) || 'Shop Now';

  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];

  const descText = asString(settings.template_description_text);
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

  return (
    <div
      className="ecopro-storefront"
      style={{
        minHeight: '100vh',
        background: bg,
        color: text,
        fontFamily: '"Space Grotesk", system-ui, sans-serif',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt="" style={{ width: 40, height: 40 }} />
            ) : (
              <span style={{ fontSize: 28, fontWeight: 900, color: accent, textShadow: `0 0 20px ${accent}` }}>{storeName}</span>
            )}
          </div>
          
          {!isMobile && (
            <nav style={{ display: 'flex', gap: 32, fontSize: 14 }}>
              <button onClick={() => navigate('/')} style={{ background: 'none', border: 0, color: muted, cursor: 'pointer' }}>HOME</button>
              <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: muted, cursor: 'pointer' }}>PRODUCTS</button>
              <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: muted, cursor: 'pointer' }}>DEALS</button>
            </nav>
          )}

          <button
            onClick={() => navigate('/products')}
            style={{
              background: accent,
              border: 0,
              borderRadius: 4,
              padding: '12px 28px',
              color: bg,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: `0 0 20px ${accent}50`,
            }}
          >
            SHOP
          </button>
        </div>
      </header>

      {/* Hero */}
      <section
        data-edit-path="layout.hero"
        onClick={() => canManage && onSelect('layout.hero')}
        style={{
          padding: isMobile ? '80px 24px' : '120px 40px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow effect */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, background: `radial-gradient(circle, ${accent}15 0%, transparent 70%)`, pointerEvents: 'none' }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
          <div style={{ color: accent, fontSize: 14, letterSpacing: '0.3em', marginBottom: 20 }}>★ NEW ARRIVAL ★</div>
          <h1 style={{ fontSize: isMobile ? 40 : 72, fontWeight: 900, lineHeight: 1, margin: 0, textTransform: 'uppercase' }}>
            {heroTitle}
          </h1>
          <p style={{ marginTop: 24, fontSize: 18, color: muted, lineHeight: 1.7 }}>
            {heroSubtitle}
          </p>
          <button
            onClick={() => navigate('/products')}
            style={{
              marginTop: 40,
              background: accent,
              border: 0,
              borderRadius: 4,
              padding: '18px 48px',
              color: bg,
              fontWeight: 900,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: `0 0 30px ${accent}60`,
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
          style={{ padding: '48px 24px', borderTop: `1px solid ${accent}20`, borderBottom: `1px solid ${accent}20` }}
        >
          <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ color: descColor, fontSize: descSize, lineHeight: 1.9 }}>
              {descText || (canManage ? 'Add your store tagline here...' : '')}
            </p>
          </div>
        </section>
      )}

      {/* Features bar */}
      <section style={{ padding: '32px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 24 }}>
          {[
            { icon: '⚡', text: 'Fast Delivery' },
            { icon: '🔒', text: 'Secure Checkout' },
            { icon: '🎁', text: 'Gift Ready' },
            { icon: '↩️', text: 'Easy Returns' },
          ].map((f) => (
            <div key={f.text} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontSize: 12, color: muted, letterSpacing: '0.1em' }}>{f.text.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section
        data-edit-path="layout.grid"
        onClick={() => canManage && onSelect('layout.grid')}
        style={{ maxWidth: 1200, margin: '0 auto', padding: `${sectionSpacing}px ${baseSpacing}px 80px` }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, margin: 0, letterSpacing: '0.05em' }}>FEATURED</h2>
          <button onClick={() => navigate('/products')} style={{ background: 'none', border: `1px solid ${accent}`, borderRadius: 4, padding: '10px 20px', color: accent, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
            VIEW ALL
          </button>
        </div>

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
                background: '#141414',
                border: `1px solid ${accent}20`,
                borderRadius: cardRadius,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: `border-color ${animationSpeed}ms, box-shadow ${animationSpeed}ms, transform ${animationSpeed}ms`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = accent;
                e.currentTarget.style.boxShadow = `0 0 20px ${accent}30`;
                e.currentTarget.style.transform = `scale(${hoverScale})`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${accent}20`;
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <div style={{ aspectRatio: '1', background: '#1a1a1a' }}>
                <img src={productImage(p)} alt={productTitle(p)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: 14 }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {productTitle(p)}
                </h3>
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: accent, fontWeight: 900, fontSize: 16 }}>{formatPrice(Number(p.price) || 0)}</span>
                  <button style={{ background: accent, border: 0, borderRadius: 4, padding: '8px 14px', color: bg, fontWeight: 800, fontSize: 11, cursor: 'pointer' }}>
                    BUY
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: `linear-gradient(90deg, ${accent}20, transparent)`, padding: '60px 24px', borderTop: `1px solid ${accent}30` }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>JOIN THE FUTURE</h3>
          <p style={{ color: muted, marginTop: 12 }}>Subscribe for exclusive deals and early access</p>
          <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
            <input 
              type="email" 
              placeholder="your@email.com" 
              style={{ flex: 1, padding: '14px 18px', background: '#141414', border: `1px solid ${accent}40`, borderRadius: 4, color: text, fontSize: 14 }} 
            />
            <button style={{ background: accent, border: 0, borderRadius: 4, padding: '14px 24px', color: bg, fontWeight: 800, cursor: 'pointer' }}>
              SUBSCRIBE
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={() => canManage && onSelect('layout.footer')}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, borderTop: `1px solid ${accent}20` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          <span style={{ fontSize: 24, fontWeight: 900, color: accent }}>{storeName}</span>
          <span style={{ color: muted, fontSize: 13 }}>© {new Date().getFullYear()} {storeName}. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
