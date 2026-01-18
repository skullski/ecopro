import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * FLASH DEAL - Limited time flash sale landing page.
 * Design: Flashing gradient bars, hot pink/magenta theme, claimed counter, urgency elements.
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

export default function FlashDealTemplate(props: TemplateProps) {
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

  // Countdown timer
  const [timeLeft, setTimeLeft] = React.useState({ hours: 1, minutes: 23, seconds: 45 });
  React.useEffect(() => {
    if (canManage) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [canManage]);

  // Claimed counter
  const [claimed, setClaimed] = React.useState(247);
  React.useEffect(() => {
    if (canManage) return;
    const timer = setInterval(() => {
      setClaimed((prev) => prev + Math.floor(Math.random() * 3));
    }, 8000);
    return () => clearInterval(timer);
  }, [canManage]);

  // Theme colors - Hot pink/magenta
  const bg = asString(s.template_bg_color) || '#fdf2f8';
  const text = asString(s.template_text_color) || '#1f2937';
  const muted = asString(s.template_muted_color) || '#6b7280';
  const accent = asString(s.template_accent_color) || '#ec4899';
  const cardBg = asString(s.template_card_bg) || '#ffffff';
  const border = 'rgba(0,0,0,0.06)';

  // EDITABLE Content from settings
  const storeName = asString(s.store_name) || 'Flash Deal';
  const heroTitle = asString(s.template_hero_heading) || '⚡ FLASH SALE ⚡';
  const heroSubtitle = asString(s.template_hero_subtitle) || 'Unbelievable prices for a limited time only. Once they\'re gone, they\'re gone!';
  const ctaText = asString(s.template_button_text) || 'GRAB THIS DEAL';
  const heroKicker = asString(s.template_hero_kicker) || 'LIMITED TIME OFFER';

  // Deal details (editable)
  const discountPercent = asString(s.template_discount_percent) || '60%';
  const originalPrice = asString(s.template_original_price) || '$149.99';
  const salePrice = asString(s.template_sale_price) || '$59.99';
  const dealLimit = asString(s.template_deal_limit) || '500';

  // Features (editable)
  const feature1 = asString(s.template_feature1_title) || '✓ Free Express Shipping';
  const feature2 = asString(s.template_feature2_title) || '✓ 30-Day Returns';
  const feature3 = asString(s.template_feature3_title) || '✓ Premium Quality';

  // Urgency text (editable)
  const urgencyText1 = asString(s.template_urgency1) || '🔥 Selling fast!';
  const urgencyText2 = asString(s.template_urgency2) || '⏰ Deal ends when timer hits zero';

  // Spacing
  const baseSpacing = resolveInt(s.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(s.template_section_spacing, 48, 24, 96);
  const cardRadius = resolveInt(s.template_card_border_radius, 12, 0, 32);
  const buttonRadius = resolveInt(s.template_button_border_radius, 8, 0, 50);

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

  const features = [feature1, feature2, feature3].filter(Boolean);
  const pad = (n: number) => n.toString().padStart(2, '0');

  const progressPercent = Math.min((claimed / parseInt(dealLimit)) * 100, 95);

  return (
    <div
      data-edit-path="__root"
      onClick={() => canManage && onSelect('__root')}
      className="ecopro-storefront"
      style={{ minHeight: '100vh', background: bg, color: text, fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      {/* Animated Flash Bar */}
      <div
        data-edit-path="layout.hero.badge"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero.badge'); }}
        style={{
          background: `linear-gradient(90deg, ${accent}, #f472b6, ${accent}, #f472b6, ${accent})`,
          backgroundSize: '200% 100%',
          animation: 'gradientShift 2s linear infinite',
          color: '#fff',
          padding: isMobile ? '10px 12px' : '12px 20px',
          textAlign: 'center',
          fontWeight: 800,
          fontSize: isMobile ? 12 : 14,
        }}
      >
        ⚡ {heroKicker} - {discountPercent} OFF ⚡
      </div>

      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={(e) => { stopIfManage(e); onSelect('layout.header'); }}
        style={{ background: cardBg, borderBottom: `1px solid ${border}`, padding: isMobile ? '10px 12px' : '12px 20px' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {asString(s.store_logo) ? (
              <img src={asString(s.store_logo)} alt={storeName} style={{ width: isMobile ? 32 : 38, height: isMobile ? 32 : 38, borderRadius: 8, objectFit: 'cover' }} />
            ) : (
              <span style={{ fontWeight: 900, fontSize: isMobile ? 14 : 18, color: accent }}>{storeName}</span>
            )}
          </div>
          {/* Timer in header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fce7f3', padding: '6px 12px', borderRadius: 6 }}>
            <span style={{ fontSize: isMobile ? 10 : 12, color: accent }}>⏱️</span>
            <span style={{ fontWeight: 800, fontSize: isMobile ? 13 : 15, color: accent }}>
              {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        data-edit-path="layout.hero"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero'); }}
        style={{ padding: isMobile ? `${sectionSpacing * 0.6}px ${baseSpacing}px` : `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 20 : 28 }}>
            <h1
              data-edit-path="layout.hero.title"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.title'); }}
              style={{ 
                fontSize: isMobile ? 32 : 56, 
                fontWeight: 900, 
                lineHeight: 1.1, 
                marginBottom: 12,
                color: accent,
              }}
            >
              {heroTitle}
            </h1>

            <p
              data-edit-path="layout.hero.subtitle"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.subtitle'); }}
              style={{ fontSize: isMobile ? 14 : 18, color: muted, maxWidth: 500, margin: '0 auto' }}
            >
              {heroSubtitle}
            </p>
          </div>

          {/* Countdown Timer */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: isMobile ? 8 : 12, 
            marginBottom: isMobile ? 24 : 32 
          }}>
            {[
              { value: timeLeft.hours, label: 'HRS' },
              { value: timeLeft.minutes, label: 'MIN' },
              { value: timeLeft.seconds, label: 'SEC' },
            ].map((item) => (
              <div key={item.label} style={{ textAlign: 'center' }}>
                <div style={{ 
                  background: `linear-gradient(135deg, ${accent}, #f472b6)`, 
                  borderRadius: cardRadius, 
                  padding: isMobile ? '10px 14px' : '14px 20px',
                  minWidth: isMobile ? 50 : 70,
                }}>
                  <div style={{ fontSize: isMobile ? 24 : 36, fontWeight: 900, color: '#fff' }}>{pad(item.value)}</div>
                </div>
                <div style={{ fontSize: isMobile ? 9 : 11, color: muted, marginTop: 4, fontWeight: 700 }}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* Main Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 400px', gap: isMobile ? 24 : 36, alignItems: 'start' }}>
            
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
                  border: `3px solid ${accent}`,
                  marginBottom: 16,
                }}
              >
                <img src={images[activeImage] || images[0]} alt="" style={{ width: '100%', aspectRatio: isMobile ? '4/3' : '16/10', objectFit: 'cover' }} />
                
                {/* Discount badge */}
                <div style={{ 
                  position: 'absolute', 
                  top: 0, 
                  right: 0, 
                  background: `linear-gradient(135deg, ${accent}, #f472b6)`, 
                  color: '#fff', 
                  padding: isMobile ? '12px 16px' : '16px 20px', 
                  fontWeight: 900, 
                  fontSize: isMobile ? 20 : 28,
                  borderBottomLeftRadius: cardRadius,
                }}>
                  -{discountPercent}
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  {images.slice(0, 10).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { stopIfManage(e); setActiveImage(idx); }}
                      style={{
                        width: isMobile ? 48 : 60,
                        height: isMobile ? 48 : 60,
                        borderRadius: 8,
                        border: idx === activeImage ? `2px solid ${accent}` : `1px solid ${border}`,
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

              {/* Urgency messages */}
              <div
                data-edit-path="layout.categories"
                onClick={(e) => { stopIfManage(e); onSelect('layout.categories'); }}
                style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}
              >
                <span style={{ fontSize: isMobile ? 12 : 14, color: accent, fontWeight: 700 }}>{urgencyText1}</span>
                <span style={{ fontSize: isMobile ? 12 : 14, color: muted }}>{urgencyText2}</span>
              </div>

              {/* Features */}
              <div
                data-edit-path="layout.grid"
                onClick={(e) => { stopIfManage(e); onSelect('layout.grid'); }}
                style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}
              >
                {features.map((f) => (
                  <span key={f} style={{ fontSize: isMobile ? 12 : 14, color: '#059669', fontWeight: 600 }}>{f}</span>
                ))}
              </div>
            </div>

            {/* Right: Checkout */}
            <div style={{ position: isMobile ? 'relative' : 'sticky', top: isMobile ? 0 : 90 }}>
              {/* Claimed Progress */}
              <div style={{ 
                background: cardBg, 
                border: `1px solid ${border}`, 
                borderRadius: cardRadius, 
                padding: isMobile ? 14 : 18, 
                marginBottom: 16,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: isMobile ? 12 : 14, fontWeight: 700 }}>🔥 {claimed} claimed</span>
                  <span style={{ fontSize: isMobile ? 12 : 14, color: muted }}>{dealLimit} available</span>
                </div>
                <div style={{ background: '#fce7f3', borderRadius: 10, height: 10, overflow: 'hidden' }}>
                  <div style={{ 
                    background: `linear-gradient(90deg, ${accent}, #f472b6)`, 
                    height: '100%', 
                    width: `${progressPercent}%`,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>

              {/* Price */}
              <div style={{ 
                background: cardBg, 
                border: `2px solid ${accent}`, 
                borderRadius: cardRadius, 
                padding: isMobile ? 16 : 20, 
                marginBottom: 16,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: isMobile ? 14 : 16, color: muted, textDecoration: 'line-through' }}>{originalPrice}</div>
                <div style={{ fontSize: isMobile ? 36 : 48, fontWeight: 900, color: accent }}>{salePrice}</div>
                <div style={{ fontSize: isMobile ? 12 : 14, color: '#059669', fontWeight: 700 }}>
                  You save {discountPercent}!
                </div>
              </div>

              <EmbeddedCheckout
                storeSlug={storeSlug}
                product={mainProduct as any}
                formatPrice={formatPrice}
                theme={checkoutTheme}
                disabled={canManage}
                heading={ctaText}
                subheading={canManage ? 'Disabled in editor' : (asString(s.template_checkout_subheading) || '⚡ Limited time price')}
              />
            </div>
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
          style={{ fontSize: isMobile ? 11 : 13, color: muted }}
        >
          {asString(s.template_copyright) || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`}
        </p>
      </footer>

      {/* CSS Animations */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </div>
  );
}
