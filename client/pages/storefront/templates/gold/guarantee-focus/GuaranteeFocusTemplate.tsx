import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * GUARANTEE FOCUS - Landing page centered around money-back guarantee and risk-free messaging.
 * Design: Large guarantee badge, risk-free benefits, trust stats, confidence-building layout.
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

function safePrice(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(String(value ?? '').trim());
  return Number.isFinite(n) ? n : 0;
}

export default function GuaranteeFocusTemplate(props: TemplateProps) {
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
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [(props as any).forcedBreakpoint]);

  // Theme - Green/Trust colors
  const bg = asString(settings.template_bg_color) || '#ffffff';
  const text = asString(settings.template_text_color) || '#1e293b';
  const muted = asString(settings.template_muted_color) || '#64748b';
  const accent = asString(settings.template_accent_color) || '#059669';
  const cardBg = asString((settings as any).template_card_bg) || '#ffffff';
  const border = 'rgba(0,0,0,0.06)';

  // Content
  const storeName = asString(settings.store_name) || 'Guarantee Focus';
  const heroTitle = asString(settings.template_hero_heading) || '100% Risk-Free Purchase';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Try it for 30 days. If you\'re not completely satisfied, we\'ll refund every penny. No questions asked.';
  const ctaText = asString(settings.template_button_text) || 'Try Risk-Free';
  const badgeTitle = asString((settings as any).template_hero_badge_title) || '30-DAY';
  const badgeSubtitle = asString((settings as any).template_hero_badge_subtitle) || 'MONEY-BACK GUARANTEE';

  // Spacing
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 56, 24, 96);
  const cardRadius = resolveInt(settings.template_card_border_radius, 16, 0, 32);

  // Products
  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];
  const mainProduct = products[0];
  const storeSlug = asString((settings as any).store_slug);
  const priceValue = mainProduct ? safePrice((mainProduct as any).price) : 0;

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
      style={{ minHeight: '100vh', background: bg, color: text, fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      {/* Guarantee Strip */}
      <div
        data-edit-path="layout.hero.badge"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero.badge'); }}
        style={{
          background: `linear-gradient(135deg, ${accent} 0%, #10b981 100%)`,
          color: '#fff',
          padding: '10px 20px',
          textAlign: 'center',
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        🛡️ {badgeSubtitle} • Shop with Confidence
      </div>

      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={(e) => { stopIfManage(e); onSelect('layout.header'); }}
        style={{ position: 'sticky', top: 0, zIndex: 30, background: bg, borderBottom: `1px solid ${border}`, padding: '14px 20px' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt={storeName} style={{ width: 38, height: 38, borderRadius: 10, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 38, height: 38, borderRadius: 10, background: accent, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 16 }}>
                {storeName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <span style={{ fontWeight: 800, fontSize: 15 }}>{storeName}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: accent, fontWeight: 700 }}>🛡️ Risk-Free Shopping</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        data-edit-path="layout.hero"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 400px', gap: 40, alignItems: 'start' }}>
          
          {/* Left Content */}
          <div>
            {/* Large Guarantee Badge */}
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 16, 
              background: `linear-gradient(135deg, ${accent}15, ${accent}05)`,
              border: `2px solid ${accent}`,
              borderRadius: cardRadius,
              padding: '20px 28px',
              marginBottom: 28,
            }}>
              <div style={{ 
                width: 70, 
                height: 70, 
                borderRadius: '50%', 
                background: accent, 
                color: '#fff', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: 900,
              }}>
                <span style={{ fontSize: 22, lineHeight: 1 }}>{badgeTitle}</span>
                <span style={{ fontSize: 8, letterSpacing: 0.5 }}>DAYS</span>
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 18, color: accent }}>MONEY-BACK</div>
                <div style={{ fontWeight: 800, fontSize: 14, color: text }}>GUARANTEE</div>
              </div>
            </div>

            <h1
              data-edit-path="layout.hero.title"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.title'); }}
              style={{ fontSize: isMobile ? 32 : 46, fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}
            >
              {heroTitle}
            </h1>

            <p
              data-edit-path="layout.hero.subtitle"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.subtitle'); }}
              style={{ fontSize: 18, color: muted, lineHeight: 1.7, marginBottom: 28 }}
            >
              {heroSubtitle}
            </p>

            {/* Risk-Free Benefits */}
            <div style={{ display: 'grid', gap: 14, marginBottom: 32 }}>
              {[
                { icon: '✓', title: 'No Risk', desc: 'Full refund if not satisfied' },
                { icon: '✓', title: 'Free Returns', desc: 'We cover return shipping' },
                { icon: '✓', title: 'No Questions', desc: 'Easy, hassle-free process' },
                { icon: '✓', title: 'Instant Refund', desc: 'Money back within 48 hours' },
              ].map((benefit) => (
                <div key={benefit.title} style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#f8fafc', padding: '14px 18px', borderRadius: 12 }}>
                  <span style={{ width: 28, height: 28, borderRadius: '50%', background: accent, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 700 }}>
                    {benefit.icon}
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{benefit.title}</div>
                    <div style={{ fontSize: 12, color: muted }}>{benefit.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Product Image */}
            <div
              data-edit-path="layout.hero.image"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
              style={{ borderRadius: cardRadius, overflow: 'hidden', border: `1px solid ${border}` }}
            >
              <img src={productImage(mainProduct)} alt="" style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover' }} />
            </div>
          </div>

          {/* Right: Checkout */}
          <div style={{ position: isMobile ? 'relative' : 'sticky', top: 90 }}>
            {/* Guarantee header */}
            <div style={{ 
              background: `linear-gradient(135deg, ${accent}, #10b981)`, 
              color: '#fff', 
              padding: '16px 20px', 
              borderRadius: `${cardRadius}px ${cardRadius}px 0 0`, 
              textAlign: 'center' 
            }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>🛡️</div>
              <div style={{ fontWeight: 800, fontSize: 14 }}>30-Day Money-Back Guarantee</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>100% Risk-Free Purchase</div>
            </div>
            
            <EmbeddedCheckout
              storeSlug={storeSlug}
              product={mainProduct as any}
              formatPrice={formatPrice}
              theme={checkoutTheme}
              disabled={canManage}
              heading={ctaText}
              subheading={canManage ? 'Disabled in editor' : 'Try it risk-free today'}
            />

            {/* Trust reassurance */}
            <div style={{ background: '#f0fdf4', border: `1px solid ${accent}33`, borderRadius: 12, padding: 16, marginTop: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: accent, marginBottom: 6 }}>
                🔒 Your Purchase is Protected
              </div>
              <div style={{ fontSize: 12, color: muted }}>
                Not happy? Get a full refund. No questions asked.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, background: '#f8fafc' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 20, textAlign: 'center' }}>
            {[
              { value: '50,000+', label: 'Happy Customers' },
              { value: '99.7%', label: 'Satisfaction Rate' },
              { value: '<1%', label: 'Return Rate' },
              { value: '4.9★', label: 'Average Rating' },
            ].map((stat) => (
              <div key={stat.label} style={{ background: cardBg, padding: 24, borderRadius: cardRadius, border: `1px solid ${border}` }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: accent }}>{stat.value}</div>
                <div style={{ fontSize: 13, color: muted, marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        data-edit-path="layout.featured"
        onClick={(e) => { stopIfManage(e); onSelect('layout.featured'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2
            data-edit-path="layout.featured.title"
            onClick={(e) => { stopIfManage(e); onSelect('layout.featured.title'); }}
            style={{ fontSize: 28, fontWeight: 900, textAlign: 'center', marginBottom: 40 }}
          >
            How Our Guarantee Works
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { step: '1', title: 'Try It', desc: 'Use the product for up to 30 days. Test it fully.' },
              { step: '2', title: 'Decide', desc: 'Not 100% satisfied? No problem at all.' },
              { step: '3', title: 'Get Refund', desc: 'Contact us and get your money back instantly.' },
            ].map((item) => (
              <div key={item.step} style={{ textAlign: 'center', padding: 24 }}>
                <div style={{ 
                  width: 50, 
                  height: 50, 
                  borderRadius: '50%', 
                  background: accent, 
                  color: '#fff', 
                  display: 'grid', 
                  placeItems: 'center', 
                  fontSize: 22, 
                  fontWeight: 900,
                  margin: '0 auto 16px',
                }}>
                  {item.step}
                </div>
                <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>{item.title}</div>
                <div style={{ fontSize: 14, color: muted, lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, background: '#f8fafc' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, textAlign: 'center', marginBottom: 32 }}>
            Frequently Asked Questions
          </h2>

          {[
            { q: 'What if I don\'t like the product?', a: 'Simply contact us within 30 days for a full refund. We\'ll process it within 48 hours.' },
            { q: 'Do I need to provide a reason?', a: 'No! We believe in our product, but understand it might not be for everyone. No questions asked.' },
            { q: 'Who pays for return shipping?', a: 'We do! Just send it back and we\'ll refund everything, including original shipping costs.' },
          ].map((faq, i) => (
            <div key={i} style={{ background: cardBg, borderRadius: 12, padding: 20, marginBottom: 12, border: `1px solid ${border}` }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>{faq.q}</div>
              <div style={{ fontSize: 14, color: muted, lineHeight: 1.6 }}>{faq.a}</div>
            </div>
          ))}
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
