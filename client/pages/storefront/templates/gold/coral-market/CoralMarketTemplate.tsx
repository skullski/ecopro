import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';

/**
 * CORAL MARKET - Coral pink/white marketplace style.
 * Features: Coral accents, product thumbnails, category navigation.
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

export default function CoralMarketTemplate(props: TemplateProps) {
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

  // Coral theme
  const bg = asString(settings.template_bg_color) || '#fff5f5';
  const text = asString(settings.template_text_color) || '#1a1a1a';
  const muted = asString(settings.template_muted_color) || '#737373';
  const accent = asString(settings.template_accent_color) || '#f472b6';

  const storeName = asString(settings.store_name) || 'Coral Market';
  const heroTitle = asString(settings.template_hero_heading) || 'Shop the Latest Trends';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Fresh styles delivered to your door';
  const cta = asString(settings.template_button_text) || 'Start Shopping';

  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 16) || [];

  const descText = asString(settings.template_description_text);
  const descColor = asString(settings.template_description_color) || muted;
  const descSize = resolveInt(settings.template_description_size, 15, 10, 32);

  // Layout settings
  const gridColumns = resolveInt(settings.template_grid_columns, 4, 2, 6);
  const gridGap = resolveInt(settings.template_grid_gap, 16, 8, 48);
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 48, 24, 96);
  const animationSpeed = resolveInt(settings.template_animation_speed, 300, 100, 500);
  const hoverScale = asString(settings.template_hover_scale) || '1.02';
  const cardRadius = resolveInt(settings.template_card_border_radius, 16, 0, 32);

  return (
    <div
      className="ecopro-storefront"
      style={{
        minHeight: '100vh',
        background: bg,
        color: text,
        fontFamily: '"Poppins", system-ui, sans-serif',
      }}
    >
      {/* Top announcement */}
      <div style={{ background: accent, color: '#fff', textAlign: 'center', padding: '10px 16px', fontSize: 13, fontWeight: 500 }}>
        🎉 Summer Sale - Up to 50% OFF on selected items!
      </div>

      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={() => canManage && onSelect('layout.header')}
        style={{
          background: '#fff',
          padding: '14px 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt="" style={{ width: 38, height: 38, borderRadius: '50%' }} />
            ) : (
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg, ${accent}, #fb7185)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                C
              </div>
            )}
            <span style={{ fontSize: 22, fontWeight: 700, color: accent }}>{storeName}</span>
          </div>
          
          {!isMobile && (
            <div style={{ flex: 1, maxWidth: 400, margin: '0 24px' }}>
              <input
                type="text"
                placeholder="Search for products..."
                style={{ width: '100%', padding: '12px 16px', border: '2px solid #f0f0f0', borderRadius: 24, fontSize: 14, outline: 'none' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => navigate('/products')} style={{ background: accent, border: 0, borderRadius: 24, padding: '10px 24px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
              Shop
            </button>
          </div>
        </div>
      </header>

      {/* Category bar */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '12px 24px', overflowX: 'auto' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', gap: 24, fontSize: 14, fontWeight: 500 }}>
          {['All Products', 'New In', 'Dresses', 'Tops', 'Accessories', 'Sale'].map((cat) => (
            <button key={cat} onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: text, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {cat}
            </button>
          ))}
        </div>
      </nav>

      {/* Hero */}
      <section
        data-edit-path="layout.hero"
        onClick={() => canManage && onSelect('layout.hero')}
        style={{ maxWidth: 1280, margin: '0 auto', padding: isMobile ? '32px 24px' : '48px 24px' }}
      >
        <div style={{ background: `linear-gradient(135deg, ${accent}20, ${accent}05)`, borderRadius: 24, padding: isMobile ? '40px 24px' : '60px 48px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 40, alignItems: 'center' }}>
          <div>
            <span style={{ background: accent, color: '#fff', padding: '6px 14px', borderRadius: 16, fontSize: 12, fontWeight: 600 }}>NEW COLLECTION</span>
            <h1 style={{ fontSize: isMobile ? 32 : 44, fontWeight: 800, lineHeight: 1.2, margin: '20px 0 0' }}>
              {heroTitle}
            </h1>
            <p style={{ marginTop: 16, fontSize: 16, color: muted, lineHeight: 1.7 }}>
              {heroSubtitle}
            </p>
            <button
              onClick={() => navigate('/products')}
              style={{
                marginTop: 28,
                background: accent,
                border: 0,
                borderRadius: 28,
                padding: '16px 36px',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {cta} →
            </button>
          </div>
          
          {!isMobile && products.length >= 3 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {products.slice(0, 3).map((p, idx) => (
                <div key={p.id} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', transform: idx === 1 ? 'scale(1.1)' : 'none', boxShadow: idx === 1 ? '0 10px 30px rgba(0,0,0,0.1)' : 'none' }}>
                  <div style={{ aspectRatio: '3/4' }}>
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
          style={{ padding: '32px 24px' }}
        >
          <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ color: descColor, fontSize: descSize, lineHeight: 1.8 }}>
              {descText || (canManage ? 'Add your store description...' : '')}
            </p>
          </div>
        </section>
      )}

      {/* Products */}
      <section
        data-edit-path="layout.grid"
        onClick={() => canManage && onSelect('layout.grid')}
        style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 80px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Trending Now</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <select style={{ padding: '8px 16px', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 13, background: '#fff' }}>
              <option>Sort by: Popular</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : `repeat(${gridColumns}, 1fr)`,
            gap: gridGap,
          }}
        >
          {products.slice(0, 8).map((p, idx) => (
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
                transition: `transform ${animationSpeed}ms`,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = `scale(${hoverScale})`)}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <div style={{ aspectRatio: '3/4', position: 'relative' }}>
                <img src={productImage(p)} alt={productTitle(p)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {idx < 2 && <span style={{ position: 'absolute', top: 10, left: 10, background: accent, color: '#fff', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600 }}>NEW</span>}
                <button style={{ position: 'absolute', top: 10, right: 10, background: '#fff', border: 0, borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 14 }}>
                  ❤️
                </button>
              </div>
              <div style={{ padding: 14 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {productTitle(p)}
                </h3>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: accent, fontWeight: 700, fontSize: 15 }}>{formatPrice(Number(p.price) || 0)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button
            onClick={() => navigate('/products')}
            style={{
              background: 'transparent',
              border: `2px solid ${accent}`,
              borderRadius: 28,
              padding: '14px 40px',
              color: accent,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Load More
          </button>
        </div>
      </section>

      {/* Newsletter */}
      <section style={{ background: '#fff', padding: '60px 24px' }}>
        <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Stay in the Loop</h3>
          <p style={{ color: muted, marginTop: 8 }}>Subscribe for exclusive deals and updates</p>
          <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
            <input type="email" placeholder="Enter your email" style={{ flex: 1, padding: '14px 18px', border: '2px solid #f0f0f0', borderRadius: 28, fontSize: 14 }} />
            <button style={{ background: accent, border: 0, borderRadius: 28, padding: '14px 24px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={() => canManage && onSelect('layout.footer')}
        style={{ background: '#1a1a1a', color: '#fff', padding: '48px 24px' }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 32 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: accent, marginBottom: 16 }}>{storeName}</div>
            <p style={{ opacity: 0.6, fontSize: 14, lineHeight: 1.7 }}>
              Your go-to destination for trendy fashion.
            </p>
          </div>
          {['Shop', 'Help', 'Follow Us'].map((section) => (
            <div key={section}>
              <h5 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>{section}</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, opacity: 0.6 }}>
                <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>Link One</a>
                <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>Link Two</a>
              </div>
            </div>
          ))}
        </div>
        <div style={{ maxWidth: 1280, margin: '32px auto 0', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', fontSize: 13, opacity: 0.5 }}>
          © {new Date().getFullYear()} {storeName}
        </div>
      </footer>
    </div>
  );
}
