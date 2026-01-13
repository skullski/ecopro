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

export default function WatchesTemplate(props: TemplateProps) {
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

  const bg = settings.template_bg_color || '#09090b';
  const text = settings.template_text_color || '#fafafa';
  const accent = settings.template_accent_color || '#d4af37';
  const cardBg = settings.template_card_bg || '#18181b';

  // Layout settings
  const gridColumns = resolveInt(settings.template_grid_columns, 4, 2, 6);
  const gridGap = resolveInt(settings.template_grid_gap, 32, 8, 48);
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 48, 24, 96);
  const animationSpeed = resolveInt(settings.template_animation_speed, 200, 100, 500);
  const hoverScale = asString(settings.template_hover_scale) || '1.02';
  const cardRadius = resolveInt(settings.template_card_border_radius, 4, 0, 32);

  const storeName = settings.store_name || 'TIMEPIECE';
  
  
  const copyright = asString(settings.template_copyright) || `© 2026 ${storeName}`;
const storeLogo = asString(settings.store_logo);
  const storeDescription = asString(settings.store_description);
const heroTitle = settings.template_hero_heading || 'Crafted for Precision';
  const heroSubtitle = settings.template_hero_subtitle || 'Swiss craftsmanship since 1875';
  const ctaText = settings.template_button_text || 'DISCOVER';

  
  const productTitleColor = asString(settings.template_product_title_color) || text;
  const productPriceColor = asString(settings.template_product_price_color) || accent;
  const addToCartLabel = asString(settings.template_add_to_cart_label) || 'View';
const products = useMemo(() => {
    const list = props.filtered?.length ? props.filtered : props.products || [];
    return categoryFilter ? list.filter(p => p.category === categoryFilter) : list;
  }, [props.filtered, props.products, categoryFilter]);

  const categories = useMemo(() => [...new Set(props.products?.map(p => p.category).filter(Boolean))], [props.products]);
  const cols = breakpoint === 'mobile' ? 2 : breakpoint === 'tablet' ? Math.min(3, gridColumns) : gridColumns;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bg, color: text, fontFamily: '"Didot", "Playfair Display", serif' }} data-edit-path="__root">
      <header style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${accent}22` }} data-edit-path="layout.header" onClick={(e) => clickGuard(e, 'layout.header')}>
        <h1 style={{ fontSize: '24px', fontWeight: 400, letterSpacing: '6px', color: accent }} data-edit-path="layout.header.logo" onClick={(e) => clickGuard(e, 'layout.header.logo')}>{settings.store_logo ? (<img src={settings.store_logo} alt={storeName} style={{ width: 40, height: 40, borderRadius: '9999px', objectFit: 'cover' }} />) : null}⌚ {storeName}</h1>
      </header>

      <section style={{ padding: '100px 24px', textAlign: 'center', background: `radial-gradient(ellipse at center, ${cardBg} 0%, ${bg} 100%)` }} data-edit-path="layout.hero" onClick={(e) => clickGuard(e, 'layout.hero')}>
        <p style={{ fontSize: '11px', letterSpacing: '4px', color: productPriceColor, marginBottom: '24px' }}>LUXURY TIMEPIECES</p>
        <h2 style={{ fontSize: breakpoint === 'mobile' ? '32px' : '56px', fontWeight: 300, marginBottom: '24px' }} data-edit-path="layout.hero.title" onClick={(e) => clickGuard(e, 'layout.hero.title')}>{heroTitle}</h2>
        <p style={{ color: '#71717a', fontSize: '16px', marginBottom: '40px' }} data-edit-path="layout.hero.subtitle" onClick={(e) => clickGuard(e, 'layout.hero.subtitle')}>{heroSubtitle}</p>
        <button style={{ backgroundColor: 'transparent', color: productPriceColor, padding: '16px 48px', fontSize: '12px', letterSpacing: '3px', border: `1px solid ${accent}`, cursor: 'pointer' }} data-edit-path="layout.hero.cta" onClick={(e) => clickGuard(e, 'layout.hero.cta')}>{ctaText}</button>
      </section>

      {categories.length > 0 && (
        <div style={{ padding: '32px', display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['All', ...categories].map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat === 'All' ? '' : cat)} style={{ padding: '8px 0', backgroundColor: 'transparent', color: (cat === 'All' ? !categoryFilter : categoryFilter === cat) ? accent : '#71717a', border: 'none', borderBottom: (cat === 'All' ? !categoryFilter : categoryFilter === cat) ? `1px solid ${accent}` : '1px solid transparent', fontSize: '12px', letterSpacing: '3px', cursor: 'pointer' }}>{cat.toUpperCase()}</button>
          ))}
        </div>
      )}

      <section style={{ padding: `${sectionSpacing}px`, maxWidth: '1400px', margin: '0 auto' }} data-edit-path="layout.grid">
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: `${gridGap}px` }}>
          {products.map(product => (
            <div key={product.id} style={{ cursor: canManage ? 'default' : 'pointer', textAlign: 'center', transition: `transform ${animationSpeed}ms ease` }} data-edit-path={`layout.grid.items.${product.id}`}
              onMouseEnter={(e) => { if (!canManage) e.currentTarget.style.transform = `scale(${hoverScale})`; }}
              onMouseLeave={(e) => { if (!canManage) e.currentTarget.style.transform = 'scale(1)'; }}
              onClick={(e) => { e.stopPropagation(); if (!canManage && product.slug) props.navigate(product.slug); else if (canManage) onSelect(`layout.grid.items.${product.id}`); }}>
              <div style={{ aspectRatio: '1', backgroundColor: cardBg, marginBottom: '20px', overflow: 'hidden', borderRadius: `${cardRadius}px` }}>
                {product.images?.[0] && <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <p style={{ fontSize: '10px', color: productPriceColor, letterSpacing: '2px', marginBottom: '8px' }}>{product.category || 'AUTOMATIC'}</p>
              <h3 style={{ fontSize: '16px', fontWeight: 400, marginBottom: '12px', color: productTitleColor}}>{product.title}</h3>
              <p style={{ fontSize: '18px', color: productPriceColor }}>{props.formatPrice(product.price)}</p>
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
                >
                  {addToCartLabel}
                </button>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ padding: `${sectionSpacing + 16}px ${baseSpacing}px`, backgroundColor: cardBg, marginTop: `${sectionSpacing + 16}px`, textAlign: 'center', borderTop: `1px solid ${accent}22` }} data-edit-path="layout.footer" onClick={(e) => clickGuard(e, 'layout.footer')}>
        <p style={{ fontSize: '11px', letterSpacing: '2px', color: '#71717a' }}>{copyright}{storeDescription ? ` — ${storeDescription}` : ''}</p>
      </footer>
    </div>
  );
}
