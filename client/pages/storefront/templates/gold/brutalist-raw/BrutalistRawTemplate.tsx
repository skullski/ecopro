import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * BRUTALIST RAW - Raw brutalist design landing page.
 * Design: Bold typography, stark contrasts, raw shapes, unconventional layout, anti-design aesthetic.
 */

function asString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function resolveInt(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = typeof value === 'number' ? value : parseInt(String(value || ''), 10);
  const safe = Number.isFinite(parsed) ? parsed : fallback;
  return Math.max(min, Math.min(max, safe));
}

function productImage(p: StoreProduct | undefined): string {
  if (!p) return '/placeholder.png';
  const img = Array.isArray((p as any).images) ? (p as any).images.find(Boolean) : undefined;
  return typeof img === 'string' && img ? img : '/placeholder.png';
}

export default function BrutalistRawTemplate(props: TemplateProps) {
  const { settings, formatPrice } = props;
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
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [(props as any).forcedBreakpoint]);

  // Theme - Raw black/white with accent
  const bg = asString(settings.template_bg_color) || '#fffef5';
  const text = asString(settings.template_text_color) || '#000000';
  const muted = asString(settings.template_muted_color) || '#555555';
  const accent = asString(settings.template_accent_color) || '#ff0000';
  const cardBg = asString((settings as any).template_card_bg) || '#ffffff';
  const border = '#000000';

  // Content
  const storeName = asString(settings.store_name) || 'RAW';
  const heroTitle = asString(settings.template_hero_heading) || 'NO COMPROMISE';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Stripped back. Authentic. Real. This is not for everyone—and that\'s the point.';
  const ctaText = asString(settings.template_button_text) || 'BUY NOW';

  // Spacing
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 60, 24, 96);

  // Products
  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];
  const mainProduct = products[0];
  const storeSlug = asString((settings as any).store_slug);

  const checkoutTheme = { bg, text, muted, accent, cardBg, border };

  const stopIfManage = (e: React.MouseEvent) => {
    if (!canManage) return;
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      data-edit-path="__root"
      onClick={() => canManage && onSelect('__root')}
      className="ecopro-storefront"
      style={{
        minHeight: '100vh',
        background: bg,
        color: text,
        fontFamily: '"Courier New", Courier, monospace',
      }}
    >
      {/* Header - Raw */}
      <header
        data-edit-path="layout.header"
        onClick={(e) => { stopIfManage(e); onSelect('layout.header'); }}
        style={{ padding: '20px', borderBottom: `4px solid ${border}` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt={storeName} style={{ width: 50, height: 50, objectFit: 'cover', border: `3px solid ${border}` }} />
            ) : (
              <div style={{
                width: 50,
                height: 50,
                background: border,
                color: bg,
                display: 'grid',
                placeItems: 'center',
                fontWeight: 900,
                fontSize: 24,
              }}>
                {storeName.slice(0, 1)}
              </div>
            )}
            <span style={{ fontWeight: 900, fontSize: 24, textTransform: 'uppercase', letterSpacing: 4 }}>
              {storeName}
            </span>
          </div>
          <button
            data-edit-path="layout.hero.cta"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.cta'); }}
            style={{
              background: accent,
              color: '#fff',
              border: `3px solid ${border}`,
              borderRadius: 0,
              padding: '12px 30px',
              fontWeight: 900,
              cursor: 'pointer',
              fontSize: 14,
              textTransform: 'uppercase',
              letterSpacing: 2,
            }}
          >
            {ctaText}
          </button>
        </div>
      </header>

      {/* Hero - Brutalist */}
      <section
        data-edit-path="layout.hero"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, borderBottom: `4px solid ${border}` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Massive Title */}
          <h1
            data-edit-path="layout.hero.title"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.title'); }}
            style={{
              fontSize: isMobile ? 48 : 120,
              fontWeight: 900,
              lineHeight: 0.9,
              marginBottom: 40,
              textTransform: 'uppercase',
              letterSpacing: -4,
            }}
          >
            {heroTitle}
          </h1>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 40 }}>
            {/* Product Image */}
            <div
              data-edit-path="layout.hero.image"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
              style={{
                border: `4px solid ${border}`,
                position: 'relative',
              }}
            >
              <img
                src={productImage(mainProduct)}
                alt="Product"
                style={{ width: '100%', display: 'block' }}
              />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                background: accent,
                color: '#fff',
                padding: '8px 20px',
                fontWeight: 900,
                fontSize: 14,
              }}>
                NEW
              </div>
            </div>

            {/* Content */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div
                  data-edit-path="layout.hero.badge"
                  onClick={(e) => { stopIfManage(e); onSelect('layout.hero.badge'); }}
                  style={{
                    display: 'inline-block',
                    border: `3px solid ${border}`,
                    padding: '8px 16px',
                    fontSize: 12,
                    marginBottom: 24,
                  }}
                >
                  001 / FEATURED PRODUCT
                </div>

                <p
                  data-edit-path="layout.hero.subtitle"
                  onClick={(e) => { stopIfManage(e); onSelect('layout.hero.subtitle'); }}
                  style={{
                    fontSize: 18,
                    lineHeight: 1.6,
                    marginBottom: 32,
                    maxWidth: 400,
                  }}
                >
                  {heroSubtitle}
                </p>

                <div style={{ fontSize: 48, fontWeight: 900, marginBottom: 24 }}>
                  {mainProduct ? formatPrice(mainProduct.price) : '$99.00'}
                </div>
              </div>

              <button
                style={{
                  background: border,
                  color: bg,
                  border: 'none',
                  borderRadius: 0,
                  padding: '20px 40px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  fontSize: 18,
                  textTransform: 'uppercase',
                  letterSpacing: 2,
                  width: 'fit-content',
                }}
              >
                ADD TO CART →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section style={{ padding: `${sectionSpacing * 0.5}px ${baseSpacing}px`, background: border, color: bg }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 20 }}>
            {['AUTHENTIC', 'UNFILTERED', 'ORIGINAL', 'BOLD'].map((word) => (
              <span key={word} style={{ fontSize: isMobile ? 24 : 36, fontWeight: 900, letterSpacing: 4 }}>
                {word}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        data-edit-path="layout.featured"
        onClick={(e) => { stopIfManage(e); onSelect('layout.featured'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, borderBottom: `4px solid ${border}` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2
            data-edit-path="layout.featured.title"
            onClick={(e) => { stopIfManage(e); onSelect('layout.featured.title'); }}
            style={{ fontSize: 48, fontWeight: 900, marginBottom: 50, textTransform: 'uppercase' }}
          >
            THE FACTS
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 0 }}>
            {[
              { num: '01', title: 'QUALITY', desc: 'No shortcuts. No compromises. Built to last.' },
              { num: '02', title: 'PRICE', desc: 'Direct to you. No middlemen. Fair pricing.' },
              { num: '03', title: 'SUPPORT', desc: 'Real humans. Real answers. No scripts.' },
            ].map((item, i) => (
              <div
                key={item.num}
                style={{
                  padding: 30,
                  borderLeft: i > 0 && !isMobile ? `3px solid ${border}` : 'none',
                  borderTop: i > 0 && isMobile ? `3px solid ${border}` : 'none',
                }}
              >
                <div style={{ fontSize: 72, fontWeight: 900, opacity: 0.1, marginBottom: -20 }}>{item.num}</div>
                <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>{item.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 36, fontWeight: 900, textTransform: 'uppercase' }}>MORE</h2>
            <span style={{ fontSize: 14 }}>SCROLL →</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 20 }}>
            {products.slice(0, 4).map((product, i) => (
              <div key={product.id}>
                <div style={{ border: `3px solid ${border}`, marginBottom: 12 }}>
                  <img src={productImage(product)} alt={product.name} style={{ width: '100%', display: 'block' }} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 900, marginBottom: 4 }}>00{i + 2}</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, textTransform: 'uppercase' }}>{product.name}</div>
                <div style={{ fontSize: 18, fontWeight: 900 }}>{formatPrice(product.price)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section style={{ padding: `${sectionSpacing * 0.7}px ${baseSpacing}px`, background: accent, color: '#fff' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <blockquote style={{ fontSize: isMobile ? 28 : 48, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2 }}>
            "REJECT THE ORDINARY"
          </blockquote>
        </div>
      </section>

      {/* Checkout Section */}
      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, borderTop: `4px solid ${border}` }}>
        <div style={{
          maxWidth: 500,
          margin: '0 auto',
          border: `4px solid ${border}`,
          padding: 30,
          background: cardBg,
        }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 12, marginBottom: 8, letterSpacing: 2 }}>CHECKOUT</div>
            <h2 style={{ fontSize: 32, fontWeight: 900, textTransform: 'uppercase' }}>
              GET IT NOW
            </h2>
          </div>
          
          <EmbeddedCheckout
            storeSlug={storeSlug}
            product={mainProduct as any}
            formatPrice={formatPrice}
            theme={checkoutTheme}
            disabled={canManage}
            heading={ctaText}
            subheading={canManage ? 'Disabled in editor' : 'Free shipping. No BS.'}
          />
        </div>
      </section>

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={(e) => { stopIfManage(e); onSelect('layout.footer'); }}
        style={{ background: border, color: bg, padding: `${baseSpacing * 2}px ${baseSpacing}px`, textAlign: 'center' }}
      >
        <div style={{ fontSize: 48, fontWeight: 900, marginBottom: 16 }}>{storeName}</div>
        <p
          data-edit-path="layout.footer.copyright"
          onClick={(e) => { stopIfManage(e); onSelect('layout.footer.copyright'); }}
          style={{ fontSize: 12 }}
        >
          {asString((settings as any).template_copyright) || `© ${new Date().getFullYear()} ${storeName}. NO RIGHTS RESERVED.`}
        </p>
      </footer>
    </div>
  );
}
