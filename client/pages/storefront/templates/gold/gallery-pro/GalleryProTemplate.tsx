import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';

/**
 * GALLERY PRO - Image gallery focused template.
 * Features: Large product gallery, thumbnail navigation, clean order form.
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

function productImages(p: StoreProduct): string[] {
  if (Array.isArray(p.images)) {
    return p.images.filter((img): img is string => typeof img === 'string' && !!img);
  }
  return [];
}

export default function GalleryProTemplate(props: TemplateProps) {
  const { settings, formatPrice, navigate } = props;
  const canManage = Boolean(props.canManage);
  const onSelect = (path: string) => {
    if (canManage && typeof (props as any).onSelect === 'function') {
      (props as any).onSelect(path);
    }
  };

  const [isMobile, setIsMobile] = React.useState((props as any).forcedBreakpoint === 'mobile');
  const [selectedImage, setSelectedImage] = React.useState(0);
  
  React.useEffect(() => {
    const bp = (props as any).forcedBreakpoint;
    if (bp) { setIsMobile(bp === 'mobile'); return; }
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [(props as any).forcedBreakpoint]);

  // Gallery theme
  const bg = asString(settings.template_bg_color) || '#ffffff';
  const text = asString(settings.template_text_color) || '#18181b';
  const muted = asString(settings.template_muted_color) || '#71717a';
  const accent = asString(settings.template_accent_color) || '#2563eb';

  const storeName = asString(settings.store_name) || 'Gallery Pro';
  const heroTitle = asString(settings.template_hero_heading) || 'Premium Selection';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Browse our exclusive collection of premium products';
  const cta = asString(settings.template_button_text) || 'Order Now';

  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];

  const descText = asString(settings.template_description_text);
  const descColor = asString(settings.template_description_color) || muted;
  const descSize = resolveInt(settings.template_description_size, 15, 10, 32);

  const mainProduct = products[0];
  const images = mainProduct ? productImages(mainProduct) : [];
  const displayImages = images.length > 0 ? images : [productImage(mainProduct || products[0])];

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
      {/* Simple Header */}
      <header
        data-edit-path="layout.header"
        onClick={() => canManage && onSelect('layout.header')}
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid #f4f4f5',
        }}
      >
        <div style={{ maxWidth: 1300, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt="" style={{ height: 32 }} />
            ) : (
              <span style={{ fontSize: 20, fontWeight: 700 }}>{storeName}</span>
            )}
          </div>
          
          {!isMobile && (
            <nav style={{ display: 'flex', gap: 28, fontSize: 14, color: muted }}>
              <button onClick={() => navigate('/')} style={{ background: 'none', border: 0, color: text, cursor: 'pointer', fontWeight: 500 }}>Home</button>
              <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: 'inherit', cursor: 'pointer' }}>Products</button>
              <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: 'inherit', cursor: 'pointer' }}>Contact</button>
            </nav>
          )}

          <button
            onClick={() => navigate('/products')}
            style={{
              background: accent,
              border: 0,
              borderRadius: 8,
              padding: '10px 20px',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Shop All
          </button>
        </div>
      </header>

      {/* Hero - Gallery Layout */}
      <section
        data-edit-path="layout.hero"
        onClick={() => canManage && onSelect('layout.hero')}
        style={{
          maxWidth: 1300,
          margin: '0 auto',
          padding: isMobile ? '24px' : '40px 24px',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 400px', gap: isMobile ? 24 : 40 }}>
          {/* Gallery Section */}
          <div>
            {/* Main Image */}
            <div style={{ background: '#fafafa', borderRadius: 16, overflow: 'hidden', aspectRatio: isMobile ? '4/3' : '16/10', marginBottom: 12 }}>
              {displayImages[selectedImage] && (
                <img 
                  src={displayImages[selectedImage]} 
                  alt="" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                />
              )}
            </div>

            {/* Thumbnails */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
              {displayImages.slice(0, 8).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  style={{
                    flexShrink: 0,
                    width: 72,
                    height: 72,
                    borderRadius: 10,
                    overflow: 'hidden',
                    border: idx === selectedImage ? `2px solid ${accent}` : '2px solid #e4e4e7',
                    cursor: 'pointer',
                    padding: 0,
                    background: '#fafafa',
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
              
              {/* Also show other products as thumbnails */}
              {products.slice(1, 6).map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    if ((p as any).slug) navigate((p as any).slug);
                  }}
                  style={{
                    flexShrink: 0,
                    width: 72,
                    height: 72,
                    borderRadius: 10,
                    overflow: 'hidden',
                    border: '2px solid #e4e4e7',
                    cursor: 'pointer',
                    padding: 0,
                    background: '#fafafa',
                  }}
                >
                  <img src={productImage(p)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info & Order Form */}
          <div style={{ background: '#fafafa', borderRadius: 16, padding: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.3, margin: 0 }}>
              {heroTitle}
            </h1>
            <p style={{ marginTop: 12, fontSize: 14, color: muted, lineHeight: 1.7 }}>
              {heroSubtitle}
            </p>

            {mainProduct && (
              <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: accent }}>{formatPrice(Number(mainProduct.price) || 0)}</span>
                <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>In Stock</span>
              </div>
            )}

            {/* Features */}
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['✅ Original product', '🚚 Free shipping', '💰 Cash on delivery', '🔄 7-day return policy'].map((f) => (
                <div key={f} style={{ fontSize: 13, color: muted }}>{f}</div>
              ))}
            </div>

            {/* Order Form */}
            <div style={{ marginTop: 24, borderTop: '1px solid #e4e4e7', paddingTop: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Quick Order</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input placeholder="Full Name" style={{ padding: '14px', border: '1px solid #e4e4e7', borderRadius: 10, fontSize: 14, background: '#fff' }} />
                <input placeholder="Phone" style={{ padding: '14px', border: '1px solid #e4e4e7', borderRadius: 10, fontSize: 14, background: '#fff' }} />
                <input placeholder="City" style={{ padding: '14px', border: '1px solid #e4e4e7', borderRadius: 10, fontSize: 14, background: '#fff' }} />
                <textarea placeholder="Full Address" rows={2} style={{ padding: '14px', border: '1px solid #e4e4e7', borderRadius: 10, fontSize: 14, resize: 'none', background: '#fff' }} />
                
                {/* Quantity */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Qty:</span>
                  <div style={{ display: 'flex', border: '1px solid #e4e4e7', borderRadius: 8, overflow: 'hidden' }}>
                    <button style={{ width: 36, height: 36, border: 0, background: '#fff', cursor: 'pointer', fontSize: 18 }}>−</button>
                    <span style={{ width: 40, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid #e4e4e7', borderRight: '1px solid #e4e4e7', fontWeight: 600 }}>1</span>
                    <button style={{ width: 36, height: 36, border: 0, background: '#fff', cursor: 'pointer', fontSize: 18 }}>+</button>
                  </div>
                </div>

                <button
                  style={{
                    background: accent,
                    border: 0,
                    borderRadius: 10,
                    padding: '16px',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: 'pointer',
                    marginTop: 8,
                  }}
                >
                  {cta}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      {(canManage || descText) && (
        <section
          data-edit-path="layout.categories"
          onClick={() => canManage && onSelect('layout.categories')}
          style={{ padding: '48px 24px', borderTop: '1px solid #f4f4f5' }}
        >
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ color: descColor, fontSize: descSize, lineHeight: 1.9 }}>
              {descText || (canManage ? 'Add product description and specifications...' : '')}
            </p>
          </div>
        </section>
      )}

      {/* More Products */}
      {products.length > 1 && (
        <section
          data-edit-path="layout.grid"
          onClick={() => canManage && onSelect('layout.grid')}
          style={{ maxWidth: 1300, margin: '0 auto', padding: '40px 24px 80px' }}
        >
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Related Products</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)',
              gap: 16,
            }}
          >
            {products.slice(1, 11).map((p) => (
              <div
                key={p.id}
                data-edit-path={`layout.grid.items.${p.id}`}
                onClick={(e) => {
                  if (canManage) { e.stopPropagation(); onSelect(`layout.grid.items.${p.id}`); return; }
                  if ((p as any).slug) navigate((p as any).slug);
                }}
                style={{
                  background: '#fafafa',
                  borderRadius: 12,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
              >
                <div style={{ aspectRatio: '1' }}>
                  <img src={productImage(p)} alt={productTitle(p)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: 12 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {productTitle(p)}
                  </h3>
                  <div style={{ marginTop: 8, fontWeight: 700, color: accent }}>{formatPrice(Number(p.price) || 0)}</div>
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
        style={{ borderTop: '1px solid #f4f4f5', padding: '32px 24px', background: '#fafafa' }}
      >
        <div style={{ maxWidth: 1300, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 700 }}>{storeName}</span>
          <p style={{ color: muted, fontSize: 13, marginTop: 12 }}>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
