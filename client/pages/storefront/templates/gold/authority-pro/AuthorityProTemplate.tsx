import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * AUTHORITY PRO - Professional landing page with press logos, certifications, and expert endorsements.
 * Design: Clean, corporate feel with credibility signals, awards, and professional testimonials.
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

function parseJsonArray(value: unknown): any[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim().startsWith('[')) {
    try { return JSON.parse(value); } catch { return []; }
  }
  return [];
}

export default function AuthorityProTemplate(props: TemplateProps) {
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

  // Theme colors - Professional navy & gold
  const bg = asString(s.template_bg_color) || '#ffffff';
  const text = asString(s.template_text_color) || '#0f172a';
  const muted = asString(s.template_muted_color) || '#64748b';
  const accent = asString(s.template_accent_color) || '#1e40af';
  const cardBg = asString(s.template_card_bg) || '#ffffff';
  const border = 'rgba(0,0,0,0.08)';
  const gold = '#d4af37';

  // EDITABLE Content from settings
  const storeName = asString(s.store_name) || 'Authority Pro';
  const heroTitle = asString(s.template_hero_heading) || 'Award-Winning Quality Trusted by Experts';
  const heroSubtitle = asString(s.template_hero_subtitle) || 'Endorsed by industry leaders and featured in major publications. Experience the difference that professionals recommend.';
  const ctaText = asString(s.template_button_text) || 'Order Now';

  // Press bar (editable)
  const pressBadgeText = asString(s.template_press_badge_text) || 'As featured in:';
  const pressLogos = asString(s.template_press_logos) || 'Forbes, TechCrunch, Bloomberg, Reuters, The Economist';
  const pressLogoList = pressLogos.split(',').map(l => l.trim()).filter(Boolean);

  // Features (editable)
  const feature1 = asString(s.template_feature1_title) || 'Certified quality by international standards';
  const feature2 = asString(s.template_feature2_title) || 'Trusted by over 100,000 professionals';
  const feature3 = asString(s.template_feature3_title) || 'Award-winning customer service';
  const feature4 = asString(s.template_feature4_title) || '30-day money-back guarantee';

  // Awards (editable)
  const award1Icon = asString(s.template_award1_icon) || '🏆';
  const award1Title = asString(s.template_award1_title) || 'Best Product 2025';
  const award1Org = asString(s.template_award1_org) || 'Industry Awards';
  const award2Icon = asString(s.template_award2_icon) || '✓';
  const award2Title = asString(s.template_award2_title) || 'Quality Certified';
  const award2Org = asString(s.template_award2_org) || 'ISO 9001';
  const award3Icon = asString(s.template_award3_icon) || '🌟';
  const award3Title = asString(s.template_award3_title) || 'Top Rated';
  const award3Org = asString(s.template_award3_org) || 'Consumer Reports';
  const award4Icon = asString(s.template_award4_icon) || '🛡️';
  const award4Title = asString(s.template_award4_title) || 'Safety Approved';
  const award4Org = asString(s.template_award4_org) || 'International Standards';

  // Section titles (editable)
  const expertTitle = asString(s.template_testimonial_title) || 'Endorsed by Industry Experts';
  const expertSubtitle = asString(s.template_section_subtitle) || 'Professionals trust our products for their quality and reliability';

  // Expert testimonials (editable)
  const defaultExperts = [
    { name: 'Dr. Ahmed Benali', title: 'Industry Expert', quote: 'This product represents a significant advancement in quality and reliability.', avatar: '👨‍⚕️' },
    { name: 'Prof. Samira Hadj', title: 'Research Director', quote: 'I recommend this to all my colleagues. The results speak for themselves.', avatar: '👩‍🔬' },
  ];
  const experts = parseJsonArray(s.template_experts).length > 0 
    ? parseJsonArray(s.template_experts) 
    : defaultExperts;

  // Spacing
  const baseSpacing = resolveInt(s.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(s.template_section_spacing, 56, 24, 96);
  const cardRadius = resolveInt(s.template_card_border_radius, 12, 0, 32);
  const buttonRadius = resolveInt(s.template_button_border_radius, 8, 0, 50);

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

  const awards = [
    { icon: award1Icon, title: award1Title, org: award1Org },
    { icon: award2Icon, title: award2Title, org: award2Org },
    { icon: award3Icon, title: award3Title, org: award3Org },
    { icon: award4Icon, title: award4Title, org: award4Org },
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
          padding: isMobile ? '10px 12px' : '12px 20px',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobile ? 16 : 40, flexWrap: 'wrap' }}>
          <span style={{ fontSize: isMobile ? 10 : 11, color: muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{pressBadgeText}</span>
          {pressLogoList.map((logo) => (
            <span key={logo} style={{ fontSize: isMobile ? 12 : 14, fontWeight: 700, color: muted, opacity: 0.7 }}>{logo}</span>
          ))}
        </div>
      </div>

      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={(e) => { stopIfManage(e); onSelect('layout.header'); }}
        style={{ position: 'sticky', top: 0, zIndex: 30, background: bg, borderBottom: `1px solid ${border}`, padding: isMobile ? '10px 12px' : '14px 20px' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12 }}>
            {asString(s.store_logo) ? (
              <img src={asString(s.store_logo)} alt={storeName} style={{ width: isMobile ? 32 : 40, height: isMobile ? 32 : 40, borderRadius: 8, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: isMobile ? 32 : 40, height: isMobile ? 32 : 40, borderRadius: 8, background: accent, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: isMobile ? 14 : 18 }}>
                {storeName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontWeight: 800, fontSize: isMobile ? 13 : 15 }}>{storeName}</div>
              <div style={{ fontSize: isMobile ? 9 : 11, color: gold, fontWeight: 600 }}>★ Premium Quality</div>
            </div>
          </div>
          <button
            data-edit-path="layout.hero.cta"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.cta'); }}
            style={{ background: accent, color: '#fff', border: 'none', borderRadius: buttonRadius, padding: isMobile ? '8px 16px' : '10px 20px', fontWeight: 700, cursor: 'pointer', fontSize: isMobile ? 11 : 13 }}
          >
            {ctaText}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section
        data-edit-path="layout.hero"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero'); }}
        style={{ padding: isMobile ? `${sectionSpacing * 0.6}px ${baseSpacing}px` : `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 420px', gap: isMobile ? 24 : 40, alignItems: 'start' }}>
          
          {/* Left Content */}
          <div>
            {/* Awards row */}
            <div
              data-edit-path="layout.hero.kicker"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.kicker'); }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? 8 : 12, marginBottom: 24 }}
            >
              {awards.slice(0, 3).map((award) => (
                <div key={award.title} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', padding: isMobile ? '6px 10px' : '8px 14px', borderRadius: 8, border: `1px solid ${border}` }}>
                  <span style={{ fontSize: isMobile ? 14 : 18 }}>{award.icon}</span>
                  <div>
                    <div style={{ fontSize: isMobile ? 9 : 11, fontWeight: 700 }}>{award.title}</div>
                    <div style={{ fontSize: isMobile ? 8 : 10, color: muted }}>{award.org}</div>
                  </div>
                </div>
              ))}
            </div>

            <h1
              data-edit-path="layout.hero.title"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.title'); }}
              style={{ fontSize: isMobile ? 26 : 44, fontWeight: 900, lineHeight: 1.15, marginBottom: 16 }}
            >
              {heroTitle}
            </h1>

            <p
              data-edit-path="layout.hero.subtitle"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.subtitle'); }}
              style={{ fontSize: isMobile ? 14 : 17, color: muted, lineHeight: 1.7, marginBottom: 28 }}
            >
              {heroSubtitle}
            </p>

            {/* Key Features - Editable */}
            <div
              data-edit-path="layout.categories"
              onClick={(e) => { stopIfManage(e); onSelect('layout.categories'); }}
              style={{ display: 'grid', gap: isMobile ? 10 : 12, marginBottom: 28 }}
            >
              {[feature1, feature2, feature3, feature4].filter(Boolean).map((feature) => (
                <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: isMobile ? 18 : 20, height: isMobile ? 18 : 20, borderRadius: '50%', background: accent, color: '#fff', display: 'grid', placeItems: 'center', fontSize: isMobile ? 9 : 11 }}>✓</span>
                  <span style={{ fontSize: isMobile ? 12 : 14 }}>{feature}</span>
                </div>
              ))}
            </div>

            {/* Product Image Gallery - Multiple Images Support */}
            <div
              data-edit-path="layout.hero.image"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
              style={{ borderRadius: cardRadius, overflow: 'hidden', border: `1px solid ${border}`, position: 'relative' }}
            >
              <img src={images[activeImage] || images[0]} alt="" style={{ width: '100%', aspectRatio: isMobile ? '4/3' : '16/10', objectFit: 'cover' }} />
              {/* Quality badge overlay */}
              <div style={{ position: 'absolute', top: 16, right: 16, background: gold, color: '#000', padding: isMobile ? '6px 10px' : '8px 14px', borderRadius: 6, fontWeight: 800, fontSize: isMobile ? 9 : 11 }}>
                PREMIUM QUALITY
              </div>
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
            {/* Trust header */}
            <div style={{ background: accent, color: '#fff', padding: isMobile ? '12px 16px' : '14px 20px', borderRadius: `${cardRadius}px ${cardRadius}px 0 0`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <span style={{ fontSize: isMobile ? 14 : 16 }}>🛡️</span>
              <span style={{ fontWeight: 700, fontSize: isMobile ? 11 : 13 }}>{asString(s.template_trust_header) || 'Secure & Certified Purchase'}</span>
            </div>
            
            <EmbeddedCheckout
              storeSlug={storeSlug}
              product={mainProduct as any}
              formatPrice={formatPrice}
              theme={checkoutTheme}
              disabled={canManage}
              heading={ctaText}
              subheading={canManage ? 'Disabled in editor' : (asString(s.template_checkout_subheading) || '✓ Official Warranty • ✓ Express Delivery')}
            />

            {/* Trust seals */}
            <div
              data-edit-path="layout.grid"
              onClick={(e) => { stopIfManage(e); onSelect('layout.grid'); }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 12 }}
            >
              {[
                { icon: '🔒', text: asString(s.template_seal1_text) || 'Secure Payment' },
                { icon: '📦', text: asString(s.template_seal2_text) || 'Tracked Shipping' },
                { icon: '✓', text: asString(s.template_seal3_text) || 'Quality Verified' },
                { icon: '↩️', text: asString(s.template_seal4_text) || 'Easy Returns' },
              ].map((seal) => (
                <div key={seal.text} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: isMobile ? 10 : 11, color: muted, background: '#f8fafc', padding: isMobile ? '6px 8px' : '8px 10px', borderRadius: 6 }}>
                  <span>{seal.icon}</span>
                  <span>{seal.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Expert Endorsements - Editable */}
      <section
        data-edit-path="layout.featured"
        onClick={(e) => { stopIfManage(e); onSelect('layout.featured'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, background: '#f8fafc' }}
      >
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2
            data-edit-path="layout.featured.title"
            onClick={(e) => { stopIfManage(e); onSelect('layout.featured.title'); }}
            style={{ fontSize: isMobile ? 20 : 28, fontWeight: 900, textAlign: 'center', marginBottom: 12 }}
          >
            {expertTitle}
          </h2>
          <p style={{ textAlign: 'center', color: muted, marginBottom: isMobile ? 28 : 40, fontSize: isMobile ? 13 : 15 }}>
            {expertSubtitle}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: isMobile ? 16 : 24 }}>
            {experts.map((expert: any) => (
              <div key={expert.name} style={{ background: cardBg, borderRadius: cardRadius, padding: isMobile ? 16 : 24, border: `1px solid ${border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: isMobile ? 44 : 56, height: isMobile ? 44 : 56, borderRadius: '50%', background: `linear-gradient(135deg, ${accent}22, ${accent}44)`, display: 'grid', placeItems: 'center', fontSize: isMobile ? 22 : 28 }}>
                    {expert.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: isMobile ? 13 : 15 }}>{expert.name}</div>
                    <div style={{ fontSize: isMobile ? 11 : 13, color: accent }}>{expert.title}</div>
                  </div>
                </div>
                <p style={{ fontSize: isMobile ? 13 : 15, fontStyle: 'italic', lineHeight: 1.6, color: text }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? 16 : 20, textAlign: 'center' }}>
            {awards.map((award) => (
              <div key={award.title} style={{ padding: isMobile ? 16 : 20 }}>
                <div style={{ fontSize: isMobile ? 32 : 40, marginBottom: 12 }}>{award.icon}</div>
                <div style={{ fontWeight: 700, marginBottom: 4, fontSize: isMobile ? 12 : 14 }}>{award.title}</div>
                <div style={{ fontSize: isMobile ? 10 : 12, color: muted }}>{award.org}</div>
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
            style={{ fontSize: isMobile ? 11 : 13, color: muted }}
          >
            {asString(s.template_copyright) || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`}
          </p>
        </div>
      </footer>
    </div>
  );
}
