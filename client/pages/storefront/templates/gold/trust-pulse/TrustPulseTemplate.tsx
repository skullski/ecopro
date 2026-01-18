import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * TRUST PULSE - High-conversion landing page with countdown timer, testimonials, and trust badges.
 * Design: Urgency bar at top, bold headline, social proof, testimonials carousel, embedded checkout.
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

// Countdown hook
function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = React.useState({ hours: 0, minutes: 0, seconds: 0 });
  
  React.useEffect(() => {
    const calc = () => {
      const now = new Date().getTime();
      const diff = targetDate.getTime() - now;
      if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };
    setTimeLeft(calc());
    const interval = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);
  
  return timeLeft;
}

export default function TrustPulseTemplate(props: TemplateProps) {
  const { settings, formatPrice, navigate } = props;
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

  // Theme colors
  const bg = asString(settings.template_bg_color) || '#ffffff';
  const text = asString(settings.template_text_color) || '#1a1a2e';
  const muted = asString(settings.template_muted_color) || '#6b7280';
  const accent = asString(settings.template_accent_color) || '#e63946';
  const cardBg = asString((settings as any).template_card_bg) || '#ffffff';
  const border = 'rgba(0,0,0,0.08)';

  // Content from settings
  const storeName = asString(settings.store_name) || 'Trust Pulse';
  const heroTitle = asString(settings.template_hero_heading) || 'The #1 Product That Changed Everything';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Join 10,000+ happy customers who transformed their lives with our revolutionary product.';
  const ctaText = asString(settings.template_button_text) || 'Order Now - 50% OFF';
  const badgeText = asString((settings as any).template_hero_badge_title) || '🔥 SELLING FAST';
  const badgeSubtitle = asString((settings as any).template_hero_badge_subtitle) || 'Only 23 left in stock!';
  
  // Spacing
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 48, 24, 96);
  const cardRadius = resolveInt(settings.template_card_border_radius, 16, 0, 32);
  const buttonRadius = resolveInt((settings as any).template_button_border_radius, 12, 0, 50);

  // Products
  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];
  const mainProduct = products[0];
  const storeSlug = asString((settings as any).store_slug);
  const priceValue = mainProduct ? safePrice((mainProduct as any).price) : 0;
  const originalValue = mainProduct ? safePrice((mainProduct as any).original_price) : 0;
  const mainPrice = mainProduct ? formatPrice(priceValue) : '';
  const originalPrice = originalValue > priceValue ? formatPrice(originalValue) : '';

  // Countdown (ends in 24 hours)
  const [countdownTarget] = React.useState(() => new Date(Date.now() + 24 * 60 * 60 * 1000));
  const countdown = useCountdown(countdownTarget);

  const checkoutTheme = { bg, text, muted, accent, cardBg, border };

  // Testimonials (can be edited via template_social_links or similar)
  const testimonials = [
    { name: 'Sarah M.', rating: 5, text: 'This product completely changed my routine. Best purchase ever!', avatar: '👩' },
    { name: 'Ahmed K.', rating: 5, text: 'Exceeded all my expectations. Highly recommend to everyone!', avatar: '👨' },
    { name: 'Lisa R.', rating: 5, text: 'Fast shipping, amazing quality. Will definitely buy again!', avatar: '👩‍🦰' },
  ];

  const [currentTestimonial, setCurrentTestimonial] = React.useState(0);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
      {/* Urgency Bar */}
      <div
        data-edit-path="layout.hero.badge"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero.badge'); }}
        style={{
          background: `linear-gradient(135deg, ${accent} 0%, #ff6b6b 100%)`,
          color: '#fff',
          padding: '10px 16px',
          textAlign: 'center',
          fontSize: 13,
          fontWeight: 700,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <span>{badgeText}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: 6 }}>
            {String(countdown.hours).padStart(2, '0')}h
          </span>
          <span style={{ background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: 6 }}>
            {String(countdown.minutes).padStart(2, '0')}m
          </span>
          <span style={{ background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: 6 }}>
            {String(countdown.seconds).padStart(2, '0')}s
          </span>
        </div>
        <span>{badgeSubtitle}</span>
      </div>

      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={(e) => { stopIfManage(e); onSelect('layout.header'); }}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          background: bg,
          borderBottom: `1px solid ${border}`,
          padding: '12px 20px',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt={storeName} style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: 10, background: accent, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 16 }}>
                {storeName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <span style={{ fontWeight: 800, fontSize: 15 }}>{storeName}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: muted }}>⭐ 4.9/5 (2,847 reviews)</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        data-edit-path="layout.hero"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 420px', gap: 32, alignItems: 'start' }}>
          
          {/* Left: Content */}
          <div>
            {/* Trust badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {['✅ Free Shipping', '🛡️ Money Back Guarantee', '⚡ 24h Delivery'].map((badge) => (
                <span key={badge} style={{ fontSize: 11, color: muted, background: 'rgba(0,0,0,0.04)', padding: '6px 10px', borderRadius: 20, fontWeight: 600 }}>
                  {badge}
                </span>
              ))}
            </div>

            <h1
              data-edit-path="layout.hero.title"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.title'); }}
              style={{ fontSize: isMobile ? 28 : 42, fontWeight: 900, lineHeight: 1.15, marginBottom: 16 }}
            >
              {heroTitle}
            </h1>
            
            <p
              data-edit-path="layout.hero.subtitle"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.subtitle'); }}
              style={{ fontSize: 16, color: muted, lineHeight: 1.6, marginBottom: 24, maxWidth: 540 }}
            >
              {heroSubtitle}
            </p>

            {/* Social Proof Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
              {[
                { value: '10K+', label: 'Happy Customers' },
                { value: '4.9★', label: 'Average Rating' },
                { value: '99%', label: 'Satisfaction' },
              ].map((stat) => (
                <div key={stat.label} style={{ textAlign: 'center', padding: 16, background: 'rgba(0,0,0,0.02)', borderRadius: cardRadius }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: accent }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: muted, fontWeight: 600 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Product Image Gallery */}
            <div
              data-edit-path="layout.hero.image"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
              style={{ background: cardBg, borderRadius: cardRadius, overflow: 'hidden', border: `1px solid ${border}` }}
            >
              <img src={productImage(mainProduct)} alt="" style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover' }} />
            </div>
          </div>

          {/* Right: Checkout */}
          <div style={{ position: isMobile ? 'relative' : 'sticky', top: 100 }}>
            {/* Price Display */}
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: cardRadius, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 32, fontWeight: 900, color: accent }}>{mainPrice}</span>
                {originalPrice && (
                  <span style={{ fontSize: 18, color: muted, textDecoration: 'line-through' }}>{originalPrice}</span>
                )}
              </div>
              {originalPrice && (
                <div style={{ fontSize: 13, color: '#16a34a', fontWeight: 700 }}>
                  🎉 You save {formatPrice(originalValue - priceValue)}!
                </div>
              )}
            </div>

            <EmbeddedCheckout
              storeSlug={storeSlug}
              product={mainProduct as any}
              formatPrice={formatPrice}
              theme={checkoutTheme}
              disabled={canManage}
              heading={ctaText}
              subheading={canManage ? 'Disabled in editor' : 'Secure checkout • Free shipping'}
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        data-edit-path="layout.featured"
        onClick={(e) => { stopIfManage(e); onSelect('layout.featured'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, background: 'rgba(0,0,0,0.02)' }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2
            data-edit-path="layout.featured.title"
            onClick={(e) => { stopIfManage(e); onSelect('layout.featured.title'); }}
            style={{ fontSize: 28, fontWeight: 900, marginBottom: 32 }}
          >
            What Our Customers Say
          </h2>
          
          <div style={{ background: cardBg, borderRadius: cardRadius, padding: 32, border: `1px solid ${border}` }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{testimonials[currentTestimonial].avatar}</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 12 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} style={{ color: '#facc15', fontSize: 20 }}>★</span>
              ))}
            </div>
            <p style={{ fontSize: 18, fontStyle: 'italic', color: text, marginBottom: 16, lineHeight: 1.6 }}>
              "{testimonials[currentTestimonial].text}"
            </p>
            <div style={{ fontWeight: 700 }}>{testimonials[currentTestimonial].name}</div>
            <div style={{ fontSize: 12, color: muted }}>Verified Buyer</div>
            
            {/* Dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { stopIfManage(e); setCurrentTestimonial(i); }}
                  style={{
                    width: 10, height: 10, borderRadius: '50%', border: 'none',
                    background: i === currentTestimonial ? accent : 'rgba(0,0,0,0.15)',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 24, textAlign: 'center' }}>
            {[
              { icon: '🚚', title: 'Free Shipping', desc: 'On all orders' },
              { icon: '🔒', title: 'Secure Payment', desc: '100% protected' },
              { icon: '💯', title: '30-Day Guarantee', desc: 'Money back' },
              { icon: '🎧', title: '24/7 Support', desc: 'Always here' },
            ].map((item) => (
              <div key={item.title} style={{ padding: 20 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{item.icon}</div>
                <div style={{ fontWeight: 800, marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: muted }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={(e) => { stopIfManage(e); onSelect('layout.footer'); }}
        style={{ borderTop: `1px solid ${border}`, padding: `${baseSpacing}px`, textAlign: 'center' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p
            data-edit-path="layout.footer.copyright"
            onClick={(e) => { stopIfManage(e); onSelect('layout.footer.copyright'); }}
            style={{ fontSize: 13, color: muted }}
          >
            {asString((settings as any).template_copyright) || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`}
          </p>
        </div>
      </footer>
    </div>
  );
}
