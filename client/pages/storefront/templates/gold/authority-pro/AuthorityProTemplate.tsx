import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * AUTHORITY PRO - Professional landing page with press logos, certifications, and expert endorsements.
 * Design: Clean, corporate feel with credibility signals, awards, and professional testimonials.
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

export default function AuthorityProTemplate(props: TemplateProps) {
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

  // Theme - Professional navy & gold
  const bg = asString(settings.template_bg_color) || '#ffffff';
  const text = asString(settings.template_text_color) || '#0f172a';
  const muted = asString(settings.template_muted_color) || '#64748b';
  const accent = asString(settings.template_accent_color) || '#1e40af';
  const cardBg = asString((settings as any).template_card_bg) || '#ffffff';
  const border = 'rgba(0,0,0,0.08)';
  const gold = '#d4af37';

  // Content
  const storeName = asString(settings.store_name) || 'Authority Pro';
  const heroTitle = asString(settings.template_hero_heading) || 'Award-Winning Quality Trusted by Experts';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Endorsed by industry leaders and featured in major publications. Experience the difference that professionals recommend.';
  const ctaText = asString(settings.template_button_text) || 'Order Now';

  // Spacing
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 56, 24, 96);
  const cardRadius = resolveInt(settings.template_card_border_radius, 12, 0, 32);

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

  // Press/Media logos (simulated with text)
  const pressLogos = ['Forbes', 'TechCrunch', 'Bloomberg', 'Reuters', 'The Economist'];
  
  // Awards/Certifications
  const awards = [
    { icon: '🏆', title: 'Best Product 2025', org: 'Industry Awards' },
    { icon: '✓', title: 'Quality Certified', org: 'ISO 9001' },
    { icon: '🌟', title: 'Top Rated', org: 'Consumer Reports' },
    { icon: '🛡️', title: 'Safety Approved', org: 'International Standards' },
  ];

  // Expert testimonials
  const experts = [
    { name: 'Dr. Ahmed Benali', title: 'Industry Expert', quote: 'This product represents a significant advancement in quality and reliability.', avatar: '👨‍⚕️' },
    { name: 'Prof. Samira Hadj', title: 'Research Director', quote: 'I recommend this to all my colleagues. The results speak for themselves.', avatar: '👩‍🔬' },
  ];

  return (
    <div
      data-edit-path="__root"
      onClick={() => canManage && onSelect('__root')}
      className="ecopro-storefront"
      style={{ minHeight: '100vh', background: bg, color: text, fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      {/* Press Bar */}
      <div
        data-edit-path="layout.hero.badge"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero.badge'); }}
        style={{
          background: '#f8fafc',
          borderBottom: `1px solid ${border}`,
          padding: '12px 20px',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobile ? 20 : 40, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>As featured in:</span>
          {pressLogos.map((logo) => (
            <span key={logo} style={{ fontSize: 14, fontWeight: 700, color: muted, opacity: 0.7 }}>{logo}</span>
          ))}
        </div>
      </div>

      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={(e) => { stopIfManage(e); onSelect('layout.header'); }}
        style={{ position: 'sticky', top: 0, zIndex: 30, background: bg, borderBottom: `1px solid ${border}`, padding: '14px 20px' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt={storeName} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 40, height: 40, borderRadius: 8, background: accent, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 18 }}>
                {storeName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{storeName}</div>
              <div style={{ fontSize: 11, color: gold, fontWeight: 600 }}>★ Premium Quality</div>
            </div>
          </div>
          <button
            data-edit-path="layout.hero.cta"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.cta'); }}
            style={{ background: accent, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
          >
            {ctaText}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section
        data-edit-path="layout.hero"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 420px', gap: 40, alignItems: 'start' }}>
          
          {/* Left Content */}
          <div>
            {/* Awards row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
              {awards.slice(0, 3).map((award) => (
                <div key={award.title} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', padding: '8px 14px', borderRadius: 8, border: `1px solid ${border}` }}>
                  <span style={{ fontSize: 18 }}>{award.icon}</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700 }}>{award.title}</div>
                    <div style={{ fontSize: 10, color: muted }}>{award.org}</div>
                  </div>
                </div>
              ))}
            </div>

            <h1
              data-edit-path="layout.hero.title"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.title'); }}
              style={{ fontSize: isMobile ? 30 : 44, fontWeight: 900, lineHeight: 1.15, marginBottom: 16 }}
            >
              {heroTitle}
            </h1>

            <p
              data-edit-path="layout.hero.subtitle"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.subtitle'); }}
              style={{ fontSize: 17, color: muted, lineHeight: 1.7, marginBottom: 28 }}
            >
              {heroSubtitle}
            </p>

            {/* Key Features */}
            <div style={{ display: 'grid', gap: 12, marginBottom: 28 }}>
              {[
                'Certified quality by international standards',
                'Trusted by over 100,000 professionals',
                'Award-winning customer service',
                '30-day money-back guarantee',
              ].map((feature) => (
                <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: accent, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 11 }}>✓</span>
                  <span style={{ fontSize: 14 }}>{feature}</span>
                </div>
              ))}
            </div>

            {/* Product Image */}
            <div
              data-edit-path="layout.hero.image"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
              style={{ borderRadius: cardRadius, overflow: 'hidden', border: `1px solid ${border}`, position: 'relative' }}
            >
              <img src={productImage(mainProduct)} alt="" style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover' }} />
              {/* Quality badge overlay */}
              <div style={{ position: 'absolute', top: 16, right: 16, background: gold, color: '#000', padding: '8px 14px', borderRadius: 6, fontWeight: 800, fontSize: 11 }}>
                PREMIUM QUALITY
              </div>
            </div>
          </div>

          {/* Right: Checkout */}
          <div style={{ position: isMobile ? 'relative' : 'sticky', top: 90 }}>
            {/* Trust header */}
            <div style={{ background: accent, color: '#fff', padding: '14px 20px', borderRadius: `${cardRadius}px ${cardRadius}px 0 0`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <span style={{ fontSize: 16 }}>🛡️</span>
              <span style={{ fontWeight: 700, fontSize: 13 }}>Secure & Certified Purchase</span>
            </div>
            
            <EmbeddedCheckout
              storeSlug={storeSlug}
              product={mainProduct as any}
              formatPrice={formatPrice}
              theme={checkoutTheme}
              disabled={canManage}
              heading={ctaText}
              subheading={canManage ? 'Disabled in editor' : '✓ Official Warranty • ✓ Express Delivery'}
            />

            {/* Trust seals */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 12 }}>
              {[
                { icon: '🔒', text: 'Secure Payment' },
                { icon: '📦', text: 'Tracked Shipping' },
                { icon: '✓', text: 'Quality Verified' },
                { icon: '↩️', text: 'Easy Returns' },
              ].map((seal) => (
                <div key={seal.text} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: muted, background: '#f8fafc', padding: '8px 10px', borderRadius: 6 }}>
                  <span>{seal.icon}</span>
                  <span>{seal.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Expert Endorsements */}
      <section
        data-edit-path="layout.featured"
        onClick={(e) => { stopIfManage(e); onSelect('layout.featured'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, background: '#f8fafc' }}
      >
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2
            data-edit-path="layout.featured.title"
            onClick={(e) => { stopIfManage(e); onSelect('layout.featured.title'); }}
            style={{ fontSize: 28, fontWeight: 900, textAlign: 'center', marginBottom: 12 }}
          >
            Endorsed by Industry Experts
          </h2>
          <p
            data-edit-path="layout.featured.subtitle"
            onClick={(e) => { stopIfManage(e); onSelect('layout.featured.subtitle'); }}
            style={{ textAlign: 'center', color: muted, marginBottom: 40 }}
          >
            Professionals trust our products for their quality and reliability
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 24 }}>
            {experts.map((expert) => (
              <div key={expert.name} style={{ background: cardBg, borderRadius: cardRadius, padding: 24, border: `1px solid ${border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${accent}22, ${accent}44)`, display: 'grid', placeItems: 'center', fontSize: 28 }}>
                    {expert.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{expert.name}</div>
                    <div style={{ fontSize: 13, color: accent }}>{expert.title}</div>
                  </div>
                </div>
                <p style={{ fontSize: 15, fontStyle: 'italic', lineHeight: 1.6, color: text }}>
                  "{expert.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 20, textAlign: 'center' }}>
            {awards.map((award) => (
              <div key={award.title} style={{ padding: 20 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{award.icon}</div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{award.title}</div>
                <div style={{ fontSize: 12, color: muted }}>{award.org}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={(e) => { stopIfManage(e); onSelect('layout.footer'); }}
        style={{ borderTop: `1px solid ${border}`, padding: `${baseSpacing * 1.5}px ${baseSpacing}px`, background: '#f8fafc' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <p
            data-edit-path="layout.footer.copyright"
            onClick={(e) => { stopIfManage(e); onSelect('layout.footer.copyright'); }}
            style={{ fontSize: 13, color: muted }}
          >
            {asString((settings as any).template_copyright) || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`}
          </p>
        </div>
      </footer>
    </div>
  );
}
