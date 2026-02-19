import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * URGENCY MAX - Maximum urgency/scarcity landing page.
 * Design: Black/red/yellow urgency colors, countdown timers, stock counters, flashing elements.
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

function pad(num: number): string {
  return String(num).padStart(2, '0');
}

type NavLink = { label: string; url: string };
type SocialLink = { platform: string; url: string };

function parseJsonArray<T>(value: unknown, fallback: T[]): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value !== 'string') return fallback;
  const raw = value.trim();
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

export default function UrgencyMaxTemplate(props: TemplateProps) {
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
  const [timeLeft, setTimeLeft] = React.useState({ hours: 2, minutes: 47, seconds: 33 });
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

  // Theme colors - Urgency colors with better defaults
  const bgColor = asString(s.template_bg_color);
  const textColor = asString(s.template_text_color);
  const bg = bgColor && bgColor.length > 0 ? bgColor : '#0a0a0a';
  const text = textColor && textColor.length > 0 ? textColor : '#ffffff';
  const muted = asString(s.template_muted_color) || '#888888';
  const accent = asString(s.template_accent_color) || '#dc2626';
  const cardBg = asString(s.template_card_bg) || '#1a1a1a';
  const border = 'rgba(255,255,255,0.1)';
  const yellow = '#fbbf24';

  // EDITABLE Content from settings - ALL ARABIC
  const storeName = asString(s.store_name) || 'عرض فلاش';
  const heroTitle = asString(s.template_hero_heading) || '⚡ آخر فرصة - خصم 70%';
  const heroSubtitle = asString(s.template_hero_subtitle) || 'هذا العرض المميز ينتهي عندما يصل الموقت إلى الصفر. لا تفوت هذه الفرصة!';
  const ctaText = asString(s.template_button_text) || 'احصل على خصمك الآن';
  const heroKicker = asString(s.template_hero_kicker) || '🔥 بيع سريع جداً';

  // Urgency elements (editable) - ARABIC
  const stockLeft = asString(s.template_stock_count) || '7';
  const stockText = asString(s.template_stock_text) || 'عناصر متبقية بهذا السعر!';
  const viewersText = asString(s.template_viewers_text) || '47 شخص يشاهد هذا العرض الآن';
  const soldTodayText = asString(s.template_sold_today) || '156 عنصر بيع في آخر 24 ساعة';

  // Discount info (editable) - ARABIC
  const originalPrice = asString(s.template_original_price) || '199.99 د.ج';
  const salePrice = asString(s.template_sale_price) || '59.99 د.ج';
  const saveAmount = asString(s.template_save_amount) || 'توفير 140 د.ج!';

  // Benefits (editable) - ARABIC
  const benefit1 = asString(s.template_feature1_title) || '✅ شحن سريع مجاني';
  const benefit2 = asString(s.template_feature2_title) || '✅ ضمان استرجاع الأموال 30 يوم';
  const benefit3 = asString(s.template_feature3_title) || '✅ هدية مميزة في الوقت المحدود';
  const benefit4 = asString(s.template_feature4_title) || '✅ دعم العملاء الأولوي';

  // Warning text (editable) - ARABIC
  const warningText = asString(s.template_warning_text) || '⚠️ السعر يزيد عندما ينتهي الموقت!';

  const navLinks = parseJsonArray<NavLink>(s.template_nav_links, [
    { label: 'الرئيسية', url: '#' },
    { label: 'الأسئلة الشائعة', url: '#faq' },
    { label: 'التواصل', url: '#contact' },
  ]).filter((l) => l && typeof (l as any).label === 'string' && typeof (l as any).url === 'string');

  const footerLinks = parseJsonArray<NavLink>(s.template_footer_links, [
    { label: 'الشحن', url: '#shipping' },
    { label: 'المرتجعات', url: '#returns' },
    { label: 'الدعم', url: '#support' },
  ]).filter((l) => l && typeof (l as any).label === 'string' && typeof (l as any).url === 'string');

  const socialLinks = parseJsonArray<SocialLink>(s.template_social_links, [
    { platform: 'instagram', url: '#' },
    { platform: 'tiktok', url: '#' },
  ]).filter((l) => l && typeof (l as any).platform === 'string' && typeof (l as any).url === 'string');

  const endsInLabel = asString(s.template_timer_ends_label) || 'ينتهي خلال:';
  const countdownHoursLabel = asString(s.template_timer_label_hours) || 'ساعات';
  const countdownMinsLabel = asString(s.template_timer_label_mins) || 'دقائق';
  const countdownSecsLabel = asString(s.template_timer_label_secs) || 'ثوان';

  const saleBadgeText = asString(s.template_discount_badge_text) || 'خصم 70%';
  const stockPrefix = asString(s.template_stock_prefix) || '⚠️ فقط';

  const checkoutSubheading = asString(s.template_checkout_subheading) || '🔒 دفع آمن • وصول فوري';
  const copyrightText = asString(s.template_copyright) || `© ${new Date().getFullYear()} ${storeName}. جميع الحقوق محفوظة.`;

  const trustBadges = parseJsonArray<string>(s.template_trust_badges, ['🔒 آمن', '📦 توصيل سريع', '✅ مضمون']).filter(Boolean);

  // Spacing
  const baseSpacing = resolveInt(s.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(s.template_section_spacing, 48, 24, 96);
  const cardRadius = resolveInt(s.template_card_border_radius, 8, 0, 32);
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

  const benefits = [benefit1, benefit2, benefit3, benefit4].filter(Boolean);

  const settingsButtonText = asString(s.template_settings_button) || 'الإعدادات';
  const prevImageText = asString(s.template_prev_image) || 'السابق';
  const nextImageText = asString(s.template_next_image) || 'التالي';

  return (
    <div
      dir="rtl"
      data-edit-path="__root"
      onClick={() => canManage && onSelect('__root')}
      className="ecopro-storefront"
      style={{
        minHeight: '100vh',
        background: bg,
        color: text,
        backgroundColor: bg,
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        margin: 0,
        padding: 0,
        overflow: 'hidden auto',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <style>{`
        body { background: ${bg} !important; color: ${text} !important; }
        .ecopro-storefront { background: ${bg} !important; color: ${text} !important; }
        .ecopro-storefront * { color: inherit; }
      `}</style>
      {canManage && (
        <button
          type="button"
          data-edit-path="__button.settings"
          onClick={(e) => { stopIfManage(e); onSelect('__button.settings'); }}
          style={{
            position: 'fixed',
            right: 16,
            bottom: 16,
            zIndex: 9999,
            background: '#111827',
            color: '#ffffff',
            border: 'none',
            borderRadius: 9999,
            padding: '10px 14px',
            fontSize: 12,
            letterSpacing: '0.08em',
            cursor: 'pointer',
          }}
        >
          {settingsButtonText}
        </button>
      )}

      {canManage && (
        <div style={{ position: 'absolute', left: -9999, top: 0, width: 1, height: 1, overflow: 'hidden' }}>
          <div data-edit-path="layout.featured" />
          <div data-edit-path="layout.featured.title" />
          <div data-edit-path="layout.featured.subtitle" />
          <div data-edit-path="layout.featured.items" />
          <div data-edit-path="layout.featured.addLabel" />
          <div data-edit-path="layout.grid" />
          <div data-edit-path="layout.footer.links" />
          <div data-edit-path="layout.footer.social" />
        </div>
      )}
      {/* Urgency Bar */}
      <div
        data-edit-path="layout.urgency.topBar"
        onClick={(e) => { stopIfManage(e); onSelect('layout.urgency.topBar'); }}
        style={{
          background: `linear-gradient(90deg, ${accent} 0%, #991b1b 100%)`,
          color: '#fff',
          padding: isMobile ? '10px 12px' : '12px 20px',
          textAlign: 'center',
          fontWeight: 800,
          fontSize: isMobile ? 12 : 14,
          animation: 'pulse 2s infinite',
        }}
      >
        <span
          data-edit-path="layout.urgency.topBar.kicker"
          onClick={(e) => { stopIfManage(e); onSelect('layout.urgency.topBar.kicker'); }}
        >
          {heroKicker}
        </span>
        {' • '}
        <span
          data-edit-path="layout.urgency.topBar.warning"
          onClick={(e) => { stopIfManage(e); onSelect('layout.urgency.topBar.warning'); }}
        >
          {warningText}
        </span>
      </div>

      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={(e) => { stopIfManage(e); onSelect('layout.header'); }}
        style={{
          background: cardBg,
          borderBottom: `1px solid ${border}`,
          padding: isMobile ? '10px 12px' : '12px 20px',
          color: text,
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
            data-edit-path="layout.header.logo"
            onClick={(e) => { stopIfManage(e); onSelect('layout.header.logo'); }}
          >
            {asString(s.store_logo) ? (
              <img src={asString(s.store_logo)} alt={storeName} style={{ width: isMobile ? 32 : 38, height: isMobile ? 32 : 38, borderRadius: 8, objectFit: 'cover' }} />
            ) : (
              <span
                data-edit-path="__settings.store_name"
                onClick={(e) => { stopIfManage(e); onSelect('__settings.store_name'); }}
                style={{ fontWeight: 900, fontSize: isMobile ? 14 : 18, color: accent }}
              >
                {storeName}
              </span>
            )}

            {canManage && asString(s.store_logo) && (
              <span
                data-edit-path="__settings.store_name"
                onClick={(e) => { stopIfManage(e); onSelect('__settings.store_name'); }}
                style={{ fontWeight: 900, fontSize: isMobile ? 14 : 18, color: accent }}
              >
                {storeName}
              </span>
            )}
          </div>
          {/* Mini Timer */}
          <div data-edit-path="layout.urgency.timer" onClick={(e) => { stopIfManage(e); onSelect('layout.urgency.timer'); }} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span data-edit-path="layout.urgency.timer.endsLabel" onClick={(e) => { stopIfManage(e); onSelect('layout.urgency.timer.endsLabel'); }} style={{ fontSize: isMobile ? 10 : 12, color: muted }}>{endsInLabel}</span>
            <span style={{ fontWeight: 900, color: yellow, fontSize: isMobile ? 14 : 16 }}>
              {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
            </span>
          </div>
        </div>

        <div
          data-edit-path="layout.header.nav"
          onClick={(e) => { stopIfManage(e); onSelect('layout.header.nav'); }}
          style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: 14, fontSize: 12, color: muted, flexWrap: 'wrap' }}
        >
          {navLinks.map((l) => (
            <a
              key={`${l.label}-${l.url}`}
              href={l.url}
              onClick={(e) => {
                if (canManage) {
                  stopIfManage(e);
                  onSelect('layout.header.nav');
                }
              }}
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              {l.label}
            </a>
          ))}
        </div>
      </header>

      {/* Hero Section */}
      <section
        data-edit-path="layout.hero"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero'); }}
        style={{
          padding: isMobile ? `${sectionSpacing * 0.6}px ${baseSpacing}px` : `${sectionSpacing}px ${baseSpacing}px`,
          background: bg,
          color: text,
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 20 : 28 }}>
            <div
              data-edit-path="layout.hero.kicker"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.kicker'); }}
              style={{ display: 'inline-block', marginBottom: 10, padding: '6px 10px', borderRadius: 6, border: `1px solid ${border}`, color: yellow, fontWeight: 900, fontSize: isMobile ? 11 : 12 }}
            >
              {heroKicker}
            </div>
            <h1
              data-edit-path="layout.hero.title"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.title'); }}
              style={{ 
                fontSize: isMobile ? 26 : 48, 
                fontWeight: 900, 
                lineHeight: 1.1, 
                marginBottom: 12,
                background: `linear-gradient(135deg, ${yellow} 0%, #fff 50%, ${yellow} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {heroTitle}
            </h1>

            <p
              data-edit-path="layout.hero.subtitle"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.subtitle'); }}
              style={{ fontSize: isMobile ? 14 : 18, color: muted, maxWidth: 600, margin: '0 auto' }}
            >
              {heroSubtitle}
            </p>

            <button
              data-edit-path="layout.hero.cta"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.cta'); }}
              style={{ marginTop: 14, background: yellow, border: 0, borderRadius: buttonRadius, padding: '10px 14px', fontWeight: 900, cursor: 'pointer' }}
            >
              {ctaText}
            </button>
          </div>

          {/* Countdown Timer */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: isMobile ? 8 : 16, 
            marginBottom: isMobile ? 24 : 32 
          }}>
            {[
              { value: timeLeft.hours, label: countdownHoursLabel, key: 'hours' },
              { value: timeLeft.minutes, label: countdownMinsLabel, key: 'mins' },
              { value: timeLeft.seconds, label: countdownSecsLabel, key: 'secs' },
            ].map((item) => (
              <div key={item.key} data-edit-path={`layout.urgency.timer.${item.key}`} onClick={(e) => { stopIfManage(e); onSelect(`layout.urgency.timer.${item.key}`); }} style={{ textAlign: 'center' }}>
                <div style={{ 
                  background: accent, 
                  borderRadius: cardRadius, 
                  padding: isMobile ? '12px 16px' : '16px 24px',
                  minWidth: isMobile ? 60 : 80,
                }}>
                  <div style={{ fontSize: isMobile ? 28 : 44, fontWeight: 900, color: '#fff' }}>{pad(item.value)}</div>
                </div>
                <div
                  data-edit-path={`layout.urgency.timer.${item.key}.label`}
                  onClick={(e) => { stopIfManage(e); onSelect(`layout.urgency.timer.${item.key}.label`); }}
                  style={{ fontSize: isMobile ? 9 : 11, color: muted, marginTop: 6, fontWeight: 700 }}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          {/* Main Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 420px', gap: isMobile ? 24 : 40, alignItems: 'start' }}>
            
            {/* Left: Product */}
            <div>
              {/* Product Image - with click indication */}
              <div
                data-edit-path="layout.hero.image"
                onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
                style={{ 
                  position: 'relative', 
                  borderRadius: cardRadius, 
                  overflow: 'hidden', 
                  border: `2px solid ${accent}`,
                  marginBottom: 16,
                  cursor: images.length > 1 ? 'pointer' : 'default',
                  transition: 'transform 0.2s ease',
                }}
                title={images.length > 1 ? 'اضغط لعرض الصور التالية' : ''}
              >
                <img src={images[activeImage] || images[0]} alt="منتج" style={{ width: '100%', aspectRatio: isMobile ? '4/3' : '16/10', objectFit: 'cover' }} />
                
                {/* Sale badge */}
                <div
                  data-edit-path="layout.urgency.saleBadge"
                  onClick={(e) => { stopIfManage(e); onSelect('layout.urgency.saleBadge'); }}
                  style={{ 
                    position: 'absolute', 
                    top: 16, 
                    right: 16, 
                    background: accent, 
                    color: '#fff', 
                    padding: isMobile ? '8px 12px' : '10px 16px', 
                    borderRadius: 6, 
                    fontWeight: 900, 
                    fontSize: isMobile ? 14 : 18,
                  }}
                >
                  {saleBadgeText}
                </div>

                {/* Stock warning */}
                <div style={{ 
                  position: 'absolute', 
                  bottom: 16, 
                  left: 16, 
                  right: 16,
                  background: 'rgba(0,0,0,0.85)', 
                  padding: isMobile ? '8px 12px' : '10px 16px', 
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span 
                    data-edit-path="layout.urgency.stock"
                    onClick={(e) => { stopIfManage(e); onSelect('layout.urgency.stock'); }}
                    style={{ color: yellow, fontWeight: 700, fontSize: isMobile ? 12 : 14 }}
                  >
                    <span
                      data-edit-path="layout.urgency.stock.prefix"
                      onClick={(e) => { stopIfManage(e); onSelect('layout.urgency.stock.prefix'); }}
                    >
                      {stockPrefix}
                    </span>
                    {' '}
                    <span
                      data-edit-path="layout.urgency.stock.count"
                      onClick={(e) => { stopIfManage(e); onSelect('layout.urgency.stock.count'); }}
                    >
                      {stockLeft}
                    </span>
                    {' '}
                    <span
                      data-edit-path="layout.urgency.stock.text"
                      onClick={(e) => { stopIfManage(e); onSelect('layout.urgency.stock.text'); }}
                    >
                      {stockText}
                    </span>
                  </span>
                </div>
              </div>

              {/* Thumbnail Gallery with Navigation */}
              {images.length > 1 && (
                <div data-edit-path="layout.hero.gallery" onClick={(e) => { stopIfManage(e); onSelect('layout.hero.gallery'); }}>
                  {/* Image Counter */}
                  <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: muted, fontWeight: 600 }}>
                      صورة {activeImage + 1} من {images.length}
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          stopIfManage(e);
                          setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                        }}
                        style={{
                          background: accent,
                          color: '#fff',
                          border: 'none',
                          borderRadius: 4,
                          padding: '4px 8px',
                          cursor: 'pointer',
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {prevImageText}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          stopIfManage(e);
                          setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                        }}
                        style={{
                          background: accent,
                          color: '#fff',
                          border: 'none',
                          borderRadius: 4,
                          padding: '4px 8px',
                          cursor: 'pointer',
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {nextImageText}
                      </button>
                    </div>
                  </div>
                  
                  {/* Thumbnail Gallery */}
                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
                    {images.slice(0, 10).map((img, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => { stopIfManage(e); setActiveImage(idx); }}
                        title={`صورة ${idx + 1}`}
                        style={{
                          width: isMobile ? 48 : 60,
                          height: isMobile ? 48 : 60,
                          borderRadius: 6,
                          border: idx === activeImage ? `2px solid ${accent}` : `1px solid ${border}`,
                          padding: 0,
                          background: 'transparent',
                          cursor: 'pointer',
                          overflow: 'hidden',
                          flexShrink: 0,
                        }}
                      >
                        <img src={img} alt={`صورة ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </button>
                    ))}
                  </div>
                  
                  {/* Image Dots Indicator */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 8 }}>
                    {images.slice(0, 10).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => { stopIfManage(e); setActiveImage(idx); }}
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: idx === activeImage ? accent : border,
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                        title={`صورة ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Social proof */}
              <div
                data-edit-path="layout.urgency.socialProof"
                onClick={(e) => { stopIfManage(e); onSelect('layout.urgency.socialProof'); }}
                style={{ display: 'grid', gap: 8 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: isMobile ? 12 : 14, color: muted }}>
                  <span style={{ color: '#22c55e' }}>👁️</span>
                  <span
                    data-edit-path="layout.urgency.socialProof.viewers"
                    onClick={(e) => { stopIfManage(e); onSelect('layout.urgency.socialProof.viewers'); }}
                  >
                    {viewersText}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: isMobile ? 12 : 14, color: muted }}>
                  <span style={{ color: accent }}>🔥</span>
                  <span
                    data-edit-path="layout.urgency.socialProof.sold"
                    onClick={(e) => { stopIfManage(e); onSelect('layout.urgency.socialProof.sold'); }}
                  >
                    {soldTodayText}
                  </span>
                </div>
              </div>

              {/* Benefits */}
              <div
                data-edit-path="layout.urgency.benefits"
                onClick={(e) => { stopIfManage(e); onSelect('layout.urgency.benefits'); }}
                style={{ display: 'grid', gap: 10, marginTop: 20 }}
              >
                {benefit1 && (
                  <div
                    data-edit-path="layout.urgency.benefits.item1"
                    onClick={(e) => { stopIfManage(e); onSelect('layout.urgency.benefits.item1'); }}
                    style={{ fontSize: isMobile ? 13 : 15, color: '#22c55e', fontWeight: 600 }}
                  >
                    {benefit1}
                  </div>
                )}
                {benefit2 && (
                  <div
                    data-edit-path="layout.urgency.benefits.item2"
                    onClick={(e) => { stopIfManage(e); onSelect('layout.urgency.benefits.item2'); }}
                    style={{ fontSize: isMobile ? 13 : 15, color: '#22c55e', fontWeight: 600 }}
                  >
                    {benefit2}
                  </div>
                )}
                {benefit3 && (
                  <div
                    data-edit-path="layout.urgency.benefits.item3"
                    onClick={(e) => { stopIfManage(e); onSelect('layout.urgency.benefits.item3'); }}
                    style={{ fontSize: isMobile ? 13 : 15, color: '#22c55e', fontWeight: 600 }}
                  >
                    {benefit3}
                  </div>
                )}
                {benefit4 && (
                  <div
                    data-edit-path="layout.urgency.benefits.item4"
                    onClick={(e) => { stopIfManage(e); onSelect('layout.urgency.benefits.item4'); }}
                    style={{ fontSize: isMobile ? 13 : 15, color: '#22c55e', fontWeight: 600 }}
                  >
                    {benefit4}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Checkout */}
            <div style={{ position: isMobile ? 'relative' : 'sticky', top: isMobile ? 0 : 90 }}>
              {/* Price display */}
              <div data-edit-path="layout.urgency.pricing" onClick={(e) => { stopIfManage(e); onSelect('layout.urgency.pricing'); }} style={{ 
                background: cardBg, 
                border: `2px solid ${accent}`, 
                borderRadius: cardRadius, 
                padding: isMobile ? 16 : 20, 
                marginBottom: 16,
                textAlign: 'center',
              }}>
                <div
                  data-edit-path="layout.urgency.pricing.original"
                  onClick={(e) => { stopIfManage(e); onSelect('layout.urgency.pricing.original'); }}
                  style={{ fontSize: isMobile ? 14 : 16, color: muted, textDecoration: 'line-through' }}
                >
                  {originalPrice}
                </div>
                <div
                  data-edit-path="layout.urgency.pricing.sale"
                  onClick={(e) => { stopIfManage(e); onSelect('layout.urgency.pricing.sale'); }}
                  style={{ fontSize: isMobile ? 32 : 44, fontWeight: 900, color: '#22c55e' }}
                >
                  {salePrice}
                </div>
                <div
                  data-edit-path="layout.urgency.pricing.save"
                  onClick={(e) => { stopIfManage(e); onSelect('layout.urgency.pricing.save'); }}
                  style={{ 
                    background: yellow, 
                    color: '#000', 
                    padding: '6px 12px', 
                    borderRadius: 4, 
                    fontWeight: 800, 
                    fontSize: isMobile ? 12 : 14,
                    display: 'inline-block',
                    marginTop: 8,
                  }}
                >
                  {saveAmount}
                </div>
              </div>

              <EmbeddedCheckout
                storeSlug={storeSlug}
                product={mainProduct as any}
                formatPrice={formatPrice}
                theme={checkoutTheme}
                disabled={canManage}
                heading={ctaText}
                subheading={canManage ? 'معطّل في المحرّر' : checkoutSubheading}
                dir="rtl"
              />

              {/* Trust badges */}
              <div data-edit-path="layout.urgency.trustBadges" onClick={(e) => { stopIfManage(e); onSelect('layout.urgency.trustBadges'); }} style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
                {trustBadges.map((badge, idx) => (
                  <span
                    key={idx}
                    data-edit-path={`layout.urgency.trustBadges.item${idx + 1}`}
                    onClick={(e) => { stopIfManage(e); onSelect(`layout.urgency.trustBadges.item${idx + 1}`); }}
                    style={{ fontSize: isMobile ? 10 : 12, color: muted, background: cardBg, padding: '4px 10px', borderRadius: 4 }}
                  >
                    {badge}
                  </span>
                ))}
              </div>
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
          {copyrightText}
        </p>

        {canManage && (
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div data-edit-path="layout.footer.links" onClick={(e) => { stopIfManage(e); onSelect('layout.footer.links'); }} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, color: muted }}>
              {footerLinks.map((l) => (
                <a key={`${l.label}-${l.url}`} href={l.url} onClick={(e) => { stopIfManage(e); onSelect('layout.footer.links'); }} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {l.label}
                </a>
              ))}
            </div>
            <div data-edit-path="layout.footer.social" onClick={(e) => { stopIfManage(e); onSelect('layout.footer.social'); }} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 12, color: muted }}>
              {socialLinks.map((l) => (
                <a key={`${l.platform}-${l.url}`} href={l.url} onClick={(e) => { stopIfManage(e); onSelect('layout.footer.social'); }} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {l.platform}
                </a>
              ))}
            </div>
          </div>
        )}
      </footer>

      {/* CSS Animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
