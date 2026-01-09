import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';

/**
 * CLEAN SINGLE - Ultra-minimal single product focus template.
 * Features: Pure white, single product hero, clean order form.
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

export default function CleanSingleTemplate(props: TemplateProps) {
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

  // Clean white theme
  const bg = asString(settings.template_bg_color) || '#ffffff';
  const text = asString(settings.template_text_color) || '#1a1a1a';
  const muted = asString(settings.template_muted_color) || '#737373';
  const accent = asString(settings.template_accent_color) || '#3b82f6';

  const storeName = asString(settings.store_name) || 'Clean Store';
  const heroTitle = asString(settings.template_hero_heading) || 'Premium Quality';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Designed for excellence';
  const cta = asString(settings.template_button_text) || 'Order Now';

  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];

  const descText = asString(settings.template_description_text);
  const descColor = asString(settings.template_description_color) || muted;
  const descSize = resolveInt(settings.template_description_size, 15, 10, 32);

  const mainProduct = products[0];

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
      {/* Minimal Header */}
      <header
        data-edit-path="layout.header"
        onClick={() => canManage && onSelect('layout.header')}
        style={{
          padding: '24px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {asString(settings.store_logo) ? (
            <img src={asString(settings.store_logo)} alt="" style={{ height: 32 }} />
          ) : (
            <span style={{ fontSize: 20, fontWeight: 700 }}>{storeName}</span>
          )}
        </div>
        
        {!isMobile && (
          <nav style={{ display: 'flex', gap: 32, fontSize: 14, color: muted }}>
            <button onClick={() => navigate('/')} style={{ background: 'none', border: 0, color: 'inherit', cursor: 'pointer' }}>Home</button>
            <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: 'inherit', cursor: 'pointer' }}>Products</button>
            <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: 'inherit', cursor: 'pointer' }}>Contact</button>
          </nav>
        )}
      </header>

      {/* Hero - Single Product Focus */}
      <section
        data-edit-path="layout.hero"
        onClick={() => canManage && onSelect('layout.hero')}
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: isMobile ? '40px 24px' : '80px 32px',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 32 : 60, alignItems: 'center' }}>
          {/* Product Images */}
          <div>
            {mainProduct && (
              <>
                <div style={{ background: '#fafafa', borderRadius: 20, overflow: 'hidden', aspectRatio: '1' }}>
                  <img src={productImage(mainProduct)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                {products.length > 1 && (
                  <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                    {products.slice(0, 4).map((p, idx) => (
                      <div 
                        key={p.id} 
                        style={{ 
                          flex: 1, 
                          aspectRatio: '1', 
                          borderRadius: 12, 
                          overflow: 'hidden', 
                          border: idx === 0 ? `2px solid ${accent}` : '2px solid transparent',
                          background: '#fafafa',
                        }}
                      >
                        <img src={productImage(p)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Product Info & Order */}
          <div>
            <span style={{ color: accent, fontSize: 13, fontWeight: 600, letterSpacing: '0.1em' }}>FEATURED PRODUCT</span>
            <h1 style={{ fontSize: isMobile ? 32 : 42, fontWeight: 700, lineHeight: 1.2, margin: '16px 0 0' }}>
              {heroTitle}
            </h1>
            <p style={{ marginTop: 16, fontSize: 16, color: muted, lineHeight: 1.8 }}>
              {heroSubtitle}
            </p>

            {mainProduct && (
              <div style={{ marginTop: 28, fontSize: 32, fontWeight: 700, color: accent }}>
                {formatPrice(Number(mainProduct.price) || 0)}
              </div>
            )}

            {/* Feature list */}
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['✓ Premium Quality Materials', '✓ 1-Year Warranty', '✓ Free Shipping'].map((f) => (
                <div key={f} style={{ color: muted, fontSize: 14 }}>{f}</div>
              ))}
            </div>

            {/* Order Form */}
            <div style={{ marginTop: 32, padding: 24, background: '#fafafa', borderRadius: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <input placeholder="Your Name" style={{ padding: '16px', background: '#fff', border: '1px solid #e5e5e5', borderRadius: 10, fontSize: 14 }} />
                <input placeholder="Phone Number" style={{ padding: '16px', background: '#fff', border: '1px solid #e5e5e5', borderRadius: 10, fontSize: 14 }} />
                <input placeholder="Delivery Address" style={{ padding: '16px', background: '#fff', border: '1px solid #e5e5e5', borderRadius: 10, fontSize: 14 }} />
                <button
                  style={{
                    background: accent,
                    border: 0,
                    borderRadius: 10,
                    padding: '18px',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: 'pointer',
                  }}
                >
                  {cta}
                </button>
              </div>
              <p style={{ marginTop: 16, textAlign: 'center', color: muted, fontSize: 13 }}>
                💳 Pay on delivery • 🚚 Fast shipping
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      {(canManage || descText) && (
        <section
          data-edit-path="layout.categories"
          onClick={() => canManage && onSelect('layout.categories')}
          style={{ padding: '60px 24px', background: '#fafafa' }}
        >
          <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ color: descColor, fontSize: descSize, lineHeight: 1.9 }}>
              {descText || (canManage ? 'Add product features and description...' : '')}
            </p>
          </div>
        </section>
      )}

      {/* More Products */}
      {products.length > 1 && (
        <section
          data-edit-path="layout.grid"
          onClick={() => canManage && onSelect('layout.grid')}
          style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 32px 80px' }}
        >
          <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 32 }}>More Products</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: 20,
            }}
          >
            {products.slice(1, 9).map((p) => (
              <div
                key={p.id}
                data-edit-path={`layout.grid.items.${p.id}`}
                onClick={(e) => {
                  if (canManage) { e.stopPropagation(); onSelect(`layout.grid.items.${p.id}`); return; }
                  if ((p as any).slug) navigate((p as any).slug);
                }}
                style={{
                  background: '#fafafa',
                  borderRadius: 16,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <div style={{ aspectRatio: '1' }}>
                  <img src={productImage(p)} alt={productTitle(p)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{productTitle(p)}</h3>
                  <div style={{ marginTop: 8, color: accent, fontWeight: 700 }}>{formatPrice(Number(p.price) || 0)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={() => canManage && onSelect('layout.footer')}
        style={{ borderTop: '1px solid #e5e5e5', padding: '32px 24px' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 700 }}>{storeName}</span>
          <p style={{ color: muted, fontSize: 13, marginTop: 12 }}>© {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
