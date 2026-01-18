import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * COMPARISON TABLE - Focused comparison landing page highlighting product vs competitors.
 * Design: Side-by-side comparisons, feature checkmarks, value highlighting, competitive positioning.
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

export default function ComparisonTableTemplate(props: TemplateProps) {
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

  // Theme - Professional blue
  const bg = asString(settings.template_bg_color) || '#f9fafb';
  const text = asString(settings.template_text_color) || '#111827';
  const muted = asString(settings.template_muted_color) || '#6b7280';
  const accent = asString(settings.template_accent_color) || '#2563eb';
  const cardBg = asString((settings as any).template_card_bg) || '#ffffff';
  const border = 'rgba(0,0,0,0.08)';

  // Content
  const storeName = asString(settings.store_name) || 'Compare Pro';
  const heroTitle = asString(settings.template_hero_heading) || 'See Why We\'re #1';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Don\'t just take our word for it. Compare us to the competition and see the difference.';
  const ctaText = asString(settings.template_button_text) || 'Choose the Best';

  // Spacing
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 60, 24, 96);
  const cardRadius = resolveInt(settings.template_card_border_radius, 12, 0, 32);

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

  // Comparison features
  const features = [
    { name: 'Premium Quality', us: true, comp1: false, comp2: false },
    { name: 'Free Shipping', us: true, comp1: true, comp2: false },
    { name: '30-Day Returns', us: true, comp1: false, comp2: true },
    { name: '24/7 Support', us: true, comp1: false, comp2: false },
    { name: 'Best Price Guarantee', us: true, comp1: false, comp2: false },
    { name: 'Eco-Friendly', us: true, comp1: false, comp2: true },
    { name: 'Fast Delivery (1-2 days)', us: true, comp1: true, comp2: false },
    { name: 'Lifetime Warranty', us: true, comp1: false, comp2: false },
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
        style={{ padding: '16px 20px', background: cardBg, borderBottom: `1px solid ${border}` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt={storeName} style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 40, height: 40, borderRadius: 10, background: accent, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900 }}>
                ✓
              </div>
            )}
            <span style={{ fontWeight: 800, fontSize: 16 }}>{storeName}</span>
          </div>
          <button
            data-edit-path="layout.hero.cta"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.cta'); }}
            style={{ background: accent, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
          >
            {ctaText}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section
        data-edit-path="layout.hero"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, textAlign: 'center' }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div
            data-edit-path="layout.hero.badge"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.badge'); }}
            style={{ display: 'inline-block', background: '#dcfce7', color: '#166534', padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 700, marginBottom: 20 }}
          >
            ✓ Rated #1 by customers
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

      {/* Comparison Table */}
      <section
        data-edit-path="layout.featured"
        onClick={(e) => { stopIfManage(e); onSelect('layout.featured'); }}
        style={{ padding: `0 ${baseSpacing}px ${sectionSpacing}px` }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ background: cardBg, borderRadius: cardRadius, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            {/* Table Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', background: '#f3f4f6', padding: '16px 20px', gap: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Feature</div>
              <div style={{ textAlign: 'center' }}>
                <div
                  data-edit-path="layout.hero.image"
                  onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
                  style={{ width: 40, height: 40, margin: '0 auto 8px', borderRadius: 10, overflow: 'hidden', border: `2px solid ${accent}` }}
                >
                  <img src={productImage(mainProduct)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ fontWeight: 800, fontSize: 14, color: accent }}>Us</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 40, height: 40, margin: '0 auto 8px', borderRadius: 10, background: '#e5e7eb' }} />
                <div style={{ fontWeight: 700, fontSize: 12, color: muted }}>Competitor A</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 40, height: 40, margin: '0 auto 8px', borderRadius: 10, background: '#e5e7eb' }} />
                <div style={{ fontWeight: 700, fontSize: 12, color: muted }}>Competitor B</div>
              </div>
            </div>

            {/* Table Rows */}
            {features.map((feature, i) => (
              <div
                key={feature.name}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr',
                  padding: '16px 20px',
                  borderTop: `1px solid ${border}`,
                  background: i % 2 === 0 ? cardBg : '#fafafa',
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 500 }}>{feature.name}</div>
                <div style={{ textAlign: 'center' }}>
                  {feature.us ? (
                    <span style={{ color: '#16a34a', fontSize: 20 }}>✓</span>
                  ) : (
                    <span style={{ color: '#dc2626', fontSize: 18 }}>✗</span>
                  )}
                </div>
                <div style={{ textAlign: 'center' }}>
                  {feature.comp1 ? (
                    <span style={{ color: '#16a34a', fontSize: 20 }}>✓</span>
                  ) : (
                    <span style={{ color: '#dc2626', fontSize: 18 }}>✗</span>
                  )}
                </div>
                <div style={{ textAlign: 'center' }}>
                  {feature.comp2 ? (
                    <span style={{ color: '#16a34a', fontSize: 20 }}>✓</span>
                  ) : (
                    <span style={{ color: '#dc2626', fontSize: 18 }}>✗</span>
                  )}
                </div>
              </div>
            ))}

            {/* Price Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '20px', borderTop: `2px solid ${border}`, background: '#f3f4f6' }}>
              <div style={{ fontSize: 16, fontWeight: 800 }}>Price</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: accent }}>
                  {mainProduct ? formatPrice(mainProduct.price) : '$99'}
                </div>
                <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>BEST VALUE</div>
              </div>
              <div style={{ textAlign: 'center', fontSize: 16, fontWeight: 700, color: muted }}>$149</div>
              <div style={{ textAlign: 'center', fontSize: 16, fontWeight: 700, color: muted }}>$129</div>
            </div>
          </div>

          {/* Summary */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 30 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#16a34a', fontSize: 18 }}>✓</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>8/8 Features</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#16a34a', fontSize: 16 }}>💰</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Best Price</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#16a34a', fontSize: 16 }}>⭐</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Highest Rated</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, background: cardBg }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2
            data-edit-path="layout.featured.title"
            onClick={(e) => { stopIfManage(e); onSelect('layout.featured.title'); }}
            style={{ fontSize: 28, fontWeight: 900, textAlign: 'center', marginBottom: 40 }}
          >
            Why Customers Choose Us
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { icon: '🏆', title: 'Award Winning', desc: 'Recognized as the best in quality and service by industry leaders.' },
              { icon: '💬', title: '10,000+ Reviews', desc: 'Trusted by thousands with an average rating of 4.9/5 stars.' },
              { icon: '🛡️', title: 'Risk Free', desc: '30-day money-back guarantee. No questions asked.' },
            ].map((item) => (
              <div key={item.title} style={{ background: bg, borderRadius: cardRadius, padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{item.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: muted, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 48, color: accent, marginBottom: 16 }}>"</div>
          <blockquote style={{ fontSize: 20, lineHeight: 1.6, marginBottom: 20, fontStyle: 'italic' }}>
            I compared all the options and this was the clear winner. Better features, better price, better service. The decision was easy.
          </blockquote>
          <div style={{ fontWeight: 700 }}>Sarah M.</div>
          <div style={{ fontSize: 13, color: muted }}>Verified Buyer</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 8 }}>
            {[1, 2, 3, 4, 5].map((s) => <span key={s} style={{ color: '#facc15', fontSize: 18 }}>★</span>)}
          </div>
        </div>
      </section>

      {/* Checkout Section */}
      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, background: `linear-gradient(180deg, ${cardBg} 0%, ${accent}10 100%)` }}>
        <div style={{ maxWidth: 500, margin: '0 auto', background: cardBg, borderRadius: cardRadius, padding: 30, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ background: '#dcfce7', color: '#166534', padding: '6px 16px', borderRadius: 999, fontSize: 13, fontWeight: 700, display: 'inline-block', marginBottom: 16 }}>
              ✓ Best Value Choice
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>
              Make the Smart Choice
            </h2>
            <p style={{ color: muted, fontSize: 14 }}>
              Join thousands who chose the best
            </p>
          </div>
          
          <EmbeddedCheckout
            storeSlug={storeSlug}
            product={mainProduct as any}
            formatPrice={formatPrice}
            theme={checkoutTheme}
            disabled={canManage}
            heading={ctaText}
            subheading={canManage ? 'Disabled in editor' : '30-day money-back guarantee'}
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
