import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * NEON PULSE - Cyberpunk/neon aesthetic landing page.
 * Design: Neon glows, dark backgrounds, synthwave vibes, glowing borders, futuristic feel.
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

export default function NeonPulseTemplate(props: TemplateProps) {
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

  // Theme - Cyberpunk neon
  const bg = asString(settings.template_bg_color) || '#0a0a0f';
  const text = asString(settings.template_text_color) || '#ffffff';
  const muted = asString(settings.template_muted_color) || '#6366f1';
  const accent = asString(settings.template_accent_color) || '#06ffa5';
  const cardBg = asString((settings as any).template_card_bg) || '#12121a';
  const border = 'rgba(99,102,241,0.3)';
  const neonPink = '#ff00ff';
  const neonBlue = '#00ffff';

  // Content
  const storeName = asString(settings.store_name) || 'NEON';
  const heroTitle = asString(settings.template_hero_heading) || 'ENTER THE FUTURE';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Experience the next generation of premium products. Cutting-edge technology meets stunning design.';
  const ctaText = asString(settings.template_button_text) || 'INITIALIZE';

  // Spacing
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 60, 24, 96);
  const cardRadius = resolveInt(settings.template_card_border_radius, 8, 0, 32);

  // Products
  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];
  const mainProduct = products[0];
  const storeSlug = asString((settings as any).store_slug);

  const checkoutTheme = { bg, text, muted, accent, cardBg, border };

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
      style={{
        minHeight: '100vh',
        background: bg,
        color: text,
        fontFamily: '"Orbitron", "Rajdhani", system-ui, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Grid Background */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `
          linear-gradient(${muted}10 1px, transparent 1px),
          linear-gradient(90deg, ${muted}10 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        pointerEvents: 'none',
      }} />

      {/* Gradient Orbs */}
      <div style={{ position: 'fixed', top: '20%', left: '10%', width: 400, height: 400, background: `${neonPink}15`, borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '20%', right: '10%', width: 400, height: 400, background: `${neonBlue}15`, borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />

      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={(e) => { stopIfManage(e); onSelect('layout.header'); }}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: '16px 20px',
          background: `${bg}e0`,
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt={storeName} style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover', border: `1px solid ${accent}`, boxShadow: `0 0 10px ${accent}50` }} />
            ) : (
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 4,
                background: 'transparent',
                border: `2px solid ${accent}`,
                color: accent,
                display: 'grid',
                placeItems: 'center',
                fontWeight: 900,
                fontSize: 14,
                boxShadow: `0 0 15px ${accent}50`,
              }}>
                N
              </div>
            )}
            <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: 4, color: accent, textShadow: `0 0 10px ${accent}` }}>
              {storeName}
            </span>
          </div>
          <button
            data-edit-path="layout.hero.cta"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.cta'); }}
            style={{
              background: 'transparent',
              color: accent,
              border: `2px solid ${accent}`,
              borderRadius: 4,
              padding: '10px 24px',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 12,
              letterSpacing: 2,
              boxShadow: `0 0 20px ${accent}40`,
              transition: 'all 0.3s',
            }}
          >
            {ctaText}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section
        data-edit-path="layout.hero"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero'); }}
        style={{ padding: `${sectionSpacing * 1.5}px ${baseSpacing}px`, position: 'relative' }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 60, alignItems: 'center' }}>
          {/* Left - Content */}
          <div>
            <div
              data-edit-path="layout.hero.badge"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.badge'); }}
              style={{
                display: 'inline-block',
                background: `${accent}15`,
                border: `1px solid ${accent}50`,
                padding: '8px 16px',
                borderRadius: 4,
                fontSize: 11,
                letterSpacing: 3,
                marginBottom: 24,
                color: accent,
              }}
            >
              ◈ NEW RELEASE 2025
            </div>

            <h1
              data-edit-path="layout.hero.title"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.title'); }}
              style={{
                fontSize: isMobile ? 40 : 64,
                fontWeight: 900,
                lineHeight: 1,
                marginBottom: 24,
                textShadow: `0 0 40px ${accent}50`,
                background: `linear-gradient(180deg, ${text} 0%, ${accent} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {heroTitle}
            </h1>

            <p
              data-edit-path="layout.hero.subtitle"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.subtitle'); }}
              style={{ fontSize: 16, color: muted, lineHeight: 1.8, marginBottom: 32, fontFamily: 'system-ui, sans-serif' }}
            >
              {heroSubtitle}
            </p>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 40, marginBottom: 32 }}>
              {[
                { val: '10K+', label: 'USERS' },
                { val: '4.9', label: 'RATING' },
                { val: '24/7', label: 'SUPPORT' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: accent, textShadow: `0 0 20px ${accent}` }}>{stat.val}</div>
                  <div style={{ fontSize: 10, letterSpacing: 2, color: muted }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <button
              style={{
                background: accent,
                color: bg,
                border: 'none',
                borderRadius: 4,
                padding: '16px 40px',
                fontWeight: 800,
                cursor: 'pointer',
                fontSize: 14,
                letterSpacing: 2,
                boxShadow: `0 0 30px ${accent}60`,
              }}
            >
              GET STARTED →
            </button>
          </div>

          {/* Right - Product */}
          <div
            data-edit-path="layout.hero.image"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
            style={{ position: 'relative' }}
          >
            {/* Glow effect */}
            <div style={{
              position: 'absolute',
              inset: -20,
              background: `linear-gradient(135deg, ${neonPink}30, ${neonBlue}30)`,
              borderRadius: cardRadius + 20,
              filter: 'blur(30px)',
            }} />
            
            {/* Border glow */}
            <div style={{
              position: 'absolute',
              inset: -2,
              background: `linear-gradient(135deg, ${accent}, ${neonPink}, ${neonBlue}, ${accent})`,
              borderRadius: cardRadius + 2,
              animation: 'neon-rotate 3s linear infinite',
            }} />
            
            <img
              src={productImage(mainProduct)}
              alt="Product"
              style={{
                position: 'relative',
                width: '100%',
                borderRadius: cardRadius,
                background: cardBg,
              }}
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        data-edit-path="layout.featured"
        onClick={(e) => { stopIfManage(e); onSelect('layout.featured'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, background: `${cardBg}80` }}
      >
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2
            data-edit-path="layout.featured.title"
            onClick={(e) => { stopIfManage(e); onSelect('layout.featured.title'); }}
            style={{ fontSize: 32, fontWeight: 900, textAlign: 'center', marginBottom: 50, letterSpacing: 4 }}
          >
            SPECIFICATIONS
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { icon: '◇', title: 'QUANTUM CORE', desc: 'Next-gen processing power that defies expectations.' },
              { icon: '◈', title: 'HOLO DISPLAY', desc: 'Crystal clear visuals with infinite contrast ratio.' },
              { icon: '◆', title: 'NEURAL SYNC', desc: 'Seamlessly connects with your digital ecosystem.' },
            ].map((feat, i) => (
              <div
                key={feat.title}
                style={{
                  background: cardBg,
                  borderRadius: cardRadius,
                  padding: 30,
                  border: `1px solid ${border}`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: `linear-gradient(90deg, transparent, ${[accent, neonPink, neonBlue][i]}, transparent)`,
                }} />
                <div style={{ fontSize: 24, color: [accent, neonPink, neonBlue][i], marginBottom: 16, textShadow: `0 0 10px ${[accent, neonPink, neonBlue][i]}` }}>
                  {feat.icon}
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12, letterSpacing: 2 }}>{feat.title}</h3>
                <p style={{ fontSize: 13, color: muted, lineHeight: 1.6, fontFamily: 'system-ui, sans-serif' }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, textAlign: 'center', marginBottom: 40, letterSpacing: 4 }}>
            COLLECTION
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 20 }}>
            {products.slice(0, 4).map((product) => (
              <div
                key={product.id}
                style={{
                  background: cardBg,
                  borderRadius: cardRadius,
                  overflow: 'hidden',
                  border: `1px solid ${border}`,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                }}
                onMouseEnter={(e) => !canManage && (e.currentTarget.style.boxShadow = `0 0 30px ${accent}30`)}
                onMouseLeave={(e) => !canManage && (e.currentTarget.style.boxShadow = 'none')}
              >
                <img src={productImage(product)} alt={product.name} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>{product.name}</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: accent }}>{formatPrice(product.price)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Checkout Section */}
      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}>
        <div style={{
          maxWidth: 500,
          margin: '0 auto',
          background: cardBg,
          borderRadius: cardRadius,
          padding: 30,
          border: `1px solid ${accent}`,
          boxShadow: `0 0 40px ${accent}20`,
        }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: accent, letterSpacing: 3, marginBottom: 8 }}>◈ SECURE CHECKOUT ◈</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: 2 }}>
              ACQUIRE NOW
            </h2>
          </div>
          
          <EmbeddedCheckout
            storeSlug={storeSlug}
            product={mainProduct as any}
            formatPrice={formatPrice}
            theme={checkoutTheme}
            disabled={canManage}
            heading={ctaText}
            subheading={canManage ? 'Disabled in editor' : '◇ Instant digital delivery'}
          />
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
          style={{ fontSize: 11, color: muted, letterSpacing: 2, fontFamily: 'system-ui, sans-serif' }}
        >
          {asString((settings as any).template_copyright) || `© ${new Date().getFullYear()} ${storeName}. ALL SYSTEMS OPERATIONAL.`}
        </p>
      </footer>

      <style>{`
        @keyframes neon-rotate {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
