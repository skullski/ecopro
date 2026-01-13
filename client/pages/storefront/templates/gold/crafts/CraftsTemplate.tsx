import React, { useState, useEffect, useMemo } from 'react';
import type { TemplateProps } from '../../types';
type Breakpoint = 'mobile' | 'tablet' | 'desktop';

function asString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function resolveInt(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = typeof value === 'number' ? value : parseInt(String(value || ''), 10);
  const safe = Number.isFinite(parsed) ? parsed : fallback;
  return Math.max(min, Math.min(max, safe));
}

export default function CraftsTemplate(props: TemplateProps) {
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

  const bg = settings.template_bg_color || '#fefce8';
  const text = settings.template_text_color || '#422006';
  const accent = settings.template_accent_color || '#ca8a04';
  const cardBg = settings.template_card_bg || '#ffffff';

  const storeName = settings.store_name || 'Handmade Studio';
  
  
  const copyright = asString(settings.template_copyright) || `© 2026 ${storeName}`;
const storeLogo = asString(settings.store_logo);
  const storeDescription = asString(settings.store_description);
const heroTitle = settings.template_hero_heading || 'Crafted With Love ✨';
  const heroSubtitle = settings.template_hero_subtitle || 'Each piece tells a story';
  const ctaText = settings.template_button_text || 'Explore Collection';

  
  const productTitleColor = asString(settings.template_product_title_color) || text;
  const productPriceColor = asString(settings.template_product_price_color) || accent;
  const addToCartLabel = asString(settings.template_add_to_cart_label) || 'View';
// Layout settings
  const gridColumns = resolveInt(settings.template_grid_columns, 4, 2, 6);
  const gridGap = resolveInt(settings.template_grid_gap, 24, 8, 48);
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 48, 24, 96);
  const animationSpeed = resolveInt(settings.template_animation_speed, 200, 100, 500);
  const hoverScale = asString(settings.template_hover_scale) || '1.02';
  const cardRadius = resolveInt(settings.template_card_border_radius, 16, 0, 32);

  const products = useMemo(() => {
    const list = props.filtered?.length ? props.filtered : props.products || [];
    return categoryFilter ? list.filter(p => p.category === categoryFilter) : list;
  }, [props.filtered, props.products, categoryFilter]);

  const categories = useMemo(() => [...new Set(props.products?.map(p => p.category).filter(Boolean))], [props.products]);
  const cols = breakpoint === 'mobile' ? 2 : breakpoint === 'tablet' ? 3 : gridColumns;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bg, color: text, fontFamily: 'Georgia, serif' }} data-edit-path="__root">
      <header style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px dashed ${accent}` }} data-edit-path="layout.header" onClick={(e) => clickGuard(e, 'layout.header')}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, fontStyle: 'italic', color: accent }} data-edit-path="layout.header.logo" onClick={(e) => clickGuard(e, 'layout.header.logo')}>{settings.store_logo ? (<img src={settings.store_logo} alt={storeName} style={{ width: 40, height: 40, borderRadius: '9999px', objectFit: 'cover' }} />) : null}🧵 {storeName}</h1>
      </header>

      <section style={{ padding: '80px 24px', textAlign: 'center', backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ca8a04' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} data-edit-path="layout.hero" onClick={(e) => clickGuard(e, 'layout.hero')}>
        <p style={{ fontSize: '14px', color: productPriceColor, fontStyle: 'italic', marginBottom: '12px' }}>Unique Handcrafted Items</p>
        <h2 style={{ fontSize: breakpoint === 'mobile' ? '32px' : '52px', fontWeight: 600, marginBottom: '20px' }} data-edit-path="layout.hero.title" onClick={(e) => clickGuard(e, 'layout.hero.title')}>{heroTitle}</h2>
        <p style={{ color: '#78716c', fontSize: '18px', marginBottom: '32px' }} data-edit-path="layout.hero.subtitle" onClick={(e) => clickGuard(e, 'layout.hero.subtitle')}>{heroSubtitle}</p>
        <button style={{ backgroundColor: accent, color: '#fff', padding: '14px 36px', fontSize: '14px', fontWeight: 600, border: 'none', borderRadius: '50px', cursor: 'pointer' }} data-edit-path="layout.hero.cta" onClick={(e) => clickGuard(e, 'layout.hero.cta')}>{ctaText}</button>
      </section>

      {categories.length > 0 && (
        <div style={{ padding: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['All', ...categories].map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat === 'All' ? '' : cat)} style={{ padding: '10px 24px', backgroundColor: (cat === 'All' ? !categoryFilter : categoryFilter === cat) ? accent : 'transparent', color: (cat === 'All' ? !categoryFilter : categoryFilter === cat) ? '#fff' : accent, border: `1px solid ${accent}`, borderRadius: '50px', fontSize: '13px', cursor: 'pointer' }}>{cat}</button>
          ))}
        </div>
      )}

      <section style={{ padding: `${sectionSpacing}px 24px`, maxWidth: '1400px', margin: '0 auto' }} data-edit-path="layout.grid">
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: `${gridGap}px` }}>
          {products.map(product => (
            <div key={product.id} style={{ backgroundColor: cardBg, borderRadius: cardRadius, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', cursor: canManage ? 'default' : 'pointer', transition: `transform ${animationSpeed}ms` }} data-edit-path={`layout.grid.items.${product.id}`}
              onMouseEnter={(e) => (e.currentTarget.style.transform = `scale(${hoverScale})`)}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              onClick={(e) => { e.stopPropagation(); if (!canManage && product.slug) props.navigate(product.slug); else if (canManage) onSelect(`layout.grid.items.${product.id}`); }}>
              <div style={{ aspectRatio: '1', backgroundColor: '#fef9c3', overflow: 'hidden' }}>
                {product.images?.[0] && <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div style={{ padding: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '11px', color: productPriceColor, marginBottom: '4px' }}>{product.category || 'Handmade'}</p>
                <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px', color: productTitleColor}}>{product.title}</h3>
                <p style={{ fontSize: '18px', fontWeight: 700, color: productPriceColor }}>{props.formatPrice(product.price)}</p>
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
            </div>
          ))}
        </div>
      </section>

      <footer style={{ padding: '48px 24px', backgroundColor: '#fef3c7', marginTop: '48px', textAlign: 'center' }} data-edit-path="layout.footer" onClick={(e) => clickGuard(e, 'layout.footer')}>
        <p style={{ color: '#78716c', fontStyle: 'italic' }}>{copyright}{storeDescription ? ` — ${storeDescription}` : ''}</p>
      </footer>
    </div>
  );
}
