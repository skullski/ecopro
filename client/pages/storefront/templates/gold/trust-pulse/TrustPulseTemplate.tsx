import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * TRUST PULSE - High-conversion landing page with countdown timer, testimonials, and trust badges.
 * Design: Urgency bar at top, bold headline, social proof, testimonials carousel, embedded checkout.
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

function parseJsonArray(value: unknown): any[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim().startsWith('[')) {
    try { return JSON.parse(value); } catch { return []; }
  }
  return [];
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
  const s = settings as any; // For easier access to all settings
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

  // Theme colors
  const bg = asString(s.template_bg_color) || '#ffffff';
  const text = asString(s.template_text_color) || '#1a1a2e';
  const muted = asString(s.template_muted_color) || '#6b7280';
  const accent = asString(s.template_accent_color) || '#e63946';
  const cardBg = asString(s.template_card_bg) || '#ffffff';
  const border = 'rgba(0,0,0,0.08)';

  // EDITABLE Content from settings
  const storeName = asString(s.store_name) || 'Trust Pulse';
  const heroTitle = asString(s.template_hero_heading) || 'The #1 Product That Changed Everything';
  const heroSubtitle = asString(s.template_hero_subtitle) || 'Join 10,000+ happy customers who transformed their lives with our revolutionary product.';
  const ctaText = asString(s.template_button_text) || 'Order Now - 50% OFF';
  
  // Urgency bar text
  const urgencyText = asString(s.template_urgency_text) || '🔥 SELLING FAST - Limited Time Offer!';
  const stockText = asString(s.template_stock_text) || 'Only 23 left in stock!';
  
  // Trust badges (editable)
  const badge1 = asString(s.template_badge_1) || '✅ Free Shipping';
  const badge2 = asString(s.template_badge_2) || '🛡️ Money Back Guarantee';
  const badge3 = asString(s.template_badge_3) || '⚡ 24h Delivery';
  
  // Stats (editable)
  const stat1Value = asString(s.template_stat1_value) || '10K+';
  const stat1Label = asString(s.template_stat1_label) || 'Happy Customers';
  const stat2Value = asString(s.template_stat2_value) || '4.9★';
  const stat2Label = asString(s.template_stat2_label) || 'Average Rating';
  const stat3Value = asString(s.template_stat3_value) || '99%';
  const stat3Label = asString(s.template_stat3_label) || 'Satisfaction';
  
  // Section titles (editable)
  const testimonialTitle = asString(s.template_testimonial_title) || 'What Our Customers Say';
  const trustTitle = asString(s.template_trust_title) || 'Why Choose Us';
  
  // Trust features (editable)
  const feature1Icon = asString(s.template_feature1_icon) || '🚚';
  const feature1Title = asString(s.template_feature1_title) || 'Free Shipping';
  const feature1Desc = asString(s.template_feature1_desc) || 'On all orders';
  const feature2Icon = asString(s.template_feature2_icon) || '🔒';
  const feature2Title = asString(s.template_feature2_title) || 'Secure Payment';
  const feature2Desc = asString(s.template_feature2_desc) || '100% protected';
  const feature3Icon = asString(s.template_feature3_icon) || '💯';
  const feature3Title = asString(s.template_feature3_title) || '30-Day Guarantee';
  const feature3Desc = asString(s.template_feature3_desc) || 'Money back';
  const feature4Icon = asString(s.template_feature4_icon) || '🎧';
  const feature4Title = asString(s.template_feature4_title) || '24/7 Support';
  const feature4Desc = asString(s.template_feature4_desc) || 'Always here';
  
  // Testimonials (editable via JSON or individual settings)
  const defaultTestimonials = [
    { name: 'Sarah M.', text: 'This product completely changed my routine. Best purchase ever!', avatar: '👩' },
    { name: 'Ahmed K.', text: 'Exceeded all my expectations. Highly recommend to everyone!', avatar: '👨' },
    { name: 'Lisa R.', text: 'Fast shipping, amazing quality. Will definitely buy again!', avatar: '👩‍🦰' },
  ];
  const testimonials = parseJsonArray(s.template_testimonials).length > 0 
    ? parseJsonArray(s.template_testimonials) 
    : defaultTestimonials;
  
  // Spacing
  const baseSpacing = resolveInt(s.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(s.template_section_spacing, 48, 24, 96);
  const cardRadius = resolveInt(s.template_card_border_radius, 16, 0, 32);
  const buttonRadius = resolveInt(s.template_button_border_radius, 12, 0, 50);

  // Products
  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];
  const mainProduct = products[0];
  const images = productImages(mainProduct);
  const [activeImage, setActiveImage] = React.useState(0);
  
  const storeSlug = asString(s.store_slug);
  const priceValue = mainProduct ? safePrice((mainProduct as any).price) : 0;
  const originalValue = mainProduct ? safePrice((mainProduct as any).original_price) : 0;
  const mainPrice = mainProduct ? formatPrice(priceValue) : '';
  const originalPrice = originalValue > priceValue ? formatPrice(originalValue) : '';

  // Countdown (ends in 24 hours)
  const [countdownTarget] = React.useState(() => new Date(Date.now() + 24 * 60 * 60 * 1000));
  const countdown = useCountdown(countdownTarget);

  const checkoutTheme = { bg, text, muted, accent, cardBg, border };

  const [currentTestimonial, setCurrentTestimonial] = React.useState(0);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

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
      {/* Urgency Bar - Editable */}
      <div
        data-edit-path="layout.hero.badge"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero.badge'); }}
        style={{
          background: `linear-gradient(135deg, ${accent} 0%, #ff6b6b 100%)`,
          color: '#fff',
          padding: isMobile ? '8px 12px' : '10px 16px',
          textAlign: 'center',
          fontSize: isMobile ? 11 : 13,
          fontWeight: 700,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: isMobile ? 6 : 12,
          flexWrap: 'wrap',
        }}
      >
        <span>{urgencyText}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: 6, fontSize: isMobile ? 10 : 12 }}>
            {String(countdown.hours).padStart(2, '0')}h
          </span>
          <span style={{ background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: 6, fontSize: isMobile ? 10 : 12 }}>
            {String(countdown.minutes).padStart(2, '0')}m
          </span>
          <span style={{ background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: 6, fontSize: isMobile ? 10 : 12 }}>
            {String(countdown.seconds).padStart(2, '0')}s
          </span>
        </div>
        <span>{stockText}</span>
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
          padding: isMobile ? '10px 12px' : '12px 20px',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {asString(s.store_logo) ? (
              <img src={asString(s.store_logo)} alt={storeName} style={{ width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, borderRadius: 10, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, borderRadius: 10, background: accent, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: isMobile ? 14 : 16 }}>
                {storeName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <span style={{ fontWeight: 800, fontSize: isMobile ? 13 : 15 }}>{storeName}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: isMobile ? 10 : 12, color: muted }}>⭐ {asString(s.template_rating_text) || '4.9/5 (2,847 reviews)'}</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        data-edit-path="layout.hero"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero'); }}
        style={{ padding: isMobile ? `${sectionSpacing * 0.6}px ${baseSpacing}px` : `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 420px', gap: isMobile ? 20 : 32, alignItems: 'start' }}>
          
          {/* Left: Content */}
          <div>
            {/* Trust badges - Editable */}
            <div
              data-edit-path="layout.hero.kicker"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.kicker'); }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}
            >
              {[badge1, badge2, badge3].filter(Boolean).map((badge) => (
                <span key={badge} style={{ fontSize: isMobile ? 10 : 11, color: muted, background: 'rgba(0,0,0,0.04)', padding: '6px 10px', borderRadius: 20, fontWeight: 600 }}>
                  {badge}
                </span>
              ))}
            </div>

            <h1
              data-edit-path="layout.hero.title"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.title'); }}
              style={{ fontSize: isMobile ? 24 : 42, fontWeight: 900, lineHeight: 1.15, marginBottom: 14 }}
            >
              {heroTitle}
            </h1>
            
            <p
              data-edit-path="layout.hero.subtitle"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.subtitle'); }}
              style={{ fontSize: isMobile ? 14 : 16, color: muted, lineHeight: 1.6, marginBottom: 20, maxWidth: 540 }}
            >
              {heroSubtitle}
            </p>

            {/* Social Proof Stats - Editable */}
            <div
              data-edit-path="layout.categories"
              onClick={(e) => { stopIfManage(e); onSelect('layout.categories'); }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: isMobile ? 8 : 16, marginBottom: 20 }}
            >
              {[
                { value: stat1Value, label: stat1Label },
                { value: stat2Value, label: stat2Label },
                { value: stat3Value, label: stat3Label },
              ].map((stat) => (
                <div key={stat.label} style={{ textAlign: 'center', padding: isMobile ? 10 : 16, background: 'rgba(0,0,0,0.02)', borderRadius: cardRadius }}>
                  <div style={{ fontSize: isMobile ? 18 : 24, fontWeight: 900, color: accent }}>{stat.value}</div>
                  <div style={{ fontSize: isMobile ? 9 : 11, color: muted, fontWeight: 600 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Product Image Gallery - Multiple Images Support */}
            <div
              data-edit-path="layout.hero.image"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
              style={{ background: cardBg, borderRadius: cardRadius, overflow: 'hidden', border: `1px solid ${border}` }}
            >
              <img 
                src={images[activeImage] || images[0]} 
                alt="" 
                style={{ width: '100%', aspectRatio: isMobile ? '4/3' : '16/10', objectFit: 'cover' }} 
              />
              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div style={{ padding: 10, display: 'flex', gap: 8, overflowX: 'auto', background: 'rgba(0,0,0,0.02)' }}>
                  {images.slice(0, 10).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { stopIfManage(e); setActiveImage(idx); }}
                      style={{
                        flex: '0 0 auto',
                        width: isMobile ? 50 : 60,
                        height: isMobile ? 50 : 60,
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
            </div>
          </div>

          {/* Right: Checkout */}
          <div style={{ position: isMobile ? 'relative' : 'sticky', top: isMobile ? 0 : 100 }}>
            {/* Price Display */}
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: cardRadius, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: isMobile ? 26 : 32, fontWeight: 900, color: accent }}>{mainPrice}</span>
                {originalPrice && (
                  <span style={{ fontSize: isMobile ? 16 : 18, color: muted, textDecoration: 'line-through' }}>{originalPrice}</span>
                )}
              </div>
              {originalPrice && (
                <div style={{ fontSize: 13, color: '#16a34a', fontWeight: 700 }}>
                  🎉 {asString(s.template_savings_text) || `You save ${formatPrice(originalValue - priceValue)}!`}
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
              subheading={canManage ? 'Disabled in editor' : (asString(s.template_checkout_subheading) || 'Secure checkout • Free shipping')}
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section - Editable */}
      <section
        data-edit-path="layout.featured"
        onClick={(e) => { stopIfManage(e); onSelect('layout.featured'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, background: 'rgba(0,0,0,0.02)' }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2
            data-edit-path="layout.featured.title"
            onClick={(e) => { stopIfManage(e); onSelect('layout.featured.title'); }}
            style={{ fontSize: isMobile ? 22 : 28, fontWeight: 900, marginBottom: 24 }}
          >
            {testimonialTitle}
          </h2>
          
          <div style={{ background: cardBg, borderRadius: cardRadius, padding: isMobile ? 20 : 32, border: `1px solid ${border}` }}>
            <div style={{ fontSize: isMobile ? 36 : 48, marginBottom: 12 }}>{testimonials[currentTestimonial]?.avatar || '👤'}</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 12 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} style={{ color: '#facc15', fontSize: isMobile ? 16 : 20 }}>★</span>
              ))}
            </div>
            <p style={{ fontSize: isMobile ? 15 : 18, fontStyle: 'italic', color: text, marginBottom: 16, lineHeight: 1.6 }}>
              "{testimonials[currentTestimonial]?.text || 'Great product!'}"
            </p>
            <div style={{ fontWeight: 700 }}>{testimonials[currentTestimonial]?.name || 'Customer'}</div>
            <div style={{ fontSize: 12, color: muted }}>{asString(s.template_verified_text) || 'Verified Buyer'}</div>
            
            {/* Dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
              {testimonials.map((_: any, i: number) => (
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

      {/* Trust Section - Editable */}
      <section
        data-edit-path="layout.grid"
        onClick={(e) => { stopIfManage(e); onSelect('layout.grid'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 900, marginBottom: 24, textAlign: 'center' }}>
            {trustTitle}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? 12 : 24, textAlign: 'center' }}>
            {[
              { icon: feature1Icon, title: feature1Title, desc: feature1Desc },
              { icon: feature2Icon, title: feature2Title, desc: feature2Desc },
              { icon: feature3Icon, title: feature3Title, desc: feature3Desc },
              { icon: feature4Icon, title: feature4Title, desc: feature4Desc },
            ].map((item) => (
              <div key={item.title} style={{ padding: isMobile ? 12 : 20 }}>
                <div style={{ fontSize: isMobile ? 28 : 36, marginBottom: 10 }}>{item.icon}</div>
                <div style={{ fontWeight: 800, marginBottom: 4, fontSize: isMobile ? 12 : 14 }}>{item.title}</div>
                <div style={{ fontSize: isMobile ? 11 : 13, color: muted }}>{item.desc}</div>
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
            {asString(s.template_copyright) || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`}
          </p>
        </div>
      </footer>
    </div>
  );
}
