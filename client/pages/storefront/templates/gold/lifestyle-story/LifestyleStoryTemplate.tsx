import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * LIFESTYLE STORY - Editorial storytelling landing page with warm earthy tones.
 * Design: Full-bleed hero, quote section, lifestyle imagery, Georgia serif typography.
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

export default function LifestyleStoryTemplate(props: TemplateProps) {
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

  // Theme colors - Warm earthy tones
  const bg = asString(s.template_bg_color) || '#faf8f5';
  const text = asString(s.template_text_color) || '#3d3d3d';
  const muted = asString(s.template_muted_color) || '#8b8178';
  const accent = asString(s.template_accent_color) || '#b8860b';
  const cardBg = asString(s.template_card_bg) || '#ffffff';
  const border = 'rgba(0,0,0,0.06)';

  // EDITABLE Content from settings
  const storeName = asString(s.store_name) || 'Lifestyle Story';
  const heroTitle = asString(s.template_hero_heading) || 'Live Your Best Life';
  const heroSubtitle = asString(s.template_hero_subtitle) || 'Discover how thousands of people are transforming their daily routines with products designed for the modern lifestyle.';
  const ctaText = asString(s.template_button_text) || 'Start Your Journey';
  const heroKicker = asString(s.template_hero_kicker) || 'A Story of Transformation';

  // Quote section (editable)
  const quoteText = asString(s.template_quote_text) || '"This product completely changed how I approach my day. It\'s not just a purchase—it\'s a lifestyle upgrade."';
  const quoteAuthor = asString(s.template_quote_author) || '— Sarah M., Verified Customer';

  // Story paragraphs (editable)
  const storyP1 = asString(s.template_story_p1) || 'Every great journey begins with a single step. Our customers often tell us that discovering this product was the turning point in their daily routine.';
  const storyP2 = asString(s.template_story_p2) || 'We believe that the best products are the ones that fit seamlessly into your life, enhancing without complicating.';
  const storyP3 = asString(s.template_story_p3) || 'Join thousands who have already made the switch. Your story starts here.';

  // Feature highlights (editable)
  const feature1 = asString(s.template_feature1_title) || 'Thoughtfully Designed';
  const feature1Desc = asString(s.template_feature1_desc) || 'Every detail considered for your comfort';
  const feature2 = asString(s.template_feature2_title) || 'Sustainably Made';
  const feature2Desc = asString(s.template_feature2_desc) || 'Crafted with care for the environment';
  const feature3 = asString(s.template_feature3_title) || 'Community Loved';
  const feature3Desc = asString(s.template_feature3_desc) || 'Trusted by 50,000+ happy customers';

  // Section titles (editable)
  const storyTitle = asString(s.template_section_title) || 'Our Story';

  // Spacing
  const baseSpacing = resolveInt(s.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(s.template_section_spacing, 64, 24, 96);
  const cardRadius = resolveInt(s.template_card_border_radius, 8, 0, 32);
  const buttonRadius = resolveInt(s.template_button_border_radius, 6, 0, 50);

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
      style={{ minHeight: '100vh', background: bg, color: text, fontFamily: 'Georgia, "Times New Roman", serif' }}
    >
      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={(e) => { stopIfManage(e); onSelect('layout.header'); }}
        style={{ position: 'sticky', top: 0, zIndex: 30, background: bg, borderBottom: `1px solid ${border}`, padding: isMobile ? '12px 16px' : '16px 24px' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {asString(s.store_logo) ? (
              <img src={asString(s.store_logo)} alt={storeName} style={{ width: isMobile ? 32 : 40, height: isMobile ? 32 : 40, borderRadius: 8, objectFit: 'cover' }} />
            ) : (
              <div style={{ fontWeight: 600, fontSize: isMobile ? 18 : 22, fontStyle: 'italic', color: text }}>
                {storeName}
              </div>
            )}
          </div>
          <button
            data-edit-path="layout.hero.cta"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.cta'); }}
            style={{ background: accent, color: '#fff', border: 'none', borderRadius: buttonRadius, padding: isMobile ? '8px 16px' : '10px 24px', fontWeight: 600, cursor: 'pointer', fontSize: isMobile ? 12 : 14, fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            {ctaText}
          </button>
        </div>
      </header>

      {/* Full-Bleed Hero */}
      <section
        data-edit-path="layout.hero"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero'); }}
        style={{ position: 'relative', minHeight: isMobile ? '60vh' : '70vh' }}
      >
        <div
          data-edit-path="layout.hero.image"
          onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <img src={images[activeImage] || images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 10, maxWidth: 900, margin: '0 auto', padding: isMobile ? '40px 20px' : '80px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: isMobile ? '60vh' : '70vh' }}>
          <div
            data-edit-path="layout.hero.kicker"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.kicker'); }}
            style={{ fontSize: isMobile ? 11 : 13, letterSpacing: 3, textTransform: 'uppercase', color: '#fff', marginBottom: isMobile ? 12 : 16, opacity: 0.9 }}
          >
            {heroKicker}
          </div>

          <h1
            data-edit-path="layout.hero.title"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.title'); }}
            style={{ fontSize: isMobile ? 32 : 56, fontWeight: 400, lineHeight: 1.2, color: '#fff', marginBottom: 16, fontStyle: 'italic' }}
          >
            {heroTitle}
          </h1>

          <p
            data-edit-path="layout.hero.subtitle"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.subtitle'); }}
            style={{ fontSize: isMobile ? 14 : 18, color: 'rgba(255,255,255,0.9)', lineHeight: 1.7, maxWidth: 600, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            {heroSubtitle}
          </p>
        </div>

        {/* Thumbnail Gallery */}
        {images.length > 1 && (
          <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, padding: '8px 12px', background: 'rgba(0,0,0,0.5)', borderRadius: 8 }}>
            {images.slice(0, 10).map((img, idx) => (
              <button
                key={idx}
                onClick={(e) => { stopIfManage(e); setActiveImage(idx); }}
                style={{
                  width: isMobile ? 36 : 44,
                  height: isMobile ? 36 : 44,
                  borderRadius: 4,
                  border: idx === activeImage ? '2px solid #fff' : '1px solid rgba(255,255,255,0.3)',
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
      </section>

      {/* Quote Section */}
      <section
        data-edit-path="layout.hero.badge"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero.badge'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, background: '#f5f0eb' }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: isMobile ? 18 : 26, fontStyle: 'italic', lineHeight: 1.6, color: text, marginBottom: 16 }}>
            {quoteText}
          </p>
          <p style={{ fontSize: isMobile ? 12 : 14, color: muted, fontFamily: 'Inter, system-ui, sans-serif' }}>
            {quoteAuthor}
          </p>
        </div>
      </section>

      {/* Story + Checkout Section */}
      <section
        data-edit-path="layout.featured"
        onClick={(e) => { stopIfManage(e); onSelect('layout.featured'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 380px', gap: isMobile ? 32 : 56, alignItems: 'start' }}>
          
          {/* Story Content */}
          <div>
            <h2
              data-edit-path="layout.featured.title"
              onClick={(e) => { stopIfManage(e); onSelect('layout.featured.title'); }}
              style={{ fontSize: isMobile ? 24 : 36, fontWeight: 400, marginBottom: isMobile ? 20 : 28, fontStyle: 'italic' }}
            >
              {storyTitle}
            </h2>

            <div
              data-edit-path="layout.categories"
              onClick={(e) => { stopIfManage(e); onSelect('layout.categories'); }}
              style={{ fontSize: isMobile ? 14 : 17, lineHeight: 1.9, color: text }}
            >
              <p style={{ marginBottom: 20 }}>{storyP1}</p>
              <p style={{ marginBottom: 20 }}>{storyP2}</p>
              <p>{storyP3}</p>
            </div>

            {/* Feature Highlights */}
            <div
              data-edit-path="layout.grid"
              onClick={(e) => { stopIfManage(e); onSelect('layout.grid'); }}
              style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 16 : 24, marginTop: isMobile ? 32 : 48 }}
            >
              {features.map((f) => (
                <div key={f.title} style={{ borderTop: `2px solid ${accent}`, paddingTop: 16 }}>
                  <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 600, marginBottom: 6, fontFamily: 'Inter, system-ui, sans-serif' }}>{f.title}</div>
                  <div style={{ fontSize: isMobile ? 12 : 14, color: muted, fontFamily: 'Inter, system-ui, sans-serif' }}>{f.desc}</div>
                </div>
              ))}
            </div>

            {/* Product Gallery */}
            {images.length > 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: isMobile ? 8 : 12, marginTop: isMobile ? 32 : 48 }}>
                {images.slice(0, 6).map((img, idx) => (
                  <div key={idx} style={{ aspectRatio: '1', borderRadius: cardRadius, overflow: 'hidden' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkout */}
          <div style={{ position: isMobile ? 'relative' : 'sticky', top: isMobile ? 0 : 90 }}>
            <EmbeddedCheckout
              storeSlug={storeSlug}
              product={mainProduct as any}
              formatPrice={formatPrice}
              theme={checkoutTheme}
              disabled={canManage}
              heading={ctaText}
              subheading={canManage ? 'Disabled in editor' : (asString(s.template_checkout_subheading) || 'Begin your transformation today')}
            />

            {/* Trust note */}
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <p style={{ fontSize: isMobile ? 11 : 12, color: muted, fontFamily: 'Inter, system-ui, sans-serif' }}>
                {asString(s.template_trust_text) || '✓ Free shipping • ✓ Easy returns • ✓ Secure checkout'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={(e) => { stopIfManage(e); onSelect('layout.footer'); }}
        style={{ borderTop: `1px solid ${border}`, padding: `${baseSpacing * 2}px ${baseSpacing}px`, textAlign: 'center' }}
      >
        <p
          data-edit-path="layout.footer.copyright"
          onClick={(e) => { stopIfManage(e); onSelect('layout.footer.copyright'); }}
          style={{ fontSize: isMobile ? 11 : 13, color: muted, fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          {asString(s.template_copyright) || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`}
        </p>
      </footer>
    </div>
  );
}
