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

export default function ToolsTemplate(props: TemplateProps) {
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

  const bg = settings.template_bg_color || '#fafaf9';
  const text = settings.template_text_color || '#1c1917';
  const accent = settings.template_accent_color || '#ea580c';
  const cardBg = settings.template_card_bg || '#ffffff';

  // Layout settings
  const gridColumns = resolveInt(settings.template_grid_columns, 4, 2, 6);
  const gridGap = resolveInt(settings.template_grid_gap, 20, 8, 48);
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 48, 24, 96);
  const animationSpeed = resolveInt(settings.template_animation_speed, 200, 100, 500);
  const hoverScale = asString(settings.template_hover_scale) || '1.02';
  const cardRadius = resolveInt(settings.template_card_border_radius, 0, 0, 32);

  const storeName = settings.store_name || 'Tool Pro';
  
  
  const copyright = asString(settings.template_copyright) || `© 2026 ${storeName}`;
const storeLogo = asString(settings.store_logo);
  const storeDescription = asString(settings.store_description);
const heroTitle = settings.template_hero_heading || 'Built to Last 🔧';
  const heroSubtitle = settings.template_hero_subtitle || 'Professional tools for every project';
  const ctaText = settings.template_button_text || 'SHOP TOOLS';

  
  const productTitleColor = asString(settings.template_product_title_color) || text;
  const productPriceColor = asString(settings.template_product_price_color) || accent;
  const addToCartLabel = asString(settings.template_add_to_cart_label) || 'View';
  const sectionTitle = asString(settings.template_featured_title) || 'Featured Tools';
  const sectionSubtitle = asString(settings.template_featured_subtitle) || '';
