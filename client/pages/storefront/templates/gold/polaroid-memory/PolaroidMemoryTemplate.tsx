import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * POLAROID MEMORY - Nostalgic photo memory style landing page.
 * Design: Scattered polaroid frames, handwritten Caveat font, warm nostalgic tones.
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

export default function PolaroidMemoryTemplate(props: TemplateProps) {
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

  // Theme colors - Warm nostalgic
  const bg = asString(s.template_bg_color) || '#f5ebe0';
  const text = asString(s.template_text_color) || '#3d2c1e';
  const muted = asString(s.template_muted_color) || '#8b7355';
  const accent = asString(s.template_accent_color) || '#c17f59';
  const cardBg = asString(s.template_card_bg) || '#ffffff';
  const border = 'rgba(0,0,0,0.05)';

  // EDITABLE Content from settings
  const storeName = asString(s.store_name) || 'Polaroid Memory';
  const heroTitle = asString(s.template_hero_heading) || 'Capture the Moment';
  const heroSubtitle = asString(s.template_hero_subtitle) || 'Some things are meant to be treasured forever. This is one of them.';
  const ctaText = asString(s.template_button_text) || 'Make it Yours';
  const heroKicker = asString(s.template_hero_kicker) || 'A moment in time';

  // Polaroid captions (editable)
  const caption1 = asString(s.template_caption1) || 'This changed everything ✨';
  const caption2 = asString(s.template_caption2) || 'Best decision ever! 💕';
  const caption3 = asString(s.template_caption3) || 'Can\'t live without it';
  const caption4 = asString(s.template_caption4) || 'My new favorite';

  // Memory text (editable)
  const memoryText = asString(s.template_memory_text) || 'Remember when you found something so perfect, you just knew? This is that moment.';

  // Testimonial (editable)
  const testimonialText = asString(s.template_testimonial_text) || 'Every time I use it, I smile. It\'s become such a special part of my daily routine.';
  const testimonialAuthor = asString(s.template_testimonial_author) || '— A happy customer';

  // Section title (editable)
  const memoriesTitle = asString(s.template_section_title) || 'Creating Memories';

  // Spacing
  const baseSpacing = resolveInt(s.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(s.template_section_spacing, 56, 24, 96);
  const cardRadius = resolveInt(s.template_card_border_radius, 4, 0, 32);
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

  const captions = [caption1, caption2, caption3, caption4];
  const rotations = [-3, 2, -2, 4, -1, 3];

  return (
    <div
      data-edit-path="__root"
      onClick={() => canManage && onSelect('__root')}
      className="ecopro-storefront"
      style={{ minHeight: '100vh', background: bg, color: text, fontFamily: '"Caveat", cursive, system-ui, sans-serif' }}
    >
      {/* Load Caveat font */}
      <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={(e) => { stopIfManage(e); onSelect('layout.header'); }}
        style={{ padding: isMobile ? '16px 20px' : '20px 32px' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {asString(s.store_logo) ? (
              <img src={asString(s.store_logo)} alt={storeName} style={{ width: isMobile ? 36 : 44, height: isMobile ? 36 : 44, borderRadius: 8, objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700 }}>{storeName}</span>
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
              fontWeight: 600, 
              cursor: 'pointer', 
              fontSize: isMobile ? 14 : 18, 
              fontFamily: 'Caveat, cursive',
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
        style={{ padding: isMobile ? `${sectionSpacing * 0.6}px ${baseSpacing}px` : `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 32 : 48 }}>
            <div
              data-edit-path="layout.hero.kicker"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.kicker'); }}
              style={{ fontSize: isMobile ? 16 : 20, color: muted, marginBottom: 8 }}
            >
              {heroKicker}
            </div>

            <h1
              data-edit-path="layout.hero.title"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.title'); }}
              style={{ fontSize: isMobile ? 36 : 64, fontWeight: 700, lineHeight: 1.1, marginBottom: 12 }}
            >
              {heroTitle}
            </h1>

            <p
              data-edit-path="layout.hero.subtitle"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.subtitle'); }}
              style={{ fontSize: isMobile ? 18 : 24, color: muted, maxWidth: 500, margin: '0 auto' }}
            >
              {heroSubtitle}
            </p>
          </div>

          {/* Polaroid Grid */}
          <div
            data-edit-path="layout.hero.image"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
            style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', 
              gap: isMobile ? 16 : 24,
              maxWidth: 900,
              margin: '0 auto',
              marginBottom: isMobile ? 32 : 48,
            }}
          >
            {images.slice(0, 6).map((img, idx) => (
              <button
                key={idx}
                onClick={(e) => { stopIfManage(e); setActiveImage(idx); }}
                style={{
                  background: cardBg,
                  padding: isMobile ? '8px 8px 40px' : '12px 12px 56px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  transform: `rotate(${rotations[idx % rotations.length]}deg)`,
                  cursor: 'pointer',
                  border: idx === activeImage ? `3px solid ${accent}` : 'none',
                  transition: 'transform 0.3s ease',
                }}
              >
                <img src={img} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
                {captions[idx % captions.length] && (
                  <div style={{ 
                    position: 'absolute', 
                    bottom: isMobile ? 8 : 12, 
                    left: isMobile ? 12 : 16, 
                    right: isMobile ? 12 : 16, 
                    fontSize: isMobile ? 14 : 18, 
                    color: text, 
                    textAlign: 'center',
                  }}>
                    {captions[idx % captions.length]}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Memory Text */}
          <div
            data-edit-path="layout.hero.badge"
            onClick={(e) => { stopIfManage(e); onSelect('layout.hero.badge'); }}
            style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto', marginBottom: isMobile ? 32 : 48 }}
          >
            <p style={{ fontSize: isMobile ? 20 : 28, lineHeight: 1.5, color: text }}>{memoryText}</p>
          </div>
        </div>
      </section>

      {/* Main Content + Checkout */}
      <section
        data-edit-path="layout.featured"
        onClick={(e) => { stopIfManage(e); onSelect('layout.featured'); }}
        style={{ padding: `0 ${baseSpacing}px ${sectionSpacing}px` }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 380px', gap: isMobile ? 32 : 48, alignItems: 'start' }}>
          
          {/* Left Content */}
          <div>
            {/* Featured Polaroid */}
            <div style={{ 
              background: cardBg, 
              padding: isMobile ? '12px 12px 48px' : '16px 16px 64px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              transform: 'rotate(-1deg)',
              marginBottom: isMobile ? 28 : 40,
            }}>
              <img src={images[activeImage] || images[0]} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover' }} />
              <div style={{ marginTop: isMobile ? 12 : 16, fontSize: isMobile ? 18 : 24, textAlign: 'center', color: text }}>
                {captions[activeImage % captions.length] || 'A perfect moment'}
              </div>
            </div>

            {/* Testimonial */}
            <div
              data-edit-path="layout.categories"
              onClick={(e) => { stopIfManage(e); onSelect('layout.categories'); }}
              style={{ 
                background: 'rgba(255,255,255,0.6)', 
                padding: isMobile ? 20 : 28, 
                borderRadius: 8,
                transform: 'rotate(1deg)',
              }}
            >
              <p style={{ fontSize: isMobile ? 18 : 24, lineHeight: 1.5, marginBottom: 12 }}>"{testimonialText}"</p>
              <p style={{ fontSize: isMobile ? 14 : 18, color: muted }}>{testimonialAuthor}</p>
            </div>

            {/* More Thumbnails */}
            {images.length > 4 && (
              <div
                data-edit-path="layout.grid"
                onClick={(e) => { stopIfManage(e); onSelect('layout.grid'); }}
                style={{ display: 'flex', gap: 12, marginTop: isMobile ? 28 : 40, flexWrap: 'wrap' }}
              >
                {images.slice(0, 10).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { stopIfManage(e); setActiveImage(idx); }}
                    style={{
                      width: isMobile ? 56 : 70,
                      height: isMobile ? 56 : 70,
                      background: cardBg,
                      padding: 4,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transform: `rotate(${rotations[idx % rotations.length]}deg)`,
                      cursor: 'pointer',
                      border: idx === activeImage ? `2px solid ${accent}` : 'none',
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Checkout */}
          <div style={{ position: isMobile ? 'relative' : 'sticky', top: isMobile ? 0 : 30 }}>
            <div style={{ 
              background: cardBg, 
              padding: isMobile ? 16 : 20, 
              boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
              transform: 'rotate(1deg)',
            }}>
              <h3
                data-edit-path="layout.featured.title"
                onClick={(e) => { stopIfManage(e); onSelect('layout.featured.title'); }}
                style={{ fontSize: isMobile ? 22 : 28, marginBottom: 16, textAlign: 'center' }}
              >
                {memoriesTitle}
              </h3>
              
              <EmbeddedCheckout
                storeSlug={storeSlug}
                product={mainProduct as any}
                formatPrice={formatPrice}
                theme={checkoutTheme}
                disabled={canManage}
                heading={ctaText}
                subheading={canManage ? 'Disabled in editor' : (asString(s.template_checkout_subheading) || 'Start your collection')}
              />
            </div>

            {/* Handwritten note */}
            <div style={{ 
              marginTop: 20, 
              padding: 16, 
              background: '#fffef5', 
              transform: 'rotate(-2deg)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}>
              <p style={{ fontSize: isMobile ? 14 : 18, color: text, textAlign: 'center' }}>
                {asString(s.template_note_text) || '💌 Ships with love & care'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={(e) => { stopIfManage(e); onSelect('layout.footer'); }}
        style={{ padding: `${baseSpacing * 2}px ${baseSpacing}px`, textAlign: 'center' }}
      >
        <p
          data-edit-path="layout.footer.copyright"
          onClick={(e) => { stopIfManage(e); onSelect('layout.footer.copyright'); }}
          style={{ fontSize: isMobile ? 14 : 18, color: muted }}
        >
          {asString(s.template_copyright) || `© ${new Date().getFullYear()} ${storeName}. Made with ❤️`}
        </p>
      </footer>
    </div>
  );
}
