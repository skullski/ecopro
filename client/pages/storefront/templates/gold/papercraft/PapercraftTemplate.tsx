import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * PAPERCRAFT - Paper/cardboard aesthetic landing page.
 * Design: Paper textures, dashed borders, shadow layers, Patrick Hand font, craft aesthetic.
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

export default function PapercraftTemplate(props: TemplateProps) {
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

  // Theme colors - Paper/craft aesthetic
  const bg = asString(s.template_bg_color) || '#fef3c7';
  const text = asString(s.template_text_color) || '#44403c';
  const muted = asString(s.template_muted_color) || '#78716c';
  const accent = asString(s.template_accent_color) || '#ea580c';
  const cardBg = asString(s.template_card_bg) || '#fffbeb';
  const border = '#d6d3d1';
  const paperShadow = '#a8a29e';

  // EDITABLE Content from settings
  const storeName = asString(s.store_name) || 'Papercraft';
  const heroTitle = asString(s.template_hero_heading) || 'Handcrafted with Love';
  const heroSubtitle = asString(s.template_hero_subtitle) || 'Every piece tells a story. Discover our collection of artisanal creations made with care and attention to detail.';
  const ctaText = asString(s.template_button_text) || 'Shop Now';
  const heroKicker = asString(s.template_hero_kicker) || '✂️ Handmade Goods';

  // Features (editable)
  const feature1 = asString(s.template_feature1_title) || '✋ Handcrafted';
  const feature1Desc = asString(s.template_feature1_desc) || 'Made by real artisans';
  const feature2 = asString(s.template_feature2_title) || '🌿 Sustainable';
  const feature2Desc = asString(s.template_feature2_desc) || 'Eco-friendly materials';
  const feature3 = asString(s.template_feature3_title) || '🎁 Gift Ready';
  const feature3Desc = asString(s.template_feature3_desc) || 'Beautiful packaging';

  // Testimonial (editable)
  const testimonialText = asString(s.template_testimonial_text) || '"The most beautiful handmade products I\'ve ever received. The attention to detail is incredible!"';
  const testimonialAuthor = asString(s.template_testimonial_author) || '— Sarah M.';

  const navLinks = parseJsonArray<NavLink>(s.template_nav_links, [
    { label: 'Home', url: '#' },
    { label: 'Shop', url: '#products' },
    { label: 'Contact', url: '#contact' },
  ]).filter((l) => l && typeof (l as any).label === 'string' && typeof (l as any).url === 'string');

  const footerLinks = parseJsonArray<NavLink>(s.template_footer_links, [
    { label: 'Shipping', url: '#shipping' },
    { label: 'Returns', url: '#returns' },
    { label: 'Contact', url: '#contact' },
  ]).filter((l) => l && typeof (l as any).label === 'string' && typeof (l as any).url === 'string');

  const socialLinks = parseJsonArray<SocialLink>(s.template_social_links, [
    { platform: 'instagram', url: '#' },
    { platform: 'tiktok', url: '#' },
  ]).filter((l) => l && typeof (l as any).platform === 'string' && typeof (l as any).url === 'string');

  // Spacing
  const baseSpacing = resolveInt(s.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(s.template_section_spacing, 48, 24, 96);
  const cardRadius = resolveInt(s.template_card_border_radius, 8, 0, 32);
  const buttonRadius = resolveInt(s.template_button_border_radius, 4, 0, 50);

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

  const features = [
    { title: feature1, desc: feature1Desc },
    { title: feature2, desc: feature2Desc },
    { title: feature3, desc: feature3Desc },
  ];

  // Paper card style with layered shadow
  const paperCardStyle = {
    background: cardBg,
    border: `2px dashed ${border}`,
    borderRadius: cardRadius,
    position: 'relative' as const,
  };

  const paperShadowStyle = {
    content: '""',
    position: 'absolute' as const,
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    background: paperShadow,
    borderRadius: cardRadius,
    zIndex: -1,
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
        fontFamily: '"Patrick Hand", "Comic Sans MS", cursive',
        backgroundImage: `
          radial-gradient(circle at 20% 80%, rgba(234,88,12,0.08) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(120,113,108,0.08) 0%, transparent 50%)
        `,
      }}
    >
      {canManage && (
        <button
          type="button"
          data-edit-path="__settings"
          onClick={(e) => { stopIfManage(e); onSelect('__settings'); }}
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
          Settings
        </button>
      )}

      {canManage && (
        <div style={{ position: 'absolute', left: -9999, top: 0, width: 1, height: 1, overflow: 'hidden' }}>
          <div data-edit-path="layout.featured" />
          <div data-edit-path="layout.featured.title" />
          <div data-edit-path="layout.featured.subtitle" />
          <div data-edit-path="layout.featured.items" />
          <div data-edit-path="layout.featured.addLabel" />
          <div data-edit-path="layout.footer.links" />
          <div data-edit-path="layout.footer.social" />
        </div>
      )}
      {/* Load Patrick Hand font */}
      <link href="https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap" rel="stylesheet" />

      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={(e) => { stopIfManage(e); onSelect('layout.header'); }}
        style={{ 
          borderBottom: `2px dashed ${border}`, 
          padding: isMobile ? '12px 16px' : '14px 24px',
          background: cardBg,
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
            data-edit-path="layout.header.logo"
            onClick={(e) => { stopIfManage(e); onSelect('layout.header.logo'); }}
          >
            {asString(s.store_logo) ? (
              <img src={asString(s.store_logo)} alt={storeName} style={{ width: isMobile ? 36 : 44, height: isMobile ? 36 : 44, borderRadius: '50%', objectFit: 'cover', border: `2px dashed ${border}` }} />
            ) : (
              <span
                style={{ fontSize: isMobile ? 20 : 26, fontWeight: 400 }}
                data-edit-path="__settings.store_name"
                onClick={(e) => { stopIfManage(e); onSelect('__settings.store_name'); }}
              >
                ✂️ {storeName}
              </span>
            )}

            {canManage && asString(s.store_logo) && (
              <span
                data-edit-path="__settings.store_name"
                onClick={(e) => { stopIfManage(e); onSelect('__settings.store_name'); }}
                style={{ fontSize: isMobile ? 18 : 22, fontWeight: 400 }}
              >
                {storeName}
              </span>
            )}
          </div>
          <button
            data-edit-path="layout.hero.cta"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.cta'); }}
            style={{ 
              background: accent, 
              color: '#fff', 
              border: 'none', 
              borderRadius: buttonRadius, 
              padding: isMobile ? '8px 18px' : '10px 24px', 
              fontFamily: 'inherit',
              fontSize: isMobile ? 14 : 16,
              cursor: 'pointer',
              boxShadow: `3px 3px 0 ${paperShadow}`,
            }}
          >
            {ctaText}
          </button>
        </div>

        <div
          data-edit-path="layout.header.nav"
          onClick={(e) => { stopIfManage(e); onSelect('layout.header.nav'); }}
          style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: 14, fontSize: 14, color: muted, flexWrap: 'wrap' }}
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
        style={{ padding: isMobile ? `${sectionSpacing * 0.6}px ${baseSpacing}px` : `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Title Section */}
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 28 : 40 }}>
            <div
              data-edit-path="layout.hero.kicker"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.kicker'); }}
              style={{ 
                display: 'inline-block',
                background: cardBg,
                border: `2px dashed ${border}`,
                padding: '8px 20px',
                marginBottom: isMobile ? 16 : 20,
                fontSize: isMobile ? 14 : 16,
                transform: 'rotate(-2deg)',
              }}
            >
              {heroKicker}
            </div>

            <h1
              data-edit-path="layout.hero.title"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.title'); }}
              style={{ 
                fontSize: isMobile ? 32 : 56, 
                fontWeight: 400, 
                lineHeight: 1.2,
                marginBottom: isMobile ? 12 : 16,
              }}
            >
              {heroTitle}
            </h1>

            <p
              data-edit-path="layout.hero.subtitle"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.subtitle'); }}
              style={{ 
                fontSize: isMobile ? 16 : 20, 
                color: muted, 
                maxWidth: 550, 
                margin: '0 auto',
                lineHeight: 1.6,
              }}
            >
              {heroSubtitle}
            </p>
          </div>

          {/* Main Layout */}
          <div
            style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 360px', gap: isMobile ? 24 : 36, alignItems: 'start' }}
            data-edit-path="layout.grid"
            onClick={(e) => { stopIfManage(e); onSelect('layout.grid'); }}
          >
            
            {/* Left: Product */}
            <div>
              {/* Product Image - Paper card */}
              <div
                data-edit-path="layout.hero.image"
                onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
                style={{ 
                  ...paperCardStyle,
                  padding: isMobile ? 12 : 16,
                  marginBottom: 20,
                }}
              >
                {/* Shadow layer */}
                <div style={paperShadowStyle} />
                
                <img 
                  src={images[activeImage] || images[0]} 
                  alt="" 
                  style={{ 
                    width: '100%', 
                    aspectRatio: isMobile ? '4/3' : '16/10', 
                    objectFit: 'cover',
                    borderRadius: cardRadius - 4,
                    border: `1px solid ${border}`,
                  }} 
                />

                {/* Tape decorations */}
                <div style={{
                  position: 'absolute',
                  top: -8,
                  left: '20%',
                  width: 60,
                  height: 20,
                  background: 'rgba(254,243,199,0.9)',
                  transform: 'rotate(-5deg)',
                  border: `1px dashed ${border}`,
                }} />
                <div style={{
                  position: 'absolute',
                  top: -8,
                  right: '20%',
                  width: 60,
                  height: 20,
                  background: 'rgba(254,243,199,0.9)',
                  transform: 'rotate(5deg)',
                  border: `1px dashed ${border}`,
                }} />
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                  {images.slice(0, 10).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { stopIfManage(e); setActiveImage(idx); }}
                      style={{
                        width: isMobile ? 50 : 64,
                        height: isMobile ? 50 : 64,
                        borderRadius: cardRadius,
                        border: idx === activeImage ? `2px solid ${accent}` : `2px dashed ${border}`,
                        padding: 4,
                        background: cardBg,
                        cursor: 'pointer',
                        overflow: 'hidden',
                        boxShadow: idx === activeImage ? `3px 3px 0 ${accent}40` : 'none',
                      }}
                    >
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: cardRadius - 4 }} />
                    </button>
                  ))}
                </div>
              )}

              {/* Features */}
              <div
                data-edit-path="layout.categories"
                onClick={(e) => { stopIfManage(e); onSelect('layout.categories'); }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 12 : 16 }}>
                  {features.map((f, idx) => (
                    <div 
                      key={f.title} 
                      data-edit-path={`layout.features.${idx}`}
                      onClick={(e) => { stopIfManage(e); onSelect(`layout.features.${idx}`); }}
                      style={{ 
                        ...paperCardStyle, 
                        padding: isMobile ? 14 : 18,
                        textAlign: 'center',
                        transform: `rotate(${idx % 2 === 0 ? -1 : 1}deg)`,
                      }}
                    >
                      <div style={paperShadowStyle} />
                      <div
                        data-edit-path={`layout.features.${idx}.title`}
                        onClick={(e) => { stopIfManage(e); onSelect(`layout.features.${idx}.title`); }}
                        style={{ fontSize: isMobile ? 16 : 18, marginBottom: 6 }}
                      >
                        {f.title}
                      </div>
                      <div
                        data-edit-path={`layout.features.${idx}.desc`}
                        onClick={(e) => { stopIfManage(e); onSelect(`layout.features.${idx}.desc`); }}
                        style={{ fontSize: isMobile ? 12 : 14, color: muted }}
                      >
                        {f.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Testimonial */}
              <div
                data-edit-path="layout.hero.badge"
                onClick={(e) => { stopIfManage(e); onSelect('layout.hero.badge'); }}
                style={{ 
                  ...paperCardStyle,
                  padding: isMobile ? 18 : 24,
                  marginTop: 24,
                  transform: 'rotate(1deg)',
                }}
              >
                <div style={paperShadowStyle} />
                <p
                  data-edit-path="layout.testimonial.text"
                  onClick={(e) => { stopIfManage(e); onSelect('layout.testimonial.text'); }}
                  style={{ fontSize: isMobile ? 16 : 20, fontStyle: 'italic', marginBottom: 8, lineHeight: 1.5 }}
                >
                  {testimonialText}
                </p>
                <p
                  data-edit-path="layout.testimonial.author"
                  onClick={(e) => { stopIfManage(e); onSelect('layout.testimonial.author'); }}
                  style={{ fontSize: isMobile ? 14 : 16, color: accent }}
                >
                  {testimonialAuthor}
                </p>
              </div>
            </div>

            {/* Right: Checkout */}
            <div style={{ position: isMobile ? 'relative' : 'sticky', top: isMobile ? 0 : 90 }}>
              <div style={{ ...paperCardStyle, overflow: 'hidden' }}>
                <div style={paperShadowStyle} />
                
                <div style={{ 
                  borderBottom: `2px dashed ${border}`, 
                  padding: isMobile ? '12px 16px' : '14px 20px',
                  background: `linear-gradient(90deg, ${accent}15, transparent)`,
                }}>
                  <span
                    data-edit-path="layout.checkout.title"
                    onClick={(e) => { stopIfManage(e); onSelect('layout.checkout.title'); }}
                    style={{ fontSize: isMobile ? 16 : 18 }}
                  >
                    🛒 {asString(s.template_checkout_title) || 'Your Order'}
                  </span>
                </div>
                
                <EmbeddedCheckout
                  storeSlug={storeSlug}
                  product={mainProduct as any}
                  formatPrice={formatPrice}
                  theme={checkoutTheme}
                  disabled={canManage}
                  heading={ctaText}
                  subheading={canManage ? 'Disabled in editor' : (asString(s.template_checkout_subheading) || '✂️ Each order wrapped with care')}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={(e) => { stopIfManage(e); onSelect('layout.footer'); }}
        style={{ borderTop: `2px dashed ${border}`, padding: `${baseSpacing * 1.5}px ${baseSpacing}px`, textAlign: 'center', background: cardBg }}
      >
        <p
          data-edit-path="layout.footer.copyright"
          onClick={(e) => { stopIfManage(e); onSelect('layout.footer.copyright'); }}
          style={{ fontSize: isMobile ? 14 : 16, color: muted }}
        >
          {asString(s.template_copyright) || `© ${new Date().getFullYear()} ${storeName} ✂️ Made with love`}
        </p>

        {canManage && (
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div data-edit-path="layout.footer.links" onClick={(e) => { stopIfManage(e); onSelect('layout.footer.links'); }} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 14, color: muted }}>
              {footerLinks.map((l) => (
                <a key={`${l.label}-${l.url}`} href={l.url} onClick={(e) => { stopIfManage(e); onSelect('layout.footer.links'); }} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {l.label}
                </a>
              ))}
            </div>
            <div data-edit-path="layout.footer.social" onClick={(e) => { stopIfManage(e); onSelect('layout.footer.social'); }} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 14, color: muted }}>
              {socialLinks.map((l) => (
                <a key={`${l.platform}-${l.url}`} href={l.url} onClick={(e) => { stopIfManage(e); onSelect('layout.footer.social'); }} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {l.platform}
                </a>
              ))}
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}
