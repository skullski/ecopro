import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * CINEMATIC HERO - Full-screen cinematic landing page with immersive experience.
 * Design: Full-bleed imagery, parallax effects, dramatic typography, movie-like feel.
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

export default function CinematicHeroTemplate(props: TemplateProps) {
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

  // Theme - Deep cinematic dark
  const bg = asString(settings.template_bg_color) || '#0a0a0a';
  const text = asString(settings.template_text_color) || '#fafafa';
  const muted = asString(settings.template_muted_color) || '#a3a3a3';
  const accent = asString(settings.template_accent_color) || '#dc2626';
  const cardBg = asString((settings as any).template_card_bg) || '#171717';
  const border = 'rgba(255,255,255,0.1)';

  // Content
  const storeName = asString(settings.store_name) || 'Cinematic';
  const heroTitle = asString(settings.template_hero_heading) || 'Experience the Extraordinary';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Where premium quality meets unforgettable moments. This is not just a product—it\'s a masterpiece.';
  const ctaText = asString(settings.template_button_text) || 'Begin Your Journey';

  // Spacing
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 60, 24, 96);
  const cardRadius = resolveInt(settings.template_card_border_radius, 8, 0, 32);

  // Products
  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];
  const mainProduct = products[0];
  const storeSlug = asString((settings as any).store_slug);
  const heroImageUrl = asString(settings.banner_url) || productImage(mainProduct);

  const checkoutTheme = { bg, text, muted, accent, cardBg, border };

  const stopIfManage = (e: React.MouseEvent) => {
    if (!canManage) return;
    e.preventDefault();
    e.stopPropagation();
  };

  // Scroll effect
  const [scrollY, setScrollY] = React.useState(0);
  React.useEffect(() => {
    if (canManage) return;
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [canManage]);

  return (
    <div
      data-edit-path="__root"
      onClick={() => canManage && onSelect('__root')}
      className="ecopro-storefront"
      style={{ minHeight: '100vh', background: bg, color: text, fontFamily: '"Playfair Display", Georgia, serif' }}
    >
      {/* Floating Header */}
      <header
        data-edit-path="layout.header"
        onClick={(e) => { stopIfManage(e); onSelect('layout.header'); }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          padding: '20px 30px',
          background: `rgba(10,10,10,${Math.min(scrollY / 300, 0.9)})`,
          backdropFilter: 'blur(10px)',
          transition: 'background 0.3s',
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt={storeName} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 44, height: 44, borderRadius: 8, background: accent, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 20, fontFamily: 'sans-serif' }}>
                {storeName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>{storeName}</span>
          </div>
          <button
            data-edit-path="layout.hero.cta"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.cta'); }}
            style={{
              background: accent,
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '12px 28px',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 12,
              letterSpacing: 2,
              textTransform: 'uppercase',
              fontFamily: 'sans-serif',
            }}
          >
            {ctaText}
          </button>
        </div>
      </header>

      {/* Hero - Full Screen */}
      <section
        data-edit-path="layout.hero"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero'); }}
        style={{ position: 'relative', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
      >
        {/* Background Image with Parallax */}
        <div
          data-edit-path="layout.hero.image"
          onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
          style={{
            position: 'absolute',
            inset: -50,
            transform: `translateY(${scrollY * 0.3}px)`,
            background: `url(${heroImageUrl}) center/cover no-repeat`,
          }}
        />
        
        {/* Gradient Overlays */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to right, ${accent}15, transparent)` }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: baseSpacing, maxWidth: 900 }}>
          <div
            data-edit-path="layout.hero.badge"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.badge'); }}
            style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '10px 24px',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: 'uppercase',
              marginBottom: 30,
              fontFamily: 'sans-serif',
            }}
          >
            ★ PREMIUM COLLECTION 2025
          </div>

          <h1
            data-edit-path="layout.hero.title"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.title'); }}
            style={{
              fontSize: isMobile ? 40 : 72,
              fontWeight: 400,
              lineHeight: 1.1,
              marginBottom: 24,
              fontStyle: 'italic',
            }}
          >
            {heroTitle}
          </h1>

          <p
            data-edit-path="layout.hero.subtitle"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.subtitle'); }}
            style={{
              fontSize: 18,
              color: 'rgba(255,255,255,0.8)',
              lineHeight: 1.8,
              maxWidth: 600,
              margin: '0 auto 40px',
              fontFamily: 'sans-serif',
              fontWeight: 300,
            }}
          >
            {heroSubtitle}
          </p>

          <button
            style={{
              background: accent,
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '16px 48px',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 13,
              letterSpacing: 2,
              textTransform: 'uppercase',
              fontFamily: 'sans-serif',
            }}
          >
            Discover Now
          </button>
        </div>

        {/* Scroll Indicator */}
        <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
          <div style={{ fontSize: 10, letterSpacing: 3, marginBottom: 10, fontFamily: 'sans-serif', opacity: 0.6 }}>SCROLL</div>
          <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.3)', margin: '0 auto' }}>
            <div style={{ width: 1, height: 20, background: '#fff', animation: 'pulse 2s infinite' }} />
          </div>
        </div>
      </section>

      {/* Film Strip Divider */}
      <div style={{ background: '#000', padding: '20px 0', borderTop: `3px solid ${accent}`, borderBottom: `3px solid ${accent}` }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 60 }}>
          {['CRAFTED', 'PREMIUM', 'AUTHENTIC', 'TIMELESS'].map((word) => (
            <span key={word} style={{ fontSize: 11, letterSpacing: 4, fontWeight: 700, color: 'rgba(255,255,255,0.6)', fontFamily: 'sans-serif' }}>
              {word}
            </span>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <section
        data-edit-path="layout.featured"
        onClick={(e) => { stopIfManage(e); onSelect('layout.featured'); }}
        style={{ padding: `${sectionSpacing * 1.5}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2
            data-edit-path="layout.featured.title"
            onClick={(e) => { stopIfManage(e); onSelect('layout.featured.title'); }}
            style={{ fontSize: isMobile ? 32 : 48, fontWeight: 400, fontStyle: 'italic', textAlign: 'center', marginBottom: 60 }}
          >
            The Art of Excellence
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 40 }}>
            {[
              { icon: '◆', title: 'Masterful Craft', desc: 'Every detail meticulously perfected by master artisans.' },
              { icon: '◈', title: 'Rare Materials', desc: 'Sourced from the finest origins across the globe.' },
              { icon: '◇', title: 'Timeless Design', desc: 'An aesthetic that transcends trends and eras.' },
            ].map((feat, i) => (
              <div key={i} style={{ textAlign: 'center', padding: 30 }}>
                <div style={{ fontSize: 32, color: accent, marginBottom: 20 }}>{feat.icon}</div>
                <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12, fontFamily: 'sans-serif' }}>{feat.title}</h3>
                <p style={{ fontSize: 14, color: muted, lineHeight: 1.7, fontFamily: 'sans-serif' }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, background: cardBg }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div>
            <img src={productImage(mainProduct)} alt="Product" style={{ width: '100%', borderRadius: cardRadius, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }} />
          </div>
          <div>
            <span style={{ fontSize: 11, letterSpacing: 3, color: accent, fontWeight: 700, fontFamily: 'sans-serif' }}>FEATURED</span>
            <h3 style={{ fontSize: 36, fontStyle: 'italic', marginTop: 12, marginBottom: 20 }}>
              {mainProduct?.name || 'The Masterpiece'}
            </h3>
            <p style={{ fontSize: 15, color: muted, lineHeight: 1.8, marginBottom: 30, fontFamily: 'sans-serif' }}>
              A creation that embodies perfection. Crafted with passion, designed for those who appreciate the extraordinary.
            </p>
            <div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'sans-serif', marginBottom: 30 }}>
              {mainProduct ? formatPrice(mainProduct.price) : '$199.00'}
            </div>
            <EmbeddedCheckout
              storeSlug={storeSlug}
              product={mainProduct as any}
              formatPrice={formatPrice}
              theme={checkoutTheme}
              disabled={canManage}
              heading={ctaText}
              subheading={canManage ? 'Disabled in editor' : 'Limited availability'}
            />
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section style={{ padding: `${sectionSpacing * 1.5}px ${baseSpacing}px`, textAlign: 'center' }}>
        <blockquote style={{ maxWidth: 800, margin: '0 auto', fontSize: isMobile ? 24 : 36, fontStyle: 'italic', lineHeight: 1.5, opacity: 0.9 }}>
          "This isn't just a purchase. It's an investment in excellence."
        </blockquote>
        <cite style={{ display: 'block', marginTop: 24, fontSize: 13, letterSpacing: 2, color: muted, fontFamily: 'sans-serif' }}>
          — A SATISFIED COLLECTOR
        </cite>
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
          style={{ fontSize: 11, color: muted, letterSpacing: 2, fontFamily: 'sans-serif' }}
        >
          {asString((settings as any).template_copyright) || `© ${new Date().getFullYear()} ${storeName}. ALL RIGHTS RESERVED.`}
        </p>
      </footer>
    </div>
  );
}
