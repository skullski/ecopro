import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * GLASSMORPHISM - Frosted glass aesthetic landing page.
 * Design: Purple gradient blobs, frosted glass cards, backdrop blur, modern aesthetic.
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

export default function GlassmorphismTemplate(props: TemplateProps) {
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

  // Theme colors - Purple gradient
  const bg = asString(s.template_bg_color) || '#0f0f23';
  const text = asString(s.template_text_color) || '#ffffff';
  const muted = asString(s.template_muted_color) || 'rgba(255,255,255,0.6)';
  const accent = asString(s.template_accent_color) || '#a855f7';
  const cardBg = 'rgba(255,255,255,0.1)';
  const border = 'rgba(255,255,255,0.1)';
  const blobPink = '#ec4899';
  const blobPurple = '#8b5cf6';
  const blobBlue = '#3b82f6';

  // EDITABLE Content from settings
  const storeName = asString(s.store_name) || 'Glassmorphism';
  const heroTitle = asString(s.template_hero_heading) || 'Elegance Meets Innovation';
  const heroSubtitle = asString(s.template_hero_subtitle) || 'Experience the future of design with our premium collection. Crafted for those who appreciate refined aesthetics.';
  const ctaText = asString(s.template_button_text) || 'Explore Now';
  const heroKicker = asString(s.template_hero_kicker) || 'NEW COLLECTION';

  // Features (editable)
  const feature1Title = asString(s.template_feature1_title) || 'Premium Quality';
  const feature1Desc = asString(s.template_feature1_desc) || 'Crafted with the finest materials';
  const feature2Title = asString(s.template_feature2_title) || 'Modern Design';
  const feature2Desc = asString(s.template_feature2_desc) || 'Contemporary aesthetics';
  const feature3Title = asString(s.template_feature3_title) || 'Sustainable';
  const feature3Desc = asString(s.template_feature3_desc) || 'Eco-friendly production';

  // Section title (editable)
  const featuresTitle = asString(s.template_section_title) || 'Why Choose Us';

  // Spacing
  const baseSpacing = resolveInt(s.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(s.template_section_spacing, 56, 24, 96);
  const cardRadius = resolveInt(s.template_card_border_radius, 24, 0, 40);
  const buttonRadius = resolveInt(s.template_button_border_radius, 16, 0, 50);

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
    { title: feature1Title, desc: feature1Desc, icon: '✦' },
    { title: feature2Title, desc: feature2Desc, icon: '◈' },
    { title: feature3Title, desc: feature3Desc, icon: '❖' },
  ];

  const glassStyle = {
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${border}`,
    borderRadius: cardRadius,
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
        fontFamily: 'Inter, system-ui, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Gradient Blobs */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '50%',
          height: '50%',
          background: blobPink,
          borderRadius: '50%',
          filter: 'blur(100px)',
          opacity: 0.4,
          animation: 'blob1 15s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          right: '-10%',
          width: '45%',
          height: '45%',
          background: blobPurple,
          borderRadius: '50%',
          filter: 'blur(100px)',
          opacity: 0.4,
          animation: 'blob2 12s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-20%',
          left: '30%',
          width: '40%',
          height: '40%',
          background: blobBlue,
          borderRadius: '50%',
          filter: 'blur(100px)',
          opacity: 0.3,
          animation: 'blob3 18s ease-in-out infinite',
        }} />
      </div>

      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={(e) => { stopIfManage(e); onSelect('layout.header'); }}
        style={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 30, 
          ...glassStyle,
          borderRadius: 0,
          padding: isMobile ? '12px 16px' : '14px 24px' 
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {asString(s.store_logo) ? (
              <img src={asString(s.store_logo)} alt={storeName} style={{ width: isMobile ? 32 : 38, height: isMobile ? 32 : 38, borderRadius: 12, objectFit: 'cover' }} />
            ) : (
              <span style={{ fontWeight: 700, fontSize: isMobile ? 16 : 20 }}>{storeName}</span>
            )}
          </div>
          <button
            data-edit-path="layout.hero.cta"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.cta'); }}
            style={{ 
              background: `linear-gradient(135deg, ${accent}, ${blobPink})`, 
              color: '#fff', 
              border: 'none', 
              borderRadius: buttonRadius, 
              padding: isMobile ? '8px 18px' : '10px 24px', 
              fontWeight: 600, 
              cursor: 'pointer', 
              fontSize: isMobile ? 12 : 14,
            }}
          >
            {ctaText}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section
        data-edit-path="layout.hero"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero'); }}
        style={{ position: 'relative', zIndex: 10, padding: isMobile ? `${sectionSpacing * 0.6}px ${baseSpacing}px` : `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Title Section */}
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 32 : 48 }}>
            <div
              data-edit-path="layout.hero.kicker"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.kicker'); }}
              style={{ 
                display: 'inline-block',
                ...glassStyle,
                padding: '8px 20px',
                marginBottom: isMobile ? 16 : 20,
                fontSize: isMobile ? 10 : 12,
                fontWeight: 600,
                letterSpacing: 2,
                color: accent,
              }}
            >
              ✦ {heroKicker}
            </div>

            <h1
              data-edit-path="layout.hero.title"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.title'); }}
              style={{ 
                fontSize: isMobile ? 32 : 60, 
                fontWeight: 700, 
                lineHeight: 1.1,
                marginBottom: isMobile ? 16 : 20,
                background: 'linear-gradient(135deg, #fff 0%, #a855f7 50%, #ec4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {heroTitle}
            </h1>

            <p
              data-edit-path="layout.hero.subtitle"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.subtitle'); }}
              style={{ 
                fontSize: isMobile ? 14 : 18, 
                color: muted, 
                maxWidth: 600, 
                margin: '0 auto',
                lineHeight: 1.7,
              }}
            >
              {heroSubtitle}
            </p>
          </div>

          {/* Main Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 380px', gap: isMobile ? 24 : 40, alignItems: 'start' }}>
            
            {/* Left: Product */}
            <div>
              {/* Product Image - Glass Card */}
              <div
                data-edit-path="layout.hero.image"
                onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
                style={{ 
                  ...glassStyle,
                  padding: isMobile ? 12 : 16,
                  marginBottom: 16,
                }}
              >
                <img 
                  src={images[activeImage] || images[0]} 
                  alt="" 
                  style={{ 
                    width: '100%', 
                    aspectRatio: isMobile ? '4/3' : '16/10', 
                    objectFit: 'cover',
                    borderRadius: cardRadius - 8,
                  }} 
                />
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                  {images.slice(0, 10).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { stopIfManage(e); setActiveImage(idx); }}
                      style={{
                        ...glassStyle,
                        width: isMobile ? 52 : 64,
                        height: isMobile ? 52 : 64,
                        padding: 4,
                        cursor: 'pointer',
                        borderColor: idx === activeImage ? accent : border,
                        borderWidth: idx === activeImage ? 2 : 1,
                      }}
                    >
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: cardRadius - 12 }} />
                    </button>
                  ))}
                </div>
              )}

              {/* Features */}
              <div
                data-edit-path="layout.categories"
                onClick={(e) => { stopIfManage(e); onSelect('layout.categories'); }}
              >
                <h3
                  data-edit-path="layout.featured.title"
                  onClick={(e) => { stopIfManage(e); onSelect('layout.featured.title'); }}
                  style={{ fontSize: isMobile ? 16 : 20, fontWeight: 600, marginBottom: isMobile ? 16 : 20 }}
                >
                  {featuresTitle}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 12 : 16 }}>
                  {features.map((f) => (
                    <div key={f.title} style={{ ...glassStyle, padding: isMobile ? 16 : 20, textAlign: 'center' }}>
                      <div style={{ fontSize: isMobile ? 24 : 28, marginBottom: 8, color: accent }}>{f.icon}</div>
                      <div style={{ fontWeight: 600, marginBottom: 4, fontSize: isMobile ? 13 : 15 }}>{f.title}</div>
                      <div style={{ fontSize: isMobile ? 11 : 13, color: muted }}>{f.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Checkout */}
            <div style={{ position: isMobile ? 'relative' : 'sticky', top: isMobile ? 0 : 90 }}>
              <div style={{ ...glassStyle }}>
                <div style={{ 
                  padding: isMobile ? '14px 16px' : '16px 20px', 
                  borderBottom: `1px solid ${border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <span style={{ fontSize: isMobile ? 16 : 18 }}>✦</span>
                  <span style={{ fontWeight: 600, fontSize: isMobile ? 13 : 15 }}>{asString(s.template_checkout_title) || 'Secure Checkout'}</span>
                </div>
                
                <EmbeddedCheckout
                  storeSlug={storeSlug}
                  product={mainProduct as any}
                  formatPrice={formatPrice}
                  theme={checkoutTheme}
                  disabled={canManage}
                  heading={ctaText}
                  subheading={canManage ? 'Disabled in editor' : (asString(s.template_checkout_subheading) || '✦ Free shipping • Easy returns')}
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
        style={{ position: 'relative', zIndex: 10, borderTop: `1px solid ${border}`, padding: `${baseSpacing * 1.5}px ${baseSpacing}px`, textAlign: 'center' }}
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
        @keyframes blob1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes blob2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 30px) scale(1.05); }
          66% { transform: translate(30px, -30px) scale(0.95); }
        }
        @keyframes blob3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, 40px) scale(0.95); }
          66% { transform: translate(-30px, -20px) scale(1.05); }
        }
      `}</style>
    </div>
  );
}
