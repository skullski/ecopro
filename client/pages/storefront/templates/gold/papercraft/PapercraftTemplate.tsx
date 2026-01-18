import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * PAPERCRAFT - Paper/craft aesthetic landing page.
 * Design: Paper textures, cut-out shapes, shadow layers, handmade feel, sticker aesthetic.
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

export default function PapercraftTemplate(props: TemplateProps) {
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

  // Theme - Warm paper colors
  const bg = asString(settings.template_bg_color) || '#f5f0e1';
  const text = asString(settings.template_text_color) || '#2d2a26';
  const muted = asString(settings.template_muted_color) || '#8a7e6d';
  const accent = asString(settings.template_accent_color) || '#e85d4c';
  const cardBg = asString((settings as any).template_card_bg) || '#ffffff';
  const border = 'rgba(45,42,38,0.1)';
  const shadow = '4px 4px 0 rgba(0,0,0,0.1)';

  // Paper colors
  const paperYellow = '#fff8dc';
  const paperPink = '#ffd9d9';
  const paperBlue = '#d9e8ff';
  const paperGreen = '#d9ffd9';

  // Content
  const storeName = asString(settings.store_name) || 'Papercraft';
  const heroTitle = asString(settings.template_hero_heading) || 'Handcrafted with Love';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Every product tells a story. Made with care, delivered with joy.';
  const ctaText = asString(settings.template_button_text) || 'Shop Now';

  // Spacing
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 60, 24, 96);
  const cardRadius = resolveInt(settings.template_card_border_radius, 4, 0, 32);

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

  // Paper card style
  const paperStyle: React.CSSProperties = {
    background: cardBg,
    borderRadius: cardRadius,
    boxShadow: shadow,
    position: 'relative',
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
        fontFamily: '"Patrick Hand", "Comic Neue", cursive, system-ui',
        backgroundImage: `
          radial-gradient(${border} 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
      }}
    >
      {/* Header - Paper strip */}
      <header
        data-edit-path="layout.header"
        onClick={(e) => { stopIfManage(e); onSelect('layout.header'); }}
        style={{
          padding: '20px 24px',
          background: paperYellow,
          boxShadow: '0 4px 0 rgba(0,0,0,0.05)',
          borderBottom: '2px dashed #ccc',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {asString(settings.store_logo) ? (
              <img
                src={asString(settings.store_logo)}
                alt={storeName}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 999,
                  objectFit: 'cover',
                  border: '3px solid #fff',
                  boxShadow: shadow,
                }}
              />
            ) : (
              <div style={{
                width: 50,
                height: 50,
                borderRadius: 999,
                background: accent,
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 700,
                fontSize: 24,
                boxShadow: shadow,
              }}>
                ✂
              </div>
            )}
            <span style={{ fontSize: 24, fontWeight: 700 }}>{storeName}</span>
          </div>
          <button
            data-edit-path="layout.hero.cta"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.cta'); }}
            style={{
              background: accent,
              color: '#fff',
              border: 'none',
              borderRadius: 999,
              padding: '12px 28px',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 16,
              boxShadow: shadow,
              transform: 'rotate(-2deg)',
            }}
          >
            {ctaText} ✨
          </button>
        </div>
      </header>

      {/* Hero */}
      <section
        data-edit-path="layout.hero"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 50, alignItems: 'center' }}>
            {/* Content */}
            <div>
              <div
                data-edit-path="layout.hero.badge"
                onClick={(e) => { stopIfManage(e); onSelect('layout.hero.badge'); }}
                style={{
                  display: 'inline-block',
                  background: paperPink,
                  padding: '8px 20px',
                  borderRadius: 999,
                  fontSize: 14,
                  marginBottom: 20,
                  boxShadow: shadow,
                  transform: 'rotate(2deg)',
                }}
              >
                ⭐ New Collection!
              </div>

              <h1
                data-edit-path="layout.hero.title"
                onClick={(e) => { stopIfManage(e); onSelect('layout.hero.title'); }}
                style={{
                  fontSize: isMobile ? 36 : 52,
                  fontWeight: 700,
                  lineHeight: 1.2,
                  marginBottom: 20,
                }}
              >
                {heroTitle}
              </h1>

              <p
                data-edit-path="layout.hero.subtitle"
                onClick={(e) => { stopIfManage(e); onSelect('layout.hero.subtitle'); }}
                style={{
                  fontSize: 18,
                  color: muted,
                  lineHeight: 1.7,
                  marginBottom: 30,
                  fontFamily: 'Georgia, serif',
                }}
              >
                {heroSubtitle}
              </p>

              {/* Sticker tags */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 30 }}>
                {['✓ Free Shipping', '✓ Handmade', '✓ Eco-Friendly'].map((tag, i) => (
                  <span
                    key={tag}
                    style={{
                      background: [paperBlue, paperGreen, paperPink][i],
                      padding: '6px 14px',
                      borderRadius: 999,
                      fontSize: 13,
                      boxShadow: '2px 2px 0 rgba(0,0,0,0.05)',
                      transform: `rotate(${[-1, 1, -2][i]}deg)`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <button
                style={{
                  background: accent,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 999,
                  padding: '16px 36px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: 18,
                  boxShadow: shadow,
                }}
              >
                Explore Collection →
              </button>
            </div>

            {/* Product - Layered paper effect */}
            <div style={{ position: 'relative' }}>
              {/* Back layer */}
              <div style={{
                position: 'absolute',
                inset: -10,
                background: paperPink,
                borderRadius: cardRadius + 10,
                transform: 'rotate(3deg)',
                boxShadow: shadow,
              }} />
              {/* Middle layer */}
              <div style={{
                position: 'absolute',
                inset: -5,
                background: paperBlue,
                borderRadius: cardRadius + 5,
                transform: 'rotate(-2deg)',
                boxShadow: shadow,
              }} />
              {/* Front layer */}
              <div
                data-edit-path="layout.hero.image"
                onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
                style={{
                  position: 'relative',
                  ...paperStyle,
                  overflow: 'hidden',
                }}
              >
                <img
                  src={productImage(mainProduct)}
                  alt="Product"
                  style={{
                    width: '100%',
                    display: 'block',
                    borderRadius: cardRadius,
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  background: accent,
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: 999,
                  fontSize: 18,
                  fontWeight: 700,
                  boxShadow: shadow,
                  transform: 'rotate(5deg)',
                }}>
                  {mainProduct ? formatPrice(mainProduct.price) : '$49'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Paper notes */}
      <section
        data-edit-path="layout.featured"
        onClick={(e) => { stopIfManage(e); onSelect('layout.featured'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2
            data-edit-path="layout.featured.title"
            onClick={(e) => { stopIfManage(e); onSelect('layout.featured.title'); }}
            style={{ fontSize: 32, fontWeight: 700, textAlign: 'center', marginBottom: 50 }}
          >
            Why You'll Love Us 💕
          </h2>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
            {[
              { icon: '🎨', title: 'Unique Design', desc: 'Each piece is one of a kind', color: paperYellow },
              { icon: '🌿', title: 'Eco Materials', desc: 'Sustainable and planet-friendly', color: paperGreen },
              { icon: '💝', title: 'Gift Ready', desc: 'Beautifully packaged for gifting', color: paperPink },
            ].map((item, i) => (
              <div
                key={item.title}
                style={{
                  background: item.color,
                  padding: 24,
                  width: 220,
                  textAlign: 'center',
                  boxShadow: shadow,
                  transform: `rotate(${[-2, 1, -1][i]}deg)`,
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>{item.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: muted, fontFamily: 'Georgia, serif' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, background: 'rgba(255,255,255,0.5)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 40 }}>
            Shop Our Favorites ✨
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 20 }}>
            {products.slice(0, 4).map((product, i) => (
              <div
                key={product.id}
                style={{
                  ...paperStyle,
                  overflow: 'hidden',
                  transform: `rotate(${[-1, 1, -1, 2][i]}deg)`,
                }}
              >
                <img src={productImage(product)} alt={product.name} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
                <div style={{ padding: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{product.name}</div>
                  <div style={{ fontSize: 18, color: accent, fontWeight: 700 }}>{formatPrice(product.price)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial - Sticky note */}
      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}>
        <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            background: paperYellow,
            padding: 30,
            boxShadow: '4px 8px 0 rgba(0,0,0,0.1)',
            transform: 'rotate(-1deg)',
          }}>
            <div style={{ fontSize: 24, marginBottom: 16 }}>💬</div>
            <blockquote style={{ fontSize: 18, lineHeight: 1.6, marginBottom: 16, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
              "Absolutely love this! The quality is amazing and it arrived beautifully packaged. Will definitely order again!"
            </blockquote>
            <div style={{ fontWeight: 700 }}>— Happy Customer</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 8 }}>
              {[1, 2, 3, 4, 5].map((s) => <span key={s} style={{ color: '#fbbf24', fontSize: 18 }}>★</span>)}
            </div>
          </div>
        </div>
      </section>

      {/* Checkout Section */}
      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}>
        <div style={{
          maxWidth: 500,
          margin: '0 auto',
          background: cardBg,
          borderRadius: cardRadius,
          padding: 30,
          boxShadow: '6px 6px 0 rgba(0,0,0,0.1)',
          border: '2px dashed #ccc',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <span style={{
              display: 'inline-block',
              background: paperPink,
              padding: '4px 12px',
              borderRadius: 999,
              fontSize: 12,
              marginBottom: 12,
              transform: 'rotate(2deg)',
            }}>
              ✂ Checkout
            </span>
            <h2 style={{ fontSize: 24, fontWeight: 700 }}>
              Complete Your Order 🛒
            </h2>
          </div>
          
          <EmbeddedCheckout
            storeSlug={storeSlug}
            product={mainProduct as any}
            formatPrice={formatPrice}
            theme={checkoutTheme}
            disabled={canManage}
            heading={ctaText}
            subheading={canManage ? 'Disabled in editor' : '🎁 Gift wrapping available!'}
          />
        </div>
      </section>

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={(e) => { stopIfManage(e); onSelect('layout.footer'); }}
        style={{
          padding: `${baseSpacing * 2}px ${baseSpacing}px`,
          textAlign: 'center',
          background: paperYellow,
          borderTop: '2px dashed #ccc',
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{storeName} ✂</div>
        <p
          data-edit-path="layout.footer.copyright"
          onClick={(e) => { stopIfManage(e); onSelect('layout.footer.copyright'); }}
          style={{ fontSize: 14, color: muted, fontFamily: 'Georgia, serif' }}
        >
          {asString((settings as any).template_copyright) || `© ${new Date().getFullYear()} ${storeName}. Made with 💕`}
        </p>
      </footer>
    </div>
  );
}
