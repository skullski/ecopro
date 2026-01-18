import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * SOCIAL PROOF - Heavy social proof landing page with live purchase notifications, customer photos, and stats.
 * Design: Floating toast notifications, customer avatar grid, real-time stats, testimonial wall.
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

// Simulated purchase notifications
const FAKE_PURCHASES = [
  { name: 'Karim from Algiers', time: '2 min ago' },
  { name: 'Fatima from Oran', time: '5 min ago' },
  { name: 'Youssef from Constantine', time: '8 min ago' },
  { name: 'Amina from Blida', time: '12 min ago' },
  { name: 'Omar from Annaba', time: '15 min ago' },
];

export default function SocialProofTemplate(props: TemplateProps) {
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

  // Theme
  const bg = asString(settings.template_bg_color) || '#fafafa';
  const text = asString(settings.template_text_color) || '#18181b';
  const muted = asString(settings.template_muted_color) || '#71717a';
  const accent = asString(settings.template_accent_color) || '#7c3aed';
  const cardBg = asString((settings as any).template_card_bg) || '#ffffff';
  const border = 'rgba(0,0,0,0.06)';

  // Content
  const storeName = asString(settings.store_name) || 'Social Proof';
  const heroTitle = asString(settings.template_hero_heading) || 'Join 50,000+ Happy Customers';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'See why everyone is talking about this product. Real reviews from real people.';
  const ctaText = asString(settings.template_button_text) || 'Get Yours Now';

  // Spacing
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 48, 24, 96);
  const cardRadius = resolveInt(settings.template_card_border_radius, 20, 0, 32);

  // Products
  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];
  const mainProduct = products[0];
  const storeSlug = asString((settings as any).store_slug);
  const priceValue = mainProduct ? safePrice((mainProduct as any).price) : 0;
  const originalValue = mainProduct ? safePrice((mainProduct as any).original_price) : 0;

  const checkoutTheme = { bg, text, muted, accent, cardBg, border };

  // Live purchase notification
  const [notification, setNotification] = React.useState<{ name: string; time: string } | null>(null);
  const [notificationVisible, setNotificationVisible] = React.useState(false);
  
  React.useEffect(() => {
    if (canManage) return;
    let idx = 0;
    const show = () => {
      setNotification(FAKE_PURCHASES[idx % FAKE_PURCHASES.length]);
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

  // Customer avatars (simulated)
  const avatars = ['😊', '🙂', '😄', '🤗', '😎', '🥳', '😍', '🤩'];

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
        style={{ position: 'sticky', top: 0, zIndex: 30, background: bg, borderBottom: `1px solid ${border}`, padding: '14px 20px' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt={storeName} style={{ width: 38, height: 38, borderRadius: 12, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg, ${accent}, #a855f7)`, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900 }}>
                {storeName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <span style={{ fontWeight: 800, fontSize: 16 }}>{storeName}</span>
          </div>
          
          {/* Live viewers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: muted }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
            <span>247 people viewing</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        data-edit-path="layout.hero"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 400px', gap: 40, alignItems: 'start' }}>
          
          {/* Left Content */}
          <div>
            {/* Customer avatars row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <div style={{ display: 'flex' }}>
                {avatars.slice(0, 5).map((av, i) => (
                  <div
                    key={i}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${accent}22, #a855f722)`,
                      border: `2px solid ${bg}`,
                      marginLeft: i > 0 ? -10 : 0,
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 16,
                    }}
                  >
                    {av}
                  </div>
                ))}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600 }}>+50,000 happy customers</span>
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

            {/* Rating summary */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1, 2, 3, 4, 5].map((s) => <span key={s} style={{ color: '#facc15', fontSize: 18 }}>★</span>)}
                </div>
                <span style={{ fontWeight: 700 }}>4.9</span>
              </div>
              <span style={{ color: muted, fontSize: 14 }}>Based on 12,847 reviews</span>
            </div>

            {/* Product Image */}
            <div
              data-edit-path="layout.hero.image"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
              style={{ borderRadius: cardRadius, overflow: 'hidden', background: cardBg, border: `1px solid ${border}` }}
            >
              <img src={productImage(mainProduct)} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover' }} />
            </div>

            {/* Recent purchases strip */}
            <div style={{ marginTop: 20, padding: 16, background: 'rgba(0,0,0,0.02)', borderRadius: cardRadius }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1, color: muted }}>
                Recent Purchases
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {FAKE_PURCHASES.slice(0, 3).map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                    <span style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${accent}22, #a855f722)`, display: 'grid', placeItems: 'center', fontSize: 12 }}>
                      {avatars[i]}
                    </span>
                    <span style={{ fontWeight: 600 }}>{p.name}</span>
                    <span style={{ color: muted, fontSize: 11 }}>• {p.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Checkout */}
          <div style={{ position: isMobile ? 'relative' : 'sticky', top: 90 }}>
            {/* Social proof badge */}
            <div style={{ background: `linear-gradient(135deg, ${accent}, #a855f7)`, color: '#fff', padding: '10px 16px', borderRadius: `${cardRadius}px ${cardRadius}px 0 0`, textAlign: 'center', fontWeight: 700, fontSize: 13 }}>
              🔥 2,483 sold this week
            </div>
            
            <EmbeddedCheckout
              storeSlug={storeSlug}
              product={mainProduct as any}
              formatPrice={formatPrice}
              theme={checkoutTheme}
              disabled={canManage}
              heading={ctaText}
              subheading={canManage ? 'Disabled in editor' : '✓ Free shipping • ✓ Secure checkout'}
            />

            {/* Trust icons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16, fontSize: 24 }}>
              <span title="Secure">🔒</span>
              <span title="Fast Delivery">🚀</span>
              <span title="Quality">💎</span>
              <span title="Support">💬</span>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section
        data-edit-path="layout.featured"
        onClick={(e) => { stopIfManage(e); onSelect('layout.featured'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, background: 'rgba(0,0,0,0.02)' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2
            data-edit-path="layout.featured.title"
            onClick={(e) => { stopIfManage(e); onSelect('layout.featured.title'); }}
            style={{ fontSize: 28, fontWeight: 900, textAlign: 'center', marginBottom: 32 }}
          >
            Real Reviews from Real Customers
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { name: 'Amira B.', text: 'Absolutely love it! Fast shipping and exactly as described. Will buy again!', rating: 5 },
              { name: 'Mehdi S.', text: 'Best purchase I\'ve made this year. Quality is outstanding.', rating: 5 },
              { name: 'Sara K.', text: 'Exceeded my expectations. Customer service was also excellent.', rating: 5 },
              { name: 'Yacine L.', text: 'Great value for money. Recommended to all my friends already!', rating: 5 },
              { name: 'Nadia R.', text: 'Perfect gift! The packaging was beautiful and delivery was quick.', rating: 5 },
              { name: 'Kamel M.', text: 'This product is amazing. I use it every day now!', rating: 5 },
            ].map((review, i) => (
              <div key={i} style={{ background: cardBg, borderRadius: cardRadius, padding: 20, border: `1px solid ${border}` }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                  {[1, 2, 3, 4, 5].map((s) => <span key={s} style={{ color: '#facc15', fontSize: 14 }}>★</span>)}
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>"{review.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${accent}22, #a855f722)`, display: 'grid', placeItems: 'center', fontSize: 14 }}>
                    {avatars[i % avatars.length]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{review.name}</div>
                    <div style={{ fontSize: 11, color: '#22c55e' }}>✓ Verified Purchase</div>
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
          style={{ fontSize: 13, color: muted }}
        >
          {asString((settings as any).template_copyright) || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`}
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
