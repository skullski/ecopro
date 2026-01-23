import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';

/**
 * PRO ATELIER - Luxury editorial template with large imagery.
 * Features: Full-width images, minimal text, editorial layout, serif headings.
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

export default function ProAtelierTemplate(props: TemplateProps) {
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

  // Atelier theme - warm cream/white with gold accent
  const bg = asString(settings.template_bg_color) || '#faf9f6';
  const text = asString(settings.template_text_color) || '#1c1917';
  const muted = asString(settings.template_muted_color) || '#78716c';
  const accent = asString(settings.template_accent_color) || '#b45309';

  

  const productTitleColor = asString(settings.template_product_title_color) || text;
  const productPriceColor = asString(settings.template_product_price_color) || accent;

  const cardBg = asString(settings.template_card_bg) || "#ffffff";
const logoUrl = asString(settings.store_logo) || asString((settings as any).logo_url);
  const storeName = asString(settings.store_name) || 'ATELIER';
  
  const copyright = asString(settings.template_copyright) || `© ${new Date().getFullYear()} ${storeName}`;
const storeDescription = asString(settings.store_description);
  const heroTitle = asString(settings.template_hero_heading) || 'Crafted with Purpose';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Timeless pieces for the discerning eye';
  const cta = asString(settings.template_button_text) || 'Discover';

  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];

  

  const sectionTitle = asString(settings.template_featured_title) || "Featured";
  const sectionSubtitle = asString(settings.template_featured_subtitle) || "";
  const addToCartLabel = asString(settings.template_add_to_cart_label) || "View";
const descText = asString(settings.template_description_text);
  const descColor = asString(settings.template_description_color) || muted;
  const descSize = resolveInt(settings.template_description_size, 16, 10, 32);

  // Layout settings
  const gridColumns = resolveInt(settings.template_grid_columns, 3, 2, 6);
  const gridGap = resolveInt(settings.template_grid_gap, 24, 8, 48);
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 60, 24, 96);
  const animationSpeed = resolveInt(settings.template_animation_speed, 600, 100, 1000);
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
      {/* Header - Ultra minimal */}
      <header
        data-edit-path="layout.header"
        onClick={() => canManage && onSelect('layout.header')}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          padding: '24px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'transparent',
        }}
      >
        <div
          data-edit-path="layout.header.logo"
          onClick={(e) => select(e, 'layout.header.logo')}
          style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: canManage ? 'pointer' : 'default' }}
        >
          {logoUrl && (
            <img
              src={logoUrl}
              alt={storeName}
              style={{ width: 42, height: 42, borderRadius: 9999, objectFit: 'cover' }}
            />
          )}
          <span
            style={{ fontSize: 22, fontWeight: 600, letterSpacing: '0.2em' }}
            data-edit-path="__settings.store_name"
            onClick={(e) => select(e, '__settings.store_name')}
          >
            {storeName}
          </span>
        </div>
        <button
          data-edit-path="layout.header.nav"
          onClick={(e) => {
            if (canManage) return select(e, 'layout.header.nav');
            navigate('/products');
          }}
          style={{
            background: 'transparent',
            border: `1px solid ${text}`,
            padding: '10px 24px',
            color: text,
            fontFamily: 'system-ui, sans-serif',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.1em',
            cursor: 'pointer',
          }}
        >
          SHOP
        </button>
      </header>

      {/* Hero - Full screen image with text overlay */}
      <section
        data-edit-path="layout.hero"
        onClick={() => canManage && onSelect('layout.hero')}
        style={{
          position: 'relative',
          height: '100vh',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-start',
        }}
      >
        {products[0] && (
          <img
            src={productImage(products[0])}
            alt=""
            data-edit-path="layout.hero.image"
            onClick={(e) => select(e, 'layout.hero.image')}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
          }}
        />
        <div style={{ position: 'relative', padding: isMobile ? '40px 24px' : '80px 60px', color: '#fff', maxWidth: 700 }}>
          {canManage && (
            <div
              data-edit-path="layout.hero.kicker"
              onClick={(e) => select(e, 'layout.hero.kicker')}
              style={{ display: 'inline-block', border: '1px dashed rgba(255,255,255,0.6)', padding: '6px 10px', fontSize: 12, letterSpacing: '0.12em' }}
            >
              HERO KICKER
            </div>
          )}
          <h1
            data-edit-path="layout.hero.title"
            onClick={(e) => select(e, 'layout.hero.title')}
            style={{ fontSize: isMobile ? 40 : 72, fontWeight: 400, lineHeight: 1.1, margin: 0, fontStyle: 'italic' }}
          >
            {heroTitle}
          </h1>
          <p
            data-edit-path="layout.hero.subtitle"
            onClick={(e) => select(e, 'layout.hero.subtitle')}
            style={{ marginTop: 20, fontSize: 18, opacity: 0.85, fontFamily: 'system-ui, sans-serif', fontWeight: 300 }}
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
              marginTop: 32,
              background: '#fff',
              border: 0,
              padding: '16px 40px',
              color: '#000',
              fontFamily: 'system-ui, sans-serif',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.15em',
              cursor: 'pointer',
            }}
          >
            {cta.toUpperCase()}
          </button>
          {canManage && (
            <div
              data-edit-path="layout.hero.badge"
              onClick={(e) => select(e, 'layout.hero.badge')}
              style={{ marginTop: 18, display: 'inline-block', border: '1px dashed rgba(255,255,255,0.6)', padding: '8px 10px', fontSize: 12 }}
            >
              HERO BADGE
            </div>
          )}
        </div>
      </section>

      {/* Description */}
      {(canManage || descText) && (
        <section
          data-edit-path="layout.categories"
          onClick={() => canManage && onSelect('layout.categories')}
          style={{ padding: isMobile ? '60px 24px' : '100px 60px', textAlign: 'center' }}
        >
          <p style={{ maxWidth: 800, margin: '0 auto', color: descColor, fontSize: descSize, lineHeight: 1.8, fontStyle: 'italic' }}>
            {descText || (canManage ? 'Add description...' : '')}
          </p>
        </section>
      )}

      {/* Products - Editorial alternating layout */}
      <section
        data-edit-path="layout.featured"
        onClick={() => canManage && onSelect('layout.featured')}
        style={{ padding: isMobile ? '0 24px 60px' : '0 60px 100px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 40 : 60 }}>
          <h2 data-edit-path="layout.featured.title" onClick={(e) => select(e, 'layout.featured.title')} style={{ fontSize: isMobile ? 28 : 42, fontWeight: 400, fontStyle: 'italic', margin: 0 }}>{sectionTitle}</h2>
        </div>

        <div data-edit-path="layout.featured.items" onClick={(e) => select(e, 'layout.featured.items')}>
          <div data-edit-path="layout.grid" onClick={(e) => select(e, 'layout.grid')}>

        {products.slice(0, 6).map((p, idx) => (
          <div
            key={p.id}
            data-edit-path={`layout.grid.items.${p.id}`}
            onClick={(e) => {
              if (canManage) { e.stopPropagation(); onSelect(`layout.grid.items.${p.id}`); return; }
              if ((p as any).slug) navigate((p as any).slug);
            }}
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : idx % 2 === 0 ? '1.2fr 0.8fr' : '0.8fr 1.2fr',
              gap: isMobile ? 20 : 40,
              marginBottom: isMobile ? 40 : 80,
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <div style={{ order: isMobile ? 0 : idx % 2 === 0 ? 0 : 1 }}>
              <div style={{ aspectRatio: '4/5', overflow: 'hidden' }}>
                <img
                  src={productImage(p)}
                  alt={productTitle(p)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: `transform ${animationSpeed}ms` }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = `scale(${hoverScale})`)}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
              </div>
            </div>
            <div style={{ padding: isMobile ? 0 : '40px 0' }}>
              <div style={{ fontSize: 11, color: muted, fontFamily: 'system-ui, sans-serif', letterSpacing: '0.2em', marginBottom: 12 }}>
                ITEM {String(idx + 1).padStart(2, '0')}
              </div>
              <h3 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 400, margin: 0, fontStyle: 'italic' , color: productTitleColor}}>
                {productTitle(p)}
              </h3>
              <p data-edit-path="layout.featured.subtitle" onClick={(e) => select(e, 'layout.featured.subtitle')} style={{ marginTop: 16, color: muted, fontSize: 14, lineHeight: 1.7, fontFamily: 'system-ui, sans-serif' }}>{sectionSubtitle || (canManage ? 'Add featured subtitle...' : '')}</p>
              <div style={{ marginTop: 20, fontSize: 20, fontWeight: 600, color: accent }}>
                {formatPrice(Number(p.price) || 0)}
              </div>
              <button
                data-edit-path="layout.featured.addLabel"
                onClick={(e) => {
                  if (canManage) return select(e, 'layout.featured.addLabel');
                  e.stopPropagation();
                  if ((p as any).slug) navigate((p as any).slug);
                }}
                style={{
                  marginTop: 24,
                  background: 'transparent',
                  border: `1px solid ${text}`,
                  padding: '12px 28px',
                  color: text,
                  fontFamily: 'system-ui, sans-serif',
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                }}
              >
                VIEW DETAILS
              </button>
            </div>
          </div>
        ))}

        {/* More products grid */}
        {products.length > 6 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : `repeat(${gridColumns}, 1fr)`,
              gap: gridGap,
              marginTop: sectionSpacing,
            }}
          >
            {products.slice(6).map((p) => (
              <div
                key={p.id}
                onClick={() => (p as any).slug && navigate((p as any).slug)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ aspectRatio: '3/4', overflow: 'hidden', marginBottom: 16 }}>
                  <img src={productImage(p)} alt={productTitle(p)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ fontSize: 16, fontStyle: 'italic' }}>{productTitle(p)}</div>
                <div style={{ fontSize: 14, color: accent, marginTop: 4, fontFamily: 'system-ui, sans-serif', fontWeight: 600 }}>
                  {formatPrice(Number(p.price) || 0)}
                </div>
              </div>
            ))}
          </div>
        )}

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={() => canManage && onSelect('layout.footer')}
        style={{
          borderTop: `1px solid ${muted}33`,
          padding: isMobile ? '40px 24px' : '60px',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          {logoUrl && (
            <img
              src={logoUrl}
              alt={storeName}
              style={{ width: 56, height: 56, borderRadius: 9999, objectFit: 'cover' }}
            />
          )}
          <div style={{ fontSize: 20, fontStyle: 'italic' }}>{storeName}</div>
          {(canManage || storeDescription) && (
            <div style={{ maxWidth: 560, color: muted, fontSize: 13, fontFamily: 'system-ui, sans-serif', lineHeight: 1.6 }}>
              {storeDescription || (canManage ? 'Add store description...' : '')}
            </div>
          )}
        </div>
        <p
          data-edit-path="layout.footer.copyright"
          onClick={(e) => select(e, 'layout.footer.copyright')}
          style={{ color: muted, fontSize: 13, fontFamily: 'system-ui, sans-serif' }}
        >
          © {new Date().getFullYear()} All rights reserved.
        </p>

        {canManage && (
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 18, flexWrap: 'wrap' }}>
            <div data-edit-path="layout.footer.links" onClick={(e) => select(e, 'layout.footer.links')} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {['Shipping', 'Returns', 'Contact'].map((label) => (
                <a key={label} href="#" onClick={(e) => select(e, 'layout.footer.links')} style={{ color: muted, fontSize: 12, textDecoration: 'none' }}>
                  {label}
                </a>
              ))}
            </div>
            <div data-edit-path="layout.footer.social" onClick={(e) => select(e, 'layout.footer.social')} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {['Instagram', 'TikTok'].map((label) => (
                <a key={label} href="#" onClick={(e) => select(e, 'layout.footer.social')} style={{ color: muted, fontSize: 12, textDecoration: 'none' }}>
                  {label}
                </a>
              ))}
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}
