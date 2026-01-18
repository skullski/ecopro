import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * GLASSMORPHISM - Frosted glass aesthetic landing page.
 * Design: Transparent glass panels, blur effects, subtle gradients, modern elegance.
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

export default function GlassmorphismTemplate(props: TemplateProps) {
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

  // Theme - Soft purple/blue gradient
  const bg = asString(settings.template_bg_color) || '#1e1b4b';
  const text = asString(settings.template_text_color) || '#ffffff';
  const muted = asString(settings.template_muted_color) || '#c4b5fd';
  const accent = asString(settings.template_accent_color) || '#a78bfa';
  const cardBg = 'rgba(255, 255, 255, 0.08)';
  const border = 'rgba(255,255,255,0.15)';

  // Content
  const storeName = asString(settings.store_name) || 'Glass';
  const heroTitle = asString(settings.template_hero_heading) || 'Clarity in Design';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Experience the perfect blend of elegance and transparency. Where modern design meets timeless beauty.';
  const ctaText = asString(settings.template_button_text) || 'Discover';

  // Spacing
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 60, 24, 96);
  const cardRadius = resolveInt(settings.template_card_border_radius, 24, 0, 32);

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

  // Glass card style
  const glassStyle: React.CSSProperties = {
    background: cardBg,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${border}`,
    borderRadius: cardRadius,
  };

  return (
    <div
      data-edit-path="__root"
      onClick={() => canManage && onSelect('__root')}
      className="ecopro-storefront"
      style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${bg} 0%, #312e81 50%, #1e1b4b 100%)`,
        color: text,
        fontFamily: 'system-ui, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Blobs */}
      <div style={{ position: 'fixed', top: '-20%', left: '-10%', width: 600, height: 600, background: '#7c3aed', borderRadius: '50%', filter: 'blur(150px)', opacity: 0.3, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-20%', right: '-10%', width: 500, height: 500, background: '#ec4899', borderRadius: '50%', filter: 'blur(150px)', opacity: 0.3, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', top: '40%', right: '20%', width: 300, height: 300, background: '#06b6d4', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.2, pointerEvents: 'none' }} />

      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={(e) => { stopIfManage(e); onSelect('layout.header'); }}
        style={{
          position: 'sticky',
          top: 16,
          zIndex: 50,
          margin: '16px 20px 0',
          padding: '14px 24px',
          ...glassStyle,
          maxWidth: 1200,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt={storeName} style={{ width: 38, height: 38, borderRadius: 12, objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: `linear-gradient(135deg, ${accent}, #ec4899)`,
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 900,
                fontSize: 16,
              }}>
                G
              </div>
            )}
            <span style={{ fontWeight: 700, fontSize: 16 }}>{storeName}</span>
          </div>
          <button
            data-edit-path="layout.hero.cta"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.cta'); }}
            style={{
              background: `linear-gradient(135deg, ${accent}, #ec4899)`,
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '10px 24px',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            {ctaText}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section
        data-edit-path="layout.hero"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero'); }}
        style={{ padding: `${sectionSpacing * 1.5}px ${baseSpacing}px`, position: 'relative' }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 60, alignItems: 'center' }}>
          {/* Content */}
          <div>
            <div
              data-edit-path="layout.hero.badge"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.badge'); }}
              style={{
                display: 'inline-block',
                ...glassStyle,
                padding: '10px 20px',
                borderRadius: 999,
                fontSize: 13,
                marginBottom: 24,
              }}
            >
              ✦ New Collection 2025
            </div>

            <h1
              data-edit-path="layout.hero.title"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.title'); }}
              style={{
                fontSize: isMobile ? 40 : 56,
                fontWeight: 800,
                lineHeight: 1.1,
                marginBottom: 24,
              }}
            >
              {heroTitle}
            </h1>

            <p
              data-edit-path="layout.hero.subtitle"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.subtitle'); }}
              style={{ fontSize: 17, color: muted, lineHeight: 1.7, marginBottom: 32 }}
            >
              {heroSubtitle}
            </p>

            <div style={{ display: 'flex', gap: 16 }}>
              <button
                style={{
                  background: `linear-gradient(135deg, ${accent}, #ec4899)`,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 14,
                  padding: '16px 32px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: 15,
                }}
              >
                Shop Now
              </button>
              <button
                style={{
                  ...glassStyle,
                  color: text,
                  borderRadius: 14,
                  padding: '16px 32px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: 15,
                }}
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Product Card */}
          <div
            data-edit-path="layout.hero.image"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
            style={{
              ...glassStyle,
              padding: 20,
              position: 'relative',
            }}
          >
            <img
              src={productImage(mainProduct)}
              alt="Product"
              style={{
                width: '100%',
                borderRadius: cardRadius - 4,
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: 32,
              left: 32,
              right: 32,
              ...glassStyle,
              padding: 20,
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{mainProduct?.name || 'Premium Product'}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: accent }}>
                {mainProduct ? formatPrice(mainProduct.price) : '$129.00'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        data-edit-path="layout.featured"
        onClick={(e) => { stopIfManage(e); onSelect('layout.featured'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2
            data-edit-path="layout.featured.title"
            onClick={(e) => { stopIfManage(e); onSelect('layout.featured.title'); }}
            style={{ fontSize: 32, fontWeight: 800, textAlign: 'center', marginBottom: 50 }}
          >
            Why Choose Us
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { icon: '◆', title: 'Premium Quality', desc: 'Crafted with the finest materials for lasting elegance.' },
              { icon: '◇', title: 'Free Shipping', desc: 'Complimentary delivery on all orders worldwide.' },
              { icon: '◈', title: '24/7 Support', desc: 'Our team is always here to help you anytime.' },
            ].map((feat) => (
              <div
                key={feat.title}
                style={{
                  ...glassStyle,
                  padding: 32,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 32, color: accent, marginBottom: 20 }}>{feat.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{feat.title}</h3>
                <p style={{ fontSize: 14, color: muted, lineHeight: 1.6 }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', marginBottom: 40 }}>
            Featured Collection
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 20 }}>
            {products.slice(0, 4).map((product) => (
              <div
                key={product.id}
                style={{
                  ...glassStyle,
                  overflow: 'hidden',
                  transition: 'transform 0.3s',
                }}
                onMouseEnter={(e) => !canManage && (e.currentTarget.style.transform = 'translateY(-5px)')}
                onMouseLeave={(e) => !canManage && (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <img src={productImage(product)} alt={product.name} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: accent }}>{formatPrice(product.price)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}>
        <div style={{ maxWidth: 700, margin: '0 auto', ...glassStyle, padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>"</div>
          <blockquote style={{ fontSize: 20, lineHeight: 1.6, marginBottom: 24, fontStyle: 'italic' }}>
            The quality exceeded my expectations. Absolutely stunning design and incredibly well-made.
          </blockquote>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${accent}, #ec4899)` }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700 }}>Emma Wilson</div>
              <div style={{ fontSize: 13, color: muted }}>Verified Buyer</div>
            </div>
          </div>
        </div>
      </section>

      {/* Checkout Section */}
      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}>
        <div style={{
          maxWidth: 500,
          margin: '0 auto',
          ...glassStyle,
          padding: 32,
        }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: accent, marginBottom: 8 }}>✦ Secure Checkout</div>
            <h2 style={{ fontSize: 24, fontWeight: 800 }}>
              Complete Your Order
            </h2>
          </div>
          
          <EmbeddedCheckout
            storeSlug={storeSlug}
            product={mainProduct as any}
            formatPrice={formatPrice}
            theme={checkoutTheme}
            disabled={canManage}
            heading={ctaText}
            subheading={canManage ? 'Disabled in editor' : 'Free shipping included'}
          />
        </div>
      </section>

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={(e) => { stopIfManage(e); onSelect('layout.footer'); }}
        style={{ padding: `${baseSpacing * 2}px ${baseSpacing}px`, textAlign: 'center' }}
      >
        <p
          data-edit-path="layout.footer.copyright"
          onClick={(e) => { stopIfManage(e); onSelect('layout.footer.copyright'); }}
          style={{ fontSize: 13, color: muted }}
        >
          {asString((settings as any).template_copyright) || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`}
        </p>
      </footer>
    </div>
  );
}
