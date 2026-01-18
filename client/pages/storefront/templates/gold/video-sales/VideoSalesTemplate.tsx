import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * VIDEO SALES - Video-first landing page with autoplay hero, feature bullets, and urgent CTA.
 * Design: Large video/image hero with play button, benefit bullets, video testimonials style.
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

export default function VideoSalesTemplate(props: TemplateProps) {
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

  // Theme - Dark/cinematic
  const bg = asString(settings.template_bg_color) || '#0f0f0f';
  const text = asString(settings.template_text_color) || '#ffffff';
  const muted = asString(settings.template_muted_color) || '#a1a1aa';
  const accent = asString(settings.template_accent_color) || '#f43f5e';
  const cardBg = asString((settings as any).template_card_bg) || '#1a1a1a';
  const border = 'rgba(255,255,255,0.1)';

  // Content
  const storeName = asString(settings.store_name) || 'Video Sales';
  const heroTitle = asString(settings.template_hero_heading) || 'Watch How This Product Changes Everything';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'See real results in just 2 minutes. Over 100,000 people have already made the switch.';
  const ctaText = asString(settings.template_button_text) || 'Get Started Now';
  const videoUrl = asString((settings as any).hero_video_url) || '';

  // Spacing
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 56, 24, 96);
  const cardRadius = resolveInt(settings.template_card_border_radius, 16, 0, 32);

  // Products
  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];
  const mainProduct = products[0];
  const storeSlug = asString((settings as any).store_slug);
  const priceValue = mainProduct ? safePrice((mainProduct as any).price) : 0;
  const originalValue = mainProduct ? safePrice((mainProduct as any).original_price) : 0;

  const checkoutTheme = { bg: cardBg, text, muted, accent, cardBg, border };

  const [isPlaying, setIsPlaying] = React.useState(false);

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
      style={{ minHeight: '100vh', background: bg, color: text, fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      {/* Header - Minimal */}
      <header
        data-edit-path="layout.header"
        onClick={(e) => { stopIfManage(e); onSelect('layout.header'); }}
        style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(15,15,15,0.95)', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${border}`, padding: '12px 20px' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt={storeName} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: 8, background: accent, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 16 }}>
                {storeName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <span style={{ fontWeight: 800, fontSize: 15 }}>{storeName}</span>
          </div>
          <button
            data-edit-path="layout.hero.cta"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.cta'); }}
            style={{ background: accent, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
          >
            {ctaText}
          </button>
        </div>
      </header>

      {/* Video Hero Section */}
      <section
        data-edit-path="layout.hero"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Video Player Area */}
          <div
            data-edit-path="layout.hero.image"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
            style={{
              position: 'relative',
              borderRadius: cardRadius,
              overflow: 'hidden',
              background: '#000',
              aspectRatio: '16/9',
              marginBottom: 32,
            }}
          >
            {videoUrl && isPlaying ? (
              <iframe
                src={videoUrl}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            ) : (
              <>
                <img src={productImage(mainProduct)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
                {/* Play Button Overlay */}
                <div
                  onClick={(e) => { if (!canManage) { e.stopPropagation(); setIsPlaying(true); } }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.3)',
                    cursor: videoUrl ? 'pointer' : 'default',
                  }}
                >
                  <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: accent,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 32,
                    boxShadow: '0 0 40px rgba(244,63,94,0.5)',
                  }}>
                    ▶
                  </div>
                  <div style={{ marginTop: 16, fontWeight: 700, fontSize: 14 }}>
                    {videoUrl ? 'Click to Watch' : 'Add Video URL in Editor'}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Title + Content */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 400px', gap: 40, alignItems: 'start' }}>
            <div>
              <h1
                data-edit-path="layout.hero.title"
                onClick={(e) => { stopIfManage(e); onSelect('layout.hero.title'); }}
                style={{ fontSize: isMobile ? 28 : 40, fontWeight: 900, lineHeight: 1.15, marginBottom: 16 }}
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

              {/* Feature Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 32 }}>
                {['⚡ Instant Results', '🎯 Easy to Use', '💎 Premium Quality', '🚀 Fast Shipping'].map((pill) => (
                  <span key={pill} style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: `1px solid ${border}`,
                    borderRadius: 999,
                    padding: '10px 18px',
                    fontSize: 13,
                    fontWeight: 600,
                  }}>
                    {pill}
                  </span>
                ))}
              </div>

              {/* Benefit Bullets */}
              <div style={{ display: 'grid', gap: 16 }}>
                {[
                  { icon: '✓', title: 'See results in 24 hours', desc: 'Most customers notice a difference immediately' },
                  { icon: '✓', title: 'Used by 100,000+ people', desc: 'Join our community of satisfied customers' },
                  { icon: '✓', title: '30-day money back guarantee', desc: 'Try it risk-free with full refund protection' },
                ].map((benefit) => (
                  <div key={benefit.title} style={{ display: 'flex', gap: 14 }}>
                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: accent, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, flexShrink: 0 }}>
                      {benefit.icon}
                    </span>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 2 }}>{benefit.title}</div>
                      <div style={{ fontSize: 13, color: muted }}>{benefit.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Checkout */}
            <div style={{ position: isMobile ? 'relative' : 'sticky', top: 90 }}>
              {/* Price display */}
              {mainProduct && (
                <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: `${cardRadius}px ${cardRadius}px 0 0`, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                    <span style={{ fontSize: 32, fontWeight: 900, color: accent }}>{formatPrice(priceValue)}</span>
                    {originalValue > priceValue && (
                      <span style={{ fontSize: 18, color: muted, textDecoration: 'line-through' }}>{formatPrice(originalValue)}</span>
                    )}
                  </div>
                  {originalValue > priceValue && (
                    <div style={{ fontSize: 13, color: '#22c55e', fontWeight: 600, marginTop: 4 }}>
                      Save {formatPrice(originalValue - priceValue)} today!
                    </div>
                  )}
                </div>
              )}
              
              <EmbeddedCheckout
                storeSlug={storeSlug}
                product={mainProduct as any}
                formatPrice={formatPrice}
                theme={checkoutTheme}
                disabled={canManage}
                heading={ctaText}
                subheading={canManage ? 'Disabled in editor' : '🔒 Secure checkout'}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section style={{ padding: `${sectionSpacing * 0.7}px ${baseSpacing}px`, background: cardBg, borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 24, textAlign: 'center' }}>
          {[
            { value: '100K+', label: 'Happy Customers' },
            { value: '4.9★', label: 'Average Rating' },
            { value: '500K+', label: 'Video Views' },
            { value: '24h', label: 'Fast Delivery' },
          ].map((stat) => (
            <div key={stat.label}>
              <div style={{ fontSize: 28, fontWeight: 900, color: accent }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: muted, marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Video Testimonials Style */}
      <section
        data-edit-path="layout.featured"
        onClick={(e) => { stopIfManage(e); onSelect('layout.featured'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2
            data-edit-path="layout.featured.title"
            onClick={(e) => { stopIfManage(e); onSelect('layout.featured.title'); }}
            style={{ fontSize: 28, fontWeight: 900, textAlign: 'center', marginBottom: 40 }}
          >
            What People Are Saying
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { name: 'Karim A.', text: 'This video convinced me to buy. Best decision ever!', avatar: '👨' },
              { name: 'Nadia S.', text: 'Exactly as shown in the video. Amazing quality!', avatar: '👩' },
              { name: 'Youssef M.', text: 'I watched the demo 3 times before ordering. Worth it!', avatar: '👨' },
            ].map((review, i) => (
              <div key={i} style={{ background: cardBg, borderRadius: cardRadius, padding: 20, border: `1px solid ${border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg, ${accent}44, ${accent}22)`, display: 'grid', placeItems: 'center', fontSize: 22 }}>
                    {review.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{review.name}</div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[1, 2, 3, 4, 5].map((s) => <span key={s} style={{ color: '#facc15', fontSize: 12 }}>★</span>)}
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: muted }}>"{review.text}"</p>
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
          style={{ fontSize: 13, color: muted }}
        >
          {asString((settings as any).template_copyright) || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`}
        </p>
      </footer>
    </div>
  );
}
