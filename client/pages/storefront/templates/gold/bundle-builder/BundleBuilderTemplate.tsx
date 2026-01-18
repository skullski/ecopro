import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * BUNDLE BUILDER - Product bundle/package builder landing page.
 * Design: Package tiers, bundle savings, comparison, value-focused.
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

export default function BundleBuilderTemplate(props: TemplateProps) {
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

  // Theme - Clean blue/purple gradient
  const bg = asString(settings.template_bg_color) || '#f8fafc';
  const text = asString(settings.template_text_color) || '#0f172a';
  const muted = asString(settings.template_muted_color) || '#64748b';
  const accent = asString(settings.template_accent_color) || '#6366f1';
  const cardBg = asString((settings as any).template_card_bg) || '#ffffff';
  const border = 'rgba(0,0,0,0.06)';

  // Content
  const storeName = asString(settings.store_name) || 'Bundle Pro';
  const heroTitle = asString(settings.template_hero_heading) || 'Build Your Perfect Bundle';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Mix and match products to create the perfect package. The more you add, the more you save!';
  const ctaText = asString(settings.template_button_text) || 'Start Building';

  // Spacing
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 60, 24, 96);
  const cardRadius = resolveInt(settings.template_card_border_radius, 16, 0, 32);

  // Products
  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];
  const mainProduct = products[0];
  const storeSlug = asString((settings as any).store_slug);

  const checkoutTheme = { bg, text, muted, accent, cardBg, border };

  // Selected bundle tier
  const [selectedTier, setSelectedTier] = React.useState(1);

  const stopIfManage = (e: React.MouseEvent) => {
    if (!canManage) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const bundles = [
    { name: 'Starter', items: 1, discount: 0, price: 49, popular: false },
    { name: 'Best Value', items: 3, discount: 25, price: 109, popular: true },
    { name: 'Ultimate', items: 5, discount: 40, price: 149, popular: false },
  ];

  return (
    <div
      data-edit-path="__root"
      onClick={() => canManage && onSelect('__root')}
      className="ecopro-storefront"
      style={{ minHeight: '100vh', background: bg, color: text, fontFamily: 'system-ui, sans-serif' }}
    >
      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={(e) => { stopIfManage(e); onSelect('layout.header'); }}
        style={{ padding: '16px 20px', background: cardBg, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt={storeName} style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${accent}, #8b5cf6)`, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900 }}>
                📦
              </div>
            )}
            <span style={{ fontWeight: 800, fontSize: 16 }}>{storeName}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: muted }}>🎁 Free shipping on bundles</span>
            <button
              data-edit-path="layout.hero.cta"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.cta'); }}
              style={{ background: accent, color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
            >
              {ctaText}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        data-edit-path="layout.hero"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, background: `linear-gradient(135deg, ${accent}10 0%, #8b5cf610 100%)` }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div
            data-edit-path="layout.hero.badge"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.badge'); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: cardBg, padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, marginBottom: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
          >
            <span style={{ background: accent, color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>NEW</span>
            Bundle & Save up to 40%
          </div>

          <h1
            data-edit-path="layout.hero.title"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.title'); }}
            style={{ fontSize: isMobile ? 32 : 48, fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}
          >
            {heroTitle}
          </h1>

          <p
            data-edit-path="layout.hero.subtitle"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.subtitle'); }}
            style={{ fontSize: 17, color: muted, lineHeight: 1.6, maxWidth: 600, margin: '0 auto' }}
          >
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* Bundle Tiers */}
      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, marginTop: -40 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 24 }}>
            {bundles.map((bundle, i) => (
              <div
                key={bundle.name}
                onClick={() => setSelectedTier(i)}
                style={{
                  background: cardBg,
                  borderRadius: cardRadius,
                  padding: 24,
                  border: selectedTier === i ? `3px solid ${accent}` : `1px solid ${border}`,
                  cursor: 'pointer',
                  position: 'relative',
                  transform: bundle.popular ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: bundle.popular ? '0 20px 40px rgba(0,0,0,0.1)' : '0 2px 10px rgba(0,0,0,0.05)',
                  zIndex: bundle.popular ? 10 : 1,
                }}
              >
                {bundle.popular && (
                  <div style={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: `linear-gradient(135deg, ${accent}, #8b5cf6)`,
                    color: '#fff',
                    padding: '6px 16px',
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 800,
                  }}>
                    MOST POPULAR
                  </div>
                )}

                <div style={{ textAlign: 'center', marginTop: bundle.popular ? 10 : 0 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{bundle.name}</h3>
                  <div style={{ fontSize: 13, color: muted, marginBottom: 16 }}>{bundle.items} Product{bundle.items > 1 ? 's' : ''}</div>

                  {/* Visual product stack */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                    {Array.from({ length: bundle.items }).map((_, pi) => (
                      <div
                        key={pi}
                        data-edit-path={pi === 0 ? 'layout.hero.image' : undefined}
                        onClick={pi === 0 ? (e) => { stopIfManage(e); onSelect('layout.hero.image'); } : undefined}
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 10,
                          overflow: 'hidden',
                          border: '2px solid #fff',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          marginLeft: pi > 0 ? -15 : 0,
                          zIndex: bundle.items - pi,
                        }}
                      >
                        <img src={productImage(products[pi] || mainProduct)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>

                  {bundle.discount > 0 && (
                    <div style={{ background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, display: 'inline-block', marginBottom: 16 }}>
                      Save {bundle.discount}%
                    </div>
                  )}

                  <div style={{ fontSize: 36, fontWeight: 900, marginBottom: 8 }}>
                    ${bundle.price}
                  </div>
                  {bundle.discount > 0 && (
                    <div style={{ fontSize: 14, color: muted, textDecoration: 'line-through' }}>
                      ${Math.round(bundle.price / (1 - bundle.discount / 100))}
                    </div>
                  )}

                  <button
                    style={{
                      width: '100%',
                      marginTop: 20,
                      background: selectedTier === i ? accent : 'transparent',
                      color: selectedTier === i ? '#fff' : accent,
                      border: `2px solid ${accent}`,
                      borderRadius: 10,
                      padding: '12px 24px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                  >
                    {selectedTier === i ? '✓ Selected' : 'Select Bundle'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section
        data-edit-path="layout.featured"
        onClick={(e) => { stopIfManage(e); onSelect('layout.featured'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, background: cardBg }}
      >
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2
            data-edit-path="layout.featured.title"
            onClick={(e) => { stopIfManage(e); onSelect('layout.featured.title'); }}
            style={{ fontSize: 28, fontWeight: 900, textAlign: 'center', marginBottom: 40 }}
          >
            What's Included in Your Bundle
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 20 }}>
            {products.slice(0, 4).map((product) => (
              <div key={product.id} style={{ textAlign: 'center' }}>
                <div style={{ background: bg, borderRadius: cardRadius, padding: 16, marginBottom: 12 }}>
                  <img src={productImage(product)} alt={product.name} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: cardRadius - 4 }} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{product.name}</div>
                <div style={{ fontSize: 13, color: muted }}>{formatPrice(product.price)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 30 }}>
          {[
            { icon: '💰', title: 'Bundle Savings', desc: 'Save up to 40% when you bundle multiple products together.' },
            { icon: '🚚', title: 'Free Shipping', desc: 'All bundles ship free. No minimum order required.' },
            { icon: '🔄', title: 'Easy Returns', desc: '30-day hassle-free returns on all bundle purchases.' },
          ].map((item) => (
            <div key={item.title} style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>{item.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{item.title}</h3>
              <p style={{ fontSize: 14, color: muted, lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Checkout Section */}
      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, background: `linear-gradient(180deg, ${bg} 0%, ${accent}10 100%)` }}>
        <div style={{ maxWidth: 500, margin: '0 auto', background: cardBg, borderRadius: cardRadius, padding: 30, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: accent, fontWeight: 700, marginBottom: 8 }}>
              {bundles[selectedTier].name} Bundle Selected
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>
              Complete Your Order
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 28, fontWeight: 900 }}>${bundles[selectedTier].price}</span>
              {bundles[selectedTier].discount > 0 && (
                <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                  Save {bundles[selectedTier].discount}%
                </span>
              )}
            </div>
          </div>
          
          <EmbeddedCheckout
            storeSlug={storeSlug}
            product={mainProduct as any}
            formatPrice={formatPrice}
            theme={checkoutTheme}
            disabled={canManage}
            heading={ctaText}
            subheading={canManage ? 'Disabled in editor' : '🎁 Free shipping included'}
          />
        </div>
      </section>

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={(e) => { stopIfManage(e); onSelect('layout.footer'); }}
        style={{ borderTop: `1px solid ${border}`, padding: `${baseSpacing * 1.5}px ${baseSpacing}px`, textAlign: 'center' }}
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
