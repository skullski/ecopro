import React, { useState, useEffect, useMemo } from 'react';
import type { TemplateProps } from '../../types';
type Breakpoint = 'mobile' | 'tablet' | 'desktop';

function asString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function resolveInt(value: unknown, fallback: number, min: number, max: number): number {
  const str = String(value ?? '').trim();
  if (str === '') return fallback;
  const n = Number(str);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

export default function WeddingTemplate(props: TemplateProps) {
  const settings = props.settings || ({} as any);
  const canManage = props.canManage !== false;
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    const bp = (props as any).forcedBreakpoint;
    if (bp) { setBreakpoint(bp); return; }
    const update = () => setBreakpoint(window.innerWidth >= 1024 ? 'desktop' : window.innerWidth >= 768 ? 'tablet' : 'mobile');
    update(); window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [(props as any).forcedBreakpoint]);

  const onSelect = (path: string) => { if (canManage && typeof (props as any).onSelect === 'function') (props as any).onSelect(path); };

  const clickGuard = (e: React.MouseEvent, path: string) => {
    if (!canManage) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect(path);
  };

  const bg = settings.template_bg_color || '#fdf2f8';
  const text = settings.template_text_color || '#831843';
  const accent = settings.template_accent_color || '#be185d';
  const cardBg = settings.template_card_bg || '#ffffff';

  // Layout settings
  const gridColumns = resolveInt(settings.template_grid_columns, 4, 2, 6);
  const gridGap = resolveInt(settings.template_grid_gap, 24, 8, 48);
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 48, 24, 96);
  const animationSpeed = resolveInt(settings.template_animation_speed, 200, 100, 500);
  const hoverScale = asString(settings.template_hover_scale) || '1.02';
  const cardRadius = resolveInt(settings.template_card_border_radius, 16, 0, 32);

  const storeName = settings.store_name || 'Forever Yours';
  
  
  const copyright = asString(settings.template_copyright) || `© 2026 ${storeName}`;
const storeLogo = asString(settings.store_logo);
  const storeDescription = asString(settings.store_description);
const heroTitle = settings.template_hero_heading || 'Your Perfect Day 💒';
  const heroSubtitle = settings.template_hero_subtitle || 'Everything for your dream wedding';
  const ctaText = settings.template_button_text || 'Browse Collection';

  
  const productTitleColor = asString(settings.template_product_title_color) || text;
  const productPriceColor = asString(settings.template_product_price_color) || accent;
  const addToCartLabel = asString(settings.template_add_to_cart_label) || 'View';
  const sectionTitle = asString(settings.template_featured_title) || 'Collection';
  const sectionSubtitle = asString(settings.template_featured_subtitle) || '';
