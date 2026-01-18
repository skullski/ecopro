import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * RETROWAVE - Synthwave/80s aesthetic landing page.
 * Design: Synthwave sunset, retro grid floor, Press Start 2P font, neon colors.
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

export default function RetrowaveTemplate(props: TemplateProps) {
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

  // Theme colors - Synthwave
  const bg = asString(s.template_bg_color) || '#1a0a2e';
  const text = asString(s.template_text_color) || '#ffffff';
  const muted = asString(s.template_muted_color) || '#c084fc';
  const accent = asString(s.template_accent_color) || '#f472b6';
  const cardBg = asString(s.template_card_bg) || 'rgba(26,10,46,0.9)';
  const border = 'rgba(244,114,182,0.3)';
  const neonCyan = '#22d3ee';
  const neonPink = '#f472b6';
  const neonPurple = '#a855f7';

  // EDITABLE Content from settings
  const storeName = asString(s.store_name) || 'RETROWAVE';
  const heroTitle = asString(s.template_hero_heading) || 'RIDE THE NEON WAVE';
  const heroSubtitle = asString(s.template_hero_subtitle) || 'Experience the ultimate 80s nostalgia with our retro-futuristic collection.';
  const ctaText = asString(s.template_button_text) || 'START YOUR JOURNEY';
  const heroKicker = asString(s.template_hero_kicker) || 'WELCOME TO THE FUTURE';

  // Features (editable)
  const feature1 = asString(s.template_feature1_title) || '★ PREMIUM QUALITY';
  const feature2 = asString(s.template_feature2_title) || '★ FAST SHIPPING';
  const feature3 = asString(s.template_feature3_title) || '★ 24/7 SUPPORT';

  // Stats (editable)
  const stat1Value = asString(s.template_stat1_value) || '1985';
  const stat1Label = asString(s.template_stat1_label) || 'INSPIRED';
  const stat2Value = asString(s.template_stat2_value) || '∞';
  const stat2Label = asString(s.template_stat2_label) || 'VIBES';
  const stat3Value = asString(s.template_stat3_value) || '100%';
  const stat3Label = asString(s.template_stat3_label) || 'RADICAL';

  // Spacing
  const baseSpacing = resolveInt(s.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(s.template_section_spacing, 56, 24, 96);
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

  const stats = [
    { value: stat1Value, label: stat1Label },
    { value: stat2Value, label: stat2Label },
    { value: stat3Value, label: stat3Label },
  ];

  const features = [feature1, feature2, feature3].filter(Boolean);

  return (
    <div
      data-edit-path="__root"
      onClick={() => canManage && onSelect('__root')}
      className="ecopro-storefront"
      style={{ 
        minHeight: '100vh', 
        background: bg, 
        color: text, 
        fontFamily: '"Inter", system-ui, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Load Press Start 2P font */}
      <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />

      {/* Synthwave Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        {/* Sunset gradient */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '60%',
          background: `linear-gradient(180deg, 
            #1a0a2e 0%, 
            #2d1b4e 20%, 
            #4a1f6e 40%, 
            #7c2d8e 55%, 
            #c026d3 70%, 
            #f472b6 85%, 
            #fb923c 100%
          )`,
        }} />

        {/* Sun */}
        <div style={{
          position: 'absolute',
          top: '35%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: isMobile ? 150 : 250,
          height: isMobile ? 75 : 125,
          background: 'linear-gradient(180deg, #fbbf24, #f97316, #ef4444)',
          borderRadius: '200px 200px 0 0',
          boxShadow: `0 0 60px ${neonPink}60, 0 0 120px ${neonPink}30`,
        }}>
          {/* Sun lines */}
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: 4,
              background: '#1a0a2e',
              top: 20 + i * 12,
            }} />
          ))}
        </div>

        {/* Grid floor */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: '-50%',
          right: '-50%',
          height: '45%',
          background: `
            linear-gradient(transparent 0%, ${neonPink}40 2%, transparent 3%),
            linear-gradient(90deg, transparent 0%, ${neonCyan}40 1%, transparent 2%)
          `,
          backgroundSize: '100% 30px, 60px 100%',
          transform: 'perspective(200px) rotateX(60deg)',
          transformOrigin: 'top center',
        }} />
      </div>

      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={(e) => { stopIfManage(e); onSelect('layout.header'); }}
        style={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 30, 
          background: 'rgba(26,10,46,0.85)', 
          backdropFilter: 'blur(12px)',
          borderBottom: `2px solid ${neonPink}60`, 
          padding: isMobile ? '10px 12px' : '12px 20px' 
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ 
            fontFamily: '"Press Start 2P", cursive', 
            fontSize: isMobile ? 10 : 14, 
            background: `linear-gradient(90deg, ${neonCyan}, ${neonPink}, ${neonPurple})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {storeName}
          </span>
          <button
            data-edit-path="layout.hero.cta"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.cta'); }}
            style={{ 
              background: `linear-gradient(135deg, ${neonPink}, ${neonPurple})`, 
              color: '#fff', 
              border: 'none', 
              borderRadius: buttonRadius, 
              padding: isMobile ? '8px 16px' : '10px 24px', 
              fontWeight: 700, 
              cursor: 'pointer', 
              fontSize: isMobile ? 10 : 12,
              boxShadow: `0 0 20px ${neonPink}60`,
            }}
          >
            {ctaText}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section
        data-edit-path="layout.hero"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero'); }}
        style={{ position: 'relative', zIndex: 10, padding: isMobile ? `${sectionSpacing * 0.6}px ${baseSpacing}px` : `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Kicker */}
          <div
            data-edit-path="layout.hero.kicker"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.kicker'); }}
            style={{ 
              textAlign: 'center',
              marginBottom: isMobile ? 12 : 20,
              fontFamily: '"Press Start 2P", cursive',
              fontSize: isMobile ? 8 : 10,
              color: neonCyan,
              letterSpacing: 2,
              textShadow: `0 0 10px ${neonCyan}`,
            }}
          >
            {heroKicker}
          </div>

          {/* Title */}
          <h1
            data-edit-path="layout.hero.title"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.title'); }}
            style={{ 
              textAlign: 'center',
              fontFamily: '"Press Start 2P", cursive',
              fontSize: isMobile ? 20 : 40, 
              lineHeight: 1.4,
              marginBottom: isMobile ? 16 : 24,
              background: `linear-gradient(180deg, ${neonCyan} 0%, ${neonPink} 50%, ${neonPurple} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: `0 0 30px ${neonPink}40`,
            }}
          >
            {heroTitle}
          </h1>

          <p
            data-edit-path="layout.hero.subtitle"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.subtitle'); }}
            style={{ 
              textAlign: 'center',
              fontSize: isMobile ? 12 : 16, 
              color: muted, 
              maxWidth: 500, 
              margin: '0 auto',
              marginBottom: isMobile ? 24 : 36,
              lineHeight: 1.7,
            }}
          >
            {heroSubtitle}
          </p>

          {/* Stats */}
          <div
            data-edit-path="layout.hero.badge"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.badge'); }}
            style={{ 
              display: 'flex', 
              justifyContent: 'center',
              gap: isMobile ? 20 : 40, 
              marginBottom: isMobile ? 28 : 40,
            }}
          >
            {stats.map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontFamily: '"Press Start 2P", cursive',
                  fontSize: isMobile ? 16 : 24, 
                  color: neonCyan,
                  textShadow: `0 0 10px ${neonCyan}`,
                  marginBottom: 4,
                }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: isMobile ? 8 : 10, color: muted, letterSpacing: 1 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Main Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 380px', gap: isMobile ? 24 : 40, alignItems: 'start' }}>
            
            {/* Left: Product */}
            <div>
              {/* Product Image */}
              <div
                data-edit-path="layout.hero.image"
                onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
                style={{ 
                  position: 'relative', 
                  borderRadius: cardRadius, 
                  overflow: 'hidden', 
                  border: `3px solid ${neonPink}`,
                  boxShadow: `0 0 30px ${neonPink}40, inset 0 0 30px ${neonPurple}20`,
                  marginBottom: 16,
                  background: cardBg,
                }}
              >
                <img src={images[activeImage] || images[0]} alt="" style={{ width: '100%', aspectRatio: isMobile ? '4/3' : '16/10', objectFit: 'cover' }} />
                
                {/* Scan line overlay */}
                <div style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
                  pointerEvents: 'none',
                }} />

                {/* Corner badge */}
                <div style={{ 
                  position: 'absolute', 
                  top: 12, 
                  right: 12, 
                  background: neonPink,
                  color: '#fff',
                  padding: '6px 12px',
                  fontFamily: '"Press Start 2P", cursive',
                  fontSize: 8,
                  boxShadow: `0 0 10px ${neonPink}`,
                }}>
                  NEW!
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                  {images.slice(0, 10).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { stopIfManage(e); setActiveImage(idx); }}
                      style={{
                        width: isMobile ? 48 : 60,
                        height: isMobile ? 48 : 60,
                        borderRadius: 4,
                        border: idx === activeImage ? `2px solid ${neonCyan}` : `2px solid ${border}`,
                        padding: 0,
                        background: cardBg,
                        cursor: 'pointer',
                        overflow: 'hidden',
                        boxShadow: idx === activeImage ? `0 0 10px ${neonCyan}` : 'none',
                      }}
                    >
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}

              {/* Features */}
              <div
                data-edit-path="layout.categories"
                onClick={(e) => { stopIfManage(e); onSelect('layout.categories'); }}
                style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? 10 : 16 }}
              >
                {features.map((f) => (
                  <span key={f} style={{ 
                    fontSize: isMobile ? 10 : 12, 
                    color: neonCyan,
                    background: 'rgba(34,211,238,0.1)',
                    border: `1px solid ${neonCyan}40`,
                    padding: '6px 12px',
                    borderRadius: 4,
                    textShadow: `0 0 5px ${neonCyan}`,
                  }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Checkout */}
            <div style={{ position: isMobile ? 'relative' : 'sticky', top: isMobile ? 0 : 90 }}>
              <div style={{ 
                background: cardBg, 
                border: `2px solid ${neonPink}60`, 
                borderRadius: cardRadius,
                boxShadow: `0 0 30px ${neonPink}20`,
                overflow: 'hidden',
              }}>
                <div style={{ 
                  borderBottom: `1px solid ${border}`, 
                  padding: isMobile ? '12px 16px' : '16px 20px',
                  background: `linear-gradient(90deg, ${neonPink}20, ${neonPurple}20)`,
                }}>
                  <span style={{ 
                    fontFamily: '"Press Start 2P", cursive',
                    fontSize: isMobile ? 8 : 10, 
                    color: neonCyan,
                  }}>
                    {asString(s.template_checkout_title) || 'CHECKOUT'}
                  </span>
                </div>
                
                <EmbeddedCheckout
                  storeSlug={storeSlug}
                  product={mainProduct as any}
                  formatPrice={formatPrice}
                  theme={checkoutTheme}
                  disabled={canManage}
                  heading={ctaText}
                  subheading={canManage ? 'Disabled in editor' : (asString(s.template_checkout_subheading) || '★ FREE SHIPPING ★')}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={(e) => { stopIfManage(e); onSelect('layout.footer'); }}
        style={{ position: 'relative', zIndex: 10, borderTop: `2px solid ${neonPink}40`, padding: `${baseSpacing * 1.5}px ${baseSpacing}px`, textAlign: 'center' }}
      >
        <p
          data-edit-path="layout.footer.copyright"
          onClick={(e) => { stopIfManage(e); onSelect('layout.footer.copyright'); }}
          style={{ 
            fontFamily: '"Press Start 2P", cursive',
            fontSize: isMobile ? 7 : 9, 
            color: muted,
          }}
        >
          {asString(s.template_copyright) || `© ${new Date().getFullYear()} ${storeName} ★ RADICAL VIBES ONLY`}
        </p>
      </footer>
    </div>
  );
}
