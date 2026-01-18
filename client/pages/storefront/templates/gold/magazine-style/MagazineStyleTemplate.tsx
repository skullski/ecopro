import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * MAGAZINE STYLE - Editorial magazine-inspired landing page.
 * Design: Magazine layout, columns, drop caps, editorial photography, refined typography.
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

export default function MagazineStyleTemplate(props: TemplateProps) {
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

  // Theme - Classic editorial
  const bg = asString(settings.template_bg_color) || '#fefefe';
  const text = asString(settings.template_text_color) || '#1a1a1a';
  const muted = asString(settings.template_muted_color) || '#6b6b6b';
  const accent = asString(settings.template_accent_color) || '#b91c1c';
  const cardBg = asString((settings as any).template_card_bg) || '#ffffff';
  const border = 'rgba(0,0,0,0.12)';

  // Content
  const storeName = asString(settings.store_name) || 'Magazine';
  const heroTitle = asString(settings.template_hero_heading) || 'The Art of Modern Living';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Discover the curated collection that defines contemporary elegance. A story of craftsmanship, quality, and timeless design.';
  const ctaText = asString(settings.template_button_text) || 'Shop the Collection';

  // Spacing
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 60, 24, 96);
  const cardRadius = resolveInt(settings.template_card_border_radius, 4, 0, 32);

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

  return (
    <div
      data-edit-path="__root"
      onClick={() => canManage && onSelect('__root')}
      className="ecopro-storefront"
      style={{ minHeight: '100vh', background: bg, color: text, fontFamily: '"Playfair Display", Georgia, serif' }}
    >
      {/* Magazine Header */}
      <header
        data-edit-path="layout.header"
        onClick={(e) => { stopIfManage(e); onSelect('layout.header'); }}
        style={{ borderBottom: `2px solid ${text}`, padding: '30px 20px' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          {/* Masthead */}
          <div style={{ fontSize: 10, letterSpacing: 4, color: muted, marginBottom: 8, fontFamily: 'sans-serif' }}>
            EST. 2025 • ISSUE 001
          </div>
          <h1 style={{ fontSize: isMobile ? 36 : 52, fontWeight: 400, letterSpacing: 8, textTransform: 'uppercase', margin: 0 }}>
            {storeName}
          </h1>
          <div style={{ fontSize: 10, letterSpacing: 4, color: muted, marginTop: 8, fontFamily: 'sans-serif' }}>
            THE DEFINITIVE GUIDE TO EXCEPTIONAL PRODUCTS
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav style={{ borderBottom: `1px solid ${border}`, padding: '12px 20px', background: '#fafafa' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 40 }}>
          {['Featured', 'Collection', 'Editorial', 'About'].map((item) => (
            <span key={item} style={{ fontSize: 11, letterSpacing: 2, fontFamily: 'sans-serif', cursor: 'pointer', color: muted }}>
              {item.toUpperCase()}
            </span>
          ))}
        </div>
      </nav>

      {/* Hero - Magazine Cover Style */}
      <section
        data-edit-path="layout.hero"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 50, alignItems: 'start' }}>
            {/* Left Column - Image */}
            <div
              data-edit-path="layout.hero.image"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
            >
              <img 
                src={productImage(mainProduct)} 
                alt="Cover" 
                style={{ width: '100%', height: 'auto', borderRadius: cardRadius }} 
              />
              <p style={{ fontSize: 10, color: muted, marginTop: 8, fontFamily: 'sans-serif' }}>
                PHOTOGRAPHED BY ECOPRO STUDIO
              </p>
            </div>

            {/* Right Column - Article */}
            <div>
              <div
                data-edit-path="layout.hero.badge"
                onClick={(e) => { stopIfManage(e); onSelect('layout.hero.badge'); }}
                style={{ fontSize: 10, letterSpacing: 3, color: accent, marginBottom: 16, fontFamily: 'sans-serif', borderLeft: `3px solid ${accent}`, paddingLeft: 12 }}
              >
                COVER STORY
              </div>

              <h2
                data-edit-path="layout.hero.title"
                onClick={(e) => { stopIfManage(e); onSelect('layout.hero.title'); }}
                style={{ fontSize: isMobile ? 28 : 42, fontWeight: 400, lineHeight: 1.2, marginBottom: 24 }}
              >
                {heroTitle}
              </h2>

              <p
                data-edit-path="layout.hero.subtitle"
                onClick={(e) => { stopIfManage(e); onSelect('layout.hero.subtitle'); }}
                style={{ fontSize: 16, color: muted, lineHeight: 1.8, marginBottom: 30, fontFamily: 'Georgia, serif' }}
              >
                <span style={{ fontSize: 48, float: 'left', lineHeight: 1, marginRight: 8, marginTop: -6, color: text }}>D</span>
                {heroSubtitle}
              </p>

              <div style={{ borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}`, padding: '16px 0', marginBottom: 30 }}>
                <div style={{ display: 'flex', gap: 30, fontSize: 11, fontFamily: 'sans-serif', color: muted }}>
                  <span>BY THE EDITORS</span>
                  <span>•</span>
                  <span>5 MIN READ</span>
                </div>
              </div>

              <button
                data-edit-path="layout.hero.cta"
                onClick={(e) => { stopIfManage(e); onSelect('layout.hero.cta'); }}
                style={{
                  background: text,
                  color: bg,
                  border: 'none',
                  borderRadius: 0,
                  padding: '14px 32px',
                  fontWeight: 400,
                  cursor: 'pointer',
                  fontSize: 11,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  fontFamily: 'sans-serif',
                }}
              >
                {ctaText}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pull Quote */}
      <section style={{ padding: `${sectionSpacing * 0.5}px ${baseSpacing}px`, background: '#f8f8f8', borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}>
        <blockquote style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', fontSize: isMobile ? 22 : 32, fontStyle: 'italic', lineHeight: 1.5 }}>
          "Quality is not an act, it is a habit."
          <cite style={{ display: 'block', marginTop: 16, fontSize: 11, fontStyle: 'normal', letterSpacing: 2, color: muted, fontFamily: 'sans-serif' }}>
            — ARISTOTLE
          </cite>
        </blockquote>
      </section>

      {/* Featured Section */}
      <section
        data-edit-path="layout.featured"
        onClick={(e) => { stopIfManage(e); onSelect('layout.featured'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
            <h2
              data-edit-path="layout.featured.title"
              onClick={(e) => { stopIfManage(e); onSelect('layout.featured.title'); }}
              style={{ fontSize: 11, letterSpacing: 3, fontFamily: 'sans-serif', margin: 0 }}
            >
              THE EDIT
            </h2>
            <div style={{ height: 1, flex: 1, background: border, margin: '0 20px' }} />
            <span style={{ fontSize: 11, letterSpacing: 3, fontFamily: 'sans-serif', color: muted }}>
              CURATED
            </span>
          </div>

          {/* Article Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 30 }}>
            {products.slice(0, 3).map((product, i) => (
              <article key={product.id} style={{ borderBottom: `1px solid ${border}`, paddingBottom: 24 }}>
                <img src={productImage(product)} alt={product.name} style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', marginBottom: 16 }} />
                <span style={{ fontSize: 10, letterSpacing: 2, color: accent, fontFamily: 'sans-serif' }}>
                  {['LIFESTYLE', 'ESSENTIALS', 'CURATED'][i]}
                </span>
                <h3 style={{ fontSize: 20, fontWeight: 400, marginTop: 8, marginBottom: 8 }}>{product.name}</h3>
                <p style={{ fontSize: 13, color: muted, lineHeight: 1.6, fontFamily: 'sans-serif' }}>
                  An exploration of form and function, carefully selected for the discerning reader.
                </p>
                <div style={{ fontSize: 16, fontWeight: 700, marginTop: 12, fontFamily: 'sans-serif' }}>
                  {formatPrice(product.price)}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Checkout Section */}
      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, background: '#fafafa', borderTop: `1px solid ${border}` }}>
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <span style={{ fontSize: 10, letterSpacing: 3, color: accent, fontFamily: 'sans-serif' }}>SHOP NOW</span>
            <h2 style={{ fontSize: 28, fontWeight: 400, marginTop: 8 }}>Complete Your Collection</h2>
          </div>
          
          <EmbeddedCheckout
            storeSlug={storeSlug}
            product={mainProduct as any}
            formatPrice={formatPrice}
            theme={checkoutTheme}
            disabled={canManage}
            heading={ctaText}
            subheading={canManage ? 'Disabled in editor' : 'Free shipping on all orders'}
          />
        </div>
      </section>

      {/* Footer - Magazine Style */}
      <footer
        data-edit-path="layout.footer"
        onClick={(e) => { stopIfManage(e); onSelect('layout.footer'); }}
        style={{ borderTop: `2px solid ${text}`, padding: `${baseSpacing * 2}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 28, letterSpacing: 6, marginBottom: 16 }}>{storeName.toUpperCase()}</div>
          <p
            data-edit-path="layout.footer.copyright"
            onClick={(e) => { stopIfManage(e); onSelect('layout.footer.copyright'); }}
            style={{ fontSize: 10, color: muted, letterSpacing: 2, fontFamily: 'sans-serif' }}
          >
            {asString((settings as any).template_copyright) || `© ${new Date().getFullYear()} ${storeName.toUpperCase()} MAGAZINE. ALL RIGHTS RESERVED.`}
          </p>
        </div>
      </footer>
    </div>
  );
}
