import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * BEFORE AFTER - Transformation-focused landing page with before/after slider and results.
 * Design: Split comparison, transformation stories, dramatic results display.
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

export default function BeforeAfterTemplate(props: TemplateProps) {
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

  // Theme - Clean with orange accent
  const bg = asString(settings.template_bg_color) || '#ffffff';
  const text = asString(settings.template_text_color) || '#171717';
  const muted = asString(settings.template_muted_color) || '#737373';
  const accent = asString(settings.template_accent_color) || '#f97316';
  const cardBg = asString((settings as any).template_card_bg) || '#ffffff';
  const border = 'rgba(0,0,0,0.08)';

  // Content
  const storeName = asString(settings.store_name) || 'Before After';
  const heroTitle = asString(settings.template_hero_heading) || 'See the Transformation';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Real results from real customers. Discover the difference our product makes.';
  const ctaText = asString(settings.template_button_text) || 'Get Your Transformation';

  // Spacing
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 60, 24, 96);
  const cardRadius = resolveInt(settings.template_card_border_radius, 16, 0, 32);

  // Products
  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];
  const mainProduct = products[0];
  const storeSlug = asString((settings as any).store_slug);

  const checkoutTheme = { bg, text, muted, accent, cardBg, border };

  // Before/After slider
  const [sliderPosition, setSliderPosition] = React.useState(50);

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
      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={(e) => { stopIfManage(e); onSelect('layout.header'); }}
        style={{ position: 'sticky', top: 0, zIndex: 30, background: bg, borderBottom: `1px solid ${border}`, padding: '14px 20px' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt={storeName} style={{ width: 38, height: 38, borderRadius: 10, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 38, height: 38, borderRadius: 10, background: accent, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 16 }}>
                {storeName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <span style={{ fontWeight: 800, fontSize: 15 }}>{storeName}</span>
          </div>
          <button
            data-edit-path="layout.hero.cta"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.cta'); }}
            style={{ background: accent, color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
          >
            {ctaText}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section
        data-edit-path="layout.hero"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <div
            data-edit-path="layout.hero.badge"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.badge'); }}
            style={{ display: 'inline-block', background: `${accent}15`, color: accent, padding: '8px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 20 }}
          >
            ✨ Real Results Guaranteed
          </div>
          
          <h1
            data-edit-path="layout.hero.title"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.title'); }}
            style={{ fontSize: isMobile ? 32 : 48, fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}
          >
            {heroTitle}
          </h1>
          
          <p
            data-edit-path="layout.hero.subtitle"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.subtitle'); }}
            style={{ fontSize: 17, color: muted, lineHeight: 1.6, maxWidth: 600, margin: '0 auto 40px' }}
          >
            {heroSubtitle}
          </p>
        </div>

        {/* Before/After Comparison */}
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div
            data-edit-path="layout.hero.image"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
            style={{ position: 'relative', borderRadius: cardRadius, overflow: 'hidden', aspectRatio: '16/10', background: '#f5f5f5' }}
          >
            {/* After image (full) */}
            <img src={productImage(mainProduct)} alt="After" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            
            {/* Before image (clipped) */}
            <div style={{ position: 'absolute', inset: 0, width: `${sliderPosition}%`, overflow: 'hidden' }}>
              <img 
                src={productImage(mainProduct)} 
                alt="Before" 
                style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  width: `${800 / (sliderPosition / 100)}px`, 
                  maxWidth: 'none',
                  height: '100%', 
                  objectFit: 'cover',
                  filter: 'grayscale(100%) brightness(0.7)',
                }} 
              />
              <div style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                BEFORE
              </div>
            </div>

            {/* After label */}
            <div style={{ position: 'absolute', top: 16, right: 16, background: accent, color: '#fff', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
              AFTER
            </div>

            {/* Slider handle */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${sliderPosition}%`,
                transform: 'translateX(-50%)',
                width: 4,
                background: '#fff',
                cursor: 'ew-resize',
                boxShadow: '0 0 10px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: '#fff',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                display: 'grid',
                placeItems: 'center',
                fontSize: 16,
              }}>
                ↔
              </div>
            </div>

            {/* Slider input */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'ew-resize',
              }}
            />
          </div>
          <p style={{ textAlign: 'center', fontSize: 13, color: muted, marginTop: 12 }}>
            ← Drag to compare before and after →
          </p>
        </div>
      </section>

      {/* Results Stats */}
      <section style={{ padding: `${sectionSpacing * 0.7}px ${baseSpacing}px`, background: '#fafafa' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 24, textAlign: 'center' }}>
          {[
            { value: '95%', label: 'Saw Results' },
            { value: '2 Weeks', label: 'Average Time' },
            { value: '50K+', label: 'Transformations' },
            { value: '4.9★', label: 'Rating' },
          ].map((stat) => (
            <div key={stat.label}>
              <div style={{ fontSize: 32, fontWeight: 900, color: accent }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: muted, marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Transformation Stories */}
      <section
        data-edit-path="layout.featured"
        onClick={(e) => { stopIfManage(e); onSelect('layout.featured'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2
            data-edit-path="layout.featured.title"
            onClick={(e) => { stopIfManage(e); onSelect('layout.featured.title'); }}
            style={{ fontSize: 28, fontWeight: 900, textAlign: 'center', marginBottom: 40 }}
          >
            Real Transformation Stories
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { name: 'Amina K.', result: 'Complete transformation in just 3 weeks!', before: '😔', after: '😍' },
              { name: 'Youssef M.', result: 'I couldn\'t believe the difference. Amazing!', before: '😕', after: '🤩' },
              { name: 'Fatima R.', result: 'Best purchase I ever made. Life changing!', before: '😢', after: '😄' },
            ].map((story, i) => (
              <div key={i} style={{ background: cardBg, borderRadius: cardRadius, padding: 24, border: `1px solid ${border}` }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 20 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#f5f5f5', display: 'grid', placeItems: 'center', fontSize: 28, margin: '0 auto 8px' }}>
                      {story.before}
                    </div>
                    <span style={{ fontSize: 11, color: muted }}>Before</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: 20, color: accent }}>→</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: `${accent}15`, display: 'grid', placeItems: 'center', fontSize: 28, margin: '0 auto 8px' }}>
                      {story.after}
                    </div>
                    <span style={{ fontSize: 11, color: accent, fontWeight: 600 }}>After</span>
                  </div>
                </div>
                <p style={{ textAlign: 'center', fontSize: 14, marginBottom: 12 }}>"{story.result}"</p>
                <p style={{ textAlign: 'center', fontWeight: 700, fontSize: 13 }}>{story.name}</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 8 }}>
                  {[1, 2, 3, 4, 5].map((s) => <span key={s} style={{ color: '#facc15', fontSize: 14 }}>★</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Checkout Section */}
      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, background: '#fafafa' }}>
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, textAlign: 'center', marginBottom: 8 }}>
            Start Your Transformation
          </h2>
          <p style={{ textAlign: 'center', color: muted, marginBottom: 24 }}>
            Join thousands who have already transformed their lives
          </p>
          
          <EmbeddedCheckout
            storeSlug={storeSlug}
            product={mainProduct as any}
            formatPrice={formatPrice}
            theme={checkoutTheme}
            disabled={canManage}
            heading={ctaText}
            subheading={canManage ? 'Disabled in editor' : '30-day money-back guarantee'}
          />
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
