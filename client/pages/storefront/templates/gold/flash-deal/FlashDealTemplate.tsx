import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * FLASH DEAL - Limited time flash sale landing page with extreme urgency.
 * Design: Flashing elements, bold countdown, stock depletion, deal of the day vibes.
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

export default function FlashDealTemplate(props: TemplateProps) {
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

  // Theme - Hot pink/magenta with dark
  const bg = asString(settings.template_bg_color) || '#0f0f0f';
  const text = asString(settings.template_text_color) || '#ffffff';
  const muted = asString(settings.template_muted_color) || '#9ca3af';
  const accent = asString(settings.template_accent_color) || '#ec4899';
  const cardBg = asString((settings as any).template_card_bg) || '#1a1a1a';
  const border = 'rgba(255,255,255,0.1)';
  const flashYellow = '#fde047';

  // Content
  const storeName = asString(settings.store_name) || 'Flash Deals';
  const heroTitle = asString(settings.template_hero_heading) || 'FLASH DEAL OF THE DAY';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Once it\'s gone, it\'s gone! This incredible deal won\'t last long.';
  const ctaText = asString(settings.template_button_text) || 'GRAB THIS DEAL';

  // Spacing
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 60, 24, 96);
  const cardRadius = resolveInt(settings.template_card_border_radius, 16, 0, 32);

  // Products
  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];
  const mainProduct = products[0];
  const storeSlug = asString((settings as any).store_slug);

  const checkoutTheme = { bg, text, muted, accent, cardBg, border };

  // Countdown (end of day)
  const [timeLeft, setTimeLeft] = React.useState({ hours: 5, minutes: 59, seconds: 59 });
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

  // Claimed counter
  const [claimed, setClaimed] = React.useState(847);
  React.useEffect(() => {
    if (canManage) return;
    const interval = setInterval(() => {
      setClaimed(c => c + Math.floor(Math.random() * 3));
    }, 5000);
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
      {/* Flashing Top Bar */}
      <div style={{
        background: `linear-gradient(90deg, ${accent}, ${flashYellow}, ${accent})`,
        backgroundSize: '200% 100%',
        animation: 'flash-gradient 1s ease infinite',
        padding: '12px 20px',
        textAlign: 'center',
      }}>
        <span style={{ fontWeight: 900, fontSize: 14, color: '#000' }}>
          ⚡ FLASH DEAL ⚡ {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)} LEFT ⚡
        </span>
      </div>

      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={(e) => { stopIfManage(e); onSelect('layout.header'); }}
        style={{ padding: '14px 20px', background: cardBg }}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: flashYellow }}>🔥 {claimed} claimed today</span>
            <button
              data-edit-path="layout.hero.cta"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.cta'); }}
              style={{
                background: accent,
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 20px',
                fontWeight: 800,
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              {ctaText}
            </button>
          </div>
        </div>
      </header>

      {/* Main Deal Section */}
      <section
        data-edit-path="layout.hero"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Deal Badge */}
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <div
              data-edit-path="layout.hero.badge"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.badge'); }}
              style={{
                display: 'inline-block',
                background: accent,
                padding: '12px 30px',
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 900,
                animation: 'pulse 1s infinite',
              }}
            >
              ⚡ TODAY ONLY - 70% OFF ⚡
            </div>
          </div>

          {/* Product Showcase */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 50, alignItems: 'center' }}>
            {/* Product Image */}
            <div
              data-edit-path="layout.hero.image"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
              style={{ position: 'relative' }}
            >
              <div style={{
                position: 'absolute',
                top: -10,
                right: -10,
                background: flashYellow,
                color: '#000',
                width: 80,
                height: 80,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 900,
                fontSize: 20,
                zIndex: 10,
                animation: 'bounce 1s infinite',
              }}>
                -70%
              </div>
              <img
                src={productImage(mainProduct)}
                alt="Deal"
                style={{
                  width: '100%',
                  borderRadius: cardRadius,
                  boxShadow: `0 0 60px ${accent}30`,
                }}
              />
            </div>

            {/* Deal Info */}
            <div>
              <h1
                data-edit-path="layout.hero.title"
                onClick={(e) => { stopIfManage(e); onSelect('layout.hero.title'); }}
                style={{ fontSize: isMobile ? 28 : 40, fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}
              >
                {heroTitle}
              </h1>

              <p
                data-edit-path="layout.hero.subtitle"
                onClick={(e) => { stopIfManage(e); onSelect('layout.hero.subtitle'); }}
                style={{ fontSize: 16, color: muted, lineHeight: 1.6, marginBottom: 24 }}
              >
                {heroSubtitle}
              </p>

              {/* Timer Display */}
              <div style={{ background: cardBg, borderRadius: cardRadius, padding: 20, marginBottom: 24, border: `2px solid ${accent}` }}>
                <div style={{ fontSize: 12, color: accent, marginBottom: 12, fontWeight: 700 }}>⏰ DEAL ENDS IN:</div>
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                  {[
                    { val: timeLeft.hours, label: 'Hours' },
                    { val: timeLeft.minutes, label: 'Mins' },
                    { val: timeLeft.seconds, label: 'Secs' },
                  ].map((item) => (
                    <div key={item.label} style={{ textAlign: 'center' }}>
                      <div style={{
                        background: '#000',
                        borderRadius: 8,
                        padding: '12px 20px',
                        fontSize: 32,
                        fontWeight: 900,
                        color: flashYellow,
                        fontFamily: 'monospace',
                      }}>
                        {pad(item.val)}
                      </div>
                      <div style={{ fontSize: 11, color: muted, marginTop: 6 }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 14, color: muted, textDecoration: 'line-through', marginBottom: 4 }}>Was $299.99</div>
                  <div style={{ fontSize: 48, fontWeight: 900, color: flashYellow }}>
                    {mainProduct ? formatPrice(mainProduct.price) : '$89.99'}
                  </div>
                </div>
                <div style={{ background: '#16a34a', padding: '6px 12px', borderRadius: 6, fontSize: 14, fontWeight: 800, marginBottom: 8 }}>
                  SAVE $210
                </div>
              </div>

              {/* Claimed Progress */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: accent }}>🔥 {claimed} claimed</span>
                  <span style={{ color: muted }}>Limited stock</span>
                </div>
                <div style={{ height: 10, background: '#333', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min((claimed / 1000) * 100, 90)}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${accent}, ${flashYellow})`,
                    borderRadius: 5,
                    transition: 'width 0.5s',
                  }} />
                </div>
              </div>

              {/* Features */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                {['✓ Free Shipping', '✓ 30-Day Returns', '✓ 1-Year Warranty', '✓ 24/7 Support'].map((feat) => (
                  <div key={feat} style={{ fontSize: 13, color: '#9ca3af' }}>{feat}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Deal */}
      <section
        data-edit-path="layout.featured"
        onClick={(e) => { stopIfManage(e); onSelect('layout.featured'); }}
        style={{ padding: `${sectionSpacing * 0.7}px ${baseSpacing}px`, background: cardBg }}
      >
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2
            data-edit-path="layout.featured.title"
            onClick={(e) => { stopIfManage(e); onSelect('layout.featured.title'); }}
            style={{ fontSize: 24, fontWeight: 900, textAlign: 'center', marginBottom: 30 }}
          >
            Why This Deal is INSANE
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 20 }}>
            {[
              { icon: '💰', title: '70% Off', desc: 'Lowest price ever' },
              { icon: '🚚', title: 'Free Ship', desc: 'No hidden fees' },
              { icon: '⭐', title: '4.9 Stars', desc: '10K+ reviews' },
              { icon: '🛡️', title: 'Guaranteed', desc: 'Risk-free buy' },
            ].map((item) => (
              <div key={item.title} style={{ textAlign: 'center', padding: 20 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{item.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: muted }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Checkout Section */}
      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}>
        <div style={{ maxWidth: 500, margin: '0 auto', background: cardBg, borderRadius: cardRadius, padding: 30, border: `2px solid ${accent}`, position: 'relative' }}>
          <div style={{
            position: 'absolute',
            top: -15,
            left: '50%',
            transform: 'translateX(-50%)',
            background: flashYellow,
            color: '#000',
            padding: '8px 20px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 900,
          }}>
            ⚡ DEAL EXPIRES SOON
          </div>

          <div style={{ textAlign: 'center', marginTop: 10, marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>
              Claim Your Deal Now!
            </h2>
            <p style={{ color: muted, fontSize: 14 }}>
              Only {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)} left at this price
            </p>
          </div>
          
          <EmbeddedCheckout
            storeSlug={storeSlug}
            product={mainProduct as any}
            formatPrice={formatPrice}
            theme={checkoutTheme}
            disabled={canManage}
            heading={ctaText}
            subheading={canManage ? 'Disabled in editor' : '⚡ Instant digital delivery'}
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
        @keyframes flash-gradient {
          0%, 100% { background-position: 0% 0%; }
          50% { background-position: 100% 0%; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0) rotate(10deg); }
          50% { transform: translateY(-8px) rotate(10deg); }
        }
      `}</style>
    </div>
  );
}
