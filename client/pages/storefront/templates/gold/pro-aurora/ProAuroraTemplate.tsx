import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';

/**
 * PRO AURORA - Futuristic glass-morphism template with aurora gradient backgrounds.
 * Features: Glass cards, gradient overlays, neon accents, floating elements.
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

export default function ProAuroraTemplate(props: TemplateProps) {
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

  // Aurora theme colors - dark with cyan/purple/green aurora
  const bg = asString(settings.template_bg_color) || '#030712';
  const text = asString(settings.template_text_color) || '#f1f5f9';
  const muted = asString(settings.template_muted_color) || '#94a3b8';
  const accent = asString(settings.template_accent_color) || '#06b6d4';
  const accent2 = '#a855f7';
  const accent3 = '#10b981';

  const storeName = asString(settings.store_name) || 'AURORA';
  const heroTitle = asString(settings.template_hero_heading) || 'Experience the Future';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Premium products with cutting-edge design';
  const cta = asString(settings.template_button_text) || 'Explore Now';

  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 20) || [];

  const descText = asString(settings.template_description_text);
  const descColor = asString(settings.template_description_color) || muted;
  const descSize = resolveInt(settings.template_description_size, 14, 10, 32);

  return (
    <div
      className="ecopro-storefront"
      style={{
        minHeight: '100vh',
        background: bg,
        color: text,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Aurora background effect */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          background: `
            radial-gradient(ellipse 80% 50% at 20% 20%, ${accent}33, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 30%, ${accent2}28, transparent 50%),
            radial-gradient(ellipse 70% 50% at 50% 80%, ${accent3}22, transparent 50%)
          `,
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={() => canManage && onSelect('layout.header')}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(20px)',
          background: 'rgba(3,7,18,0.7)',
          borderBottom: '1px solid rgba(148,163,184,0.1)',
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, ${accent}, ${accent2})` }} />
            )}
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '0.1em' }}>{storeName}</span>
          </div>
          <button
            onClick={() => navigate('/products')}
            style={{
              background: `linear-gradient(135deg, ${accent}, ${accent2})`,
              border: 0,
              borderRadius: 999,
              padding: '10px 24px',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Shop
          </button>
        </div>
      </header>

      {/* Hero - Full width with floating glass cards */}
      <section
        data-edit-path="layout.hero"
        onClick={() => canManage && onSelect('layout.hero')}
        style={{ position: 'relative', padding: isMobile ? '60px 20px' : '100px 40px', textAlign: 'center' }}
      >
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(6,182,212,0.15)',
              border: '1px solid rgba(6,182,212,0.3)',
              borderRadius: 999,
              padding: '6px 16px',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.15em',
              color: accent,
              marginBottom: 24,
            }}
          >
            ✦ NEW COLLECTION
          </div>
          <h1 style={{ fontSize: isMobile ? 36 : 64, fontWeight: 900, lineHeight: 1.1, margin: 0 }}>
            {heroTitle}
          </h1>
          <p style={{ marginTop: 20, fontSize: 18, color: muted, lineHeight: 1.7 }}>
            {heroSubtitle}
          </p>
          <div style={{ marginTop: 32, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/products')}
              style={{
                background: `linear-gradient(135deg, ${accent}, ${accent2})`,
                border: 0,
                borderRadius: 999,
                padding: '14px 32px',
                color: '#fff',
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                boxShadow: `0 20px 40px ${accent}44`,
              }}
            >
              {cta}
            </button>
            <button
              onClick={() => navigate('/products')}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 999,
                padding: '14px 32px',
                color: text,
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
              }}
            >
              View Catalog
            </button>
          </div>
        </div>

        {/* Floating preview cards */}
        {!isMobile && products.length >= 3 && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            <div
              style={{
                position: 'absolute',
                left: '5%',
                top: '20%',
                width: 160,
                borderRadius: 16,
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                overflow: 'hidden',
                transform: 'rotate(-12deg)',
              }}
            >
              <img src={productImage(products[0])} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
            </div>
            <div
              style={{
                position: 'absolute',
                right: '5%',
                top: '30%',
                width: 180,
                borderRadius: 16,
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                overflow: 'hidden',
                transform: 'rotate(8deg)',
              }}
            >
              <img src={productImage(products[1])} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
            </div>
          </div>
        )}
      </section>

      {/* Description */}
      {(canManage || descText) && (
        <section
          data-edit-path="layout.categories"
          onClick={() => canManage && onSelect('layout.categories')}
          style={{ padding: '0 24px 40px', textAlign: 'center' }}
        >
          <p style={{ maxWidth: 700, margin: '0 auto', color: descColor, fontSize: descSize, lineHeight: 1.7 }}>
            {descText || (canManage ? 'Add description...' : '')}
          </p>
        </section>
      )}

      {/* Products - Glass cards with glow */}
      <section
        data-edit-path="layout.grid"
        onClick={() => canManage && onSelect('layout.grid')}
        style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px 80px' }}
      >
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>Featured Products</h2>
          <button
            onClick={() => navigate('/products')}
            style={{ background: 'transparent', border: `1px solid ${accent}`, borderRadius: 999, padding: '8px 20px', color: accent, fontWeight: 600, cursor: 'pointer' }}
          >
            View All →
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 24,
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
                position: 'relative',
                borderRadius: 20,
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.3s, box-shadow 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = `0 30px 60px ${accent}22`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {idx < 2 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    zIndex: 2,
                    background: `linear-gradient(135deg, ${accent}, ${accent2})`,
                    borderRadius: 999,
                    padding: '4px 12px',
                    fontSize: 11,
                    fontWeight: 800,
                    color: '#fff',
                  }}
                >
                  HOT
                </div>
              )}
              <div style={{ aspectRatio: '1', background: '#111' }}>
                <img src={productImage(p)} alt={productTitle(p)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {productTitle(p)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: accent, fontWeight: 800, fontSize: 16 }}>{formatPrice(Number(p.price) || 0)}</span>
                  <button
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: 0,
                      borderRadius: 999,
                      padding: '8px 16px',
                      color: text,
                      fontWeight: 600,
                      fontSize: 12,
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
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '40px 24px',
          textAlign: 'center',
          color: muted,
          fontSize: 13,
        }}
      >
        <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
      </footer>
    </div>
  );
}
