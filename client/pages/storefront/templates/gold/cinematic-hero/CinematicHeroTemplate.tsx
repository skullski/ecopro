import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * CINEMATIC HERO - Full-screen cinematic experience landing page.
 * Design: Full-bleed hero, parallax effect, Playfair Display typography, dramatic visuals.
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

export default function CinematicHeroTemplate(props: TemplateProps) {
  const { settings, formatPrice } = props;
  const s = settings as any;
  const canManage = Boolean(props.canManage);
  const onSelect = (path: string) => {
    if (canManage && typeof (props as any).onSelect === 'function') {
      (props as any).onSelect(path);
    }
  };

  const [isMobile, setIsMobile] = React.useState((props as any).forcedBreakpoint === 'mobile');
  const [scrollY, setScrollY] = React.useState(0);

  React.useEffect(() => {
    const bp = (props as any).forcedBreakpoint;
    if (bp) { setIsMobile(bp === 'mobile'); return; }
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [(props as any).forcedBreakpoint]);

  React.useEffect(() => {
    if (canManage) return;
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [canManage]);

  // Theme colors - Dark cinematic
  const bg = asString(s.template_bg_color) || '#0c0c0c';
  const text = asString(s.template_text_color) || '#ffffff';
  const muted = asString(s.template_muted_color) || '#a0a0a0';
  const accent = asString(s.template_accent_color) || '#d4af37';
  const cardBg = asString(s.template_card_bg) || '#1a1a1a';
  const border = 'rgba(255,255,255,0.1)';

  // EDITABLE Content from settings
  const storeName = asString(s.store_name) || 'Cinematic Hero';
  const heroTitle = asString(s.template_hero_heading) || 'Experience Excellence';
  const heroSubtitle = asString(s.template_hero_subtitle) || 'Discover the extraordinary. Crafted for those who demand nothing but the best.';
  const ctaText = asString(s.template_button_text) || 'Discover Now';
  const heroKicker = asString(s.template_hero_kicker) || 'INTRODUCING';

  // Tagline (editable)
  const tagline = asString(s.template_tagline) || 'Luxury Redefined';

  // Features (editable)
  const feature1 = asString(s.template_feature1_title) || 'Exceptional Quality';
  const feature1Desc = asString(s.template_feature1_desc) || 'Crafted with meticulous attention to every detail';
  const feature2 = asString(s.template_feature2_title) || 'Timeless Design';
  const feature2Desc = asString(s.template_feature2_desc) || 'Beauty that transcends trends and time';
  const feature3 = asString(s.template_feature3_title) || 'Exclusive Experience';
  const feature3Desc = asString(s.template_feature3_desc) || 'Join an elite community of discerning customers';

  // Section title (editable)
  const featuresTitle = asString(s.template_section_title) || 'The Experience';

  // Spacing
  const baseSpacing = resolveInt(s.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(s.template_section_spacing, 64, 24, 96);
  const cardRadius = resolveInt(s.template_card_border_radius, 8, 0, 32);
  const buttonRadius = resolveInt(s.template_button_border_radius, 4, 0, 50);

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

  const parallaxOffset = Math.min(scrollY * 0.3, 150);

  return (
    <div
      data-edit-path="__root"
      onClick={() => canManage && onSelect('__root')}
      className="ecopro-storefront"
      style={{ minHeight: '100vh', background: bg, color: text, fontFamily: '"Playfair Display", Georgia, serif' }}
    >
      {/* Minimal Header */}
      <header
        data-edit-path="layout.header"
        onClick={(e) => { stopIfManage(e); onSelect('layout.header'); }}
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          zIndex: 50, 
          padding: isMobile ? '16px 20px' : '24px 40px',
          background: scrollY > 100 ? 'rgba(12,12,12,0.95)' : 'transparent',
          backdropFilter: scrollY > 100 ? 'blur(16px)' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {asString(s.store_logo) ? (
              <img src={asString(s.store_logo)} alt={storeName} style={{ width: isMobile ? 36 : 44, height: isMobile ? 36 : 44, objectFit: 'cover' }} />
            ) : (
              <span style={{ fontWeight: 600, fontSize: isMobile ? 18 : 24, letterSpacing: 2 }}>{storeName}</span>
            )}
          </div>
          <button
            data-edit-path="layout.hero.cta"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.cta'); }}
            style={{ 
              background: 'transparent', 
              color: '#fff', 
              border: `1px solid ${accent}`, 
              borderRadius: buttonRadius, 
              padding: isMobile ? '8px 20px' : '10px 28px', 
              fontWeight: 500, 
              cursor: 'pointer', 
              fontSize: isMobile ? 11 : 13, 
              fontFamily: 'Inter, system-ui, sans-serif',
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            {ctaText}
          </button>
        </div>
      </header>

      {/* Full-Screen Hero */}
      <section
        data-edit-path="layout.hero"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero'); }}
        style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}
      >
        {/* Parallax Background */}
        <div
          data-edit-path="layout.hero.image"
          onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
          style={{ 
            position: 'absolute', 
            inset: 0, 
            transform: `translateY(${parallaxOffset}px)`,
          }}
        >
          <img 
            src={images[activeImage] || images[0]} 
            alt="" 
            style={{ 
              width: '100%', 
              height: '120%', 
              objectFit: 'cover',
            }} 
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%)' }} />
        </div>

        {/* Hero Content */}
        <div style={{ 
          position: 'relative', 
          zIndex: 10, 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          textAlign: 'center',
          padding: isMobile ? '0 20px' : '0 40px',
        }}>
          <div
            data-edit-path="layout.hero.kicker"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.kicker'); }}
            style={{ 
              fontSize: isMobile ? 10 : 13, 
              letterSpacing: 6, 
              textTransform: 'uppercase', 
              color: accent, 
              marginBottom: isMobile ? 16 : 24,
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            {heroKicker}
          </div>

          <h1
            data-edit-path="layout.hero.title"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.title'); }}
            style={{ 
              fontSize: isMobile ? 40 : 80, 
              fontWeight: 400, 
              lineHeight: 1.1, 
              marginBottom: isMobile ? 16 : 24,
              fontStyle: 'italic',
            }}
          >
            {heroTitle}
          </h1>

          <p
            data-edit-path="layout.hero.subtitle"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.subtitle'); }}
            style={{ 
              fontSize: isMobile ? 14 : 20, 
              color: 'rgba(255,255,255,0.8)', 
              lineHeight: 1.6, 
              maxWidth: 600,
              fontFamily: 'Inter, system-ui, sans-serif',
              marginBottom: isMobile ? 28 : 40,
            }}
          >
            {heroSubtitle}
          </p>

          <button
            style={{ 
              background: accent, 
              color: '#000', 
              border: 'none', 
              borderRadius: buttonRadius, 
              padding: isMobile ? '14px 32px' : '16px 48px', 
              fontWeight: 600, 
              cursor: 'pointer', 
              fontSize: isMobile ? 12 : 14, 
              fontFamily: 'Inter, system-ui, sans-serif',
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            {ctaText}
          </button>
        </div>

        {/* Scroll Indicator */}
        <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
          <div style={{ fontSize: isMobile ? 10 : 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8, fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: 2 }}>SCROLL</div>
          <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.3)', margin: '0 auto' }} />
        </div>

        {/* Thumbnail Gallery */}
        {images.length > 1 && (
          <div style={{ position: 'absolute', bottom: 40, right: 40, display: 'flex', gap: 8 }}>
            {images.slice(0, 5).map((img, idx) => (
              <button
                key={idx}
                onClick={(e) => { stopIfManage(e); setActiveImage(idx); }}
                style={{
                  width: isMobile ? 40 : 50,
                  height: isMobile ? 40 : 50,
                  border: idx === activeImage ? `2px solid ${accent}` : '1px solid rgba(255,255,255,0.3)',
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

      {/* Tagline Section */}
      <section
        data-edit-path="layout.hero.badge"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero.badge'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, background: cardBg, textAlign: 'center' }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ width: 60, height: 1, background: accent, margin: '0 auto 28px' }} />
          <p style={{ fontSize: isMobile ? 24 : 36, fontStyle: 'italic', color: text }}>{tagline}</p>
          <div style={{ width: 60, height: 1, background: accent, margin: '28px auto 0' }} />
        </div>
      </section>

      {/* Features + Checkout */}
      <section
        data-edit-path="layout.featured"
        onClick={(e) => { stopIfManage(e); onSelect('layout.featured'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 400px', gap: isMobile ? 40 : 64, alignItems: 'start' }}>
          
          {/* Features */}
          <div>
            <h2
              data-edit-path="layout.featured.title"
              onClick={(e) => { stopIfManage(e); onSelect('layout.featured.title'); }}
              style={{ fontSize: isMobile ? 28 : 40, fontWeight: 400, marginBottom: isMobile ? 32 : 48, fontStyle: 'italic' }}
            >
              {featuresTitle}
            </h2>

            <div
              data-edit-path="layout.categories"
              onClick={(e) => { stopIfManage(e); onSelect('layout.categories'); }}
              style={{ display: 'grid', gap: isMobile ? 28 : 40 }}
            >
              {features.map((f, idx) => (
                <div key={f.title} style={{ display: 'flex', gap: isMobile ? 16 : 24 }}>
                  <div style={{ 
                    width: isMobile ? 32 : 40, 
                    height: isMobile ? 32 : 40, 
                    borderRadius: '50%', 
                    border: `1px solid ${accent}`, 
                    display: 'grid', 
                    placeItems: 'center', 
                    fontSize: isMobile ? 14 : 16, 
                    color: accent,
                    flex: '0 0 auto',
                    fontFamily: 'Inter, system-ui, sans-serif',
                  }}>
                    {idx + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: isMobile ? 18 : 22, marginBottom: 8 }}>{f.title}</div>
                    <div style={{ fontSize: isMobile ? 13 : 15, color: muted, lineHeight: 1.6, fontFamily: 'Inter, system-ui, sans-serif' }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Gallery */}
            {images.length > 1 && (
              <div
                data-edit-path="layout.grid"
                onClick={(e) => { stopIfManage(e); onSelect('layout.grid'); }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: isMobile ? 8 : 12, marginTop: isMobile ? 40 : 56 }}
              >
                {images.slice(0, 6).map((img, idx) => (
                  <div key={idx} style={{ aspectRatio: '1', overflow: 'hidden' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkout */}
          <div style={{ position: isMobile ? 'relative' : 'sticky', top: isMobile ? 0 : 90 }}>
            <div style={{ border: `1px solid ${border}`, borderRadius: cardRadius }}>
              <EmbeddedCheckout
                storeSlug={storeSlug}
                product={mainProduct as any}
                formatPrice={formatPrice}
                theme={checkoutTheme}
                disabled={canManage}
                heading={ctaText}
                subheading={canManage ? 'Disabled in editor' : (asString(s.template_checkout_subheading) || 'Exclusive access awaits')}
              />
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
