import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * NEON PULSE - Cyberpunk/neon aesthetic landing page.
 * Design: Cyberpunk grid background, neon glows, Orbitron font, dark futuristic theme.
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

export default function NeonPulseTemplate(props: TemplateProps) {
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

  // Theme colors - Cyberpunk neon
  const bg = asString(s.template_bg_color) || '#0a0a0f';
  const text = asString(s.template_text_color) || '#ffffff';
  const muted = asString(s.template_muted_color) || '#6366f1';
  const accent = asString(s.template_accent_color) || '#06ffa5';
  const cardBg = asString(s.template_card_bg) || '#12121a';
  const border = 'rgba(99, 102, 241, 0.2)';
  const neonPink = '#ff2a6d';
  const neonBlue = '#05d9e8';

  // EDITABLE Content from settings
  const storeName = asString(s.store_name) || 'NEON_PULSE';
  const heroTitle = asString(s.template_hero_heading) || 'ENTER THE FUTURE';
  const heroSubtitle = asString(s.template_hero_subtitle) || 'Next-generation technology meets cutting-edge design. Experience tomorrow, today.';
  const ctaText = asString(s.template_button_text) || 'INITIALIZE';
  const heroKicker = asString(s.template_hero_kicker) || 'SYSTEM ONLINE';

  // Stats (editable)
  const stat1Value = asString(s.template_stat1_value) || '10K+';
  const stat1Label = asString(s.template_stat1_label) || 'UNITS DEPLOYED';
  const stat2Value = asString(s.template_stat2_value) || '99.9%';
  const stat2Label = asString(s.template_stat2_label) || 'UPTIME';
  const stat3Value = asString(s.template_stat3_value) || 'v2.0';
  const stat3Label = asString(s.template_stat3_label) || 'VERSION';

  // Features (editable)
  const feature1 = asString(s.template_feature1_title) || '> Neural_Interface_Compatible';
  const feature2 = asString(s.template_feature2_title) || '> Quantum_Encryption_Enabled';
  const feature3 = asString(s.template_feature3_title) || '> Zero_Latency_Processing';
  const feature4 = asString(s.template_feature4_title) || '> Holographic_Display_Ready';

  // Section title (editable)
  const specsTitle = asString(s.template_section_title) || 'TECH_SPECS';

  // Spacing
  const baseSpacing = resolveInt(s.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(s.template_section_spacing, 56, 24, 96);
  const cardRadius = resolveInt(s.template_card_border_radius, 4, 0, 32);
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

  const features = [feature1, feature2, feature3, feature4].filter(Boolean);

  return (
    <div
      data-edit-path="__root"
      onClick={() => canManage && onSelect('__root')}
      className="ecopro-storefront"
      style={{ 
        minHeight: '100vh', 
        background: bg, 
        color: text, 
        fontFamily: '"Orbitron", "Inter", monospace',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Load Orbitron font */}
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet" />

      {/* Cyberpunk Grid Background */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `
          linear-gradient(${muted}10 1px, transparent 1px),
          linear-gradient(90deg, ${muted}10 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        perspective: '500px',
        zIndex: 0,
      }}>
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40%',
          background: `linear-gradient(180deg, transparent, ${bg})`,
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
          background: 'rgba(10,10,15,0.9)', 
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${border}`, 
          padding: isMobile ? '10px 12px' : '12px 20px' 
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ 
              width: isMobile ? 8 : 10, 
              height: isMobile ? 8 : 10, 
              borderRadius: '50%', 
              background: accent,
              boxShadow: `0 0 10px ${accent}, 0 0 20px ${accent}`,
              animation: 'pulse 2s infinite',
            }} />
            <span style={{ fontWeight: 700, fontSize: isMobile ? 12 : 14, letterSpacing: 2 }}>{storeName}</span>
          </div>
          <button
            data-edit-path="layout.hero.cta"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.cta'); }}
            style={{ 
              background: 'transparent', 
              color: accent, 
              border: `1px solid ${accent}`, 
              borderRadius: buttonRadius, 
              padding: isMobile ? '6px 14px' : '8px 20px', 
              fontWeight: 700, 
              cursor: 'pointer', 
              fontSize: isMobile ? 10 : 12,
              letterSpacing: 1,
              boxShadow: `0 0 10px ${accent}40`,
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
          {/* System Status */}
          <div
            data-edit-path="layout.hero.kicker"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.kicker'); }}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 8, 
              marginBottom: isMobile ? 16 : 24,
              background: `${accent}15`,
              border: `1px solid ${accent}40`,
              padding: '6px 14px',
              borderRadius: 4,
            }}
          >
            <span style={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              background: accent,
              animation: 'pulse 1s infinite',
            }} />
            <span style={{ fontSize: isMobile ? 10 : 12, color: accent, fontWeight: 700, letterSpacing: 2 }}>{heroKicker}</span>
          </div>

          {/* Title */}
          <h1
            data-edit-path="layout.hero.title"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.title'); }}
            style={{ 
              fontSize: isMobile ? 36 : 72, 
              fontWeight: 900, 
              lineHeight: 1,
              marginBottom: isMobile ? 12 : 20,
              textShadow: `0 0 40px ${accent}60`,
            }}
          >
            {heroTitle}
          </h1>

          <p
            data-edit-path="layout.hero.subtitle"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.subtitle'); }}
            style={{ 
              fontSize: isMobile ? 13 : 16, 
              color: muted, 
              maxWidth: 500, 
              marginBottom: isMobile ? 24 : 36,
              fontFamily: '"Inter", sans-serif',
              lineHeight: 1.6,
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
              gap: isMobile ? 16 : 32, 
              marginBottom: isMobile ? 28 : 40,
              flexWrap: 'wrap',
            }}
          >
            {stats.map((stat) => (
              <div key={stat.label}>
                <div style={{ fontSize: isMobile ? 24 : 36, fontWeight: 900, color: accent, textShadow: `0 0 20px ${accent}60` }}>{stat.value}</div>
                <div style={{ fontSize: isMobile ? 9 : 11, color: muted, letterSpacing: 1 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Main Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 400px', gap: isMobile ? 24 : 40, alignItems: 'start' }}>
            
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
                  border: `1px solid ${border}`,
                  marginBottom: 16,
                  background: cardBg,
                }}
              >
                <img src={images[activeImage] || images[0]} alt="" style={{ width: '100%', aspectRatio: isMobile ? '4/3' : '16/10', objectFit: 'cover' }} />
                
                {/* Neon glow overlay */}
                <div style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  background: `linear-gradient(135deg, ${neonPink}10, transparent, ${neonBlue}10)`,
                  pointerEvents: 'none',
                }} />

                {/* Corner accents */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: 30, height: 30, borderTop: `2px solid ${accent}`, borderLeft: `2px solid ${accent}` }} />
                <div style={{ position: 'absolute', top: 0, right: 0, width: 30, height: 30, borderTop: `2px solid ${accent}`, borderRight: `2px solid ${accent}` }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: 30, height: 30, borderBottom: `2px solid ${accent}`, borderLeft: `2px solid ${accent}` }} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderBottom: `2px solid ${accent}`, borderRight: `2px solid ${accent}` }} />
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
                        borderRadius: cardRadius,
                        border: idx === activeImage ? `2px solid ${accent}` : `1px solid ${border}`,
                        padding: 0,
                        background: cardBg,
                        cursor: 'pointer',
                        overflow: 'hidden',
                        boxShadow: idx === activeImage ? `0 0 10px ${accent}40` : 'none',
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
              >
                <h3
                  data-edit-path="layout.featured.title"
                  onClick={(e) => { stopIfManage(e); onSelect('layout.featured.title'); }}
                  style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, marginBottom: 12, color: accent, letterSpacing: 2 }}
                >
                  {specsTitle}
                </h3>
                <div style={{ display: 'grid', gap: 8 }}>
                  {features.map((f) => (
                    <div key={f} style={{ 
                      fontSize: isMobile ? 12 : 14, 
                      color: muted,
                      fontFamily: '"Courier New", monospace',
                      padding: '8px 12px',
                      background: `${cardBg}cc`,
                      border: `1px solid ${border}`,
                      borderRadius: cardRadius,
                    }}>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Checkout */}
            <div style={{ position: isMobile ? 'relative' : 'sticky', top: isMobile ? 0 : 90 }}>
              <div style={{ 
                background: cardBg, 
                border: `1px solid ${accent}40`, 
                borderRadius: cardRadius,
                boxShadow: `0 0 30px ${accent}20`,
              }}>
                <div style={{ 
                  borderBottom: `1px solid ${border}`, 
                  padding: isMobile ? '12px 16px' : '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: accent }} />
                  <span style={{ fontSize: isMobile ? 11 : 13, letterSpacing: 1, color: accent }}>{asString(s.template_checkout_title) || 'ACQUIRE_UNIT'}</span>
                </div>
                
                <EmbeddedCheckout
                  storeSlug={storeSlug}
                  product={mainProduct as any}
                  formatPrice={formatPrice}
                  theme={checkoutTheme}
                  disabled={canManage}
                  heading={ctaText}
                  subheading={canManage ? 'Disabled in editor' : (asString(s.template_checkout_subheading) || '// Secure quantum transaction')}
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
        style={{ position: 'relative', zIndex: 10, borderTop: `1px solid ${border}`, padding: `${baseSpacing * 1.5}px ${baseSpacing}px`, textAlign: 'center' }}
      >
        <p
          data-edit-path="layout.footer.copyright"
          onClick={(e) => { stopIfManage(e); onSelect('layout.footer.copyright'); }}
          style={{ fontSize: isMobile ? 10 : 12, color: muted, fontFamily: '"Inter", sans-serif' }}
        >
          {asString(s.template_copyright) || `© ${new Date().getFullYear()} ${storeName} // ALL_RIGHTS_RESERVED`}
        </p>
      </footer>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 10px ${accent}, 0 0 20px ${accent}; }
          50% { opacity: 0.5; box-shadow: 0 0 5px ${accent}; }
        }
      `}</style>
    </div>
  );
}
