import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * LIME DIRECT - Bright lime green direct sales template.
 * Features: Vivid green, product showcase with multiple images, direct order.
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

export default function LimeDirectTemplate(props: TemplateProps) {
  const { settings, formatPrice, navigate } = props;
  const canManage = Boolean(props.canManage);

  const dir: 'rtl' | 'ltr' =
    typeof document !== 'undefined' && document.documentElement?.dir === 'rtl' ? 'rtl' : 'ltr';
  const onSelect = (path: string) => {
    if (canManage && typeof (props as any).onSelect === 'function') {
      (props as any).onSelect(path);
    }
  };

  const clickGuard = (e: React.MouseEvent, path: string) => {
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

  // Lime theme
  const bg = asString(settings.template_bg_color) || '#f0fdf4';
  const text = asString(settings.template_text_color) || '#14532d';
  const muted = asString(settings.template_muted_color) || '#166534';
  const accent = asString(settings.template_accent_color) || '#22c55e';

  

  const productTitleColor = asString(settings.template_product_title_color) || text;
  const productPriceColor = asString(settings.template_product_price_color) || accent;

  const cardBg = asString(settings.template_card_bg) || "#ffffff";
const storeName = asString(settings.store_name) || 'Lime Direct';
  
  const copyright = asString(settings.template_copyright) || `© ${new Date().getFullYear()} ${storeName}`;
const heroTitle = asString(settings.template_hero_heading) || 'Premium Quality Products';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Direct from manufacturer to your doorstep';
  const cta = asString(settings.template_button_text) || 'Order Now';
  const heroKicker = asString((settings as any).template_hero_kicker) || 'LIMITED OFFER';
  const badgeTitle = asString((settings as any).template_hero_badge_title) || 'Best Seller';
  const badgeSubtitle = asString((settings as any).template_hero_badge_subtitle) || '';

  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];

  const checkoutTheme = {
    bg: '#ffffff',
    text: '#111827',
    muted: '#6b7280',
    accent,
    cardBg: '#ffffff',
    border: 'rgba(34,197,94,0.22)',
  };

  

  const sectionTitle = asString(settings.template_featured_title) || "Featured";
  const sectionSubtitle = asString(settings.template_featured_subtitle) || "";
  const addToCartLabel = asString(settings.template_add_to_cart_label) || "View";
const descText = (asString(settings.template_description_text) || asString(settings.store_description)).trim();
const descColor = asString(settings.template_description_color) || muted;
  const descSize = resolveInt(settings.template_description_size, 15, 10, 32);

  // Layout settings
  const gridColumns = resolveInt(settings.template_grid_columns, 4, 2, 6);
  const gridGap = resolveInt(settings.template_grid_gap, 16, 8, 48);
  const baseSpacing = resolveInt(settings.template_spacing, 12, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 48, 24, 96);
  const animationSpeed = resolveInt(settings.template_animation_speed, 200, 100, 500);
  const hoverScale = asString(settings.template_hover_scale) || '1.02';
  const cardRadius = resolveInt(settings.template_card_border_radius, 12, 0, 32);

  return (
    <div
      data-edit-path="__root"
      onClick={() => canManage && onSelect("__root")}
      className="ecopro-storefront"
      style={{
        minHeight: '100vh',
        background: bg,
        color: text,
        fontFamily: '"Inter", system-ui, sans-serif',
      }}
    >
      {canManage && (
        <button
          type="button"
          data-edit-path="__settings"
          onClick={(e) => clickGuard(e, '__settings')}
          style={{
            position: 'fixed',
            right: 12,
            bottom: 12,
            zIndex: 1000,
            background: 'rgba(255,255,255,0.92)',
            border: `1px solid ${accent}33`,
            borderRadius: 9999,
            padding: '8px 10px',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: accent,
            cursor: 'pointer',
          }}
        >
          Settings
        </button>
      )}
      {/* Top announcement */}
      <div style={{ background: accent, color: '#fff', textAlign: 'center', padding: '10px 16px', fontSize: 13, fontWeight: 600 }}>
        🎁 Special Offer: Free shipping on all orders today!
      </div>

      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={() => canManage && onSelect('layout.header')}
        style={{
          background: '#fff',
          padding: '14px 24px',
          borderBottom: `3px solid ${accent}`,
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
            data-edit-path="layout.header.logo"
            onClick={(e) => clickGuard(e, 'layout.header.logo')}
          >
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt="" style={{ width: 44, height: 44 }} />
            ) : (
              <div style={{ width: 44, height: 44, borderRadius: 8, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 20 }}>
                L
              </div>
            )}
            <span
              style={{ fontSize: 22, fontWeight: 800, color: accent }}
              data-edit-path="__settings.store_name"
              onClick={(e) => clickGuard(e, '__settings.store_name')}
            >
              {storeName}
            </span>
          </div>
          
          {!isMobile && (
            <nav
              style={{ display: 'flex', gap: 28, fontSize: 14, fontWeight: 500 }}
              data-edit-path="layout.header.nav"
              onClick={(e) => clickGuard(e, 'layout.header.nav')}
            >
              {['Home', 'Products', 'Contact'].map((label) => (
                <button
                  key={label}
                  onClick={(e) => {
                    if (canManage) return clickGuard(e, 'layout.header.nav');
                    if (label === 'Home') navigate('/');
                    else navigate('/products');
                  }}
                  style={{ background: 'none', border: 0, color: text, cursor: 'pointer' }}
                >
                  {label}
                </button>
              ))}
            </nav>
          )}

          <button
            onClick={() => navigate('/products')}
            style={{
              background: accent,
              border: 0,
              borderRadius: 8,
              padding: '12px 24px',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {cta}
          </button>
        </div>
      </header>

      {/* Hero - Product focus */}
      <section
        data-edit-path="layout.hero"
        onClick={() => canManage && onSelect('layout.hero')}
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: isMobile ? '32px 24px' : '48px 24px',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 40, alignItems: 'center' }}>
          {/* Product images */}
          <div data-edit-path="layout.hero.image" onClick={(e) => clickGuard(e, 'layout.hero.image')}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 16, border: `2px solid ${accent}30` }}>
              {products.length > 0 && (
                <div style={{ aspectRatio: '1', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
                  <img src={productImage(products[0])} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              {products.length === 0 && canManage && (
                <div style={{ aspectRatio: '1', borderRadius: 12, overflow: 'hidden', marginBottom: 12, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: 12 }}>
                  Add hero image
                </div>
              )}
              {products.length > 1 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {products.slice(0, 4).map((p, idx) => (
                    <div key={p.id} style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: idx === 0 ? `2px solid ${accent}` : '2px solid transparent' }}>
                      <img src={productImage(p)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product info & order */}
          <div>
            <div
              data-edit-path="layout.hero.kicker"
              onClick={(e) => clickGuard(e, 'layout.hero.kicker')}
              style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: accent, marginBottom: 10 }}
            >
              {heroKicker}
            </div>

            <h1
              style={{ fontSize: isMobile ? 28 : 36, fontWeight: 800, lineHeight: 1.2, margin: 0 }}
              data-edit-path="layout.hero.title"
              onClick={(e) => clickGuard(e, 'layout.hero.title')}
            >
              {heroTitle}
            </h1>
            <p
              style={{ marginTop: 16, fontSize: 16, color: muted, lineHeight: 1.8 }}
              data-edit-path="layout.hero.subtitle"
              onClick={(e) => clickGuard(e, 'layout.hero.subtitle')}
            >
              {heroSubtitle}
            </p>

            <div
              data-edit-path="layout.hero.badge"
              onClick={(e) => clickGuard(e, 'layout.hero.badge')}
              style={{ marginTop: 16, display: 'inline-block', background: '#fff', border: `1px solid ${accent}33`, padding: '10px 12px', borderRadius: 12 }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, color: accent }}>{badgeTitle}</div>
              {(canManage || badgeSubtitle) && <div style={{ marginTop: 4, fontSize: 12, color: muted }}>{badgeSubtitle || 'Add badge subtitle...'}</div>}
            </div>

            <div style={{ marginTop: 18 }}>
              <button
                data-edit-path="layout.hero.cta"
                onClick={(e) => {
                  if (canManage) return clickGuard(e, 'layout.hero.cta');
                  navigate('/products');
                }}
                style={{
                  background: accent,
                  border: 0,
                  borderRadius: 10,
                  padding: '12px 18px',
                  color: '#fff',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {cta}
              </button>
            </div>

            {products.length > 0 && (
              <div style={{ marginTop: 24, background: '#fff', borderRadius: 12, padding: 20, border: `2px solid ${accent}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: accent }}>{formatPrice(Number(products[0].price) || 0)}</span>
                  <span style={{ background: '#dcfce7', color: accent, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>In Stock</span>
                </div>

                <EmbeddedCheckout
                  storeSlug={String(props.storeSlug || (settings as any).store_slug || '')}
                  product={products[0]}
                  formatPrice={formatPrice}
                  theme={checkoutTheme}
                  disabled={canManage}
                  heading={dir === 'rtl' ? 'الطلب السريع' : 'Quick Order'}
                  subheading={canManage ? (dir === 'rtl' ? 'معطل في وضع التعديل' : 'Disabled in editor') : (dir === 'rtl' ? 'الدفع عند الاستلام • توصيل سريع' : 'Cash on delivery • Fast delivery')}
                  dir={dir}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ background: accent, padding: '32px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 24, textAlign: 'center' }}>
          {[
            { icon: '✅', text: 'Original Product' },
            { icon: '🚚', text: 'Fast Delivery' },
            { icon: '💰', text: 'Cash on Delivery' },
            { icon: '🔄', text: 'Easy Returns' },
          ].map((f) => (
            <div key={f.text} style={{ color: '#fff' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{f.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Description */}
      {(canManage || descText) && (
        <section
          data-edit-path="layout.categories"
          onClick={() => canManage && onSelect('layout.categories')}
          style={{ padding: '48px 24px', background: '#fff' }}
        >
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ color: descColor, fontSize: descSize, lineHeight: 1.9 }}>
              {descText || (canManage ? 'Add product description and features here...' : '')}
            </p>
          </div>
        </section>
      )}

      {/* More products */}
      <section
        data-edit-path="layout.grid"
        onClick={() => canManage && onSelect('layout.grid')}
        style={{ maxWidth: 1200, margin: '0 auto', padding: `${sectionSpacing}px 24px 60px` }}
      >
        <div data-edit-path="layout.featured" onClick={(e) => clickGuard(e, 'layout.featured')}>
          <h2
            data-edit-path="layout.featured.title"
            onClick={(e) => clickGuard(e, 'layout.featured.title')}
            style={{ fontSize: 24, fontWeight: 800, marginBottom: 10, textAlign: 'center' }}
          >
            {sectionTitle}
          </h2>
          {(canManage || sectionSubtitle) && (
            <p
              data-edit-path="layout.featured.subtitle"
              onClick={(e) => clickGuard(e, 'layout.featured.subtitle')}
              style={{ margin: '0 0 24px', color: muted, textAlign: 'center' }}
            >
              {sectionSubtitle || (canManage ? 'Add section subtitle...' : '')}
            </p>
          )}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : `repeat(${gridColumns}, 1fr)`,
            gap: gridGap,
          }}
          data-edit-path="layout.featured.items"
          onClick={(e) => clickGuard(e, 'layout.featured.items')}
        >
          {products.slice(0, 8).map((p) => (
            <div
              key={p.id}
              data-edit-path={`layout.grid.items.${p.id}`}
              onClick={(e) => {
                if (canManage) { e.stopPropagation(); onSelect(`layout.grid.items.${p.id}`); return; }
                if ((p as any).slug) navigate((p as any).slug);
              }}
              style={{
                background: '#fff',
                border: `2px solid ${accent}30`,
                borderRadius: cardRadius,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: `border-color ${animationSpeed}ms, transform ${animationSpeed}ms`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = accent;
                e.currentTarget.style.transform = `scale(${hoverScale})`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${accent}30`;
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <div style={{ aspectRatio: '1' }}>
                <img src={productImage(p)} alt={productTitle(p)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: baseSpacing }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' , color: productTitleColor}}>
                  {productTitle(p)}
                </h3>
                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: accent, fontWeight: 800 }}>{formatPrice(Number(p.price) || 0)}</span>
                  <button
                    style={{ background: accent, border: 0, borderRadius: 6, padding: '8px 12px', color: '#fff', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}
                    data-edit-path="layout.featured.addLabel"
                    onClick={(e) => {
                      if (canManage) return clickGuard(e, 'layout.featured.addLabel');
                      e.stopPropagation();
                      if ((p as any).slug) navigate((p as any).slug);
                    }}
                  >
                    {addToCartLabel}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section style={{ background: text, color: '#fff', padding: `${sectionSpacing}px 24px`, textAlign: 'center' }}>
        <h3 style={{ fontSize: 24, fontWeight: 800, margin: 0 , color: productTitleColor}}>Need Help?</h3>
        <p data-edit-path="layout.featured.subtitle" style={{ marginTop: 12, opacity: 0.8 }}>{sectionSubtitle}</p>
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
          <span>📞 +1 234 567 8900</span>
          <span>📧 support@{storeName.toLowerCase().replace(/\s/g, '')}.com</span>
        </div>
      </section>

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={() => canManage && onSelect('layout.footer')}
        style={{ background: '#fff', padding: '32px 24px', borderTop: `3px solid ${accent}` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: accent, marginBottom: 12 }}>{storeName}</div>
          <p
            style={{ color: muted, fontSize: 13 }}
            data-edit-path="layout.footer.copyright"
            onClick={(e) => clickGuard(e, 'layout.footer.copyright')}
          >
            {copyright}
          </p>

          <div
            style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}
            data-edit-path="layout.footer.links"
            onClick={(e) => clickGuard(e, 'layout.footer.links')}
          >
            {['Shipping', 'Returns', 'Contact'].map((label) => (
              <a
                key={label}
                href="#"
                style={{ color: text, textDecoration: 'none', fontSize: 12, opacity: 0.85 }}
                onClick={(e) => clickGuard(e, 'layout.footer.links')}
              >
                {label}
              </a>
            ))}
          </div>

          <div
            style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 10, flexWrap: 'wrap' }}
            data-edit-path="layout.footer.social"
            onClick={(e) => clickGuard(e, 'layout.footer.social')}
          >
            {['instagram', 'tiktok', 'facebook'].map((platform) => (
              <a
                key={platform}
                href="#"
                style={{ color: text, textDecoration: 'none', fontSize: 12, opacity: 0.75 }}
                onClick={(e) => clickGuard(e, 'layout.footer.social')}
              >
                {platform}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
