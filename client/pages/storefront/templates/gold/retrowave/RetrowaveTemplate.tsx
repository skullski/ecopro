import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * RETROWAVE - 80s synthwave/retro aesthetic landing page.
 * Design: Neon pinks/purples, sunset gradients, grid patterns, VHS vibes, retro-futuristic.
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

export default function RetrowaveTemplate(props: TemplateProps) {
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

  // Theme - Synthwave
  const bg = asString(settings.template_bg_color) || '#0d0221';
  const text = asString(settings.template_text_color) || '#ffffff';
  const muted = asString(settings.template_muted_color) || '#ff71ce';
  const accent = asString(settings.template_accent_color) || '#01cdfe';
  const cardBg = asString((settings as any).template_card_bg) || '#1a0533';
  const border = 'rgba(255,113,206,0.3)';
  const hotPink = '#ff71ce';
  const cyan = '#01cdfe';
  const yellow = '#ffff00';

  // Content
  const storeName = asString(settings.store_name) || 'RETROWAVE';
  const heroTitle = asString(settings.template_hero_heading) || 'RIDE THE WAVE';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Take a journey back to the future. Neon dreams and endless possibilities await.';
  const ctaText = asString(settings.template_button_text) || 'LAUNCH';

  // Spacing
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 60, 24, 96);
  const cardRadius = resolveInt(settings.template_card_border_radius, 0, 0, 32);

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
        background: `linear-gradient(180deg, ${bg} 0%, #2d1b4e 50%, #ff71ce 100%)`,
        color: text,
        fontFamily: '"Press Start 2P", "VT323", monospace, system-ui',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Retro Grid */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
        background: `linear-gradient(180deg, transparent 0%, ${hotPink}20 100%)`,
        backgroundImage: `
          linear-gradient(${cyan}30 1px, transparent 1px),
          linear-gradient(90deg, ${cyan}30 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        transform: 'perspective(500px) rotateX(60deg)',
        transformOrigin: 'bottom',
        pointerEvents: 'none',
      }} />

      {/* Sun */}
      <div style={{
        position: 'fixed',
        bottom: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 300,
        height: 150,
        borderRadius: '150px 150px 0 0',
        background: `linear-gradient(180deg, ${yellow} 0%, #ff6b35 50%, ${hotPink} 100%)`,
        boxShadow: `0 0 60px ${yellow}50`,
        pointerEvents: 'none',
      }}>
        {/* Sun lines */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: 4,
            background: bg,
            top: 30 + i * 20,
          }} />
        ))}
      </div>

      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={(e) => { stopIfManage(e); onSelect('layout.header'); }}
        style={{
          position: 'relative',
          zIndex: 20,
          padding: '20px 24px',
          background: `${bg}cc`,
          borderBottom: `2px solid ${hotPink}`,
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt={storeName} style={{ width: 48, height: 48, objectFit: 'cover', border: `2px solid ${cyan}`, boxShadow: `0 0 10px ${cyan}` }} />
            ) : (
              <div style={{
                width: 48,
                height: 48,
                background: `linear-gradient(135deg, ${hotPink}, ${cyan})`,
                display: 'grid',
                placeItems: 'center',
                fontWeight: 400,
                fontSize: 20,
                boxShadow: `0 0 20px ${hotPink}`,
              }}>
                R
              </div>
            )}
            <span style={{ fontSize: 14, color: cyan, textShadow: `0 0 10px ${cyan}`, letterSpacing: 4 }}>
              {storeName}
            </span>
          </div>
          <button
            data-edit-path="layout.hero.cta"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.cta'); }}
            style={{
              background: `linear-gradient(90deg, ${hotPink}, ${cyan})`,
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              fontWeight: 400,
              cursor: 'pointer',
              fontSize: 10,
              letterSpacing: 2,
              boxShadow: `0 0 20px ${hotPink}50`,
              fontFamily: 'inherit',
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
        style={{ padding: `${sectionSpacing * 1.5}px ${baseSpacing}px`, position: 'relative', zIndex: 10 }}
      >
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <div
            data-edit-path="layout.hero.badge"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.badge'); }}
            style={{
              display: 'inline-block',
              background: `${bg}cc`,
              border: `2px solid ${cyan}`,
              padding: '10px 20px',
              fontSize: 10,
              marginBottom: 30,
              color: cyan,
              boxShadow: `0 0 15px ${cyan}50`,
              letterSpacing: 2,
            }}
          >
            ★ NEW RELEASE 1985 ★
          </div>

          <h1
            data-edit-path="layout.hero.title"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.title'); }}
            style={{
              fontSize: isMobile ? 32 : 64,
              lineHeight: 1.2,
              marginBottom: 30,
              textShadow: `
                0 0 10px ${hotPink},
                0 0 20px ${hotPink},
                0 0 40px ${hotPink},
                0 0 80px ${hotPink}
              `,
              letterSpacing: 4,
            }}
          >
            {heroTitle}
          </h1>

          <p
            data-edit-path="layout.hero.subtitle"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.subtitle'); }}
            style={{
              fontSize: 12,
              color: cyan,
              lineHeight: 2,
              maxWidth: 500,
              margin: '0 auto 40px',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            {heroSubtitle}
          </p>

          {/* Product Showcase */}
          <div
            data-edit-path="layout.hero.image"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
            style={{
              maxWidth: 400,
              margin: '0 auto',
              border: `3px solid ${hotPink}`,
              boxShadow: `0 0 30px ${hotPink}50, inset 0 0 30px ${hotPink}20`,
              position: 'relative',
            }}
          >
            <img
              src={productImage(mainProduct)}
              alt="Product"
              style={{ width: '100%', display: 'block' }}
            />
            <div style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: yellow,
              color: bg,
              padding: '4px 10px',
              fontSize: 8,
              fontWeight: 400,
            }}>
              HOT!
            </div>
          </div>

          {/* Price */}
          <div style={{ marginTop: 30 }}>
            <div style={{ fontSize: 10, color: muted, marginBottom: 8 }}>PRICE:</div>
            <div style={{
              fontSize: 32,
              color: cyan,
              textShadow: `0 0 20px ${cyan}`,
            }}>
              {mainProduct ? formatPrice(mainProduct.price) : '$99.00'}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{
        padding: '24px 20px',
        background: `${bg}ee`,
        borderTop: `2px solid ${cyan}`,
        borderBottom: `2px solid ${cyan}`,
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 20 }}>
          {[
            { val: '1985', label: 'ESTABLISHED' },
            { val: '∞', label: 'POSSIBILITIES' },
            { val: '24/7', label: 'VIBES' },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, color: hotPink, textShadow: `0 0 10px ${hotPink}` }}>{stat.val}</div>
              <div style={{ fontSize: 8, color: cyan, letterSpacing: 2, marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section
        data-edit-path="layout.featured"
        onClick={(e) => { stopIfManage(e); onSelect('layout.featured'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, position: 'relative', zIndex: 10 }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2
            data-edit-path="layout.featured.title"
            onClick={(e) => { stopIfManage(e); onSelect('layout.featured.title'); }}
            style={{
              fontSize: 20,
              textAlign: 'center',
              marginBottom: 50,
              color: cyan,
              textShadow: `0 0 10px ${cyan}`,
              letterSpacing: 4,
            }}
          >
            FEATURES
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { icon: '◆', title: 'TURBO QUALITY', desc: 'Maximum power. Maximum style.' },
              { icon: '◇', title: 'HYPER SPEED', desc: 'Lightning fast delivery.' },
              { icon: '★', title: 'MEGA SUPPORT', desc: 'We\'ve got your back.' },
            ].map((feat, i) => (
              <div
                key={feat.title}
                style={{
                  background: `${cardBg}cc`,
                  border: `2px solid ${[hotPink, cyan, yellow][i]}`,
                  padding: 24,
                  textAlign: 'center',
                  boxShadow: `0 0 20px ${[hotPink, cyan, yellow][i]}30`,
                }}
              >
                <div style={{ fontSize: 32, color: [hotPink, cyan, yellow][i], marginBottom: 16, textShadow: `0 0 10px ${[hotPink, cyan, yellow][i]}` }}>
                  {feat.icon}
                </div>
                <h3 style={{ fontSize: 12, marginBottom: 12, color: [hotPink, cyan, yellow][i], letterSpacing: 2 }}>{feat.title}</h3>
                <p style={{ fontSize: 10, color: muted, lineHeight: 1.8, fontFamily: 'system-ui, sans-serif' }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section style={{ padding: `${sectionSpacing * 0.5}px ${baseSpacing}px`, position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 20 }}>
            {products.slice(0, 4).map((product, i) => (
              <div
                key={product.id}
                style={{
                  background: `${cardBg}cc`,
                  border: `2px solid ${[hotPink, cyan, yellow, hotPink][i]}`,
                  overflow: 'hidden',
                }}
              >
                <img src={productImage(product)} alt={product.name} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
                <div style={{ padding: 12 }}>
                  <div style={{ fontSize: 8, marginBottom: 6, letterSpacing: 1 }}>{product.name}</div>
                  <div style={{ fontSize: 12, color: cyan }}>{formatPrice(product.price)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Checkout Section */}
      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, position: 'relative', zIndex: 10 }}>
        <div style={{
          maxWidth: 500,
          margin: '0 auto',
          background: `${cardBg}ee`,
          border: `3px solid ${hotPink}`,
          padding: 30,
          boxShadow: `0 0 40px ${hotPink}30`,
        }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 8, color: cyan, letterSpacing: 3, marginBottom: 8 }}>★ CHECKOUT ★</div>
            <h2 style={{
              fontSize: 18,
              color: hotPink,
              textShadow: `0 0 10px ${hotPink}`,
              letterSpacing: 2,
            }}>
              GET YOURS NOW
            </h2>
          </div>
          
          <EmbeddedCheckout
            storeSlug={storeSlug}
            product={mainProduct as any}
            formatPrice={formatPrice}
            theme={checkoutTheme}
            disabled={canManage}
            heading={ctaText}
            subheading={canManage ? 'Disabled in editor' : '★ RADICAL SHIPPING ★'}
          />
        </div>
      </section>

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={(e) => { stopIfManage(e); onSelect('layout.footer'); }}
        style={{
          position: 'relative',
          zIndex: 10,
          borderTop: `2px solid ${hotPink}`,
          padding: `${baseSpacing * 2}px ${baseSpacing}px`,
          textAlign: 'center',
          background: `${bg}ee`,
        }}
      >
        <div style={{ fontSize: 14, color: cyan, marginBottom: 16, textShadow: `0 0 10px ${cyan}`, letterSpacing: 4 }}>
          {storeName}
        </div>
        <p
          data-edit-path="layout.footer.copyright"
          onClick={(e) => { stopIfManage(e); onSelect('layout.footer.copyright'); }}
          style={{ fontSize: 8, color: muted }}
        >
          {asString((settings as any).template_copyright) || `© ${new Date().getFullYear()} ${storeName}. ALL RIGHTS RESERVED.`}
        </p>
      </footer>
    </div>
  );
}
