import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * COMPARISON TABLE - Product vs competitors comparison landing page.
 * Design: Feature checklist grid, competitor comparison, clear differentiation.
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

export default function ComparisonTableTemplate(props: TemplateProps) {
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

  // Theme colors
  const bg = asString(s.template_bg_color) || '#ffffff';
  const text = asString(s.template_text_color) || '#111827';
  const muted = asString(s.template_muted_color) || '#6b7280';
  const accent = asString(s.template_accent_color) || '#059669';
  const cardBg = asString(s.template_card_bg) || '#ffffff';
  const border = 'rgba(0,0,0,0.08)';

  // EDITABLE Content from settings
  const storeName = asString(s.store_name) || 'Comparison Pro';
  const heroTitle = asString(s.template_hero_heading) || 'See the Difference';
  const heroSubtitle = asString(s.template_hero_subtitle) || 'Compare features side-by-side and see why customers choose us over the competition.';
  const ctaText = asString(s.template_button_text) || 'Choose the Winner';
  const heroKicker = asString(s.template_hero_kicker) || 'HONEST COMPARISON';

  // Our product name (editable)
  const ourProduct = asString(s.template_our_product) || 'Our Product';
  const competitor1 = asString(s.template_competitor1) || 'Competitor A';
  const competitor2 = asString(s.template_competitor2) || 'Competitor B';

  // Features (editable)
  const feature1 = asString(s.template_feature1_title) || 'Premium Quality Materials';
  const feature2 = asString(s.template_feature2_title) || 'Free Shipping';
  const feature3 = asString(s.template_feature3_title) || '30-Day Money Back';
  const feature4 = asString(s.template_feature4_title) || 'Lifetime Warranty';
  const feature5 = asString(s.template_feature5_title) || '24/7 Support';
  const feature6 = asString(s.template_feature6_title) || 'Eco-Friendly';

  // Feature availability (editable - ours always has all, competitors vary)
  const comp1F1 = asString(s.template_comp1_f1) || '✗';
  const comp1F2 = asString(s.template_comp1_f2) || '✗';
  const comp1F3 = asString(s.template_comp1_f3) || '✓';
  const comp1F4 = asString(s.template_comp1_f4) || '✗';
  const comp1F5 = asString(s.template_comp1_f5) || '✗';
  const comp1F6 = asString(s.template_comp1_f6) || '✗';

  const comp2F1 = asString(s.template_comp2_f1) || '✓';
  const comp2F2 = asString(s.template_comp2_f2) || '✗';
  const comp2F3 = asString(s.template_comp2_f3) || '✗';
  const comp2F4 = asString(s.template_comp2_f4) || '✗';
  const comp2F5 = asString(s.template_comp2_f5) || '✓';
  const comp2F6 = asString(s.template_comp2_f6) || '✗';

  // Pricing (editable)
  const ourPrice = asString(s.template_our_price) || '$49';
  const comp1Price = asString(s.template_comp1_price) || '$79';
  const comp2Price = asString(s.template_comp2_price) || '$65';

  // Section title (editable)
  const tableTitle = asString(s.template_section_title) || 'Feature Comparison';

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

  const checkoutTheme = { bg: cardBg, text, muted, accent, cardBg, border };

  const stopIfManage = (e: React.MouseEvent) => {
    if (!canManage) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const features = [
    { name: feature1, ours: '✓', comp1: comp1F1, comp2: comp2F1 },
    { name: feature2, ours: '✓', comp1: comp1F2, comp2: comp2F2 },
    { name: feature3, ours: '✓', comp1: comp1F3, comp2: comp2F3 },
    { name: feature4, ours: '✓', comp1: comp1F4, comp2: comp2F4 },
    { name: feature5, ours: '✓', comp1: comp1F5, comp2: comp2F5 },
    { name: feature6, ours: '✓', comp1: comp1F6, comp2: comp2F6 },
  ];

  const renderCheck = (value: string, isOurs: boolean = false) => {
    const isCheck = value === '✓';
    return (
      <span style={{ 
        color: isCheck ? (isOurs ? accent : '#22c55e') : '#ef4444',
        fontWeight: 700,
        fontSize: isMobile ? 14 : 18,
      }}>
        {value}
      </span>
    );
  };

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
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 28 : 40 }}>
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
              style={{ fontSize: isMobile ? 28 : 48, fontWeight: 900, lineHeight: 1.15, marginBottom: 14 }}
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

          {/* Comparison Table */}
          <div
            data-edit-path="layout.categories"
            onClick={(e) => { stopIfManage(e); onSelect('layout.categories'); }}
            style={{ 
              background: cardBg, 
              borderRadius: cardRadius, 
              border: `1px solid ${border}`,
              overflow: 'hidden',
              marginBottom: isMobile ? 28 : 40,
            }}
          >
            <h2
              data-edit-path="layout.featured.title"
              onClick={(e) => { stopIfManage(e); onSelect('layout.featured.title'); }}
              style={{ 
                fontSize: isMobile ? 16 : 20, 
                fontWeight: 800, 
                padding: isMobile ? '16px 12px' : '20px 24px',
                borderBottom: `1px solid ${border}`,
                margin: 0,
              }}
            >
              {tableTitle}
            </h2>

            {/* Table Header */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1.5fr 1fr 1fr 1fr' : '2fr 1fr 1fr 1fr',
              background: '#f8fafc',
              borderBottom: `1px solid ${border}`,
              fontWeight: 700,
              fontSize: isMobile ? 10 : 13,
            }}>
              <div style={{ padding: isMobile ? '10px 8px' : '14px 20px', color: muted }}>Feature</div>
              <div style={{ padding: isMobile ? '10px 8px' : '14px 20px', textAlign: 'center', background: `${accent}15`, color: accent, borderLeft: `1px solid ${border}`, borderRight: `1px solid ${border}` }}>
                {ourProduct}
              </div>
              <div style={{ padding: isMobile ? '10px 8px' : '14px 20px', textAlign: 'center', color: muted }}>{competitor1}</div>
              <div style={{ padding: isMobile ? '10px 8px' : '14px 20px', textAlign: 'center', color: muted }}>{competitor2}</div>
            </div>

            {/* Table Rows */}
            {features.map((f, idx) => (
              <div 
                key={f.name} 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? '1.5fr 1fr 1fr 1fr' : '2fr 1fr 1fr 1fr',
                  borderBottom: idx < features.length - 1 ? `1px solid ${border}` : 'none',
                }}
              >
                <div style={{ padding: isMobile ? '10px 8px' : '14px 20px', fontSize: isMobile ? 11 : 14 }}>{f.name}</div>
                <div style={{ padding: isMobile ? '10px 8px' : '14px 20px', textAlign: 'center', background: `${accent}05`, borderLeft: `1px solid ${border}`, borderRight: `1px solid ${border}` }}>
                  {renderCheck(f.ours, true)}
                </div>
                <div style={{ padding: isMobile ? '10px 8px' : '14px 20px', textAlign: 'center' }}>{renderCheck(f.comp1)}</div>
                <div style={{ padding: isMobile ? '10px 8px' : '14px 20px', textAlign: 'center' }}>{renderCheck(f.comp2)}</div>
              </div>
            ))}

            {/* Price Row */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1.5fr 1fr 1fr 1fr' : '2fr 1fr 1fr 1fr',
              background: '#f8fafc',
              borderTop: `1px solid ${border}`,
              fontWeight: 700,
            }}>
              <div style={{ padding: isMobile ? '12px 8px' : '16px 20px', fontSize: isMobile ? 11 : 14 }}>Price</div>
              <div style={{ padding: isMobile ? '12px 8px' : '16px 20px', textAlign: 'center', background: accent, color: '#fff', fontSize: isMobile ? 14 : 18 }}>
                {ourPrice}
              </div>
              <div style={{ padding: isMobile ? '12px 8px' : '16px 20px', textAlign: 'center', fontSize: isMobile ? 12 : 16, color: muted, textDecoration: 'line-through' }}>{comp1Price}</div>
              <div style={{ padding: isMobile ? '12px 8px' : '16px 20px', textAlign: 'center', fontSize: isMobile ? 12 : 16, color: muted, textDecoration: 'line-through' }}>{comp2Price}</div>
            </div>
          </div>

          {/* Product + Checkout */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 400px', gap: isMobile ? 24 : 40, alignItems: 'start' }}>
            {/* Product Image */}
            <div
              data-edit-path="layout.hero.image"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
            >
              <div style={{ borderRadius: cardRadius, overflow: 'hidden', border: `3px solid ${accent}`, position: 'relative' }}>
                <img src={images[activeImage] || images[0]} alt="" style={{ width: '100%', aspectRatio: isMobile ? '4/3' : '16/10', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 12, left: 12, background: accent, color: '#fff', padding: '6px 12px', borderRadius: 6, fontWeight: 800, fontSize: isMobile ? 11 : 13 }}>
                  BEST CHOICE
                </div>
              </div>
              {/* Thumbnails */}
              {images.length > 1 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  {images.slice(0, 10).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { stopIfManage(e); setActiveImage(idx); }}
                      style={{
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

            {/* Checkout */}
            <div style={{ position: isMobile ? 'relative' : 'sticky', top: isMobile ? 0 : 90 }}>
              <div
                data-edit-path="layout.hero.badge"
                onClick={(e) => { stopIfManage(e); onSelect('layout.hero.badge'); }}
                style={{ 
                  background: `linear-gradient(135deg, ${accent}, #10b981)`, 
                  color: '#fff', 
                  padding: isMobile ? '12px 16px' : '14px 20px', 
                  borderRadius: `${cardRadius}px ${cardRadius}px 0 0`, 
                  textAlign: 'center' 
                }}
              >
                <div style={{ fontWeight: 800, fontSize: isMobile ? 12 : 14 }}>🏆 The Clear Winner</div>
                <div style={{ fontSize: isMobile ? 10 : 12, opacity: 0.9 }}>All features, best price</div>
              </div>

              <EmbeddedCheckout
                storeSlug={storeSlug}
                product={mainProduct as any}
                formatPrice={formatPrice}
                theme={checkoutTheme}
                disabled={canManage}
                heading={ctaText}
                subheading={canManage ? 'Disabled in editor' : (asString(s.template_checkout_subheading) || '✓ Complete feature set • Best value')}
              />
            </div>
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