const products = useMemo(() => {
    const list = props.filtered?.length ? props.filtered : props.products || [];
    return categoryFilter ? list.filter(p => p.category === categoryFilter) : list;
  }, [props.filtered, props.products, categoryFilter]);

  const categories = useMemo(() => [...new Set(props.products?.map(p => p.category).filter(Boolean))], [props.products]);
  const cols = breakpoint === 'mobile' ? 2 : breakpoint === 'tablet' ? Math.min(3, gridColumns) : gridColumns;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bg, color: text, fontFamily: 'system-ui, sans-serif' }} data-edit-path="__root">
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
      <header style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#292524' }} data-edit-path="layout.header" onClick={(e) => clickGuard(e, 'layout.header')}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: accent }} data-edit-path="layout.header.logo" onClick={(e) => clickGuard(e, 'layout.header.logo')}>
          {settings.store_logo ? (<img src={settings.store_logo} alt={storeName} style={{ width: 40, height: 40, borderRadius: '9999px', objectFit: 'cover' }} />) : null}
          🔧{' '}
          <span data-edit-path="__settings.store_name" onClick={(e) => clickGuard(e, '__settings.store_name')}>{storeName}</span>
        </h1>
      </header>

      {(canManage || categories.length > 0) && (
        <nav
          style={{ padding: '10px 24px', backgroundColor: '#292524', display: 'flex', justifyContent: 'center', gap: 18 }}
          data-edit-path="layout.header.nav"
          onClick={(e) => clickGuard(e, 'layout.header.nav')}
        >
          {(canManage ? ['Home', 'Shop', 'Support', 'Contact'] : []).map((label) => (
            <a
              key={label}
              href="#"
              style={{ color: '#e7e5e4', textDecoration: 'none', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}
              onClick={(e) => clickGuard(e, 'layout.header.nav')}
            >
              {label}
            </a>
          ))}
        </nav>
      )}

      <section style={{ padding: '80px 24px', textAlign: 'center', background: `linear-gradient(180deg, #292524 0%, ${bg} 100%)` }} data-edit-path="layout.hero" onClick={(e) => clickGuard(e, 'layout.hero')}>
        <span
          style={{ display: 'inline-block', backgroundColor: accent, color: '#fff', padding: '8px 20px', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '20px' }}
          data-edit-path="layout.hero.kicker"
          onClick={(e) => clickGuard(e, 'layout.hero.kicker')}
        >
          PRO GRADE
        </span>
        <h2 style={{ fontSize: breakpoint === 'mobile' ? '36px' : '56px', fontWeight: 900, marginBottom: '16px' }} data-edit-path="layout.hero.title" onClick={(e) => clickGuard(e, 'layout.hero.title')}>{heroTitle}</h2>
        <p style={{ color: '#78716c', fontSize: '18px', marginBottom: '32px' }} data-edit-path="layout.hero.subtitle" onClick={(e) => clickGuard(e, 'layout.hero.subtitle')}>{heroSubtitle}</p>
        <button style={{ backgroundColor: accent, color: '#fff', padding: '16px 40px', fontSize: '14px', fontWeight: 800, border: 'none', cursor: 'pointer' }} data-edit-path="layout.hero.cta" onClick={(e) => clickGuard(e, 'layout.hero.cta')}>{ctaText}</button>

        {canManage && (
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div
              data-edit-path="layout.hero.image"
              onClick={(e) => clickGuard(e, 'layout.hero.image')}
              style={{ border: `1px dashed ${accent}`, padding: '10px 12px', fontSize: 12, background: '#fff', color: text }}
            >
              Hero image
            </div>
            <div
              data-edit-path="layout.hero.badge"
              onClick={(e) => clickGuard(e, 'layout.hero.badge')}
              style={{ border: `1px dashed ${accent}`, padding: '10px 12px', fontSize: 12, background: '#fff', color: text }}
            >
              Hero badge
            </div>
          </div>
        )}
      </section>

      {(categories.length > 0 || canManage) && (
        <div
          style={{ padding: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}
          data-edit-path="layout.categories"
          onClick={(e) => clickGuard(e, 'layout.categories')}
        >
          {['All', ...categories].map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat === 'All' ? '' : cat)} style={{ padding: '12px 24px', backgroundColor: (cat === 'All' ? !categoryFilter : categoryFilter === cat) ? accent : '#fff', color: (cat === 'All' ? !categoryFilter : categoryFilter === cat) ? '#fff' : text, border: '1px solid #e7e5e4', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>{cat.toUpperCase()}</button>
          ))}
          {canManage && categories.length === 0 && (
            <button
              type="button"
              onClick={(e) => clickGuard(e, 'layout.categories')}
              style={{ padding: '12px 24px', backgroundColor: '#fff', color: text, border: `1px dashed ${accent}`, fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
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
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2
            style={{ fontSize: 26, fontWeight: 900, margin: 0, color: text }}
            data-edit-path="layout.featured.title"
            onClick={(e) => clickGuard(e, 'layout.featured.title')}
          >
            {sectionTitle}
          </h2>
          <p
            style={{ marginTop: 10, color: '#78716c', fontSize: 14 }}
            data-edit-path="layout.featured.subtitle"
            onClick={(e) => clickGuard(e, 'layout.featured.subtitle')}
          >
            {sectionSubtitle || (canManage ? 'Add featured subtitle...' : '')}
          </p>
        </div>

        <div data-edit-path="layout.featured.items" onClick={(e) => clickGuard(e, 'layout.featured.items')}>
          <div
            style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: `${gridGap}px` }}
            data-edit-path="layout.grid"
            onClick={(e) => clickGuard(e, 'layout.grid')}
          >
          {products.map(product => (
            <div key={product.id} style={{ backgroundColor: cardBg, borderRadius: `${cardRadius}px`, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', cursor: canManage ? 'default' : 'pointer', transition: `transform ${animationSpeed}ms ease` }} data-edit-path={`layout.grid.items.${product.id}`}
              onMouseEnter={(e) => { if (!canManage) e.currentTarget.style.transform = `scale(${hoverScale})`; }}
              onMouseLeave={(e) => { if (!canManage) e.currentTarget.style.transform = 'scale(1)'; }}
              onClick={(e) => { e.stopPropagation(); if (!canManage && product.slug) props.navigate(product.slug); else if (canManage) onSelect(`layout.grid.items.${product.id}`); }}>
              <div style={{ aspectRatio: '1', backgroundColor: '#e7e5e4', overflow: 'hidden' }}>
                {product.images?.[0] && <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div style={{ padding: '16px' }}>
                <p style={{ fontSize: '10px', color: productPriceColor, fontWeight: 700, marginBottom: '4px' }}>{product.category || 'TOOLS'}</p>
                <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: productTitleColor}}>{product.title}</h3>
                <p style={{ fontSize: '18px', fontWeight: 800, color: productPriceColor }}>{props.formatPrice(product.price)}</p>
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

      <footer style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, backgroundColor: '#292524', marginTop: `${sectionSpacing}px`, textAlign: 'center' }} data-edit-path="layout.footer" onClick={(e) => clickGuard(e, 'layout.footer')}>
        <p
          style={{ color: '#78716c' }}
          data-edit-path="layout.footer.copyright"
          onClick={(e) => clickGuard(e, 'layout.footer.copyright')}
        >
          {copyright}{storeDescription ? ` — ${storeDescription}` : ''}
        </p>

        {canManage && (
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 18, flexWrap: 'wrap' }}>
            <div data-edit-path="layout.footer.links" onClick={(e) => clickGuard(e, 'layout.footer.links')} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {['Shipping', 'Returns', 'Contact'].map((label) => (
                <a key={label} href="#" onClick={(e) => clickGuard(e, 'layout.footer.links')} style={{ color: '#e7e5e4', textDecoration: 'none', fontSize: 12 }}>
                  {label}
                </a>
              ))}
            </div>
            <div data-edit-path="layout.footer.social" onClick={(e) => clickGuard(e, 'layout.footer.social')} style={{ display: 'flex', gap: 10 }}>
              {['Instagram', 'TikTok'].map((label) => (
                <a key={label} href="#" onClick={(e) => clickGuard(e, 'layout.footer.social')} style={{ color: '#e7e5e4', textDecoration: 'none', fontSize: 12 }}>
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
