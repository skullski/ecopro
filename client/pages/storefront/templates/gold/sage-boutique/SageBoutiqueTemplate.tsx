import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';

/**
 * SAGE BOUTIQUE - Elegant sage green theme inspired by luxury boutiques.
 * Features: Soft sage palette, elegant typography, review section, related products.
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

export default function SageBoutiqueTemplate(props: TemplateProps) {
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
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [(props as any).forcedBreakpoint]);

  // Sage boutique theme
  const bg = asString(settings.template_bg_color) || '#e8efe8';
  const text = asString(settings.template_text_color) || '#2d3b2d';
  const muted = asString(settings.template_muted_color) || '#5a6b5a';
  const accent = asString(settings.template_accent_color) || '#4a7c59';

  

  const productTitleColor = asString(settings.template_product_title_color) || text;
  const productPriceColor = asString(settings.template_product_price_color) || accent;

  const cardBg = asString(settings.template_card_bg) || "#ffffff";
const storeName = asString(settings.store_name) || 'Sage Boutique';
  
  const copyright = asString(settings.template_copyright) || `© ${new Date().getFullYear()} ${storeName}`;
const heroTitle = asString(settings.template_hero_heading) || 'Refined Elegance';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Discover our curated collection of timeless pieces';
  const cta = asString(settings.template_button_text) || 'Shop Collection';

  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];

  

  const sectionTitle = asString(settings.template_featured_title) || "Featured";
  const sectionSubtitle = asString(settings.template_featured_subtitle) || "";
  const addToCartLabel = asString(settings.template_add_to_cart_label) || "View";
const descText = (asString(settings.template_description_text) || asString(settings.store_description)).trim();
const descColor = asString(settings.template_description_color) || muted;
  const descSize = resolveInt(settings.template_description_size, 15, 10, 32);

  // Layout settings
  const gridColumns = resolveInt(settings.template_grid_columns, 4, 2, 6);
  const gridGap = resolveInt(settings.template_grid_gap, 24, 8, 48);
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
        fontFamily: '"Cormorant Garamond", Georgia, serif',
      }}
    >
      {/* Top banner */}
      <div style={{ background: accent, color: '#fff', textAlign: 'center', padding: '10px', fontSize: 13 }}>
        Free shipping on orders over $100 • Use code SAGE20 for 20% off
      </div>

      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={() => canManage && onSelect('layout.header')}
        style={{
          background: bg,
          padding: '20px 24px',
          borderBottom: `1px solid ${accent}30`,
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt="" style={{ width: 50, height: 50, borderRadius: '50%', border: `2px solid ${accent}` }} />
            ) : (
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20 }}>
                {storeName.charAt(0)}
              </div>
            )}
            <span style={{ fontSize: 26, fontWeight: 600, letterSpacing: '0.05em' }}>{storeName}</span>
          </div>
          
          {!isMobile && (
            <nav style={{ display: 'flex', gap: 32, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <button onClick={() => navigate('/')} style={{ background: 'none', border: 0, color: text, cursor: 'pointer' }}>Home</button>
              <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: text, cursor: 'pointer' }}>Shop</button>
              <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: text, cursor: 'pointer' }}>New In</button>
              <button onClick={() => navigate('/products')} style={{ background: 'none', border: 0, color: text, cursor: 'pointer' }}>About</button>
            </nav>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button style={{ background: 'none', border: 0, fontSize: 20, cursor: 'pointer' }}>🔍</button>
            <button style={{ background: 'none', border: 0, fontSize: 20, cursor: 'pointer' }}>🛒</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        data-edit-path="layout.hero"
        onClick={() => canManage && onSelect('layout.hero')}
        style={{
          padding: isMobile ? '60px 24px' : '100px 40px',
          textAlign: 'center',
          background: `linear-gradient(180deg, ${bg} 0%, ${accent}15 100%)`,
        }}
      >
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <p style={{ color: accent, fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>
            New Season Collection
          </p>
          <h1 style={{ fontSize: isMobile ? 40 : 60, fontWeight: 400, lineHeight: 1.1, margin: 0 }}>
            {heroTitle}
          </h1>
          <p style={{ marginTop: 20, fontSize: 18, color: muted, lineHeight: 1.8 }}>
            {heroSubtitle}
          </p>
          <button
            onClick={() => navigate('/products')}
            style={{
              marginTop: 32,
              background: accent,
              border: 0,
              padding: '16px 40px',
              color: '#fff',
              fontSize: 14,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            {cta}
          </button>
        </div>
      </section>

      {/* Description */}
      {(canManage || descText) && (
        <section
          data-edit-path="layout.categories"
          onClick={() => canManage && onSelect('layout.categories')}
          style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, textAlign: 'center', background: '#fff' }}
        >
          <p style={{ maxWidth: 600, margin: '0 auto', color: descColor, fontSize: descSize, lineHeight: 1.8, fontStyle: 'italic' }}>
            {descText || (canManage ? 'Add store description...' : '')}
          </p>
        </section>
      )}

      {/* Featured Products */}
      <section
        data-edit-path="layout.grid"
        onClick={() => canManage && onSelect('layout.grid')}
        style={{ maxWidth: 1200, margin: '0 auto', padding: `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ textAlign: 'center', marginBottom: sectionSpacing }}>
          <h2 data-edit-path="layout.featured.title" style={{ fontSize: 32, fontWeight: 400, margin: 0 }}>{sectionTitle}</h2>
          <p data-edit-path="layout.featured.subtitle" style={{ color: muted, marginTop: 12 }}>{sectionSubtitle}</p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : `repeat(${gridColumns}, 1fr)`,
            gap: gridGap,
          }}
        >
          {products.slice(0, 8).map((p) => (
            <div
              key={p.id}
              data-edit-path={`layout.grid.items.${p.id}`}
              onClick={(e) => {
                if (canManage) { e.stopPropagation(); onSelect(`layout.grid.items.${p.id}`); return; }
                if ((p as any).slug) navigate((p as any).slug);
              }}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ aspectRatio: '3/4', background: '#fff', marginBottom: baseSpacing, overflow: 'hidden', borderRadius: cardRadius }}>
                <img
                  src={productImage(p)}
                  alt={productTitle(p)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: `transform ${animationSpeed}ms` }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = `scale(${hoverScale})`)}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 500, margin: 0 , color: productTitleColor}}>{productTitle(p)}</h3>
              <p style={{ color: productPriceColor, fontSize: 15, marginTop: 6 }}>{formatPrice(Number(p.price) || 0)}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <button
            onClick={() => navigate('/products')}
            style={{
              background: 'transparent',
              border: `1px solid ${accent}`,
              padding: '14px 36px',
              color: accent,
              fontSize: 13,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            View All Products
          </button>
        </div>
      </section>

      {/* Newsletter */}
      <section style={{ background: accent, padding: `${sectionSpacing}px ${baseSpacing}px`, textAlign: 'center' }}>
        <h3 style={{ color: '#fff', fontSize: 28, fontWeight: 400, margin: 0 }}>Join Our Community</h3>
        <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: 12 }}>Subscribe for exclusive offers and new arrivals</p>
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <input
            type="email"
            placeholder="Your email address"
            style={{ padding: '14px 20px', border: 0, width: 280, fontSize: 14 }}
          />
          <button style={{ background: text, color: '#fff', border: 0, padding: '14px 28px', cursor: 'pointer', fontSize: 13, letterSpacing: '0.05em' }}>
            Subscribe
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={() => canManage && onSelect('layout.footer')}
        style={{ background: '#fff', padding: `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 40 }}>
            <div>
              <h4 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>{storeName}</h4>
              <p style={{ color: muted, fontSize: 14, lineHeight: 1.7 }}>
                Curated elegance for the discerning individual. Quality meets timeless design.
              </p>
            </div>
            <div>
              <h5 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, color: muted }}>Shop</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
                <a href="#" style={{ color: text, textDecoration: 'none' }}>New Arrivals</a>
                <a href="#" style={{ color: text, textDecoration: 'none' }}>Best Sellers</a>
                <a href="#" style={{ color: text, textDecoration: 'none' }}>Sale</a>
              </div>
            </div>
            <div>
              <h5 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, color: muted }}>Help</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
                <a href="#" style={{ color: text, textDecoration: 'none' }}>Contact Us</a>
                <a href="#" style={{ color: text, textDecoration: 'none' }}>Shipping</a>
                <a href="#" style={{ color: text, textDecoration: 'none' }}>Returns</a>
              </div>
            </div>
            <div>
              <h5 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, color: muted }}>Follow Us</h5>
              <div style={{ display: 'flex', gap: 16, fontSize: 20 }}>
                <span>📘</span><span>📸</span><span>🐦</span>
              </div>
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${accent}20`, marginTop: 40, paddingTop: 24, textAlign: 'center', color: muted, fontSize: 13 }}>
            {copyright}
          </div>
        </div>
      </footer>
    </div>
  );
}
