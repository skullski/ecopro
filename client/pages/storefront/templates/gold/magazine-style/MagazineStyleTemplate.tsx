import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * MAGAZINE STYLE - Editorial magazine-style landing page.
 * Design: Magazine masthead, drop cap, editorial columns, pull quote, sophisticated layout.
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

export default function MagazineStyleTemplate(props: TemplateProps) {
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

  // Theme colors - Editorial/Magazine
  const bg = asString(s.template_bg_color) || '#fefefe';
  const text = asString(s.template_text_color) || '#1a1a1a';
  const muted = asString(s.template_muted_color) || '#666666';
  const accent = asString(s.template_accent_color) || '#c41e3a';
  const cardBg = asString(s.template_card_bg) || '#ffffff';
  const border = 'rgba(0,0,0,0.1)';

  // EDITABLE Content from settings
  const storeName = asString(s.store_name) || 'MAGAZINE';
  const heroTitle = asString(s.template_hero_heading) || 'The Art of Living Well';
  const heroSubtitle = asString(s.template_hero_subtitle) || 'An exclusive look at the products shaping modern lifestyle';
  const ctaText = asString(s.template_button_text) || 'Shop Now';
  const heroKicker = asString(s.template_hero_kicker) || 'EXCLUSIVE FEATURE';
  const issueDate = asString(s.template_issue_date) || 'WINTER 2025';

  // Article content (editable)
  const articleP1 = asString(s.template_article_p1) || 'In an era defined by fleeting trends and disposable products, there emerges something refreshingly different. Something that demands attention not through noise, but through quiet excellence.';
  const articleP2 = asString(s.template_article_p2) || 'The discerning consumer recognizes quality not by its price tag, but by the story it tells. Every detail speaks of careful consideration, of craftsmanship that refuses to compromise.';
  const articleP3 = asString(s.template_article_p3) || 'This is not merely a product. It is a statement—a declaration that you understand the difference between merely owning something and truly possessing something of value.';

  // Pull quote (editable)
  const pullQuote = asString(s.template_pull_quote) || '"True luxury is not about abundance. It is about intention."';

  // Section title (editable)
  const detailsTitle = asString(s.template_section_title) || 'The Details';

  // Details (editable)
  const detail1Title = asString(s.template_feature1_title) || 'Materials';
  const detail1Desc = asString(s.template_feature1_desc) || 'Sourced from the finest suppliers';
  const detail2Title = asString(s.template_feature2_title) || 'Craftsmanship';
  const detail2Desc = asString(s.template_feature2_desc) || 'Made by skilled artisans';
  const detail3Title = asString(s.template_feature3_title) || 'Heritage';
  const detail3Desc = asString(s.template_feature3_desc) || 'Rooted in timeless tradition';

  // Spacing
  const baseSpacing = resolveInt(s.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(s.template_section_spacing, 64, 24, 96);
  const cardRadius = resolveInt(s.template_card_border_radius, 4, 0, 32);
  const buttonRadius = resolveInt(s.template_button_border_radius, 0, 0, 50);

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

  const details = [
    { title: detail1Title, desc: detail1Desc },
    { title: detail2Title, desc: detail2Desc },
    { title: detail3Title, desc: detail3Desc },
  ];

  // Drop cap first letter
  const firstLetter = articleP1.charAt(0);
  const restOfFirstParagraph = articleP1.slice(1);

  return (
    <div
      data-edit-path="__root"
      onClick={() => canManage && onSelect('__root')}
      className="ecopro-storefront"
      style={{ minHeight: '100vh', background: bg, color: text, fontFamily: '"Libre Baskerville", Georgia, serif' }}
    >
      {/* Magazine Masthead */}
      <header
        data-edit-path="layout.header"
        onClick={(e) => { stopIfManage(e); onSelect('layout.header'); }}
        style={{ borderBottom: `3px double ${text}`, padding: isMobile ? '16px 20px' : '24px 40px' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: isMobile ? 10 : 11, letterSpacing: 4, color: muted, marginBottom: 8, fontFamily: 'Inter, system-ui, sans-serif' }}>{issueDate}</div>
          <div style={{ fontSize: isMobile ? 32 : 48, fontWeight: 700, letterSpacing: 8, textTransform: 'uppercase' }}>{storeName}</div>
          <div style={{ fontSize: isMobile ? 10 : 11, letterSpacing: 4, color: muted, marginTop: 8, fontFamily: 'Inter, system-ui, sans-serif' }}>CURATED LIFESTYLE</div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        data-edit-path="layout.hero"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero'); }}
        style={{ padding: isMobile ? `${sectionSpacing * 0.6}px ${baseSpacing}px` : `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Kicker */}
          <div
            data-edit-path="layout.hero.kicker"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.kicker'); }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 16, 
              marginBottom: isMobile ? 16 : 24 
            }}
          >
            <span style={{ width: 40, height: 1, background: accent }} />
            <span style={{ fontSize: isMobile ? 10 : 12, letterSpacing: 3, color: accent, fontFamily: 'Inter, system-ui, sans-serif' }}>{heroKicker}</span>
          </div>

          {/* Title */}
          <h1
            data-edit-path="layout.hero.title"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.title'); }}
            style={{ fontSize: isMobile ? 32 : 56, fontWeight: 400, lineHeight: 1.15, marginBottom: isMobile ? 12 : 20, fontStyle: 'italic' }}
          >
            {heroTitle}
          </h1>

          <p
            data-edit-path="layout.hero.subtitle"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.subtitle'); }}
            style={{ fontSize: isMobile ? 14 : 18, color: muted, marginBottom: isMobile ? 24 : 36, fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            {heroSubtitle}
          </p>

          {/* Featured Image */}
          <div
            data-edit-path="layout.hero.image"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
            style={{ marginBottom: isMobile ? 24 : 36 }}
          >
            <img src={images[activeImage] || images[0]} alt="" style={{ width: '100%', aspectRatio: isMobile ? '4/3' : '21/9', objectFit: 'cover' }} />
            <div style={{ marginTop: 8, fontSize: isMobile ? 10 : 11, color: muted, fontStyle: 'italic', fontFamily: 'Inter, system-ui, sans-serif' }}>
              {asString(s.template_image_caption) || 'Photography by the brand'}
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginBottom: isMobile ? 24 : 36 }}>
              {images.slice(0, 10).map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { stopIfManage(e); setActiveImage(idx); }}
                  style={{
                    width: isMobile ? 48 : 64,
                    height: isMobile ? 48 : 64,
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
      </section>

      {/* Article + Checkout */}
      <section
        data-edit-path="layout.featured"
        onClick={(e) => { stopIfManage(e); onSelect('layout.featured'); }}
        style={{ padding: `0 ${baseSpacing}px ${sectionSpacing}px` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 350px', gap: isMobile ? 40 : 64, alignItems: 'start' }}>
          
          {/* Article Content */}
          <article
            data-edit-path="layout.categories"
            onClick={(e) => { stopIfManage(e); onSelect('layout.categories'); }}
          >
            {/* Drop Cap Paragraph */}
            <p style={{ fontSize: isMobile ? 15 : 18, lineHeight: 1.9, marginBottom: 24 }}>
              <span style={{ 
                float: 'left', 
                fontSize: isMobile ? 48 : 64, 
                lineHeight: 1, 
                marginRight: 12, 
                marginTop: 4,
                fontWeight: 700,
                color: accent,
              }}>{firstLetter}</span>
              {restOfFirstParagraph}
            </p>

            <p style={{ fontSize: isMobile ? 15 : 18, lineHeight: 1.9, marginBottom: 24 }}>{articleP2}</p>

            {/* Pull Quote */}
            <div
              data-edit-path="layout.hero.badge"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.badge'); }}
              style={{ 
                borderLeft: `3px solid ${accent}`, 
                paddingLeft: isMobile ? 16 : 24, 
                margin: `${isMobile ? 28 : 40}px 0`,
              }}
            >
              <p style={{ fontSize: isMobile ? 20 : 26, fontStyle: 'italic', lineHeight: 1.5, color: text }}>{pullQuote}</p>
            </div>

            <p style={{ fontSize: isMobile ? 15 : 18, lineHeight: 1.9, marginBottom: 24 }}>{articleP3}</p>

            {/* Details Section */}
            <h3
              data-edit-path="layout.featured.title"
              onClick={(e) => { stopIfManage(e); onSelect('layout.featured.title'); }}
              style={{ fontSize: isMobile ? 20 : 24, fontWeight: 400, marginTop: isMobile ? 32 : 48, marginBottom: isMobile ? 20 : 28, fontStyle: 'italic' }}
            >
              {detailsTitle}
            </h3>

            <div
              data-edit-path="layout.grid"
              onClick={(e) => { stopIfManage(e); onSelect('layout.grid'); }}
              style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 20 : 28 }}
            >
              {details.map((d) => (
                <div key={d.title}>
                  <div style={{ fontSize: isMobile ? 11 : 12, letterSpacing: 2, color: accent, marginBottom: 8, fontFamily: 'Inter, system-ui, sans-serif', textTransform: 'uppercase' }}>{d.title}</div>
                  <div style={{ fontSize: isMobile ? 13 : 15, color: muted, fontFamily: 'Inter, system-ui, sans-serif' }}>{d.desc}</div>
                </div>
              ))}
            </div>
          </article>

          {/* Checkout Sidebar */}
          <aside style={{ position: isMobile ? 'relative' : 'sticky', top: isMobile ? 0 : 30 }}>
            <div style={{ border: `1px solid ${border}`, padding: isMobile ? 16 : 20 }}>
              <div style={{ fontSize: isMobile ? 10 : 11, letterSpacing: 2, color: muted, marginBottom: 12, fontFamily: 'Inter, system-ui, sans-serif' }}>ACQUIRE</div>
              <EmbeddedCheckout
                storeSlug={storeSlug}
                product={mainProduct as any}
                formatPrice={formatPrice}
                theme={checkoutTheme}
                disabled={canManage}
                heading={ctaText}
                subheading={canManage ? 'Disabled in editor' : (asString(s.template_checkout_subheading) || 'Complimentary shipping worldwide')}
              />
            </div>

            {/* Gallery in sidebar */}
            {images.length > 2 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 20 }}>
                {images.slice(1, 5).map((img, idx) => (
                  <div key={idx} style={{ aspectRatio: '1', overflow: 'hidden' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={(e) => { stopIfManage(e); onSelect('layout.footer'); }}
        style={{ borderTop: `3px double ${text}`, padding: `${baseSpacing * 2}px ${baseSpacing}px`, textAlign: 'center' }}
      >
        <p
          data-edit-path="layout.footer.copyright"
          onClick={(e) => { stopIfManage(e); onSelect('layout.footer.copyright'); }}
          style={{ fontSize: isMobile ? 10 : 12, color: muted, fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          {asString(s.template_copyright) || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`}
        </p>
      </footer>
    </div>
  );
}
