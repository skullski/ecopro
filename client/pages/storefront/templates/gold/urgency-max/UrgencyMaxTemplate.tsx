import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * URGENCY MAX - Maximum urgency and scarcity-focused landing page.
 * Design: Countdown timers everywhere, stock counters, flash sale aesthetics, high-pressure visuals.
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

export default function UrgencyMaxTemplate(props: TemplateProps) {
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

  // Theme - High contrast urgency red/yellow/black
  const bg = asString(settings.template_bg_color) || '#111111';
  const text = asString(settings.template_text_color) || '#ffffff';
  const muted = asString(settings.template_muted_color) || '#a3a3a3';
  const accent = asString(settings.template_accent_color) || '#ef4444';
  const cardBg = asString((settings as any).template_card_bg) || '#1a1a1a';
  const border = 'rgba(255,255,255,0.1)';
  const urgentYellow = '#fbbf24';

  // Content
  const storeName = asString(settings.store_name) || 'Flash Sale';
  const heroTitle = asString(settings.template_hero_heading) || 'BIGGEST SALE OF THE YEAR';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Don\'t miss out! This exclusive deal ends when the timer hits zero. Act NOW!';
  const ctaText = asString(settings.template_button_text) || 'CLAIM YOUR DEAL';

  // Spacing
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 60, 24, 96);
  const cardRadius = resolveInt(settings.template_card_border_radius, 12, 0, 32);

  // Products
  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];
  const mainProduct = products[0];
  const storeSlug = asString((settings as any).store_slug);

  const checkoutTheme = { bg, text, muted, accent, cardBg, border };

  // Countdown timer
  const [timeLeft, setTimeLeft] = React.useState({ hours: 2, minutes: 47, seconds: 33 });
  React.useEffect(() => {
    if (canManage) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [canManage]);

  // Stock counter
  const [stock, setStock] = React.useState(7);
  React.useEffect(() => {
    if (canManage) return;
    const timeout = setTimeout(() => {
      if (stock > 2) setStock(s => s - 1);
    }, 45000);
    return () => clearTimeout(timeout);
  }, [stock, canManage]);

  // Viewers
  const [viewers, setViewers] = React.useState(127);
  React.useEffect(() => {
    if (canManage) return;
    const interval = setInterval(() => {
      setViewers(v => v + Math.floor(Math.random() * 5) - 2);
    }, 3000);
    return () => clearInterval(interval);
  }, [canManage]);

  const stopIfManage = (e: React.MouseEvent) => {
    if (!canManage) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div
      data-edit-path="__root"
      onClick={() => canManage && onSelect('__root')}
      className="ecopro-storefront"
      style={{ minHeight: '100vh', background: bg, color: text, fontFamily: 'system-ui, sans-serif' }}
    >
      {/* Top Urgency Banner */}
      <div style={{
        background: `linear-gradient(90deg, ${accent} 0%, ${urgentYellow} 50%, ${accent} 100%)`,
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s linear infinite',
        padding: '10px 20px',
        textAlign: 'center',
        fontWeight: 900,
        fontSize: 14,
        color: '#000',
      }}>
        ⚡ FLASH SALE ENDS IN: {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)} ⚡
      </div>

      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={(e) => { stopIfManage(e); onSelect('layout.header'); }}
        style={{ padding: '12px 20px', background: cardBg }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt={storeName} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: 8, background: accent, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900 }}>
                ⚡
              </div>
            )}
            <span style={{ fontWeight: 900, fontSize: 16 }}>{storeName}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 13, color: urgentYellow }}>
              👁 {viewers} viewing now
            </span>
            <button
              data-edit-path="layout.hero.cta"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.cta'); }}
              style={{
                background: accent,
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 20px',
                fontWeight: 900,
                cursor: 'pointer',
                fontSize: 12,
                animation: 'pulse 1s infinite',
              }}
            >
              {ctaText}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        data-edit-path="layout.hero"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, position: 'relative', overflow: 'hidden' }}
      >
        {/* Background effects */}
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 20% 50%, ${accent}20 0%, transparent 50%)` }} />
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 80% 50%, ${urgentYellow}10 0%, transparent 50%)` }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 40, alignItems: 'center', position: 'relative' }}>
          {/* Left - Content */}
          <div>
            <div
              data-edit-path="layout.hero.badge"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.badge'); }}
              style={{
                display: 'inline-block',
                background: accent,
                color: '#fff',
                padding: '8px 16px',
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 900,
                marginBottom: 16,
              }}
            >
              🔥 LIMITED TIME OFFER 🔥
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
              style={{ fontSize: 17, color: muted, lineHeight: 1.6, marginBottom: 24 }}
            >
              {heroSubtitle}
            </p>

            {/* Big Timer */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              {[
                { val: timeLeft.hours, label: 'HOURS' },
                { val: timeLeft.minutes, label: 'MINS' },
                { val: timeLeft.seconds, label: 'SECS' },
              ].map((item) => (
                <div key={item.label} style={{ background: cardBg, borderRadius: cardRadius, padding: '16px 24px', textAlign: 'center', border: `2px solid ${accent}` }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: urgentYellow }}>{pad(item.val)}</div>
                  <div style={{ fontSize: 10, color: muted, letterSpacing: 1 }}>{item.label}</div>
                </div>
              ))}
            </div>

            {/* Stock Warning */}
            <div style={{ background: `${accent}20`, border: `1px solid ${accent}`, borderRadius: 8, padding: 16, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>⚠️</span>
                <span style={{ fontWeight: 900, color: accent }}>ALMOST SOLD OUT!</span>
              </div>
              <div style={{ fontSize: 14 }}>
                Only <span style={{ color: urgentYellow, fontWeight: 900 }}>{stock} items</span> left at this price!
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginTop: 10, overflow: 'hidden' }}>
                <div style={{ width: `${(stock / 50) * 100}%`, height: '100%', background: accent, borderRadius: 3 }} />
              </div>
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <span style={{ fontSize: 20, textDecoration: 'line-through', color: muted }}>$299.99</span>
              <span style={{ fontSize: 36, fontWeight: 900, color: urgentYellow }}>{mainProduct ? formatPrice(mainProduct.price) : '$99.99'}</span>
              <span style={{ background: accent, padding: '4px 12px', borderRadius: 4, fontSize: 14, fontWeight: 900 }}>67% OFF</span>
            </div>
          </div>

          {/* Right - Product */}
          <div
            data-edit-path="layout.hero.image"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
            style={{ position: 'relative' }}
          >
            <img src={productImage(mainProduct)} alt="Product" style={{ width: '100%', borderRadius: cardRadius, boxShadow: `0 0 60px ${accent}40` }} />
            <div style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: accent,
              padding: '8px 16px',
              borderRadius: 999,
              fontWeight: 900,
              fontSize: 14,
              animation: 'bounce 1s infinite',
            }}>
              BEST SELLER
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Strip */}
      <section style={{ background: cardBg, padding: '20px 0', borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 40 }}>
          {[
            { val: '50K+', label: 'Orders This Week' },
            { val: '4.9★', label: 'Average Rating' },
            { val: '99%', label: 'Happy Customers' },
            { val: '24H', label: 'Fast Shipping' },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: urgentYellow }}>{stat.val}</div>
              <div style={{ fontSize: 11, color: muted }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Section */}
      <section
        data-edit-path="layout.featured"
        onClick={(e) => { stopIfManage(e); onSelect('layout.featured'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2
            data-edit-path="layout.featured.title"
            onClick={(e) => { stopIfManage(e); onSelect('layout.featured.title'); }}
            style={{ fontSize: 28, fontWeight: 900, textAlign: 'center', marginBottom: 8 }}
          >
            🔥 HOT DEALS ENDING SOON 🔥
          </h2>
          <p style={{ textAlign: 'center', color: muted, marginBottom: 40 }}>Grab these before they're gone forever!</p>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 16 }}>
            {products.slice(0, 4).map((product, i) => (
              <div key={product.id} style={{ background: cardBg, borderRadius: cardRadius, overflow: 'hidden', position: 'relative', border: `1px solid ${border}` }}>
                <div style={{ position: 'absolute', top: 8, left: 8, background: accent, padding: '4px 8px', borderRadius: 4, fontSize: 10, fontWeight: 900, zIndex: 5 }}>
                  -{60 + i * 5}%
                </div>
                <img src={productImage(product)} alt={product.name} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
                <div style={{ padding: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, textDecoration: 'line-through', color: muted }}>$199</span>
                    <span style={{ fontSize: 16, fontWeight: 900, color: urgentYellow }}>{formatPrice(product.price)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Checkout Section */}
      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, background: `linear-gradient(180deg, ${bg} 0%, ${accent}20 100%)` }}>
        <div style={{ maxWidth: 500, margin: '0 auto', background: cardBg, borderRadius: cardRadius, padding: 30, border: `2px solid ${accent}` }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 20 }}>⏰</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>DON'T WAIT - ACT NOW!</h2>
            <p style={{ color: urgentYellow, fontSize: 14 }}>
              Timer ends in {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
            </p>
          </div>
          
          <EmbeddedCheckout
            storeSlug={storeSlug}
            product={mainProduct as any}
            formatPrice={formatPrice}
            theme={checkoutTheme}
            disabled={canManage}
            heading={ctaText}
            subheading={canManage ? 'Disabled in editor' : `Only ${stock} left at this price!`}
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
          style={{ fontSize: 12, color: muted }}
        >
          {asString((settings as any).template_copyright) || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`}
        </p>
      </footer>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
