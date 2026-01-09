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

export default function ShoesTemplate(props: TemplateProps) {
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

  const bg = settings.template_bg_color || '#fafafa';
  const text = settings.template_text_color || '#171717';
  const accent = settings.template_accent_color || '#ef4444';
  const cardBg = settings.template_card_bg || '#ffffff';

  const storeName = settings.store_name || 'STEP UP';
  const heroTitle = settings.template_hero_heading || 'Walk in Style 👟';
  const ctaText = settings.template_button_text || 'SHOP NOW';

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
  const cols = breakpoint === 'mobile' ? 2 : breakpoint === 'tablet' ? Math.min(3, gridColumns) : gridColumns;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bg, color: text, fontFamily: 'system-ui, sans-serif' }} data-edit-path="__root">
      <header style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: cardBg, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} data-edit-path="layout.header" onClick={(e) => clickGuard(e, 'layout.header')}>
        <h1 style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-1px' }} data-edit-path="layout.header.logo" onClick={(e) => clickGuard(e, 'layout.header.logo')}>{storeName}</h1>
      </header>

      <section style={{ padding: '80px 24px', textAlign: 'center', backgroundColor: '#171717', color: '#fff' }} data-edit-path="layout.hero" onClick={(e) => clickGuard(e, 'layout.hero')}>
        <p style={{ fontSize: '12px', letterSpacing: '3px', color: accent, marginBottom: '20px' }}>NEW ARRIVALS</p>
        <h2 style={{ fontSize: breakpoint === 'mobile' ? '36px' : '64px', fontWeight: 900, marginBottom: '24px', letterSpacing: '-2px' }} data-edit-path="layout.hero.title" onClick={(e) => clickGuard(e, 'layout.hero.title')}>{heroTitle}</h2>
        <button style={{ backgroundColor: accent, color: '#fff', padding: '16px 48px', fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer' }} data-edit-path="layout.hero.cta" onClick={(e) => clickGuard(e, 'layout.hero.cta')}>{ctaText}</button>
      </section>

      {categories.length > 0 && (
        <div style={{ padding: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['All', ...categories].map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat === 'All' ? '' : cat)} style={{ padding: '12px 28px', backgroundColor: (cat === 'All' ? !categoryFilter : categoryFilter === cat) ? '#171717' : cardBg, color: (cat === 'All' ? !categoryFilter : categoryFilter === cat) ? '#fff' : text, border: 'none', borderRadius: '50px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>{cat}</button>
          ))}
        </div>
      )}

      <section style={{ padding: `${baseSpacing}px`, maxWidth: '1400px', margin: '0 auto' }} data-edit-path="layout.products">
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: `${gridGap}px` }}>
          {products.map(product => (
            <div key={product.id} style={{ backgroundColor: cardBg, borderRadius: `${cardRadius}px`, overflow: 'hidden', cursor: canManage ? 'default' : 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transition: `transform ${animationSpeed}ms, box-shadow ${animationSpeed}ms` }} data-edit-path={`layout.products.${product.id}`}
              onMouseEnter={(e) => { e.currentTarget.style.transform = `scale(${hoverScale})`; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; }}
              onClick={(e) => { e.stopPropagation(); if (!canManage && product.slug) props.navigate(product.slug); else if (canManage) onSelect(`layout.products.${product.id}`); }}>
              <div style={{ aspectRatio: '1', backgroundColor: '#f5f5f5', overflow: 'hidden' }}>
                {product.images?.[0] && <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div style={{ padding: '16px' }}>
                <p style={{ fontSize: '11px', color: accent, fontWeight: 600, marginBottom: '4px' }}>{product.category || 'SNEAKERS'}</p>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>{product.title}</h3>
                <p style={{ fontSize: '18px', fontWeight: 800 }}>{props.formatPrice(product.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, backgroundColor: '#171717', color: '#fff', marginTop: `${sectionSpacing}px`, textAlign: 'center' }} data-edit-path="layout.footer" onClick={(e) => clickGuard(e, 'layout.footer')}>
        <p style={{ fontSize: '14px', opacity: 0.7 }}>© {new Date().getFullYear()} {storeName}</p>
      </footer>
    </div>
  );
}
