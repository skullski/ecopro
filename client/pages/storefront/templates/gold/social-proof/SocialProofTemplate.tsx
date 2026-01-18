import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * SOCIAL PROOF - Heavy social proof landing page with live purchase notifications, customer photos, and stats.
 * Design: Floating toast notifications, customer avatar grid, real-time stats, testimonial wall.
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

export default function SocialProofTemplate(props: TemplateProps) {
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

  // Theme colors
  const bg = asString(s.template_bg_color) || '#fafafa';
  const text = asString(s.template_text_color) || '#18181b';
  const muted = asString(s.template_muted_color) || '#71717a';
  const accent = asString(s.template_accent_color) || '#7c3aed';
  const cardBg = asString(s.template_card_bg) || '#ffffff';
  const border = 'rgba(0,0,0,0.06)';

  // EDITABLE Content from settings
  const storeName = asString(s.store_name) || 'Social Proof';
  const heroTitle = asString(s.template_hero_heading) || 'Join 50,000+ Happy Customers';
  const heroSubtitle = asString(s.template_hero_subtitle) || 'See why everyone is talking about this product. Real reviews from real people.';
  const ctaText = asString(s.template_button_text) || 'Get Yours Now';

  // Live viewing text (editable)
  const liveViewText = asString(s.template_live_view_text) || '247 people viewing';

  // Stats (editable)
  const stat1Value = asString(s.template_stat1_value) || '50K+';
  const stat1Label = asString(s.template_stat1_label) || 'Happy Customers';
  const stat2Value = asString(s.template_stat2_value) || '4.9★';
  const stat2Label = asString(s.template_stat2_label) || 'Average Rating';
  const stat3Value = asString(s.template_stat3_value) || '12,847';
  const stat3Label = asString(s.template_stat3_label) || 'Reviews';

  // Section titles (editable)
  const reviewsTitle = asString(s.template_testimonial_title) || 'Real Reviews from Real Customers';
  const recentPurchasesTitle = asString(s.template_section_title) || 'Recent Purchases';
  const socialBadgeText = asString(s.template_social_badge_text) || '🔥 2,483 sold this week';

  // Reviews (editable via JSON or individual settings)
  const defaultReviews = [
    { name: 'Amira B.', text: 'Absolutely love it! Fast shipping and exactly as described. Will buy again!', rating: 5 },
    { name: 'Mehdi S.', text: 'Best purchase I\'ve made this year. Quality is outstanding.', rating: 5 },
    { name: 'Sara K.', text: 'Exceeded my expectations. Customer service was also excellent.', rating: 5 },
    { name: 'Yacine L.', text: 'Great value for money. Recommended to all my friends already!', rating: 5 },
    { name: 'Nadia R.', text: 'Perfect gift! The packaging was beautiful and delivery was quick.', rating: 5 },
    { name: 'Kamel M.', text: 'This product is amazing. I use it every day now!', rating: 5 },
  ];
  const reviews = parseJsonArray(s.template_reviews).length > 0 
    ? parseJsonArray(s.template_reviews) 
    : defaultReviews;

  // Recent purchases (editable)
  const defaultPurchases = [
    { name: 'Karim from Algiers', time: '2 min ago' },
    { name: 'Fatima from Oran', time: '5 min ago' },
    { name: 'Youssef from Constantine', time: '8 min ago' },
  ];
  const recentPurchases = parseJsonArray(s.template_recent_purchases).length > 0 
    ? parseJsonArray(s.template_recent_purchases) 
    : defaultPurchases;

  // Spacing
  const baseSpacing = resolveInt(s.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(s.template_section_spacing, 48, 24, 96);
  const cardRadius = resolveInt(s.template_card_border_radius, 20, 0, 32);
  const buttonRadius = resolveInt(s.template_button_border_radius, 12, 0, 50);

  // Products
  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];
  const mainProduct = products[0];
  const images = productImages(mainProduct);
  const [activeImage, setActiveImage] = React.useState(0);

  const storeSlug = asString(s.store_slug);
  const priceValue = mainProduct ? safePrice((mainProduct as any).price) : 0;
  const originalValue = mainProduct ? safePrice((mainProduct as any).original_price) : 0;

  const checkoutTheme = { bg, text, muted, accent, cardBg, border };

  // Avatars (simulated)
  const avatars = ['😊', '🙂', '😄', '🤗', '😎', '🥳', '😍', '🤩'];

  // Live purchase notification
  const [notification, setNotification] = React.useState<{ name: string; time: string } | null>(null);
  const [notificationVisible, setNotificationVisible] = React.useState(false);
  
  React.useEffect(() => {
    if (canManage) return;
    let idx = 0;
    const show = () => {
      setNotification(recentPurchases[idx % recentPurchases.length]);
      setNotificationVisible(true);
      idx++;
      setTimeout(() => setNotificationVisible(false), 4000);
    };
    const interval = setInterval(show, 8000);
    setTimeout(show, 3000);
    return () => clearInterval(interval);
  }, [canManage]);

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
      style={{ minHeight: '100vh', background: bg, color: text, fontFamily: 'Inter, system-ui, sans-serif', position: 'relative' }}
    >
      {/* Floating Purchase Notification */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            left: 20,
            background: cardBg,
            borderRadius: 16,
            padding: '12px 16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            zIndex: 100,
            transform: notificationVisible ? 'translateX(0)' : 'translateX(-120%)',
            opacity: notificationVisible ? 1 : 0,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            maxWidth: 320,
          }}
        >
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${accent}, #a855f7)`, display: 'grid', placeItems: 'center', color: '#fff', fontSize: 18 }}>
            ✓
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{notification.name}</div>
            <div style={{ fontSize: 11, color: muted }}>Just purchased • {notification.time}</div>
          </div>
        </div>
      )}

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
          padding: isMobile ? '10px 12px' : '14px 20px',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {asString(s.store_logo) ? (
              <img src={asString(s.store_logo)} alt={storeName} style={{ width: isMobile ? 32 : 38, height: isMobile ? 32 : 38, borderRadius: 12, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: isMobile ? 32 : 38, height: isMobile ? 32 : 38, borderRadius: 12, background: `linear-gradient(135deg, ${accent}, #a855f7)`, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: isMobile ? 14 : 16 }}>
                {storeName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <span style={{ fontWeight: 800, fontSize: isMobile ? 14 : 16 }}>{storeName}</span>
          </div>
          
          {/* Live viewers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: isMobile ? 10 : 12, color: muted }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
            <span>{liveViewText}</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        data-edit-path="layout.hero"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero'); }}
        style={{ padding: isMobile ? `${sectionSpacing * 0.6}px ${baseSpacing}px` : `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 400px', gap: isMobile ? 24 : 40, alignItems: 'start' }}>
          
          {/* Left Content */}
          <div>
            {/* Customer avatars row */}
            <div
              data-edit-path="layout.hero.kicker"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.kicker'); }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}
            >
              <div style={{ display: 'flex' }}>
                {avatars.slice(0, 5).map((av, i) => (
                  <div
                    key={i}
                    style={{
                      width: isMobile ? 28 : 36,
                      height: isMobile ? 28 : 36,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${accent}22, #a855f722)`,
                      border: `2px solid ${bg}`,
                      marginLeft: i > 0 ? -10 : 0,
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: isMobile ? 12 : 16,
                    }}
                  >
                    {av}
                  </div>
                ))}
              </div>
              <span style={{ fontSize: isMobile ? 11 : 13, fontWeight: 600 }}>+{stat1Value} {stat1Label.toLowerCase()}</span>
            </div>

            <h1
              data-edit-path="layout.hero.title"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.title'); }}
              style={{ fontSize: isMobile ? 26 : 48, fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}
            >
              {heroTitle}
            </h1>

            <p
              data-edit-path="layout.hero.subtitle"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.subtitle'); }}
              style={{ fontSize: isMobile ? 14 : 17, color: muted, lineHeight: 1.6, marginBottom: 24 }}
            >
              {heroSubtitle}
            </p>

            {/* Rating summary - Social Proof Stats */}
            <div
              data-edit-path="layout.categories"
              onClick={(e) => { stopIfManage(e); onSelect('layout.categories'); }}
              style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 16, marginBottom: 32, flexWrap: 'wrap' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1, 2, 3, 4, 5].map((star) => <span key={star} style={{ color: '#facc15', fontSize: isMobile ? 14 : 18 }}>★</span>)}
                </div>
                <span style={{ fontWeight: 700, fontSize: isMobile ? 13 : 15 }}>{stat2Value}</span>
              </div>
              <span style={{ color: muted, fontSize: isMobile ? 12 : 14 }}>Based on {stat3Value} {stat3Label.toLowerCase()}</span>
            </div>

            {/* Product Image Gallery - Multiple Images Support */}
            <div
              data-edit-path="layout.hero.image"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
              style={{ borderRadius: cardRadius, overflow: 'hidden', background: cardBg, border: `1px solid ${border}` }}
            >
              <img 
                src={images[activeImage] || images[0]} 
                alt="" 
                style={{ width: '100%', aspectRatio: isMobile ? '4/3' : '4/3', objectFit: 'cover' }} 
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
            </div>

            {/* Recent purchases strip */}
            <div style={{ marginTop: 20, padding: isMobile ? 12 : 16, background: 'rgba(0,0,0,0.02)', borderRadius: cardRadius }}>
              <div style={{ fontSize: isMobile ? 10 : 12, fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1, color: muted }}>
                {recentPurchasesTitle}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentPurchases.slice(0, 3).map((p: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: isMobile ? 11 : 13 }}>
                    <span style={{ width: isMobile ? 24 : 28, height: isMobile ? 24 : 28, borderRadius: '50%', background: `linear-gradient(135deg, ${accent}22, #a855f722)`, display: 'grid', placeItems: 'center', fontSize: isMobile ? 10 : 12 }}>
                      {avatars[i]}
                    </span>
                    <span style={{ fontWeight: 600 }}>{p.name}</span>
                    <span style={{ color: muted, fontSize: isMobile ? 9 : 11 }}>• {p.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Checkout */}
          <div style={{ position: isMobile ? 'relative' : 'sticky', top: isMobile ? 0 : 90 }}>
            {/* Social proof badge */}
            <div
              data-edit-path="layout.hero.badge"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.badge'); }}
              style={{ background: `linear-gradient(135deg, ${accent}, #a855f7)`, color: '#fff', padding: isMobile ? '8px 12px' : '10px 16px', borderRadius: `${cardRadius}px ${cardRadius}px 0 0`, textAlign: 'center', fontWeight: 700, fontSize: isMobile ? 11 : 13 }}
            >
              {socialBadgeText}
            </div>
            
            <EmbeddedCheckout
              storeSlug={storeSlug}
              product={mainProduct as any}
              formatPrice={formatPrice}
              theme={checkoutTheme}
              disabled={canManage}
              heading={ctaText}
              subheading={canManage ? 'Disabled in editor' : (asString(s.template_checkout_subheading) || '✓ Free shipping • ✓ Secure checkout')}
            />

            {/* Trust icons */}
            <div
              data-edit-path="layout.grid"
              onClick={(e) => { stopIfManage(e); onSelect('layout.grid'); }}
              style={{ display: 'flex', justifyContent: 'center', gap: isMobile ? 12 : 16, marginTop: 16, fontSize: isMobile ? 20 : 24 }}
            >
              <span title="Secure">🔒</span>
              <span title="Fast Delivery">🚀</span>
              <span title="Quality">💎</span>
              <span title="Support">💬</span>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Grid - Editable */}
      <section
        data-edit-path="layout.featured"
        onClick={(e) => { stopIfManage(e); onSelect('layout.featured'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, background: 'rgba(0,0,0,0.02)' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2
            data-edit-path="layout.featured.title"
            onClick={(e) => { stopIfManage(e); onSelect('layout.featured.title'); }}
            style={{ fontSize: isMobile ? 20 : 28, fontWeight: 900, textAlign: 'center', marginBottom: isMobile ? 24 : 32 }}
          >
            {reviewsTitle}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 12 : 16 }}>
            {reviews.slice(0, 6).map((review: any, i: number) => (
              <div key={i} style={{ background: cardBg, borderRadius: cardRadius, padding: isMobile ? 16 : 20, border: `1px solid ${border}` }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                  {[1, 2, 3, 4, 5].map((star) => <span key={star} style={{ color: '#facc15', fontSize: isMobile ? 12 : 14 }}>★</span>)}
                </div>
                <p style={{ fontSize: isMobile ? 12 : 14, lineHeight: 1.6, marginBottom: 12 }}>"{review.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: isMobile ? 28 : 32, height: isMobile ? 28 : 32, borderRadius: '50%', background: `linear-gradient(135deg, ${accent}22, #a855f722)`, display: 'grid', placeItems: 'center', fontSize: isMobile ? 12 : 14 }}>
                    {avatars[i % avatars.length]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: isMobile ? 11 : 13 }}>{review.name}</div>
                    <div style={{ fontSize: isMobile ? 9 : 11, color: '#22c55e' }}>✓ {asString(s.template_verified_text) || 'Verified Purchase'}</div>
                  </div>
                </div>
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
        <p
          data-edit-path="layout.footer.copyright"
          onClick={(e) => { stopIfManage(e); onSelect('layout.footer.copyright'); }}
          style={{ fontSize: isMobile ? 11 : 13, color: muted }}
        >
          {asString(s.template_copyright) || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`}
        </p>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
