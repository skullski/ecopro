import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * PURE PRODUCT - Minimal product-centric template.
 * Features: Ultra clean, product showcase, sticky order button.
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

export default function PureProductTemplate(props: TemplateProps) {
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

  // Pure minimal theme
  const bg = asString(settings.template_bg_color) || '#fefefe';
  const text = asString(settings.template_text_color) || '#111111';
  const muted = asString(settings.template_muted_color) || '#666666';
  const accent = asString(settings.template_accent_color) || '#0066ff';

  

  const productTitleColor = asString(settings.template_product_title_color) || text;
  const productPriceColor = asString(settings.template_product_price_color) || accent;

  const cardBg = asString(settings.template_card_bg) || "#ffffff";
const storeName = asString(settings.store_name) || 'Pure';
  
  const copyright = asString(settings.template_copyright) || `© ${new Date().getFullYear()} ${storeName}`;
const heroTitle = asString(settings.template_hero_heading) || 'Exceptional Quality';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Crafted with precision and care';
  const cta = asString(settings.template_button_text) || 'Buy Now';

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
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 48, 24, 96);
  const animationSpeed = resolveInt(settings.template_animation_speed, 200, 100, 500);
  const hoverScale = asString(settings.template_hover_scale) || '1.02';
  const cardRadius = resolveInt(settings.template_card_border_radius, 16, 0, 32);

  const mainProduct = products[0];
  const [selectedProduct, setSelectedProduct] = React.useState<StoreProduct | undefined>(mainProduct);
  React.useEffect(() => {
    setSelectedProduct(mainProduct);
  }, [mainProduct ? (mainProduct as any).id : undefined]);

  const storeSlug = asString((settings as any).store_slug);
  const checkoutTheme = {
    bg,
    text,
    muted,
    accent,
    cardBg: '#ffffff',
    border: '#eee',
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      data-edit-path="__root"
      onClick={() => canManage && onSelect("__root")}
      className="ecopro-storefront"
      style={{
        minHeight: '100vh',
        background: bg,
        color: text,
        fontFamily: '"SF Pro Display", -apple-system, system-ui, sans-serif',
      }}
    >
      {/* Minimal Header */}
      <header
        data-edit-path="layout.header"
        onClick={() => canManage && onSelect('layout.header')}
        style={{
          padding: '20px 24px',
          position: 'sticky',
          top: 0,
          background: bg,
          zIndex: 100,
          borderBottom: '1px solid #eee',
        }}
      >
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {asString(settings.store_logo) ? (
            <img src={asString(settings.store_logo)} alt="" style={{ height: 28 }} />
          ) : (
            <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>{storeName}</span>
          )}
          
          <button
            onClick={() => navigate('/products')}
            style={{
              background: text,
              border: 0,
              borderRadius: 8,
              padding: '10px 20px',
              color: bg,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Shop All
          </button>
        </div>
      </header>

      {/* Hero */}
      <section
        data-edit-path="layout.hero"
        onClick={() => canManage && onSelect('layout.hero')}
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: isMobile ? '48px 24px' : '80px 24px',
          textAlign: 'center',
        }}
      >
        {selectedProduct && (
          <div style={{ marginBottom: sectionSpacing }}>
            <div 
              style={{ 
                maxWidth: isMobile ? '100%' : 500, 
                margin: '0 auto', 
                aspectRatio: '1', 
                borderRadius: cardRadius,
                overflow: 'hidden',
                background: '#f5f5f5',
              }}
            >
              <img src={productImage(selectedProduct)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        )}

        <h1 style={{ fontSize: isMobile ? 36 : 52, fontWeight: 700, lineHeight: 1.1, margin: 0, letterSpacing: '-0.03em' }}>
          {heroTitle}
        </h1>
        <p style={{ marginTop: 20, fontSize: 18, color: muted, lineHeight: 1.7, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
          {heroSubtitle}
        </p>

        {selectedProduct && (
          <div style={{ marginTop: 32 }}>
            <span style={{ fontSize: 36, fontWeight: 700 }}>{formatPrice(Number((selectedProduct as any).price) || 0)}</span>
            <button
              onClick={() => scrollTo('checkout')}
              style={{
                display: 'block',
                width: '100%',
                maxWidth: 300,
                margin: '24px auto 0',
                background: accent,
                border: 0,
                borderRadius: 12,
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
        )}
      </section>

      {/* Inline Checkout */}
      <section id="checkout" style={{ maxWidth: 700, margin: '0 auto', padding: `0 ${baseSpacing}px ${sectionSpacing}px` }}>
        <EmbeddedCheckout
          storeSlug={storeSlug}
          product={selectedProduct as any}
          formatPrice={formatPrice}
          theme={checkoutTheme}
          disabled={canManage}
          heading={cta}
          subheading={canManage ? 'Disabled in editor preview' : 'Cash on delivery • Fast delivery'}
        />
      </section>

      {/* Features */}
      <section style={{ borderTop: '1px solid #eee', borderBottom: '1px solid #eee', padding: '40px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 32, textAlign: 'center' }}>
          {[
            { title: 'Free Shipping', desc: 'On all orders' },
            { title: 'Warranty', desc: '1 year coverage' },
            { title: 'Cash on Delivery', desc: 'Pay when you receive' },
          ].map((f) => (
            <div key={f.title}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: muted, marginTop: 4 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Description */}
      {(canManage || descText) && (
        <section
          data-edit-path="layout.categories"
          onClick={() => canManage && onSelect('layout.categories')}
          style={{ padding: '60px 24px' }}
        >
          <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ color: descColor, fontSize: descSize, lineHeight: 2 }}>
              {descText || (canManage ? 'Add product details here...' : '')}
            </p>
          </div>
        </section>
      )}

      {/* Specs */}
      <section style={{ maxWidth: 700, margin: '0 auto', padding: `${sectionSpacing}px ${baseSpacing}px` }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Specifications</h2>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            ['Material', 'Premium Grade'],
            ['Dimensions', 'Standard Size'],
            ['Weight', 'Lightweight'],
            ['Warranty', '12 Months'],
          ].map(([key, val]) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #eee' }}>
              <span style={{ color: muted }}>{key}</span>
              <span style={{ fontWeight: 600 }}>{val}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Other Products */}
      {products.length > 1 && (
        <section
          data-edit-path="layout.grid"
          onClick={() => canManage && onSelect('layout.grid')}
          style={{ maxWidth: 1000, margin: '0 auto', padding: `${sectionSpacing}px ${baseSpacing}px ${sectionSpacing * 1.5}px` }}
        >
          <h2 data-edit-path="layout.featured.title" style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>{sectionTitle}</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : `repeat(${gridColumns}, 1fr)`,
              gap: gridGap,
            }}
          >
            {products.slice(1, 5).map((p) => (
              <div
                key={p.id}
                data-edit-path={`layout.grid.items.${p.id}`}
                onClick={(e) => {
                  if (canManage) { e.stopPropagation(); onSelect(`layout.grid.items.${p.id}`); return; }
                  setSelectedProduct(p);
                  scrollTo('checkout');
                }}
                style={{
                  cursor: 'pointer',
                  transition: `transform ${animationSpeed}ms`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = `scale(${hoverScale})`; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <div style={{ aspectRatio: '1', borderRadius: cardRadius, overflow: 'hidden', background: '#f5f5f5' }}>
                  <img src={productImage(p)} alt={productTitle(p)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '12px 4px' }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 , color: productTitleColor}}>{productTitle(p)}</h3>
                  <div style={{ marginTop: 6, fontWeight: 700 }}>{formatPrice(Number(p.price) || 0)}</div>
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
        style={{ borderTop: '1px solid #eee', padding: `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <span style={{ fontWeight: 700 }}>{storeName}</span>
          <span style={{ color: muted, fontSize: 13 }}>© {new Date().getFullYear()}</span>
        </div>
      </footer>

      {/* Sticky bottom CTA on mobile */}
      {isMobile && selectedProduct && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: bg, padding: '16px 24px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: 18 }}>{formatPrice(Number((selectedProduct as any).price) || 0)}</span>
          <button
            onClick={() => scrollTo('checkout')}
            style={{
              background: accent,
              border: 0,
              borderRadius: 10,
              padding: '14px 32px',
              color: '#fff',
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
            }}
          >
            {cta}
          </button>
        </div>
      )}
    </div>
  );
}
