import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';

/**
 * BERRY MARKET - Deep berry purple marketplace theme.
 * Features: Berry purple accents, category tiles, horizontal scroll sections.
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

export default function BerryMarketTemplate(props: TemplateProps) {
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

  // Berry theme
  const bg = asString(settings.template_bg_color) || '#faf5ff';
  const text = asString(settings.template_text_color) || '#1e1b4b';
  const muted = asString(settings.template_muted_color) || '#6366f1';
  const accent = asString(settings.template_accent_color) || '#7c3aed';

  const storeName = asString(settings.store_name) || 'Berry Market';
  const heroTitle = asString(settings.template_hero_heading) || 'Shop Smart, Live Better';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Thousands of products at unbeatable prices';
  const cta = asString(settings.template_button_text) || 'Start Shopping';

  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 20) || [];

  const descText = asString(settings.template_description_text);
  const descColor = asString(settings.template_description_color) || muted;
  const descSize = resolveInt(settings.template_description_size, 15, 10, 32);

  return (
    <div
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
          background: accent,
          padding: '14px 24px',
        }}
      >
        <div style={{ maxWidth: 1300, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt="" style={{ width: 40, height: 40, borderRadius: 10 }} />
            ) : (
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, fontWeight: 800 }}>
                B
              </div>
            )}
            <span style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{storeName}</span>
          </div>
          
          {!isMobile && (
            <div style={{ flex: 1, maxWidth: 450, margin: '0 32px' }}>
              <input
                type="text"
                placeholder="What are you looking for?"
                style={{ width: '100%', padding: '14px 20px', border: 0, borderRadius: 12, fontSize: 14 }}
              />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button style={{ background: 'rgba(255,255,255,0.2)', border: 0, borderRadius: 10, padding: '10px 20px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
              🛒 Cart
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        data-edit-path="layout.hero"
        onClick={() => canManage && onSelect('layout.hero')}
        style={{
          background: `linear-gradient(135deg, ${accent} 0%, #a855f7 50%, #ec4899 100%)`,
          padding: isMobile ? '48px 24px' : '72px 40px',
          color: '#fff',
        }}
      >
        <div style={{ maxWidth: 1300, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 48, alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: isMobile ? 36 : 52, fontWeight: 800, lineHeight: 1.1, margin: 0 }}>
              {heroTitle}
            </h1>
            <p style={{ marginTop: 20, fontSize: 18, opacity: 0.9, lineHeight: 1.7 }}>
              {heroSubtitle}
            </p>
            <div style={{ marginTop: 32, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/products')}
                style={{
                  background: '#fff',
                  border: 0,
                  borderRadius: 12,
                  padding: '16px 32px',
                  color: accent,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {cta}
              </button>
              <button
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderRadius: 12,
                  padding: '14px 28px',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Learn More
              </button>
            </div>
          </div>
          
          {!isMobile && products.length >= 3 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
              {products.slice(0, 3).map((p, idx) => (
                <div
                  key={p.id}
                  style={{
                    background: '#fff',
                    borderRadius: 16,
                    padding: 8,
                    width: 140,
                    transform: idx === 1 ? 'translateY(-20px)' : 'none',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                  }}
                >
                  <div style={{ aspectRatio: '1', borderRadius: 12, overflow: 'hidden' }}>
                    <img src={productImage(p)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '8px 4px', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: text, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{productTitle(p)}</div>
                    <div style={{ fontSize: 13, color: accent, fontWeight: 800, marginTop: 4 }}>{formatPrice(Number(p.price) || 0)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Category tiles */}
      <section style={{ maxWidth: 1300, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)', gap: 16 }}>
          {['🛍️ Fashion', '📱 Tech', '🏠 Home', '💄 Beauty', '🎮 Gaming', '⚽ Sports'].map((cat) => (
            <button
              key={cat}
              onClick={() => navigate('/products')}
              style={{
                background: '#fff',
                border: 0,
                borderRadius: 16,
                padding: 20,
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <div style={{ fontSize: 28 }}>{cat.split(' ')[0]}</div>
              <div style={{ fontSize: 12, fontWeight: 600, marginTop: 8, color: text }}>{cat.split(' ')[1]}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Description */}
      {(canManage || descText) && (
        <section
          data-edit-path="layout.categories"
          onClick={() => canManage && onSelect('layout.categories')}
          style={{ padding: '24px', maxWidth: 1300, margin: '0 auto' }}
        >
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, textAlign: 'center' }}>
            <p style={{ color: descColor, fontSize: descSize, lineHeight: 1.8, margin: 0 }}>
              {descText || (canManage ? 'Add your marketplace description...' : '')}
            </p>
          </div>
        </section>
      )}

      {/* Flash deals */}
      <section style={{ maxWidth: 1300, margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>⚡</span>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Flash Deals</h2>
            <span style={{ background: '#fef2f2', color: '#ef4444', padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>Ends in 2h 30m</span>
          </div>
          <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: accent, fontWeight: 700, cursor: 'pointer' }}>
            See All →
          </button>
        </div>

        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16 }}>
          {products.slice(0, 6).map((p) => (
            <div
              key={p.id}
              onClick={() => (p as any).slug && navigate((p as any).slug)}
              style={{
                background: '#fff',
                borderRadius: 16,
                overflow: 'hidden',
                minWidth: 180,
                cursor: 'pointer',
              }}
            >
              <div style={{ aspectRatio: '1', background: '#f9fafb' }}>
                <img src={productImage(p)} alt={productTitle(p)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{productTitle(p)}</div>
                <div style={{ marginTop: 8 }}>
                  <span style={{ color: accent, fontWeight: 800, fontSize: 16 }}>{formatPrice(Number(p.price) || 0)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Products grid */}
      <section
        data-edit-path="layout.grid"
        onClick={() => canManage && onSelect('layout.grid')}
        style={{ maxWidth: 1300, margin: '0 auto', padding: '24px 24px 60px' }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>All Products</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)',
            gap: 16,
          }}
        >
          {products.slice(0, 10).map((p) => (
            <div
              key={p.id}
              data-edit-path={`layout.grid.items.${p.id}`}
              onClick={(e) => {
                if (canManage) { e.stopPropagation(); onSelect(`layout.grid.items.${p.id}`); return; }
                if ((p as any).slug) navigate((p as any).slug);
              }}
              style={{
                background: '#fff',
                borderRadius: 16,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
            >
              <div style={{ aspectRatio: '1', background: '#f9fafb' }}>
                <img src={productImage(p)} alt={productTitle(p)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{productTitle(p)}</div>
                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: accent, fontWeight: 800, fontSize: 15 }}>{formatPrice(Number(p.price) || 0)}</span>
                  <button style={{ background: accent, border: 0, borderRadius: 8, width: 32, height: 32, color: '#fff', cursor: 'pointer' }}>
                    +
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
        style={{ background: text, color: '#fff', padding: '48px 24px' }}
      >
        <div style={{ maxWidth: 1300, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 32 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>{storeName}</div>
            <p style={{ opacity: 0.6, fontSize: 14, lineHeight: 1.7 }}>
              Your trusted online marketplace.
            </p>
          </div>
          {['Shop', 'Help', 'About'].map((section) => (
            <div key={section}>
              <h5 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>{section}</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, opacity: 0.6 }}>
                <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>Link</a>
                <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>Link</a>
              </div>
            </div>
          ))}
        </div>
        <div style={{ maxWidth: 1300, margin: '32px auto 0', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', fontSize: 13, opacity: 0.5 }}>
          © {new Date().getFullYear()} {storeName}
        </div>
      </footer>
    </div>
  );
}