const products = useMemo(() => {
    const list = props.filtered?.length ? props.filtered : props.products || [];
    return categoryFilter ? list.filter(p => p.category === categoryFilter) : list;
  }, [props.filtered, props.products, categoryFilter]);

  const categories = useMemo(() => [...new Set(props.products?.map(p => p.category).filter(Boolean))], [props.products]);
  const cols = breakpoint === 'mobile' ? 2 : breakpoint === 'tablet' ? Math.min(3, gridColumns) : gridColumns;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bg, color: text, fontFamily: '"Playfair Display", Georgia, serif' }} data-edit-path="__root">
      {canManage && (
        <button
          type="button"
          data-edit-path="__settings"
          onClick={(e) => clickGuard(e, '__settings')}
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
      <header style={{ padding: '20px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }} data-edit-path="layout.header" onClick={(e) => clickGuard(e, 'layout.header')}>
        <h1 style={{ fontSize: '28px', fontWeight: 500, fontStyle: 'italic' }} data-edit-path="layout.header.logo" onClick={(e) => clickGuard(e, 'layout.header.logo')}>
          {settings.store_logo ? (<img src={settings.store_logo} alt={storeName} style={{ width: 40, height: 40, borderRadius: '9999px', objectFit: 'cover' }} />) : null}
          💍{' '}
          <span data-edit-path="__settings.store_name" onClick={(e) => clickGuard(e, '__settings.store_name')}>{storeName}</span>
        </h1>
      </header>

      {(canManage || categories.length > 0) && (
        <nav
          style={{ display: 'flex', justifyContent: 'center', gap: 18, padding: '0 24px 12px', color: text, opacity: 0.9 }}
          data-edit-path="layout.header.nav"
          onClick={(e) => clickGuard(e, 'layout.header.nav')}
        >
          {(canManage ? ['Home', 'Shop', 'About', 'Contact'] : []).map((label) => (
            <a
              key={label}
              href="#"
              style={{ color: text, textDecoration: 'none', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}
              onClick={(e) => clickGuard(e, 'layout.header.nav')}
            >
              {label}
            </a>
          ))}
        </nav>
      )}

      <section style={{ padding: '80px 24px', textAlign: 'center' }} data-edit-path="layout.hero" onClick={(e) => clickGuard(e, 'layout.hero')}>
        <p
          style={{ fontSize: '12px', letterSpacing: '4px', color: productPriceColor, marginBottom: '16px' }}
          data-edit-path="layout.hero.kicker"
          onClick={(e) => clickGuard(e, 'layout.hero.kicker')}
        >
          MAKE IT MAGICAL
        </p>
        <h2 style={{ fontSize: breakpoint === 'mobile' ? '36px' : '56px', fontWeight: 400, fontStyle: 'italic', marginBottom: '20px' }} data-edit-path="layout.hero.title" onClick={(e) => clickGuard(e, 'layout.hero.title')}>{heroTitle}</h2>
        <p style={{ color: '#9f1239', fontSize: '16px', marginBottom: '32px', fontStyle: 'italic' }} data-edit-path="layout.hero.subtitle" onClick={(e) => clickGuard(e, 'layout.hero.subtitle')}>{heroSubtitle}</p>
        <button style={{ backgroundColor: accent, color: '#fff', padding: '14px 40px', fontSize: '14px', fontWeight: 500, border: 'none', borderRadius: '50px', cursor: 'pointer' }} data-edit-path="layout.hero.cta" onClick={(e) => clickGuard(e, 'layout.hero.cta')}>{ctaText}</button>

        {canManage && (
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div
              data-edit-path="layout.hero.image"
              onClick={(e) => clickGuard(e, 'layout.hero.image')}
              style={{ border: `1px dashed ${accent}`, padding: '10px 12px', borderRadius: 12, fontSize: 12, color: text, background: '#ffffff' }}
            >
              Hero image
            </div>
            <div
              data-edit-path="layout.hero.badge"
              onClick={(e) => clickGuard(e, 'layout.hero.badge')}
              style={{ border: `1px dashed ${accent}`, padding: '10px 12px', borderRadius: 12, fontSize: 12, color: text, background: '#ffffff' }}
            >
              Hero badge
            </div>
          </div>
        )}
      </section>

      {(categories.length > 0 || canManage) && (
        <div
          style={{ padding: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}
          data-edit-path="layout.categories"
          onClick={(e) => clickGuard(e, 'layout.categories')}
        >
          {['All', ...categories].map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat === 'All' ? '' : cat)} style={{ padding: '10px 28px', backgroundColor: (cat === 'All' ? !categoryFilter : categoryFilter === cat) ? accent : 'transparent', color: (cat === 'All' ? !categoryFilter : categoryFilter === cat) ? '#fff' : accent, border: `1px solid ${accent}`, borderRadius: '50px', fontSize: '13px', fontStyle: 'italic', cursor: 'pointer' }}>{cat}</button>
          ))}
          {canManage && categories.length === 0 && (
            <button
              type="button"
              onClick={(e) => clickGuard(e, 'layout.categories')}
              style={{ padding: '10px 28px', backgroundColor: 'transparent', color: accent, border: `1px dashed ${accent}`, borderRadius: '50px', fontSize: '13px', fontStyle: 'italic', cursor: 'pointer' }}
            >
              Add categories…
            </button>
          )}
        </div>
      )}

      <section
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, maxWidth: '1400px', margin: '0 auto' }}
        data-edit-path="layout.featured"
        onClick={(e) => clickGuard(e, 'layout.featured')}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2
            style={{ fontSize: breakpoint === 'mobile' ? '24px' : '32px', fontWeight: 400, fontStyle: 'italic', margin: 0 }}
            data-edit-path="layout.featured.title"
            onClick={(e) => clickGuard(e, 'layout.featured.title')}
          >
            {sectionTitle}
          </h2>
          <p
            style={{ color: '#9f1239', fontSize: 14, marginTop: 10, fontStyle: 'italic' }}
            data-edit-path="layout.featured.subtitle"
            onClick={(e) => clickGuard(e, 'layout.featured.subtitle')}
          >
            {sectionSubtitle || (canManage ? 'Add featured subtitle...' : '')}
          </p>
        </div>

        <div
          data-edit-path="layout.featured.items"
          onClick={(e) => clickGuard(e, 'layout.featured.items')}
        >
          <div
            style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: `${gridGap}px` }}
            data-edit-path="layout.grid"
            onClick={(e) => clickGuard(e, 'layout.grid')}
          >
          {products.map(product => (
            <div key={product.id} style={{ backgroundColor: cardBg, borderRadius: `${cardRadius}px`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(190,24,93,0.1)', cursor: canManage ? 'default' : 'pointer', transition: `transform ${animationSpeed}ms ease` }} data-edit-path={`layout.grid.items.${product.id}`}
              onMouseEnter={(e) => { if (!canManage) e.currentTarget.style.transform = `scale(${hoverScale})`; }}
              onMouseLeave={(e) => { if (!canManage) e.currentTarget.style.transform = 'scale(1)'; }}
              onClick={(e) => { e.stopPropagation(); if (!canManage && product.slug) props.navigate(product.slug); else if (canManage) onSelect(`layout.grid.items.${product.id}`); }}>
              <div style={{ aspectRatio: '3/4', backgroundColor: '#fce7f3', overflow: 'hidden' }}>
                {product.images?.[0] && <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <p style={{ fontSize: '10px', letterSpacing: '2px', color: productPriceColor, marginBottom: '8px' }}>{product.category || 'WEDDING'}</p>
                <h3 style={{ fontSize: '16px', fontWeight: 500, fontStyle: 'italic', marginBottom: '10px', color: productTitleColor}}>{product.title}</h3>
                <p style={{ fontSize: '18px', fontWeight: 600, color: productPriceColor }}>{props.formatPrice(product.price)}</p>
                <button
                  style={{
                    marginTop: '12px',
                    width: '100%',
                    backgroundColor: accent,
                    color: '#fff',
                    padding: '10px 12px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                  data-edit-path="layout.featured.addLabel"
                  onClick={(e) => {
                    if (canManage) return clickGuard(e, 'layout.featured.addLabel');
                    e.stopPropagation();
                    if (product.slug) props.navigate(product.slug);
                  }}
                >
                  {addToCartLabel}
                </button>
              </div>
            </div>
          ))}
          </div>
        </div>
      </section>

      <footer style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, backgroundColor: '#fce7f3', marginTop: `${sectionSpacing}px`, textAlign: 'center' }} data-edit-path="layout.footer" onClick={(e) => clickGuard(e, 'layout.footer')}>
        <p
          style={{ color: '#9f1239', fontStyle: 'italic' }}
          data-edit-path="layout.footer.copyright"
          onClick={(e) => clickGuard(e, 'layout.footer.copyright')}
        >
          {copyright}{storeDescription ? ` — ${storeDescription}` : ''} 💕
        </p>

        {canManage && (
          <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center', gap: 18, flexWrap: 'wrap' }}>
            <div data-edit-path="layout.footer.links" onClick={(e) => clickGuard(e, 'layout.footer.links')} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {['Shipping', 'Returns', 'Contact'].map((label) => (
                <a key={label} href="#" onClick={(e) => clickGuard(e, 'layout.footer.links')} style={{ color: '#9f1239', textDecoration: 'none', fontSize: 12 }}>
                  {label}
                </a>
              ))}
            </div>
            <div data-edit-path="layout.footer.social" onClick={(e) => clickGuard(e, 'layout.footer.social')} style={{ display: 'flex', gap: 10 }}>
              {['Instagram', 'TikTok'].map((label) => (
                <a key={label} href="#" onClick={(e) => clickGuard(e, 'layout.footer.social')} style={{ color: '#9f1239', textDecoration: 'none', fontSize: 12 }}>
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
