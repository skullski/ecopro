import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * BEFORE AFTER - Transformation comparison landing page with slider effect.
 * Design: Before/after comparisons, transformation stories, grayscale to color effect.
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

export default function BeforeAfterTemplate(props: TemplateProps) {
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

  // Slider position state
  const [sliderPos, setSliderPos] = React.useState(50);

  // Theme colors
  const bg = asString(s.template_bg_color) || '#ffffff';
  const text = asString(s.template_text_color) || '#1a1a1a';
  const muted = asString(s.template_muted_color) || '#666666';
  const accent = asString(s.template_accent_color) || '#6366f1';
  const cardBg = asString(s.template_card_bg) || '#ffffff';
  const border = 'rgba(0,0,0,0.08)';

  // EDITABLE Content from settings
  const storeName = asString(s.store_name) || 'Before After';
  const heroTitle = asString(s.template_hero_heading) || 'See the Transformation';
  const heroSubtitle = asString(s.template_hero_subtitle) || 'Drag the slider to reveal the incredible before and after results. Real customers, real transformations.';
  const ctaText = asString(s.template_button_text) || 'Get Your Results';
  const heroKicker = asString(s.template_hero_kicker) || 'PROVEN RESULTS';

  // Before/After labels (editable)
  const beforeLabel = asString(s.template_before_label) || 'BEFORE';
  const afterLabel = asString(s.template_after_label) || 'AFTER';

  // Stats (editable)
  const stat1Value = asString(s.template_stat1_value) || '93%';
  const stat1Label = asString(s.template_stat1_label) || 'Saw visible results';
  const stat2Value = asString(s.template_stat2_value) || '4 Weeks';
  const stat2Label = asString(s.template_stat2_label) || 'Average time to results';
  const stat3Value = asString(s.template_stat3_value) || '50K+';
  const stat3Label = asString(s.template_stat3_label) || 'Happy customers';

  // Transformation stories (editable)
  const story1Name = asString(s.template_story1_name) || 'Mohamed K.';
  const story1Before = asString(s.template_story1_before) || 'Struggled for years with no results';
  const story1After = asString(s.template_story1_after) || 'Complete transformation in just 30 days';
  const story2Name = asString(s.template_story2_name) || 'Fatima S.';
  const story2Before = asString(s.template_story2_before) || 'Tried everything, nothing worked';
  const story2After = asString(s.template_story2_after) || 'Finally found what actually works';

  // Section title (editable)
  const storiesTitle = asString(s.template_section_title) || 'Real Customer Transformations';

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

  const stats = [
    { value: stat1Value, label: stat1Label },
    { value: stat2Value, label: stat2Label },
    { value: stat3Value, label: stat3Label },
  ];

  const stories = [
    { name: story1Name, before: story1Before, after: story1After },
    { name: story2Name, before: story2Before, after: story2After },
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

          {/* Before/After Slider */}
          <div
            data-edit-path="layout.hero.image"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
            style={{
              position: 'relative',
              maxWidth: 800,
              margin: '0 auto',
              borderRadius: cardRadius,
              overflow: 'hidden',
              border: `1px solid ${border}`,
              marginBottom: isMobile ? 24 : 36,
            }}
          >
            {/* After Image (full color) */}
            <img src={images[activeImage] || images[0]} alt="" style={{ width: '100%', aspectRatio: isMobile ? '4/3' : '16/10', objectFit: 'cover', display: 'block' }} />
            
            {/* Before Image (grayscale, clipped) */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: `${100 - sliderPos}%`,
              bottom: 0,
              overflow: 'hidden',
            }}>
              <img 
                src={images[activeImage] || images[0]} 
                alt="" 
                style={{ 
                  width: `${800 / (sliderPos / 100)}%`,
                  maxWidth: 'none',
                  aspectRatio: isMobile ? '4/3' : '16/10', 
                  objectFit: 'cover', 
                  filter: 'grayscale(100%) brightness(0.85)',
                }} 
              />
            </div>

            {/* Slider Handle */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${sliderPos}%`,
                transform: 'translateX(-50%)',
                width: 4,
                background: '#fff',
                boxShadow: '0 0 10px rgba(0,0,0,0.3)',
                cursor: 'ew-resize',
                zIndex: 10,
              }}
            >
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: isMobile ? 36 : 44,
                height: isMobile ? 36 : 44,
                borderRadius: '50%',
                background: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isMobile ? 12 : 14,
              }}>
                ⟷
              </div>
            </div>

            {/* Labels */}
            <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '4px 10px', borderRadius: 4, fontSize: isMobile ? 10 : 12, fontWeight: 700 }}>
              {beforeLabel}
            </div>
            <div style={{ position: 'absolute', top: 12, right: 12, background: accent, color: '#fff', padding: '4px 10px', borderRadius: 4, fontSize: isMobile ? 10 : 12, fontWeight: 700 }}>
              {afterLabel}
            </div>

            {/* Slider Input */}
            <input
              type="range"
              min="5"
              max="95"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'ew-resize',
                zIndex: 20,
              }}
            />
          </div>

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: isMobile ? 24 : 36 }}>
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

          {/* Stats */}
          <div
            data-edit-path="layout.hero.badge"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.badge'); }}
            style={{ display: 'flex', justifyContent: 'center', gap: isMobile ? 24 : 48, marginBottom: isMobile ? 32 : 48 }}
          >
            {stats.map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: isMobile ? 24 : 36, fontWeight: 900, color: accent }}>{stat.value}</div>
                <div style={{ fontSize: isMobile ? 11 : 13, color: muted }}>{stat.label}</div>
              </div>
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
              heading={ctaText}
              subheading={canManage ? 'Disabled in editor' : (asString(s.template_checkout_subheading) || 'Start your transformation today')}
            />
          </div>
        </div>
      </section>

      {/* Transformation Stories */}
      <section
        data-edit-path="layout.featured"
        onClick={(e) => { stopIfManage(e); onSelect('layout.featured'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, background: '#f9fafb' }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2
            data-edit-path="layout.featured.title"
            onClick={(e) => { stopIfManage(e); onSelect('layout.featured.title'); }}
            style={{ fontSize: isMobile ? 20 : 28, fontWeight: 900, textAlign: 'center', marginBottom: isMobile ? 28 : 40 }}
          >
            {storiesTitle}
          </h2>

          <div
            data-edit-path="layout.categories"
            onClick={(e) => { stopIfManage(e); onSelect('layout.categories'); }}
            style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: isMobile ? 16 : 24 }}
          >
            {stories.map((story) => (
              <div key={story.name} style={{ background: cardBg, borderRadius: cardRadius, overflow: 'hidden', border: `1px solid ${border}` }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                  <div style={{ padding: isMobile ? 14 : 20, background: '#f3f4f6', borderRight: `1px solid ${border}` }}>
                    <div style={{ fontSize: isMobile ? 9 : 11, fontWeight: 700, color: muted, marginBottom: 8 }}>{beforeLabel}</div>
                    <p style={{ fontSize: isMobile ? 12 : 14, color: text }}>{story.before}</p>
                  </div>
                  <div style={{ padding: isMobile ? 14 : 20, background: `${accent}08` }}>
                    <div style={{ fontSize: isMobile ? 9 : 11, fontWeight: 700, color: accent, marginBottom: 8 }}>{afterLabel}</div>
                    <p style={{ fontSize: isMobile ? 12 : 14, color: text }}>{story.after}</p>
                  </div>
                </div>
                <div style={{ padding: isMobile ? '10px 14px' : '12px 20px', borderTop: `1px solid ${border}`, fontWeight: 700, fontSize: isMobile ? 12 : 14 }}>
                  {story.name}
                </div>
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
