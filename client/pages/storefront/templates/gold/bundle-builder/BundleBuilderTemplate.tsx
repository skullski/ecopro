import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * BUNDLE BUILDER - Product bundle/package builder landing page.
 * Design: Bundle tier selection, discount visualization, package comparison grid.
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

export default function BundleBuilderTemplate(props: TemplateProps) {
  const { settings, formatPrice } = props;
  const s = settings as any;
  const canManage = Boolean(props.canManage);
  const onSelect = (path: string) => {
    if (canManage && typeof (props as any).onSelect === 'function') {
      (props as any).onSelect(path);
    }
  };

  const [isMobile, setIsMobile] = React.useState((props as any).forcedBreakpoint === 'mobile');
  const [selectedTier, setSelectedTier] = React.useState(1); // 0, 1, 2

  React.useEffect(() => {
    const bp = (props as any).forcedBreakpoint;
    if (bp) { setIsMobile(bp === 'mobile'); return; }
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [(props as any).forcedBreakpoint]);

  // Theme colors
  const bg = asString(s.template_bg_color) || '#f8fafc';
  const text = asString(s.template_text_color) || '#0f172a';
  const muted = asString(s.template_muted_color) || '#64748b';
  const accent = asString(s.template_accent_color) || '#7c3aed';
  const cardBg = asString(s.template_card_bg) || '#ffffff';
  const border = 'rgba(0,0,0,0.06)';

  // EDITABLE Content from settings
  const storeName = asString(s.store_name) || 'Bundle Builder';
  const heroTitle = asString(s.template_hero_heading) || 'Choose Your Bundle & Save';
  const heroSubtitle = asString(s.template_hero_subtitle) || 'The more you bundle, the more you save. Select your perfect package below.';
  const ctaText = asString(s.template_button_text) || 'Get This Bundle';
  const heroKicker = asString(s.template_hero_kicker) || 'BUILD YOUR BUNDLE';

  // Bundle Tiers (editable)
  const tier1Name = asString(s.template_tier1_name) || 'Starter';
  const tier1Qty = asString(s.template_tier1_qty) || '1x';
  const tier1Price = asString(s.template_tier1_price) || '$49';
  const tier1PerUnit = asString(s.template_tier1_per_unit) || '$49/unit';
  const tier1Discount = asString(s.template_tier1_discount) || '';

  const tier2Name = asString(s.template_tier2_name) || 'Popular';
  const tier2Qty = asString(s.template_tier2_qty) || '3x';
  const tier2Price = asString(s.template_tier2_price) || '$119';
  const tier2PerUnit = asString(s.template_tier2_per_unit) || '$39.67/unit';
  const tier2Discount = asString(s.template_tier2_discount) || 'Save 19%';

  const tier3Name = asString(s.template_tier3_name) || 'Best Value';
  const tier3Qty = asString(s.template_tier3_qty) || '6x';
  const tier3Price = asString(s.template_tier3_price) || '$199';
  const tier3PerUnit = asString(s.template_tier3_per_unit) || '$33.17/unit';
  const tier3Discount = asString(s.template_tier3_discount) || 'Save 32%';

  // Benefits (editable)
  const benefit1 = asString(s.template_feature1_title) || '✓ Free Shipping on All Bundles';
  const benefit2 = asString(s.template_feature2_title) || '✓ Bundle Bonus Gift Included';
  const benefit3 = asString(s.template_feature3_title) || '✓ Extended Warranty';
  const benefit4 = asString(s.template_feature4_title) || '✓ Priority Support';

  // Section title (editable)
  const whyBundleTitle = asString(s.template_section_title) || 'Why Bundle?';

  // Why bundle reasons (editable)
  const reason1Title = asString(s.template_reason1_title) || 'Save Money';
  const reason1Desc = asString(s.template_reason1_desc) || 'Up to 32% off when you bundle';
  const reason2Title = asString(s.template_reason2_title) || 'Free Shipping';
  const reason2Desc = asString(s.template_reason2_desc) || 'All bundles ship free';
  const reason3Title = asString(s.template_reason3_title) || 'Bonus Gifts';
  const reason3Desc = asString(s.template_reason3_desc) || 'Exclusive items with larger bundles';

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

  const checkoutTheme = { bg: cardBg, text, muted, accent, cardBg, border };

  const stopIfManage = (e: React.MouseEvent) => {
    if (!canManage) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const tiers = [
    { name: tier1Name, qty: tier1Qty, price: tier1Price, perUnit: tier1PerUnit, discount: tier1Discount, popular: false },
    { name: tier2Name, qty: tier2Qty, price: tier2Price, perUnit: tier2PerUnit, discount: tier2Discount, popular: true },
    { name: tier3Name, qty: tier3Qty, price: tier3Price, perUnit: tier3PerUnit, discount: tier3Discount, popular: false },
  ];

  const benefits = [benefit1, benefit2, benefit3, benefit4].filter(Boolean);

  const reasons = [
    { title: reason1Title, desc: reason1Desc, icon: '💰' },
    { title: reason2Title, desc: reason2Desc, icon: '🚚' },
    { title: reason3Title, desc: reason3Desc, icon: '🎁' },
  ];

  return (
    <div
      data-edit-path="__root"
      onClick={() => canManage && onSelect('__root')}
      className="ecopro-storefront"
      style={{ minHeight: '100vh', background: bg, color: text, fontFamily: 'Inter, system-ui, sans-serif' }}
    >
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: isMobile ? 10 : 12, color: accent, fontWeight: 700 }}>
            🎁 {asString(s.template_header_badge) || 'Bundle & Save'}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        data-edit-path="layout.hero"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero'); }}
        style={{ padding: isMobile ? `${sectionSpacing * 0.6}px ${baseSpacing}px` : `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 24 : 36 }}>
            <div
              data-edit-path="layout.hero.kicker"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.kicker'); }}
              style={{ fontSize: isMobile ? 10 : 12, fontWeight: 800, letterSpacing: 2, color: accent, marginBottom: 10 }}
            >
              {heroKicker}
            </div>

            <h1
              data-edit-path="layout.hero.title"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.title'); }}
              style={{ fontSize: isMobile ? 26 : 44, fontWeight: 900, lineHeight: 1.15, marginBottom: 12 }}
            >
              {heroTitle}
            </h1>

            <p
              data-edit-path="layout.hero.subtitle"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.subtitle'); }}
              style={{ fontSize: isMobile ? 14 : 18, color: muted, maxWidth: 600, margin: '0 auto' }}
            >
              {heroSubtitle}
            </p>
          </div>

          {/* Product Image */}
          <div
            data-edit-path="layout.hero.image"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
            style={{ maxWidth: 600, margin: '0 auto', marginBottom: isMobile ? 24 : 36 }}
          >
            <div style={{ borderRadius: cardRadius, overflow: 'hidden', border: `1px solid ${border}` }}>
              <img src={images[activeImage] || images[0]} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover' }} />
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
                {images.slice(0, 10).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { stopIfManage(e); setActiveImage(idx); }}
                    style={{
                      width: isMobile ? 44 : 54,
                      height: isMobile ? 44 : 54,
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

          {/* Bundle Tiers */}
          <div
            data-edit-path="layout.hero.badge"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.badge'); }}
            style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', 
              gap: isMobile ? 12 : 20,
              maxWidth: 900,
              margin: '0 auto',
              marginBottom: isMobile ? 24 : 36,
            }}
          >
            {tiers.map((tier, idx) => (
              <button
                key={tier.name}
                onClick={(e) => { stopIfManage(e); setSelectedTier(idx); }}
                style={{
                  background: cardBg,
                  borderRadius: cardRadius,
                  padding: isMobile ? 16 : 24,
                  border: selectedTier === idx ? `3px solid ${accent}` : `1px solid ${border}`,
                  cursor: 'pointer',
                  position: 'relative',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  transform: selectedTier === idx ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                {tier.popular && (
                  <div style={{ 
                    position: 'absolute', 
                    top: -12, 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    background: accent, 
                    color: '#fff', 
                    padding: '4px 12px', 
                    borderRadius: 20, 
                    fontSize: isMobile ? 10 : 11, 
                    fontWeight: 700,
                  }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 800 }}>{tier.name}</div>
                    <div style={{ fontSize: isMobile ? 20 : 26, fontWeight: 900, color: accent }}>{tier.qty}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: isMobile ? 22 : 28, fontWeight: 900 }}>{tier.price}</div>
                    <div style={{ fontSize: isMobile ? 11 : 13, color: muted }}>{tier.perUnit}</div>
                  </div>
                </div>
                {tier.discount && (
                  <div style={{ 
                    background: '#dcfce7', 
                    color: '#166534', 
                    padding: '6px 10px', 
                    borderRadius: 6, 
                    fontSize: isMobile ? 11 : 13, 
                    fontWeight: 700,
                    textAlign: 'center',
                  }}>
                    {tier.discount}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Benefits for selected tier */}
          <div
            data-edit-path="layout.categories"
            onClick={(e) => { stopIfManage(e); onSelect('layout.categories'); }}
            style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              justifyContent: 'center', 
              gap: isMobile ? 8 : 16, 
              marginBottom: isMobile ? 24 : 36,
            }}
          >
            {benefits.map((b) => (
              <span key={b} style={{ fontSize: isMobile ? 12 : 14, color: '#166534', fontWeight: 600 }}>{b}</span>
            ))}
          </div>

          {/* Checkout */}
          <div style={{ maxWidth: 450, margin: '0 auto' }}>
            <EmbeddedCheckout
              storeSlug={storeSlug}
              product={mainProduct as any}
              formatPrice={formatPrice}
              theme={checkoutTheme}
              disabled={canManage}
              heading={`${ctaText} - ${tiers[selectedTier].qty}`}
              subheading={canManage ? 'Disabled in editor' : (asString(s.template_checkout_subheading) || `Selected: ${tiers[selectedTier].name} Bundle`)}
            />
          </div>
        </div>
      </section>

      {/* Why Bundle Section */}
      <section
        data-edit-path="layout.featured"
        onClick={(e) => { stopIfManage(e); onSelect('layout.featured'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, background: cardBg }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2
            data-edit-path="layout.featured.title"
            onClick={(e) => { stopIfManage(e); onSelect('layout.featured.title'); }}
            style={{ fontSize: isMobile ? 20 : 28, fontWeight: 900, textAlign: 'center', marginBottom: isMobile ? 28 : 40 }}
          >
            {whyBundleTitle}
          </h2>

          <div
            data-edit-path="layout.grid"
            onClick={(e) => { stopIfManage(e); onSelect('layout.grid'); }}
            style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 20 : 28 }}
          >
            {reasons.map((r) => (
              <div key={r.title} style={{ textAlign: 'center', padding: isMobile ? 16 : 24 }}>
                <div style={{ fontSize: isMobile ? 32 : 40, marginBottom: 12 }}>{r.icon}</div>
                <div style={{ fontWeight: 800, fontSize: isMobile ? 16 : 18, marginBottom: 8 }}>{r.title}</div>
                <div style={{ fontSize: isMobile ? 13 : 15, color: muted }}>{r.desc}</div>
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
