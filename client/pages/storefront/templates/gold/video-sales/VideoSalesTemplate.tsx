import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * VIDEO SALES - Video-first landing page with cinematic dark theme.
 * Design: Large video player area, feature bullets, dark immersive experience.
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

export default function VideoSalesTemplate(props: TemplateProps) {
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

  // Theme colors - Dark cinematic
  const bg = asString(s.template_bg_color) || '#0a0a0a';
  const text = asString(s.template_text_color) || '#ffffff';
  const muted = asString(s.template_muted_color) || '#a1a1aa';
  const accent = asString(s.template_accent_color) || '#ef4444';
  const cardBg = asString(s.template_card_bg) || '#18181b';
  const border = 'rgba(255,255,255,0.08)';

  // EDITABLE Content from settings
  const storeName = asString(s.store_name) || 'Video Sales';
  const heroTitle = asString(s.template_hero_heading) || 'Watch How It Works';
  const heroSubtitle = asString(s.template_hero_subtitle) || 'See the product in action. This video reveals everything you need to know before making your decision.';
  const ctaText = asString(s.template_button_text) || 'Get Started Now';
  const videoUrl = asString(s.template_video_url) || '';
  const videoPosterText = asString(s.template_video_poster_text) || '▶ Watch the Video';

  // Key features (editable)
  const feature1 = asString(s.template_feature1_title) || 'Easy to use - no experience needed';
  const feature2 = asString(s.template_feature2_title) || 'Results in just 7 days or less';
  const feature3 = asString(s.template_feature3_title) || 'Backed by scientific research';
  const feature4 = asString(s.template_feature4_title) || 'Join 50,000+ satisfied customers';
  const feature5 = asString(s.template_feature5_title) || 'Full 30-day money back guarantee';
  const feature6 = asString(s.template_feature6_title) || 'Free express shipping included';

  // Stats (editable)
  const stat1Value = asString(s.template_stat1_value) || '2M+';
  const stat1Label = asString(s.template_stat1_label) || 'Views';
  const stat2Value = asString(s.template_stat2_value) || '50K+';
  const stat2Label = asString(s.template_stat2_label) || 'Customers';
  const stat3Value = asString(s.template_stat3_value) || '4.9★';
  const stat3Label = asString(s.template_stat3_label) || 'Rating';

  // Section title (editable)
  const featuresTitle = asString(s.template_section_title) || 'Why People Love This';

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

  const features = [feature1, feature2, feature3, feature4, feature5, feature6].filter(Boolean);

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
        style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${border}`, padding: isMobile ? '10px 12px' : '14px 20px' }}
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
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 24 : 36 }}>
            <h1
              data-edit-path="layout.hero.title"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.title'); }}
              style={{ fontSize: isMobile ? 28 : 48, fontWeight: 900, lineHeight: 1.1, marginBottom: 14 }}
            >
              {heroTitle}
            </h1>

            <p
              data-edit-path="layout.hero.subtitle"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.subtitle'); }}
              style={{ fontSize: isMobile ? 14 : 18, color: muted, lineHeight: 1.6, maxWidth: 600, margin: '0 auto' }}
            >
              {heroSubtitle}
            </p>
          </div>

          {/* Video Area */}
          <div
            data-edit-path="layout.hero.image"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
            style={{
              aspectRatio: isMobile ? '16/10' : '16/9',
              borderRadius: cardRadius,
              overflow: 'hidden',
              background: cardBg,
              marginBottom: isMobile ? 24 : 36,
              position: 'relative',
              border: `1px solid ${border}`,
            }}
          >
            {videoUrl ? (
              <iframe
                src={videoUrl}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <>
                <img src={images[activeImage] || images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                }}>
                  <div style={{
                    width: isMobile ? 64 : 80,
                    height: isMobile ? 64 : 80,
                    borderRadius: '50%',
                    background: accent,
                    display: 'grid',
                    placeItems: 'center',
                    margin: '0 auto 12px',
                    cursor: 'pointer',
                    boxShadow: `0 0 40px ${accent}66`,
                  }}>
                    <span style={{ fontSize: isMobile ? 24 : 32, marginLeft: 4 }}>▶</span>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: isMobile ? 12 : 14, color: '#fff' }}>{videoPosterText}</span>
                </div>
              </>
            )}
            {/* Thumbnail Gallery below video */}
            {images.length > 1 && !videoUrl && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, display: 'flex', gap: 8, overflowX: 'auto', background: 'rgba(0,0,0,0.7)' }}>
                {images.slice(0, 10).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { stopIfManage(e); setActiveImage(idx); }}
                    style={{
                      flex: '0 0 auto',
                      width: isMobile ? 40 : 50,
                      height: isMobile ? 40 : 50,
                      borderRadius: 6,
                      border: idx === activeImage ? `2px solid ${accent}` : '1px solid rgba(255,255,255,0.2)',
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

          {/* Stats Row */}
          <div
            data-edit-path="layout.hero.badge"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.badge'); }}
            style={{ display: 'flex', justifyContent: 'center', gap: isMobile ? 24 : 48, marginBottom: isMobile ? 32 : 48 }}
          >
            {[
              { value: stat1Value, label: stat1Label },
              { value: stat2Value, label: stat2Label },
              { value: stat3Value, label: stat3Label },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: isMobile ? 22 : 32, fontWeight: 900, color: accent }}>{stat.value}</div>
                <div style={{ fontSize: isMobile ? 10 : 12, color: muted }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 380px', gap: isMobile ? 24 : 40, alignItems: 'start' }}>
            
            {/* Features */}
            <div
              data-edit-path="layout.categories"
              onClick={(e) => { stopIfManage(e); onSelect('layout.categories'); }}
            >
              <h2
                data-edit-path="layout.featured.title"
                onClick={(e) => { stopIfManage(e); onSelect('layout.featured.title'); }}
                style={{ fontSize: isMobile ? 18 : 24, fontWeight: 900, marginBottom: isMobile ? 16 : 24 }}
              >
                {featuresTitle}
              </h2>

              <div style={{ display: 'grid', gap: isMobile ? 10 : 14 }}>
                {features.map((feature) => (
                  <div key={feature} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 12, 
                    background: cardBg, 
                    padding: isMobile ? '12px 14px' : '16px 20px', 
                    borderRadius: cardRadius,
                    border: `1px solid ${border}`,
                  }}>
                    <span style={{ 
                      width: isMobile ? 22 : 26, 
                      height: isMobile ? 22 : 26, 
                      borderRadius: '50%', 
                      background: accent, 
                      color: '#fff', 
                      display: 'grid', 
                      placeItems: 'center', 
                      fontSize: isMobile ? 10 : 12, 
                      fontWeight: 700 
                    }}>✓</span>
                    <span style={{ fontSize: isMobile ? 13 : 15, fontWeight: 500 }}>{feature}</span>
                  </div>
                ))}
              </div>
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
                subheading={canManage ? 'Disabled in editor' : (asString(s.template_checkout_subheading) || '🔒 Secure checkout • Instant access')}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section
        data-edit-path="layout.featured"
        onClick={(e) => { stopIfManage(e); onSelect('layout.featured'); }}
        style={{ padding: `${sectionSpacing * 0.7}px ${baseSpacing}px`, background: cardBg, borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: isMobile ? 12 : 14, color: muted, marginBottom: 16 }}>
            {asString(s.template_testimonial_title) || 'Trusted by thousands of customers worldwide'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: isMobile ? 8 : 12, flexWrap: 'wrap' }}>
            {['⭐⭐⭐⭐⭐', 'Verified Purchase', 'Fast Delivery', 'Easy Returns'].map((item) => (
              <span key={item} style={{ fontSize: isMobile ? 10 : 12, color: '#fff', background: 'rgba(255,255,255,0.1)', padding: isMobile ? '4px 10px' : '6px 14px', borderRadius: 20 }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Product Gallery Section */}
      {images.length > 1 && (
        <section
          data-edit-path="layout.grid"
          onClick={(e) => { stopIfManage(e); onSelect('layout.grid'); }}
          style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}
        >
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <h3 style={{ fontSize: isMobile ? 16 : 20, fontWeight: 800, textAlign: 'center', marginBottom: isMobile ? 20 : 28 }}>
              {asString(s.template_gallery_title) || 'Product Gallery'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? 8 : 12 }}>
              {images.slice(0, 8).map((img, idx) => (
                <div key={idx} style={{ borderRadius: cardRadius, overflow: 'hidden', border: `1px solid ${border}` }}>
                  <img src={img} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
