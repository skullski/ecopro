import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * GUARANTEE FOCUS - Landing page centered around money-back guarantee and risk-free messaging.
 * Design: Large guarantee badge, risk-free benefits, trust stats, confidence-building layout.
 * ALL TEXT IS EDITABLE via settings keys.
 */

function asString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function resolveInt(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = typeof value === 'number' ? value : parseInt(String(value || ''), 10);
  const safe = Number.isFinite(parsed) ? parsed : fallback;
  return Math.max(min, Math.min(max, safe));
}

function productImages(p: StoreProduct | undefined): string[] {
  if (!p) return ['/placeholder.png'];
  const imgs = Array.isArray((p as any).images) ? (p as any).images.filter((v: any) => typeof v === 'string' && v.trim()) : [];
  return imgs.length ? imgs : ['/placeholder.png'];
}

function safePrice(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(String(value ?? '').trim());
  return Number.isFinite(n) ? n : 0;
}

export default function GuaranteeFocusTemplate(props: TemplateProps) {
  const { settings, formatPrice } = props;
  const s = settings as any;
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

  // Theme colors - Green/Trust colors
  const bg = asString(s.template_bg_color) || '#ffffff';
  const text = asString(s.template_text_color) || '#1e293b';
  const muted = asString(s.template_muted_color) || '#64748b';
  const accent = asString(s.template_accent_color) || '#059669';
  const cardBg = asString(s.template_card_bg) || '#ffffff';
  const border = 'rgba(0,0,0,0.06)';

  // EDITABLE Content from settings
  const storeName = asString(s.store_name) || 'Guarantee Focus';
  const heroTitle = asString(s.template_hero_heading) || '100% Risk-Free Purchase';
  const heroSubtitle = asString(s.template_hero_subtitle) || 'Try it for 30 days. If you\'re not completely satisfied, we\'ll refund every penny. No questions asked.';
  const ctaText = asString(s.template_button_text) || 'Try Risk-Free';
  const badgeTitle = asString(s.template_hero_badge_title) || '30-DAY';
  const badgeSubtitle = asString(s.template_hero_badge_subtitle) || 'MONEY-BACK GUARANTEE';

  // Risk-free benefits (editable)
  const benefit1Title = asString(s.template_feature1_title) || 'No Risk';
  const benefit1Desc = asString(s.template_feature1_desc) || 'Full refund if not satisfied';
  const benefit2Title = asString(s.template_feature2_title) || 'Free Returns';
  const benefit2Desc = asString(s.template_feature2_desc) || 'We cover return shipping';
  const benefit3Title = asString(s.template_feature3_title) || 'No Questions';
  const benefit3Desc = asString(s.template_feature3_desc) || 'Easy, hassle-free process';
  const benefit4Title = asString(s.template_feature4_title) || 'Instant Refund';
  const benefit4Desc = asString(s.template_feature4_desc) || 'Money back within 48 hours';

  // Stats (editable)
  const stat1Value = asString(s.template_stat1_value) || '50,000+';
  const stat1Label = asString(s.template_stat1_label) || 'Happy Customers';
  const stat2Value = asString(s.template_stat2_value) || '99.7%';
  const stat2Label = asString(s.template_stat2_label) || 'Satisfaction Rate';
  const stat3Value = asString(s.template_stat3_value) || '<1%';
  const stat3Label = asString(s.template_stat3_label) || 'Return Rate';
  const stat4Value = asString(s.template_stat4_value) || '4.9★';
  const stat4Label = asString(s.template_stat4_label) || 'Average Rating';

  // Section titles (editable)
  const howItWorksTitle = asString(s.template_section_title) || 'How Our Guarantee Works';

  // Steps (editable)
  const step1Title = asString(s.template_step1_title) || 'Try It';
  const step1Desc = asString(s.template_step1_desc) || 'Use the product for up to 30 days. Test it fully.';
  const step2Title = asString(s.template_step2_title) || 'Decide';
  const step2Desc = asString(s.template_step2_desc) || 'Not 100% satisfied? No problem at all.';
  const step3Title = asString(s.template_step3_title) || 'Get Refund';
  const step3Desc = asString(s.template_step3_desc) || 'Contact us and get your money back instantly.';

  // Spacing
  const baseSpacing = resolveInt(s.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(s.template_section_spacing, 56, 24, 96);
  const cardRadius = resolveInt(s.template_card_border_radius, 16, 0, 32);
  const buttonRadius = resolveInt(s.template_button_border_radius, 12, 0, 50);

  // Products
  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];
  const mainProduct = products[0];
  const images = productImages(mainProduct);
  const [activeImage, setActiveImage] = React.useState(0);

  const storeSlug = asString(s.store_slug);
  const priceValue = mainProduct ? safePrice((mainProduct as any).price) : 0;

  const checkoutTheme = { bg, text, muted, accent, cardBg, border };

  const stopIfManage = (e: React.MouseEvent) => {
    if (!canManage) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const benefits = [
    { icon: '✓', title: benefit1Title, desc: benefit1Desc },
    { icon: '✓', title: benefit2Title, desc: benefit2Desc },
    { icon: '✓', title: benefit3Title, desc: benefit3Desc },
    { icon: '✓', title: benefit4Title, desc: benefit4Desc },
  ];

  const stats = [
    { value: stat1Value, label: stat1Label },
    { value: stat2Value, label: stat2Label },
    { value: stat3Value, label: stat3Label },
    { value: stat4Value, label: stat4Label },
  ];

  const steps = [
    { step: '1', title: step1Title, desc: step1Desc },
    { step: '2', title: step2Title, desc: step2Desc },
    { step: '3', title: step3Title, desc: step3Desc },
  ];

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
          padding: isMobile ? '8px 12px' : '10px 20px',
          textAlign: 'center',
          fontSize: isMobile ? 11 : 13,
          fontWeight: 700,
        }}
      >
        🛡️ {badgeSubtitle} • {asString(s.template_strip_text) || 'Shop with Confidence'}
      </div>

      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={(e) => { stopIfManage(e); onSelect('layout.header'); }}
        style={{ position: 'sticky', top: 0, zIndex: 30, background: bg, borderBottom: `1px solid ${border}`, padding: isMobile ? '10px 12px' : '14px 20px' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {asString(s.store_logo) ? (
              <img src={asString(s.store_logo)} alt={storeName} style={{ width: isMobile ? 32 : 38, height: isMobile ? 32 : 38, borderRadius: 10, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: isMobile ? 32 : 38, height: isMobile ? 32 : 38, borderRadius: 10, background: accent, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: isMobile ? 14 : 16 }}>
                {storeName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <span style={{ fontWeight: 800, fontSize: isMobile ? 13 : 15 }}>{storeName}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: isMobile ? 10 : 12, color: accent, fontWeight: 700 }}>🛡️ {asString(s.template_header_badge) || 'Risk-Free Shopping'}</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        data-edit-path="layout.hero"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero'); }}
        style={{ padding: isMobile ? `${sectionSpacing * 0.6}px ${baseSpacing}px` : `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 400px', gap: isMobile ? 24 : 40, alignItems: 'start' }}>
          
          {/* Left Content */}
          <div>
            {/* Large Guarantee Badge */}
            <div
              data-edit-path="layout.hero.kicker"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.kicker'); }}
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: isMobile ? 12 : 16, 
                background: `linear-gradient(135deg, ${accent}15, ${accent}05)`,
                border: `2px solid ${accent}`,
                borderRadius: cardRadius,
                padding: isMobile ? '14px 18px' : '20px 28px',
                marginBottom: isMobile ? 20 : 28,
              }}
            >
              <div style={{ 
                width: isMobile ? 56 : 70, 
                height: isMobile ? 56 : 70, 
                borderRadius: '50%', 
                background: accent, 
                color: '#fff', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: 900,
              }}>
                <span style={{ fontSize: isMobile ? 18 : 22, lineHeight: 1 }}>{badgeTitle}</span>
                <span style={{ fontSize: isMobile ? 6 : 8, letterSpacing: 0.5 }}>DAYS</span>
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: isMobile ? 14 : 18, color: accent }}>MONEY-BACK</div>
                <div style={{ fontWeight: 800, fontSize: isMobile ? 12 : 14, color: text }}>GUARANTEE</div>
              </div>
            </div>

            <h1
              data-edit-path="layout.hero.title"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.title'); }}
              style={{ fontSize: isMobile ? 26 : 46, fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}
            >
              {heroTitle}
            </h1>

            <p
              data-edit-path="layout.hero.subtitle"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.subtitle'); }}
              style={{ fontSize: isMobile ? 14 : 18, color: muted, lineHeight: 1.7, marginBottom: 28 }}
            >
              {heroSubtitle}
            </p>

            {/* Risk-Free Benefits - Editable */}
            <div
              data-edit-path="layout.categories"
              onClick={(e) => { stopIfManage(e); onSelect('layout.categories'); }}
              style={{ display: 'grid', gap: isMobile ? 10 : 14, marginBottom: isMobile ? 24 : 32 }}
            >
              {benefits.map((benefit) => (
                <div key={benefit.title} style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 14, background: '#f8fafc', padding: isMobile ? '10px 14px' : '14px 18px', borderRadius: 12 }}>
                  <span style={{ width: isMobile ? 24 : 28, height: isMobile ? 24 : 28, borderRadius: '50%', background: accent, color: '#fff', display: 'grid', placeItems: 'center', fontSize: isMobile ? 12 : 14, fontWeight: 700 }}>
                    {benefit.icon}
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: isMobile ? 12 : 14 }}>{benefit.title}</div>
                    <div style={{ fontSize: isMobile ? 10 : 12, color: muted }}>{benefit.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Product Image Gallery - Multiple Images Support */}
            <div
              data-edit-path="layout.hero.image"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
              style={{ borderRadius: cardRadius, overflow: 'hidden', border: `1px solid ${border}` }}
            >
              <img src={images[activeImage] || images[0]} alt="" style={{ width: '100%', aspectRatio: isMobile ? '4/3' : '16/10', objectFit: 'cover' }} />
              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div style={{ padding: 10, display: 'flex', gap: 8, overflowX: 'auto', background: 'rgba(0,0,0,0.02)' }}>
                  {images.slice(0, 10).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { stopIfManage(e); setActiveImage(idx); }}
                      style={{
                        flex: '0 0 auto',
                        width: isMobile ? 48 : 60,
                        height: isMobile ? 48 : 60,
                        borderRadius: 8,
                        border: idx === activeImage ? `2px solid ${accent}` : `1px solid ${border}`,
                        padding: 0,
                        background: 'transparent',
                        cursor: 'pointer',
                        overflow: 'hidden',
                      }}
                    >
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Checkout */}
          <div style={{ position: isMobile ? 'relative' : 'sticky', top: isMobile ? 0 : 90 }}>
            {/* Guarantee header */}
            <div style={{ 
              background: `linear-gradient(135deg, ${accent}, #10b981)`, 
              color: '#fff', 
              padding: isMobile ? '12px 16px' : '16px 20px', 
              borderRadius: `${cardRadius}px ${cardRadius}px 0 0`, 
              textAlign: 'center' 
            }}>
              <div style={{ fontSize: isMobile ? 20 : 24, marginBottom: 4 }}>🛡️</div>
              <div style={{ fontWeight: 800, fontSize: isMobile ? 12 : 14 }}>{badgeTitle} {asString(s.template_guarantee_text) || 'Money-Back Guarantee'}</div>
              <div style={{ fontSize: isMobile ? 10 : 12, opacity: 0.9 }}>{asString(s.template_risk_free_text) || '100% Risk-Free Purchase'}</div>
            </div>
            
            <EmbeddedCheckout
              storeSlug={storeSlug}
              product={mainProduct as any}
              formatPrice={formatPrice}
              theme={checkoutTheme}
              disabled={canManage}
              heading={ctaText}
              subheading={canManage ? 'Disabled in editor' : (asString(s.template_checkout_subheading) || 'Try it risk-free today')}
            />

            {/* Trust reassurance */}
            <div style={{ background: '#f0fdf4', border: `1px solid ${accent}33`, borderRadius: 12, padding: isMobile ? 12 : 16, marginTop: 12, textAlign: 'center' }}>
              <div style={{ fontSize: isMobile ? 11 : 13, fontWeight: 700, color: accent, marginBottom: 6 }}>
                🔒 {asString(s.template_protected_text) || 'Your Purchase is Protected'}
              </div>
              <div style={{ fontSize: isMobile ? 10 : 12, color: muted }}>
                {asString(s.template_refund_text) || 'Not happy? Get a full refund. No questions asked.'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section
        data-edit-path="layout.grid"
        onClick={(e) => { stopIfManage(e); onSelect('layout.grid'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, background: '#f8fafc' }}
      >
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? 12 : 20, textAlign: 'center' }}>
            {stats.map((stat) => (
              <div key={stat.label} style={{ background: cardBg, padding: isMobile ? 16 : 24, borderRadius: cardRadius, border: `1px solid ${border}` }}>
                <div style={{ fontSize: isMobile ? 22 : 28, fontWeight: 900, color: accent }}>{stat.value}</div>
                <div style={{ fontSize: isMobile ? 11 : 13, color: muted, marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Editable */}
      <section
        data-edit-path="layout.featured"
        onClick={(e) => { stopIfManage(e); onSelect('layout.featured'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2
            data-edit-path="layout.featured.title"
            onClick={(e) => { stopIfManage(e); onSelect('layout.featured.title'); }}
            style={{ fontSize: isMobile ? 20 : 28, fontWeight: 900, textAlign: 'center', marginBottom: isMobile ? 28 : 40 }}
          >
            {howItWorksTitle}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 20 : 24 }}>
            {steps.map((item) => (
              <div key={item.step} style={{ textAlign: 'center', padding: isMobile ? 16 : 24 }}>
                <div style={{ 
                  width: isMobile ? 44 : 50, 
                  height: isMobile ? 44 : 50, 
                  borderRadius: '50%', 
                  background: accent, 
                  color: '#fff', 
                  display: 'grid', 
                  placeItems: 'center', 
                  fontSize: isMobile ? 18 : 22, 
                  fontWeight: 900,
                  margin: '0 auto 16px',
                }}>
                  {item.step}
                </div>
                <div style={{ fontWeight: 800, fontSize: isMobile ? 16 : 18, marginBottom: 8 }}>{item.title}</div>
                <div style={{ fontSize: isMobile ? 12 : 14, color: muted, lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>
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
          style={{ fontSize: isMobile ? 11 : 13, color: muted }}
        >
          {asString(s.template_copyright) || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`}
        </p>
      </footer>
    </div>
  );
}
