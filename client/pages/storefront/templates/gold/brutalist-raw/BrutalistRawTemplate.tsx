import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * BRUTALIST RAW - Raw brutalist design landing page.
 * Design: Courier monospace, stark black borders, massive typography, raw aesthetic.
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

export default function BrutalistRawTemplate(props: TemplateProps) {
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

  // Theme colors - Stark black and white
  const bg = asString(s.template_bg_color) || '#ffffff';
  const text = asString(s.template_text_color) || '#000000';
  const muted = asString(s.template_muted_color) || '#555555';
  const accent = asString(s.template_accent_color) || '#000000';
  const cardBg = asString(s.template_card_bg) || '#ffffff';
  const border = '#000000';

  // EDITABLE Content from settings
  const storeName = asString(s.store_name) || 'BRUTALIST';
  const heroTitle = asString(s.template_hero_heading) || 'NO COMPROMISE.';
  const heroSubtitle = asString(s.template_hero_subtitle) || 'RAW. UNFILTERED. ESSENTIAL. THIS IS DESIGN STRIPPED TO ITS CORE.';
  const ctaText = asString(s.template_button_text) || 'BUY NOW';
  const heroKicker = asString(s.template_hero_kicker) || 'NEW DROP';

  // Manifesto (editable)
  const manifesto1 = asString(s.template_manifesto1) || 'WE REJECT THE SUPERFICIAL.';
  const manifesto2 = asString(s.template_manifesto2) || 'WE EMBRACE THE ESSENTIAL.';
  const manifesto3 = asString(s.template_manifesto3) || 'FORM FOLLOWS FUNCTION.';

  // Features (editable)
  const feature1 = asString(s.template_feature1_title) || '001 — QUALITY';
  const feature1Desc = asString(s.template_feature1_desc) || 'No shortcuts. Ever.';
  const feature2 = asString(s.template_feature2_title) || '002 — HONESTY';
  const feature2Desc = asString(s.template_feature2_desc) || 'What you see is what you get.';
  const feature3 = asString(s.template_feature3_title) || '003 — LONGEVITY';
  const feature3Desc = asString(s.template_feature3_desc) || 'Built to last decades.';

  // Spacing
  const baseSpacing = resolveInt(s.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(s.template_section_spacing, 48, 24, 96);
  const borderWidth = 3;

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
    { title: feature1, desc: feature1Desc },
    { title: feature2, desc: feature2Desc },
    { title: feature3, desc: feature3Desc },
  ];

  return (
    <div
      data-edit-path="__root"
      onClick={() => canManage && onSelect('__root')}
      className="ecopro-storefront"
      style={{ 
        minHeight: '100vh', 
        background: bg, 
        color: text, 
        fontFamily: '"Courier New", Courier, monospace',
      }}
    >
      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={(e) => { stopIfManage(e); onSelect('layout.header'); }}
        style={{ 
          borderBottom: `${borderWidth}px solid ${border}`, 
          padding: isMobile ? '12px 16px' : '16px 24px' 
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, fontSize: isMobile ? 14 : 18, textTransform: 'uppercase', letterSpacing: 2 }}>{storeName}</span>
          <span style={{ fontSize: isMobile ? 10 : 12, fontWeight: 700 }}>EST. {new Date().getFullYear()}</span>
        </div>
      </header>

      {/* Hero Section */}
      <section
        data-edit-path="layout.hero"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero'); }}
        style={{ borderBottom: `${borderWidth}px solid ${border}` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Kicker */}
          <div
            data-edit-path="layout.hero.kicker"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.kicker'); }}
            style={{ 
              borderBottom: `${borderWidth}px solid ${border}`,
              padding: isMobile ? '10px 16px' : '12px 24px',
              fontSize: isMobile ? 10 : 12,
              fontWeight: 700,
              letterSpacing: 4,
            }}
          >
            [ {heroKicker} ]
          </div>

          {/* Title */}
          <div style={{ padding: isMobile ? '24px 16px' : '40px 24px', borderBottom: `${borderWidth}px solid ${border}` }}>
            <h1
              data-edit-path="layout.hero.title"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.title'); }}
              style={{ 
                fontSize: isMobile ? 36 : 80, 
                fontWeight: 900, 
                lineHeight: 0.95,
                letterSpacing: isMobile ? -1 : -4,
                textTransform: 'uppercase',
                marginBottom: isMobile ? 16 : 24,
              }}
            >
              {heroTitle}
            </h1>

            <p
              data-edit-path="layout.hero.subtitle"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.subtitle'); }}
              style={{ 
                fontSize: isMobile ? 12 : 14, 
                maxWidth: 600, 
                lineHeight: 1.6,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              {heroSubtitle}
            </p>
          </div>

          {/* Main Content */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
            
            {/* Left: Product Image */}
            <div
              data-edit-path="layout.hero.image"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
              style={{ 
                borderRight: isMobile ? 'none' : `${borderWidth}px solid ${border}`,
                borderBottom: isMobile ? `${borderWidth}px solid ${border}` : 'none',
              }}
            >
              <img 
                src={images[activeImage] || images[0]} 
                alt="" 
                style={{ 
                  width: '100%', 
                  aspectRatio: '1/1', 
                  objectFit: 'cover',
                  display: 'block',
                  filter: 'grayscale(20%)',
                }} 
              />

              {/* Thumbnails */}
              {images.length > 1 && (
                <div style={{ display: 'flex', borderTop: `${borderWidth}px solid ${border}` }}>
                  {images.slice(0, 10).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { stopIfManage(e); setActiveImage(idx); }}
                      style={{
                        flex: 1,
                        aspectRatio: '1/1',
                        maxWidth: isMobile ? 50 : 70,
                        padding: 0,
                        border: 'none',
                        borderRight: idx < images.slice(0, 10).length - 1 ? `${borderWidth}px solid ${border}` : 'none',
                        background: idx === activeImage ? '#000' : '#fff',
                        cursor: 'pointer',
                        overflow: 'hidden',
                      }}
                    >
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: idx === activeImage ? 0.5 : 1 }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Checkout */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Manifesto */}
              <div
                data-edit-path="layout.hero.badge"
                onClick={(e) => { stopIfManage(e); onSelect('layout.hero.badge'); }}
                style={{ borderBottom: `${borderWidth}px solid ${border}`, padding: isMobile ? 16 : 24 }}
              >
                <div style={{ fontSize: isMobile ? 11 : 13, lineHeight: 2, textTransform: 'uppercase' }}>
                  <div>{manifesto1}</div>
                  <div>{manifesto2}</div>
                  <div>{manifesto3}</div>
                </div>
              </div>

              {/* CTA */}
              <div style={{ borderBottom: `${borderWidth}px solid ${border}`, padding: isMobile ? 16 : 24 }}>
                <button
                  data-edit-path="layout.hero.cta"
                  onClick={(e) => { stopIfManage(e); onSelect('layout.hero.cta'); }}
                  style={{ 
                    width: '100%',
                    background: accent, 
                    color: bg, 
                    border: 'none', 
                    padding: isMobile ? '16px' : '20px', 
                    fontWeight: 900, 
                    cursor: 'pointer', 
                    fontSize: isMobile ? 14 : 18,
                    textTransform: 'uppercase',
                    letterSpacing: 4,
                    fontFamily: '"Courier New", monospace',
                  }}
                >
                  → {ctaText}
                </button>
              </div>

              {/* Checkout */}
              <div style={{ flex: 1, background: cardBg }}>
                <EmbeddedCheckout
                  storeSlug={storeSlug}
                  product={mainProduct as any}
                  formatPrice={formatPrice}
                  theme={checkoutTheme}
                  disabled={canManage}
                  heading={ctaText}
                  subheading={canManage ? 'Disabled in editor' : (asString(s.template_checkout_subheading) || 'NO FRILLS. JUST QUALITY.')}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        data-edit-path="layout.categories"
        onClick={(e) => { stopIfManage(e); onSelect('layout.categories'); }}
        style={{ borderBottom: `${borderWidth}px solid ${border}` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)' }}>
            {features.map((f, idx) => (
              <div 
                key={f.title} 
                style={{ 
                  borderRight: !isMobile && idx < features.length - 1 ? `${borderWidth}px solid ${border}` : 'none',
                  borderBottom: isMobile && idx < features.length - 1 ? `${borderWidth}px solid ${border}` : 'none',
                  padding: isMobile ? 20 : 32,
                }}
              >
                <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 2 }}>{f.title}</div>
                <div style={{ fontSize: isMobile ? 12 : 14, color: muted }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={(e) => { stopIfManage(e); onSelect('layout.footer'); }}
        style={{ padding: isMobile ? `20px ${baseSpacing}px` : `32px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: 16 }}>
          <p
            data-edit-path="layout.footer.copyright"
            onClick={(e) => { stopIfManage(e); onSelect('layout.footer.copyright'); }}
            style={{ fontSize: isMobile ? 10 : 12, textTransform: 'uppercase', letterSpacing: 2 }}
          >
            {asString(s.template_copyright) || `© ${new Date().getFullYear()} ${storeName}`}
          </p>
          <div style={{ fontSize: isMobile ? 10 : 12, textTransform: 'uppercase', letterSpacing: 2 }}>
            BRUTALISM IS NOT A STYLE. IT IS A STATE OF MIND.
          </div>
        </div>
      </footer>
    </div>
  );
}
