import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * POLAROID MEMORY - Nostalgic photo memory-style landing page.
 * Design: Polaroid frames, scattered photos, handwritten feel, warm nostalgic tones.
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

export default function PolaroidMemoryTemplate(props: TemplateProps) {
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

  // Theme - Warm nostalgic
  const bg = asString(settings.template_bg_color) || '#fdf5e6';
  const text = asString(settings.template_text_color) || '#3d2914';
  const muted = asString(settings.template_muted_color) || '#8b7355';
  const accent = asString(settings.template_accent_color) || '#c2410c';
  const cardBg = asString((settings as any).template_card_bg) || '#ffffff';
  const border = 'rgba(61,41,20,0.15)';

  // Content
  const storeName = asString(settings.store_name) || 'Memories';
  const heroTitle = asString(settings.template_hero_heading) || 'Capture the Moment';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Every great story deserves to be remembered. Create memories that last a lifetime.';
  const ctaText = asString(settings.template_button_text) || 'Start Your Story';

  // Spacing
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 60, 24, 96);

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

  // Random rotations for polaroids
  const rotations = [-6, 3, -4, 5, -3, 4, -5, 2];

  return (
    <div
      data-edit-path="__root"
      onClick={() => canManage && onSelect('__root')}
      className="ecopro-storefront"
      style={{
        minHeight: '100vh',
        background: bg,
        color: text,
        fontFamily: '"Caveat", "Comic Sans MS", cursive',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 0h100v100H0z" fill="none"/%3E%3Cpath d="M0 50h100M50 0v100" stroke="%23d4c4a8" stroke-width="0.5" opacity="0.3"/%3E%3C/svg%3E")',
      }}
    >
      {/* Header - Scrapbook Style */}
      <header
        data-edit-path="layout.header"
        onClick={(e) => { stopIfManage(e); onSelect('layout.header'); }}
        style={{ padding: '24px 20px', textAlign: 'center' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: cardBg, padding: '16px 32px', boxShadow: '2px 2px 8px rgba(0,0,0,0.1)', transform: 'rotate(-1deg)' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: text }}>{storeName}</div>
            <div style={{ fontSize: 14, color: muted, fontFamily: 'Georgia, serif' }}>Est. 2025</div>
          </div>
        </div>
      </header>

      {/* Hero - Photo Wall */}
      <section
        data-edit-path="layout.hero"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, position: 'relative' }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Scattered Polaroids */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 20, marginBottom: 40 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                data-edit-path={i === 1 ? 'layout.hero.image' : undefined}
                onClick={i === 1 ? (e) => { stopIfManage(e); onSelect('layout.hero.image'); } : undefined}
                style={{
                  background: cardBg,
                  padding: '12px 12px 40px',
                  boxShadow: '3px 3px 12px rgba(0,0,0,0.15)',
                  transform: `rotate(${rotations[i]}deg)`,
                  transition: 'transform 0.3s',
                }}
              >
                <img
                  src={productImage(products[i] || mainProduct)}
                  alt="Memory"
                  style={{ width: isMobile ? 120 : 180, height: isMobile ? 120 : 180, objectFit: 'cover' }}
                />
                <div style={{ fontSize: 14, textAlign: 'center', marginTop: 8, color: muted }}>
                  {['Our Story', 'Moments', 'Joy'][i]}
                </div>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
            <div
              data-edit-path="layout.hero.badge"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.badge'); }}
              style={{
                display: 'inline-block',
                background: accent,
                color: '#fff',
                padding: '6px 16px',
                borderRadius: 999,
                fontSize: 14,
                marginBottom: 16,
                transform: 'rotate(2deg)',
              }}
            >
              ❤️ Made with Love
            </div>

            <h1
              data-edit-path="layout.hero.title"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.title'); }}
              style={{ fontSize: isMobile ? 36 : 56, fontWeight: 700, lineHeight: 1.2, marginBottom: 16 }}
            >
              {heroTitle}
            </h1>

            <p
              data-edit-path="layout.hero.subtitle"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.subtitle'); }}
              style={{ fontSize: 20, color: muted, lineHeight: 1.6, fontFamily: 'Georgia, serif', marginBottom: 30 }}
            >
              {heroSubtitle}
            </p>

            <button
              data-edit-path="layout.hero.cta"
              onClick={(e) => { stopIfManage(e); onSelect('layout.hero.cta'); }}
              style={{
                background: accent,
                color: '#fff',
                border: 'none',
                borderRadius: 999,
                padding: '14px 36px',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: 18,
                boxShadow: '2px 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              {ctaText}
            </button>
          </div>
        </div>
      </section>

      {/* Memory Wall */}
      <section style={{ padding: `${sectionSpacing * 0.5}px ${baseSpacing}px`, background: 'rgba(255,255,255,0.5)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 16, color: muted, marginBottom: 8, fontFamily: 'Georgia, serif' }}>MEMORY WALL</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 60, flexWrap: 'wrap' }}>
            {[
              { icon: '📸', label: '1,000+ Happy Customers' },
              { icon: '💝', label: 'Handcrafted with Care' },
              { icon: '🎁', label: 'Perfect for Gifting' },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 24 }}>{item.icon}</span>
                <span style={{ fontSize: 16, fontFamily: 'Georgia, serif' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Album Section */}
      <section
        data-edit-path="layout.featured"
        onClick={(e) => { stopIfManage(e); onSelect('layout.featured'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2
            data-edit-path="layout.featured.title"
            onClick={(e) => { stopIfManage(e); onSelect('layout.featured.title'); }}
            style={{ fontSize: 36, fontWeight: 700, textAlign: 'center', marginBottom: 40 }}
          >
            Our Collection 📷
          </h2>

          {/* Polaroid Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 24 }}>
            {products.slice(0, 8).map((product, i) => (
              <div
                key={product.id}
                style={{
                  background: cardBg,
                  padding: '10px 10px 30px',
                  boxShadow: '2px 2px 10px rgba(0,0,0,0.12)',
                  transform: `rotate(${rotations[i % 8]}deg)`,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                }}
                onMouseEnter={(e) => !canManage && (e.currentTarget.style.transform = 'rotate(0deg) scale(1.05)')}
                onMouseLeave={(e) => !canManage && (e.currentTarget.style.transform = `rotate(${rotations[i % 8]}deg)`)}
              >
                <img
                  src={productImage(product)}
                  alt={product.name}
                  style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }}
                />
                <div style={{ marginTop: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{product.name}</div>
                  <div style={{ fontSize: 18, color: accent, fontFamily: 'Georgia, serif' }}>{formatPrice(product.price)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Sticky Notes */}
      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, background: 'rgba(255,255,255,0.5)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, textAlign: 'center', marginBottom: 40 }}>
            What Our Family Says 💕
          </h2>

          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 20 }}>
            {[
              { note: 'Best gift I ever gave! My mom cried happy tears. 😭💕', name: 'Sara M.', color: '#fff9c4' },
              { note: 'The quality is amazing! Will definitely order again!', name: 'Ahmed K.', color: '#f8bbd0' },
              { note: 'Perfect for preserving our family memories ❤️', name: 'Laila R.', color: '#c5e1a5' },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  background: item.color,
                  padding: 20,
                  width: isMobile ? '100%' : 220,
                  boxShadow: '2px 2px 8px rgba(0,0,0,0.1)',
                  transform: `rotate(${rotations[i + 3]}deg)`,
                }}
              >
                <p style={{ fontSize: 16, lineHeight: 1.5, marginBottom: 12 }}>"{item.note}"</p>
                <p style={{ fontSize: 14, color: muted, textAlign: 'right' }}>— {item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Checkout Section */}
      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}>
        <div style={{ maxWidth: 500, margin: '0 auto', background: cardBg, padding: 30, boxShadow: '3px 3px 15px rgba(0,0,0,0.12)', transform: 'rotate(-1deg)' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>
            Start Your Story ✨
          </h2>
          <p style={{ textAlign: 'center', color: muted, marginBottom: 24, fontFamily: 'Georgia, serif' }}>
            Create memories that last forever
          </p>
          
          <EmbeddedCheckout
            storeSlug={storeSlug}
            product={mainProduct as any}
            formatPrice={formatPrice}
            theme={checkoutTheme}
            disabled={canManage}
            heading={ctaText}
            subheading={canManage ? 'Disabled in editor' : '🎁 Gift wrapping available'}
          />
        </div>
      </section>

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={(e) => { stopIfManage(e); onSelect('layout.footer'); }}
        style={{ padding: `${baseSpacing * 2}px ${baseSpacing}px`, textAlign: 'center' }}
      >
        <div style={{ fontSize: 24, marginBottom: 8 }}>{storeName}</div>
        <p
          data-edit-path="layout.footer.copyright"
          onClick={(e) => { stopIfManage(e); onSelect('layout.footer.copyright'); }}
          style={{ fontSize: 14, color: muted, fontFamily: 'Georgia, serif' }}
        >
          {asString((settings as any).template_copyright) || `© ${new Date().getFullYear()} ${storeName}. Made with ❤️`}
        </p>
      </footer>
    </div>
  );
}
