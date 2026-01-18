import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * LIFESTYLE STORY - Editorial lifestyle landing page with storytelling focus.
 * Design: Full-bleed images, story-driven sections, lifestyle photography style.
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

export default function LifestyleStoryTemplate(props: TemplateProps) {
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

  // Theme - Warm, earthy tones
  const bg = asString(settings.template_bg_color) || '#faf7f2';
  const text = asString(settings.template_text_color) || '#2c2c2c';
  const muted = asString(settings.template_muted_color) || '#8b8680';
  const accent = asString(settings.template_accent_color) || '#c9a87c';
  const cardBg = asString((settings as any).template_card_bg) || '#ffffff';
  const border = 'rgba(0,0,0,0.06)';

  // Content
  const storeName = asString(settings.store_name) || 'Lifestyle Story';
  const heroTitle = asString(settings.template_hero_heading) || 'Crafted for Everyday Moments';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Every product tells a story. Discover pieces designed to elevate your daily rituals.';
  const ctaText = asString(settings.template_button_text) || 'Shop the Collection';

  // Spacing
  const baseSpacing = resolveInt(settings.template_spacing, 20, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 80, 24, 96);
  const cardRadius = resolveInt(settings.template_card_border_radius, 4, 0, 32);

  // Products
  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];
  const mainProduct = products[0];
  const storeSlug = asString((settings as any).store_slug);

  const checkoutTheme = { bg, text, muted, accent, cardBg, border };

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
      style={{ minHeight: '100vh', background: bg, color: text, fontFamily: 'Georgia, serif' }}
    >
      {/* Header - Minimal editorial style */}
      <header
        data-edit-path="layout.header"
        onClick={(e) => { stopIfManage(e); onSelect('layout.header'); }}
        style={{ position: 'sticky', top: 0, zIndex: 30, background: bg, padding: '20px 24px' }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt={storeName} style={{ width: 40, height: 40, borderRadius: 0, objectFit: 'cover' }} />
            ) : null}
            <span style={{ fontWeight: 400, fontSize: 22, letterSpacing: '0.05em' }}>{storeName}</span>
          </div>
          <span style={{ fontSize: 12, color: muted, fontFamily: 'Inter, sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Est. 2024
          </span>
        </div>
      </header>

      {/* Hero - Full bleed image */}
      <section
        data-edit-path="layout.hero"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero'); }}
        style={{ position: 'relative' }}
      >
        <div
          data-edit-path="layout.hero.image"
          onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
          style={{ position: 'relative', aspectRatio: isMobile ? '3/4' : '21/9', overflow: 'hidden' }}
        >
          <img src={productImage(mainProduct)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.4))' }} />
          
          {/* Overlay content */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: isMobile ? '40px 24px' : '80px 60px' }}>
            <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)', marginBottom: 16, fontFamily: 'Inter, sans-serif' }}>
              New Collection
            </p>
            <h1
              data-edit-path="layout.hero.title"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.title'); }}
              style={{ fontSize: isMobile ? 36 : 56, fontWeight: 400, lineHeight: 1.1, color: '#fff', marginBottom: 20, maxWidth: 600 }}
            >
              {heroTitle}
            </h1>
            <p
              data-edit-path="layout.hero.subtitle"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.subtitle'); }}
              style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, maxWidth: 500, fontFamily: 'Inter, sans-serif' }}
            >
              {heroSubtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: muted, marginBottom: 24, fontFamily: 'Inter, sans-serif' }}>
            Our Philosophy
          </p>
          <p style={{ fontSize: isMobile ? 20 : 28, lineHeight: 1.6, fontStyle: 'italic' }}>
            "We believe in the beauty of simplicity. Each piece is thoughtfully designed to become part of your story, 
            growing more meaningful with every use."
          </p>
        </div>
      </section>

      {/* Product + Checkout Split */}
      <section
        data-edit-path="layout.featured"
        onClick={(e) => { stopIfManage(e); onSelect('layout.featured'); }}
        style={{ padding: `0 ${baseSpacing}px ${sectionSpacing}px` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 40 : 60 }}>
          {/* Left - Image */}
          <div style={{ aspectRatio: '4/5', overflow: 'hidden' }}>
            <img src={productImage(mainProduct)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {/* Right - Details + Checkout */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: muted, marginBottom: 16, fontFamily: 'Inter, sans-serif' }}>
              Featured
            </p>
            <h2
              data-edit-path="layout.featured.title"
              onClick={(e) => { stopIfManage(e); onSelect('layout.featured.title'); }}
              style={{ fontSize: 32, fontWeight: 400, marginBottom: 16 }}
            >
              {mainProduct ? String((mainProduct as any).title || 'Featured Product') : 'Featured Product'}
            </h2>
            <p
              data-edit-path="layout.featured.subtitle"
              onClick={(e) => { stopIfManage(e); onSelect('layout.featured.subtitle'); }}
              style={{ fontSize: 15, color: muted, lineHeight: 1.8, marginBottom: 32, fontFamily: 'Inter, sans-serif' }}
            >
              Handcrafted with care, designed to last. This piece embodies our commitment to quality and timeless design.
            </p>

            {/* Features */}
            <div style={{ display: 'grid', gap: 16, marginBottom: 40 }}>
              {['Sustainably sourced materials', 'Handmade by artisans', 'Timeless design'].map((feature) => (
                <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'Inter, sans-serif', fontSize: 14 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent }} />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <EmbeddedCheckout
              storeSlug={storeSlug}
              product={mainProduct as any}
              formatPrice={formatPrice}
              theme={checkoutTheme}
              disabled={canManage}
              heading={ctaText}
              subheading={canManage ? 'Disabled in editor' : 'Free shipping on all orders'}
            />
          </div>
        </div>
      </section>

      {/* Editorial Grid */}
      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, background: cardBg }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 2 }}>
            {products.slice(0, 3).map((p, i) => (
              <div key={i} style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden' }}>
                <img src={productImage(p)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 40, textAlign: 'center' }}>
            {[
              { title: 'Craftsmanship', desc: 'Every piece is made with attention to detail and quality materials.' },
              { title: 'Sustainability', desc: 'We source responsibly and minimize our environmental footprint.' },
              { title: 'Timelessness', desc: 'Designs that transcend trends and grow more beautiful with age.' },
            ].map((value) => (
              <div key={value.title}>
                <h3 style={{ fontSize: 18, fontWeight: 400, marginBottom: 12 }}>{value.title}</h3>
                <p style={{ fontSize: 14, color: muted, lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={(e) => { stopIfManage(e); onSelect('layout.footer'); }}
        style={{ borderTop: `1px solid ${border}`, padding: `${baseSpacing * 2}px ${baseSpacing}px`, textAlign: 'center' }}
      >
        <p
          data-edit-path="layout.footer.copyright"
          onClick={(e) => { stopIfManage(e); onSelect('layout.footer.copyright'); }}
          style={{ fontSize: 12, color: muted, fontFamily: 'Inter, sans-serif' }}
        >
          {asString((settings as any).template_copyright) || `© ${new Date().getFullYear()} ${storeName}`}
        </p>
      </footer>
    </div>
  );
}
