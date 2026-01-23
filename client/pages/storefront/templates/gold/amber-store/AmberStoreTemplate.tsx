import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';

/**
 * AMBER STORE - Warm amber/gold tones with elegant product showcase.
 * Features: Amber accents, large product images, elegant typography.
 */

function asString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function resolveInt(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = typeof value === 'number' ? value : parseInt(String(value || ''), 10);
  const safe = Number.isFinite(parsed) ? parsed : fallback;
  return Math.max(min, Math.min(max, safe));
}

function productTitle(p: StoreProduct): string {
  return String(p.title || p.name || '').trim() || 'Product';
}

function productImage(p: StoreProduct): string {
  const img = Array.isArray(p.images) ? p.images.find(Boolean) : undefined;
  return typeof img === 'string' && img ? img : '/placeholder.png';
}

export default function AmberStoreTemplate(props: TemplateProps) {
  const { settings, formatPrice, navigate } = props;
  const canManage = Boolean(props.canManage);
  const onSelect = (path: string) => {
    if (canManage && typeof (props as any).onSelect === 'function') {
      (props as any).onSelect(path);
    }
  };

  const select = (e: React.MouseEvent, path: string) => {
    if (!canManage) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect(path);
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

  // Amber theme
  const bg = asString(settings.template_bg_color) || '#fffbf5';
  const text = asString(settings.template_text_color) || '#292524';
  const muted = asString(settings.template_muted_color) || '#78716c';
  const accent = asString(settings.template_accent_color) || '#d97706';

  

  const productTitleColor = asString(settings.template_product_title_color) || text;
  const productPriceColor = asString(settings.template_product_price_color) || accent;

  const cardBg = asString(settings.template_card_bg) || "#ffffff";
const storeName = asString(settings.store_name) || 'Amber';
  
  const copyright = asString(settings.template_copyright) || `© ${new Date().getFullYear()} ${storeName}`;
const heroTitle = asString(settings.template_hero_heading) || 'Timeless Elegance';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Discover artisan craftsmanship';
  const cta = asString(settings.template_button_text) || 'Explore Collection';

  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];

  

  const sectionTitle = asString(settings.template_featured_title) || "Featured";
  const sectionSubtitle = asString(settings.template_featured_subtitle) || "";
  const addToCartLabel = asString(settings.template_add_to_cart_label) || "View";
const descText = (asString(settings.template_description_text) || asString(settings.store_description)).trim();
const descColor = asString(settings.template_description_color) || muted;
  const descSize = resolveInt(settings.template_description_size, 16, 10, 32);

  // Layout settings
  const gridColumns = resolveInt(settings.template_grid_columns, 3, 2, 6);
  const gridGap = resolveInt(settings.template_grid_gap, 32, 8, 48);
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 48, 24, 96);
  const animationSpeed = resolveInt(settings.template_animation_speed, 200, 100, 500);
  const hoverScale = asString(settings.template_hover_scale) || '1.05';
  const cardRadius = resolveInt(settings.template_card_border_radius, 0, 0, 32);

  return (
    <div
      data-edit-path="__root"
      onClick={() => canManage && onSelect("__root")}
      className="ecopro-storefront"
      style={{
        minHeight: '100vh',
        background: bg,
        color: text,
        fontFamily: '"Playfair Display", Georgia, serif',
      }}
    >
      {canManage && (
        <button
          type="button"
          data-edit-path="__settings"
          onClick={(e) => select(e, '__settings')}
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
      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={() => canManage && onSelect('layout.header')}
        style={{
          background: 'transparent',
          padding: '24px',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 12 }}
            data-edit-path="layout.header.logo"
            onClick={(e) => select(e, 'layout.header.logo')}
          >
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt="" style={{ width: 48, height: 48 }} />
            ) : (
              <div
                style={{ fontSize: 32, fontWeight: 700, color: accent, fontStyle: 'italic' }}
                data-edit-path="__settings.store_name"
                onClick={(e) => select(e, '__settings.store_name')}
              >
                {storeName}
              </div>
            )}
          </div>
          
          {!isMobile && (
            <nav
              style={{ display: 'flex', gap: 36, fontSize: 14, fontFamily: '"Inter", sans-serif', letterSpacing: '0.05em' }}
              data-edit-path="layout.header.nav"
              onClick={(e) => select(e, 'layout.header.nav')}
            >
              <button onClick={() => navigate('/')} style={{ background: 'none', border: 0, color: text, cursor: 'pointer', textTransform: 'uppercase' }}>Home</button>
              <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: text, cursor: 'pointer', textTransform: 'uppercase' }}>Shop</button>
              <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: text, cursor: 'pointer', textTransform: 'uppercase' }}>Collections</button>
              <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: text, cursor: 'pointer', textTransform: 'uppercase' }}>About</button>
            </nav>
          )}

          {canManage && isMobile && (
            <nav
              style={{ display: 'flex', gap: 18, fontSize: 12, fontFamily: '"Inter", sans-serif', letterSpacing: '0.1em' }}
              data-edit-path="layout.header.nav"
              onClick={(e) => select(e, 'layout.header.nav')}
            >
              {['Home', 'Shop', 'About'].map((label) => (
                <a key={label} href="#" onClick={(e) => select(e, 'layout.header.nav')} style={{ color: text, textDecoration: 'none', textTransform: 'uppercase' }}>
                  {label}
                </a>
              ))}
            </nav>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <button style={{ background: 'none', border: 0, color: text, cursor: 'pointer', fontFamily: '"Inter", sans-serif', fontSize: 14 }}>Cart (0)</button>
          </div>
        </div>
      </header>

      {/* Hero - Large image */}
      <section
        data-edit-path="layout.hero"
        onClick={() => canManage && onSelect('layout.hero')}
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: isMobile ? '40px 24px' : '60px 24px',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.2fr', gap: 48, alignItems: 'center' }}>
          <div style={{ order: isMobile ? 2 : 1 }}>
            <p
              style={{ color: accent, fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: '"Inter", sans-serif', marginBottom: 16 }}
              data-edit-path="layout.hero.kicker"
              onClick={(e) => select(e, 'layout.hero.kicker')}
            >
              New Arrivals
            </p>
            <h1
              style={{ fontSize: isMobile ? 40 : 56, fontWeight: 500, lineHeight: 1.15, margin: 0, fontStyle: 'italic' }}
              data-edit-path="layout.hero.title"
              onClick={(e) => select(e, 'layout.hero.title')}
            >
              {heroTitle}
            </h1>
            <p
              style={{ marginTop: 24, fontSize: 17, color: muted, lineHeight: 1.8, fontFamily: '"Inter", sans-serif' }}
              data-edit-path="layout.hero.subtitle"
              onClick={(e) => select(e, 'layout.hero.subtitle')}
            >
              {heroSubtitle}
            </p>
            <button
              data-edit-path="layout.hero.cta"
              onClick={(e) => {
                if (canManage) return select(e, 'layout.hero.cta');
                navigate('/products');
              }}
              style={{
                marginTop: 36,
                background: accent,
                border: 0,
                padding: '18px 40px',
                color: '#fff',
                fontWeight: 600,
                fontFamily: '"Inter", sans-serif',
                fontSize: 13,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              {cta}
            </button>

            {canManage && (
              <div
                data-edit-path="layout.hero.badge"
                onClick={(e) => select(e, 'layout.hero.badge')}
                style={{ marginTop: 18, display: 'inline-block', border: `1px dashed ${accent}`, padding: '8px 10px', fontSize: 12, fontFamily: '"Inter", sans-serif' }}
              >
                HERO BADGE
              </div>
            )}
          </div>
          
          {products.length > 0 && (
            <div style={{ order: isMobile ? 1 : 2 }}>
              <div style={{ aspectRatio: '4/5', overflow: 'hidden' }}>
                <img 
                  src={productImage(products[0])} 
                  alt="" 
                  data-edit-path="layout.hero.image"
                  onClick={(e) => select(e, 'layout.hero.image')}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
            </div>
          )}

          {canManage && products.length === 0 && (
            <div style={{ order: isMobile ? 1 : 2 }}>
              <div
                data-edit-path="layout.hero.image"
                onClick={(e) => select(e, 'layout.hero.image')}
                style={{ aspectRatio: '4/5', border: `1px dashed ${accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: muted }}
              >
                Hero image
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Description */}
      {(canManage || descText) && (
        <section
          data-edit-path="layout.categories"
          onClick={() => canManage && onSelect('layout.categories')}
          style={{ padding: '60px 24px', textAlign: 'center', background: '#fff' }}
        >
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <p style={{ color: descColor, fontSize: descSize, lineHeight: 1.9, fontStyle: 'italic' }}>
              {descText || (canManage ? 'Add your artisan story here...' : '')}
            </p>
          </div>
        </section>
      )}

      {/* Featured Categories */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 24 }}>
          {['Jewelry', 'Home Decor', 'Accessories'].map((cat, idx) => (
            <div 
              key={cat} 
              onClick={() => navigate('/products')}
              style={{ 
                aspectRatio: '4/5', 
                background: `linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.5) 100%), ${['#e7d5c1', '#d4c4b0', '#c9b896'][idx]}`,
                display: 'flex',
                alignItems: 'flex-end',
                padding: 24,
                cursor: 'pointer',
              }}
            >
              <div>
                <h3 style={{ color: '#fff', fontSize: 24, fontStyle: 'italic', margin: 0 }}>{cat}</h3>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: '"Inter", sans-serif' }}>Shop Now →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section
        data-edit-path="layout.featured"
        onClick={() => canManage && onSelect('layout.featured')}
        style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 80px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 data-edit-path="layout.featured.title" onClick={(e) => select(e, 'layout.featured.title')} style={{ fontSize: 36, fontWeight: 400, margin: 0, fontStyle: 'italic' }}>{sectionTitle}</h2>
          <p data-edit-path="layout.featured.subtitle" onClick={(e) => select(e, 'layout.featured.subtitle')} style={{ color: muted, marginTop: 12, fontFamily: '"Inter", sans-serif' }}>{sectionSubtitle || (canManage ? 'Add featured subtitle...' : '')}</p>
        </div>

        <div data-edit-path="layout.featured.items" onClick={(e) => select(e, 'layout.featured.items')}>
          <div
            data-edit-path="layout.grid"
            onClick={(e) => select(e, 'layout.grid')}
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : `repeat(${gridColumns}, 1fr)`,
              gap: gridGap,
            }}
          >
          {products.slice(0, 6).map((p) => (
            <div
              key={p.id}
              data-edit-path={`layout.grid.items.${p.id}`}
              onClick={(e) => {
                if (canManage) { e.stopPropagation(); onSelect(`layout.grid.items.${p.id}`); return; }
                if ((p as any).slug) navigate((p as any).slug);
              }}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ aspectRatio: '3/4', overflow: 'hidden', marginBottom: baseSpacing, background: cardBg, borderRadius: cardRadius }}>
                <img 
                  src={productImage(p)} 
                  alt={productTitle(p)} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: `transform ${animationSpeed}ms` }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = `scale(${hoverScale})`)}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 400, margin: 0, fontStyle: 'italic' , color: productTitleColor}}>{productTitle(p)}</h3>
              <p style={{ color: productPriceColor, fontSize: 15, marginTop: 8, fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>
                {formatPrice(Number(p.price) || 0)}
              </p>
            </div>
          ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 56 }}>
          <button
            data-edit-path="layout.featured.addLabel"
            onClick={(e) => {
              if (canManage) return select(e, 'layout.featured.addLabel');
              navigate('/products');
            }}
            style={{
              background: 'transparent',
              border: `1px solid ${text}`,
              padding: '16px 48px',
              color: text,
              fontSize: 13,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontFamily: '"Inter", sans-serif',
              cursor: 'pointer',
            }}
          >
            View All
          </button>
        </div>
      </section>

      {/* Quote section */}
      <section style={{ background: accent, padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <p style={{ color: '#fff', fontSize: 28, fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>
            "Every piece tells a story, crafted with love and dedication to timeless beauty."
          </p>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 24, fontSize: 14, fontFamily: '"Inter", sans-serif' }}>
            — The {storeName} Team
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={() => canManage && onSelect('layout.footer')}
        style={{ background: '#292524', color: '#fff', padding: '60px 24px' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div
            style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 40 }}
            data-edit-path="layout.footer.links"
            onClick={(e) => select(e, 'layout.footer.links')}
          >
            <div>
              <div style={{ fontSize: 28, fontStyle: 'italic', color: accent, marginBottom: 16 }}>{storeName}</div>
              <p style={{ opacity: 0.6, fontSize: 14, lineHeight: 1.7, fontFamily: '"Inter", sans-serif' }}>
                Curated elegance for the modern home.
              </p>
            </div>
            {['Shop', 'About', 'Contact'].map((section) => (
              <div key={section}>
                <h5 style={{ fontSize: 12, fontWeight: 600, marginBottom: 16, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: '"Inter", sans-serif' }}>{section}</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14, opacity: 0.6, fontFamily: '"Inter", sans-serif' }}>
                  <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>Link</a>
                  <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>Link</a>
                </div>
              </div>
            ))}
          </div>
          <div
            style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 48, paddingTop: 24, textAlign: 'center', fontSize: 13, opacity: 0.5, fontFamily: '"Inter", sans-serif' }}
            data-edit-path="layout.footer.copyright"
            onClick={(e) => select(e, 'layout.footer.copyright')}
          >
            {copyright}
          </div>

          {canManage && (
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
              <div
                data-edit-path="layout.footer.social"
                onClick={(e) => select(e, 'layout.footer.social')}
                style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontFamily: '"Inter", sans-serif', fontSize: 12, opacity: 0.7 }}
              >
                {['Instagram', 'TikTok'].map((label) => (
                  <a key={label} href="#" onClick={(e) => select(e, 'layout.footer.social')} style={{ color: '#fff', textDecoration: 'none' }}>
                    {label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
